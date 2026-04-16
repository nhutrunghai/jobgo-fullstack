import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import env from '~/configs/env.config.js'
import RedisService from '~/configs/redis.config.js'
import { UserRole } from '~/constants/enum.js'
import { AdminAuthContext } from '~/models/adminAuthContext.js'

class AdminAuthService {
  private getSessionKey(sessionId: string) {
    return `${env.ADMIN_SESSION_PREFIX}:${sessionId}`
  }

  async createSession(payload: { userId: string; role: UserRole; ip?: string; userAgent?: string }) {
    const sessionId = crypto.randomBytes(32).toString('hex')
    const now = new Date().toISOString()

    const session: AdminAuthContext = {
      sessionId,
      userId: payload.userId,
      role: payload.role,
      loginAt: now,
      lastActivityAt: now,
      ip: payload.ip,
      userAgent: payload.userAgent
    }

    await RedisService.getInstance().set(
      this.getSessionKey(sessionId),
      JSON.stringify(session),
      'EX',
      env.ADMIN_SESSION_TTL
    )

    return session
  }

  async getSession(sessionId: string) {
    const raw = await RedisService.getInstance().get(this.getSessionKey(sessionId))
    if (!raw) return null
    return JSON.parse(raw) as AdminAuthContext
  }

  async deleteSession(sessionId: string) {
    await RedisService.getInstance().del(this.getSessionKey(sessionId))
  }

  async touchSession(session: AdminAuthContext) {
    const nextSession: AdminAuthContext = {
      ...session,
      lastActivityAt: new Date().toISOString()
    }

    await RedisService.getInstance().set(
      this.getSessionKey(session.sessionId),
      JSON.stringify(nextSession),
      'EX',
      env.ADMIN_SESSION_TTL
    )

    return nextSession
  }

  async getUserProfile(userId: string) {
    return databaseService.users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0
        }
      }
    )
  }
}

const adminAuthService = new AdminAuthService()

export default adminAuthService
