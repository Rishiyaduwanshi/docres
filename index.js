import { extractTextFromPDF } from "./src/utils/pdfProcessor.js";
import { smartChunk } from "./src/utils/chunker.js";
import { generateEmbeddings } from "./src/utils/embedder.js";
import { storeEmbeddings, searchEmbeddings } from "./src/utils/vectorStore.js";

export default async function index() {
  async function processPDF(pdfPath) {
    console.log("📄 Processing PDF:------------------------ ", pdfPath);
    const text = await extractTextFromPDF(pdfPath);
    const chunks = smartChunk(text);
    // console.log("chunks----------",chunks)
    const embeddings = await generateEmbeddings(chunks);
    // console.log("embeddings=======",embeddings)
    await storeEmbeddings(chunks, embeddings);
  }

  async function retrieveAnswer(query) {
    const queryEmbedding = await generateEmbeddings([query]);
    // console.log("=============",queryEmbedding)
    const results = await searchEmbeddings(queryEmbedding[0]);
    // console.log("🔍 Retrieved Context:----------------------",results);
  }
  try {
    await processPDF("public/pdf/demo.pdf"); // Replace with your own PDF path
  } catch (err) {
    console.error("unable to parse the PDF --> ", err);
  }
  await retrieveAnswer("What is my name?");
}
