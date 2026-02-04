import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import { OtpType } from '~/constants/enum'
import authService from './auth.service'
import OtpCode from '~/models/schema/otpCodes.schema'
class UserService {
  async findUser(key: string, value: string | ObjectId, projection?: object) {
    return await databaseService.users.findOne({ [key]: value }, { projection: projection || {} })
  }
  async updateProfile(userId: string, data: object) {
    return await databaseService.users.updateOne({ _id: new ObjectId(userId) }, { $set: data })
  }
  async handlerOtpCode(userId: string, payloadOtp: OtpCode, type: OtpType) {
    await databaseService.otpCodes.deleteMany({ user_id: new ObjectId(userId), type: type })
    return authService.signOtpCode(payloadOtp)
  }
  async setNewPassword(userId: string, newPassword: string, otpCode: string) {
    return Promise.all([
      databaseService.users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: newPassword, updated_at: new Date() } }
      ),
      databaseService.otpCodes.deleteOne({ code: otpCode, type: OtpType.CHANGE_PASSWORD })
    ])
  }
}
const userService = new UserService()
export default userService
