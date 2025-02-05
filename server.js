// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import index from "./index.js";
import connectMilvusDB, { client } from "./src/config/dbConfig.js"; // Import client

const app = express();
const port = process.env.PORT;

// Resolve __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hello, this is a simple server to serve static files!");
});

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
      .then(() => {
        index(); // Call the index function after Milvus connection is successful
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
