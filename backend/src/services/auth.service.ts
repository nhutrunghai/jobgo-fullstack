import { SignOptions } from 'jsonwebtoken'
import { generateJwt } from '~/utils/jwt.util.js'
import userInfo from '~/models/userInfo.js'
import databaseService from '~/configs/database.config.js'
import User from '~/models/schema/user.schema.js'
import RefreshToken from '~/models/schema/refreshTokens.schema.js'
import { RegisterRqType, ResetPasswordRqType } from '~/models/requests/requestsType.js'
import { v4 as uuidv4 } from 'uuid'
import env from '~/configs/env.config.js'
import { ObjectId } from 'mongodb'
import { hashPassword } from '~/utils/crypto.utils.js'
import OtpCode from '~/models/schema/otpCodes.schema.js'
class AuthService {
  private signAccessToken({
    userInfoAccessToken,
    privateKey = env.SECRET_ACCESS_TOKEN,
    option = { expiresIn: env.ExpiresIn_ACCESS_TOKEN } as SignOptions
  }: {
    userInfoAccessToken: userInfo
    privateKey?: string
    option?: SignOptions
  }) {
    return generateJwt(userInfoAccessToken, privateKey, option)
  }
  private signRefreshToken({
    userInfoRefreshToken,
    privateKey = env.SECRET_REFRESH_TOKEN,
    option = { expiresIn: env.ExpiresIn_REFRESH_TOKEN } as SignOptions
  }: {
    userInfoRefreshToken: userInfo
    privateKey?: string
    option?: SignOptions
  }) {
    return generateJwt(userInfoRefreshToken, privateKey, option)
  }
  async signOtpCode(payload: OtpCode) {
    await databaseService.otpCodes.insertOne(new OtpCode(payload))
  }
  private async signAccessAndRefresh(userInfo: object, device_info: string, option?: { expiresAt: Date }) {
    const jtiAcessToken = uuidv4()
    const jtiRefreshToken = uuidv4()
    const userInfoAccessToken = { ...userInfo, jti: jtiAcessToken, typeJwt: 'ACCESS_TOKEN' } as userInfo
    const userInfoRefreshToken = { ...userInfo, jti: jtiRefreshToken, typeJwt: 'REFRESH_TOKEN' } as userInfo
    let expiresAt
    if (!option) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(env.ExpiresIn_REFRESH_TOKEN?.split(' ')[0]))
      expiresAt.setDate(expiresAt.getDate() + 30)
    } else {
      expiresAt = option.expiresAt
    }

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        jti: jtiRefreshToken,
        user_id: userInfoRefreshToken.userId,
        device_info: device_info,
        expires_at: expiresAt
      })
    )
    const refreshTokenOption = option
      ? ({ expiresIn: Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000)) } as SignOptions)
      : undefined
    const refreshTokenPromise = refreshTokenOption
      ? this.signRefreshToken({ userInfoRefreshToken, option: refreshTokenOption })
      : this.signRefreshToken({ userInfoRefreshToken })
    return Promise.all([this.signAccessToken({ userInfoAccessToken }), refreshTokenPromise])
  }
  async regiter(payload: RegisterRqType) {
    payload.password = await hashPassword(payload.password)
    const result = await databaseService.users.insertOne(new User(payload))
    const user_id = result.insertedId
    const userInfo = { userId: user_id, role: payload.role }
    const [AccessToken, RefreshToken] = await this.signAccessAndRefresh(userInfo, payload.device_info)
    return { id: user_id, AccessToken, RefreshToken }
  }
  async login(user: User, device_info: string) {
    const userInfo = { userId: user._id, role: user.role } as userInfo
    const [AccessToken, RefreshToken] = await this.signAccessAndRefresh(userInfo, device_info)
    return { id: user._id, AccessToken, RefreshToken }
  }
  async refreshToken(payload: userInfo, device_info: string) {
    const userInfo = { userId: new ObjectId(payload.userId), role: payload.role } as userInfo
    const expiresAt = new Date((payload.exp as number) * 1000)
    const [AccessToken, RefreshToken] = await this.signAccessAndRefresh(userInfo, device_info, { expiresAt })
    return { id: payload.userId, AccessToken, RefreshToken }
  }
  async verifyEmail(payload: OtpCode) {
    return Promise.all([
      databaseService.users.updateOne(
        { _id: payload.user_id },
        { $set: { is_verified: true, updated_at: new Date() } }
      ),
      databaseService.otpCodes.deleteOne({ code: payload.code })
    ])
  }
  async resetPassword(payload: OtpCode, password: string) {
    password = await hashPassword(password)
    return Promise.all([
      databaseService.users.updateOne(
        { _id: payload.user_id },
        { $set: { password: password, updated_at: new Date() } }
      ),
      databaseService.otpCodes.deleteOne({ code: payload.code })
    ])
  }
}
const authService = new AuthService()
export default authService
