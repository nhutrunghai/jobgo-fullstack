import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
class UserService {
  async findUser(key: string, value: string | ObjectId) {
    return await databaseService.users.findOne({ [key]: value })
  }
}
const userService = new UserService()
export default userService
