import multer from "multer";
import path from "path";
import fs from "fs";

// Make uploads folder if it doesn't exist
const uploadFolder = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});

// Only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images are allowed!"), false);
};

// Export multer instance directly
const upload = multer({ storage, fileFilter });
export default upload;
