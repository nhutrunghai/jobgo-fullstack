import ElasticsearchConfig from '~/configs/elasticsearch.config'
import env from '~/configs/env.config'
import { JobModerationStatus, JobStatus } from '~/constants/enums'
import { SEARCH_CANDIDATE_LIMIT, SearchHit, SearchPublicJobsParams } from './job-search.type'

class LexicalJobSearchService {
  async search(params: SearchPublicJobsParams): Promise<SearchHit[]> {
    const response = await ElasticsearchConfig.getInstance().search({
      index: env.PUBLIC_JOBS_SEARCH_INDEX,
      size: SEARCH_CANDIDATE_LIMIT,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: params.q,
                fields: ['title^4', 'skills^3', 'category^2', 'description', 'requirements', 'benefits']
              }
            }
          ],
          filter: this.buildPublicSearchFilters(params)
        }
      }
    })

    return response.hits.hits.map((hit) => ({
      job_id: String(hit._id),
      score: hit._score || 0
    }))
  }

  buildPublicSearchFilters(params: SearchPublicJobsParams) {
    const filters: object[] = [
      { term: { status: JobStatus.OPEN } },
      { term: { moderation_status: JobModerationStatus.ACTIVE } },
      { exists: { field: 'published_at' } },
      { range: { expired_at: { gt: new Date().toISOString() } } }
    ]

    if (params.location) {
      filters.push({ term: { location: params.location } })
    }

    if (params.job_type) {
      filters.push({ term: { job_type: params.job_type } })
    }

    if (params.level) {
      filters.push({ term: { level: params.level } })
    }

    return filters
  }
}

const lexicalJobSearchService = new LexicalJobSearchService()
export default lexicalJobSearchService