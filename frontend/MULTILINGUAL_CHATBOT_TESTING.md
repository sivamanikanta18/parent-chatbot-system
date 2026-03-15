# Multilingual Chatbot Testing Guide

## Purpose

Use this guide to verify that the chatbot returns responses in the parent requested language while preserving real student data correctly.

## Scope Covered

- Language detection from parent query
- Translation output quality and readability
- Data preservation during translation (numbers, names, percentages, emails, phone numbers)
- Fallback behavior when no language is specified
- Behavior under translation model quota/rate limits

## Prerequisites

1. Backend is running.
2. Frontend is running.
3. Seed data is loaded (`npm run seed:demo`).
4. You are logged in and can access `/chatbot`.
5. Backend `.env` has Gemini config:
   - `GEMINI_API_KEY=<your_key>`
   - `GEMINI_TRANSLATION_MODEL=models/gemini-2.5-flash`
   - `GEMINI_MODEL=<your_general_model>`

## Start Commands

### Backend

~~~powershell
cd backend
npm run seed:demo
npm run dev
~~~

### Frontend

~~~powershell
cd frontend
npm run dev
~~~

## Login Test Account (Example)

- Student ID: `231FA04331`
- Mobile Number: `9001101111`
- OTP destination email: `231fa04331@gmail.com`

## Important Usage Rule

Language must be requested in the same message as the academic query.

Correct:
- `What is my child's attendance? Please answer in Telugu.`

Not recommended for translation switch:
- `telugu`

## Test Scenarios

### Scenario 1: Default English Response

Query:
- `Show subject marks`

Expected:
- Response is in English.
- Student data values are correct.

### Scenario 2: Telugu Translation

Query:
- `What is my child's attendance? Please answer in Telugu.`

Expected:
- Response is in Telugu.
- Values like percentages and numbers are unchanged.

### Scenario 3: Hindi Translation

Query:
- `Show faculty details in Hindi.`

Expected:
- Response is in Hindi.
- Faculty names, emails, and phone numbers are unchanged.

### Scenario 4: Tamil Translation

Query:
- `Show fee statement with payment history in Tamil.`

Expected:
- Response is in Tamil.
- Amounts, dates, references remain unchanged.

### Scenario 5: Kannada Translation

Query:
- `Show my academic status report in Kannada.`

Expected:
- Response is in Kannada.
- Backlog count, completion percentage remain unchanged.

### Scenario 6: Bengali Translation

Query:
- `Show current, year-wise and semester-wise CGPA in Bengali.`

Expected:
- Response is in Bengali.
- CGPA values and numeric periods remain unchanged.

### Scenario 7: Urdu Translation

Query:
- `Any upcoming exams? Reply in Urdu.`

Expected:
- Response is in Urdu.
- Dates and titles remain unchanged.

## Data Integrity Checklist (Must Pass)

For every translated response, verify:

1. Names are unchanged.
2. Emails are unchanged.
3. Phone numbers are unchanged.
4. Numeric values and percentages are unchanged.
5. Bullet structure is preserved and readable.
6. Meaning matches English version.

## Language Coverage Matrix

Test at least one query each for:

- Hindi
- Telugu
- Tamil
- Kannada
- Malayalam
- Marathi
- Bengali
- Gujarati
- Punjabi
- Urdu
- Odia
- Assamese

## API/Response Validation (Optional but Recommended)

Use browser network tab for `/api/chatbot/query` and confirm:

- `responseText` is translated text.
- `responseLanguage` matches requested language.
- `data` remains consistent with real student records.

## Troubleshooting

### Response still in English

Possible causes:

1. Language not included in same query sentence.
2. Translation model quota/rate limit reached.
3. Backend not restarted after `.env` changes.

Fix:

1. Retry with explicit request in same message.
2. Wait 1 to 2 minutes and retry.
3. Restart backend.
4. Confirm `.env` has valid `GEMINI_API_KEY` and `GEMINI_TRANSLATION_MODEL`.

### Translation quality looks inconsistent

Fix:

1. Retry same query once.
2. Keep query simple and direct.
3. Use explicit format: `Please answer in <language>.`

### Mixed language output

Fix:

1. Include language request clearly at the end of query.
2. Avoid very long, multi-intent sentences in one message.

## Demo-Ready Query Set

Use this exact sequence in chatbot:

1. `What is my child's attendance? Please answer in Telugu.`
2. `Show subject marks in Hindi.`
3. `Show fee statement with payment history in Tamil.`
4. `Show faculty details in Kannada.`
5. `Show current, year-wise and semester-wise CGPA in Bengali.`
6. `Any assignment deadlines? Reply in Urdu.`

If all above pass with correct language + unchanged data values, multilingual support is validated.
