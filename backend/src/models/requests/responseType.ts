import { ObjectId } from 'mongodb'
import OtpCode from '../schema/client/otpCodes.schema.js'
import User from '../schema/client/user.schema.js'
import Company from '../schema/client/companies.schema.js'
import Job from '../schema/client/jobs.schema.js'
import JobApplication from '../schema/client/jobApplications.schema.js'
import Resume from '../schema/client/resumes.schema.js'

export type VerifyOtpLocals = { otpVerify: OtpCode }
export type UserLocals = { user: User }
export type CompanyLocals = { company: Company | null }
export type AdminCompanyLocals = { adminCompany: Company }
export type AdminUserLocals = { adminUser: User }
export type AdminJobDetail = {
  _id: ObjectId
  title: string
  description: string
  requirements: string
  benefits: string
  salary: Job['salary']
  location: string
  job_type: Job['job_type']
  level: Job['level']
  category: string[]
  skills: string[]
  quantity: number
  status?: Job['status']
  moderation_status?: Job['moderation_status']
  blocked_reason?: string
  blocked_at?: Date
  blocked_by?: ObjectId
  published_at?: Date
  expired_at: Date
  created_at?: Date
  updated_at?: Date
  company: {
    _id: ObjectId
    company_name: string
    verified?: boolean
    logo?: string
    website?: string
    address: string
  }
}
export type AdminJobLocals = { adminJob: AdminJobDetail }
export type JobLocals = { job: Job | null }
export type PublicJobDetail = {
  job: {
    _id: ObjectId
    title: string
    description: string
    requirements: string
    benefits: string
    salary: Job['salary']
    location: string
    job_type: Job['job_type']
    level: Job['level']
    category: string[]
    skills: string[]
    quantity: number
    expired_at: Date
    published_at?: Date
    created_at?: Date
    updated_at?: Date
  }
  company: {
    _id: ObjectId
    company_name: string
    logo?: string
    website?: string
    address: string
    description?: string
  }
}
export type PublicJobLocals = { publicJob: PublicJobDetail | null }
export type MyApplicationSummary = {
  _id: ObjectId
  status?: JobApplication['status']
  applied_at?: Date
  updated_at?: Date
}
export type PublicJobWithApplicationLocals = {
  publicJob: PublicJobDetail | null
  myApplication: MyApplicationSummary | null
}
export type PublicApplyJob = {
  _id: ObjectId
  company_id: ObjectId
  owner_user_id: ObjectId
}
export type ApplyJobLocals = {
  applyJob: PublicApplyJob | null
  applyResume: Resume | null
  existingApplication: JobApplication | null
}
export type CompanyApplicationDetail = {
  _id: ObjectId
  job: {
    _id: ObjectId
    title: string
  }
  candidate: {
    _id: ObjectId
    full_name?: string
    avatar?: string
  }
  resume_snapshot?: {
    full_name?: string
    email?: string
    phone?: string
    cv_url?: string
    skills?: string[]
  }
  cover_letter?: string
  status?: string
  applied_at?: Date
  updated_at?: Date
}
export type CompanyApplicationDetailLocals = {
  companyApplication: CompanyApplicationDetail | null
}
export type CompanyApplicationLocals = {
  companyApplication: JobApplication | null
}
