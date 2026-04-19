import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import databaseService from '~/configs/database.config.js'
import { ResumeStatus } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import Resume from '~/models/schema/client/resumes.schema.js'
import uploadThingProvider from '~/providers/uploadthing.provider.js'

type CreateResumePayload = {
  title: string
  cv_url: string
  resume_file_key: string
  is_default?: boolean
}

class ResumeService {
  async createResume(userId: string, payload: CreateResumePayload) {
    const candidateId = new ObjectId(userId)

    if (payload.is_default) {
      await databaseService.resumes.updateMany(
        { candidate_id: candidateId, status: ResumeStatus.ACTIVE, is_default: true },
        { $set: { is_default: false, updated_at: new Date() } }
      )
    }

    const newResume = new Resume({
      candidate_id: candidateId,
      title: payload.title,
      cv_url: payload.cv_url,
      resume_file_key: payload.resume_file_key,
      is_default: payload.is_default ?? false,
      status: ResumeStatus.ACTIVE
    })

    const result = await databaseService.resumes.insertOne(newResume)

    return {
      insertedId: result.insertedId,
      resume: newResume
    }
  }

  async getMyResumes(userId: string) {
    return databaseService.resumes
      .find(
        {
          candidate_id: new ObjectId(userId),
          status: ResumeStatus.ACTIVE
        },
        {
          sort: {
            is_default: -1,
            updated_at: -1
          }
        }
      )
      .toArray()
  }

  async getResumeDetail(userId: string, resumeId: string) {
    const resume = await databaseService.resumes.findOne({
      _id: new ObjectId(resumeId),
      candidate_id: new ObjectId(userId),
      status: ResumeStatus.ACTIVE
    })

    if (!resume) {
      throw new AppError({
        statusCode: StatusCodes.NOT_FOUND,
        message: UserMessages.RESUME_NOT_FOUND
      })
    }

    return resume
  }

  async deleteResume(userId: string, resumeId: string) {
    const resume = await this.getResumeDetail(userId, resumeId)

    await databaseService.resumes.deleteOne({
      _id: resume._id,
      candidate_id: new ObjectId(userId)
    })

    if (resume.resume_file_key) {
      await uploadThingProvider.deleteFile(resume.resume_file_key)
    }

    return resume
  }
}

const resumeService = new ResumeService()
export default resumeService
