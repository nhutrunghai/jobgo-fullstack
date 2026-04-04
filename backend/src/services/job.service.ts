import databaseService from '~/configs/database.config'
import Job from '~/models/schema/jobs.schena'

class JobsService {
  async createJob(job: Job) {
    return databaseService.jobs.insertOne(job)
  }
}

const jobsService = new JobsService()
export default jobsService
