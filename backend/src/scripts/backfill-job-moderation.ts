import { ObjectId } from 'mongodb'
import databaseService from '~/configs/database.config.js'
import ElasticsearchConfig from '~/configs/elasticsearch.config.js'
import env from '~/configs/env.config.js'
import { publicJobsSearchSchema } from '~/configs/search.config.js'
import { JobModerationStatus } from '~/constants/enum.js'
import jobSearchService from '~/services/job-search.service.js'

async function backfillMongoJobs() {
  const result = await databaseService.jobs.updateMany(
    {
      moderation_status: { $exists: false }
    },
    {
      $set: {
        moderation_status: JobModerationStatus.ACTIVE
      }
    }
  )

  console.log(
    JSON.stringify({
      tag: 'backfill_job_moderation_mongo',
      matched: result.matchedCount,
      modified: result.modifiedCount
    })
  )
}

async function ensureElasticsearchMapping() {
  const client = ElasticsearchConfig.getInstance()

  await client.indices.putMapping({
    index: env.PUBLIC_JOBS_SEARCH_INDEX,
    properties: {
      moderation_status: publicJobsSearchSchema.moderation_status
    }
  })

  console.log(
    JSON.stringify({
      tag: 'backfill_job_moderation_es_mapping',
      index: env.PUBLIC_JOBS_SEARCH_INDEX,
      field: 'moderation_status'
    })
  )
}

async function reindexAllJobs() {
  const cursor = databaseService.jobs.find(
    {},
    {
      projection: {
        _id: 1
      }
    }
  )

  let processed = 0

  for await (const job of cursor) {
    await jobSearchService.upsertJobDocument(job._id as ObjectId)
    processed += 1
  }

  console.log(
    JSON.stringify({
      tag: 'backfill_job_moderation_reindex',
      processed
    })
  )
}

async function main() {
  await databaseService.connect()
  await backfillMongoJobs()
  await ensureElasticsearchMapping()
  await reindexAllJobs()
  process.exit(0)
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      tag: 'backfill_job_moderation_failed',
      error: error instanceof Error ? error.message : String(error)
    })
  )
  process.exit(1)
})
