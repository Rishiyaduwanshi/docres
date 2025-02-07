// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import index, { retrieveAnswer } from "./index.js";
import connectMilvusDB, { client } from "./src/config/dbConfig.js"; // Import client
import packageJson from "./package.json" assert { type: "json" };
import logger from "./API/utils/logger.js";
import { AppError } from "./API/utils/appError.js";

const version = packageJson.version;
const app = express();
const port = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

import pdfRoute from "./API/routes/uploadPdf.route.js";

// Routes
app.use(`/api/v${version}`, pdfRoute);

async function startServer() {
  try {
    connectMilvusDB()
      .then(() => {
        console.log(
          "✅ Milvus connected, starting server...status: ",
          client.connectStatus
        );
      })
      .then(() => {
        app.listen(port, () => {
          console.log(`Server running at http://localhost:${port}`);
        });
      })
      .catch((err) => {
        console.error("❌ Milvus client is not connected! \n");
        console.log(err);
      });
    // Start the server
  } catch (error) {
    console.error("❌ Error during Milvus connection:", error);
  }
}

startServer();

app.post(`/api/v${version}/askAI`, async (req, res) => {
  try {
    const { username, question: userQuery, topCount = 3 } = req.body;
    // ******************************************
    async function askAIWithContext(userQuery, extractedContext) {
      const prompt = `You are Docres, a powerful AI assistant capable of understanding and summarizing complex data extracted from documents. The context you are provided includes key excerpts from various files uploaded by the user in JSON. Your task is to accurately process the user's query using the relevant context. Respond thoughtfully and clearly by considering the provided information below:
      
      - Be concise, clear, and ensure the response is grounded in the provided context. If you don't find relevant information, mention it in your answer.
      
      - Respond in a helpful and informative manner.
      
      User Query: ${userQuery}
      
      Context: ${JSON.stringify(extractedContext)}
      
      Note: Only If the user explicitly asks for additional information about the creator of this tool, you can tell them that Docres was developed by Abhinav Prakash. You can learn more about him at his website: rishiyaduwanshi.me

      * Do not include any information about the creator unless explicitly asked. *

      `;

      try {
        const response = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2",
            prompt: prompt,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
      } catch (error) {
        console.error("❌ AI Request Failed:", error);
        return "❌ Error in AI response.";
      }
    }
    async function getFinalAnswer(query) {
      try {
        const retrievedContext = await retrieveAnswer(query, topCount);
        console.log(retrievedContext);
        const relevantContext = retrievedContext.map((result) => ({
          text: result.text,
          score: result.score,
        }));

        if (!relevantContext.length) {
          return "❌ Sorry, no relevant information found.";
        }
        return await askAIWithContext(query, relevantContext);
      } catch (error) {
        console.error("❌ Context Retrieval Failed:", error);
        return "❌ Error in retrieving context.";
      }
    }

    // Call the function and handle response
    getFinalAnswer(userQuery)
      .then((answer) => {
        res.status(200).json({
          message: "Answer fetched successfully",
          status : 200,
          success: true,
          data: answer,
        });
        console.log(answer);
      })
      .catch((error) => {
        throw new AppError("Unable to retrieve answer", 400);
      });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  logger.error(`Internal Server Error:- [${err.stack}]`);

  if (!(err instanceof AppError)) {
    err = new AppError();
  }

  res.status(err.status).json({
    message: err.message,
    status: err.status,
    success: err.success,
    data: err.data,
  });
});
