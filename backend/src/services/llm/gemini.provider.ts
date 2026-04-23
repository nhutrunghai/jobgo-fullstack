import axios from 'axios'
import env from '~/configs/env.config'
import adminSystemSettingService from '~/services/admin/system-setting.service'

type GenerateTextParams = {
  model: string
  prompt: string
  responseMimeType?: 'text/plain' | 'application/json'
  responseJsonSchema?: Record<string, unknown>
}

class GeminiProvider {
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'

  private async getApiKey() {
    const apiKey = await adminSystemSettingService.getGeminiApiKey()

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required to call Gemini API')
    }

    return apiKey
  }

  async generateText({ model, prompt, responseMimeType = 'text/plain', responseJsonSchema }: GenerateTextParams) {
    const apiKey = await this.getApiKey()

    const startedAt = Date.now()

    try {
      const response = await axios.post(
        `${this.baseUrl}/${model}:generateContent`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType,
            ...(responseJsonSchema ? { responseJsonSchema } : {})
          }
        },
        {
          timeout: env.GEMINI_API_TIMEOUT_MS,
          headers: {
            'x-goog-api-key': apiKey
          }
        }
      )

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (typeof text !== 'string' || !text.trim()) {
        throw new Error('Gemini API returned an empty response')
      }

      console.log(
        JSON.stringify({
          tag: 'gemini_provider_success',
          model,
          response_mime_type: responseMimeType,
          elapsed_ms: Date.now() - startedAt
        })
      )

      return text.trim()
    } catch (error) {
      console.error(
        JSON.stringify({
          tag: 'gemini_provider_failed',
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

const geminiProvider = new GeminiProvider()
export default geminiProvider
