import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import { JobModerationStatus, JobStatus } from '~/constants/enum'
import { RetrievedChatJob } from '~/models/chat/chat.type'
import jobsService from '~/services/client/job.service'

class JobChatRetrievalService {
  async retrieveForJobSearch(message: string, limit = 5): Promise<RetrievedChatJob[]> {
    const result = await jobsService.searchPublicJobsForChat({
      q: message,
      page: 1,
      limit
    })

    const jobIds = result.items.map((item) => String(item._id))
    return this.loadJobsByIds(jobIds)
  }

  async retrieveForExplanation(message: string, lastJobIds: string[], limit = 5): Promise<RetrievedChatJob[]> {
    if (lastJobIds.length > 0) {
      return this.loadJobsByIds(lastJobIds.slice(0, limit))
    }

    return this.retrieveForJobSearch(message, limit)
  }

  async loadJobsByIds(jobIds: string[]): Promise<RetrievedChatJob[]> {
    if (jobIds.length === 0) {
      return []
    }

    const objectIds = jobIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id))

    if (objectIds.length === 0) {
      return []
    }

    const jobs = await databaseService.jobs
      .aggregate<RetrievedChatJob & { _id: ObjectId }>([
        {
          $match: {
            _id: { $in: objectIds },
            status: JobStatus.OPEN,
            moderation_status: JobModerationStatus.ACTIVE,
            published_at: { $ne: null },
            expired_at: { $gt: new Date() }
          }
        },
        {
          $lookup: {
            from: databaseService.companies.collectionName,
            localField: 'company_id',
            foreignField: '_id',
            as: 'company'
          }
        },
        {
          $unwind: '$company'
        },
        {
          $project: {
            _id: 1,
            title: 1,
            location: 1,
            level: 1,
            job_type: 1,
            salary: 1,
            skills: 1,
            description: 1,
            requirements: 1,
            benefits: 1,
            company: '$company.company_name'
          }
        }
      ])
      .toArray()

    const jobsMap = new Map<string, RetrievedChatJob>(
      jobs.map((job) => [
        String(job._id),
        {
          job_id: String(job._id),
          title: job.title,
          company: job.company,
          location: job.location,
          level: job.level,
          job_type: job.job_type,
          salary: job.salary,
          skills: Array.isArray(job.skills) ? job.skills : [],
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits
        }
      ])
    )

    return jobIds.reduce<RetrievedChatJob[]>((acc, id) => {
      const job = jobsMap.get(id)

      if (job) {
        acc.push(job)
      }

      return acc
    }, [])
  }
}

const jobChatRetrievalService = new JobChatRetrievalService()
export default jobChatRetrievalService
