import { v2 as Cloudinary } from "cloudinary";

const connectCloudinary = () => {
  Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // must be provided
  });
  console.log("Cloudinary connected successfully");
};

export default connectCloudinary;
