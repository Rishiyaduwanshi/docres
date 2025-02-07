import fetch from "node-fetch";
import { SELECTED_EMBEDDING } from "../config/embeddingConfig.js";

export async function generateEmbeddings(textChunks) {
  if (SELECTED_EMBEDDING.provider === "ollama") {
    return await ollamaEmbeddings(textChunks);
  } else if (SELECTED_EMBEDDING.provider === "huggingface") {
    return await huggingfaceEmbeddings(textChunks);
  }
}

async function ollamaEmbeddings(textChunks) {
  const embeddings = [];

  for (let chunk of textChunks) {
    try {
      const response = await fetch(SELECTED_EMBEDDING.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: SELECTED_EMBEDDING.model, prompt: chunk }),
      });

      if (!response.ok) {
        console.error(`❌ Ollama API Error: ${response.statusText}`);
        embeddings.push(null);
        continue;
      }

      const data = await response.json();
      if (data?.embedding) {
        embeddings.push(data.embedding);
      } else {
        console.error("❌ Embedding not found in response:", data);
        embeddings.push(null);
      }
    } catch (error) {
      console.error("❌ Error fetching embeddings from Ollama:", error);
      embeddings.push(null);
    }
  }

  return embeddings;
}

// Hugging Face embeddings
async function huggingfaceEmbeddings(textChunks) {
  try {
    const response = await fetch(`${SELECTED_EMBEDDING.apiUrl}${SELECTED_EMBEDDING.model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SELECTED_EMBEDDING.apiKey}` },
      body: JSON.stringify({ inputs: textChunks }),
    });

    if (!response.ok) {
      console.error(`❌ Hugging Face API Error: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.embeddings || [];
  } catch (error) {
    console.error("❌ Error fetching embeddings from Hugging Face:", error);
    return [];
  }
}
