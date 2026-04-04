import { Redis, RedisOptions } from 'ioredis'
import env from './env.config.js'

class RedisService {
  private static instance: Redis
  private static readonly REDIS_RETRY_DELAY = 2000
  private constructor() {}

  public static getInstance(): Redis {
    if (!this.instance) {
      const redisOptions: RedisOptions = {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        retryStrategy(times) {
          console.log(`🔄 Redis reconnecting: attempt ${times}`)
          return Math.min(times * 50, RedisService.REDIS_RETRY_DELAY)
        },
        maxRetriesPerRequest: null
      }
      this.instance = new Redis(redisOptions)
      this.instance.on('connect', () => {
        console.log('🚀 Redis: Connected to server');
      })

      this.instance.on('error', (err) => {
        console.error('❌ Redis: Connection error:', err.message)
      })

      this.instance.on('ready', () => {
        console.log('✅ Redis: Ready to use');
      })
    }

    return this.instance
  }
  public static async closeConnection(): Promise<void> {
    if (this.instance) {
      await this.instance.quit()
      console.log('💤 Redis: Connection closed')
    }
  }
}

export default RedisService

/*1 số lượng ích của việc (I) export class , thay vì (II) tạo đối tượng rồi mới export như databaseServices
Cách (II) cũng rất phổ biến nhưng nó phù hợp với hệ thống nhỏ muốn triển khai nhanh vì vậy hãy xem qua
1 số lợi ích của cách (I) vượt trội hơn 
1. Kiểm soát thời điểm kết nối (Lazy Initialization)
Cách Export Đối tượng: Khi bạn vừa import file đó vào ứng dụng, Node.js sẽ thực thi code và kết nối tới Redis ngay lập tức. Nếu lúc đó các biến môi trường (.env) chưa kịp load hoặc Database chưa sẵn sàng, ứng dụng có thể bị crash ngay khi vừa khởi động.

Cách dùng getInstance(): Kết nối chỉ thực sự được tạo ra vào lúc bạn gọi nó lần đầu tiên. Điều này giúp bạn kiểm soát thứ tự khởi chạy của các dịch vụ trong hệ thống tốt hơn.

2. Tránh lỗi khi Testing (Unit Test)
Đây là lý do quan trọng nhất đối với các lập trình viên chuyên nghiệp:

Khi viết Unit Test, bạn thường muốn thay thế Redis thật bằng một đối tượng giả (Mock Redis) để không phải bật server Redis lên.

Nếu bạn export default new Redis(), đối tượng đó bị "đóng băng" (hard-coded) ngay khi chạy test, rất khó để thay thế.

Với Class, bạn có thể dễ dàng can thiệp hoặc reset instance giữa các bài test khác nhau.
*/