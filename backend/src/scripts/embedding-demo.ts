import 'dotenv/config'
import { performance } from 'node:perf_hooks'
import {
  GEMINI_EMBEDDING_MODEL_NAME,
  LOCAL_EMBEDDING_MODEL,
  generateGeminiEmbedding,
  generateLocalEmbedding
} from '../services/embedding.service'

const args = process.argv.slice(2)
const providerArg = args.find((arg) => arg.startsWith('--provider=')) || '--provider=local'
const repeatArg = args.find((arg) => arg.startsWith('--repeat=')) || '--repeat=1'
const dimsArg = args.find((arg) => arg.startsWith('--dims='))
const text = args
  .filter((arg) => !arg.startsWith('--'))
  .join(' ')
  .trim() || 'Toi muon tim mot cong viec backend o Ha Noi'

const provider = providerArg.split('=')[1]
const repeat = Math.max(1, Number(repeatArg.split('=')[1] || 1))
const outputDimensionality = dimsArg ? Number(dimsArg.split('=')[1]) : undefined

const benchmark = async (
  label: string,
  fn: () => Promise<number[]>
) => {
  const elapsedMsList: number[] = []
  let vector: number[] = []

  for (let attempt = 1; attempt <= repeat; attempt += 1) {
    const startedAt = performance.now()
    vector = await fn()
    const elapsedMs = performance.now() - startedAt
    elapsedMsList.push(Number(elapsedMs.toFixed(2)))
    console.log(`[${label}] attempt ${attempt}: ${elapsedMs.toFixed(2)}ms`)
  }

  console.log(`[${label}] vector length:`, vector.length)
  console.log(`[${label}] first 12 values:`, vector.slice(0, 12))
  console.log(`[${label}] elapsed ms list:`, elapsedMsList)
}

const main = async () => {
  console.log('Input text:', text)

  if (provider === 'local') {
    console.log('Embedding model:', LOCAL_EMBEDDING_MODEL)
    await benchmark('local', () => generateLocalEmbedding(text))
    return
  }

  if (provider === 'gemini') {
    console.log('Embedding model:', GEMINI_EMBEDDING_MODEL_NAME)
    console.log('Output dimensionality:', outputDimensionality ?? 'default')
    await benchmark('gemini', () => generateGeminiEmbedding(text, { outputDimensionality }))
    return
  }

  throw new Error(`Unsupported provider: ${provider}`)
}

main().catch((error) => {
  console.error('Embedding demo failed:', error)
  process.exit(1)
})
