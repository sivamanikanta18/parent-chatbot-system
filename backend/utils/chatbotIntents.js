const INTENT_KEYS = [
  "attendance",
  "marks",
  "cgpa",
  "subjects",
  "faculty",
  "finance",
  "notifications",
  "academic_status",
  "exam_timetable",
  "academic_calendar",
  "help",
  "unknown",
];

const KEYWORD_INTENT_MAP = {
  attendance: [
    "attendance",
    "overall attendance",
    "overall attendance percentage",
    "subject-wise attendance",
    "semester-wise attendance",
    "semester attendance",
    "low attendance",
    "attendance alert",
    "classes",
    "present",
    "absent",
    "attend",
  ],
  marks: ["marks", "score", "subject marks", "grade", "result", "subject-wise marks"],
  cgpa: [
    "cgpa",
    "gpa",
    "performance",
    "current cgpa",
    "semester cgpa",
    "semester-wise cgpa",
    "year wise cgpa",
    "year-wise cgpa",
    "overall grade",
    "strong subjects",
    "weak subjects",
    "improvement suggestions",
  ],
  subjects: ["subjects", "course", "course completion", "completion status", "incomplete subjects", "completed"],
  faculty: [
    "faculty",
    "teacher",
    "advisor",
    "class advisor",
    "mentor",
    "professor",
    "academic office",
    "office contacts",
  ],
  finance: [
    "fee",
    "fees",
    "fee payment status",
    "payment",
    "paid",
    "pending",
    "scholarship",
    "payment history",
    "transactions",
  ],
  notifications: [
    "notification",
    "notice",
    "announcement",
    "circular",
    "updates",
    "upcoming exams",
    "assignment",
    "assignment deadline",
    "deadline",
    "academic calendar",
  ],
  academic_status: [
    "backlog",
    "number of backlogs",
    "repeated subjects",
    "incomplete subjects",
    "arrear",
    "failed",
    "academic status",
    "course status",
    "course completion status",
  ],
  exam_timetable: ["exam timetable", "exam schedule", "examination", "mid sem", "time table"],
  academic_calendar: ["calendar", "academic calendar", "holiday", "important dates", "semester dates"],
  help: ["help", "what can you do", "options", "support", "available queries", "logout", "log out"],
};

const RESPONSE_TEMPLATES = {
  attendance: "Here is your child's attendance summary.",
  marks: "Here are your child's latest marks details.",
  cgpa: "Here is your child's CGPA summary.",
  subjects: "Here is your child's subject status.",
  faculty: "Here are the faculty contact details.",
  finance: "Here is your child's fee summary.",
  notifications: "Here are the latest academic notifications.",
  academic_status: "Here is your child's academic status summary.",
  exam_timetable: "Here is the latest exam timetable information.",
  academic_calendar: "Here is the latest academic calendar information.",
  help: "I can help with attendance, academic status, CGPA insights, subject marks, fees with payment history, notifications, faculty and advisor contacts, and exam/calendar updates.",
  unknown: "I couldn't understand that request clearly.",
};

const fallbackDetectIntent = (queryText = "") => {
  const text = String(queryText).toLowerCase();

  for (const [intent, keywords] of Object.entries(KEYWORD_INTENT_MAP)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return intent;
    }
  }

  return "unknown";
};

module.exports = {
  INTENT_KEYS,
  KEYWORD_INTENT_MAP,
  RESPONSE_TEMPLATES,
  fallbackDetectIntent,
};
