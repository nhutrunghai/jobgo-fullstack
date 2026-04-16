import { ObjectId } from 'mongodb'
import { ResumeStatus } from '~/constants/enum'

export interface ResumeType {
  _id?: ObjectId
  candidate_id: ObjectId
  title: string
  cv_url: string
  full_name: string
  email: string
  phone: string
  summary?: string
  skills?: string[]
  education?: string
  experience?: string
  is_default?: boolean
  status?: ResumeStatus
  created_at?: Date
  updated_at?: Date
}

export default class Resume {
  _id?: ObjectId
  candidate_id: ObjectId
  title: string
  cv_url: string
  full_name: string
  email: string
  phone: string
  summary?: string
  skills: string[]
  education?: string
  experience?: string
  is_default: boolean
  status: ResumeStatus
  created_at: Date
  updated_at: Date

  constructor(resume: ResumeType) {
    const date = new Date()

    this._id = resume._id
    this.candidate_id = resume.candidate_id
    this.title = resume.title
    this.cv_url = resume.cv_url
    this.full_name = resume.full_name
    this.email = resume.email
    this.phone = resume.phone
    this.summary = resume.summary
    this.skills = resume.skills || []
    this.education = resume.education
    this.experience = resume.experience
    this.is_default = resume.is_default || false
    this.status = resume.status || ResumeStatus.ACTIVE
    this.created_at = resume.created_at || date
    this.updated_at = resume.updated_at || date
  }
}
