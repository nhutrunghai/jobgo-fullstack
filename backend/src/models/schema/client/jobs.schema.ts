import { ObjectId } from 'mongodb'
import { JobLevel, JobStatus, JobType } from '~/constants/enum.js'

export interface SalaryType {
  min?: number
  max?: number
  currency: 'VND' | 'USD'
  is_negotiable?: boolean
}

interface JobTypeSchema {
  _id?: ObjectId
  company_id: ObjectId
  title: string
  description: string
  requirements: string
  benefits: string
  salary: SalaryType
  location: string
  job_type: JobType
  level: JobLevel
  category: string[]
  skills: string[]
  quantity: number
  expired_at: Date
  status?: JobStatus
  published_at?: Date
  created_at?: Date
  updated_at?: Date
}

export default class Job {
  _id?: ObjectId
  company_id: ObjectId
  title: string
  description: string
  requirements: string
  benefits: string
  salary: SalaryType
  location: string
  job_type: JobType
  level: JobLevel
  category: string[]
  skills: string[]
  quantity: number
  expired_at: Date
  status?: JobStatus
  published_at?: Date
  created_at?: Date
  updated_at?: Date

  constructor(job: JobTypeSchema) {
    const date = new Date()

    this._id = job._id
    this.company_id = job.company_id
    this.title = job.title
    this.description = job.description
    this.requirements = job.requirements
    this.benefits = job.benefits
    this.salary = {
      min: job.salary.min,
      max: job.salary.max,
      currency: job.salary.currency,
      is_negotiable: job.salary.is_negotiable ?? false
    }
    this.location = job.location
    this.job_type = job.job_type
    this.level = job.level
    this.category = job.category || []
    this.skills = job.skills || []
    this.quantity = job.quantity
    this.expired_at = job.expired_at
    this.status = job.status || JobStatus.DRAFT
    this.published_at = job.published_at
    this.created_at = job.created_at || date
    this.updated_at = job.updated_at || date
  }
}
