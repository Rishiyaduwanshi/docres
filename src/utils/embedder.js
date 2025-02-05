import fetch from "node-fetch";
import SELECTED_MODEL from "../config/llmConfig.js";

export async function generateEmbeddings(textChunks) {
  
  if (SELECTED_MODEL.provider === "ollama") {
    // console.log("textChunks inside ollama-------->", textChunks)
    return await ollamaEmbeddings(textChunks);
  } else if (SELECTED_MODEL.provider === "huggingface") {
    // console.log("textChunks inside hugging face -------->", textChunks)
    return await huggingfaceEmbeddings(textChunks);
  }
}

async function ollamaEmbeddings(textChunks) {
    const embeddings = [];
    for (let chunk of textChunks) {
        try {
            const response = await fetch("http://localhost:11434/api/embeddings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: SELECTED_MODEL.model, prompt: chunk }),
            });
            const data = await response.json();
            if (data && data.embedding) {
                embeddings.push(data.embedding);
            } else {
                console.error("Embedding not found in response:", data);
                embeddings.push(null);
            }
        } catch (error) {
            console.error("Error fetching embeddings:", error);
            embeddings.push(null);
        }
    }
    return embeddings;
}


// Hugging Face embeddings
async function huggingfaceEmbeddings(textChunks) {
  const response = await fetch(
    `${SELECTED_MODEL.apiUrl}${SELECTED_MODEL.model}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${SELECTED_MODEL.apiKey}` },
      body: JSON.stringify({ inputs: textChunks }),
    }
  );
  const data = await response.json();
  return data.embeddings;
}
