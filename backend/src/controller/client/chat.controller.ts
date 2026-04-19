import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ragChatService from '~/services/chat/rag-chat.service'

export const chatJobsController = async (req: Request, res: Response) => {
  const result = await ragChatService.chat({
    message: req.body.message,
    session_id: req.body.session_id,
    resume_id: req.body.resume_id,
    user_id: req.decodeToken?.userId
  })

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: result
  })
}
