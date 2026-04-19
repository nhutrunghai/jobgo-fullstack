# UploadThing Avatar/CV

## CV upload endpoints cần làm tiếp

### 1. Upload hạ tầng
- `GET /api/uploadthing`
- `POST /api/uploadthing`
- UploadThing slug dùng cho CV: `userResume`

### 2. Business endpoints cho CV
- `POST /api/v1/user/resumes`
  - Tạo CV mới từ file đã upload xong qua `userResume`
  - Nếu muốn giới hạn mỗi user chỉ có 1 CV active thì xử lý upsert trong service

- `GET /api/v1/user/resumes`
  - Lấy danh sách CV của user hiện tại

- `GET /api/v1/user/resumes/:resumeId`
  - Lấy chi tiết một CV

- `DELETE /api/v1/user/resumes/:resumeId`
  - Xóa CV
  - Đồng thời xóa file CV trên UploadThing nếu có lưu `resume_file_key`

## Ghi chú ngắn
- Schema hiện tại của resume đã có sẵn:
  - `candidate_id`
  - `title`
  - `cv_url`
  - `resume_file_key`
  - `is_default`
  - `status`
- Hướng đang chốt:
  - chỉ giữ dữ liệu file CV trong `Resume`
  - thông tin ứng viên như `fullName`, `email`, `phone`, `skills` lấy từ `User` profile khi apply job
