import axios from "axios";

export const sendWhatsApp = async (phone, message) => {
  try {
    await axios.get("https://api.callmebot.com/whatsapp.php", {
      params: {
        phone,
        text: message,
        apikey: process.env.WHATSAPP_API_KEY,
      },
    });

    console.log("WhatsApp sent");
  } catch (error) {
    console.log("WHATSAPP ERROR:", error.message);
  }
};