import ElasticsearchConfig from '~/configs/elasticsearch.config'
import env from '~/configs/env.config'
import { ResumeStatus } from '~/constants/enum'
import { RetrievedResumeChunk } from '~/models/chat/chat.type'
import Resume from '~/models/schema/client/resumes.schema'
import { generateOpenAiEmbedding } from '~/services/embedding.service'

type ResumeChunkDocument = {
  resume_id: string
  candidate_id: string
  chunk_id: string
  chunk_index: number
  status: ResumeStatus
  is_default: boolean
  title: string
  text: string
  section?: string
}

class ResumeChatRetrievalService {
  private static readonly RESUME_CHUNK_LIMIT = 6

  async retrieveForCvReview(message: string, resume: Resume, limit = ResumeChatRetrievalService.RESUME_CHUNK_LIMIT): Promise<RetrievedResumeChunk[]> {
    const resumeId = String(resume._id)
    const candidateId = String(resume.candidate_id)
    const queryVector = await generateOpenAiEmbedding(message)

    const response = await ElasticsearchConfig.getInstance().search<ResumeChunkDocument>({
      index: env.RESUME_SEARCH_INDEX,
      size: limit,
      query: {
        script_score: {
          query: {
            bool: {
              filter: [
                { term: { resume_id: resumeId } },
                { term: { candidate_id: candidateId } },
                { term: { status: ResumeStatus.ACTIVE } },
                { term: { is_default: Boolean(resume.is_default) } }
              ]
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

    return response.hits.hits
      .map((hit) => hit._source)
      .filter((source): source is ResumeChunkDocument => Boolean(source))
      .map((source, index) => ({
        resume_id: source.resume_id,
        candidate_id: source.candidate_id,
        chunk_id: source.chunk_id,
        chunk_index: source.chunk_index,
        status: source.status,
        is_default: source.is_default,
        title: source.title,
        text: source.text,
        section: source.section,
        score: response.hits.hits[index]?._score || 0
      }))
  }
}

const resumeChatRetrievalService = new ResumeChatRetrievalService()
export default resumeChatRetrievalService
