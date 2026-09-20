# Swift for Jobs

A responsive React frontend for the Swift for Jobs REST API.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env` to the backend URL (defaults to `http://localhost:3003`). The backend must allow `http://localhost:5173` in `CORS_ORIGINS`.

## Routes

- `/` — browse and search open jobs
- `/jobs/:id` — job details and candidate application
- `/companies/:id` — company profile
- `/login`, `/register` — authentication
- `/my-applications` — candidate applications
- `/employer/company` — employer profile
- `/employer/jobs`, `/employer/jobs/new`, `/employer/jobs/:id/edit` — employer job management
- `/jobs/:id/applicants` — employer/admin applicant management
