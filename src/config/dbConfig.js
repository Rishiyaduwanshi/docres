import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import { createCollection } from "../models/pdfEmbeds.model.js";

// Initialize Milvus client using the connection parameters
export let client;

export default async function connectMilvusDB() {
  try {
    client = new MilvusClient({
      address: process.env.ZILLIZ_URI,
      username: process.env.ZILLIZ_USERNAME,
      password: process.env.ZILLIZ_PASSWORD,
      token: process.env.ZILLIZ_API_KEY,
    });


    await client.connectPromise
    if(client.connectStatus ===1){
      createCollection()
    }
    // console.log(client)
    const collections = await client.listCollections(); // This fetches all collections from Milvus

  } catch (error) {
    console.error("❌ Error connecting to Milvus:", error);
    process.exit(1);  // Exit if unable to connect
  }
}



