import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import { ChatIntent } from '~/constants/chat-intent'
import { ChatSessionDocument, ChatSessionTurnRole } from '~/models/chat/chat.type'
import ChatSession from '~/models/schema/client/chatSessions.schema'

class SessionService {
  async loadOrCreateSession(sessionId?: string) {
    if (sessionId && ObjectId.isValid(sessionId)) {
      const session = await databaseService.chatSessions.findOne({
        _id: new ObjectId(sessionId)
      })

      if (session) {
        return session
      }
    }

    const chatSession = new ChatSession()
    const result = await databaseService.chatSessions.insertOne(chatSession)

    return {
      ...chatSession,
      _id: result.insertedId
    }
  }

  async appendMessage(sessionId: ObjectId, role: ChatSessionTurnRole, content: string) {
    const turn = {
      role,
      content,
      created_at: new Date()
    }

    await databaseService.chatSessions.updateOne(
      { _id: sessionId },
      {
        $push: {
          turns: turn
        },
        $set: {
          updated_at: new Date()
        }
      }
    )
  }

  async saveState(sessionId: ObjectId, payload: { lastIntent: ChatIntent; jobIds: string[] }) {
    await databaseService.chatSessions.updateOne(
      { _id: sessionId },
      {
        $set: {
          last_intent: payload.lastIntent,
          last_retrieved_job_ids: payload.jobIds,
          updated_at: new Date()
        }
      }
    )
  }

  getSessionId(session: ChatSessionDocument) {
    return String(session._id)
  }
}

const sessionService = new SessionService()
export default sessionService
