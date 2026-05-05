import nodemailer from "nodemailer";

/**
 * 🚀 FOREVER STORE EMAIL SYSTEM V5 (ENTERPRISE PRO)
 * - Amazon / Daraz / Shopify level UI
 * - Product images
 * - Timeline progress
 * - Invoice + Tracking buttons
 */

export const sendEmailOrder = async ({
  to,
  subject,
  customerName = "Customer",
  orderId = "",
  status = "Pending",
  totalAmount = 0,
  items = [],
  paymentMethod = "COD",
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ================= STATUS COLORS =================
    const statusColors = {
      Pending: "#f59e0b",
      Processing: "#3b82f6",
      Packing: "#a855f7",
      Shipped: "#6366f1",
      Delivered: "#22c55e",
      Cancelled: "#ef4444",
    };

    const color = statusColors[status] || "#6b7280";

    // ================= TIMELINE =================
    const steps = ["Pending", "Processing", "Packing", "Shipped", "Delivered"];
    const currentIndex = steps.indexOf(status);

    const timeline = steps
      .map((step, i) => {
        const active = i <= currentIndex;

        return `
          <div style="display:flex;align-items:center;margin-bottom:6px;">
            <div style="
              width:10px;height:10px;border-radius:50%;
              background:${active ? "#22c55e" : "#d1d5db"};
              margin-right:8px;
            "></div>
            <span style="font-size:13px;color:${active ? "#111827" : "#9ca3af"}">
              ${step}
            </span>
          </div>
        `;
      })
      .join("");

    // ================= PRODUCTS =================
    const productList = (items || [])
      .map(
        (item) => `
        <div style="
          display:flex;
          gap:10px;
          border:1px solid #eee;
          padding:10px;
          border-radius:10px;
          margin-bottom:10px;
          align-items:center;
        ">

          <img src="${item?.snapshot?.image || ""}"
            style="width:50px;height:50px;object-fit:cover;border-radius:8px;"
          />

          <div style="flex:1">
            <p style="margin:0;font-size:13px;font-weight:bold">
              ${item?.snapshot?.name || "Product"}
            </p>

            <p style="margin:2px 0;font-size:12px;color:#6b7280">
              Qty: ${item?.quantity} | ₹${item?.snapshot?.price}
            </p>
          </div>

        </div>
      `
      )
      .join("");

    // ================= EMAIL TEMPLATE =================
    const html = `
    <div style="font-family:Arial;background:#f4f6f8;padding:20px">

      <div style="max-width:650px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.08)">

        <!-- HEADER -->
        <div style="background:#111827;color:#fff;text-align:center;padding:20px">
          <h2 style="margin:0">🛍 FOREVER STORE</h2>
          <p style="margin:5px 0;font-size:13px;opacity:0.8">
            Order Update Notification
          </p>
        </div>

        <!-- BODY -->
        <div style="padding:20px">

          <h3>Hello ${customerName} 👋</h3>

          <!-- STATUS -->
          <div style="margin:10px 0">
            <span style="
              background:${color}20;
              color:${color};
              padding:6px 12px;
              border-radius:20px;
              font-size:13px;
              font-weight:bold;
            ">
              ${status}
            </span>
          </div>

          <!-- ORDER INFO -->
          <div style="background:#f9fafb;padding:15px;border-radius:10px">
            <p><b>Order ID:</b> ${orderId}</p>
            <p><b>Total:</b> ₹${totalAmount}</p>
            <p><b>Payment:</b> ${paymentMethod}</p>
          </div>

          <!-- TIMELINE -->
          <div style="margin-top:20px">
            <h4>📦 Order Progress</h4>
            ${timeline}
          </div>

          <!-- PRODUCTS -->
          <div style="margin-top:20px">
            <h4>🛒 Items</h4>
            ${productList}
          </div>

          <!-- BUTTONS -->
          <div style="text-align:center;margin-top:20px">

            <a href="#"
              style="background:#111827;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;margin-right:5px">
              Track Order
            </a>

            <a href="#"
              style="background:#3b82f6;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
              Download Invoice
            </a>

          </div>

        </div>

        <!-- FOOTER -->
        <div style="background:#f3f4f6;text-align:center;padding:10px;font-size:12px;color:#6b7280">
          © 2026 FOREVER STORE — All Rights Reserved
        </div>

      </div>
    </div>
    `;

    await transporter.sendMail({
      from: `"FOREVER STORE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("🚀 V5 Email sent successfully");
  } catch (error) {
    console.log("Email Error:", error);
  }
};