import { extractTextFromPDF } from "./src/utils/pdfProcessor.js";
import { smartChunk } from "./src/utils/chunker.js";
import { generateEmbeddings } from "./src/utils/embedder.js";
import normalizeEmbedding from "./src/helpers/normalizeEmbedding.js";
import { storeEmbeddings, searchEmbeddings } from "./src/utils/vectorStore.js";
import { listFiles } from "./src/helpers/listFiles.js";
import { AppError } from "./API/utils/appError.js";

export default async function index(username) {
  async function processPDF(pdfPath) {
    console.log("📄 Processing PDF:------------------------ ", pdfPath);
    const text = await extractTextFromPDF(pdfPath);
    const chunks = smartChunk(text);
    const embeddings = await generateEmbeddings(chunks);
    await storeEmbeddings(chunks, embeddings);
  }

  async function processMultiplePDFs(pdfPaths) {
    for (const pdfPath of pdfPaths) {
      await processPDF(pdfPath);
    }
  }

  try {
    // const PDFPaths = ["public/pdf/demo1.pdf","public/pdf/demo2.pdf", "public/pdf/demo3.pdf"];
    const PDFPaths = await listFiles(username)
    await processMultiplePDFs(PDFPaths); // Replace with your own PDF path
  } catch (err) {
    throw new AppError("Unable to parse the file",404)
  }
}


export async function retrieveAnswer(query, topCount) {
  const queryEmbedding = await generateEmbeddings([query]);
  const normalizeQueryEmbedding = await normalizeEmbedding(queryEmbedding[0])
  const results = await searchEmbeddings(normalizeQueryEmbedding, topCount);
  return results
}






