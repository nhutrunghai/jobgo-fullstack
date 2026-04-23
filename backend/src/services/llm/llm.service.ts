import geminiProvider from './gemini.provider'
import openAiProvider from './openai.provider'
import env from '~/configs/env.config'
import { LlmProvider } from '~/services/admin/system-setting.service'

class LlmService {
  private getProvider(provider: LlmProvider = env.LLM_PROVIDER) {
    return provider === 'openai' ? openAiProvider : geminiProvider
  }

  async generateText(params: { provider?: LlmProvider; model: string; prompt: string }) {
    return this.getProvider(params.provider).generateText({
      model: params.model,
      prompt: params.prompt
    })
  }

  async generateJson<T>(params: { provider?: LlmProvider; model: string; prompt: string; schema: Record<string, unknown> }) {
    const text = await this.getProvider(params.provider).generateText({
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
