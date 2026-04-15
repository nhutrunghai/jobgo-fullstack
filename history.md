# History

## 2026-04-15

### Semantic search branch recheck

- Current branch checked: `feature/semantic-job-search`.
- Found source-code mismatch:
  - Docker backend still had old search code loaded in memory.
  - Current source on the branch was missing public search route/controller/validator and `JobsService.searchPublicJobs`.
  - If backend restarted from that source, `/api/v1/jobs/search` would not be reliable.
- Restored public hybrid search source code:
  - `backend/src/services/job.service.ts`
  - `backend/src/controller/client/public-job.controller.ts`
  - `backend/src/routes/v1/client/jobs.router.ts`
  - `backend/src/validators/job.validator.ts`
- Added semantic fallback:
  - if local embedding / semantic search fails, search returns lexical Elasticsearch results instead of failing with 500.
  - fallback is logged with `public_jobs_semantic_search_failed`.

### Recheck results

- TypeScript build:
  - `npm run build` passed.
- Elasticsearch:
  - `public_jobs_search` index count: `201`.
- Gemini embedding API:
  - model: `gemini-embedding-001`
  - `768` dims benchmark:
    - `1678ms`
    - `343.57ms`
  - default `3072` dims benchmark:
    - `726.29ms`
    - `497.79ms`
  - conclusion: Gemini embedding API is working.
- Local self-hosted embedding API:
  - container reports running, but HTTP calls return `socket hang up` / closed connection.
  - Docker log/inspect/restart commands for the embedding container were unstable or timed out.
  - conclusion: local embedding runtime is not healthy in the current Docker state.
- Search source-level test:
  - tested by calling `jobsService.searchPublicJobs` directly from current source.
  - `nodejs backend`: returned `5` items, total `46`, around `299ms`, fallback true.
  - `vector search llm ranking`: returned `5` items, total `20`, around `71ms`, fallback true.
  - `toi muon tim viec frontend`: returned `5` items, total `60`, around `476ms`, fallback true.
  - conclusion: search now works from source due to lexical fallback, but semantic/local embedding path is currently failing until embedding-api is fixed/restarted cleanly.

### Docker/runtime retest

- Current branch rechecked: `feature/semantic-job-search`.
- Current worktree still contains local changes in semantic search / embedding related files and `history.md`.
- Docker services status:
  - `backend`: Up
  - `elasticsearch`: Up
  - `embedding-api`: Up
  - `redis`: Up
  - `kibana`: Up
- Backend startup resilience:
  - added Elasticsearch startup retry in `backend/src/configs/search.config.ts`.
  - backend now survives Elasticsearch slow-start and reaches `API listening on port 4000`.
- TypeScript build:
  - `npm run build` passed.

### Elasticsearch retest

- `GET http://localhost:9200` returned cluster info successfully.
- `GET http://localhost:9200/public_jobs_search/_count` returned `201`.
- conclusion: Elasticsearch index is healthy and reachable.

### Local embedding retest

- direct HTTP call to `POST http://localhost:8000/embeddings` with `{"texts":["nodejs backend"]}` returned successfully.
- returned payload reported:
  - model: `dangvantuan/vietnamese-document-embedding`
  - dimensions: `768`
  - vector returned successfully
- `npm run embedding:demo -- --provider=local --repeat=2 "nodejs backend"` did not complete in the local shell because `tsx/esbuild` failed with `spawn EPERM`.
- conclusion:
  - local embedding API itself is responding and returning 768-dim vectors.
  - the local CLI demo currently has an environment/shell execution issue (`spawn EPERM`), not a confirmed embedding-api failure.

### Gemini embedding retest

- `GEMINI_API_KEY` is present in `backend/.env`.
- `npm run embedding:demo -- --provider=gemini --repeat=3 --dims=768 "nodejs backend"`:
  - vector length: `768`
  - latency:
    - `680.47ms`
    - `373.89ms`
    - `373.67ms`
- `npm run embedding:demo -- --provider=gemini --repeat=3 "nodejs backend"`:
  - vector length: `3072`
  - latency:
    - `896.47ms`
    - `473.01ms`
    - `441.73ms`
- conclusion: Gemini embedding is working for both `768` dims and default `3072`.

### Search endpoint retest

- `GET /api/v1/jobs/search?q=nodejs%20backend&page=1&limit=5`
  - HTTP `200`
  - returned `5` items
  - pagination total: `99`
- `GET /api/v1/jobs/search?q=vector%20search%20llm%20ranking&page=1&limit=5`
  - HTTP `200`
  - returned `5` items
  - pagination total: `20`
- `GET /api/v1/jobs/search?q=toi%20muon%20tim%20viec%20frontend&page=1&limit=5`
  - HTTP `200`
  - returned `5` items
  - pagination total: `60`
- sample titles looked relevant:
  - `Backend Developer`, `Node.js Backend Engineer ...`
  - `AI Product Engineer ...`
  - `Vue Frontend Developer ...`
- backend log timing samples:
  - `vector search llm ranking`: `embedding_ms=1648.42`, `total_ms=2256.72`, `semantic_fallback=false`
  - `toi muon tim viec frontend`: `embedding_ms=3736.75`, `total_ms=3939.31`, `semantic_fallback=false`
  - `nodejs backend`: `embedding_ms=5054.49`, `total_ms=5226.5`, `semantic_fallback=false`
- conclusion: search endpoint is working over HTTP and semantic search is running for real, not lexical fallback.

### Remaining issue

- unresolved issue:
  - local CLI command `npm run embedding:demo -- --provider=local ...` fails in the current local shell with `spawn EPERM`.
- this is separate from the embedding HTTP API, which is returning vectors correctly.
