import multer from 'multer';
import path from 'path';
import { fileURLToPath } from "url";
import fs from 'fs';
import { AppError } from '../utils/appError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createUserFolder = (username) => {
  if (!username) {
    throw new AppError("Username is required to create an upload folder.",400);
  }

  const uploadPath = path.join(__dirname, '../../uploads', username);

  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  } catch (err) {
    throw new AppError("Failed to create user folder.",500);
  }

  return uploadPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const userFolder = req.body.username;
      if (!userFolder) {
        return cb(new AppError("Username is required for file upload.",400));
      }
      const uploadPath = createUserFolder(userFolder);
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = () =>
  multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
  }).array("files", 10);

export { upload };