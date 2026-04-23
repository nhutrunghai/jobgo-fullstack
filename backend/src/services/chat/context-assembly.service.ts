import { ChatSource, RetrievedChatJob } from '~/models/chat/chat.type'

class ContextAssemblyService {
  buildSources(jobs: RetrievedChatJob[], limit = 3): ChatSource[] {
    return jobs.slice(0, limit).map((job) => ({
      type: 'job',
      job_id: job.job_id,
      title: job.title,
      company: job.company
    }))
  }
}

const contextAssemblyService = new ContextAssemblyService()
export default contextAssemblyService
