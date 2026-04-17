# History Admin

## 2026-04-14

### Bối cảnh ban đầu
- Người dùng yêu cầu terminal này chỉ làm các chức năng liên quan đến `admin`.
- Trước đó đã đọc file `history_admin.md` để lấy lại ngữ cảnh.
- Repo có `backend` dùng Node.js, Express, TypeScript và `embedding-api` dùng Python.
- Backend đã có các module client như `auth`, `user`, `company`, `jobs`.
- Hệ thống đã có `UserRole.ADMIN`, nhưng chưa có route/controller/middleware riêng cho admin.
- Chưa thấy frontend `client` hoặc `admin` riêng trong workspace hiện tại.

### Quy trình làm việc đã chốt
- Không tự ý code ngay.
- Luồng làm việc với người dùng:
  1. Cùng bàn chức năng cần làm.
  2. Bàn flow chức năng.
  3. Đưa preview implement/code.
  4. Chỉ khi người dùng duyệt mới thực hiện thay đổi.
- Người dùng chú trọng thiết kế hệ thống, nên mọi phần admin cần tách boundary rõ ràng.

### Scope admin auth đã bàn
- Admin auth phải là luồng riêng, tách khỏi client login.
- Client có thể tiếp tục dùng JWT.
- Admin backend sẽ không dùng JWT, mà dùng session-based auth.
- Scope hiện tại của admin auth:
  - `Admin login`
  - `Admin logout`
  - `Auth middleware`
  - `Authorization middleware`
  - Session chỉ làm phần tối thiểu để phục vụ các mục trên.

### Phần tạm hoãn
- Change password.
- Forgot/reset password.
- 2FA.
- Quản lý nhiều session nâng cao.
- Audit log chi tiết.
- Lock account / risk detection.
- Các flow bảo mật mở rộng khác.

### Flow admin session đã giải thích
- Session admin là server-side session.
- Client chỉ giữ cookie chứa `sessionId`.
- Server dùng `sessionId` để tra Redis hoặc session store.
- Session có thể hết hạn theo:
  - `idle timeout`: không hoạt động một thời gian thì hết hạn.
  - `absolute timeout`: dù còn hoạt động, đến mốc tối đa vẫn hết hạn.
- Khác JWT:
  - JWT tự chứa payload và server verify chữ ký để đọc thông tin.
  - Session cookie chỉ chứa mã tra cứu, thông tin thật nằm phía server.
- Kết luận thiết kế:
  - Admin nên dùng session vì dễ revoke, logout, quản lý timeout, force logout và mở rộng bảo mật.

### Flow chức năng admin login đã bàn
- Endpoint dự kiến:
  - `POST /api/v1/admin/auth/login`
  - `POST /api/v1/admin/auth/logout`
  - `GET /api/v1/admin/auth/me`
- Login flow:
  - Validate `email`, `password`.
  - Tìm user theo email.
  - Nếu không có user thì login fail.
  - Nếu `role !== ADMIN` thì từ chối.
  - Nếu account không active thì từ chối.
  - Compare password.
  - Nếu đúng thì tạo session server-side.
  - Set cookie `HttpOnly`.
  - Trả profile admin tối thiểu.
- Auth middleware:
  - Đọc cookie session.
  - Tra session trong store.
  - Nếu session không tồn tại hoặc hết hạn thì trả `401`.
  - Có thể re-check user còn active/admin không.
  - Gắn admin auth context vào request.
- Authorization middleware:
  - Tách riêng khỏi auth middleware.
  - Phase đầu chỉ check role `ADMIN`.
  - Thiết kế dạng có thể mở rộng permission sau.
- Logout:
  - Xóa session khỏi store.
  - Clear cookie.
  - Nên idempotent.

## 2026-04-15

### Preview code admin auth đã từng đưa
- Đã preview cấu trúc admin auth theo hướng:
  - `backend/src/routes/v1/admin/index.ts`
  - `backend/src/routes/v1/admin/auth.router.ts`
  - `backend/src/controller/admin/auth.controller.ts`
  - `backend/src/services/admin/auth.service.ts`
  - `backend/src/middlewares/admin/auth.middleware.ts`
  - `backend/src/middlewares/admin/authorization.middleware.ts`
  - `backend/src/validators/admin/auth.validator.ts`
- Preview dùng Redis để lưu session theo dạng tối giản:
  - key: `${ADMIN_SESSION_PREFIX}:${sessionId}`
  - value: `{ sessionId, userId, role }`
  - ttl: `ADMIN_SESSION_TTL`
- Cookie dự kiến:
  - `HttpOnly`
  - `Secure` theo env
  - `SameSite` theo env
  - path: `/api/v1/admin`

### Trao đổi lại về thiết kế folder
- Người dùng chỉ ra cấu trúc hệ thống cần tách rõ `client` và `admin`.
- Các folder dùng chung toàn hệ thống không chia:
  - `configs`
  - `constants`
  - `utils`
  - `models/requests`
- Các folder cần tách `client/admin`:
  - `validators`
  - `services`
  - `models/schema`
- Middleware:
  - Nhiều middleware đã có `middlewares/client`.
  - `isAuthorized.middleware.ts` là JWT auth cho client nên nên chuyển vào `middlewares/client`.
  - Các middleware shared như `validator`, `errorHandle`, `rateLimit`, `checkConflict` tạm giữ root-level.

### Refactor folder đã thử thực hiện
- Đã từng thử chuyển:
  - `backend/src/validators/*` vào `backend/src/validators/client/*`
  - `backend/src/services/*` vào `backend/src/services/client/*`
  - `backend/src/models/schema/*` vào `backend/src/models/schema/client/*`
  - `backend/src/middlewares/isAuthorized.middleware.ts` vào `backend/src/middlewares/client/isAuthorized.middleware.ts`
- Đã cập nhật import path và build pass.
- Nhưng phát hiện vấn đề về nhánh.

### Sự cố nhánh cần ghi nhớ
- Ban đầu nhánh `feature/admin-auth-foundation` được tạo khi đang đứng trên `feature/semantic-job-search`.
- Vì vậy nhánh admin cũ trỏ cùng commit với search:
  - `feature/semantic-job-search`: `b32b02a Add Elasticsearch job indexing flow`
  - `feature/admin-auth-foundation`: cũng từng trỏ `b32b02a`
  - `main`: `911a791`
- Điều này làm nhánh admin bị kéo theo phần semantic search dang dở.
- Sau đó có thử xóa và tạo lại `feature/admin-auth-foundation` từ `main`.
- Refactor folder được làm lại trên nhánh admin sạch và build pass.
- Tuy nhiên người dùng yêu cầu restore lại toàn bộ thay đổi vừa làm để tập trung hoàn thiện một nhánh trước.

### Stash và khôi phục generateEmbedding2
- Trước khi dọn worktree đã tạo stash:
  - `stash@{0}: On feature/semantic-job-search: safety-before-recreate-admin-auth-foundation`
- Stash này chứa toàn bộ dirty worktree tại thời điểm đó, bao gồm cả thay đổi search đang dang dở và refactor folder cũ.
- Sau restore, người dùng phát hiện `generateEmbedding2` biến mất khỏi nhánh `feature/semantic-job-search`.
- Nguyên nhân:
  - `generateEmbedding2` chưa được commit.
  - Nó nằm trong dirty worktree và đã bị cất vào stash.
- Đã khôi phục riêng các phần liên quan `generateEmbedding2` từ stash, không apply lại refactor admin:
  - `backend/src/services/embedding.service.ts`
  - `backend/src/scripts/embedding-demo.ts`
  - `backend/src/configs/env.config.ts` với `GEMINI_API_KEY`
- Sau khôi phục:
  - `rg "generateEmbedding2|EMBEDDING_MODEL_2|GEMINI_API_KEY" backend/src -S` thấy lại đủ.
  - `cmd /c npm run build` trong backend đã pass.
- Working tree lúc đó chỉ còn modified:
  - `backend/src/configs/env.config.ts`
  - `backend/src/scripts/embedding-demo.ts`
  - `backend/src/services/embedding.service.ts`

### Trạng thái sau yêu cầu mới nhất
- Người dùng yêu cầu xóa nhánh `feature/admin-auth-foundation`.
- Đã xóa nhánh `feature/admin-auth-foundation`.
- Hiện người dùng muốn tập trung làm xong một nhánh trước để tránh xung đột.
- Terminal này nên tạm dừng mọi việc admin cho đến khi người dùng yêu cầu lại.

### Nguyên tắc cần tuân thủ tiếp theo
- Không tạo lại nhánh admin khi chưa được yêu cầu.
- Không refactor folder admin trong lúc người dùng đang tập trung nhánh search.
- Nếu sau này quay lại admin:
  - Tạo nhánh admin sạch từ `main`, không tạo từ nhánh feature search.
  - Trước khi checkout/switch, đảm bảo working tree sạch hoặc stash rõ ràng.
  - Nếu cần refactor folder, làm thành commit riêng trước khi implement admin auth.
  - Không dùng `stash pop` bừa với `stash@{0}` vì stash đó chứa lẫn nhiều thay đổi cũ.

## 2026-04-16

### Phong cách làm việc đã chốt trong phiên này
- Không nhảy vào code ngay.
- Luôn đi theo nhịp:
  1. bàn chức năng
  2. chốt flow endpoint
  3. đưa preview code
  4. chỉ implement khi người dùng duyệt
- Khi có nhiều endpoint trong cùng một module, ưu tiên làm theo thứ tự:
  - endpoint list
  - endpoint detail
  - endpoint update/action
- Khi xong một endpoint thì:
  - build backend để xác nhận
  - thêm request vào Postman
  - rồi mới chuyển sang endpoint tiếp theo
- Khi xong một module thì:
  - cập nhật `admin-feature-backlog.md`
  - nếu cần tạo nhánh riêng thì gom theo module, không commit lẻ từng endpoint
- Người dùng thích tách boundary rõ ràng:
  - auth riêng
  - companies riêng
  - users riêng
  - jobs riêng
- Người dùng ưu tiên đọc được logic triển khai hơn là tối ưu validator quá sớm.
- Với validator enum số, người dùng chấp nhận kiểu `includes(...)` hiện tại vì dễ đọc logic implement.
- Phần `role` tạm thời chưa làm, vì sau này người dùng còn muốn mở rộng:
  - thêm role
  - gắn quyền theo từng role
  - thiết kế permission model rõ ràng hơn

### Trạng thái code admin đã hoàn thành tính đến hiện tại

#### 1. Admin auth
Đã có:
- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `GET /api/v1/admin/auth/me`

Đặc điểm:
- session-based auth riêng cho admin
- dùng `adminAuthMiddleware`
- dùng `authorizeAdmin([UserRole.ADMIN])`

#### 2. Admin companies
Đã hoàn thành module đầu tiên.

Các API đã có:
- `GET /api/v1/admin/companies`
- `GET /api/v1/admin/companies/:companyId`
- `PATCH /api/v1/admin/companies/:companyId/status`
- `GET /api/v1/admin/companies/:companyId/jobs`
- `GET /api/v1/admin/companies/:companyId/applications`

Đặc điểm đã chốt:
- nested endpoints dùng 1 validator gộp `params + query`
- endpoint jobs:
  - filter optional theo `status`, `keyword`
- endpoint applications:
  - filter optional theo `status`, `jobId`, `candidateId`
- đã verify flow thực tế:
  - company chỉ đăng job được khi `verified = true`
  - khi admin chuyển `verified = false` thì đăng job bị chặn lại
- request Postman đã được thêm vào folder:
  - `admin > companies`

#### 3. Admin users
Đã hoàn thành module đầu tiên.

Các API đã có:
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PATCH /api/v1/admin/users/:userId/status`

Đặc điểm đã chốt:
- `GET /admin/users`
  - filter optional theo:
    - `role`
    - `status`
    - `keyword`
    - `page`
    - `limit`
  - `keyword` search theo:
    - `email`
    - `username`
    - `fullName`
- `GET /admin/users/:userId`
  - dùng middleware check user tồn tại
  - response không trả `password`
- `PATCH /admin/users/:userId/status`
  - chỉ đổi `status`, không đổi `role`
  - phase đầu chỉ cho:
    - `ACTIVE`
    - `BANNED`
  - có idempotent behavior
  - có chặn admin tự ban chính mình
- request Postman đã được thêm vào folder:
  - `admin > users`

### Những thứ đã bàn nhưng tạm thời chưa làm
- `PATCH /api/v1/admin/users/:userId/role`
- mọi phần liên quan mở rộng role/permission matrix
- admin jobs moderation
- admin dashboard summary
- admin applications toàn hệ thống
- audit log / session management

Lý do chưa làm `role`:
- sau này người dùng còn định:
  - thêm role mới
  - gắn quyền theo role
  - thiết kế authorization model rõ hơn
- nếu làm `role` quá sớm sẽ dễ phải sửa lại boundary

### Backlog admin đã chốt lại
Thứ tự tiếp theo nên làm:
1. Admin Jobs moderation
2. Admin Dashboard Summary
3. Admin Applications toàn hệ thống
4. Audit và session management

Cụm tiếp theo được chốt là:
- `Admin Jobs moderation`

Scope dự kiến:
- `GET /api/v1/admin/jobs`
- `GET /api/v1/admin/jobs/:jobId`
- `PATCH /api/v1/admin/jobs/:jobId/status`

### Trạng thái nhánh và git cần ghi nhớ
- Trong phiên này, lúc đầu các thay đổi `admin users` đang nằm trực tiếp trên `main` local chưa commit.
- Sau đó đã tách nhánh riêng và gom commit theo module.

Trạng thái cuối cùng của phiên:
- branch hiện tại: `feature/admin-users`
- commit hiện tại: `826451b`
- remote branch đã push:
  - `origin/feature/admin-users`
- link tạo PR:
  - `https://github.com/nhutrunghai/Project-JobGo/pull/new/feature/admin-users`

Commit message đã dùng:
- `feat(admin-users): add user moderation APIs`

### PR title/description đã chốt
Title tiếng Anh đã dùng để đề xuất:
- `feat(admin-users): add user moderation APIs`

Description tiếng Việt đã chốt theo style hiện tại:
- mô tả ngắn gọn
- liệt kê API
- liệt kê chi tiết triển khai
- validation và hành vi
- verification

### File tài liệu cần ưu tiên đọc lại ở phiên sau
Khi mở máy lại và tiếp tục phần admin, nên đọc theo thứ tự:
1. `history_admin.md`
2. `admin-feature-backlog.md`
3. các file route hiện có:
   - `backend/src/routes/v1/admin/index.ts`
   - `backend/src/routes/v1/admin/company.router.ts`
   - `backend/src/routes/v1/admin/user.router.ts`

### Tóm tắt nhanh để tiếp tục ngay ở phiên sau
- Admin auth: xong
- Admin companies: xong module đầu tiên, có Postman
- Admin users: xong module đầu tiên, có Postman
- Chưa làm role/permission
- Cụm tiếp theo: `Admin Jobs moderation`
- Cách làm tiếp tục vẫn là:
  - bàn flow
  - preview code
  - duyệt xong mới implement
## 2026-04-16 (tiep)

### Viec vua lam xong trong phien nay
- Da them `JobModerationStatus`:
  - `ACTIVE`
  - `BLOCKED`
- Da them `moderation_status` vao `Job schema`, mac dinh la `ACTIVE`.
- Da cap nhat public/client flow de job chi duoc hien thi khi:
  - `status = OPEN`
  - `moderation_status = ACTIVE`
  - `published_at != null`
  - `expired_at > now`
- Da cap nhat cac diem sau:
  - public job detail
  - public job search
  - apply job
  - search index document
  - employer responses cua job de tra them `moderation_status`
- Da them script:
  - `backend/src/scripts/backfill-job-moderation.ts`
  - command: `npm run jobs:backfill-moderation`

### Du lieu da duoc dong bo
- Mongo jobs da backfill xong `moderation_status`.
- Elasticsearch index `public_jobs_search` da duoc xoa, tao lai va reindex sach.
- So luong da xac nhan sau cung:
  - Mongo jobs: `201`
  - Elasticsearch documents: `201`

### Verification da lam xong
- `npm run build` trong `backend`: pass.
- Smoke check public detail:
  - job `ACTIVE` tra `200`
  - job tam thoi set `BLOCKED` tra `404`
- Smoke check public search:
  - job `BLOCKED` khong con xuat hien trong search
  - restore ve `ACTIVE` thi xuat hien lai
- Da restore lai du lieu test, job dung de smoke test dang o:
  - `moderation_status = active`

### Ket luan domain da chot truoc khi lam Admin Jobs
- `JobStatus` giu cho lifecycle nghiep vu.
- `moderation_status` la lop moderation rieng cho admin.
- Phase admin jobs tiep theo khong doi `JobStatus` nghiep vu.
- Admin jobs se uu tien:
  - list jobs
  - job detail
  - block/unblock qua `moderation_status`

### Scope tiep theo da chot lai
- Cum tiep theo van la `Admin Jobs moderation`.
- Endpoint nen chot theo huong:
  - `GET /api/v1/admin/jobs`
  - `GET /api/v1/admin/jobs/:jobId`
  - `PATCH /api/v1/admin/jobs/:jobId/moderation-status`
- Filter list nen co:
  - `companyId`
  - `status`
  - `moderation_status`
  - `keyword`
  - `page`
  - `limit`

### Trang thai git cuoi cung
- Nhanh `feature/admin-users` da duoc commit them:
  - `2a61428 feat(job-moderation): add public moderation status filtering`
- Sau do da merge len `main`.
- `main` local hien tai da dong bo voi `origin/main`.
- Commit hien tai tren `main`:
  - `938459a merge: job moderation updates from feature/admin-users`
- Working tree hien tai: sach.

### Thu tu doc lai de tiep tuc ngay mai
1. `history_admin.md`
2. `admin-feature-backlog.md`
3. cac file lien quan jobs:
   - `backend/src/models/schema/client/jobs.schema.ts`
   - `backend/src/middlewares/client/public-job.middleware.ts`
   - `backend/src/middlewares/client/job-application.middleware.ts`
   - `backend/src/services/client/job.service.ts`
4. sau do moi preview `Admin Jobs moderation`

### Tom tat 1 dong de vao viec ngay
- Nen tiep tuc bang viec preview module `Admin Jobs moderation` dua tren `moderation_status`, khong sua `JobStatus` nghiep vu.

## 2026-04-17

### Viec vua lam xong trong phien nay
- Da tao nhanh `feature/admin-job` tu `main`.
- Da implement xong module dau tien `Admin Jobs moderation`.

### API da them
- `GET /api/v1/admin/jobs`
- `GET /api/v1/admin/jobs/:jobId`
- `PATCH /api/v1/admin/jobs/:jobId/moderation-status`

### Cach lam va boundary da giu nguyen
- Van di dung nhip: chot flow, preview code, duyet xong moi implement.
- Admin jobs phase nay chi moderation theo `moderation_status`.
- Khong doi `JobStatus` nghiep vu qua endpoint admin.
- Public flow van chi phu thuoc `moderation_status = active`.

### Chi tiet implementation da xong
- Da them route, controller, service, validator, middleware rieng cho `admin/jobs`.
- List jobs ho tro filter:
  - `companyId`
  - `status`
  - `moderation_status`
  - `keyword`
  - `page`
  - `limit`
- List jobs lookup company ngay trong response list.
- Job detail dung middleware rieng de load `job + company` bang aggregate va `.next()`.
- Patch moderation-status:
  - nhan `moderation_status`
  - nhan `blocked_reason` khi block
  - co idempotent behavior
  - khi block se set `blocked_reason`, `blocked_at`, `blocked_by`
  - khi unblock se clear cac field block
- Sau patch moderation-status, da goi `jobSearchService.upsertJobDocument(jobId)` de dong bo lai Elasticsearch theo `moderation_status`.

### Ket luan ky thuat da chot trong phien nay
- Mongo/domain model cua `Job` co:
  - `moderation_status`
  - `blocked_reason`
  - `blocked_at`
  - `blocked_by`
- Elasticsearch public index hien chi dung:
  - `status`
  - `moderation_status`
- `blocked_reason` khong dua vao Elasticsearch va khong can dua vao public search flow.

### Verification da lam xong
- `npm run build` trong `backend`: pass.
- Da them Postman request vao collection `JobGo`, folder `admin > jobs`:
  - `get jobs`
  - `get job detail`
  - `update moderation status`

### Trang thai backlog sau khi xong module nay
- `Admin Jobs moderation`: xong module dau tien.
- Cum tiep theo nen lam:
  1. `Admin Dashboard Summary`
  2. `Admin Applications toan he thong`
  3. `Audit va session management`

### Trang thai git can ghi nho
- Branch hien tai: `feature/admin-job`
- Module nay nen gom thanh 1 commit theo module.
