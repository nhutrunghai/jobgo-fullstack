# Project JobGo

Project JobGo is a backend-focused job platform that connects candidates and employers. The current codebase is centered on authentication, user profile management, employer company profiles, and the foundation for job posting and application workflows.

## Current Scope

The backend currently includes or is actively being extended around these areas:

- Authentication and account security
  - register, login, logout, refresh token
  - email verification and password recovery flows
  - Google OAuth login
  - rate limiting for sensitive actions
- User module
  - my profile endpoint
  - public profile endpoint
  - profile update and account settings flows
- Employer company module
  - create company profile
  - update company profile
  - get current company profile
- Job foundation
  - job schema and validation
  - job application schema and relation model
  - MongoDB indexes for job and application workflows
  - employer-side job creation foundation
- Infrastructure and integrations
  - MongoDB
  - Redis
  - Elasticsearch
  - Kibana
  - Docker Compose support for local services

## Architecture Notes

This repository is structured around a Node.js + Express + TypeScript backend using MongoDB as the primary datastore.

Main architectural decisions in the current codebase:

- modular route/controller/service structure
- Zod-based request validation
- MongoDB collections with explicit indexes for high-traffic entities
- Redis-based infrastructure support
- Elasticsearch reserved for search and retrieval use cases
- Postman collection maintained for API testing during development

## Tech Stack

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

## Repository Structure

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
SRS/
reports/
```

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create and update the backend environment file as needed:

```bash
backend/.env
```

At minimum, configure:

- application port
- MongoDB connection
- JWT secrets
- Redis connection
- mail service settings
- Elasticsearch settings

### 3. Start infrastructure services

A Docker Compose file is included for local supporting services such as Redis, Elasticsearch, and Kibana.

```bash
docker compose up -d
```

### 4. Run the backend

```bash
cd backend
npm run dev
```

### 5. Build for production

```bash
cd backend
npm run build
npm start
```

## Development Status

This project is still under active development. The current focus is on stabilizing the employer workflow:

- company profile management
- job posting lifecycle
- candidate application flow
- dashboard and reporting layers after core workflows are complete

## Notes

- The repository also contains SRS and report-related materials used during the development process.
- Search and recommendation capabilities are planned around Elasticsearch and retrieval-oriented workflows, while MongoDB remains the source of truth for transactional data.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
