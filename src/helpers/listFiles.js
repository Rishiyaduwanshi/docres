import fs from "fs/promises";
import path from "path";
import { AppError } from "../../API/utils/appError.js"; // Adjust path if needed

async function listFiles(username) {
  try {
    // ✅ Ensure relative path works in all environments
    const dirPath = path.join(process.cwd(), "uploads", username);
    console.log("🛠️ Checking directory:", dirPath);

    // ✅ Check if directory exists
    try {
      await fs.access(dirPath);
    } catch {
      throw new AppError("Directory not found", 404);
    }

    // ✅ Read files from directory
    const files = await fs.readdir(dirPath);
    console.log("📂 Files in directory:", files);

    // ✅ Filter only PDF files & return full paths
    const pdfFiles = files
      .filter(file => file.endsWith(".pdf"))
      .map(file => path.join(dirPath, file));

    if (pdfFiles.length === 0) {
      throw new AppError("No PDF files found", 404);
    }

    return pdfFiles;
  } catch (err) {
    console.error("❌ Error in listFiles:", err);
    throw new AppError("Unable to list files", 500);
  }
}

export { listFiles };
