import PDFDocument from "pdfkit";
import orderModel from "../models/orderModels.js";
import { userModel } from "../models/usermodels.js";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import { sendEmailOrder } from "../utils/sendEmailOrder.js";
import { sendWhatsApp } from "../utils/sendWhatsApp.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { uploadImageToCloudinary } from "../utils/uploadImage.js";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { transporter } from "../config/nodemailer.js";




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const currency = "inr";
const deliveryCharge = 10

// ================= IMAGE HELPER =================
const getImage = (img) => {
  if (!img) return "";
  if (Array.isArray(img)) return img[0];
  if (typeof img === "string") return img;
  if (img?.url) return img.url;
  return "";
};

// ================= FIXED PROCESS ITEMS =================
export const processItems = async (items) => {
  return items.map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity || 0),
    size: item.size || "",

    snapshot: {
      name: item.snapshot?.name || item.name || "Product",
      price: Number(item.snapshot?.price || item.price || 0),

      // 🔥 FINAL IMAGE FIX (MOST IMPORTANT)
      image:
        item.snapshot?.image ||
        item.image ||
        "",

      size: item.snapshot?.size || item.size || "",
    },
  }));
};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log(process.env.RAZORPAY_KEY_ID);
console.log(process.env.RAZORPAY_KEY_SECRET);



// ================= IMAGE HELPER =================
const getImageUrl = (item) => {
  return (
    item?.image ||
    item?.productId?.image ||
    item?.productId?.images?.[0] ||
    ""
  );
};

// ================= PLACE ORDER =================
export const placeOrder = async (req, res) => {
  try {
   const { items, amount, address } = req.body;
const userId = req.user._id;
    // 1. Get user
    const user = await userModel.findById(userId);

    // 2. Create order
    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      payment: false,
      paymentMethod: "COD",
      date: Date.now(),
    });

    await newOrder.save();

    // 3. Send email
    await sendEmailOrder({
      to: user.email,
      subject: "🎉 Order Placed Successfully",
      customerName: user.name,
      orderId: newOrder._id,
      status: "Pending",
      totalAmount: amount,
    });

    // 4. Response
    res.json({ success: true, order: newOrder });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= STRIPE =================
export const placeOrderStripe = async (req, res) => {
try {
    
    const { items, amount, address } = req.body;
const userId = req.user._id;
    const {origin} = req.headers;
  const orderData = {
    userId,
    items,
    address,
    amount,
    paymentMethod:"Stripe",
    payment:false,
    date:Date.now()
  }
  const newOrder = new orderModel(orderData)
  await newOrder.save();
 const line_items = items.map((item) => ({
  price_data: {
    currency: currency,
    product_data: {
      name: item.name,
    },
    unit_amount: item.price * 100, 
  },
  quantity: item.quantity,
}));
line_items.push({
  price_data: {
    currency: currency,
    product_data: {
      name: "Delivery Charges",
    },
    unit_amount: deliveryCharge * 100,
  },
  quantity: 1,
})

   const session = await stripe.checkout.sessions.create({
    success_url:`${origin}/verify?success=true&orderId=${newOrder._id}`,
    cancel_url:`${origin}/verify?success=false&orderId=${newOrder._id}`,
    line_items,
    mode:'payment'
   })
   res.json({ success: true, session_url: session.url })

} catch (error) {
   res.status(500).json({ success: false, message: error.message });
}
};
// =========Verify Stripe========
export const verifyStripe = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    // 🔥 get order first
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 🔥 get user from order (NOT from frontend)
    const user = await userModel.findById(order.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= SUCCESS PAYMENT =================
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, {
        payment: true,
        status: "Paid",
      });

      await userModel.findByIdAndUpdate(order.userId, {
        cartData: {},
      });

      // ✅ EMAIL ONLY ON SUCCESS
      await sendEmailOrder({
        to: user.email,
        subject: "🎉 Order Placed Successfully",
        customerName: user.name,
        orderId: order._id,
        status: "Paid",
        totalAmount: order.amount,
      });

      return res.json({ success: true });
    }

    // ================= FAILED PAYMENT =================
    await orderModel.findByIdAndDelete(orderId);

    return res.json({ success: false });

  } catch (error) {
    console.log("VERIFY STRIPE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= RAZORPAY =================
export const placeOrderRazorpay = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Save DB order first
   const processedItems = await processItems(items);

const newOrder = await orderModel.create({
  userId,
  items: processedItems,
  amount,
  address,
  paymentMethod: "Razorpay",
  payment: false,
  status: "Pending",
});
     const user = await userModel.findById(userId);
await sendEmailOrder({
  to: user.email,
  subject: "💳 Stripe Order Created",
  customerName: user.name,
  orderId: newOrder._id,
  status: "Pending Payment",
  totalAmount: amount,
});

// 📱 WHATSAPP
await sendWhatsApp(
  user.phone,
  `⚡ Razorpay Order Created\nOrder ID: ${newOrder._id}\nPlease complete payment.`
);
    // Razorpay order create
  const safeAmount = Math.round(Number(amount));

if (!safeAmount || isNaN(safeAmount)) {
  return res.status(400).json({
    success: false,
    message: "Invalid amount sent to Razorpay",
  });
}

const options = {
  amount: safeAmount * 100, // paise
  currency: "INR",
  receipt: newOrder._id.toString(),
};
console.log("RAZORPAY OPTIONS:", options);
          console.log("AMOUNT DEBUG:", {
  amount,
  type: typeof amount,
});
console.log(process.env.RAZORPAY_KEY_ID);
console.log(process.env.RAZORPAY_KEY_SECRET);
    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      order,
      dbOrderId: newOrder._id,
    });

  } catch (error) {
    console.log("RAZORPAY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY RAZORPAY =================

export const verifyRazorpay = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await orderModel.findByIdAndUpdate(dbOrderId, {
        payment: true,
        status: "Paid",
      });

      return res.json({
        success: true,
        message: "Payment Verified",
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid signature",
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

// ================= USER ORDERS (FIXED IMAGE) =================
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user._id });

    const safeOrders = orders.map((order) => ({
      ...order._doc,
      items: (order.items || []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,

        snapshot: {
          name: item.snapshot?.name || "Product",
          price: item.snapshot?.price || 0,

          // 🔥 FINAL SAFE IMAGE FIX
          image: item.snapshot?.image || "/placeholder.png",

          size: item.snapshot?.size || "",
        },
      })),
    }));

    res.json({ success: true, orders: safeOrders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};
//===================CANCEL ORDER ========
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);

    if (!order) return res.json({ success: false });

    order.status = "Cancelled";
    await order.save();

    res.json({ success: true });
  } catch (err) {
    console.log("CANCEL ERROR:", err);
    res.status(500).json({ success: false });
  }
};

// ================= ADMIN =================


// ================= ADMIN ORDERS =================
export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().populate("userId");

    const safeOrders = orders.map((order) => ({
      ...order._doc,
      items: (order.items || []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,

        snapshot: {
          name: item.snapshot?.name || "Product",
          price: item.snapshot?.price || 0,

          // 🔥 FIX IMAGE
          image: item.snapshot?.image || "/placeholder.png",

          size: item.snapshot?.size || "",
        },
      })),
    }));

    res.json({ success: true, orders: safeOrders });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// =================Update Order Status  =================
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    const user = await userModel.findById(order.userId);

    // 📧 EMAIL ON EVERY STATUS CHANGE
    await sendEmailOrder({
      to: user.email,
      subject: `📦 Order ${status}`,
      customerName: user.name,
      orderId: order._id,
      status,
      totalAmount: order.amount,
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ================= EXTRA =================
export const fetchAllOrders = allOrders;

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    console.log("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ================= HEADERS =================
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    const safe = (v) => (v ? String(v) : "-");

    let y = 40;

    // ================= HEADER BLOCK =================
    doc
      .fontSize(22)
      .fillColor("#111")
      .text("FOREVER STORE", 40, y, { align: "center" });

    y += 25;

    doc
      .fontSize(10)
      .fillColor("gray")
      .text("INVOICE", 40, y, { align: "center" });

    y += 40;

    doc.fillColor("#000");

    // ================= INVOICE META BOX =================
    doc.fontSize(10);

    doc.text(`Invoice ID: INV-${order._id}`, 40, y);
    doc.text(`Order ID: ${order._id}`, 40, y + 15);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 40, y + 30);
    doc.text(`Payment: ${safe(order.paymentMethod)}`, 300, y);
    doc.text(`Status: ${safe(order.status)}`, 300, y + 15);

    y += 60;

    // ================= BILLING =================
    const a = order.address || {};

    doc.fontSize(12).text("BILLING DETAILS", 40, y);
    y += 20;

    doc.fontSize(10);

    doc.text(`${safe(a.firstName)} ${safe(a.lastName)}`, 40, y);
    doc.text(safe(a.email), 40, y + 15);
    doc.text(safe(a.phone), 40, y + 30);
    doc.text(`${safe(a.street)} ${safe(a.city)}`, 40, y + 45);

    y += 80;

    // ================= TABLE HEADER =================
    doc.fontSize(10).fillColor("#444");

    doc.text("#", 40, y);
    doc.text("Product", 80, y);
    doc.text("Qty", 300, y);
    doc.text("Price", 370, y);
    doc.text("Total", 450, y);

    doc.moveTo(40, y + 15).lineTo(550, y + 15).stroke();

    y += 25;

    // ================= ITEMS =================
    let subtotal = 0;

    (order.items || []).forEach((item, i) => {
      const name = item?.snapshot?.name || "Product";
      const qty = Number(item?.quantity || 1);
      const price = Number(item?.snapshot?.price || 0);
      const total = qty * price;

      subtotal += total;

      doc.fillColor("#000");

      doc.text(i + 1, 40, y);
      doc.text(name.substring(0, 30), 80, y);
      doc.text(qty, 300, y);
      doc.text(price.toFixed(2), 370, y);
      doc.text(total.toFixed(2), 450, y);

      y += 20;
    });

    // ================= TOTAL BOX =================
    const tax = subtotal * 0.18;
    const grandTotal = subtotal + tax;

    y += 20;

    doc.moveTo(300, y).lineTo(550, y).stroke();
    y += 15;

    doc.fontSize(10);

    doc.text("Subtotal:", 350, y);
    doc.text(subtotal.toFixed(2), 450, y);

    y += 15;

    doc.text("GST (18%):", 350, y);
    doc.text(tax.toFixed(2), 450, y);

    y += 20;

    doc.fontSize(12).text("GRAND TOTAL:", 350, y);
    doc.text(grandTotal.toFixed(2), 450, y);

    // ================= FOOTER =================
    y += 60;

    doc
      .fontSize(11)
      .fillColor("#333")
      .text("Thank you for shopping with FOREVER STORE ", 40, y, {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.log("INVOICE ERROR:", err);
    res.status(500).json({ message: "Invoice generation failed" });
  }
};


export const processRefund = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);
    order.refundStatus = "Processing";

    await order.save();

    res.json({ message: "Refund started" });
  } catch (err) {
    console.log("REFUND ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const trackShipment = async (req, res) => {
  try {
    res.json({ message: "Tracking not implemented yet" });
  } catch (err) {
    console.log("TRACK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getSingleOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    res.json({ success: true, order });
  } catch (err) {
    console.log("GET ORDER ERROR:", err);
    res.status(500).json({ success: false });
  }
};

// ================= INVOICE DOWNLOAD =================

export const downloadInvoice = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 40 });

    doc.pipe(res);

    // ================= SIMPLE CLEAN INVOICE =================
    doc.fontSize(20).text("FOREVER STORE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Payment: ${order.paymentMethod}`);

    doc.moveDown();

    doc.fontSize(14).text("ITEMS");
    doc.moveDown();

    let total = 0;

    (order.items || []).forEach((item, i) => {
      const name = item?.snapshot?.name || "Product";
      const qty = item?.quantity || 1;
      const price = item?.snapshot?.price || 0;

      const itemTotal = qty * price;
      total += itemTotal;

      doc
        .fontSize(10)
        .text(`${i + 1}. ${name} | Qty: ${qty} | Price: ${price} | Total: ${itemTotal}`);
    });

    doc.moveDown();

    doc.fontSize(12).text(`Grand Total: ${total}`, { align: "right" });

    doc.moveDown();
    doc.text("Thank you for shopping!", { align: "center" });

    doc.end();
  } catch (err) {
    console.log("PDF ERROR:", err);
    res.status(500).json({ message: "PDF generation failed" });
  }
};


