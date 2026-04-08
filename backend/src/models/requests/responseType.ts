import OtpCode from '../schema/otpCodes.schema.js'
import User from '../schema/user.schema.js'
import Company from '../schema/companies.schema.js'
import Job from '../schema/jobs.schena.js'

export type VerifyOtpLocals = { otpVerify: OtpCode }
export type UserLocals = { user: User }
export type CompanyLocals = { company: Company | null }
export type JobLocals = { job: Job | null }
