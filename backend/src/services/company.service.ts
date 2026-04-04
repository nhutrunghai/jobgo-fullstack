import databaseService from '~/configs/database.config'
import { ObjectId } from 'mongodb'
import Company from '~/models/schema/companies.schema'

class CompanyService {
  async createCompany(data: Company) {
    return databaseService.companies.insertOne(data)
  }

  async updateCompany(companyId: ObjectId, data: Partial<Company>) {
    return databaseService.companies.updateOne(
      { _id: companyId },
      {
        $set: {
          ...data,
          updated_at: new Date()
        }
      }
    )
  }
}

const companyService = new CompanyService()
export default companyService
