import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import UserMessages from '~/constants/messages'
import ragChatService from '~/services/chat/rag-chat.service'
import sessionService from '~/services/chat/session.service'

export const chatJobsController = async (req: Request, res: Response) => {
  const result = await ragChatService.chat({
    message: req.body.message,
    session_id: req.body.session_id,
    resume_id: req.body.resume_id,
    user_id: req.decodeToken!.userId
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: result
  })
}

export const getChatSessionsController = async (req: Request, res: Response) => {
  const sessions = await sessionService.listSessions(req.decodeToken!.userId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      sessions
    }
  })
}

export const getChatSessionController = async (req: Request, res: Response) => {
  const session = await sessionService.getSessionById(req.params.session_id as string, req.decodeToken!.userId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: session
  })
}

export const deleteChatSessionController = async (req: Request, res: Response) => {
  await sessionService.deleteSession(req.params.session_id as string, req.decodeToken!.userId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.CHAT_SESSION_DELETED_SUCCESS
  })
}
