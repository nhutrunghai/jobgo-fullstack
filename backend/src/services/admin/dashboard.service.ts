import databaseService from '~/configs/database.config.js'
import { JobStatus } from '~/constants/enum.js'

class AdminDashboardService {
  async getSummary() {
    const [
      totalUsers,
      unverifiedUsers,
      totalCompanies,
      unverifiedCompanies,
      totalJobs,
      openJobs,
      totalApplications
    ] = await Promise.all([
      databaseService.users.countDocuments({}),
      databaseService.users.countDocuments({ is_verified: false }),
      databaseService.companies.countDocuments({}),
      databaseService.companies.countDocuments({ verified: false }),
      databaseService.jobs.countDocuments({}),
      databaseService.jobs.countDocuments({ status: JobStatus.OPEN }),
      databaseService.jobApplications.countDocuments({})
    ])

    return {
      total_users: totalUsers,
      unverified_users: unverifiedUsers,
      total_companies: totalCompanies,
      unverified_companies: unverifiedCompanies,
      total_jobs: totalJobs,
      open_jobs: openJobs,
      total_applications: totalApplications
    }
  }
}

const adminDashboardService = new AdminDashboardService()

export default adminDashboardService
