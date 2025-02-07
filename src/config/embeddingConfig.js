// Define available embedding models
const EMBEDDING_MODELS = {
    ollama: {
      provider: "ollama",
      model: process.env.OLLAMA_EMBED_MODEL || "llama3.2", // ✅ Correct embedding model
      apiUrl: "http://localhost:11434/api/embeddings",
    },
    huggingface: {
      provider: "huggingface",
      model: process.env.HF_EMBED_MODEL || "sentence-transformers/all-MiniLM-L6-v2", // ✅ Correct embedding model
      apiKey: process.env.HF_API_KEY,
      apiUrl: "https://api-inference.huggingface.co/models/",
    },
  };
  
  export const SELECTED_EMBEDDING = EMBEDDING_MODELS[process.env.EMBED_PROVIDER || "ollama"];
  