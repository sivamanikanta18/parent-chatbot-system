# Chatbot Blueprint: Gemini Intent + Backend Data APIs

## Architecture (Hackathon-Friendly)

Use Gemini only for intent detection. Do not use Gemini as the source of academic truth.

Flow:

1. Parent sends natural language query
2. Backend sends query to Gemini intent detector
3. Gemini returns one intent label
4. Backend calls internal MongoDB-backed service/controller logic
5. Backend formats response
6. Frontend shows structured answer

This ensures accuracy, security, and auditability.

## Where to Add Gemini API Key

Add in backend `.env`:

~~~env
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
~~~

## Supported Intents

- attendance
- marks
- cgpa
- subjects
- faculty
- exam_timetable
- academic_calendar
- help

## Intent Training Dataset (30+ per intent)

### Intent: attendance

1. What is my child's attendance?
2. Show attendance percentage.
3. How many classes did my child attend?
4. Attendance report please.
5. Is attendance above required level?
6. Can I see overall attendance?
7. Give me semester attendance details.
8. Subject-wise attendance please.
9. Attendance for this semester.
10. How much attendance does my child have now?
11. I need attendance summary.
12. Show attendance status.
13. Is attendance below 75 percent?
14. Get me attendance analytics.
15. Attendance details for all subjects.
16. Please check current attendance.
17. What's the attendance trend?
18. Attendance dashboard data.
19. Show attended and total classes.
20. How many classes were missed?
21. Tell me if attendance is low.
22. Is my child eligible by attendance?
23. Give complete attendance report.
24. Show class attendance ratio.
25. Overall class presence details.
26. Attendance in each course.
27. Fetch attendance record.
28. Any low attendance alerts?
29. Show my child's attendance details now.
30. Attendance update please.

### Intent: marks

1. Show my child's marks.
2. Subject marks report please.
3. What marks did my child score?
4. Give marks by subject.
5. Latest marks details.
6. Show exam marks.
7. Marks in all subjects.
8. I need mark sheet data.
9. Display score summary.
10. Show internal marks.
11. Show semester marks.
12. Marks report for this term.
13. What are the current scores?
14. Please provide marks summary.
15. Subject-wise score details.
16. Show best and low marks.
17. Give marks with grades.
18. Fetch marks for all papers.
19. Has my child failed any subject?
20. Show score card.
21. Marks and grade details.
22. Show recent exam performance marks.
23. I want marks breakdown.
24. What are the obtained marks?
25. Can you show marks history?
26. Show marks attempts.
27. Marks data from portal.
28. Complete marks overview.
29. Score details please.
30. Show my child subject results.

### Intent: cgpa

1. What is my child's CGPA?
2. Show current CGPA.
3. Give CGPA report.
4. Semester-wise CGPA please.
5. Year-wise CGPA details.
6. How is overall academic performance?
7. Show GPA trend.
8. Provide cumulative GPA.
9. What's the latest CGPA?
10. Display CGPA summary.
11. How many credits and CGPA?
12. CGPA by semester.
13. CGPA by year.
14. Show academic index.
15. Give me performance index.
16. Is CGPA improving?
17. Tell CGPA with credits.
18. Current grade point average.
19. Overall result quality check.
20. I need CGPA details now.
21. Show progression in CGPA.
22. CGPA status report.
23. How is my child performing overall?
24. Show cumulative score performance.
25. Get CGPA analytics.
26. Display weighted grade average.
27. Give latest GPA values.
28. Show total credits earned and CGPA.
29. Academic score summary please.
30. CGPA information now.

### Intent: subjects

1. Show subject status.
2. Which subjects are completed?
3. Any backlog subjects?
4. List incomplete subjects.
5. Show course completion status.
6. What subjects are pending?
7. Subject-wise completion report.
8. Course progress details please.
9. Backlog and repeated subjects.
10. Show all registered subjects.
11. Subject completion percentage.
12. Which papers are not cleared?
13. Give me subject overview.
14. Show failed subjects.
15. Reattempt subjects list.
16. Completion report by subject.
17. Course status in detail.
18. Subject list and status.
19. Any arrears in subjects?
20. How many subjects are done?
21. Pending papers details.
22. Show cleared and uncleared subjects.
23. Subject completion dashboard.
24. Academic course status update.
25. Subject progress check.
26. List all completed courses.
27. Show ongoing and incomplete subjects.
28. Backlog report now.
29. Subject performance status.
30. Can you show subject completion?

### Intent: faculty

1. Show faculty contact details.
2. Give teacher contact information.
3. Who is the subject faculty?
4. Show class advisor details.
5. Faculty list please.
6. How can I contact subject teacher?
7. Display faculty email and phone.
8. Advisor contact for my child's class.
9. Show professor details.
10. Need faculty information.
11. Who teaches Data Structures?
12. Faculty details by subject.
13. Show mentor details.
14. Academic office contact please.
15. Class in-charge contact.
16. Faculty directory for parent.
17. Subject teacher phone number.
18. Teacher email details.
19. Show advisor office room.
20. Contact details of professors.
21. Get faculty profile list.
22. Faculty support contacts.
23. Show all faculty contacts.
24. Subject wise faculty details.
25. Academic advisor information.
26. Whom should I contact for marks?
27. Show teacher contact card.
28. Need faculty and advisor details.
29. Can you give faculty contacts?
30. Faculty details now.

### Intent: exam_timetable

1. Show exam timetable.
2. I need exam schedule.
3. When are the exams?
4. Mid-sem timetable please.
5. End-sem exam dates.
6. Display exam calendar.
7. Show upcoming exam plan.
8. Exam time table for this semester.
9. Download exam timetable.
10. Any exam updates?
11. Show test schedule.
12. Semester exam schedule now.
13. What is the next exam date?
14. Give me exam routine.
15. Exam plan by subject.
16. Show latest exam notification.
17. Upcoming exam information.
18. Parent exam timetable details.
19. Exam date sheet please.
20. Show practical exam schedule.
21. Is timetable released?
22. Exam slot details.
23. Need exam dates and time.
24. Show exam document.
25. Send exam schedule details.
26. Display university exam timetable.
27. Timetable for upcoming assessments.
28. Show exam PDF.
29. I want my child exam schedule.
30. Exam timetable now.

### Intent: academic_calendar

1. Show academic calendar.
2. I need university calendar.
3. Important academic dates.
4. Semester start and end dates.
5. Holiday and break schedule.
6. Show calendar updates.
7. Academic events timeline.
8. Download academic calendar.
9. University date schedule please.
10. Show term dates.
11. Academic year plan.
12. Calendar for current semester.
13. Any calendar announcement?
14. Show updated calendar.
15. Important deadline dates.
16. Academic schedule details.
17. Show study calendar.
18. Semester timeline please.
19. Calendar notifications.
20. Show all key dates.
21. Summer break dates.
22. Calendar PDF needed.
23. Academic session details.
24. University working days info.
25. Show exam and holiday dates.
26. Calendar release information.
27. Date plan for this term.
28. Show semester milestones.
29. Parent view of academic calendar.
30. Academic calendar now.

### Intent: help

1. Help
2. What can you do?
3. Show available options.
4. What can I ask here?
5. How to use this chatbot?
6. List supported queries.
7. Need guidance.
8. Show menu.
9. Explain chatbot features.
10. Give me help options.
11. What information can you provide?
12. Can you assist me?
13. Show command examples.
14. What topics are supported?
15. How do I get attendance info?
16. How can I check marks?
17. Tell me available services.
18. Chatbot instructions please.
19. Show parent query options.
20. Need usage help.
21. Support options.
22. Help me navigate.
23. What should I ask?
24. Show sample questions.
25. List query categories.
26. I am new, guide me.
27. Start help.
28. Can you explain your functions?
29. Show what this bot can fetch.
30. I need chatbot help now.

## Response Templates

- attendance: "Here is your child's attendance summary."
- marks: "Here are your child's latest marks details."
- cgpa: "Here is your child's CGPA summary."
- subjects: "Here is your child's subject status."
- faculty: "Here are the faculty contact details."
- exam_timetable: "Here is the latest exam timetable information."
- academic_calendar: "Here is the latest academic calendar information."
- help: "I can help with attendance, marks, CGPA, subjects, faculty, exam timetable, and academic calendar."
- fallback: "I'm sorry, I couldn't understand your question. You can ask about Attendance, Marks, CGPA, Subjects, Faculty, Exam timetable, or Academic calendar."

## Conversation Examples

### Example 1

User: How is my child performing?

Bot:
Here is your child's CGPA summary.

CGPA: 6.18
Total Credits: 11

### Example 2

User: Show attendance percentage.

Bot:
Here is your child's attendance summary.

Overall Attendance: 92%
Total Attended Classes: 184
Total Classes: 200

### Example 3

User: Show exam timetable.

Bot:
Here is the latest exam timetable information.

You can download the timetable PDF from the notification attachment link.

### Example 4 (Fallback)

User: Tell me something random.

Bot:
I'm sorry, I couldn't understand your question.

You can ask about:
- Attendance
- Marks
- CGPA
- Subjects
- Faculty
- Exam timetable
- Academic calendar

## Chatbot UI Recommendations (Applied/Recommended)

1. Automatic scrolling to latest message
2. Typing indicator
3. Message bubbles for user/bot
4. Suggested question chips
5. Responsive mobile layout
6. Smooth entry animation
7. Scrollable chat window
8. Loading state on send
9. Message timestamp
10. Error message styling
11. Clear chat button
12. Voice input support (browser dependent)
13. Dark mode toggle
14. Chat history persistence (localStorage)
15. Friendly greeting on first load

## Notes for Judges

- Gemini is used only to classify intent.
- Academic values come from backend APIs/MongoDB.
- JWT authorization controls access to student-specific records.
- This pattern avoids hallucinated academic data and ensures reliable responses.
