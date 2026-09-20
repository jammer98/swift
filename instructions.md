Build a simple, functional frontend for an existing Job Board REST API. Prioritize working functionality and clarity over visual polish: a clean, plain, responsive UI is fine, with no animations or heavy design. Do NOT modify the backend or invent endpoints; use only the API described below.

TECH
- New folder "job-board-frontend". React 18 + Vite, JavaScript (not TypeScript), React Router for routing.
- Plain CSS (one global stylesheet is fine). No UI kit, no state-management library. React Context for auth, local component state for everything else.
- Use fetch through one small api helper module (src/api/client.js). Read the base URL from VITE_API_URL (default http://localhost:3003). Provide a .env.example.
- The Vite dev server runs at http://localhost:5173. The backend only accepts origins listed in its CORS_ORIGINS, so call the API directly (no proxy).

AUTH
- JWT-based. After login/register, store the token AND the returned user object in localStorage. Send "Authorization: Bearer <token>" on every protected request.
- Read the role from the stored user (candidate | employer | admin). The server enforces permissions; the UI just hides what a role can't use.
- The api helper must: parse JSON, throw an Error carrying the server's { "error": "..." } message and the HTTP status, and on a 401 from any NON-auth endpoint clear the stored auth and redirect to /login with a "session expired" message. A 401 from /login itself just means wrong credentials, so show the message and do not log out.
- Admin accounts cannot register; admins only use the login page.
- Add route guards: logged-out users are redirected to /login (and sent back after login); users with the wrong role are redirected home.

ROLES AND WHAT EACH SEES
- Public / logged out: browse jobs, view job details and company pages, login, register.
- Candidate: everything public, plus apply to jobs and "My Applications".
- Employer: everything public, plus "Company" and "My Jobs" (create/edit/close/delete jobs, view applicants, change application status).
- Admin: everything public, plus on any job page a "Delete job" button and a "View applicants" link.
- Navbar changes by role: Jobs | (candidate) My Applications | (employer) My Jobs, Company | user name + role + Logout, or Login/Register when logged out.

PAGES AND ROUTES
1. / : Jobs list (public). Search box (q), location input, employment type dropdown, pagination (page, limit 10). Keep the filters in the URL query string. Debounce the search input (~400ms). Each card shows title, company name (link to the company page), location, employment type, salary range if present, and posted date.
2. /jobs/:id : Job detail (public). Full description, company name and website. If status is "closed", show a "This job is closed" notice and hide apply. Candidate: show the apply form (see below). Logged out: show "Log in to apply" linking to /login. Admin: Delete job (with confirm) and View applicants. Employer and admin never see the apply form.
3. /companies/:id : Company page (public): name, description, website link.
4. /login and /register : Register has name, email, password, and a role selector (Candidate / Employer). After register: employers go to /employer/company, candidates go to /.
5. /my-applications (candidate): list with job title (link to the job), company name, status badge, applied date, and a "View resume" link opening resume_url in a new tab (rel="noopener noreferrer").
6. /employer/company (employer): call GET /api/companies/me. If it returns 404, show a "Create your company profile" form; otherwise show an edit form.
7. /employer/jobs (employer): table of my jobs (title, status badge, created date). Actions per row: Edit, Close/Reopen (PATCH status), Applicants, Delete (with confirm). "Post a job" button. If the employer has no company yet, the create-job call returns 400 "Create a company profile before posting jobs"; handle this by showing a link to /employer/company.
8. /employer/jobs/new and /employer/jobs/:id/edit (employer): one shared job form. The edit form is prefilled from GET /api/jobs/:id.
9. /jobs/:id/applicants (employer or admin): list of applicants with name, email, applied date, cover letter (expandable), a "View resume" link, a status badge, and a dropdown to change status to reviewed / accepted / rejected (pending is only the initial state and cannot be selected).

APPLY FORM (candidate, on the job detail page)
- Fields: resume (file input, PDF only, max 5 MB, required) and coverLetter (textarea, optional, max 5000 chars).
- Validate the file type and size on the client before sending.
- Send as multipart/form-data using FormData with the field names "resume" and "coverLetter". Do NOT set the Content-Type header manually; the browser must add the boundary.
- On 201 show a success message and replace the form with "Application submitted". On 409 show "You have already applied". Show any other server error message inline.

API REFERENCE
All errors return { "error": "message" }. Request bodies use camelCase; responses use snake_case. Be careful with this.

POST /api/auth/register
  Body: { name, email, password, role }  (role is "candidate" or "employer"; password 8 to 72 chars)
  201: { user: { id, name, email, role, created_at }, token }

POST /api/auth/login
  Body: { email, password }
  200: { user: { id, name, email, role }, token }

GET /api/auth/me   (auth)
  200: { user: { id, role } }

POST /api/companies   (employer)
  Body: { name, description?, website? }  (website must start with http:// or https://)
  201: { company: { id, employer_id, name, description, website, created_at } }
  409 if the employer already has a company.
GET /api/companies/me   (employer)   200: { company }, or 404 if none yet
PATCH /api/companies/me   (employer)   Body: any subset of { name, description, website }   200: { company }
GET /api/companies/:id   (public)   200: { company: { id, name, description, website, created_at } }

GET /api/jobs?q=&location=&employmentType=&page=&limit=   (public; open jobs only; limit max 50)
  200: { jobs: [ { id, title, location, employment_type, salary_min, salary_max, created_at, company_id, company_name } ], page, limit, total, totalPages }
GET /api/jobs/mine   (employer)   200: { jobs: [ { id, company_id, title, description, location, employment_type, salary_min, salary_max, status, created_at } ] }
GET /api/jobs/:id   (public; also returns closed jobs)
  200: { job: { id, company_id, title, description, location, employment_type, salary_min, salary_max, status, created_at, company_name, company_website } }
POST /api/jobs   (employer)
  Body: { title, description, location?, employmentType?, salaryMin?, salaryMax? }
  201: { job }
PATCH /api/jobs/:id   (employer who owns the job)
  Body: any subset of the fields above plus status ("open" or "closed"). Send null to clear salaryMin or salaryMax.   200: { job }
DELETE /api/jobs/:id   (employer who owns the job, or admin)   204 No Content

POST /api/jobs/:id/apply   (candidate)   multipart/form-data: resume (PDF), coverLetter?
  201: { application: { id, job_id, candidate_id, resume_url, cover_letter, status, applied_at } }
GET /api/jobs/:id/applications   (employer who owns the job, or admin)
  200: { applications: [ { id, status, resume_url, cover_letter, applied_at, candidate_id, candidate_name, candidate_email } ] }
GET /api/applications/mine   (candidate)
  200: { applications: [ { id, status, resume_url, applied_at, job_id, job_title, company_name } ] }
PATCH /api/applications/:id/status   (employer who owns the job)
  Body: { status }  (reviewed | accepted | rejected)   200: { application }

VALUES AND LIMITS
- employmentType: full-time, part-time, contract, internship.
- Job status: open, closed. Application status: pending, reviewed, accepted, rejected.
- Job form: title required (max 150), description required (max 10000, textarea), location optional (max 100), salaryMin and salaryMax optional non-negative whole numbers with min <= max. Show salaries as plain formatted numbers with no currency symbol. When creating, omit empty optional fields instead of sending empty strings. When editing, send only the fields that changed.
- Company form: name required (max 150), description max 5000, website optional.
- Status codes: 400 validation (the message names the field), 401 not logged in or bad credentials, 403 wrong role, 404 not found (also returned when a job or application belongs to someone else), 409 duplicate, 429 rate limited. The API rate-limits, so debounce search and never fire requests in loops. Show the server's message.

UX RULES
- Every page handles three states: loading, error (with the server message and a retry where sensible), and empty ("No jobs found", "You haven't applied to anything yet").
- Disable submit buttons while a request is in flight. Use a confirm dialog before any delete.
- Status badges are visually distinct per status (pending, reviewed, accepted, rejected, open, closed).
- Format dates in a readable local format.
- Keep it responsive; the layout must work on a phone-width screen.

SUGGESTED STRUCTURE
src/api (client.js and one small file per resource), src/context/AuthContext.jsx, src/components (Navbar, ProtectedRoute, JobCard, StatusBadge, Pagination, ErrorMessage, Loading), src/pages (one file per route above), src/App.jsx for the routes.

DEFINITION OF DONE
- npm run build succeeds with no errors.
- Verify end to end against the running backend: register a candidate and an employer; the employer creates a company and a job; the candidate applies with a PDF; the employer sees the applicant and changes the status; the candidate sees the new status on My Applications.
- Include a short README with setup steps (npm install, copy .env.example to .env, npm run dev) and the list of routes.