import crypto from 'crypto'
import bcrypt from 'bcryptjs'
export const generateToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  return { rawToken, hashedToken }
}
export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}
export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashed)
}
