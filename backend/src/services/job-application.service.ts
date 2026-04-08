import databaseService from '~/configs/database.config'
import JobApplication from '~/models/schema/jobApplications.schema'

class JobApplicationService {
  async createJobApplication(data: JobApplication) {
    return databaseService.jobApplications.insertOne(data)
  }
}

const jobApplicationService = new JobApplicationService()
export default jobApplicationService
