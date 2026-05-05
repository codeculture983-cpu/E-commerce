// Backend/utils/generateInvoice.js
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

/**
 * Generates an invoice PDF for a given order
 * @param {Object} order - The order object from DB
 * @returns {string} - Path to saved PDF
 */
export function generateInvoicePDF(order) {
  const invoicesDir = path.join(process.cwd(), "Backend", "invoices");
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

  const invoiceName = `invoice-${order._id}.pdf`;
  const invoicePath = path.join(invoicesDir, invoiceName);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(invoicePath));

  // Add header
  doc.fontSize(20).text("FOREVER Store", { align: "center" }).moveDown();
  doc.fontSize(12)
    .text(`Invoice for Order ID: ${order._id}`)
    .text(`Date: ${new Date(order.date || order.createdAt).toLocaleDateString()}`)
    .text(`Customer: ${order.user?.name || order.userId?.name}`)
    .moveDown();

  // List products
  doc.text("Items:", { underline: true });
  order.items.forEach((item, i) => {
    doc.text(`${i + 1}. ${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`);
  });

  doc.moveDown();
  doc.text(`Delivery Charges: $10`);
  doc.text(`Total Amount: $${order.amount}`);

  doc.end();
  return invoicePath;
}