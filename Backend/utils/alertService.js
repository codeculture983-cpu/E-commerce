import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendAlertEmail = async (subject, message) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject,
    text: message,
  });
};