# JobGo Frontend

## API config

Local frontend calls the JobGo backend through Vite env variables.

Default local config:

```env
VITE_API_ORIGIN=http://localhost:4000
VITE_API_VERSION=v1
```

The resolved API base URL is:

```text
http://localhost:4000/api/v1
```

You can override the full URL directly when needed:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Local machine values live in `.env.local`. Use `.env.example` as the shared template.

## Commands

```bash
npm run dev
npm run build
npm run lint
```
