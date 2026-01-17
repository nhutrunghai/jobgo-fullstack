import { Db, MongoClient } from "mongodb"

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(process.env.DB_URL as string)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('✅ Connected successfully to MongoDB')
    } catch (error) {
      console.log('❌ Connection error:', error)
      throw error
    }
  }
}
const databaseService = new DatabaseService()
export default databaseService