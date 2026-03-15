# Parent Verification and Student Information Chatbot Backend Guide

## 1) Installation Commands

Run from backend folder:

~~~powershell
npm install
npm run dev
~~~

If you want production mode:

~~~powershell
npm start
~~~

## 2) Folder Structure Added

- models: Parent, Attendance, Subject, Marks, Semester, Fees, Notification, Faculty
- controllers: student, attendance, performance, finance, notification, faculty, chatbot
- routes: student, attendance, performance, finance, notification, faculty, chatbot
- utils: cgpaCalculator, studentAccess

## 3) Security and Access Control

- All new APIs are protected by JWT middleware.
- Access is restricted so authenticated studentId in token must match path studentId.
- Unauthorized data access returns 403.

## 4) API Endpoints

### Attendance

- GET /api/attendance/overall/:studentId
- GET /api/attendance/subject/:studentId
- GET /api/attendance/semester/:studentId

### Academic Status

- GET /api/student/backlogs/:studentId
- GET /api/student/course-status/:studentId

### Performance

- GET /api/performance/cgpa/:studentId
- GET /api/performance/semester/:studentId
- GET /api/performance/marks/:studentId

### Finance

- GET /api/finance/status/:studentId
- GET /api/finance/history/:studentId

### Notifications

- GET /api/notifications

### Faculty

- GET /api/faculty
- GET /api/faculty/:subject

Notes:
- Chatbot faculty responses now include class advisor details (based on student department/year).
- Chatbot faculty responses also include academic office contact details.

### Chatbot

- POST /api/chatbot/query

## 5) Example Requests

Use Authorization header for all endpoints except /api/auth routes:

~~~text
Authorization: Bearer <JWT_TOKEN>
~~~

### Overall Attendance

~~~http
GET /api/attendance/overall/STU101
~~~

Example response:

~~~json
{
  "student": {
    "name": "Sai Charan",
    "studentId": "STU101"
  },
  "summary": {
    "overallAttendance": 83.33,
    "totalAttendedClasses": 250,
    "totalClasses": 300,
    "threshold": 75,
    "lowAttendanceCount": 1
  },
  "lowAttendanceSubjects": [
    {
      "subject": "Physics",
      "semester": 2,
      "attendedClasses": 30,
      "totalClasses": 50,
      "percentage": 60
    }
  ]
}
~~~

### CGPA Summary

~~~http
GET /api/performance/cgpa/STU101
~~~

Example response:

~~~json
{
  "student": {
    "name": "Sai Charan",
    "studentId": "STU101"
  },
  "currentCgpa": 8.22,
  "totalCredits": 42,
  "semesterWiseCgpa": [
    { "semester": 1, "cgpa": 8.5, "totalCredits": 21 },
    { "semester": 2, "cgpa": 7.94, "totalCredits": 21 }
  ],
  "yearWiseCgpa": [
    { "year": 1, "cgpa": 8.22, "totalCredits": 42 }
  ],
  "insights": {
    "strongThreshold": 75,
    "weakThreshold": 50,
    "strongSubjects": ["Maths", "Chemistry"],
    "weakSubjects": ["Physics"],
    "suggestions": [
      "Prioritize weak subjects with targeted weekly revision and faculty guidance.",
      "Maintain strong subjects and use them to balance overall CGPA."
    ]
  }
}
~~~

### Fee Status

~~~http
GET /api/finance/status/STU101
~~~

### Chatbot Query

~~~http
POST /api/chatbot/query
Content-Type: application/json

{
  "query": "What is my child's attendance?"
}
~~~

Example response:

~~~json
{
  "student": {
    "name": "Sai Charan",
    "studentId": "STU101"
  },
  "query": "What is my child's attendance?",
  "intent": "attendance",
  "data": {
    "overallAttendance": 83.33,
    "totalAttendedClasses": 250,
    "totalClasses": 300
  }
}
~~~

## 6) Error Handling Behavior

Common structured API errors:

~~~json
{ "message": "Student not found" }
~~~

~~~json
{ "message": "No attendance data found" }
~~~

~~~json
{ "message": "Marks not found" }
~~~

~~~json
{ "message": "Invalid JWT token" }
~~~

## 7) Thunder Client Testing Steps

1. Login and copy JWT token from /api/auth/login.
2. In Thunder Client, add header Authorization: Bearer <token>.
3. Hit one endpoint from each module:
   - /api/attendance/overall/:studentId
   - /api/student/backlogs/:studentId
   - /api/performance/cgpa/:studentId
   - /api/finance/status/:studentId
   - /api/notifications
   - /api/faculty
   - /api/chatbot/query
4. Verify success payloads and error payloads by testing invalid studentId.

## 8) Notes

- Data comes from MongoDB collections via Mongoose models.
- CGPA uses utility-based calculation with grade/marks mapping.
- You can extend chatbot intent mapping in chatbotController for richer NLP behavior.
