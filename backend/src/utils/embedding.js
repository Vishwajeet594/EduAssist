const { pipeline } = require("@xenova/transformers");

let extractorPromise;

const getExtractor = async () => {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2"
    );
  }

  return extractorPromise;
};

const getEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error("Text is required to generate an embedding");
  }

  const extractor = await getExtractor();
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true
  });

  const embedding = Array.from(output.data);

  if (embedding.length !== 384) {
    throw new Error(
      `Expected 384-dimensional embedding, received ${embedding.length}`
    );
  }

  return embedding;
};

module.exports = {
  getEmbedding
};
