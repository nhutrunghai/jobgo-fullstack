# Admin Feature Backlog

## 1. Ket qua quet du an

### Client/backend da co san

- auth nguoi dung
- profile va setting nguoi dung
- company profile cho employer
- company jobs
- public job search
- job application workflow
- semantic job search service va embedding integration

### Admin da co san trong code

#### Admin auth

Da co:

- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `GET /api/v1/admin/auth/me`

Da co nen:

- session-based admin auth luu Redis
- `adminAuthMiddleware`
- `authorizeAdmin([UserRole.ADMIN])`

#### Admin companies

Da co:

- `GET /api/v1/admin/companies`
- `GET /api/v1/admin/companies/:companyId`
- `GET /api/v1/admin/companies/:companyId/jobs`
- `GET /api/v1/admin/companies/:companyId/applications`
- `PATCH /api/v1/admin/companies/:companyId/status`

Filter da co:

- `verified`
- `keyword`
- `page`
- `limit`

Filter bo sung da co trong nested endpoints:

- jobs theo `status`, `keyword`
- applications theo `status`, `jobId`, `candidateId`

### Phan admin chua co

Chua thay route/controller/service/validator rieng cho:

- admin jobs toan he thong
- admin applications toan he thong
- admin dashboard summary
- admin audit log / session management

## 2. Danh gia backlog hien tai

Backlog cu khong con dung o 2 diem:

- Phia admin khong con "moi co auth". Hien tai da co nguyen cum `Admin Companies`.
- Cum `company verification` khong con la muc tiep theo, vi da duoc implement o muc co the dung backend.

## 3. Cac rule va du lieu nen co the tan dung tiep

- `User` co `role`, `status`, `is_verified`
- `Company` co `verified`
- `Job` co `status`, `published_at`, `expired_at`
- `JobApplication` co workflow trang thai day du
- MongoDB da co schema va collection rieng cho `users`, `companies`, `jobs`, `jobApplications`
- Admin auth da tach boundary rieng khoi client auth
- `Job` da co them `moderation_status = active | blocked`
- public job detail/search/apply da chi cho qua job co:
  - `status = open`
  - `moderation_status = active`
  - `published_at != null`
  - `expired_at > now`
- da co script backfill:
  - `npm run jobs:backfill-moderation`

## 4. Trang thai backlog sau khi cap nhat

### Cum A. Admin auth

Trang thai: done

Pham vi:

- login
- logout
- me
- session-based auth

### Cum B. Admin companies

Trang thai: done cho module dau tien

Pham vi:

- list companies
- company detail
- verify/unverify qua `PATCH /status`
- xem jobs cua company
- xem applications cua company

Da chot theo cach lam viec vua xong:

- da co route, controller, service, validator, middleware day du cho module nay
- cac endpoint nested dung 1 validator gop `params + query`
- `status` o endpoint jobs la optional
- applications filter optional theo `status`, `jobId`, `candidateId`
- da them request vao Postman folder `admin > companies`
- backend build da pass
- da verify flow thuc te: company chi dang job duoc khi `verified = true`

Mo rong co the de sau:

- ly do verify/unverify
- lich su moderation
- note noi bo cho company

### Cum C. Admin users

Trang thai: done cho module dau tien

Pham vi:

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PATCH /api/v1/admin/users/:userId/status`

Nen ho tro filter:

- `role`
- `status`
- `keyword` theo `email`, `username`, `fullName`
- `page`
- `limit`

Da chot theo cach lam viec vua xong:

- da co route, controller, service, validator, middleware day du cho module nay
- da mount `admin/users` vao admin router
- list users support filter optional theo `role`, `status`, `keyword`, `page`, `limit`
- `keyword` search theo `email`, `username`, `fullName`
- detail user dung middleware check ton tai dung chung
- update status chi cho `ACTIVE` va `BANNED`
- update status co idempotent behavior
- admin khong the tu ban chinh minh
- da them request vao Postman folder `admin > users`
- backend build da pass

Co the can nhac sau:

- `PATCH /api/v1/admin/users/:userId/role`

Nhung tam thoi chua nen lam phan `role`, vi sau nay con can mo rong role va permission model.

### Cum D. Admin jobs moderation toan he thong

Trang thai: done cho module dau tien

Do uu tien: cao

Da co:

- `GET /api/v1/admin/jobs`
- `GET /api/v1/admin/jobs/:jobId`
- `PATCH /api/v1/admin/jobs/:jobId/moderation-status`

Filter da ho tro:

- `companyId`
- `status`
- `moderation_status`
- `keyword`
- `page`
- `limit`

Da chot va da implement:

- admin jobs phase nay chi moderation theo `moderation_status`
- chua doi `JobStatus` nghiep vu qua endpoint admin
- employer khong duoc sua `moderation_status`
- public flow da dung `moderation_status = active`
- list jobs lookup company ngay trong list response
- detail jobs dung middleware rieng de load job + company bang aggregate
- patch moderation-status co idempotent behavior
- khi block thi luu `blocked_reason`, `blocked_at`, `blocked_by` trong Mongo
- khi unblock thi clear cac field block
- sau update se `upsertJobDocument(jobId)` de dong bo lai Elasticsearch theo `moderation_status`
- da them request vao Postman folder `admin > jobs`
- backend build da pass

Payload update nen theo huong:

- `moderation_status: active | blocked`
- `blocked_reason?: string`

### Cum E. Admin dashboard summary

Trang thai: chua lam

Do uu tien: trung binh cao

Can co:

- `GET /api/v1/admin/dashboard/summary`

So lieu nen tra:

- tong users
- tong companies
- so companies chua verify
- tong jobs
- so jobs dang open
- tong applications

### Cum F. Admin applications toan he thong

Trang thai: chua lam

Do uu tien: trung binh

Can co:

- `GET /api/v1/admin/applications`
- `GET /api/v1/admin/applications/:applicationId`

Filter nen ho tro:

- `status`
- `jobId`
- `companyId`
- `candidateId`
- `page`
- `limit`

### Cum G. Audit va session management

Trang thai: chua lam

Do uu tien: thap hon

Vi du:

- list admin sessions
- force logout admin
- audit log hanh dong admin

## 5. Thu tu trien khai de xuat moi

1. Admin Dashboard Summary
2. Admin Applications
3. Audit va session management

## 6. Cum chuc nang tiep theo nen lam ngay

### De xuat: Admin Dashboard Summary

Ly do chon cum nay truoc:

- `Admin Jobs moderation` da xong module dau tien.
- Sau jobs, dashboard summary la cum tiep theo de admin co so lieu tong quan de dieu huong moderation.
- Cum nay co the tan dung truc tiep cac collection `users`, `companies`, `jobs`, `jobApplications` da co san.

### Scope phase tiep theo

- tong users
- tong companies
- so companies chua verify
- tong jobs
- so jobs dang open
- tong applications

Thu tu de lam trong module nay:

1. `GET /api/v1/admin/dashboard/summary`

### Chua nen dua vao phase nay

- role/permission matrix chi tiet cho admin
- audit log day du
- dashboard phuc tap
- moderation workflow nhieu buoc

## 7. Ket luan

Sau khi quet toan bo du an, trang thai dung cua admin la:

- `Admin Auth`: da co
- `Admin Companies`: da hoan thanh module dau tien va da co Postman
- `Admin Users`: da hoan thanh module dau tien va da co Postman
- `Job moderation groundwork`: da co o public/client side va da backfill Mongo + Elasticsearch
- `Admin Jobs`: da hoan thanh module dau tien va da co Postman
- cum tiep theo la `Dashboard`, sau do den `Admin Applications`, va `Audit`
