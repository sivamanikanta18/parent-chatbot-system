# Parent Verification and Student Information Chatbot Frontend

Professional React frontend for parent authentication and student academic insights.

## Tech Stack

- React + Vite
- React Router DOM
- Axios
- Tailwind CSS
- Framer Motion
- Context API

## Run the Frontend

From the `frontend` folder:

~~~powershell
npm install
npm run dev
~~~

Default URL:

~~~text
http://localhost:5173
~~~

## Backend Connection

Backend base URL defaults to:

~~~text
http://localhost:5000/api
~~~

To override, create `.env` in `frontend`:

~~~env
VITE_API_BASE_URL=http://localhost:5000/api
~~~

## Authentication Flow

1. Parent enters student registration number and parent email.
2. Frontend calls:
	- `POST /api/auth/verify-student`
	- `POST /api/auth/send-otp`
3. Parent verifies OTP via `POST /api/auth/verify-otp`.
4. JWT token is stored in localStorage.
5. Protected routes enabled:
	- `/dashboard`
	- `/chatbot`
	- `/notifications`

## Core Pages

- Home
- Login
- OTP Verification
- Dashboard
- Chatbot

## Main API Integrations

- Attendance: `/api/attendance/overall/:studentId`
- Performance: `/api/performance/cgpa/:studentId`
- Fees: `/api/finance/status/:studentId`
- Notifications: `/api/notifications`
- Chatbot: `POST /api/chatbot/query`

## Build

~~~powershell
npm run build
npm run preview
~~~

## Notes

- Navbar includes Home, Dashboard, Chatbot, Notifications, Logout.
- Dashboard uses live backend data for cards and notifications.
- Chatbot page supports natural-language academic queries.
