# History Chat

## Branch dang lam viec

- `feature/rag-chatbot`

## Muc tieu phase 1 da chot

- Xay dung `RAG chatbot` cho JobGo theo huong tap trung vao `job` truoc.
- Van dung `intent routing`.
- Co `citation/source` ngay tu phase 1.
- Chua lam `knowledge_qa` trong phase 1, nhung kien truc co de san de mo rong sau.
- Khong dung LangChain o phase 1.
- Ban dau dung Gemini, sau do da bo sung kha nang switch sang OpenAI bang bien moi truong.

## Kien truc phase 1 da chot

Flow tong:

1. `User message`
2. `Load/Create session`
3. `Intent routing`
4. `Query understanding`
5. `Intent dispatch`
6. `Job retrieval`
7. `Context assembly`
8. `LLM answer generation`
9. `Build citation/source`
10. `Save session + logs`
11. `Return response`

So do ngan:

```text
User message
-> Load/Create session
-> Intent routing
-> Query understanding
-> Intent dispatch
-> Job retrieval
-> Context assembly
-> LLM answer generation
-> Build citation/source
-> Save session + logs
-> Return response
```

## Intent set hien tai

- `job_search`
- `job_explanation`
- `cv_review`
- `policy_qa`
- `unsupported`

Y nghia:

- `job_search`: user muon tim job, goi y job, loc job, tim viec phu hop
- `job_explanation`: user hoi tiep ve cac job da co, muon giai thich, so sanh, danh gia
- `cv_review`: nhan dien nhu cau danh gia CV, hien tai tra fallback message mac dinh
- `policy_qa`: nhan dien cau hoi ve luat/quy dinh/tai lieu kien thuc, hien tai tra fallback message mac dinh
- `unsupported`: cau hoi ngoai pham vi chatbot hien tai, tra fallback message mac dinh

## Citation/source da chot

Tra ve source o muc co ban:

- `type`
- `job_id`
- `title`
- `company`

Muc tieu:

- biet chatbot dua vao job nao de tra loi
- de click sang chi tiet job sau nay
- de debug answer sai

## Cau hinh LLM hien tai

He thong da ho tro 2 provider va chuyen provider bang bien:

```env
LLM_PROVIDER=gemini|openai
```

Bien model dung chung:

```env
LLM_MODEL_INTENT
LLM_MODEL_CHAT
```

Gemini van duoc giu lai. OpenAI da duoc them vao voi:

```env
OPENAI_MODEL_INTENT=gpt-4o-mini
OPENAI_MODEL_CHAT=gpt-4o-mini
```

## Huong implement da chot

Thuc hien theo 7 nhom, lam tuan tu:

1. `Config`
2. `LLM foundation`
3. `Prompt + schema`
4. `Intent router`
5. `Session`
6. `Chat domain`
7. `API layer`

## M1 da chot la gi

M1 = core flow chay duoc:

- goi API chat duoc
- route intent duoc
- retrieve job duoc
- sinh answer duoc
- tra source duoc
- luu session co ban duoc

Chua bat buoc o M1:

- test day du
- postman
- logging polish
- knowledge_qa
- stream response

## Preview cac file quan trong da chot

### 1. Config

- `backend/src/configs/env.config.ts`
- `backend/src/configs/database.config.ts`

### 2. Constants va models

- `backend/src/constants/chat-intent.ts`
- `backend/src/models/chat/chat.type.ts`
- `backend/src/models/schema/client/chatSessions.schema.ts`

### 3. LLM foundation

- `backend/src/services/llm/gemini.provider.ts`
- `backend/src/services/llm/llm.service.ts`

### 4. Prompt + schema

- `backend/src/services/chat/prompts/intent-router.prompt.ts`
- `backend/src/services/chat/prompts/job-chat-answer.prompt.ts`
- `backend/src/services/chat/schemas/intent-router.schema.ts`

### 5. Chat services

- `backend/src/services/chat/intent-router.service.ts`
- `backend/src/services/chat/session.service.ts`
- `backend/src/services/chat/job-chat-retrieval.service.ts`
- `backend/src/services/chat/context-assembly.service.ts`
- `backend/src/services/chat/rag-chat.service.ts`

### 6. API layer

- `backend/src/validators/client/chat.validator.ts`
- `backend/src/controller/client/chat.controller.ts`
- `backend/src/routes/v1/client/chat.router.ts`
- `backend/src/routes/v1/client/index.ts`

## Tinh trang hien tai

Da implement xong M1 core va `npm run build` da pass.

Da test runtime endpoint va co ket qua ro:

- Voi Gemini:
  - `cv_review`, `policy_qa`, `unsupported` chay duoc
  - `job_search`, `job_explanation` bi loi `500`
  - log backend cho thay Gemini tra `429`, day la nguyen nhan chinh gay loi runtime
- Da bo sung OpenAI provider va switch sang OpenAI de demo
- Voi OpenAI:
  - `job_search` chay duoc
  - `job_explanation` follow-up theo `session_id` chay duoc
  - `cv_review`, `policy_qa`, `unsupported` chay dung fallback

## Ket qua test runtime gan nhat

1. `job_search`
- Request: `Tìm giúp tôi job backend nodejs remote`
- OpenAI: pass

2. `job_explanation`
- Request follow-up: `So sánh 2 job đầu tiên giúp tôi`
- OpenAI: pass, dung lai dung `session_id`

3. `cv_review`
- Request: `Đánh giá CV của tôi giúp tôi`
- Pass, tra fallback mac dinh

4. `policy_qa`
- Request: `Luật thử việc hiện nay quy định thế nào?`
- Pass, tra fallback mac dinh

5. `unsupported`
- Request: `Hôm nay thời tiết thế nào?`
- Pass, tra fallback mac dinh

6. `validation`
- Request `message` qua ngan
- Tra `422` dung validator

## Endpoint da tao

1. dam bao MongoDB / Elasticsearch / Redis dang chay
2. chay backend
3. goi:
   - `POST /api/v1/chat/jobs`
4. test request:

```json
{
  "message": "Tìm giúp tôi job backend nodejs remote"
}
```

## Endpoint da tao

- `POST /api/v1/chat/jobs`

Request body:

```json
{
  "message": "Tìm giúp tôi job backend nodejs remote",
  "session_id": "optional"
}
```

Response shape da chot:

```json
{
  "status": "success",
  "data": {
    "session_id": "chat_session_id",
    "intent": "job_search",
    "answer": "Noi dung tra loi cua chatbot",
    "sources": [
      {
        "type": "job",
        "job_id": "job_id",
        "title": "Job title",
        "company": "Company name"
      }
    ]
  }
}
```

## Viec nen lam tiep

1. Them fallback cho `job_search` / `job_explanation` khi provider LLM loi de tranh `500`
2. Viet test tu dong cho cac luong chat chinh
3. Chot provider demo / provider chinh thuc
4. Tinh tiep flow `profile_based_job_recommendation`
5. Sau do moi mo rong `cv_review` va `policy_qa` thanh tinh nang that
