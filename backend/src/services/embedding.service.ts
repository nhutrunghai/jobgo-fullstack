import axios from 'axios'
import env from '~/configs/env.config'

const DEFAULT_EMBEDDING_MODEL = 'dangvantuan/vietnamese-document-embedding'
const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001'
const EMBEDDING_API_URL = env.EMBEDDING_API_URL.replace(/\/+$/, '')
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const OPENAI_API_URL = env.OPENAI_BASE_URL.replace(/\/+$/, '')

export const LOCAL_EMBEDDING_MODEL = DEFAULT_EMBEDDING_MODEL
export const GEMINI_EMBEDDING_MODEL_NAME = GEMINI_EMBEDDING_MODEL
export const OPENAI_EMBEDDING_MODEL_NAME = env.OPENAI_EMBEDDING_MODEL

export const generateLocalEmbedding = async (text: string, model = LOCAL_EMBEDDING_MODEL): Promise<number[]> => {
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

export const generateGeminiEmbedding = async (
  text: string,
  {
    model = GEMINI_EMBEDDING_MODEL_NAME,
    outputDimensionality
  }: {
    model?: string
    outputDimensionality?: number
  } = {}
): Promise<number[]> => {
  const normalizedText = text.trim()

  if (!normalizedText) {
    throw new Error('Text to embed must not be empty')
  }

  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required to call Gemini Embedding API')
  }

  const requestBody: {
    model: string
    content: {
      parts: Array<{
        text: string
      }>
    }
    outputDimensionality?: number
  } = {
    model: `models/${model}`,
    content: {
      parts: [{ text: normalizedText }]
    }
  }

  if (outputDimensionality) {
    requestBody.outputDimensionality = outputDimensionality
  }

  const response = await axios.post(`${GEMINI_API_URL}/${model}:embedContent`, requestBody, {
    timeout: 30000,
    headers: {
      'x-goog-api-key': env.GEMINI_API_KEY
    }
  })

  const output = response.data?.embedding?.values

  if (!Array.isArray(output)) {
    throw new Error(`Gemini Embedding API returned an invalid response for model ${model}`)
  }

  return output as number[]
}

export const generateOpenAiEmbedding = async (text: string, model = OPENAI_EMBEDDING_MODEL_NAME): Promise<number[]> => {
  const normalizedText = text.trim()

  if (!normalizedText) {
    throw new Error('Text to embed must not be empty')
  }

  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required to call OpenAI Embedding API')
  }

  const response = await axios.post(
    `${OPENAI_API_URL}/embeddings`,
    {
      model,
      input: normalizedText
    },
    {
      timeout: env.OPENAI_API_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const output = response.data?.data?.[0]?.embedding

  if (!Array.isArray(output)) {
    throw new Error(`OpenAI Embedding API returned an invalid response for model ${model}`)
  }

  return output as number[]
}
