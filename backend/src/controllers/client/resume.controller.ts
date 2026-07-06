import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import UserMessages from '~/constants/messages/index.js'
import { CreateResumeRqType, ResumeIdParamType } from '~/types/http/request.type.js'
import resumeService from '~/services/client/resume.service.js'

const serializeResume = (resume: Record<string, unknown>) => {
  const { resume_file_key: _resumeFileKey, ...publicResume } = resume
  return publicResume
}

export const createResumeController = async (req: Request<any, any, CreateResumeRqType>, res: Response) => {
  const result = await resumeService.createResume(req.decodeToken?.userId as string, req.body)

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: UserMessages.RESUME_CREATED_SUCCESS,
    data: {
      ...serializeResume(result.resume as unknown as Record<string, unknown>),
      _id: result.insertedId,
      resume_indexing: result.resume_indexing
    }
  })
}

export const getMyResumesController = async (req: Request, res: Response) => {
  const resumes = await resumeService.getMyResumes(req.decodeToken?.userId as string)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: resumes.map((resume) => serializeResume(resume as Record<string, unknown>))
  })
}

export const getResumeDetailController = async (req: Request<ResumeIdParamType>, res: Response) => {
  const resume = await resumeService.getResumeDetail(req.decodeToken?.userId as string, req.params.resumeId)

  return res.status(StatusCodes.OK).json({
    status: 'success',
    data: serializeResume(resume as Record<string, unknown>)
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

