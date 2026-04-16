import env from './env.config'
import ElasticsearchConfig from './elasticsearch.config'

const ELASTICSEARCH_BOOT_RETRY_ATTEMPTS = 10
const ELASTICSEARCH_BOOT_RETRY_DELAY_MS = 3000

export const PUBLIC_JOBS_SEARCH_INDEX = env.PUBLIC_JOBS_SEARCH_INDEX
export const JOB_EMBEDDING_DIMS = 768

export const PUBLIC_JOB_SEARCHABLE_FIELDS = ['title', 'description', 'requirements', 'benefits', 'search_text'] as const

export const PUBLIC_JOB_FILTER_FIELDS = [
  'location',
  'job_type',
  'level',
  'category',
  'skills',
  'status',
  'moderation_status'
] as const

// Schema field cua document search job public
export const publicJobsSearchSchema = {
  job_id: { type: 'keyword' },
  company_id: { type: 'keyword' },

  title: { type: 'text' },
  description: { type: 'text' },
  requirements: { type: 'text' },
  benefits: { type: 'text' },
  search_text: { type: 'text' },

  location: { type: 'keyword' },
  job_type: { type: 'keyword' },
  level: { type: 'keyword' },
  category: { type: 'keyword' },
  skills: { type: 'keyword' },
  status: { type: 'keyword' },
  moderation_status: { type: 'keyword' },

  published_at: { type: 'date' },
  expired_at: { type: 'date' },

  embedding: {
    type: 'dense_vector',
    dims: JOB_EMBEDDING_DIMS
  }
} as const

// Settings co ban cho phase dau
export const publicJobsSearchSettings = {
  number_of_shards: 1,
  number_of_replicas: 0
} as const

// Mapping dung format Elasticsearch
export const publicJobsSearchMapping = {
  settings: publicJobsSearchSettings,
  mappings: {
    properties: publicJobsSearchSchema
  }
} as const

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const ensurePublicJobsSearchIndex = async () => {
  const client = ElasticsearchConfig.getInstance()

  for (let attempt = 1; attempt <= ELASTICSEARCH_BOOT_RETRY_ATTEMPTS; attempt++) {
    try {
      const existsResponse = await client.indices.exists({
        index: PUBLIC_JOBS_SEARCH_INDEX
      })
      const exists =
        typeof existsResponse === 'boolean' ? existsResponse : Boolean((existsResponse as { body?: boolean }).body)

      if (!exists) {
        await client.indices.create({
          index: PUBLIC_JOBS_SEARCH_INDEX,
          ...publicJobsSearchMapping
        })
      }

      if (attempt > 1) {
        console.log(
          JSON.stringify({
            tag: 'public_jobs_search_index_ready',
            attempt
          })
        )
      }

      return
    } catch (error) {
      const isLastAttempt = attempt === ELASTICSEARCH_BOOT_RETRY_ATTEMPTS

      console.warn(
        JSON.stringify({
          tag: 'public_jobs_search_index_waiting',
          attempt,
          max_attempts: ELASTICSEARCH_BOOT_RETRY_ATTEMPTS,
          retry_in_ms: isLastAttempt ? 0 : ELASTICSEARCH_BOOT_RETRY_DELAY_MS,
          error: error instanceof Error ? error.message : String(error)
        })
      )

      if (isLastAttempt) {
        throw error
      }

      await sleep(ELASTICSEARCH_BOOT_RETRY_DELAY_MS)
    }
  }
}
