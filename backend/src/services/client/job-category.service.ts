import databaseService from '~/configs/database.config'

class JobCategoryService {
  async getActiveCategories() {
    return databaseService.jobCategories
      .find({ is_active: true })
      .sort({ sort_order: 1, name: 1 })
      .toArray()
  }
}

const jobCategoryService = new JobCategoryService()
export default jobCategoryService
