import { PdfReader } from "pdfreader"

export async function extractTextFromPDF(pdfPath) {
  return new Promise((resolve, reject) => {
    console.log("📄 Reading PDF from:---------------->", pdfPath); // Debugging log
    let text = "";

    // Use PdfReader to parse the PDF from the file path directly
    new PdfReader().parseFileItems(pdfPath, (err, item) => {
      if (err) {
        reject(err);
        return;
      }

      if (!item) {
        resolve(text); // Resolving once file parsing is complete
        return;
      }

      if (item.text) {
        text += item.text + " "; // Accumulate text
      }
    });
  });
}
