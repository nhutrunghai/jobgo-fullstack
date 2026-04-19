import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import { OtpType } from '~/constants/enum'
import { StatusCodes } from 'http-status-codes'
import UserMessages from '~/constants/messages.js'
import { AppError } from '~/models/appError.js'
import User from '~/models/schema/client/user.schema.js'
import uploadThingProvider from '~/providers/uploadthing.provider.js'
import authService from './auth.service'
import OtpCode from '~/models/schema/client/otpCodes.schema'
class UserService {
  async findUser(key: string, value: string | ObjectId, projection?: object) {
    return await databaseService.users.findOne({ [key]: value }, { projection: projection || {} })
  }
  async updateProfile(userId: string, data: object) {
    return await databaseService.users.updateOne({ _id: new ObjectId(userId) }, { $set: data })
  }
  async updateAvatar(userId: string, payload: { avatar: string; avatar_file_key: string }) {
    const user = (await databaseService.users.findOne({ _id: new ObjectId(userId) })) as User | null

    if (!user) {
      throw new AppError({ statusCode: StatusCodes.NOT_FOUND, message: UserMessages.USER_NOT_FOUND })
    }

    const oldAvatarFileKey = user.avatar_file_key

    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          avatar: payload.avatar,
          avatar_file_key: payload.avatar_file_key,
          updated_at: new Date()
        }
      }
    )

    if (oldAvatarFileKey && oldAvatarFileKey !== payload.avatar_file_key) {
      await uploadThingProvider.deleteFile(oldAvatarFileKey)
    }
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

