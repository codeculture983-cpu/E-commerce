import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= UPLOAD IMAGE =================
export const uploadImageToCloudinary = async (filePath) => {
  try {
    if (!filePath) return "";

    // already cloudinary link
    if (filePath.includes("res.cloudinary.com")) {
      return filePath;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "ecommerce/orders",
      resource_type: "image",
    });

    // delete local temp file after upload
    fs.unlink(filePath, (err) => {
      if (err) console.log("File delete error:", err);
    });

    return result.secure_url;
  } catch (error) {
    console.log("Cloudinary Upload Error:", error);

    // cleanup local file if exists
    if (filePath) {
      fs.unlink(filePath, () => {});
    }

    return "";
  }
};