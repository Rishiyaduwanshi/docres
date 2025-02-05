// Define available models
const LLM_MODELS = {
  ollama: {
    provider: "ollama",
    model: process.env.OLLAMA_MODEL || "llama3",
    apiUrl: "http://localhost:11434/api/generate",
  },
  huggingface: {
    provider: "huggingface",
    model: process.env.HF_MODEL || "mistral-7b-instruct",
    apiKey: process.env.HF_API_KEY,
    apiUrl: "https://api-inference.huggingface.co/models/",
  },
};

const SELECTED_MODEL = LLM_MODELS[process.env.LLM_PROVIDER || "ollama"];
export default SELECTED_MODEL;
