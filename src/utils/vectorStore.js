import { client } from "../config/dbConfig.js";
import { MetricType } from "@zilliz/milvus2-sdk-node";
import normalizeEmbedding from "../helpers/normalizeEmbedding.js";

export async function storeEmbeddings(chunks, embeddings) {
  try {
    // ✅ 1. Check if chunks and embeddings are not empty
    if (!chunks || chunks.length === 0) {
      console.error("❌ Chunks are empty!");
      throw new Error("❌ Chunks are empty!");
    }
    if (!embeddings || embeddings.length === 0) {
      console.error("❌ Embeddings are empty!");
      throw new Error("❌ Embeddings are empty!");
    }

    console.log("✅ Chunks and embeddings are valid!");
    console.log("Chunks length: ", chunks.length);
    console.log("Embeddings length: ", embeddings.length);

    // ✅ 2. Normalize embeddings & ensure correct format
    const entities = chunks.map((chunk, index) => {
      const embedding = Array.isArray(embeddings[index]) ? embeddings[index] : [embeddings[index]];

      return {
        id: (index + 1), // 🔹 FIX: Ensure ID is int64
        text: chunk,
        vector: normalizeEmbedding(embedding), // 🔹 FIX: Normalize vector before storing
      };
    });

    // console.log("✅ Entities to be inserted:", JSON.stringify(entities, null, 2));

    // ✅ 3. Insert into Milvus
    const result = await client.insert({
      collection_name: process.env.COLLECTION_NAME,
      fields_data: entities,
    });

    // console.log("✅ Insert Result:", result);

  } catch (error) {
    console.error("❌ Error storing embeddings:", error);
  }
}

export async function searchEmbeddings(queryEmbedding, topCount) {
  try {
    const collectionName = process.env.COLLECTION_NAME;
    console.log(`🔍 Searching in collection: ${collectionName}`);

    // ✅ 1. Ensure the collection exists before searching
      const collectionExists = await client.hasCollection({ collection_name: collectionName });
    
    if (!collectionExists) {
      console.error(`❌ Collection ${collectionName} does not exist!`);
      throw new Error(`❌ Collection ${collectionName} does not exist!`);
    }
    console.log("✅ Collection exists!");

    // ✅ 2. Load the collection into memory if not already loaded
    await client.loadCollection({ collection_name: collectionName });
    console.log("✅ Collection loaded into memory!");

    // ✅ 3. Normalize query embedding before searching
    const normalizeQueryEmbedding = normalizeEmbedding(queryEmbedding);
    // console.log("Query Embedding Format:", normalizeQueryEmbedding);
    console.log("Query Vector Dimension:", normalizeQueryEmbedding.length);

    // ✅ 4. Ensure the query embedding has the correct dimension (3072)
    if (normalizeQueryEmbedding.length !== 3072) {
      console.error("❌ Query embedding dimension is incorrect! Expected dimension: 3072.");
      throw new Error("❌ Query embedding dimension is incorrect! Expected dimension: 3072.");
    }

    // ✅ 5. Perform the search with optimized parameters
    const response = await client.search({
      collection_name: collectionName,
      vectors: [normalizeQueryEmbedding], // The query vector
      top_k: topCount,  // Fetch top 10 results
      anns_field: "vector",  // The field containing vectors
      metric_type: MetricType.COSINE,  // Use Cosine
      params: { nprobe: 20 },  // Increase nprobe for deeper search
    });

    // ✅ 6. Check if results are found and return them
    if (response.results && response.results.length > 0) {
      return response.results; // Return the search results
    } else {
      console.log("🔍 No results found for the query.");
      return []; // Return empty array if no results found
    }
  } catch (error) {
    // Log errors for better debugging
    console.error("❌ Error searching embeddings:", error);
    return []; // Return empty array on error
  }
}
