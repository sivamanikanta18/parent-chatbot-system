# Student Auth Backend API Testing Guide

This guide explains how to test the APIs when the database is empty, how to test with mock data, and how to insert data into MongoDB after testing.

## 1) Prerequisites

- Node.js installed
- MongoDB running (local or Atlas)
- Thunder Client extension in VS Code

## 2) Start the Backend

From backend folder:

~~~powershell
npm install
npm run dev
~~~

Base URL:

~~~text
http://localhost:5000
~~~

Use full endpoint URLs in Thunder Client. Example:

~~~text
http://localhost:5000/api/auth/verify-student
~~~

## 2.1) Correct Full API Endpoints

- Verify Student: http://localhost:5000/api/auth/verify-student
- Send OTP: http://localhost:5000/api/auth/send-otp
- Verify OTP: http://localhost:5000/api/auth/verify-otp
- Login: http://localhost:5000/api/auth/login
- Profile (Protected): http://localhost:5000/api/auth/profile

Swagger docs:

~~~text
http://localhost:5000/api-docs
~~~

## 3) Testing When Database Is Empty

If students collection has no records, these API responses are expected.

### 3.1 Verify Student

Request:

~~~http
POST http://localhost:5000/api/auth/verify-student
Content-Type: application/json

{
  "studentId": "STU101",
  "mobileNumber": "9876543210"
}
~~~

Expected response:

~~~json
{
  "message": "Student not found"
}
~~~

### 3.2 Send OTP

Request:

~~~http
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "studentId": "STU101"
}
~~~

Expected response:

~~~json
{
  "message": "Student not found"
}
~~~

### 3.3 Login

Request:

~~~http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "studentId": "STU101",
  "password": "123456"
}
~~~

Expected response:

~~~json
{
  "message": "Student not found"
}
~~~

This confirms your API validation is working correctly before data insertion.

## 4) Insert Real Student Data (No Seed Script)

Use one of these production-aligned methods.

### Method A: MongoDB Compass (Manual)

1. Open MongoDB Compass.
2. Connect using your MONGODB_URI from .env.
3. Open database studentPortal (or the database in your URI).
4. Open collection students.
5. Insert document with hashed password only.

Important: Do not insert plain text password manually unless you hash it first.

### Method B: Admin API or Onboarding Flow (Recommended for Production)

Create student records only through a controlled backend admin flow so passwords are hashed by model hooks and validation rules are enforced consistently.

## 5) Example Student Data (For Testing Only)

~~~json
[
  {
    "name": "Sai Charan",
    "studentId": "STU101",
    "mobileNumber": "9876543210",
    "email": "sai@example.com",
    "password": "123456"
  },
  {
    "name": "Priya Nair",
    "studentId": "STU102",
    "mobileNumber": "9123456780",
    "email": "priya@example.com",
    "password": "123456"
  }
]
~~~

## 6) Full Thunder Client Test Flow (After Creating Student Record)

### Step 1: Verify Student

~~~http
POST http://localhost:5000/api/auth/verify-student
{
  "studentId": "STU101",
  "mobileNumber": "9876543210"
}
~~~

Expected:

~~~json
{
  "message": "Student verified"
}
~~~

### Step 2: Send OTP

~~~http
POST http://localhost:5000/api/auth/send-otp
{
  "studentId": "STU101"
}
~~~

Expected in development mode:

~~~json
{
  "message": "OTP generated",
  "otp": "123456",
  "expiresAt": "2026-03-14T12:00:00.000Z",
  "emailStatus": "sent"
}
~~~

Note:
- emailStatus can be not-sent in development if SMTP env vars are empty.
- In production mode, OTP is not returned in API response.

### Step 3: Verify OTP

~~~http
POST http://localhost:5000/api/auth/verify-otp
{
  "studentId": "STU101",
  "otp": "<otp-from-send-otp-response>"
}
~~~

Expected:

~~~json
{
  "message": "OTP verified. You can login now."
}
~~~

### Step 4: Login

~~~http
POST http://localhost:5000/api/auth/login
{
  "studentId": "STU101",
  "password": "123456"
}
~~~

Expected:

~~~json
{
  "token": "JWT_TOKEN"
}
~~~

### Step 5: Get Profile (Protected)

~~~http
GET http://localhost:5000/api/auth/profile
Authorization: Bearer JWT_TOKEN
~~~

Expected:

~~~json
{
  "_id": "...",
  "name": "Sai Charan",
  "studentId": "STU101",
  "mobileNumber": "9876543210",
  "email": "sai@example.com",
  "createdAt": "..."
}
~~~

## 7) Common Testing Errors and Fixes

- Student not found:
  - Create student record first in MongoDB or through admin onboarding flow.
- Invalid OTP:
  - Use latest OTP from send-otp response.
- Expired OTP:
  - OTP expires in 5 minutes. Generate new OTP.
- Wrong password:
  - Verify you are using the correct password for the stored student record.
- Invalid JWT token:
  - Copy token exactly from login response.
- Failed to deliver OTP in production:
  - Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in .env.

## 8) Reset and Re-Test Quickly (Without Seed)

To re-test from a clean state:

1. Delete students collection from MongoDB Compass (or drop relevant records).
2. Test empty database responses.
3. Re-create required student records manually.
4. Re-run full Thunder Client flow.

## 9) API Testing Completion Summary

Status: Completed on 2026-03-14.

Validated endpoints:

- POST /api/auth/verify-student
- POST /api/auth/send-otp
- POST /api/auth/verify-otp
- POST /api/auth/login
- GET /api/auth/profile (with Bearer token)

Validated scenarios:

- Empty database responses return Student not found as expected.
- Student-record flow works end-to-end: verify -> OTP generation -> OTP verification -> login -> profile.
- Protected route access works with valid JWT token.
- OTP verification clears otp and otpExpiry after successful verification.

Known behavior in development:

- If SMTP environment variables are missing, send-otp can still return OTP in response for local testing.

## 10) Production Readiness Checklist

Use this checklist before releasing.

### Security Controls

- [ ] Set a strong JWT_SECRET and rotate it periodically.
- [ ] Enforce strict CORS origin allowlist instead of open default.
- [ ] Add rate limiting for /send-otp, /verify-otp, and /login to prevent brute force attempts.
- [ ] Add account lockout or cooldown after repeated wrong OTP/password attempts.
- [ ] Ensure NODE_ENV=production so OTP is never returned in API responses.
- [ ] Avoid logging sensitive values (OTP, tokens, credentials) in production logs.

### Input and Data Validation

- [ ] Validate and sanitize request payloads (studentId format, mobile number format, OTP format).
- [ ] Enforce password policy for all users.
- [ ] Add unique index checks and clear API messages for duplicate studentId/email creation flows.

### Reliability and Observability

- [ ] Add centralized structured logging with request IDs.
- [ ] Add health endpoint and monitoring alerts (error rate, latency, OTP delivery failure).
- [ ] Verify MongoDB backups and restore process.

### Deployment Configuration

- [ ] Configure all required environment variables:
  - MONGO_URI or MONGODB_URI
  - DB_NAME (if URI has no db name)
  - JWT_SECRET
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_SECURE
  - SMTP_USER
  - SMTP_PASS
  - SMTP_FROM
  - NODE_ENV=production
- [ ] Run dependency audit and patch vulnerabilities before deployment.
- [ ] Keep Swagger docs internal or protected in production.

### Suggested Pre-Release Commands

~~~powershell
npm install
npm start
~~~

Then re-run the full API flow from Section 6 with production-safe configuration.
