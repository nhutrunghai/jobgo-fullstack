import { ObjectId } from 'mongodb'
import env from '~/configs/env.config'
import { ChatIntent } from '~/constants/chat-intent'
import { ChatAnswerResult, RetrievedChatJob } from '~/models/chat/chat.type'
import llmService from '~/services/llm/llm.service'
import contextAssemblyService from './context-assembly.service'
import intentRouterService from './intent-router.service'
import jobChatRetrievalService from './job-chat-retrieval.service'
import { buildJobChatAnswerPrompt } from './prompts/job-chat-answer.prompt'
import sessionService from './session.service'

type ChatParams = {
  message: string
  session_id?: string
}

class RagChatService {
  async chat({ message, session_id }: ChatParams) {
    const normalizedMessage = message.trim()
    const session = await sessionService.loadOrCreateSession(session_id)
    const sessionObjectId = session._id as ObjectId

    await sessionService.appendMessage(sessionObjectId, 'user', normalizedMessage)

    const intentResult = await intentRouterService.detectIntent(normalizedMessage)
    const jobs = await this.retrieveJobsByIntent(intentResult.intent, normalizedMessage, session.last_retrieved_job_ids || [])
    const response = await this.buildAnswer(intentResult.intent, normalizedMessage, jobs)

    await sessionService.appendMessage(sessionObjectId, 'assistant', response.answer)
    await sessionService.saveState(sessionObjectId, {
      lastIntent: intentResult.intent,
      jobIds: jobs.map((job) => job.job_id)
    })

    return {
      session_id: sessionService.getSessionId(session),
      intent: intentResult.intent,
      answer: response.answer,
      sources: response.sources
    }
  }

  private async retrieveJobsByIntent(intent: ChatIntent, message: string, lastJobIds: string[]) {
    switch (intent) {
      case 'job_search':
        return jobChatRetrievalService.retrieveForJobSearch(message)
      case 'job_explanation':
        return jobChatRetrievalService.retrieveForExplanation(message, lastJobIds)
      default:
        return []
    }
  }

  private async buildAnswer(intent: ChatIntent, message: string, jobs: RetrievedChatJob[]): Promise<ChatAnswerResult> {
    if (intent === 'cv_review' || intent === 'policy_qa' || intent === 'unsupported') {
      return {
        answer: this.buildFallbackAnswer(intent),
        sources: []
      }
    }

    if (jobs.length === 0) {
      return {
        answer: 'Hiện tôi chưa tìm thấy job phù hợp với câu hỏi này. Bạn có thể thử nêu rõ hơn về kỹ năng, level hoặc địa điểm.',
        sources: []
      }
    }

    const answer = await llmService.generateText({
      model: env.LLM_MODEL_CHAT,
      prompt: buildJobChatAnswerPrompt({
        message,
        jobs: jobs.slice(0, 3)
      })
    })

    return {
      answer,
      sources: contextAssemblyService.buildSources(jobs)
    }
  }

  private buildFallbackAnswer(intent: ChatIntent) {
    switch (intent) {
      case 'cv_review':
        return 'Tính năng đánh giá CV sẽ được hỗ trợ ở bước sau. Hiện tại chatbot này đang hỗ trợ tư vấn job trên JobGo. Bạn có thể hỏi về tìm job, độ phù hợp hoặc so sánh các job.'
      case 'policy_qa':
        return 'Tính năng hỏi đáp về luật, quy định và tài liệu kiến thức sẽ được hỗ trợ sau khi dữ liệu được tải lên hệ thống. Hiện tại chatbot này đang hỗ trợ tư vấn job trên JobGo. Bạn có thể hỏi về tìm job, độ phù hợp hoặc so sánh các job.'
      case 'unsupported':
      default:
        return 'Hiện tại chatbot này đang hỗ trợ tư vấn job trên JobGo. Bạn có thể hỏi về tìm job, độ phù hợp hoặc so sánh các job.'
    }
  }
}

const ragChatService = new RagChatService()
export default ragChatService
