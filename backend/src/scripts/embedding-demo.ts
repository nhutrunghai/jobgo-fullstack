import { EMBEDDING_MODEL, generateEmbedding } from '../services/embedding.service'

const text = process.argv.slice(2).join(' ').trim() || 'Tôi muốn tìm một công việc backend ở Hà Nội'

const main = async () => {
  console.log('Embedding model:', EMBEDDING_MODEL)
  console.log('Input text:', text)

  const vector = await generateEmbedding(text)

  console.log('Vector length:', vector.length)
  console.log('First 12 values:', vector.slice(0, 12))
}

main().catch((error) => {
  console.error('Embedding demo failed:', error)
  process.exit(1)
})
