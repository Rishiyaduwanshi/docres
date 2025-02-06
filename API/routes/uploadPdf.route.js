import express from "express";
import { uploadFiles } from "../handlers/fileUpload.handler.js";
import { upload } from "../services/storage.js"; 
const router = express.Router();

router.post("/uploads", upload(), uploadFiles);

export default router;
