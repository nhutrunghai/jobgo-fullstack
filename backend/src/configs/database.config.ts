import { Collection, CreateIndexesOptions, Db, IndexSpecification, MongoClient } from 'mongodb'
import env from './env.config.js'
import Company from '~/models/schema/companies.schema.js'
import JobApplication from '~/models/schema/jobApplications.schema.js'
import Job from '~/models/schema/jobs.schena.js'
import OtpCode from '~/models/schema/otpCodes.schema.js'
import Resume from '~/models/schema/resumes.schema.js'
import RefreshToken from '~/models/schema/refreshTokens.schema.js'
import User from '~/models/schema/user.schema.js'

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
        key: { status: 1, expired_at: 1 },
        option: { name: 'status_expired_at' }
      },
      {
        collection: env.DB_JOB_NAME,
        key: { status: 1, updated_at: -1 },
        option: { name: 'status_updated_at' }
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
}

const databaseService = new DatabaseService()
export default databaseService
