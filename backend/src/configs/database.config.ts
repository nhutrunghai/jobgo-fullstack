import { MongoClient, Db, Collection, CreateIndexesOptions, IndexSpecification } from 'mongodb'
import RefreshToken from '~/models/schema/refreshTokens.schema.js'
import User from '~/models/schema/user.schema.js'
import env from './env.config.js'
import OtpCode from '~/models/schema/otpCodes.schema.js'

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
      console.log('✅ Connected successfully to MongoDB')
      await this.setIndexTTL()
      await this.setupIndexes()
    } catch (error) {
      console.log('❌ Connection error:', error)
      throw error
    }
  }
  get users(): Collection<User> {
    return this.db.collection(env.DB_USER_NAME)
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
    console.log('✅ All Database Indexes initialized.')
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
        option: { unique: true, name: 'user_id' }
      }
    ]
    for (const item of indexes) {
      const collection = this.db.collection(item.collection)
      const exists = await collection.indexExists(item.option.name)
      if (!exists) {
        await collection.createIndex(item.key, item.option)
        console.log('✅ Indexes created.')
        return
      }
    }
    console.log('✅ Indexes already exist.')
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
