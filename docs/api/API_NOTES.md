# API Notes

## Base URL
- Local backend: `http://localhost:4000/api/v1`
- Swagger của repo: [swagger.vi.yaml](/D:/project_JobGo/docs/api/swagger.vi.yaml)

## Auth
- Client API protected dùng Bearer token.
- Header chuẩn: `Authorization: Bearer <AccessToken>`.
- Admin API không dùng Bearer token.
- Admin API dùng cookie session `admin_sid`.
- Cookie được set sau `POST /admin/auth/login` và được gửi lại cho các endpoint `/admin/*`.

## Response Convention
- Success thường có dạng:

```json
{
  "status": "success",
  "message": "optional",
  "data": {}
}
```

- Error thường có dạng:

```json
{
  "status": "error",
  "message": "..."
}
```

## Business Rules

### Public jobs
- Public jobs chỉ hiển thị khi đồng thời thỏa:
  - `status = open`
  - `moderation_status = active`
  - `published_at != null`
  - `expired_at > now`

### Favorite jobs
- `POST /user/favorite-jobs/:jobId` chỉ cho lưu job public hợp lệ.
- Save favorite là idempotent.
- `DELETE /user/favorite-jobs/:jobId` là idempotent.
- `GET /user/favorite-jobs` chỉ trả các job favorite vẫn còn public hợp lệ.

### Admin jobs
- Admin jobs chỉ can thiệp `moderation_status`.
- Admin jobs không đổi `JobStatus` nghiệp vụ.
- `PATCH /admin/jobs/:jobId/moderation-status`:
  - nhận `moderation_status`
  - nếu block thì cần `blocked_reason`
  - khi unblock sẽ clear metadata block trong Mongo

### Admin users
- `PATCH /admin/users/:userId/status` chỉ cho:
  - `0 = active`
  - `1 = banned`

### Admin companies
- `PATCH /admin/companies/:companyId/status` chỉ đổi `verified`.

## Enum Notes

### UserRole
- `0 = candidate`
- `1 = employer`
- `2 = admin`

### UserStatus
- `0 = active`
- `1 = banned`
- `2 = deleted`

### JobStatus
- `draft`
- `open`
- `paused`
- `closed`
- `expired`

### JobModerationStatus
- `active`
- `blocked`

### JobApplicationStatus
- `submitted`
- `reviewing`
- `shortlisted`
- `interviewing`
- `rejected`
- `hired`
- `withdrawn`

## Resume APIs

### Create resume
- Endpoint: `POST /user/resumes`
- Auth: bắt buộc Bearer token.
- Body:

```json
{
  "title": "CV Backend Node.js",
  "cv_url": "https://.../resume.pdf",
  "resume_file_key": "file_xxx",
  "is_default": true
}
```

- Backend lưu Mongo trước, rồi mới chạy parse PDF + embedding + index Elasticsearch ở background.
- Vì vậy response trả về ngay với:

```json
{
  "resume_indexing": {
    "status": "queued",
    "chunks_indexed": 0
  }
}
```

- `queued` không có nghĩa là CV đã searchable ngay trong Elasticsearch.
- Frontend nên coi resume vừa tạo là đã tồn tại trong DB, nhưng chưa chắc đã sẵn sàng cho text RAG ngay lập tức.

### Get my resumes
- Endpoint: `GET /user/resumes`
- Trả toàn bộ CV active của chính user.
- Sort hiện tại:
  - `is_default desc`
  - `updated_at desc`

### Get resume detail
- Endpoint: `GET /user/resumes/:resumeId`
- Chỉ lấy được CV thuộc chính user đang đăng nhập.

### Delete resume
- Endpoint: `DELETE /user/resumes/:resumeId`
- Xóa resume trong Mongo.
- Xóa chunks tương ứng trong Elasticsearch.
- Nếu CV bị xóa là default:
  - backend tự chọn CV active mới nhất còn lại làm default
  - nếu không còn CV nào thì clear metadata default trong search index

## Chat / CV Review

### Endpoint
- `POST /chat/jobs`

### Auth
- Route dùng `optionalDecodeToken`.
- Nhưng nếu intent là `cv_review` thì vẫn bắt buộc có Bearer token.
- Nếu thiếu token sẽ trả `401 Token không tồn tại`.

### Request body

```json
{
  "message": "đánh giá cv cho tôi",
  "session_id": "",
  "resume_id": "optional"
}
```

### Intent
- Nếu message có từ khóa như `cv`, `resume`, `hồ sơ` thì intent được override thành `cv_review`.

### Cách chọn CV
- Nếu có `resume_id`:
  - backend lấy đúng CV đó
  - đồng thời check CV phải thuộc về user trong token
- Nếu không có `resume_id`:
  - lấy CV `is_default = true`
  - nếu không có thì fallback sang CV active mới nhất

### Hybrid CV review
- Luồng hiện tại là hybrid:
  - Text RAG từ Elasticsearch để review nội dung CV
  - Visual/PDF review từ `cv_url` để review bố cục

#### Text review dùng để đánh giá
- kỹ năng
- kinh nghiệm
- project
- học vấn
- ATS keywords
- điểm thiếu hoặc sai trong nội dung

#### Visual/PDF review dùng để đánh giá
- bố cục tổng thể
- độ dễ đọc
- visual hierarchy
- spacing
- font consistency
- thứ tự section
- 1 cột / 2 cột có hợp lý không
- bảng, icon, ảnh có gây nhiễu không
- mức độ chuyên nghiệp
- rủi ro ATS do layout phức tạp

### Nguồn dữ liệu visual
- Frontend không cần gửi `cv_url` trong API chat.
- Backend tự lấy `cv_url` từ resume của user trong DB.
- `cv_url` được truyền sang OpenAI Responses API dưới dạng PDF file URL.

### Fallback behavior
- Nếu có chunks ES thì dùng để review nội dung.
- Nếu ES không có chunks nhưng `cv_url` còn dùng được thì backend vẫn cố review theo nhánh visual.
- Nếu visual review fail thì endpoint không crash; backend vẫn trả review text nếu có.
- Nếu cả text chunks và visual đều không có thì trả message rõ ràng là chưa đủ dữ liệu để đánh giá.

### Output shape
- Response của chat vẫn giữ format:

```json
{
  "status": "success",
  "data": {
    "session_id": "...",
    "intent": "cv_review",
    "answer": "...",
    "sources": []
  }
}
```

### `sources` trong cv_review
- `sources` là danh sách chunk text đã được dùng làm nguồn cho câu trả lời.
- Mỗi item có dạng:

```json
{
  "type": "resume",
  "resume_id": "69e4a257aacbe1634ec7903f",
  "title": "CV Backend Node.js",
  "chunk_index": 2
}
```

- `chunk_index` là index của chunk trong pipeline ingest/search, không phải số trang PDF.
- Nếu câu trả lời chỉ dựa trên visual review mà chưa có chunks, `sources` sẽ fallback về một item resume duy nhất với `chunk_index = 0`.

## Frontend Notes
- Nếu frontend gọi admin API từ domain khác, cần bật gửi cookie:
  - `credentials: 'include'` với `fetch`
  - `withCredentials: true` với `axios`
- Với luồng CV:
  - sau khi tạo resume, có thể hiển thị ngay trong danh sách vì Mongo đã lưu xong
  - nhưng nên chấp nhận việc `cv_review` ngay sau upload có thể chưa có text RAG nếu background ingest chưa xong
- Postman collection trong repo nên dùng cùng biến `{{host}}`.
