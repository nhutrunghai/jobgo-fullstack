# API Notes

## Base URL
- Local backend: `http://localhost:4000/api/v1`
- Swagger chính của repo: [swagger.vi.yaml](/D:/project_JobGo/docs/api/swagger.vi.yaml)

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

## Flows

### Client auth
1. `POST /auth/login`
2. lấy `AccessToken` và `RefreshToken`
3. dùng `AccessToken` cho các endpoint protected
4. dùng `POST /auth/refresh-token` khi cần refresh

### Favorite jobs
1. user login lấy `AccessToken`
2. `POST /user/favorite-jobs/:jobId` để lưu
3. `GET /user/favorite-jobs` để render danh sách
4. `DELETE /user/favorite-jobs/:jobId` để bỏ lưu

### Admin auth
1. `POST /admin/auth/login`
2. backend set cookie `admin_sid`
3. frontend gọi các endpoint `/admin/*` kèm cookie
4. `POST /admin/auth/logout` để xóa session

## Frontend Notes
- Nếu frontend gọi admin API từ domain khác, cần bật gửi cookie:
  - `credentials: 'include'` với `fetch`
  - `withCredentials: true` với `axios`
- Postman collection trong repo nên dùng cùng biến `{{host}}`.
