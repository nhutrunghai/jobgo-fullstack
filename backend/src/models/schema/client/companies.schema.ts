import { ObjectId } from 'mongodb'
interface CompanyType {
  _id?: ObjectId
  user_id: ObjectId
  company_name: string
  logo?: string
  logo_file_key?: string
  website?: string
  address: string
  description?: string
  verified?: boolean
  created_at?: Date
  updated_at?: Date
}
export default class Company {
  _id?: ObjectId
  user_id: ObjectId
  company_name: string
  logo?: string
  logo_file_key?: string
  website?: string
  address: string
  description?: string
  verified?: boolean
  created_at?: Date
  updated_at?: Date
  constructor(company: CompanyType) {
    const date = new Date()
    this._id = company._id
    this.user_id = company.user_id
    this.company_name = company.company_name
    this.logo = company.logo
    this.logo_file_key = company.logo_file_key
    this.website = company.website
    this.address = company.address
    this.description = company.description
    this.verified = company.verified || false
    this.created_at = company.created_at || date
    this.updated_at = company.updated_at || date
  }
}
