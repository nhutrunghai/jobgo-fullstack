# Admin Feature Backlog

## Mục tiêu hiện tại

Backend hiện đã có đủ các miền nghiệp vụ phía client:

- auth người dùng
- hồ sơ và cài đặt người dùng
- company profile
- company jobs
- public job search
- job application

Phía admin hiện mới có:

- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `GET /api/v1/admin/auth/me`

Điều đó có nghĩa là hệ thống đã có dữ liệu nền để quản trị, nhưng chưa có API admin cho các nghiệp vụ vận hành.

## Dữ liệu và rule đã có sẵn

- `User` có `role`, `status`, `is_verified`
- `Company` có `verified`
- `Job` có `status`, `published_at`, `expired_at`
- `JobApplication` có workflow trạng thái đầy đủ
- MongoDB đã có index cho `users`, `jobs`, `jobApplications`
- Admin auth đã có nền session-based riêng

## Backlog chức năng admin

### 1. Quản lý company verification

Độ ưu tiên: cao nhất

Lý do:

- Employer chỉ đăng job khi `company.verified === true`
- Hệ thống đã có middleware `isVerifiedCompany`
- Business rule duyệt công ty đã tồn tại, nhưng admin chưa có API để thao tác

Chức năng nên có:

- `GET /api/v1/admin/companies`
- `GET /api/v1/admin/companies/:companyId`
- `PATCH /api/v1/admin/companies/:companyId/verify`
- `PATCH /api/v1/admin/companies/:companyId/unverify`

Filter nên hỗ trợ:

- `verified`
- `keyword`
- `page`
- `limit`

### 2. Quản lý user

Độ ưu tiên: rất cao

Lý do:

- `User` đã có `role` và `status`
- `status` hiện có `ACTIVE`, `BANNED`, `DELETED`
- Hiện chưa có API admin để khóa hoặc mở user

Chức năng nên có:

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PATCH /api/v1/admin/users/:userId/status`
- có thể cân nhắc `PATCH /api/v1/admin/users/:userId/role` nếu thật sự cần

Filter nên hỗ trợ:

- `role`
- `status`
- `keyword` theo `email`, `username`, `fullName`

### 3. Quản lý job moderation

Độ ưu tiên: cao

Lý do:

- Job hiện có `draft`, `open`, `paused`, `closed`, `expired`
- Company tự quản job của họ
- Chưa có lớp kiểm soát toàn hệ thống từ admin

Chức năng nên có:

- `GET /api/v1/admin/jobs`
- `GET /api/v1/admin/jobs/:jobId`
- `PATCH /api/v1/admin/jobs/:jobId/status`

Admin cần ít nhất khả năng:

- xem job toàn hệ thống
- lọc theo company, status, keyword
- đóng hoặc tạm dừng job vi phạm

### 4. Dashboard summary

Độ ưu tiên: trung bình cao

Lý do:

- Dễ làm
- Có giá trị vận hành ngay

Chức năng nên có:

- `GET /api/v1/admin/dashboard/summary`

Số liệu nên trả:

- tổng users
- tổng companies
- số companies chưa verify
- tổng jobs
- số jobs đang open
- tổng applications

### 5. Xem applications toàn hệ thống

Độ ưu tiên: trung bình

Lý do:

- Dữ liệu application đã có
- Hữu ích cho tra soát
- Chưa cấp thiết bằng verify company, user management, job moderation

Chức năng nên có:

- `GET /api/v1/admin/applications`
- `GET /api/v1/admin/applications/:applicationId`

Filter nên hỗ trợ:

- `status`
- `jobId`
- `companyId`
- `candidateId`

### 6. Audit và session management

Độ ưu tiên: thấp hơn

Ví dụ:

- list admin sessions
- force logout admin
- audit log hành động admin

Đây là phần nên để sau khi các nghiệp vụ vận hành cốt lõi đã hoàn thành.

## Thứ tự triển khai khuyến nghị

1. Admin Companies
- list
- detail
- verify/unverify

2. Admin Users
- list
- detail
- ban/unban

3. Admin Jobs
- list
- detail
- pause/close/open từ admin

4. Admin Dashboard Summary

5. Admin Applications

## Những thứ chưa nên làm ngay

- permission matrix chi tiết kiểu `admin.user.read`, `admin.company.verify`
- multi-role admin như `SUPER_ADMIN`, `MODERATOR`
- audit log đầy đủ
- admin CRUD cho `resume`, `otpCodes`, `refreshTokens`

## Kết luận

Bộ admin nên làm tiếp theo, bám sát đúng hệ thống hiện có, là:

- quản lý duyệt company
- quản lý user
- quản lý job toàn hệ thống
- dashboard thống kê
- rồi mới tới tra soát application và audit
