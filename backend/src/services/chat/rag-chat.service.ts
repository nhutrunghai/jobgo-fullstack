import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import env from '~/configs/env.config'
import { ChatIntent } from '~/constants/chat-intent'
import ErrorCode from '~/constants/error'
import UserMessages from '~/constants/messages'
import { AppError } from '~/models/appError'
import { ChatAnswerResult, RetrievedChatJob, RetrievedResumeChunk } from '~/models/chat/chat.type'
import llmService from '~/services/llm/llm.service'
import resumeService from '~/services/client/resume.service'
import contextAssemblyService from './context-assembly.service'
import cvVisualReviewService from './cv-visual-review.service'
import intentRouterService from './intent-router.service'
import resumeChatRetrievalService from './resume-chat-retrieval.service'
import { buildCvReviewAnswerPrompt } from './prompts/cv-review-answer.prompt'
import jobChatRetrievalService from './job-chat-retrieval.service'
import { buildJobChatAnswerPrompt } from './prompts/job-chat-answer.prompt'
import sessionService from './session.service'
import adminSystemSettingService, { RagChatRuntimeConfig } from '~/services/admin/system-setting.service'

type ChatParams = {
  message: string
  session_id?: string
  resume_id?: string
  user_id: string
}

class RagChatService {
  async chat({ message, session_id, resume_id, user_id }: ChatParams) {
    const normalizedMessage = message.trim()
    const config = await adminSystemSettingService.getRagChatConfig()

    if (!config.enabled) {
      return {
        session_id,
        intent: 'unsupported' as ChatIntent,
        answer: config.maintenance_message || 'Chatbot đang tạm bảo trì. Vui lòng thử lại sau.',
        sources: []
      }
    }

    const session = await sessionService.loadOrCreateSession(session_id, user_id, normalizedMessage)
    const sessionObjectId = session._id as ObjectId

    await sessionService.appendMessage(sessionObjectId, 'user', normalizedMessage)

    const intentResult = await intentRouterService.detectIntent(normalizedMessage, config)
    if (intentResult.intent === 'cv_review') {
      if (!config.allow_cv_review) {
        const answer = this.buildFallbackAnswer('cv_review')

        await sessionService.appendMessage(sessionObjectId, 'assistant', answer)

        return {
          session_id: sessionService.getSessionId(session),
          intent: intentResult.intent,
          answer,
          sources: []
        }
      }

      const response = await this.buildCvReviewAnswer({
        message: normalizedMessage,
        resumeId: resume_id,
        userId: user_id,
        config
      })

      await sessionService.appendMessage(sessionObjectId, 'assistant', response.answer, response.sources)
      await sessionService.saveState(sessionObjectId, {
        lastIntent: intentResult.intent,
        jobIds: []
      })

      return {
        session_id: sessionService.getSessionId(session),
        intent: intentResult.intent,
        answer: response.answer,
        sources: response.sources
      }
    }

    const jobs = await this.retrieveJobsByIntent(
      intentResult.intent,
      normalizedMessage,
      session.last_retrieved_job_ids || [],
      config
    )
    const response = await this.buildAnswer(intentResult.intent, normalizedMessage, jobs, config)

    await sessionService.appendMessage(sessionObjectId, 'assistant', response.answer, response.sources)
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

  private async buildCvReviewAnswer({
    message,
    resumeId,
    userId,
    config
  }: {
    message: string
    resumeId?: string
    userId?: string
    config: RagChatRuntimeConfig
  }): Promise<ChatAnswerResult> {
    if (!userId) {
      throw new AppError({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: UserMessages.ACCESS_TOKEN_NOT_FOUND,
        errorCode: ErrorCode.UNAUTHORIZED
      })
    }

    const resume = await resumeService.getResumeForChat(userId, resumeId)
    let chunks: RetrievedResumeChunk[] = []

    try {
      chunks = await resumeChatRetrievalService.retrieveForCvReview(message, resume, config.cv_review_top_k)
    } catch (error) {
      console.error(
        JSON.stringify({
          tag: 'cv_review_text_retrieval_failed',
          resume_id: resume._id ? String(resume._id) : null,
          error: error instanceof Error ? error.message : String(error)
        })
      )
    }

    const visualReviewResult = await cvVisualReviewService.reviewResumePdf({
      message,
      resume
    })

    if (chunks.length === 0 && !visualReviewResult.summary) {
      const fallbackReasons: string[] = ['Tôi chưa lấy được text CV từ Elasticsearch']

      if (!resume.cv_url) {
        fallbackReasons.push('CV này không có `cv_url` để phân tích PDF')
      } else if (visualReviewResult.error) {
        fallbackReasons.push(`phân tích bố cục PDF chưa thực hiện được: ${visualReviewResult.error}`)
      }

      return {
        answer: `Hiện tôi chưa có đủ dữ liệu để đánh giá CV này. ${fallbackReasons.join(
          ', '
        )}. Hãy kiểm tra lại file CV hoặc chạy lại pipeline ingest để có cả text chunks và dữ liệu PDF hợp lệ.`,
        sources: [this.buildSingleResumeSource(resume)]
      }
    }

    const answer = await llmService.generateText({
      provider: config.provider,
      model: config.chat_model,
      prompt: buildCvReviewAnswerPrompt({
        message,
        chunks,
        visualReviewSummary: visualReviewResult.summary
      })
    })

    return {
      answer,
      sources: chunks.length > 0 ? this.buildResumeSources(chunks) : [this.buildSingleResumeSource(resume)]
    }
  }

  private buildResumeSources(chunks: RetrievedResumeChunk[]) {
    const sourcesMap = new Map<string, ChatAnswerResult['sources'][number]>()

    for (const chunk of chunks) {
      const key = `${chunk.resume_id}:${chunk.chunk_index}`
      if (!sourcesMap.has(key)) {
        sourcesMap.set(key, {
          type: 'resume',
          resume_id: chunk.resume_id,
          title: chunk.title,
          chunk_index: chunk.chunk_index
        })
      }
    }

    return Array.from(sourcesMap.values())
  }

  private buildSingleResumeSource(resume: Awaited<ReturnType<typeof resumeService.getResumeForChat>>) {
    return {
      type: 'resume' as const,
      resume_id: String(resume._id),
      title: resume.title,
      chunk_index: 0
    }
  }

  private async retrieveJobsByIntent(
    intent: ChatIntent,
    message: string,
    lastJobIds: string[],
    config: RagChatRuntimeConfig
  ) {
    switch (intent) {
      case 'job_search':
        return jobChatRetrievalService.retrieveForJobSearch(message, config.job_search_top_k)
      case 'job_explanation':
        return jobChatRetrievalService.retrieveForExplanation(message, lastJobIds, config.job_explanation_top_k)
      default:
        return []
    }
  }

  private async buildAnswer(
    intent: ChatIntent,
    message: string,
    jobs: RetrievedChatJob[],
    config: RagChatRuntimeConfig
  ): Promise<ChatAnswerResult> {
    if (intent === 'policy_qa' || intent === 'unsupported') {
      return {
        answer: this.buildFallbackAnswer(intent),
        sources: []
      }
    }

    if (jobs.length === 0) {
      return {
        answer:
          'Hiện tôi chưa tìm thấy job phù hợp với câu hỏi này. Bạn có thể thử nêu rõ hơn về kỹ năng, level hoặc địa điểm.',
        sources: []
      }
    }

    const answer = await llmService.generateText({
      provider: config.provider,
      model: config.chat_model,
      prompt: buildJobChatAnswerPrompt({
        message,
        jobs: jobs.slice(0, config.answer_context_limit)
      })
    })

    return {
      answer,
      sources: contextAssemblyService.buildSources(jobs, config.answer_context_limit)
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
