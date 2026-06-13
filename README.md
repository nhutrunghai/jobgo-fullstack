<div align="center">

# 🚀 JobGo Fullstack

### Nền tảng tuyển dụng kết nối Ứng viên và Nhà tuyển dụng

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)

</div>

---

## ✨ Tổng quan

**JobGo Fullstack** là dự án mô phỏng một nền tảng tuyển dụng hiện đại, nơi ứng viên có thể tìm kiếm việc làm và nhà tuyển dụng có thể quản lý hồ sơ công ty, tin tuyển dụng, ứng tuyển và các luồng xác thực bảo mật.

Dự án được xây dựng theo hướng **full-stack**, có backend API, frontend application và hạ tầng hỗ trợ như Redis, Elasticsearch, Kibana, Docker Compose.

---

## 🧩 Các module chính

| Module | Mô tả |
|---|---|
| 🔐 Authentication | Đăng ký, đăng nhập, refresh token, xác minh email, quên mật khẩu, Google OAuth |
| 👤 User Profile | Hồ sơ cá nhân, hồ sơ công khai, cập nhật thông tin người dùng |
| 🏢 Company Profile | Tạo/cập nhật hồ sơ công ty dành cho nhà tuyển dụng |
| 💼 Job Platform | Nền tảng schema, validator, index và luồng quản lý tin tuyển dụng |
| 🔎 Search Infrastructure | Elasticsearch/Kibana phục vụ mở rộng tìm kiếm nâng cao |
| 🧪 API Testing | Postman collection hỗ trợ kiểm thử endpoint |

---

## 🏗️ Kiến trúc dự án

```text
jobgo-fullstack/
├── backend/
│   └── src/
│       ├── configs/       # Cấu hình database, env, hạ tầng
│       ├── constants/     # Hằng số dùng chung
│       ├── controller/    # Điều phối request/response
│       ├── middlewares/   # Auth, phân quyền, validate
│       ├── models/        # MongoDB schema/model
│       ├── routes/        # API routes
│       ├── services/      # Business logic
│       └── validators/    # Zod validation
├── frontend/              # Giao diện người dùng
├── embedding-api/         # Thành phần mở rộng cho retrieval/search
├── docs/                  # Tài liệu dự án
└── docker-compose.yml     # Hạ tầng local
```

---

## 🛠️ Công nghệ sử dụng

### Backend

- ⚙️ Node.js + Express.js
- 🧠 TypeScript
- 🍃 MongoDB
- ⚡ Redis
- 🔎 Elasticsearch + Kibana
- ✅ Zod
- 🧪 Jest

### Frontend

- ⚛️ React
- ⚡ Vite
- 🎨 Static assets + mock API data

### DevOps / Tooling

- 🐳 Docker Compose
- 📮 Postman
- 🔧 Git/GitHub

---

## 🚀 Chạy dự án local

### 1. Cài dependencies backend

```bash
cd backend
npm install
```

### 2. Tạo file môi trường

Tạo file:

```bash
backend/.env
```

Các nhóm biến quan trọng:

- `PORT`
- MongoDB connection string
- JWT secrets
- Redis config
- Mail service config
- Elasticsearch config

### 3. Chạy hạ tầng local

```bash
docker compose up -d
```

### 4. Chạy backend

```bash
cd backend
npm run dev
```

### 5. Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📌 Trạng thái phát triển

Dự án đang được phát triển theo hướng hoàn thiện các luồng cốt lõi trước:

- ✅ Nền tảng xác thực người dùng
- ✅ Hồ sơ người dùng/công ty
- 🚧 CRUD tin tuyển dụng cho employer
- 🚧 Luồng ứng tuyển của candidate
- 🚧 Dashboard tổng quan
- 🚧 Tìm kiếm nâng cao với Elasticsearch

---

## 🧭 Định hướng tiếp theo

- Hoàn thiện quản lý vòng đời tin tuyển dụng
- Hoàn thiện trạng thái application
- Xây dashboard cho nhà tuyển dụng
- Tích hợp search/retrieval workflow
- Chuẩn hóa UI/UX frontend
- Bổ sung test cho các service quan trọng

---

## 📄 License

Dự án sử dụng giấy phép MIT. Xem thêm tại [LICENSE](./LICENSE).

---

<div align="center">

Made with ❤️ by [Nhữ Trung Hải](https://github.com/nhutrunghai)

</div>
