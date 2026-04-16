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

- admin users
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

Trang thai: chua lam

Do uu tien: cao nhat tiep theo

Can co:

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PATCH /api/v1/admin/users/:userId/status`

Nen ho tro filter:

- `role`
- `status`
- `keyword` theo `email`, `username`, `fullName`
- `page`
- `limit`

Co the can nhac sau:

- `PATCH /api/v1/admin/users/:userId/role`

Nhung khong nen dua vao phase tiep theo neu chua co nhu cau business ro rang.

### Cum D. Admin jobs moderation toan he thong

Trang thai: chua lam

Do uu tien: cao

Can co:

- `GET /api/v1/admin/jobs`
- `GET /api/v1/admin/jobs/:jobId`
- `PATCH /api/v1/admin/jobs/:jobId/status`

Filter nen ho tro:

- `companyId`
- `status`
- `keyword`
- `page`
- `limit`

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

1. Admin Users
2. Admin Jobs moderation
3. Admin Dashboard Summary
4. Admin Applications
5. Audit va session management

## 6. Cum chuc nang tiep theo nen lam ngay

### De xuat: Admin Users

Ly do chon cum nay truoc:

- Day la cum admin con thieu nhung dung sat voi model hien co nhat.
- `User` da co san `role`, `status`, `is_verified`, nen implementation ngan va ro.
- Can de admin khoa/mo tai khoan va tra soat user truoc khi di sau vao moderation jobs toan he thong.
- Boundary ky thuat se rat giong cum `Admin Companies`, nen co the tai su dung pattern route -> validator -> middleware -> controller -> service.

### Scope phase tiep theo

- list users
- user detail
- ban/unban user qua update `status`

Thu tu de lam trong module nay:

1. `GET /api/v1/admin/users`
2. `GET /api/v1/admin/users/:userId`
3. `PATCH /api/v1/admin/users/:userId/status`

### Chua nen dua vao phase nay

- role management cho admin
- permission matrix chi tiet
- soft delete / restore user
- audit log day du

## 7. Ket luan

Sau khi quet toan bo du an, trang thai dung cua admin la:

- `Admin Auth`: da co
- `Admin Companies`: da hoan thanh module dau tien va da co Postman
- `Admin Users`: la cum chuc nang tiep theo
- sau do moi den `Admin Jobs`, `Dashboard`, `Admin Applications`
