import { UserRole } from '~/constants/enum.js'

export interface RegisterRqType {
  fullName: string
  email: string
  password: string
  device_info: string
  role?: UserRole
}
export interface LoginRqType {
  email: string
  password: string
}
export interface RefreshRqType {
  refresh_token: string
}
export interface EmailVerifyRqType {
  email_verify_token: string
}
export interface ForgotPasswordRqType {
  email: string
}
export interface ResetPasswordRqType{
  password: string
  forgot_password_token: string
}
