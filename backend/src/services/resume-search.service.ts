import ElasticsearchConfig from '~/configs/elasticsearch.config'
import env from '~/configs/env.config'
import { ResumeStatus } from '~/constants/enum'
import { OPENAI_EMBEDDING_MODEL_NAME, generateOpenAiEmbedding } from '~/services/embedding.service'

type ResumeChunkMetadata = {
  status?: ResumeStatus
  is_default?: boolean
}

export type ResumeChunkInput = {
  resume_id: string
  candidate_id: string
  chunk_id: string
  chunk_index: number
  status: ResumeStatus
  is_default: boolean
  title: string
  text: string
  section?: string
  source_url: string
  resume_file_key?: string
}

class ResumeSearchService {
  private async ignoreMissingIndex<T>(operation: () => Promise<T>): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      const statusCode = (error as { meta?: { statusCode?: number } })?.meta?.statusCode

      if (statusCode === 404) {
        return null
      }

      throw error
    }
  }

  async clearCandidateDefaultChunks(candidateId: string) {
    return this.ignoreMissingIndex(() =>
      ElasticsearchConfig.getInstance().updateByQuery({
        index: env.RESUME_SEARCH_INDEX,
        refresh: true,
        conflicts: 'proceed',
        query: {
          bool: {
            filter: [{ term: { candidate_id: candidateId } }, { term: { is_default: true } }]
          }
        },
        script: {
          source: 'ctx._source.is_default = false; ctx._source.updated_at = params.updated_at;',
          params: {
            updated_at: new Date().toISOString()
          }
        }
      })
    )
  }

  async updateResumeChunksMetadata(candidateId: string, resumeId: string, metadata: ResumeChunkMetadata) {
    const assignments: string[] = ['ctx._source.updated_at = params.updated_at;']
    const params: Record<string, string | boolean> = {
      updated_at: new Date().toISOString()
    }

    if (metadata.status) {
      assignments.push('ctx._source.status = params.status;')
      params.status = metadata.status
    }

    if (typeof metadata.is_default === 'boolean') {
      assignments.push('ctx._source.is_default = params.is_default;')
      params.is_default = metadata.is_default
    }

    return this.ignoreMissingIndex(() =>
      ElasticsearchConfig.getInstance().updateByQuery({
        index: env.RESUME_SEARCH_INDEX,
        refresh: true,
        conflicts: 'proceed',
        query: {
          bool: {
            filter: [{ term: { candidate_id: candidateId } }, { term: { resume_id: resumeId } }]
          }
        },
        script: {
          source: assignments.join('\n'),
          params
        }
      })
    )
  }

  async syncCandidateDefaultResume(candidateId: string, defaultResumeId: string) {
    await this.clearCandidateDefaultChunks(candidateId)
    return this.updateResumeChunksMetadata(candidateId, defaultResumeId, {
      status: ResumeStatus.ACTIVE,
      is_default: true
    })
  }

  async deleteResumeChunks(candidateId: string, resumeId: string) {
    return this.ignoreMissingIndex(() =>
      ElasticsearchConfig.getInstance().deleteByQuery({
        index: env.RESUME_SEARCH_INDEX,
        refresh: true,
        conflicts: 'proceed',
        query: {
          bool: {
            filter: [{ term: { candidate_id: candidateId } }, { term: { resume_id: resumeId } }]
          }
        }
      })
    )
  }

  async indexResumeChunks(chunks: ResumeChunkInput[]) {
    if (chunks.length === 0) {
      return {
        indexed: 0
      }
    }

    const operations = []

    for (const chunk of chunks) {
      const embedding = await generateOpenAiEmbedding(chunk.text)
      const now = new Date().toISOString()

      operations.push(
        {
          index: {
            _index: env.RESUME_SEARCH_INDEX,
            _id: chunk.chunk_id
          }
        },
        {
          ...chunk,
          embedding_model: OPENAI_EMBEDDING_MODEL_NAME,
          created_at: now,
          updated_at: now,
          embedding
        }
      )
    }

    const response = await ElasticsearchConfig.getInstance().bulk({
      refresh: true,
      operations
    })

    if (response.errors) {
      throw new Error('Failed to index one or more resume chunks into Elasticsearch')
    }

    return {
      indexed: chunks.length
    }
  }
}

const resumeSearchService = new ResumeSearchService()
export default resumeSearchService
