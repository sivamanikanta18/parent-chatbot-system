# Frontend Testing With Seed Data

## Purpose

Use this document to test the frontend end-to-end using the seeded backend demo records.

## Pre-Checks

1. Backend is running on port 5000.
2. Frontend is running on port 5173.
3. Demo data is seeded in MongoDB.

## Start Commands

### Backend

Run from backend folder:

~~~powershell
npm run seed:demo
npm run dev
~~~

### Frontend

Run from frontend folder:

~~~powershell
npm run dev
~~~

Frontend URL:

- http://localhost:5173

## Seed Login Credentials (Frontend)

Use one of these records in the login screen.

| Student ID | Mobile Number | Student Email (OTP destination) |
|---|---|---|
| 231FA04331 | 9001101111 | 231fa04331@gmail.com |
| 231FA04332 | 9001102222 | 231fa04332@gmail.com |
| 231FA04355 | 9001103333 | 231fa04355@gmail.com |
| 231FA04334 | 9001104444 | 231fa04334@gmail.com |

## Seed Student Master Data

| Student ID | Name | Department | Year | Parent Email |
|---|---|---|---|---|
| 231FA04331 | PADARTHI VENKATA SAI CHARAN | CSE | 3 | 231fa04331@gmail.com |
| 231FA04332 | POTHURAJU SIVAMANIKANTA | CSE | 3 | 231fa04332@gmail.com |
| 231FA04355 | RAMIREDDY GNANESWAR REDDY | CSE | 3 | 231fa04355@gmail.com |
| 231FA04334 | PULIPAKA RISHI SARAN | CSE | 3 | 231fa04334@gmail.com |

Important:

- Login page verifies student using Student ID + Mobile Number.
- OTP is sent to the student's email from seed data.

## Frontend Test Flow

### Step 1: Login Page

1. Open http://localhost:5173/login
2. Enter Student Registration Number and Registered Mobile Number.
3. Click Send OTP.

Expected:

- Success message appears.
- Redirect to OTP verification page.

### Step 2: OTP Verification Page

1. Check the student's email inbox for OTP.
2. Enter OTP.
3. Click Verify OTP.

Expected:

- Redirect to Dashboard after JWT token is returned by verify-otp and stored.

### Step 3: Dashboard Validation

On /dashboard verify these load successfully:

- Attendance Summary Card
- CGPA Card
- Fee Status Card
- Academic Notifications

Expected data examples from seed:

- 231FA04334 includes Operating Systems backlog-like mark (37, grade F)
- 231FA04331 pending fee: 25000
- 231FA04332 pending fee: 0
- 231FA04355 pending fee: 30000 (with scholarship 20000)
- 231FA04334 pending fee: 62000 (with scholarship 10000)
- Notifications count at least 3
- Each notification shows a Download PDF button

### Step 4: Chatbot Validation

Go to /chatbot and test queries:

- What is my child attendance?
- Show semester CGPA
- Any pending fees?
- Show subject marks

Expected:

- Bot returns structured data for the authenticated student.

### Step 4.1: Chat Download Validation

In /chatbot, test these queries:

- Show subject-wise attendance report
- Show semester-wise attendance report
- Show subject marks
- Show current, year-wise and semester-wise CGPA
- Show my academic status report
- Show fee statement with payment history

Expected:

- Chat response includes download buttons inside the assistant message.
- Attendance buttons download both CSV and PDF files for subject-wise and semester-wise attendance.
- Marks query shows Download Marks Report (CSV/PDF).
- CGPA query shows Download CGPA Progress (CSV/PDF).
- Academic status query shows Download Academic Status (CSV/PDF).
- Finance query shows Download Fee Statement and Download Payment History (CSV/PDF).

### Step 5: Notification PDF Download Validation

In Dashboard > Academic Notifications:

1. Click Download PDF on exam notification.
2. Click Download PDF on assignment notification.
3. Click Download PDF on calendar notification.

Expected files:

- mock-exam-timetable.pdf
- mock-assignment-details.pdf
- mock-academic-calendar.pdf

Expected:

- Browser downloads the corresponding mock PDF file for each notification type.

## API Calls Triggered From Frontend

Login flow:

- POST /api/auth/verify-student
- POST /api/auth/send-otp
- POST /api/auth/verify-otp

Dashboard:

- GET /api/attendance/overall/:studentId
- GET /api/performance/cgpa/:studentId
- GET /api/finance/status/:studentId
- GET /api/notifications

Chatbot:

- POST /api/chatbot/query

## Quick Troubleshooting

### Student not found

- Re-run seed command in backend:

~~~powershell
npm run seed:demo
~~~

- Ensure Student ID and Mobile Number pair matches table.

### OTP not received

- Check SMTP credentials in backend .env.
- Confirm SMTP server log says ready.
- In development mode, verify send-otp response may include otp and emailStatus.

### OTP verified but not redirected

- Confirm verify-otp API response includes `token`.
- Clear browser sessionStorage and retry login flow.

### Invalid JWT token on dashboard/chatbot

- Logout and login again.
- Ensure token exists in browser sessionStorage.

## Recommended Test Matrix

Run this for each student (231FA04331, 231FA04332, 231FA04355, 231FA04334):

1. Login and OTP verify
2. Dashboard data visible
3. Chatbot responds
4. Logout and re-login

If all pass, frontend + backend integration is validated with seed data.
