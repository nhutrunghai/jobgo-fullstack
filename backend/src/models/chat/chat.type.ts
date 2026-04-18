import { ObjectId } from 'mongodb'
import { ChatIntent } from '~/constants/chat-intent'

export type ChatSource = {
  type: 'job'
  job_id: string
  title: string
  company: string
}

export type ChatIntentResult = {
  intent: ChatIntent
  confidence: number
}

export type ChatAnswerResult = {
  answer: string
  sources: ChatSource[]
}

export type ChatSessionTurnRole = 'user' | 'assistant'

export type ChatSessionTurn = {
  role: ChatSessionTurnRole
  content: string
  created_at: Date
}

export type ChatSessionDocument = {
  _id?: ObjectId
  user_id?: ObjectId
  turns: ChatSessionTurn[]
  last_intent?: ChatIntent
  last_retrieved_job_ids: string[]
  created_at: Date
  updated_at: Date
}

export type RetrievedChatJob = {
  job_id: string
  title: string
  company: string
  location: string
  level: string
  job_type: string
  salary?: {
    min?: number
    max?: number
    currency: string
    is_negotiable?: boolean
  }
  skills: string[]
  description: string
  requirements: string
  benefits: string
}
