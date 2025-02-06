import { AppError } from "../utils/appError.js";

const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError("No files Uploaded", 400)
    }

    res.status(201).json({
      message: "Files uploaded successfully",
      status: 201,
      success: true,
      data: req.files, 
    });

  } catch (error) {
    next(error); 
  }
};


export { uploadFiles };
