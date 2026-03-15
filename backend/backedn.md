# Backend Folder Understanding

## Why This Backend Folder Was Created

The `backend` folder contains the complete server-side system for the Parent Verification and Student Information Chatbot platform.

It was created to:

- Provide secure authentication (JWT + Email OTP).
- Connect to MongoDB and serve real academic data.
- Expose protected APIs for attendance, marks, CGPA, fees, notifications, faculty, and chatbot queries.
- Enforce authorization so one authenticated student token cannot access another student record.
- Keep data models, business logic, routes, and utilities organized for maintainability.

## Backend Responsibilities

- Authenticate users and issue JWT tokens.
- Validate environment and service configuration at startup.
- Query and aggregate academic data from MongoDB.
- Return structured JSON responses.
- Handle expected errors cleanly (`student not found`, `marks not found`, `invalid token`, etc.).
- Protect all sensitive endpoints with middleware.

## Main Runtime Flow

1. `server.js` boots Express app.
2. Loads `.env` and validates required environment variables.
3. Connects to MongoDB.
4. Registers middleware (`helmet`, `cors`, `morgan`, `express.json`).
5. Mounts route modules.
6. Serves API responses through controllers and Mongoose models.

## Folder and File Responsibilities

### Root Files

- `server.js`
  - Backend entrypoint.
  - Registers middleware, API routes, global 404, and error handler.

- `package.json`
  - Project metadata, dependencies, and scripts (`start`, `dev`, `seed:demo`).

- `package-lock.json`
  - Dependency lockfile for consistent installs.

- `.env`
  - Local runtime secrets/config (do not commit).

- `.env.example`
  - Template of required environment variables.

- `.gitignore`
  - Excludes sensitive/generated files.

### config

- `config/db.js`
  - MongoDB connection logic.
  - Uses `MONGO_URI` or `MONGODB_URI` and optional DB name fallback.

- `config/validateEnv.js`
  - Startup environment validation.
  - Enforces required fields and production safeguards.

### middleware

- `middleware/authMiddleware.js`
  - JWT verification middleware.
  - Rejects missing/invalid tokens with 401.
  - Injects decoded token payload on request.

### models

- `models/Student.js`
  - Student identity/auth + academic profile fields.
  - Includes password hashing and password comparison helper.

- `models/Parent.js`
  - Parent profile and linked student IDs.

- `models/Attendance.js`
  - Attendance records by student, subject, semester.

- `models/Subject.js`
  - Subject catalog with credits/semester/department metadata.

- `models/Marks.js`
  - Marks and grades by student/subject/semester/attempt.

- `models/Semester.js`
  - Semester progress metadata.

- `models/Fees.js`
  - Fee summary and payment history.

- `models/Notification.js`
  - Academic notifications (exam/assignment/calendar/general).

- `models/Faculty.js`
  - Faculty and advisor contact details.

### controllers

- `controllers/authController.js`
  - Student verification, OTP generation, OTP verification, login, profile retrieval.

- `controllers/attendanceController.js`
  - Overall, subject-wise, semester-wise attendance APIs.
  - Low-attendance analysis based on threshold.

- `controllers/studentController.js`
  - Backlog detection and course completion status logic.

- `controllers/performanceController.js`
  - CGPA summary (overall/semester/year), marks views, insights.

- `controllers/financeController.js`
  - Fee status and payment history APIs.

- `controllers/notificationController.js`
  - Notification listing and filtering.

- `controllers/facultyController.js`
  - Faculty contacts (all and subject-specific).

- `controllers/chatbotController.js`
  - Chat query intent mapping.
  - Delegates to attendance/performance/finance/faculty/notification summaries.

### routes

- `routes/authRoutes.js`
  - `/api/auth/*` endpoints.

- `routes/attendanceRoutes.js`
  - `/api/attendance/*` endpoints (JWT protected).

- `routes/studentRoutes.js`
  - `/api/student/*` endpoints (JWT protected).

- `routes/performanceRoutes.js`
  - `/api/performance/*` endpoints (JWT protected).

- `routes/financeRoutes.js`
  - `/api/finance/*` endpoints (JWT protected).

- `routes/notificationRoutes.js`
  - `/api/notifications` endpoint (JWT protected).

- `routes/facultyRoutes.js`
  - `/api/faculty/*` endpoints (JWT protected).

- `routes/chatbotRoutes.js`
  - `/api/chatbot/query` endpoint (JWT protected).

### services

- `services/emailService.js`
  - Sends OTP email using configured transporter.

### utils

- `utils/mailer.js`
  - Nodemailer SMTP transporter setup + verify check.

- `utils/generateOTP.js`
  - OTP generation helper.

- `utils/cgpaCalculator.js`
  - Grade-point mapping and CGPA calculations + insights.

- `utils/studentAccess.js`
  - Authorization helper to ensure request `studentId` matches token `studentId`.

### docs

- `docs/API_TESTING.md`
  - API testing process and scenarios.

- `docs/ACADEMIC_MODULES_GUIDE.md`
  - Endpoint guide and sample responses for academic modules.

- `docs/swagger.js`
  - Swagger/OpenAPI config.

- `docs/TWILIO_PRODUCTION_SETUP.md`
  - Currently repurposed SMTP-focused setup notes for OTP delivery.

### seed

- `seed/seedDemoData.js`
  - Inserts minimum demo dataset for students, attendance, marks, fees, faculty, notifications.

## Security Controls in This Backend

- JWT-protected routes for academic modules.
- Centralized token validation middleware.
- Student-level access check (`studentAccess`) to prevent cross-student data access.
- Environment-based configuration validation.

## Environment Variables (Core)

- `PORT`
- `MONGO_URI` or `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## API Base and Routing

Base API root:

- `/api`

Major groups:

- `/api/auth`
- `/api/attendance`
- `/api/student`
- `/api/performance`
- `/api/finance`
- `/api/notifications`
- `/api/faculty`
- `/api/chatbot`

## Error Handling Pattern

Typical responses include:

- `400` for invalid/missing input
- `401` for invalid JWT token
- `403` for unauthorized student data access
- `404` for missing records (student/marks/attendance/etc.)
- `500` for unexpected database/server failures

## Run and Test Commands

From backend folder:

~~~powershell
npm install
npm run dev
~~~

Production start:

~~~powershell
npm start
~~~

Seed minimal demo data:

~~~powershell
npm run seed:demo
~~~

## Maintenance Notes

- Keep `authMiddleware` and `studentAccess` consistent whenever new protected routes are added.
- Keep model field contracts aligned with frontend payload usage.
- Update docs whenever endpoint contracts change.
- Do not expose secrets in logs or repository.
