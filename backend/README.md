# Smart School Backend

Standalone Express + TypeScript API for the existing React application. The original frontend and `server/` demo API remain available and unchanged.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer

## Setup

From the repository root:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set `DATABASE_URL` in `backend/.env` to the PostgreSQL database and set `JWT_SECRET` to a unique random value of at least 32 characters. Create the database first, then run:

```powershell
npm run prisma:generate
npm run prisma:deploy
$env:SEED_DEMO_PASSWORD = "your-private-demo-password"
npm run seed
```

The seed creates `admin@demo.school`, `teacher@demo.school`, `student@demo.school`, `maintenance@demo.school`, `security@demo.school`, and `canteen@demo.school`. Their shared password is provided only through `SEED_DEMO_PASSWORD`; it is not stored in the repository. Seeded users are synthetic demo identities.

Start the API using `npm run dev` (port 5001). Start the existing frontend separately from the repository root with `npm run dev` (port 5173). The frontend defaults to the backend URL `http://localhost:5001`; override it using `VITE_API_BASE_URL` when required. Login and account creation require this API and never fall back to demo authentication.

Self-registered accounts receive the `TEACHER` role. Password reset email delivery is disabled until all SMTP settings below are configured. Reset requests then send a single-use link that expires after 30 minutes; without SMTP, the API reports that reset delivery is unavailable.

## Environment

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API port (default `5001`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing key, minimum 32 characters |
| `JWT_EXPIRES_IN` | Access-token lifetime (default `8h`) |
| `FRONTEND_ORIGIN` | Single allowed frontend origin |
| `FRONTEND_URL` | Frontend URL used to build password reset links |
| `UPLOAD_DIR` | Private upload storage directory (default `uploads`) |
| `SEED_DEMO_PASSWORD` | Required only while running the seed script |
| `SMTP_HOST` | SMTP server hostname; required for password reset email |
| `SMTP_PORT` | SMTP server port (default `587`) |
| `SMTP_SECURE` | Set `true` when the SMTP server requires implicit TLS |
| `SMTP_USER`, `SMTP_PASSWORD` | SMTP authentication credentials |
| `SMTP_FROM` | Sender email address |

## API

All application routes are rooted at `/api`. Except login and health, requests require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/login` | Email/password login; returns access token and safe user profile |
| `POST` | `/api/auth/register` | Create a teacher account with an optional phone number |
| `POST` | `/api/auth/password-reset/request` | Verify account email and send a reset link when SMTP is configured |
| `POST` | `/api/auth/password-reset/complete` | Set a new password using a valid single-use reset token |
| `GET` | `/api/auth/me` | Current account |
| `POST`, `GET` | `/api/reports` | Create and list reports |
| `GET`, `PUT`, `DELETE` | `/api/reports/:id` | Read/update report; delete is admin-only |
| `POST`, `GET` | `/api/food-complaints` | Create food complaint as a normal issue and list food metadata |
| `POST` | `/api/reports/qr` | Create a QR-linked classroom report |
| `GET`, `PUT` | `/api/issues`, `/api/issues/:id` | Issue list, detail, and edits |
| `POST` | `/api/issues/:id/assign` | Department/staff assignment (admin) |
| `POST` | `/api/issues/:id/status` | Status and timeline update |
| `POST` | `/api/issues/:id/verify` | Verify resolution |
| `GET`, `POST`, `PUT` | `/api/alerts` | Safety alerts |
| `GET`, `POST`, `PUT` | `/api/emergencies` | Emergency incidents and response timeline |
| `GET`, `PATCH` | `/api/notifications` | Notifications and read state |
| `POST` | `/api/uploads` | Multipart field `image`; JPG/JPEG/PNG/WEBP, maximum 10 MB |
| `GET` | `/api/analytics/overview` | Total/open/critical/resolved counts |
| `GET` | `/api/analytics/problems-by-location` | Location chart data |
| `GET` | `/api/analytics/problems-by-category` | Category chart data |
| `GET` | `/api/analytics/status` | Status chart data |
| `GET` | `/api/analytics/monthly` | Monthly report trend |
| `GET` | `/api/analytics/resolution-time` | Average hours to resolution |
| Socket.IO | `/` | Authenticated optional socket; emits `new_problem`, `issue_assigned`, `issue_status_changed`, `critical_alert`, `issue_resolved`, `issue_verified`, and `emergency_alert` |

`Food Complaint` uses the same `Issue` record as all other reports, with selected day/menu and student details stored in the related `FoodComplaint` record. “Others” uses the ordinary reports endpoint and `Other` category/location.

## Verification

```powershell
npm test
npm run build
```

The API health and unauthenticated-access tests do not require a database. CRUD, authentication, and seed verification require a running PostgreSQL instance and the setup above.