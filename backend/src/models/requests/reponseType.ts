import OtpCode from '../schema/otpCodes.schema.js'
import User from '../schema/user.schema.js'

export type VerifyOtpLocals = { otpVerify: OtpCode }
export type UserLocals = { user: User }
