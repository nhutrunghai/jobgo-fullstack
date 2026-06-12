# Project JobGo

Project JobGo là hệ thống backend cho nền tảng kết nối ứng viên và nhà tuyển dụng. Mục tiêu của dự án là xây dựng một kiến trúc đủ tốt để xử lý các bài toán xác thực người dùng, quản lý hồ sơ công ty, đăng tin tuyển dụng, quản lý ứng tuyển và mở rộng sang tìm kiếm việc làm.

## Mục tiêu dự án

Dự án tập trung vào các nhóm nghiệp vụ chính:

- Xác thực và bảo mật tài khoản
  - đăng ký, đăng nhập, đăng xuất
  - refresh token
  - xác minh email
  - quên mật khẩu và đặt lại mật khẩu
  - đăng nhập Google OAuth
  - rate limiting cho các thao tác nhạy cảm
- Quản lý người dùng
  - xem hồ sơ cá nhân
  - xem hồ sơ công khai
  - cập nhật hồ sơ
  - cài đặt tài khoản
- Quản lý công ty tuyển dụng
  - tạo hồ sơ công ty
  - cập nhật hồ sơ công ty
  - lấy hồ sơ công ty hiện tại
- Nền tảng quản lý tin tuyển dụng
  - schema và validator cho job
  - schema quan hệ giữa ứng viên và job
  - MongoDB indexes cho luồng company và job
  - nền tảng cho employer tạo bài đăng tuyển dụng
- Hạ tầng phục vụ mở rộng
  - MongoDB
  - Redis
  - Elasticsearch
  - Kibana
  - Postman collection cho kiểm thử API

## Kiến trúc hiện tại

Backend được xây dựng theo hướng module hóa với các lớp chính:

- `routes`: định nghĩa endpoint
- `middlewares`: xác thực, phân quyền, validate request
- `controller`: điều phối request/response
- `services`: xử lý nghiệp vụ và thao tác dữ liệu
- `models`: schema và kiểu dữ liệu
- `validators`: validate đầu vào bằng Zod
- `configs`: cấu hình môi trường, database, hạ tầng

Các quyết định kỹ thuật đang được áp dụng:

- Node.js + Express + TypeScript
- MongoDB là nguồn dữ liệu giao dịch chính
- Redis phục vụ hạ tầng và mở rộng hiệu năng
- Elasticsearch dành cho bài toán search và retrieval
- Zod để kiểm soát dữ liệu đầu vào
- tổ chức code theo domain để dễ mở rộng về sau

## Công nghệ sử dụng

- Node.js
- Express
- TypeScript
- MongoDB
- Redis
- Elasticsearch
- Kibana
- Zod
- Jest
- Docker Compose

## Cấu trúc thư mục

```text
backend/
  src/
    configs/
    constants/
    controller/
    middlewares/
    models/
    routes/
    services/
    validators/
```

## Cách chạy dự án

### 1. Cài dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Tạo hoặc cập nhật file:

```bash
backend/.env
```

Các nhóm biến môi trường quan trọng:

- cổng chạy ứng dụng
- MongoDB connection
- JWT secrets
- Redis connection
- mail service settings
- Elasticsearch settings

### 3. Chạy hạ tầng local

Repo có sẵn `docker-compose.yml` để chạy các dịch vụ hỗ trợ như Redis, Elasticsearch và Kibana.

```bash
docker compose up -d
```

### 4. Chạy backend ở môi trường development

```bash
cd backend
npm run dev
```

### 5. Build production

```bash
cd backend
npm run build
npm start
```

## Trạng thái phát triển

Dự án vẫn đang trong quá trình hoàn thiện. Trọng tâm hiện tại là hoàn chỉnh luồng của nhà tuyển dụng trước khi mở rộng dashboard tổng hợp, bao gồm:

- quản lý hồ sơ công ty
- quản lý vòng đời tin tuyển dụng
- quản lý luồng ứng tuyển của ứng viên
- chuẩn hóa dữ liệu và index cho các bảng quan trọng

## Định hướng tiếp theo

Các hạng mục đang được ưu tiên tiếp tục:

- hoàn thiện CRUD job cho employer
- hoàn thiện luồng apply job cho candidate
- quản lý trạng thái application
- xây dựng dashboard tổng quan sau khi các luồng cốt lõi ổn định
- tích hợp search nâng cao dựa trên Elasticsearch và retrieval workflow

## License

Dự án sử dụng giấy phép MIT. Xem thêm tại [LICENSE](./LICENSE).

## Frontend Application

Frontend React/Vite da duoc them vao thu muc `frontend/` de repo the hien day du ung dung fullstack.

- `frontend/src`: ma nguon giao dien nguoi dung, nha tuyen dung va admin
- `frontend/public`: static assets va mock API data
- `frontend/package.json`: script dev/build/lint cua frontend

Chay frontend:

```bash
cd frontend
npm install
npm run dev
```
