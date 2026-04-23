import { ClientSession, Collection, CreateIndexesOptions, Db, IndexSpecification, MongoClient } from 'mongodb'
import env from './env.config.js'
import Company from '~/models/schema/client/companies.schema.js'
import FavoriteJob from '~/models/schema/client/favoriteJobs.schema.js'
import JobApplication from '~/models/schema/client/jobApplications.schema.js'
import Job from '~/models/schema/client/jobs.schema.js'
import JobPromotion from '~/models/schema/client/jobPromotions.schema.js'
import OtpCode from '~/models/schema/client/otpCodes.schema.js'
import Resume from '~/models/schema/client/resumes.schema.js'
import RefreshToken from '~/models/schema/client/refreshTokens.schema.js'
import User from '~/models/schema/client/user.schema.js'
import ChatSession from '~/models/schema/client/chatSessions.schema.js'
import Wallet from '~/models/schema/client/wallets.schema.js'
import WalletTopUpOrder from '~/models/schema/client/walletTopUpOrders.schema.js'
import WalletTransaction from '~/models/schema/client/walletTransactions.schema.js'
import Notification from '~/models/schema/client/notifications.schema.js'
import AdminAuditLog from '~/models/schema/adminAuditLogs.schema.js'
import SystemSetting from '~/models/schema/systemSettings.schema.js'

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(env.DB_URL, { ignoreUndefined: true })
    this.db = this.client.db(env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Connected successfully to MongoDB')
      await this.setIndexTTL()
      await this.setupIndexes()
    } catch (error) {
      console.log('Connection error:', error)
      throw error
    }
  }

  async setIndexTTL() {
    const ttlIndexes = [
      { collection: env.DB_REFRESH_TOKEN_NAME, field: 'expires_at' },
      { collection: env.DB_OTP_CODE_NAME, field: 'expires_at' }
    ]

    for (const item of ttlIndexes) {
      const indexName = `${item.field}_ttl`
      const collection = this.db.collection(item.collection)
      const exists = await collection.indexExists(indexName).catch(() => false)

      if (!exists) {
        await collection.createIndex({ [item.field]: 1 }, { expireAfterSeconds: 0, name: indexName })
      }
    }

    console.log('All TTL indexes initialized.')
  }

  private async setupIndexes() {
    const indexes: Array<{
      collection: string
      key: IndexSpecification
      option: CreateIndexesOptions & { name: string }
    }> = [
      {
        collection: env.DB_USER_NAME,
        key: { email: 1 },
        option: { unique: true, name: 'email', collation: { locale: 'en', strength: 2 } }
      },
      {
        collection: env.DB_USER_NAME,
        key: { username: 1 },
        option: { unique: true, name: 'username' }
      },
      {
        collection: env.DB_REFRESH_TOKEN_NAME,
        key: { user_id: 1, jti: 1 },
        option: { unique: true, name: 'jti_user_id' }
      },
      {
        collection: env.DB_OTP_CODE_NAME,
        key: { code: 1 },
        option: { unique: true, name: 'code' }
      },
      {
        collection: env.DB_OTP_CODE_NAME,
        key: { user_id: 1 },
        option: { name: 'user_id' }
      },
      {
        collection: env.DB_JOB_NAME,
        key: { company_id: 1, updated_at: -1 },
        option: { name: 'company_id_updated_at' }
      },
      {
        collection: env.DB_JOB_NAME,
        key: { company_id: 1, status: 1, updated_at: -1 },
        option: { name: 'company_id_status_updated_at' }
      },
      {
        collection: env.DB_JOB_NAME,
        key: { moderation_status: 1, updated_at: -1 },
        option: { name: 'moderation_status_updated_at' }
      },
      {
        collection: env.DB_JOB_NAME,
        key: { status: 1, moderation_status: 1, expired_at: 1 },
        option: { name: 'status_moderation_status_expired_at' }
      },
      {
        collection: env.DB_JOB_NAME,
        key: { status: 1, expired_at: 1 },
        option: { name: 'status_expired_at' }
      },
      {
        collection: env.DB_JOB_NAME,
        key: { status: 1, updated_at: -1 },
        option: { name: 'status_updated_at' }
      },
      {
        collection: env.DB_JOB_PROMOTION_NAME,
        key: { type: 1, status: 1, starts_at: 1, ends_at: 1, priority: -1 },
        option: { name: 'type_status_time_priority' }
      },
      {
        collection: env.DB_JOB_PROMOTION_NAME,
        key: { company_id: 1, created_at: -1 },
        option: { name: 'company_id_created_at' }
      },
      {
        collection: env.DB_JOB_PROMOTION_NAME,
        key: { job_id: 1, type: 1, status: 1, ends_at: -1 },
        option: { name: 'job_type_status_ends_at' }
      },
      {
        collection: env.DB_WALLET_NAME,
        key: { user_id: 1 },
        option: { unique: true, name: 'user_id_unique' }
      },
      {
        collection: env.DB_WALLET_TRANSACTION_NAME,
        key: { user_id: 1, created_at: -1 },
        option: { name: 'user_id_created_at' }
      },
      {
        collection: env.DB_WALLET_TRANSACTION_NAME,
        key: { wallet_id: 1, created_at: -1 },
        option: { name: 'wallet_id_created_at' }
      },
      {
        collection: env.DB_WALLET_TRANSACTION_NAME,
        key: { reference_type: 1, reference_id: 1 },
        option: { unique: true, name: 'reference_type_reference_id' }
      },
      {
        collection: env.DB_WALLET_TOPUP_ORDER_NAME,
        key: { order_code: 1 },
        option: { unique: true, name: 'order_code_unique' }
      },
      {
        collection: env.DB_WALLET_TOPUP_ORDER_NAME,
        key: { user_id: 1, created_at: -1 },
        option: { name: 'user_id_created_at_topup_order' }
      },
      {
        collection: env.DB_WALLET_TOPUP_ORDER_NAME,
        key: { status: 1, created_at: -1 },
        option: { name: 'status_created_at_topup_order' }
      },
      {
        collection: env.DB_WALLET_TOPUP_ORDER_NAME,
        key: { provider_transaction_id: 1 },
        option: {
          unique: true,
          name: 'provider_transaction_id_unique',
          partialFilterExpression: {
            provider_transaction_id: { $exists: true }
          }
        }
      },
      {
        collection: env.DB_NOTIFICATION_NAME,
        key: { user_id: 1, is_read: 1, created_at: -1 },
        option: { name: 'user_id_is_read_created_at_notification' }
      },
      {
        collection: env.DB_NOTIFICATION_NAME,
        key: { user_id: 1, created_at: -1 },
        option: { name: 'user_id_created_at_notification' }
      },
      {
        collection: env.DB_ADMIN_AUDIT_LOG_NAME,
        key: { admin_id: 1, created_at: -1 },
        option: { name: 'admin_id_created_at_audit_log' }
      },
      {
        collection: env.DB_ADMIN_AUDIT_LOG_NAME,
        key: { action: 1, created_at: -1 },
        option: { name: 'action_created_at_audit_log' }
      },
      {
        collection: env.DB_ADMIN_AUDIT_LOG_NAME,
        key: { target_type: 1, target_id: 1, created_at: -1 },
        option: { name: 'target_created_at_audit_log' }
      },
      {
        collection: env.DB_ADMIN_AUDIT_LOG_NAME,
        key: { created_at: -1 },
        option: { name: 'created_at_audit_log' }
      },
      {
        collection: env.DB_SYSTEM_SETTING_NAME,
        key: { key: 1 },
        option: { unique: true, name: 'key_unique_system_setting' }
      },
      {
        collection: env.DB_FAVORITE_JOB_NAME,
        key: { user_id: 1, job_id: 1 },
        option: { unique: true, name: 'user_id_job_id_unique' }
      },
      {
        collection: env.DB_FAVORITE_JOB_NAME,
        key: { user_id: 1, created_at: -1 },
        option: { name: 'user_id_created_at' }
      },
      {
        collection: env.DB_FAVORITE_JOB_NAME,
        key: { job_id: 1 },
        option: { name: 'job_id' }
      },
      {
        collection: env.DB_RESUME_NAME,
        key: { candidate_id: 1, updated_at: -1 },
        option: { name: 'candidate_id_updated_at' }
      },
      {
        collection: env.DB_RESUME_NAME,
        key: { candidate_id: 1, is_default: 1 },
        option: { name: 'candidate_id_is_default' }
      },
      {
        collection: env.DB_RESUME_NAME,
        key: { candidate_id: 1, is_default: 1 },
        option: {
          name: 'candidate_default_active_unique',
          unique: true,
          partialFilterExpression: {
            is_default: true,
            status: 'active'
          }
        }
      },
      {
        collection: env.DB_JOB_APPLICATION_NAME,
        key: { job_id: 1, candidate_id: 1 },
        option: { unique: true, name: 'job_id_candidate_id' }
      },
      {
        collection: env.DB_JOB_APPLICATION_NAME,
        key: { job_id: 1, status: 1, applied_at: -1 },
        option: { name: 'job_id_status_applied_at' }
      },
      {
        collection: env.DB_JOB_APPLICATION_NAME,
        key: { company_id: 1, status: 1, applied_at: -1 },
        option: { name: 'company_id_status_applied_at' }
      },
      {
        collection: env.DB_JOB_APPLICATION_NAME,
        key: { candidate_id: 1, applied_at: -1 },
        option: { name: 'candidate_id_applied_at' }
      },
      {
        collection: env.DB_CHAT_SESSION_NAME,
        key: { user_id: 1, updated_at: -1 },
        option: { name: 'user_id_updated_at' }
      }
    ]

    for (const item of indexes) {
      const collection = this.db.collection(item.collection)
      const exists = await collection.indexExists(item.option.name).catch(() => false)

      if (!exists) {
        await collection.createIndex(item.key, item.option)
        console.log(`Created index: ${item.option.name}`)
      }
    }

    console.log('Indexes initialized.')
  }

  get users(): Collection<User> {
    return this.db.collection(env.DB_USER_NAME)
  }

  get companies(): Collection<Company> {
    return this.db.collection(env.DB_COMPANY_NAME)
  }

  get jobs(): Collection<Job> {
    return this.db.collection(env.DB_JOB_NAME)
  }

  get jobPromotions(): Collection<JobPromotion> {
    return this.db.collection(env.DB_JOB_PROMOTION_NAME)
  }

  get wallets(): Collection<Wallet> {
    return this.db.collection(env.DB_WALLET_NAME)
  }

  get walletTransactions(): Collection<WalletTransaction> {
    return this.db.collection(env.DB_WALLET_TRANSACTION_NAME)
  }

  get walletTopUpOrders(): Collection<WalletTopUpOrder> {
    return this.db.collection(env.DB_WALLET_TOPUP_ORDER_NAME)
  }

  get notifications(): Collection<Notification> {
    return this.db.collection(env.DB_NOTIFICATION_NAME)
  }

  get adminAuditLogs(): Collection<AdminAuditLog> {
    return this.db.collection(env.DB_ADMIN_AUDIT_LOG_NAME)
  }

  get systemSettings(): Collection<SystemSetting> {
    return this.db.collection(env.DB_SYSTEM_SETTING_NAME)
  }

  get favoriteJobs(): Collection<FavoriteJob> {
    return this.db.collection(env.DB_FAVORITE_JOB_NAME)
  }

  get resumes(): Collection<Resume> {
    return this.db.collection(env.DB_RESUME_NAME)
  }

  get jobApplications(): Collection<JobApplication> {
    return this.db.collection(env.DB_JOB_APPLICATION_NAME)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(env.DB_REFRESH_TOKEN_NAME)
  }

  get otpCodes(): Collection<OtpCode> {
    return this.db.collection(env.DB_OTP_CODE_NAME)
  }

  get chatSessions(): Collection<ChatSession> {
    return this.db.collection(env.DB_CHAT_SESSION_NAME)
  }

  async withTransaction<T>(callback: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = this.client.startSession()

    try {
      return await session.withTransaction(() => callback(session))
    } finally {
      await session.endSession()
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService

