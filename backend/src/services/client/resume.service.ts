import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import databaseService from '~/configs/database.config.js'
import { ResumeStatus } from '~/constants/enum.js'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import Resume from '~/models/schema/client/resumes.schema.js'
import uploadThingProvider from '~/providers/uploadthing.provider.js'
import resumeIngestionService from '~/services/resume-ingestion.service.js'
import resumeSearchService from '~/services/resume-search.service.js'

type CreateResumePayload = {
  title: string
  cv_url: string
  resume_file_key: string
  is_default?: boolean
}

class ResumeService {
  async createResume(userId: string, payload: CreateResumePayload) {
    const candidateId = new ObjectId(userId)

    const newResume = new Resume({
      candidate_id: candidateId,
      title: payload.title,
      cv_url: payload.cv_url,
      resume_file_key: payload.resume_file_key,
      is_default: false,
      status: ResumeStatus.ACTIVE
    })

    const result = await databaseService.resumes.insertOne(newResume)
    const savedResume = new Resume({
      ...newResume,
      _id: result.insertedId
    })

    if (payload.is_default) {
      await this.setDefaultResumeInDatabase(candidateId, result.insertedId)
      newResume.is_default = true
      savedResume.is_default = true
    }

    this.runResumeIngestionInBackground(savedResume, {
      shouldSyncDefaultMetadata: Boolean(payload.is_default)
    })

    return {
      insertedId: result.insertedId,
      resume: newResume,
      resume_indexing: {
        status: 'queued',
        chunks_indexed: 0
      }
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

  async getDefaultResume(userId: string) {
    const candidateId = new ObjectId(userId)
    const defaultResume = await databaseService.resumes.findOne({
      candidate_id: candidateId,
      status: ResumeStatus.ACTIVE,
      is_default: true
    })

    if (defaultResume) {
      return defaultResume
    }

    const latestActiveResume = await this.getLatestActiveResume(candidateId)
    if (latestActiveResume) {
      return latestActiveResume
    }

    throw new AppError({
      statusCode: StatusCodes.NOT_FOUND,
      message: UserMessages.RESUME_NOT_FOUND
    })
  }

  private async getLatestActiveResume(candidateId: ObjectId, excludeResumeId?: ObjectId) {
    const query: {
      candidate_id: ObjectId
      status: ResumeStatus
      _id?: {
        $ne: ObjectId
      }
    } = {
      candidate_id: candidateId,
      status: ResumeStatus.ACTIVE
    }

    if (excludeResumeId) {
      query._id = {
        $ne: excludeResumeId
      }
    }

    return databaseService.resumes.findOne(query, {
      sort: {
        updated_at: -1
      }
    })
  }

  private async promoteDefaultResume(candidateId: ObjectId, resumeId: ObjectId) {
    await this.setDefaultResumeInDatabase(candidateId, resumeId)
    await resumeSearchService.syncCandidateDefaultResume(String(candidateId), String(resumeId))
  }

  private async setDefaultResumeInDatabase(candidateId: ObjectId, resumeId: ObjectId) {
    const now = new Date()

    await databaseService.resumes.updateMany(
      { candidate_id: candidateId, status: ResumeStatus.ACTIVE, is_default: true },
      { $set: { is_default: false, updated_at: now } }
    )

    await databaseService.resumes.updateOne(
      { _id: resumeId, candidate_id: candidateId, status: ResumeStatus.ACTIVE },
      { $set: { is_default: true, updated_at: now } }
    )
  }

  private runResumeIngestionInBackground(
    resume: Resume,
    options: {
      shouldSyncDefaultMetadata: boolean
    }
  ) {
    void (async () => {
      const resumeIndexing = await resumeIngestionService.ingestResume(resume)

      if (options.shouldSyncDefaultMetadata && resumeIndexing.status === 'completed') {
        await resumeSearchService.syncCandidateDefaultResume(String(resume.candidate_id), String(resume._id))
      }
    })().catch((error) => {
      console.error(
        JSON.stringify({
          tag: 'resume_ingestion_background_failed',
          resume_id: resume._id ? String(resume._id) : null,
          candidate_id: String(resume.candidate_id),
          error: error instanceof Error ? error.message : String(error)
        })
      )
    })
  }

  async getResumeForChat(userId: string, resumeId?: string) {
    if (resumeId) {
      return this.getResumeDetail(userId, resumeId)
    }

    return this.getDefaultResume(userId)
  }

  async deleteResume(userId: string, resumeId: string) {
    const resume = await this.getResumeDetail(userId, resumeId)
    const candidateId = new ObjectId(userId)
    const wasDefault = Boolean(resume.is_default)

    await databaseService.resumes.deleteOne({
      _id: resume._id,
      candidate_id: candidateId
    })

    await resumeSearchService.deleteResumeChunks(String(resume.candidate_id), String(resume._id))

    if (wasDefault) {
      const nextDefaultResume = await this.getLatestActiveResume(candidateId, resume._id)

      if (nextDefaultResume?._id) {
        await this.promoteDefaultResume(candidateId, nextDefaultResume._id)
      } else {
        await resumeSearchService.clearCandidateDefaultChunks(String(candidateId))
      }
    }

    if (resume.resume_file_key) {
      await uploadThingProvider.deleteFile(resume.resume_file_key)
    }

    return resume
  }
}

const resumeService = new ResumeService()
export default resumeService
