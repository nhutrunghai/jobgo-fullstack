import env from '~/configs/env.config'
import { ChatIntent } from '~/constants/chat-intent'
import { ChatIntentResult } from '~/models/chat/chat.type'
import { RagChatRuntimeConfig } from '~/services/admin/system-setting.service'
import llmService from '~/services/llm/llm.service'
import { buildIntentRouterPrompt } from './prompts/intent-router.prompt'
import { intentRouterJsonSchema, intentRouterSchema } from './schemas/intent-router.schema'

class IntentRouterService {
  async detectIntent(message: string, config?: RagChatRuntimeConfig): Promise<ChatIntentResult> {
    const normalizedMessage = message.trim()
    const provider = config?.provider || env.LLM_PROVIDER
    const model = config?.intent_model || env.LLM_MODEL_INTENT

    try {
      const raw = await llmService.generateJson<ChatIntentResult>({
        provider,
        model,
        prompt: buildIntentRouterPrompt(normalizedMessage),
        schema: intentRouterJsonSchema
      })

      const parsed = intentRouterSchema.parse(raw)

      return {
        ...parsed,
        intent: this.applyIntentOverrides(parsed.intent, normalizedMessage)
      }
    } catch (error) {
      const fallbackIntent = this.detectFallbackIntent(normalizedMessage)

      console.warn(
        JSON.stringify({
          tag: 'intent_router_fallback',
          message: normalizedMessage,
          fallback_intent: fallbackIntent,
          error: error instanceof Error ? error.message : String(error)
        })
      )

      return {
        intent: fallbackIntent,
        confidence: 0.25
      }
    }
  }

  private detectFallbackIntent(message: string): ChatIntent {
    if (this.isCvReviewMessage(message)) {
      return 'cv_review'
    }

    if (this.isPolicyQuestion(message)) {
      return 'policy_qa'
    }

    if (/(so sánh|đánh giá|khác nhau|job đầu|job trước|job này|job kia)/i.test(message)) {
      return 'job_explanation'
    }

    if (/(job|việc|tìm|vị trí|remote|backend|frontend|apply|intern|fresher|node|react)/i.test(message)) {
      return 'job_search'
    }

    return 'unsupported'
  }

  private applyIntentOverrides(intent: ChatIntent, message: string): ChatIntent {
    if (this.isCvReviewMessage(message)) {
      return 'cv_review'
    }

    if (this.isPolicyQuestion(message)) {
      return 'policy_qa'
    }

    return intent
  }

  private isCvReviewMessage(message: string) {
    return /(cv|resume|hồ sơ|ho so|sơ yếu lý lịch|so yeu ly lich)/i.test(message)
  }

  private isPolicyQuestion(message: string) {
    return /(luật|luat|quy định|quy dinh|chính sách|chinh sach|nghị định|nghi dinh|thông tư|thong tu|bảo hiểm|bao hiem|hợp đồng|hop dong|thử việc|thu viec|policy|regulation|legal)/i.test(message)
  }
}

const intentRouterService = new IntentRouterService()
export default intentRouterService
