export const generateInvoiceNumber = async (InvoiceModel) => {
  const count = await InvoiceModel.countDocuments();
  return `INV-${String(count + 1).padStart(6, "0")}`;
};