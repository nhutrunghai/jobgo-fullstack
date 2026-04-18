import geminiProvider from './gemini.provider'
import openAiProvider from './openai.provider'
import env from '~/configs/env.config'

class LlmService {
  private getProvider() {
    return env.LLM_PROVIDER === 'openai' ? openAiProvider : geminiProvider
  }

  async generateText(params: { model: string; prompt: string }) {
    return this.getProvider().generateText({
      model: params.model,
      prompt: params.prompt
    })
  }

  async generateJson<T>(params: { model: string; prompt: string; schema: Record<string, unknown> }) {
    const text = await this.getProvider().generateText({
      model: params.model,
      prompt: params.prompt,
      responseMimeType: 'application/json',
      responseJsonSchema: params.schema
    })

    return JSON.parse(text) as T
  }
}

const llmService = new LlmService()
export default llmService
