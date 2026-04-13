import axios from 'axios'
import env from '../configs/env.config'

const DEFAULT_EMBEDDING_MODEL = 'dangvantuan/vietnamese-document-embedding'
const EMBEDDING_API_URL = env.EMBEDDING_API_URL.replace(/\/+$/, '')

export const generateEmbedding = async (text: string, model = DEFAULT_EMBEDDING_MODEL): Promise<number[]> => {
  const normalizedText = text.trim()

  if (!normalizedText) {
    throw new Error('Text to embed must not be empty')
  }

  const response = await axios.post(
    `${EMBEDDING_API_URL}/embeddings`,
    { texts: [normalizedText] },
    {
      timeout: 30000
    }
  )

  const output = response.data?.embeddings?.[0]

  if (!Array.isArray(output)) {
    throw new Error(`Embedding API returned an invalid response for model ${model}`)
  }

  return output as number[]
}

export const EMBEDDING_MODEL = DEFAULT_EMBEDDING_MODEL
