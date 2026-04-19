import databaseService from '~/configs/database.config'
import { ObjectId } from 'mongodb'
import Company from '~/models/schema/client/companies.schema'
import uploadThingProvider from '~/providers/uploadthing.provider'

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

  async updateLogo(company: Company, payload: { logo: string; logo_file_key: string }) {
    const oldLogoFileKey = company.logo_file_key

    await databaseService.companies.updateOne(
      { _id: company._id },
      {
        $set: {
          logo: payload.logo,
          logo_file_key: payload.logo_file_key,
          updated_at: new Date()
        }
      }
    )

    if (oldLogoFileKey && oldLogoFileKey !== payload.logo_file_key) {
      await uploadThingProvider.deleteFile(oldLogoFileKey)
    }
  }
}

const companyService = new CompanyService()
export default companyService

