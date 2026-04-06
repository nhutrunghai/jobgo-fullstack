import { Client } from '@elastic/elasticsearch'
import env from './env.config'

class ElasticsearchConfig {
  private static instance: Client
  private constructor() {
    //
  }
  public static getInstance(): Client {
    if (!this.instance) {
      this.instance = new Client({
        node: env.ELASTICSEARCH_URL
      })
    }
    return this.instance
  }
}
export default ElasticsearchConfig
