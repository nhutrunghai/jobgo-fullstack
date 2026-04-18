import axios from 'axios'
import env from '~/configs/env.config'

type GenerateTextParams = {
  model: string
  prompt: string
  responseMimeType?: 'text/plain' | 'application/json'
  responseJsonSchema?: Record<string, unknown>
}

class OpenAiProvider {
  private assertConfigured() {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required to call OpenAI API')
    }
  }

  async generateText({ model, prompt, responseMimeType = 'text/plain', responseJsonSchema }: GenerateTextParams) {
    this.assertConfigured()

    const startedAt = Date.now()

    try {
      const response = await axios.post(
        `${env.OPENAI_BASE_URL}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          ...(responseMimeType === 'application/json' && responseJsonSchema
            ? {
                response_format: {
                  type: 'json_schema',
                  json_schema: {
                    name: 'chatbot_structured_output',
                    strict: true,
                    schema: responseJsonSchema
                  }
                }
              }
            : {})
        },
        {
          timeout: env.OPENAI_API_TIMEOUT_MS,
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const text = response.data?.choices?.[0]?.message?.content

      if (typeof text !== 'string' || !text.trim()) {
        throw new Error('OpenAI API returned an empty response')
      }

      console.log(
        JSON.stringify({
          tag: 'openai_provider_success',
          model,
          response_mime_type: responseMimeType,
          elapsed_ms: Date.now() - startedAt
        })
      )

      return text.trim()
    } catch (error) {
      console.error(
        JSON.stringify({
          tag: 'openai_provider_failed',
          model,
          response_mime_type: responseMimeType,
          elapsed_ms: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error)
        })
      )

      throw error
    }
  }
}

const openAiProvider = new OpenAiProvider()
export default openAiProvider
