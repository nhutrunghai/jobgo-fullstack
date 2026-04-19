import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import ElasticsearchConfig from '~/configs/elasticsearch.config'
import env from '~/configs/env.config'
import Job from '~/models/schema/client/jobs.schema'
import { generateLocalEmbedding } from '~/services/embedding.service'

export interface PublicJobSearchDocument {
  job_id: string
  company_id: string
  title: string
  description: string
  requirements: string
  benefits: string
  search_text: string
  location: string
  job_type: string
  level: string
  category: string[]
  skills: string[]
  status: string
  moderation_status: string
  published_at?: Date
  expired_at?: Date
}

class JobSearchService {
  buildSearchDocument(job: Job): PublicJobSearchDocument {
    const title = job.title?.trim() || ''
    const description = job.description?.trim() || ''
    const requirements = job.requirements?.trim() || ''
    const benefits = job.benefits?.trim() || ''

    const searchText = [title, description, requirements, benefits].filter(Boolean).join('\n\n')

    return {
      job_id: String(job._id),
      company_id: String(job.company_id),
      title,
      description,
      requirements,
      benefits,
      search_text: searchText,
      location: job.location || '',
      job_type: job.job_type || '',
      level: job.level || '',
      category: Array.isArray(job.category) ? job.category : [],
      skills: Array.isArray(job.skills) ? job.skills : [],
      status: job.status || '',
      moderation_status: job.moderation_status || '',
      published_at: job.published_at,
      expired_at: job.expired_at
    }
  }

  async upsertJobDocument(jobId: string | ObjectId) {
    const objectId = typeof jobId === 'string' ? new ObjectId(jobId) : jobId

    const job = await databaseService.jobs.findOne({ _id: objectId })
    if (!job) {
      return
    }

    const document = this.buildSearchDocument(job)
    const embedding = await generateLocalEmbedding(document.search_text)

    await ElasticsearchConfig.getInstance().index({
      index: env.PUBLIC_JOBS_SEARCH_INDEX,
      id: document.job_id,
      document: {
        ...document,
        embedding
      }
    })
  }
}

const jobSearchService = new JobSearchService()
export default jobSearchService

