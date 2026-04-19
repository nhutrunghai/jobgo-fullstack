import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import UserMessages from '~/constants/messages.js'
import { CreateResumeRqType, ResumeIdParamType } from '~/models/requests/requestsType.js'
import resumeService from '~/services/client/resume.service.js'

export const createResumeController = async (req: Request<any, any, CreateResumeRqType>, res: Response) => {
  const result = await resumeService.createResume(req.decodeToken?.userId as string, req.body)

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.RESUME_CREATED_SUCCESS,
    data: {
      ...result.resume,
      _id: result.insertedId,
      resume_indexing: result.resume_indexing
    }
  })
}

export const getMyResumesController = async (req: Request, res: Response) => {
  const resumes = await resumeService.getMyResumes(req.decodeToken?.userId as string)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: resumes
  })
}

export const getResumeDetailController = async (req: Request<ResumeIdParamType>, res: Response) => {
  const resume = await resumeService.getResumeDetail(req.decodeToken?.userId as string, req.params.resumeId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: resume
  })
}

export const deleteResumeController = async (req: Request<ResumeIdParamType>, res: Response) => {
  const resume = await resumeService.deleteResume(req.decodeToken?.userId as string, req.params.resumeId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: UserMessages.RESUME_DELETED_SUCCESS,
    data: {
      _id: resume._id
    }
  })
}
