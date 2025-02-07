import { AppError } from "../utils/appError.js";
import index from "../../index.js";
import logger from "../utils/logger.js";

const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError("No files Uploaded", 400);
    }

    const username = req.body.username;
    if (!username) {
      throw new AppError("Username is required", 400);
    }

    res.status(201).json({
      message: "Files uploaded successfully",
      status: 201,
      success: true,
      data: req.files,
    });

    setTimeout(async () => {
      try {
        await index(username);
        logger.info(`✅ PDF Processing completed for user: ${username}`);
      } catch (err) {
        logger.error(`Error in processing File, ${err.stack}`);
      }
    }, 0);
  } catch (error) {
    next(error);
  }
};

export { uploadFiles };
