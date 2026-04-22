import _ from 'lodash'
import { performance } from 'node:perf_hooks'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config'
import ElasticsearchConfig from '~/configs/elasticsearch.config'
import env from '~/configs/env.config'
import {
  JobLevel,
  JobModerationStatus,
  JobPromotionStatus,
  JobPromotionType,
  JobStatus,
  JobType
} from '~/constants/enum'
import Job from '~/models/schema/client/jobs.schema'
import { generateLocalEmbedding } from '~/services/embedding.service'
import jobSearchService from '~/services/job-search.service'

type SearchPublicJobsParams = {
  q: string
  location?: string
  job_type?: JobType
  level?: JobLevel
  page: number
  limit: number
}

type GetLatestPublicJobsParams = {
  page: number
  limit: number
}

type GetFeaturedPublicJobsParams = {
  page: number
  limit: number
}

type SearchHit = {
  job_id: string
  score: number
}

type SemanticSearchResult = {
  hits: SearchHit[]
  embeddingElapsedMs: number
  semanticSearchElapsedMs: number
}

type SearchCandidate = {
  job_id: string
  lexical_score: number
  semantic_score: number
  final_score: number
}

type PublicJobListItem = {
  _id: ObjectId
  title: string
  location: string
  job_type: JobType
  level: JobLevel
  salary: Job['salary']
  skills: string[]
  published_at: Date
  expired_at: Date
  company: {
    _id: ObjectId
    company_name: string
    logo?: string
  }
}

type PublicFeaturedJobListItem = PublicJobListItem & {
  promotion: {
    _id: ObjectId
    type: JobPromotionType
    priority: number
    starts_at: Date
    ends_at: Date
  }
}

type SearchScorePreview = {
  job_id: string
  title?: string
  lexical_score: number
  semantic_score: number
  final_score: number
}

class JobsService {
  private static readonly SEARCH_CANDIDATE_LIMIT = 100
  private static readonly SEARCH_SCORE_THRESHOLD = 0.8
  private static readonly SEARCH_LEXICAL_MIN_THRESHOLD = 0
  private static readonly SEARCH_SEMANTIC_RESCUE_THRESHOLD = 0.92
  private static readonly SEARCH_SEMANTIC_RESCUE_LIMIT = 5

  async createJob(job: Job) {
    const result = await databaseService.jobs.insertOne(job)
    await jobSearchService.upsertJobDocument(result.insertedId)
    return result
  }

  async updateCompanyJob(jobId: ObjectId, payload: Partial<Job>) {
    const updatedJob = await databaseService.jobs.findOneAndUpdate(
      { _id: jobId },
      {
        $set: payload
      },
      {
        returnDocument: 'after'
      }
    )

    if (updatedJob?._id) {
      await jobSearchService.upsertJobDocument(updatedJob._id)
    }

    return updatedJob
  }

  async getCompanyJobs({
    companyId,
    status,
    keyword,
    page,
    limit
  }: {
    companyId: ObjectId
    status?: JobStatus
    keyword?: string
    page: number
    limit: number
  }) {
    const query: {
      company_id: ObjectId
      status?: JobStatus
      title?: {
        $regex: string
        $options: string
      }
    } = {
      company_id: companyId
    }

    if (status) {
      query.status = status
    }

    if (keyword) {
      query.title = {
        $regex: _.escapeRegExp(keyword),
        $options: 'i'
      }
    }

    const [jobs, total] = await Promise.all([
      databaseService.jobs
        .find(query)
        .sort({ updated_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.jobs.countDocuments(query)
    ])

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  async searchPublicJobs(params: SearchPublicJobsParams) {
    const normalized = this.normalizeSearchParams(params)
    const startedAt = performance.now()
    const lexicalStartedAt = performance.now()
    const hits = await this.searchPublicJobsLexical(normalized)
    const lexicalElapsedMs = performance.now() - lexicalStartedAt

    const total = hits.length
    const start = (normalized.page - 1) * normalized.limit
    const pagedHits = hits.slice(start, start + normalized.limit)

    const hydrateStartedAt = performance.now()
    const jobs = await this.hydratePublicJobsFromMongo(pagedHits.map((item) => item.job_id))
    const hydrateElapsedMs = performance.now() - hydrateStartedAt
    const totalElapsedMs = performance.now() - startedAt

    console.log(
      JSON.stringify({
        tag: 'public_jobs_search_timing',
        mode: 'lexical',
        query: normalized.q,
        page: normalized.page,
        limit: normalized.limit,
        lexical_ms: Number(lexicalElapsedMs.toFixed(2)),
        hydrate_ms: Number(hydrateElapsedMs.toFixed(2)),
        total_hits: total,
        total_ms: Number(totalElapsedMs.toFixed(2))
      })
    )

    return {
      items: this.attachAndPreserveJobIdOrder(
        pagedHits.map((item) => item.job_id),
        jobs
      ),
      pagination: {
        page: normalized.page,
        limit: normalized.limit,
        total,
        total_pages: Math.ceil(total / normalized.limit)
      }
    }
  }

  async searchPublicJobsForChat(params: SearchPublicJobsParams) {
    const normalized = this.normalizeSearchParams(params)
    const startedAt = performance.now()

    const lexicalStartedAt = performance.now()
    const lexicalPromise = this.searchPublicJobsLexical(normalized).then((hits) => ({
      hits,
      elapsedMs: performance.now() - lexicalStartedAt
    }))

    const semanticStartedAt = performance.now()
    const semanticPromise = this.searchPublicJobsSemantic(normalized)
      .then((result) => ({
        ...result,
        totalElapsedMs: performance.now() - semanticStartedAt,
        fallback: false
      }))
      .catch((error) => {
        console.warn(
          JSON.stringify({
            tag: 'public_jobs_semantic_search_failed',
            query: normalized.q,
            error: error instanceof Error ? error.message : String(error)
          })
        )

        return {
          hits: [],
          embeddingElapsedMs: 0,
          semanticSearchElapsedMs: 0,
          totalElapsedMs: performance.now() - semanticStartedAt,
          fallback: true
        }
      })

    const [{ hits: lexicalHits, elapsedMs: lexicalElapsedMs }, semanticResult] = await Promise.all([
      lexicalPromise,
      semanticPromise
    ])

    const mergeStartedAt = performance.now()
    const candidates = this.mergeSearchCandidates(lexicalHits, semanticResult.hits)
    const rankingResult = this.applySearchThresholdAndSort(candidates)
    const ranked = rankingResult.items
    const mergeElapsedMs = performance.now() - mergeStartedAt

    const total = ranked.length
    const start = (normalized.page - 1) * normalized.limit
    const pagedCandidates = ranked.slice(start, start + normalized.limit)

    const hydrateStartedAt = performance.now()
    const jobs = await this.hydratePublicJobsFromMongo(pagedCandidates.map((item) => item.job_id))
    const hydrateElapsedMs = performance.now() - hydrateStartedAt
    const totalElapsedMs = performance.now() - startedAt
    const scorePreview = this.buildScorePreview(pagedCandidates, jobs)

    console.log(
      JSON.stringify({
        tag: 'public_jobs_search_timing',
        mode: 'hybrid',
        query: normalized.q,
        page: normalized.page,
        limit: normalized.limit,
        lexical_ms: Number(lexicalElapsedMs.toFixed(2)),
        embedding_ms: Number(semanticResult.embeddingElapsedMs.toFixed(2)),
        semantic_es_ms: Number(semanticResult.semanticSearchElapsedMs.toFixed(2)),
        semantic_total_ms: Number(semanticResult.totalElapsedMs.toFixed(2)),
        semantic_fallback: semanticResult.fallback,
        merge_rank_ms: Number(mergeElapsedMs.toFixed(2)),
        hydrate_ms: Number(hydrateElapsedMs.toFixed(2)),
        total_candidates: candidates.length,
        total_ranked: total,
        semantic_rescue_count: rankingResult.semanticRescueCount,
        top_scores: scorePreview,
        total_ms: Number(totalElapsedMs.toFixed(2))
      })
    )

    return {
      items: this.attachAndPreserveOrder(pagedCandidates, jobs),
      pagination: {
        page: normalized.page,
        limit: normalized.limit,
        total,
        total_pages: Math.ceil(total / normalized.limit)
      }
    }
  }

  async getLatestPublicJobs(params: GetLatestPublicJobsParams) {
    const page = params.page
    const limit = params.limit
    const now = new Date()
    const match = {
      status: JobStatus.OPEN,
      moderation_status: JobModerationStatus.ACTIVE,
      published_at: { $ne: null },
      expired_at: { $gt: now }
    }

    const [result] = await databaseService.jobs
      .aggregate<{
        items: PublicJobListItem[]
        total: { count: number }[]
      }>([
        {
          $match: match
        },
        {
          $sort: {
            published_at: -1,
            created_at: -1,
            _id: -1
          }
        },
        {
          $facet: {
            items: [
              {
                $skip: (page - 1) * limit
              },
              {
                $limit: limit
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
                  job_type: 1,
                  level: 1,
                  salary: 1,
                  skills: 1,
                  published_at: 1,
                  expired_at: 1,
                  company: {
                    _id: '$company._id',
                    company_name: '$company.company_name',
                    logo: '$company.logo'
                  }
                }
              }
            ],
            total: [
              {
                $count: 'count'
              }
            ]
          }
        }
      ])
      .toArray()

    const total = result?.total[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      items: result?.items || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages
      }
    }
  }

  async getFeaturedPublicJobs(params: GetFeaturedPublicJobsParams) {
    const page = params.page
    const limit = params.limit
    const now = new Date()

    const [result] = await databaseService.jobPromotions
      .aggregate<{
        items: PublicFeaturedJobListItem[]
        total: { count: number }[]
      }>([
        {
          $match: {
            type: JobPromotionType.HOMEPAGE_FEATURED,
            status: JobPromotionStatus.ACTIVE,
            starts_at: { $lte: now },
            ends_at: { $gt: now }
          }
        },
        {
          $sort: {
            priority: -1,
            starts_at: -1,
            _id: -1
          }
        },
        {
          $group: {
            _id: '$job_id',
            promotion: { $first: '$$ROOT' }
          }
        },
        {
          $replaceRoot: {
            newRoot: '$promotion'
          }
        },
        {
          $lookup: {
            from: databaseService.jobs.collectionName,
            localField: 'job_id',
            foreignField: '_id',
            as: 'job'
          }
        },
        {
          $unwind: '$job'
        },
        {
          $match: {
            'job.status': JobStatus.OPEN,
            'job.moderation_status': JobModerationStatus.ACTIVE,
            'job.published_at': { $ne: null },
            'job.expired_at': { $gt: now }
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
          $sort: {
            priority: -1,
            starts_at: -1,
            _id: -1
          }
        },
        {
          $facet: {
            items: [
              {
                $skip: (page - 1) * limit
              },
              {
                $limit: limit
              },
              {
                $project: {
                  _id: '$job._id',
                  title: '$job.title',
                  location: '$job.location',
                  job_type: '$job.job_type',
                  level: '$job.level',
                  salary: '$job.salary',
                  skills: '$job.skills',
                  published_at: '$job.published_at',
                  expired_at: '$job.expired_at',
                  promotion: {
                    _id: '$_id',
                    type: '$type',
                    priority: '$priority',
                    starts_at: '$starts_at',
                    ends_at: '$ends_at'
                  },
                  company: {
                    _id: '$company._id',
                    company_name: '$company.company_name',
                    logo: '$company.logo'
                  }
                }
              }
            ],
            total: [
              {
                $count: 'count'
              }
            ]
          }
        }
      ])
      .toArray()

    const total = result?.total[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      items: result?.items || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages
      }
    }
  }

  private normalizeSearchParams(params: SearchPublicJobsParams): SearchPublicJobsParams {
    return {
      ...params,
      q: params.q.trim(),
      location: params.location?.trim()
    }
  }

  private buildPublicSearchFilters(params: SearchPublicJobsParams) {
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

  private async searchPublicJobsLexical(params: SearchPublicJobsParams): Promise<SearchHit[]> {
    const response = await ElasticsearchConfig.getInstance().search({
      index: env.PUBLIC_JOBS_SEARCH_INDEX,
      size: JobsService.SEARCH_CANDIDATE_LIMIT,
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

  private async searchPublicJobsSemantic(params: SearchPublicJobsParams): Promise<SemanticSearchResult> {
    const embeddingStartedAt = performance.now()
    const queryVector = await generateLocalEmbedding(params.q)
    const embeddingElapsedMs = performance.now() - embeddingStartedAt

    const semanticSearchStartedAt = performance.now()
    const response = await ElasticsearchConfig.getInstance().search({
      index: env.PUBLIC_JOBS_SEARCH_INDEX,
      size: JobsService.SEARCH_CANDIDATE_LIMIT,
      query: {
        script_score: {
          query: {
            bool: {
              filter: this.buildPublicSearchFilters(params)
            }
          },
          script: {
            source: "cosineSimilarity(params.queryVector, 'embedding') + 1.0",
            params: {
              queryVector
            }
          }
        }
      }
    })
    const semanticSearchElapsedMs = performance.now() - semanticSearchStartedAt

    return {
      hits: response.hits.hits.map((hit) => ({
        job_id: String(hit._id),
        score: hit._score || 0
      })),
      embeddingElapsedMs,
      semanticSearchElapsedMs
    }
  }

  private mergeSearchCandidates(lexicalHits: SearchHit[], semanticHits: SearchHit[]): SearchCandidate[] {
    const candidatesMap = new Map<string, SearchCandidate>()

    for (const hit of lexicalHits) {
      candidatesMap.set(hit.job_id, {
        job_id: hit.job_id,
        lexical_score: hit.score,
        semantic_score: 0,
        final_score: 0
      })
    }

    for (const hit of semanticHits) {
      const existing = candidatesMap.get(hit.job_id)

      if (existing) {
        existing.semantic_score = hit.score
        continue
      }

      candidatesMap.set(hit.job_id, {
        job_id: hit.job_id,
        lexical_score: 0,
        semantic_score: hit.score,
        final_score: 0
      })
    }

    const candidates = Array.from(candidatesMap.values())
    const lexicalMax = Math.max(0, ...candidates.map((item) => item.lexical_score))
    const semanticMax = Math.max(0, ...candidates.map((item) => item.semantic_score))

    for (const item of candidates) {
      item.lexical_score = lexicalMax > 0 ? item.lexical_score / lexicalMax : 0
      item.semantic_score = semanticMax > 0 ? item.semantic_score / semanticMax : 0
      item.final_score = semanticMax > 0 ? 0.2 * item.lexical_score + 0.8 * item.semantic_score : item.lexical_score
    }

    return candidates
  }

  private applySearchThresholdAndSort(candidates: SearchCandidate[]) {
    const sorted = candidates
      .filter((item) => item.final_score >= JobsService.SEARCH_SCORE_THRESHOLD)
      .sort((a, b) => b.final_score - a.final_score)

    const hybridQualified = sorted.filter((item) => item.lexical_score >= JobsService.SEARCH_LEXICAL_MIN_THRESHOLD)

    const semanticRescue = sorted
      .filter(
        (item) =>
          item.lexical_score < JobsService.SEARCH_LEXICAL_MIN_THRESHOLD &&
          item.semantic_score >= JobsService.SEARCH_SEMANTIC_RESCUE_THRESHOLD
      )
      .slice(0, JobsService.SEARCH_SEMANTIC_RESCUE_LIMIT)

    const merged = [...hybridQualified]
    for (const item of semanticRescue) {
      if (!merged.some((existing) => existing.job_id === item.job_id)) {
        merged.push(item)
      }
    }

    merged.sort((a, b) => b.final_score - a.final_score)

    return {
      items: merged,
      semanticRescueCount: semanticRescue.length
    }
  }

  private async hydratePublicJobsFromMongo(jobIds: string[]) {
    if (jobIds.length === 0) {
      return []
    }

    const objectIds = jobIds.map((id) => new ObjectId(id))

    return databaseService.jobs
      .aggregate<PublicJobListItem>([
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
            job_type: 1,
            level: 1,
            salary: 1,
            skills: 1,
            published_at: 1,
            expired_at: 1,
            company: {
              _id: '$company._id',
              company_name: '$company.company_name',
              logo: '$company.logo'
            }
          }
        }
      ])
      .toArray()
  }

  private attachAndPreserveOrder(candidates: SearchCandidate[], jobs: PublicJobListItem[]) {
    const jobsMap = new Map(jobs.map((job) => [String(job._id), job]))

    return candidates
      .map((candidate) => jobsMap.get(candidate.job_id) || null)
      .filter((job): job is PublicJobListItem => job !== null)
  }

  private attachAndPreserveJobIdOrder(jobIds: string[], jobs: PublicJobListItem[]) {
    const jobsMap = new Map(jobs.map((job) => [String(job._id), job]))

    return jobIds.map((jobId) => jobsMap.get(jobId) || null).filter((job): job is PublicJobListItem => job !== null)
  }

  private buildScorePreview(candidates: SearchCandidate[], jobs: PublicJobListItem[]): SearchScorePreview[] {
    const jobsMap = new Map(jobs.map((job) => [String(job._id), job]))

    return candidates.slice(0, 5).map((candidate) => ({
      job_id: candidate.job_id,
      title: jobsMap.get(candidate.job_id)?.title,
      lexical_score: Number(candidate.lexical_score.toFixed(4)),
      semantic_score: Number(candidate.semantic_score.toFixed(4)),
      final_score: Number(candidate.final_score.toFixed(4))
    }))
  }
}

const jobsService = new JobsService()
export default jobsService
