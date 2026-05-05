// backend/utils/sendOTP.js
import twilio from "twilio"; // or any service you use

export const sendOTP = async (phone) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save to DB or send via SMS
  console.log(`Sending OTP ${otp} to phone ${phone}`);

  // Example: Twilio integration
  /*
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
  */

  return otp;
};