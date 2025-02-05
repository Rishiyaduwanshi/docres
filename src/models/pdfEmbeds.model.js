import { client } from "../config/dbConfig.js";
import { DataType, MetricType, IndexType } from "@zilliz/milvus2-sdk-node";

export const collectionName = "pdf_embeddings";

// Schema for the collection
const collectionSchema = {
  fields: [
    {
      name: "id",
      data_type: DataType.Int64,
      is_primary_key: true,
      auto_id: true, // Auto-generate ID
    },
    {
      name: "text",
      data_type: DataType.VarChar,
      max_length: 5000,
    },
    {
      name: "vector",
      data_type: DataType.FloatVector,
      dim: 3072, // Adjust according to your embedding's dimension
    },
  ],
};

export async function createCollection() {
  // List collections to check if collection already exists
  const collections = await client.listCollections();
  if (collections.collection_names.includes(process.env.COLLECTION_NAME)) {
    console.log("✅ Collection already exists!");
    return;
  }

  try {
    if (!client) {
      throw new Error("❌ Milvus client is not initialized!");
    }

    // Step 1: Create Collection
    const response = await client.createCollection({
      collection_name: collectionName,
      fields: collectionSchema.fields,
    });
    console.log("✅ Collection created successfully!");

    // Step 2: Create Index for Efficient Search
    const indexParams = {
      // Euclidean Distance
      params: { nlist: 56 }, // Increased nlist for larger datasets
    };
    await client.createIndex({
      collection_name: collectionName,
      field_name: "vector",
      index_name: "vector_index",
      index_type: IndexType.IVF_FLAT,
      metric_type: MetricType.COSINE,
      index_params: indexParams,
    });
    console.log("✅ Index created successfully!");

    // Step 3: Load Collection into memory for faster searches
    await client.loadCollection({
      collection_name: collectionName,
    });
    console.log("✅ Collection loaded into memory!");
  } catch (error) {
    console.error("❌ 😢 Error creating collection:", error);
  }
}
