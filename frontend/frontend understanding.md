# Frontend Understanding

## Why This Folder Was Created

The `frontend` folder contains the complete user interface for the Parent Verification and Student Information Chatbot System.

It was created to:

- Provide a secure parent-facing web application for authentication and academic access.
- Consume backend APIs built with Node.js, Express.js, MongoDB, JWT authentication, and Email OTP.
- Deliver a modern university-style experience for attendance, CGPA, fee, notifications, and chatbot interactions.
- Keep UI logic separated from backend logic for cleaner development, testing, and deployment.

## Frontend Responsibilities

The frontend is responsible for:

- Rendering all web pages and user interactions.
- Collecting login details and handling OTP verification flow.
- Storing JWT token after successful authentication.
- Calling protected backend APIs with token in headers.
- Showing academic data to parents in readable cards and chatbot responses.
- Handling API loading, success, and error states.
- Supporting mobile, tablet, and desktop views.

## High-Level Architecture

- Framework: React + Vite
- Styling: Tailwind CSS + theme variables
- Routing: React Router DOM
- API calls: Axios
- Animations: Framer Motion
- Auth State: Context API (`AuthContext`)

## Folder and File Responsibilities

### Root Files

- `package.json`
  - Defines dependencies, scripts (`dev`, `build`, `preview`).

- `package-lock.json`
  - Locks exact dependency versions for consistent installs.

- `vite.config.js`
  - Vite bundler config.

- `tailwind.config.js`
  - Tailwind theme extension (colors, shadows, custom backgrounds).

- `postcss.config.js`
  - PostCSS pipeline setup for Tailwind + Autoprefixer.

- `index.html`
  - HTML shell where React app mounts.

- `.gitignore`
  - Excludes build artifacts, node modules, and local-only files from git.

- `README.md`
  - Project run/build and backend connection guide.

### src Core Files

- `src/main.jsx`
  - Frontend entrypoint.
  - Wraps app with `BrowserRouter` and `AuthProvider`.
  - Imports global CSS/theme.

- `src/App.jsx`
  - Main layout shell.
  - Configures routes and protected routes.
  - Includes Navbar and Footer globally.

- `src/index.css`
  - Tailwind base/components/utilities import.
  - Global baseline styles.

- `src/App.css`
  - Minimal placeholder (most styling moved to Tailwind/theme).

### src/styles

- `src/styles/theme.css`
  - Design system values (color palette, typography, card style, shadows).
  - Shared visual identity across pages/components.

### src/context

- `src/context/AuthContext.jsx`
  - Global auth state manager.
  - Stores token/studentId/profile state.
  - Provides login completion, logout, profile refresh, and auth status.
  - Persists authentication details in localStorage.

### src/services

- `src/services/api.js`
  - Central Axios instance with API base URL.
  - JWT request interceptor adds Authorization header automatically.
  - Exposes grouped API helpers:
    - `authApi`
    - `attendanceApi`
    - `performanceApi`
    - `financeApi`
    - `notificationApi`
    - `facultyApi`
    - `chatbotApi`

### src/components

- `Navbar.jsx`
  - Top navigation menu.
  - Shows public/protected links based on auth state.
  - Handles logout.

- `Footer.jsx`
  - Footer with system description and contact details.

- `HeroSection.jsx`
  - Landing page hero banner and call-to-action area.

- `FeatureCards.jsx`
  - Home page feature overview cards.

- `ChatbotWidget.jsx`
  - Chat UI with message history and loading indicator.
  - Sends query to backend chatbot API and renders response.

- `AttendanceCard.jsx`
  - Dashboard card for overall attendance.

- `CGPACard.jsx`
  - Dashboard card for current CGPA and credits.

- `FeeCard.jsx`
  - Dashboard card for pending fee and payment summary.

### src/pages

- `Home.jsx`
  - Landing page composition (hero + why use + features).

- `Login.jsx`
  - Parent login page.
  - Calls verify student and send OTP APIs.

- `OTPVerification.jsx`
  - OTP verification page.
  - Verifies OTP and completes JWT login flow.

- `Dashboard.jsx`
  - Parent dashboard.
  - Loads attendance, performance, fee status, and notifications.

- `ChatbotPage.jsx`
  - Dedicated chatbot interaction page.

### src/assets

- Contains static assets (images/icons) if needed by UI.

## Route Responsibilities

- `/`
  - Public home page.

- `/login`
  - Public OTP initiation.

- `/verify-otp`
  - Public OTP verification step.

- `/dashboard`
  - Protected parent dashboard (requires JWT).

- `/chatbot`
  - Protected chatbot page (requires JWT).

- `/notifications`
  - Protected route currently mapped to dashboard notifications section.

## API Integration Details

Default API base URL:

- `http://localhost:5000/api`

Can be overridden with:

- `VITE_API_BASE_URL` in frontend `.env`

JWT handling:

- Token is saved in localStorage (`token` key).
- Axios interceptor appends `Authorization: Bearer <token>` automatically.

## Authentication Flow Summary

1. Parent enters student registration number and parent email.
2. Frontend verifies student and requests OTP.
3. Parent enters OTP on verification page.
4. On success, JWT is stored.
5. Parent can access protected dashboard and chatbot routes.

## Data Flow Summary

- UI Event -> Page Handler -> Service (`api.js`) -> Backend API -> JSON Response -> Component state -> Rendered UI.

## Error Handling Strategy

Frontend handles:

- Validation failures (missing inputs).
- API errors (invalid OTP, student not found, token issues).
- Network failures and fallback messages.
- Empty state rendering for missing data.

## Styling and UX Guidelines Used

- University-themed palette and typography.
- Consistent card-based layout.
- Tailwind utility classes for maintainable styling.
- Framer Motion for subtle transitions and polished interactions.

## How to Run

From `frontend` directory:

~~~powershell
npm install
npm run dev
~~~

Build production bundle:

~~~powershell
npm run build
npm run preview
~~~

## What To Update If Backend API Changes

- Update endpoint paths or payload formats in `src/services/api.js`.
- Update corresponding page logic where requests are called.
- Keep `AuthContext` token flow unchanged unless auth contract changes.

## Maintenance Checklist

- Keep dependencies updated (`npm outdated`).
- Verify protected routes after auth-related backend changes.
- Re-test dashboard and chatbot after API schema updates.
- Ensure theme consistency for all new UI components.
