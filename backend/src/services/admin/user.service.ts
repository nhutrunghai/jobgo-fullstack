import _ from 'lodash'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import { UserRole, UserStatus } from '~/constants/enum.js'

class AdminUserService {
  async getUsers({
    role,
    status,
    keyword,
    page,
    limit
  }: {
    role?: UserRole
    status?: UserStatus
    keyword?: string
    page: number
    limit: number
  }) {
    const query: {
      role?: UserRole
      status?: UserStatus
      $or?: Array<{
        email?: { $regex: string; $options: string }
        username?: { $regex: string; $options: string }
        fullName?: { $regex: string; $options: string }
      }>
    } = {}

    if (role !== undefined) {
      query.role = role
    }

    if (status !== undefined) {
      query.status = status
    }

    if (keyword) {
      const escapedKeyword = _.escapeRegExp(keyword)

      query.$or = [
        { email: { $regex: escapedKeyword, $options: 'i' } },
        { username: { $regex: escapedKeyword, $options: 'i' } },
        { fullName: { $regex: escapedKeyword, $options: 'i' } }
      ]
    }

    const [users, total] = await Promise.all([
      databaseService.users
        .find(query, {
          projection: {
            password: 0
          }
        })
        .sort({ updated_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      databaseService.users.countDocuments(query)
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  async updateUserStatus(userId: ObjectId, status: UserStatus) {
    return databaseService.users.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          status,
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0
        }
      }
    )
  }
}

const adminUserService = new AdminUserService()

export default adminUserService
