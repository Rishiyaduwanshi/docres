export default function normalizeEmbedding(embedding) {
    let norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return norm === 0 ? embedding : embedding.map(val => val / norm);
}
 


