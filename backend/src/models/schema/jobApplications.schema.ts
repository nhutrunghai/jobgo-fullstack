import { ObjectId } from 'mongodb'
import { JobApplicationStatus } from '~/constants/enum.js'

interface ResumeSnapshotType {
  full_name?: string
  email?: string
  phone?: string
  cv_url?: string
  skills?: string[]
}

interface JobApplicationType {
  _id?: ObjectId
  job_id: ObjectId
  company_id: ObjectId
  candidate_id: ObjectId
  resume_snapshot?: ResumeSnapshotType
  cover_letter?: string
  status?: JobApplicationStatus
  applied_at?: Date
  updated_at?: Date
}

export default class JobApplication {
  _id?: ObjectId
  job_id: ObjectId
  company_id: ObjectId
  candidate_id: ObjectId
  resume_snapshot?: ResumeSnapshotType
  cover_letter?: string
  status?: JobApplicationStatus
  applied_at?: Date
  updated_at?: Date

  constructor(application: JobApplicationType) {
    const date = new Date()

    this._id = application._id
    this.job_id = application.job_id
    this.company_id = application.company_id
    this.candidate_id = application.candidate_id
    this.resume_snapshot = application.resume_snapshot
    this.cover_letter = application.cover_letter
    this.status = application.status || JobApplicationStatus.SUBMITTED
    this.applied_at = application.applied_at || date
    this.updated_at = application.updated_at || date
  }
}
