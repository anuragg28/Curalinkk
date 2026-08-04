const { Pinecone } = require('@pinecone-database/pinecone')

const apiKey = process.env.PINECONE_API_KEY
const pinecone = apiKey ? new Pinecone({ apiKey }) : null

function getEmbeddingModel() {
  return process.env.PINECONE_EMBEDDING_MODEL || 'multilingual-e5-large'
}

function extractEmbeddingVectors(payload) {
  const candidates =
    payload?.data || payload?.embeddings || payload?.vectors || payload?.results || []

  if (!Array.isArray(candidates)) {
    return []
  }

  return candidates
    .map((item) => item?.values || item?.embedding || item)
    .filter((vector) => Array.isArray(vector))
}

async function fetchEmbeddings(texts, inputType = 'passage') {
  if (!pinecone) {
    throw new Error('PINECONE_API_KEY is not configured')
  }

  if (!texts || texts.length === 0) {
    return []
  }

  const chunkSize = 96
  const allEmbeddings = []

  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize)
    const response = await pinecone.inference.embed({
      model: getEmbeddingModel(),
      inputs: chunk,
      parameters: { inputType, truncate: 'END' }
    })

    const vectors = extractEmbeddingVectors(response)

    if (vectors.length !== chunk.length) {
      throw new Error(
        `Embedding service returned ${vectors.length} vectors for ${chunk.length} inputs`,
      )
    }

    allEmbeddings.push(...vectors)
  }

  return allEmbeddings
}

function cosineSimilarity(vectorA, vectorB) {
  const length = Math.min(vectorA.length, vectorB.length)

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < length; i += 1) {
    const a = vectorA[i] || 0
    const b = vectorB[i] || 0
    dot += a * b
    normA += a * a
    normB += b * b
  }

  if (!normA || !normB) {
    return 0
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

async function embedAll(query, pool) {
  const texts = pool.map((record) => `${record.title} ${record.abstract}`.slice(0, 1000))

  const [queryVectorBatch, abstractVectors] = await Promise.all([
    fetchEmbeddings([query], 'query'),
    fetchEmbeddings(texts, 'passage'),
  ])

  const queryVector = queryVectorBatch[0]

  return pool.map((result, index) => ({
    ...result,
    embedding: abstractVectors[index],
    semanticScore: Number(cosineSimilarity(queryVector, abstractVectors[index]).toFixed(4)),
  }))
}

module.exports = {
  embedAll,
  fetchEmbeddings,
  cosineSimilarity,
}
