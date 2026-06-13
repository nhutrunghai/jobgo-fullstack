# JobGo Fullstack

JobGo is a full-stack recruitment platform that connects candidates with employers. The project includes a backend API, frontend application, authentication flow, company profile management, job-posting foundation, and supporting infrastructure for search and scalability.

## Overview

The goal of JobGo is to build a practical recruitment system with a clean architecture that can grow into a complete job marketplace. The project focuses on authentication, user profiles, employer workflows, job management, and infrastructure readiness.

## Core Features

- Authentication and account security
  - Register, login, logout
  - Refresh token flow
  - Email verification
  - Forgot password and reset password
  - Google OAuth login
  - Rate limiting for sensitive actions
- User management
  - View personal profile
  - View public profile
  - Update profile information
  - Account settings foundation
- Employer/company management
  - Create company profile
  - Update company profile
  - Get current employer company profile
- Job platform foundation
  - Job schema and validation
  - Candidate-job relationship schema
  - MongoDB indexes for company and job workflows
  - Foundation for employer job posting
- Scalable infrastructure
  - MongoDB
  - Redis
  - Elasticsearch
  - Kibana
  - Docker Compose
  - Postman collection for API testing

## Architecture

The backend is organized with a modular/domain-oriented structure:

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

Main responsibilities:

- `routes`: API endpoint definitions
- `middlewares`: authentication, authorization, and request validation
- `controller`: request/response coordination
- `services`: business logic and data operations
- `models`: database schemas and data models
- `validators`: request validation with Zod
- `configs`: environment, database, and infrastructure configuration

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Redis
- Elasticsearch
- Kibana
- Zod
- Jest

### Frontend

- React
- Vite
- JavaScript/TypeScript foundation
- Static assets and mock API data

### DevOps & Tooling

- Docker Compose
- Postman
- Git/GitHub

## Getting Started

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create or update:

```bash
backend/.env
```

Important environment groups:

- Application port
- MongoDB connection
- JWT secrets
- Redis connection
- Mail service settings
- Elasticsearch settings

### 3. Start local infrastructure

```bash
docker compose up -d
```

### 4. Run backend in development

```bash
cd backend
npm run dev
```

### 5. Build backend for production

```bash
cd backend
npm run build
npm start
```

### 6. Run frontend

```bash
cd frontend
npm install
npm run dev
```

## Current Status

JobGo is under active development. The current focus is completing employer-side workflows before expanding into analytics and dashboard features.

Priority areas:

- Company profile management
- Job lifecycle management
- Candidate application workflow
- Data normalization and indexes
- Dashboard overview after core workflows are stable
- Advanced search with Elasticsearch and retrieval workflow

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## Author

Developed by [Nhữ Trung Hải](https://github.com/nhutrunghai).
