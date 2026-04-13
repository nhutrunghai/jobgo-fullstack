## Todo

### Feature: semantic-job-search

#### Muc tieu

- [ ] Xay dung semantic search cho job public tren JobGo
- [ ] Su dung model da co qua `embedding-api`
- [ ] Dung Elasticsearch lam search index
- [ ] Ho tro hybrid search: lexical + semantic
- [ ] Khong thay MongoDB lam source of truth

#### Phase 1: Search Architecture

- [ ] Chot search architecture
  - MongoDB la source of truth cho jobs
  - Elasticsearch la read model cho search
  - `embedding-api` sinh vector cho job va query
  - Backend la noi dieu phoi indexing va search

- [ ] Xac dinh document search cho job
  - `job_id`
  - `company_id`
  - `title`
  - `description`
  - `requirements`
  - `benefits`
  - `location`
  - `job_type`
  - `level`
  - `category`
  - `skills`
  - `status`
  - `published_at`
  - `expired_at`
  - `search_text`
  - `embedding`

- [ ] Chot dieu kien job duoc index
  - `status = OPEN`
  - `published_at != null`
  - `expired_at > now`

#### Phase 2: Elasticsearch Index

- [ ] Tao index Elasticsearch cho public jobs
  - Mapping cho cac field text
  - Mapping cho cac field keyword/filter
  - Mapping cho `embedding` dang dense vector

- [ ] Chot ten index
  - Goi y: `public_jobs_search`

- [ ] Xay dung ham khoi tao index neu chua ton tai
  - Dat trong service/config search rieng
  - Goi khi app boot hoac trong script setup

- [ ] Chot analyzer neu can
  - Ban dau co the dung analyzer mac dinh
  - Phase sau moi toi uu cho tieng Viet neu can

#### Phase 3: Embedding Strategy

- [ ] Chot noi dung text dung de embed job
  - `title`
  - `category`
  - `skills`
  - `location`
  - `level`
  - `job_type`
  - `description`
  - `requirements`
  - `benefits`

- [ ] Tao quy tac build `search_text`
  - Ghep text theo thu tu co y nghia
  - Loai bo khoang trang du
  - Bo qua field rong

- [ ] Chot cach embed query search
  - Dung chinh model dang dung cho job
  - Trim query
  - Chan query rong

- [ ] Xu ly loi embedding API
  - Timeout
  - Invalid response
  - Retry neu can
  - Log ro de debug

#### Phase 4: Indexing Flow

- [ ] Tao `job-search-index.service.ts`
  - `buildSearchDocument(job)`
  - `upsertJobDocument(jobId)`
  - `deleteJobDocument(jobId)`
  - `reindexJob(jobId)`

- [ ] Tao logic lay them company data neu can cho search result
  - Company name
  - Company logo
  - Company website

- [ ] Hook indexing vao create job
  - Tao job xong thi kiem tra co du dieu kien index khong
  - Neu du dieu kien thi upsert qua Elasticsearch

- [ ] Hook indexing vao update job
  - Khi doi `title`
  - Khi doi `description`
  - Khi doi `requirements`
  - Khi doi `benefits`
  - Khi doi `location`
  - Khi doi `job_type`
  - Khi doi `level`
  - Khi doi `category`
  - Khi doi `skills`
  - Khi doi `expired_at`

- [ ] Hook indexing vao publish/unpublish
  - Job publish thi index
  - Job khong con public thi remove hoac mark out of search

- [ ] Hook indexing vao expire/close job
  - Job het han hoac close khong duoc xuat hien trong ket qua

- [ ] Chot chien luoc ban dau
  - Ban dau cho phep indexing dong bo ngay trong request
  - Phase sau moi tach queue neu can

#### Phase 5: Full Reindex

- [ ] Tao script reindex toan bo jobs cu tu MongoDB sang Elasticsearch
  - Duyet tat ca jobs
  - Chi index jobs public hop le
  - Batch theo lo
  - Log so luong thanh cong / that bai

- [ ] Tao script xoa va tao lai index khi can
  - Dung cho local/dev
  - Can can nhac khi dung tren production

- [ ] Co cach chay lai index sau khi doi mapping

#### Phase 6: Public Search API

- [ ] Them endpoint search public jobs
  - Goi y: `GET /api/v1/client/jobs/search`

- [ ] Tao validator cho search query
  - `q`
  - `page`
  - `limit`
  - `location` neu co
  - `job_type` neu co
  - `level` neu co
  - `category` neu co
  - `skills` neu co

- [ ] Tao controller cho public job search
  - Nhan query params
  - Goi search service
  - Tra response co pagination

- [ ] Tao `public-job-search.service.ts`
  - Normalize query
  - Embed query
  - Goi Elasticsearch
  - Merge/rerank
  - Tra ket qua

#### Phase 7: Retrieval Strategy

- [ ] Trien khai lexical retrieval
  - `multi_match` tren `title`
  - `skills`
  - `category`
  - `description`
  - `requirements`

- [ ] Trien khai semantic retrieval
  - `knn` neu mapping/phien ban ho tro
  - Neu khong thi dung `script_score` voi cosine similarity

- [ ] Trien khai hybrid retrieval
  - Lay top lexical
  - Lay top semantic
  - Hop nhat candidate set

- [ ] Trien khai filter cứng truoc ranking
  - Chi lay job `OPEN`
  - Chi lay job da `published`
  - Chi lay job chua `expired`
  - Apply them filter nguoi dung chon

#### Phase 8: Ranking

- [ ] Tao cong thuc score ban dau
  - `semantic_score`
  - `lexical_score`
  - Score cuoi: vi du `0.6 * semantic + 0.4 * lexical`

- [ ] Them boost cho exact match
  - Boost neu query match `title`
  - Boost neu query match `skills`

- [ ] Them boost cho filter quan trong
  - `location`
  - `level`
  - `job_type`

- [ ] Chot top-k
  - BM25 top 100
  - Semantic top 100
  - Rerank va tra top theo `page/limit`

- [ ] Can nhac debug field trong response dev
  - `semantic_score`
  - `lexical_score`
  - `final_score`

#### Phase 9: Response Shape

- [ ] Chot response cua search API
  - `job`
  - `company`
  - score neu can
  - pagination

- [ ] Dam bao response giong phong cach public job detail hien tai
  - De UI de dung lai component

- [ ] Chi tra field can thiet cho listing
  - `_id`
  - `title`
  - `location`
  - `job_type`
  - `level`
  - `skills`
  - `salary`
  - `expired_at`
  - company basic info

#### Phase 10: Operational Rules

- [ ] Them log cho indexing
  - Job nao duoc index
  - Job nao bi skip
  - Loi embedding
  - Loi Elasticsearch

- [ ] Them log cho search request
  - Query
  - Latency embedding
  - Latency search
  - So candidate tim duoc

- [ ] Chot fallback neu semantic loi
  - Neu embedding query loi, co the fallback lexical only

- [ ] Chot fallback neu Elasticsearch loi
  - Tra loi he thong
  - Hoac fallback tam thoi ve Mongo regex search neu muon

#### Phase 11: Testing

- [ ] Test `embedding.service`
  - Text rong
  - Response sai shape
  - Timeout

- [ ] Test `job-search-index.service`
  - Build dung `search_text`
  - Skip job khong public
  - Upsert dung document
  - Delete dung document

- [ ] Test search validator
  - `q` rong
  - `page` nho hon 1
  - `limit` vuot nguong

- [ ] Test public search service
  - Query hop le
  - Hybrid merge dung
  - Pagination dung
  - Filter dung

- [ ] Test E2E cho public search endpoint
  - Search theo keyword ro rang
  - Search theo y nghia
  - Search co filter
  - Khong tra job da het han
  - Khong tra job chua publish

#### Phase 12: Postman

- [ ] Them request Postman cho:
  - Public job search
  - Reindex all jobs neu tao internal endpoint/script wrapper
  - Health check embedding API

- [ ] Viet sample query
  - `backend nodejs`
  - `thuc tap marketing`
  - `viec lam remote react`

#### Phase 13: Phase Sau

- [ ] Search suggestions / autocomplete
- [ ] Luu search history cua candidate
- [ ] Popular queries analytics
- [ ] Personalized ranking theo CV user
- [ ] Semantic matching giua CV va job
- [ ] Re-rank nang cao bang model khac neu can

### Thu tu uu tien

1. Tao mapping va index Elasticsearch cho `public_jobs_search`
2. Tao `job-search-index.service.ts`
3. Hook reindex vao create/update/publish job
4. Tao script reindex toan bo jobs cu
5. Them `GET /api/v1/client/jobs/search`
6. Trien khai hybrid retrieval
7. Trien khai reranking co trong so
8. Test + Postman

## Roadmap implementation semantic-job-search

### Checklist thuc thi

- [ ] Tao index Elasticsearch `public_jobs_search`
- [ ] Dinh nghia mapping cho field text, filter va `embedding`
- [ ] Chot `dims` cua `embedding` theo model trong `embedding-api`
- [ ] Chot search document cho 1 job public
- [ ] Viet rule build `search_text` tu `title`, `skills`, `category`, `location`, `description`, `requirements`, `benefits`
- [ ] Chot dieu kien job duoc index: `OPEN`, da publish, chua expired
- [ ] Tao `job-search-index.service.ts`
- [ ] Trien khai `buildSearchDocument(job)`
- [ ] Trien khai `upsertJobDocument(jobId)`
- [ ] Trien khai `deleteJobDocument(jobId)`
- [ ] Trien khai `reindexJob(jobId)`
- [ ] Goi `embedding-api` de sinh vector cho job truoc khi upsert Elasticsearch
- [ ] Hook indexing vao create job
- [ ] Hook indexing vao update job khi thay doi cac field anh huong den search
- [ ] Hook indexing vao publish/unpublish job
- [ ] Hook indexing vao expire/close job
- [ ] Tao script reindex toan bo jobs cu tu MongoDB sang Elasticsearch
- [ ] Reindex theo batch va co log thanh cong / that bai
- [ ] Tao endpoint `GET /api/v1/client/jobs/search`
- [ ] Tao validator cho `q`, `page`, `limit`, `location`, `job_type`, `level`, `category`, `skills`
- [ ] Tao `public-job-search.service.ts`
- [ ] Trien khai lexical retrieval bang `multi_match`
- [ ] Trien khai semantic retrieval bang `knn`
- [ ] Gop candidate tu lexical va semantic
- [ ] Ap filter cung: `OPEN`, da publish, chua expired
- [ ] Tinh `semantic_score`
- [ ] Tinh `lexical_score`
- [ ] Tinh `final_score`, vi du `0.6 * semantic + 0.4 * lexical`
- [ ] Sort lai ket qua va paginate
- [ ] Chot response shape cho listing job + company basic info
- [ ] Them logging cho indexing, embedding, Elasticsearch va search latency
- [ ] Fallback lexical-only neu semantic search loi
- [ ] Viet unit test cho embedding service, index service, validator, search service
- [ ] Viet E2E test cho public search endpoint
- [ ] Them Postman request cho public search, reindex va health check embedding API

### Thu tu lam viec de code ngay

1. Tao mapping va index Elasticsearch
2. Tao `job-search-index.service.ts`
3. Hook indexing vao create/update/publish/unpublish/expire
4. Tao script reindex jobs cu
5. Tao `GET /api/v1/client/jobs/search`
6. Them hybrid retrieval: `multi_match` + `knn`
7. Them reranking bang `final_score`
8. Them test va Postman

## 8. Một sơ đồ cực ngắn để nhớ

86 -
87 -### Semantic search
88 -
89 -query -> embedding -> vector search -> top results
90 -
91 -### RAG
92 -
93 -query -> retrieval -> context -> LLM -> final answer
94 -
95 -Nếu retrieval của RAG dùng vector search, thì semantic search chính là một thành phần bên trong RAG.
