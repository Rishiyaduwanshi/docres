import natural from "natural";

export function smartChunk(text, chunkSize = 512) {
  const tokenizer = new natural.SentenceTokenizer();
  const sentences = tokenizer.tokenize(text);

  let chunks = [];
  let currentChunk = [];

  sentences.forEach((sentence) => {
    if (currentChunk.join(" ").length + sentence.length > chunkSize) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
    }
    currentChunk.push(sentence);
  });

  if (currentChunk.length) chunks.push(currentChunk.join(" "));

  return chunks;
}
