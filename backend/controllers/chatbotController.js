const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");
const Fees = require("../models/Fees");
const Faculty = require("../models/Faculty");
const Notification = require("../models/Notification");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const { normalizeStudentId } = require("../utils/studentAccess");
const { calculateCGPA, getPerformanceInsights } = require("../utils/cgpaCalculator");
const { detectIntentWithGemini } = require("../utils/geminiIntentDetector");
const { detectRequestedLanguage, translateResponseText } = require("../utils/chatbotTranslation");
const { RESPONSE_TEMPLATES } = require("../utils/chatbotIntents");

const FAIL_GRADES = new Set(["F", "FAIL", "RA", "AB"]);
const ACADEMIC_OFFICE_CONTACTS = [
  {
    office: "Academic Office",
    email: "academic.office@college.edu",
    phone: "9000090001",
    location: "Admin Block - Ground Floor",
  },
  {
    office: "Examination Cell",
    email: "exam.cell@college.edu",
    phone: "9000090002",
    location: "Admin Block - First Floor",
  },
];

const getPercentage = (attended, total) => {
  const totalNum = Number(total) || 0;
  if (!totalNum) return 0;
  return Number((((Number(attended) || 0) / totalNum) * 100).toFixed(2));
};

const getAttendanceSummary = async (studentId) => {
  const records = await Attendance.find({ studentId }).lean();
  if (records.length === 0) {
    return { message: "No attendance data found" };
  }

  const totals = records.reduce(
    (acc, row) => {
      acc.attended += Number(row.attendedClasses) || 0;
      acc.total += Number(row.totalClasses) || 0;
      return acc;
    },
    { attended: 0, total: 0 }
  );

  const percentage = getPercentage(totals.attended, totals.total);

  const subjectWise = records
    .map((item) => ({
      subject: item.subject,
      semester: item.semester,
      attendedClasses: Number(item.attendedClasses) || 0,
      totalClasses: Number(item.totalClasses) || 0,
      percentage: getPercentage(item.attendedClasses, item.totalClasses),
    }))
    .sort((a, b) => String(a.subject).localeCompare(String(b.subject)));

  const semesterMap = records.reduce((acc, item) => {
    const key = String(item.semester || "N/A");
    if (!acc[key]) {
      acc[key] = { attended: 0, total: 0 };
    }
    acc[key].attended += Number(item.attendedClasses) || 0;
    acc[key].total += Number(item.totalClasses) || 0;
    return acc;
  }, {});

  const semesterWise = Object.entries(semesterMap)
    .map(([semester, value]) => ({
      semester: Number(semester),
      attendedClasses: value.attended,
      totalClasses: value.total,
      percentage: getPercentage(value.attended, value.total),
    }))
    .sort((a, b) => a.semester - b.semester);

  const threshold = 75;
  const lowAttendanceSubjects = subjectWise.filter((item) => item.percentage < threshold);

  return {
    overallAttendance: percentage,
    totalAttendedClasses: totals.attended,
    totalClasses: totals.total,
    threshold,
    lowAttendanceSubjects,
    subjectWiseAttendance: subjectWise,
    semesterWiseAttendance: semesterWise,
  };
};

const getMarksSummary = async (studentId) => {
  const records = await Marks.find({ studentId }).sort({ semester: 1, subject: 1, attempt: -1 }).lean();
  if (records.length === 0) {
    return { message: "Marks not found" };
  }

  return {
    totalRecords: records.length,
    subjects: records.map((item) => ({
      subject: item.subject,
      semester: item.semester,
      marks: item.marks,
      grade: item.grade,
      attempt: item.attempt,
    })),
  };
};

const getPerformanceSummary = async (studentId) => {
  const records = await Marks.find({ studentId }).lean();
  if (records.length === 0) {
    return { message: "Marks not found" };
  }

  const cgpa = calculateCGPA(records);
  const insights = getPerformanceInsights(records);

  const semesterMap = records.reduce((acc, item) => {
    const key = String(item.semester || "N/A");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const semesterWiseCgpa = Object.entries(semesterMap)
    .map(([semester, list]) => ({
      semester: Number(semester),
      cgpa: calculateCGPA(list).cgpa,
      totalCredits: calculateCGPA(list).totalCredits,
    }))
    .sort((a, b) => a.semester - b.semester);

  const yearMap = records.reduce((acc, item) => {
    const year = Number(item.year) || Math.ceil((Number(item.semester) || 1) / 2);
    const key = String(year);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const yearWiseCgpa = Object.entries(yearMap)
    .map(([year, list]) => ({
      year: Number(year),
      cgpa: calculateCGPA(list).cgpa,
      totalCredits: calculateCGPA(list).totalCredits,
    }))
    .sort((a, b) => a.year - b.year);

  const subjectWiseMarks = records
    .map((item) => ({
      subject: item.subject,
      semester: item.semester,
      marks: item.marks,
      grade: item.grade,
      attempt: item.attempt,
    }))
    .sort((a, b) => String(a.subject).localeCompare(String(b.subject)));

  return {
    currentCgpa: cgpa.cgpa,
    totalCredits: cgpa.totalCredits,
    totalSubjects: records.length,
    semesterWiseCgpa,
    yearWiseCgpa,
    subjectWiseMarks,
    strongSubjects: insights.strongSubjects,
    weakSubjects: insights.weakSubjects,
    suggestions: insights.suggestions,
  };
};

const getSubjectSummary = async (studentId) => {
  const records = await Marks.find({ studentId }).lean();
  if (records.length === 0) {
    return { message: "Marks not found" };
  }

  const uniqueSubjects = Array.from(new Set(records.map((item) => item.subject))).sort();
  const incompleteSubjects = Array.from(
    new Set(
      records
        .filter((item) => Number(item.marks) < 40 || ["F", "FAIL", "RA", "AB"].includes(String(item.grade || "").toUpperCase()))
        .map((item) => item.subject)
    )
  );

  return {
    totalSubjects: uniqueSubjects.length,
    subjects: uniqueSubjects,
    incompleteSubjects,
  };
};

const getFinanceSummary = async (studentId) => {
  const fees = await Fees.findOne({ studentId }).lean();
  if (!fees) {
    return { message: "Fee record not found" };
  }

  const totalFees = Number(fees.totalFees) || 0;
  const paidAmount = Number(fees.paidAmount) || 0;
  const scholarshipAmount = Number(fees.scholarshipAmount) || 0;
  const pendingAmount = Math.max(totalFees - paidAmount - scholarshipAmount, 0);
  const paymentHistory = Array.isArray(fees.paymentHistory)
    ? [...fees.paymentHistory].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
  const paymentStatus =
    pendingAmount === 0 ? "paid" : paidAmount > 0 || scholarshipAmount > 0 ? "partial" : "pending";

  return {
    totalFees,
    paidAmount,
    scholarshipAmount,
    pendingAmount,
    paymentStatus,
    paymentHistory,
  };
};

const getFacultySummary = async (queryText, subjectFromGemini, student) => {
  const matched = queryText.match(/faculty\s+for\s+([a-zA-Z\s]+)/i);
  const extracted = matched ? matched[1].trim() : null;
  const subject = String(subjectFromGemini || extracted || "").trim() || null;

  const filter = subject ? { subject: { $regex: `^${subject}$`, $options: "i" } } : {};
  const faculty = await Faculty.find(filter).limit(10).lean();

  const advisorFilter = {};
  if (student?.department) {
    advisorFilter.advisorForDepartment = String(student.department).toUpperCase();
  }
  if (student?.year) {
    advisorFilter.advisorForYear = Number(student.year);
  }

  const classAdvisors = await Faculty.find(advisorFilter).sort({ name: 1 }).limit(5).lean();

  return {
    subject,
    count: faculty.length,
    faculty,
    classAdvisors,
    academicOfficeContacts: ACADEMIC_OFFICE_CONTACTS,
  };
};

const formatFacultyResponse = (facultySummary) => {
  const subject = String(facultySummary?.subject || "").trim();
  const facultyList = Array.isArray(facultySummary?.faculty) ? facultySummary.faculty : [];

  if (facultyList.length === 0) {
    return subject
      ? "Sorry, I couldn't find faculty information for that subject."
      : "Sorry, I couldn't find faculty information right now.";
  }

  const lines = ["Here are the faculty contact details:"];

  facultyList.forEach((member, index) => {
    const name = String(member?.name || "N/A").trim() || "N/A";
    const memberSubject = String(member?.subject || "N/A").trim() || "N/A";
    const email = String(member?.email || "N/A").trim() || "N/A";
    const phone = String(member?.phone || "N/A").trim() || "N/A";
    const office = String(member?.office || "N/A").trim() || "N/A";

    lines.push(`- ${index + 1}. ${name}`);
    lines.push(`  Subject: ${memberSubject}`);
    lines.push(`  Email: [${email}](mailto:${email})`);
    lines.push(`  Phone: ${phone}`);
    lines.push(`  Office: ${office}`);
  });

  const classAdvisors = Array.isArray(facultySummary?.classAdvisors) ? facultySummary.classAdvisors : [];
  if (classAdvisors.length > 0) {
    lines.push("\nClass advisor details:");
    classAdvisors.forEach((advisor, index) => {
      lines.push(
        `- ${index + 1}. ${advisor.name} (${advisor.advisorForDepartment || "N/A"} Year ${advisor.advisorForYear || "N/A"})`
      );
      lines.push(`  Email: [${advisor.email || "N/A"}](mailto:${advisor.email || ""})`);
      lines.push(`  Phone: ${advisor.phone || "N/A"}`);
      lines.push(`  Office: ${advisor.office || "N/A"}`);
    });
  }

  const offices = Array.isArray(facultySummary?.academicOfficeContacts)
    ? facultySummary.academicOfficeContacts
    : [];
  if (offices.length > 0) {
    lines.push("\nAcademic office contacts:");
    offices.forEach((office, index) => {
      lines.push(`- ${index + 1}. ${office.office}`);
      lines.push(`  Email: [${office.email}](mailto:${office.email})`);
      lines.push(`  Phone: ${office.phone}`);
      lines.push(`  Location: ${office.location}`);
    });
  }

  return lines.join("\n");
};

const formatAmount = (value) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;

const formatAttendanceResponse = (attendanceSummary) => {
  if (attendanceSummary?.message) {
    return attendanceSummary.message;
  }

  const subjectWise = Array.isArray(attendanceSummary?.subjectWiseAttendance)
    ? attendanceSummary.subjectWiseAttendance
    : [];
  const semesterWise = Array.isArray(attendanceSummary?.semesterWiseAttendance)
    ? attendanceSummary.semesterWiseAttendance
    : [];
  const lowSubjects = Array.isArray(attendanceSummary?.lowAttendanceSubjects)
    ? attendanceSummary.lowAttendanceSubjects
    : [];

  const subjectLabel = subjectWise.length
    ? subjectWise
        .slice(0, 4)
        .map((item) => `${item.subject}: ${item.percentage}%`)
        .join("; ")
    : "No subject-wise attendance data.";

  const semesterLabel = semesterWise.length
    ? semesterWise.map((item) => `Sem ${item.semester}: ${item.percentage}%`).join("; ")
    : "No semester-wise attendance data.";

  const lowAlertLabel = lowSubjects.length
    ? lowSubjects.map((item) => `${item.subject} (${item.percentage}%)`).join(", ")
    : "No low attendance alerts.";

  return [
    "Here is your child's attendance summary:",
    `- Overall attendance: ${attendanceSummary.overallAttendance}%`,
    `- Classes attended: ${attendanceSummary.totalAttendedClasses}`,
    `- Total classes: ${attendanceSummary.totalClasses}`,
    `- Subject-wise attendance: ${subjectLabel}`,
    `- Semester-wise attendance: ${semesterLabel}`,
    `- Low attendance alerts (<${attendanceSummary.threshold || 75}%): ${lowAlertLabel}`,
  ].join("\n");
};

const formatMarksResponse = (marksSummary) => {
  if (marksSummary?.message) {
    return marksSummary.message;
  }

  const subjects = Array.isArray(marksSummary?.subjects) ? marksSummary.subjects : [];
  if (subjects.length === 0) {
    return "Marks not found.";
  }

  const lines = ["Here are your child's latest marks details:"];
  subjects.slice(0, 8).forEach((item, index) => {
    lines.push(
      `- ${index + 1}. ${item.subject} (Sem ${item.semester}) - Marks: ${item.marks}, Grade: ${item.grade || "N/A"}, Attempt: ${item.attempt}`
    );
  });

  if (subjects.length > 8) {
    lines.push(`- ...and ${subjects.length - 8} more records.`);
  }

  return lines.join("\n");
};

const formatCgpaResponse = (performanceSummary) => {
  if (performanceSummary?.message) {
    return performanceSummary.message;
  }

  const strong = Array.isArray(performanceSummary?.strongSubjects)
    ? performanceSummary.strongSubjects
    : [];
  const weak = Array.isArray(performanceSummary?.weakSubjects) ? performanceSummary.weakSubjects : [];
  const suggestions = Array.isArray(performanceSummary?.suggestions) ? performanceSummary.suggestions : [];
  const yearWise = Array.isArray(performanceSummary?.yearWiseCgpa) ? performanceSummary.yearWiseCgpa : [];
  const semesterWise = Array.isArray(performanceSummary?.semesterWiseCgpa)
    ? performanceSummary.semesterWiseCgpa
    : [];
  const subjectWiseMarks = Array.isArray(performanceSummary?.subjectWiseMarks)
    ? performanceSummary.subjectWiseMarks
    : [];

  const yearWiseLabel = yearWise.length
    ? yearWise.map((item) => `Year ${item.year}: ${item.cgpa}`).join("; ")
    : "N/A";
  const semesterWiseLabel = semesterWise.length
    ? semesterWise.map((item) => `Sem ${item.semester}: ${item.cgpa}`).join("; ")
    : "N/A";
  const subjectMarksLabel = subjectWiseMarks.length
    ? subjectWiseMarks
        .slice(0, 6)
        .map((item) => `${item.subject}: ${item.marks} (${item.grade || "N/A"})`)
        .join("; ")
    : "N/A";

  return [
    "Here is your child's CGPA summary:",
    `- Current CGPA: ${performanceSummary.currentCgpa}`,
    `- Year-wise CGPA: ${yearWiseLabel}`,
    `- Semester-wise CGPA: ${semesterWiseLabel}`,
    `- Total credits: ${performanceSummary.totalCredits}`,
    `- Total subjects counted: ${performanceSummary.totalSubjects}`,
    `- Subject-wise marks snapshot: ${subjectMarksLabel}`,
    `- Strong subjects: ${strong.length ? strong.join(", ") : "Not enough data"}`,
    `- Weak subjects: ${weak.length ? weak.join(", ") : "None identified"}`,
    `- Improvement suggestions: ${suggestions.length ? suggestions.join(" ") : "No suggestions available"}`,
  ].join("\n");
};

const formatSubjectsResponse = (subjectSummary) => {
  if (subjectSummary?.message) {
    return subjectSummary.message;
  }

  const subjects = Array.isArray(subjectSummary?.subjects) ? subjectSummary.subjects : [];
  const incomplete = Array.isArray(subjectSummary?.incompleteSubjects)
    ? subjectSummary.incompleteSubjects
    : [];

  return [
    "Here is your child's subject status:",
    `- Total subjects: ${subjectSummary.totalSubjects || 0}`,
    `- Subjects: ${subjects.length ? subjects.join(", ") : "None"}`,
    `- Incomplete/Backlog subjects: ${incomplete.length ? incomplete.join(", ") : "None"}`,
  ].join("\n");
};

const formatFinanceResponse = (financeSummary) => {
  if (financeSummary?.message) {
    return financeSummary.message;
  }

  const pending = Number(financeSummary.pendingAmount || 0);
  const statusText = financeSummary.paymentStatus || (pending > 0 ? "pending" : "paid");
  const history = Array.isArray(financeSummary?.paymentHistory) ? financeSummary.paymentHistory : [];
  const historyText = history.length
    ? history
        .slice(0, 3)
        .map((item) => {
          const date = item?.date ? new Date(item.date).toLocaleDateString("en-IN") : "N/A";
          return `${formatAmount(item.amount)} on ${date} via ${item.method || "N/A"}`;
        })
        .join("; ")
    : "No payment history available.";

  return [
    "Here is your child's fee summary:",
    `- Fee payment status: ${String(statusText).toUpperCase()}`,
    `- Total fees: ${formatAmount(financeSummary.totalFees)}`,
    `- Paid amount: ${formatAmount(financeSummary.paidAmount)}`,
    `- Scholarship: ${formatAmount(financeSummary.scholarshipAmount)}`,
    `- Pending amount: ${formatAmount(financeSummary.pendingAmount)}`,
    `- Payment history: ${historyText}`,
  ].join("\n");
};

const formatNotificationResponse = (notificationSummary, titleText) => {
  const notifications = Array.isArray(notificationSummary?.notifications)
    ? notificationSummary.notifications
    : [];

  if (notifications.length === 0) {
    return "No notifications found at the moment.";
  }

  const lines = [titleText];
  notifications.forEach((item, index) => {
    const date = item?.date ? new Date(item.date).toLocaleDateString("en-IN") : "N/A";
    lines.push(`- ${index + 1}. ${item.title} (${item.category || "general"}, ${date})`);
  });
  return lines.join("\n");
};

const formatAcademicStatusResponse = (statusSummary) => {
  if (statusSummary?.message) {
    return statusSummary.message;
  }

  const backlogSubjects = Array.isArray(statusSummary?.backlogSubjects) ? statusSummary.backlogSubjects : [];
  const repeatedSubjects = Array.isArray(statusSummary?.repeatedSubjects) ? statusSummary.repeatedSubjects : [];
  const incompleteSubjects = Array.isArray(statusSummary?.incompleteSubjects)
    ? statusSummary.incompleteSubjects
    : [];
  const repeatedLabel = repeatedSubjects.length
    ? repeatedSubjects.map((item) => `${item.subject} (${item.attempts} attempts)`).join(", ")
    : "None";

  return [
    "Here is your child's academic status summary:",
    `- Backlog count: ${statusSummary.backlogCount || 0}`,
    `- Backlog subjects: ${backlogSubjects.length ? backlogSubjects.join(", ") : "None"}`,
    `- Repeated subjects: ${repeatedLabel}`,
    `- Incomplete subjects: ${incompleteSubjects.length ? incompleteSubjects.join(", ") : "None"}`,
    `- Course completion status: ${statusSummary.courseCompletionStatus || "unknown"}`,
    `- Completion percentage: ${
      statusSummary.completionPercentage === null || statusSummary.completionPercentage === undefined
        ? "N/A"
        : `${statusSummary.completionPercentage}%`
    }`,
  ].join("\n");
};

const shouldUseMockFallback = (intent, data) => {
  if (!data || typeof data !== "object") return true;
  if (data.message) return true;

  switch (intent) {
    case "notifications":
    case "exam_timetable":
    case "academic_calendar":
      return !Array.isArray(data.notifications) || data.notifications.length === 0;
    case "faculty":
      return !Array.isArray(data.faculty) || data.faculty.length === 0;
    case "marks":
      return !Array.isArray(data.subjects) || data.subjects.length === 0;
    case "cgpa":
      return Number(data.totalSubjects || 0) === 0;
    default:
      return false;
  }
};

const getMockDataByIntent = (intent, student) => {
  const sid = student?.studentId || "STUDENT";

  if (intent === "attendance") {
    return {
      overallAttendance: 88.5,
      totalAttendedClasses: 177,
      totalClasses: 200,
      threshold: 75,
      lowAttendanceSubjects: [{ subject: "Operating Systems", semester: 5, percentage: 69.5 }],
      subjectWiseAttendance: [
        { subject: "Data Structures", semester: 5, attendedClasses: 46, totalClasses: 52, percentage: 88.46 },
        { subject: "DBMS", semester: 5, attendedClasses: 44, totalClasses: 52, percentage: 84.62 },
        { subject: "Operating Systems", semester: 5, attendedClasses: 36, totalClasses: 52, percentage: 69.23 },
      ],
      semesterWiseAttendance: [{ semester: 5, attendedClasses: 126, totalClasses: 156, percentage: 80.77 }],
      mock: true,
    };
  }

  if (intent === "marks") {
    return {
      totalRecords: 3,
      subjects: [
        { subject: "Data Structures", semester: 5, marks: 84, grade: "A", attempt: 1 },
        { subject: "DBMS", semester: 5, marks: 76, grade: "A", attempt: 1 },
        { subject: "Operating Systems", semester: 5, marks: 62, grade: "B+", attempt: 1 },
      ],
      mock: true,
    };
  }

  if (intent === "cgpa") {
    return {
      currentCgpa: 8.12,
      totalCredits: 24,
      totalSubjects: 6,
      semesterWiseCgpa: [
        { semester: 4, cgpa: 7.95, totalCredits: 12 },
        { semester: 5, cgpa: 8.29, totalCredits: 12 },
      ],
      yearWiseCgpa: [{ year: 3, cgpa: 8.12, totalCredits: 24 }],
      subjectWiseMarks: [
        { subject: "Data Structures", semester: 5, marks: 84, grade: "A", attempt: 1 },
        { subject: "DBMS", semester: 5, marks: 76, grade: "A", attempt: 1 },
        { subject: "Operating Systems", semester: 5, marks: 62, grade: "B+", attempt: 1 },
      ],
      strongSubjects: ["Data Structures", "DBMS"],
      weakSubjects: ["Operating Systems"],
      suggestions: [
        "Focus 30 minutes daily on weak subjects.",
        "Discuss a weekly improvement plan with faculty mentor.",
      ],
      mock: true,
    };
  }

  if (intent === "subjects") {
    return {
      totalSubjects: 6,
      subjects: ["Data Structures", "DBMS", "Operating Systems", "CN", "SE", "AI"],
      incompleteSubjects: ["Operating Systems"],
      mock: true,
    };
  }

  if (intent === "finance") {
    return {
      totalFees: 130000,
      paidAmount: 98000,
      scholarshipAmount: 10000,
      pendingAmount: 22000,
      paymentStatus: "partial",
      paymentHistory: [
        {
          amount: 50000,
          date: new Date("2026-01-10"),
          method: "UPI",
          reference: `${sid}-UPI-1`,
          status: "success",
        },
        {
          amount: 48000,
          date: new Date("2026-02-15"),
          method: "Card",
          reference: `${sid}-CARD-1`,
          status: "success",
        },
      ],
      mock: true,
    };
  }

  if (intent === "faculty") {
    return {
      subject: "Data Structures",
      count: 1,
      faculty: [
        {
          name: "Dr. Ramesh Kumar",
          subject: "Data Structures",
          email: "ramesh.faculty.demo@college.edu",
          phone: "9000011111",
          office: "CSE Block - 204",
        },
      ],
      classAdvisors: [
        {
          name: "Dr. Meena Iyer",
          advisorForDepartment: student?.department || "CSE",
          advisorForYear: student?.year || 3,
          email: "meena.faculty.demo@college.edu",
          phone: "9000022222",
          office: "CSE Block - 206",
        },
      ],
      academicOfficeContacts: ACADEMIC_OFFICE_CONTACTS,
      mock: true,
    };
  }

  if (intent === "academic_status") {
    return {
      backlogCount: 1,
      backlogSubjects: ["Operating Systems"],
      repeatedSubjects: [{ subject: "Operating Systems", attempts: 2 }],
      incompleteSubjects: ["AI Lab"],
      courseCompletionStatus: "in-progress",
      completionPercentage: 78.5,
      mock: true,
    };
  }

  if (intent === "exam_timetable") {
    return {
      count: 2,
      notifications: [
        {
          title: "Mid-Sem Exam Timetable",
          category: "exam",
          date: new Date("2026-04-10"),
        },
        {
          title: "End-Sem Exam Timetable",
          category: "exam",
          date: new Date("2026-05-20"),
        },
      ],
      mock: true,
    };
  }

  if (intent === "academic_calendar") {
    return {
      count: 2,
      notifications: [
        {
          title: "Semester Reopening",
          category: "calendar",
          date: new Date("2026-06-15"),
        },
        {
          title: "Internal Assessment Week",
          category: "calendar",
          date: new Date("2026-07-05"),
        },
      ],
      mock: true,
    };
  }

  if (intent === "notifications") {
    return {
      count: 3,
      notifications: [
        {
          title: "Mid-Sem Exam Schedule Released",
          category: "exam",
          date: new Date("2026-03-18"),
        },
        {
          title: "Assignment Submission Deadline",
          category: "assignment",
          date: new Date("2026-03-20"),
        },
        {
          title: "Academic Calendar Update",
          category: "calendar",
          date: new Date("2026-03-14"),
        },
      ],
      mock: true,
    };
  }

  return {
    message: "Mock data generated for this request.",
    mock: true,
  };
};

const getNotificationSummary = async () => {
  const notifications = await Notification.find({}).sort({ date: -1 }).limit(5).lean();
  return {
    count: notifications.length,
    notifications,
  };
};

const getExamTimetableSummary = async () => {
  const notifications = await Notification.find({ category: "exam" }).sort({ date: -1 }).limit(5).lean();
  return {
    count: notifications.length,
    notifications,
  };
};

const getAcademicCalendarSummary = async () => {
  const notifications = await Notification.find({ category: "calendar" }).sort({ date: -1 }).limit(5).lean();
  return {
    count: notifications.length,
    notifications,
  };
};

const getAcademicStatusSummary = async (studentId) => {
  const records = await Marks.find({ studentId }).lean();
  if (records.length === 0) {
    return { message: "Marks not found" };
  }

  const failing = records.filter((item) => {
    const grade = String(item.grade || "").trim().toUpperCase();
    return Number(item.marks) < 40 || FAIL_GRADES.has(grade);
  });

  const attemptsBySubject = records.reduce((acc, item) => {
    const subject = String(item.subject || "").trim();
    if (!subject) return acc;
    acc[subject] = (acc[subject] || 0) + 1;
    return acc;
  }, {});

  const repeatedSubjects = Object.entries(attemptsBySubject)
    .filter(([, attempts]) => attempts > 1)
    .map(([subject, attempts]) => ({ subject, attempts }));

  const student = await Student.findOne({ studentId }).select("department year").lean();
  const subjectFilter = {};
  if (student?.department) {
    subjectFilter.department = student.department;
  }
  if (student?.year) {
    subjectFilter.year = student.year;
  }

  const curriculumSubjects = await Subject.find(subjectFilter).lean();
  const allSubjects = new Set(curriculumSubjects.map((item) => item.name));
  const attemptedSubjects = new Set(records.map((item) => item.subject));
  const passedSubjects = new Set(
    records
      .filter((item) => {
        const grade = String(item.grade || "").trim().toUpperCase();
        return !(Number(item.marks) < 40 || FAIL_GRADES.has(grade));
      })
      .map((item) => item.subject)
  );

  const incompleteSubjects = Array.from(allSubjects).filter((name) => !attemptedSubjects.has(name));
  const completionPercentage =
    allSubjects.size > 0 ? Number(((passedSubjects.size / allSubjects.size) * 100).toFixed(2)) : null;
  const courseCompletionStatus =
    completionPercentage === null
      ? "unknown"
      : completionPercentage >= 100 && failing.length === 0
        ? "completed"
        : "in-progress";

  return {
    backlogCount: failing.length,
    backlogSubjects: Array.from(new Set(failing.map((item) => item.subject))),
    repeatedSubjects,
    incompleteSubjects,
    courseCompletionStatus,
    completionPercentage,
  };
};

const handleChatbotQuery = async (req, res) => {
  try {
    const query = String(req.body.query || "").trim();
    if (!query) {
      return res.status(400).json({ message: "query is required" });
    }

    const tokenStudentId = normalizeStudentId(req?.student?.studentId);
    if (!tokenStudentId) {
      return res.status(401).json({ message: "Invalid JWT token" });
    }

    const requestedStudentId = normalizeStudentId(req.body.studentId || tokenStudentId);
    if (requestedStudentId !== tokenStudentId) {
      return res.status(403).json({ message: "Access denied for requested studentId" });
    }

    const student = await Student.findOne({ studentId: requestedStudentId })
      .select("name studentId department year")
      .lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const detection = await detectIntentWithGemini(query);
    const intent = detection.intent;
    const entities = detection.entities || {};
    let data;
    let responseText = RESPONSE_TEMPLATES.unknown;

    switch (intent) {
      case "attendance":
        data = await getAttendanceSummary(requestedStudentId);
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatAttendanceResponse(data);
        break;
      case "marks":
        data = await getMarksSummary(requestedStudentId);
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatMarksResponse(data);
        break;
      case "cgpa":
        data = await getPerformanceSummary(requestedStudentId);
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatCgpaResponse(data);
        break;
      case "subjects":
        data = await getSubjectSummary(requestedStudentId);
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatSubjectsResponse(data);
        break;
      case "faculty":
        data = await getFacultySummary(query, entities.subject, student);
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatFacultyResponse(data);
        break;
      case "finance":
        data = await getFinanceSummary(requestedStudentId);
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatFinanceResponse(data);
        break;
      case "notifications":
        data = await getNotificationSummary();
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatNotificationResponse(data, "Here are the latest academic notifications:");
        break;
      case "academic_status":
        data = await getAcademicStatusSummary(requestedStudentId);
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatAcademicStatusResponse(data);
        break;
      case "exam_timetable":
        data = await getExamTimetableSummary();
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatNotificationResponse(data, "Here is the latest exam timetable information:");
        break;
      case "academic_calendar":
        data = await getAcademicCalendarSummary();
        if (shouldUseMockFallback(intent, data)) {
          data = getMockDataByIntent(intent, student);
        }
        responseText = formatNotificationResponse(data, "Here is the latest academic calendar information:");
        break;
      case "help":
        data = {
          supportedIntents: [
            "attendance",
            "marks",
            "cgpa",
            "subjects",
            "faculty",
            "finance",
            "notifications",
            "academic status",
            "exam timetable",
            "academic calendar",
            "help",
          ],
        };
        responseText = RESPONSE_TEMPLATES.help;
        break;
      default:
        // If intent is unknown, fallback to grouped data which is often helpful for open-ended prompts.
        if (query.toLowerCase().includes("fee") || query.toLowerCase().includes("payment")) {
          data = await getFinanceSummary(requestedStudentId);
          responseText = formatFinanceResponse(data);
          break;
        }

        if (query.toLowerCase().includes("notification")) {
          data = await getNotificationSummary();
          responseText = formatNotificationResponse(data, "Here are the latest academic notifications:");
          break;
        }

        if (query.toLowerCase().includes("backlog") || query.toLowerCase().includes("course")) {
          data = await getAcademicStatusSummary(requestedStudentId);
          responseText = formatAcademicStatusResponse(data);
          break;
        }

        data = {
          message: "I could not identify your request.",
          supportedIntents: [
            "Attendance",
            "Marks",
            "CGPA",
            "Subjects",
            "Faculty",
            "Finance",
            "Notifications",
            "Academic status",
            "Exam timetable",
            "Academic calendar",
            "Help",
          ],
        };
        responseText =
          "I'm sorry, I couldn't understand your question. You can ask about Attendance, Marks, CGPA, Subjects, Faculty, Finance, Notifications, Exam timetable, or Academic calendar.";
    }

    const requestedLanguage = detectRequestedLanguage(query);
    if (data?.mock) {
      responseText = `${responseText}\n\nNote: Live data was unavailable, so a safe mock preview is shown.`;
    }
    const finalResponseText = await translateResponseText(responseText, requestedLanguage);

    return res.status(200).json({
      student,
      query,
      intent,
      entities,
      intentSource: detection.source,
      responseText: finalResponseText,
      responseLanguage: requestedLanguage.name,
      data,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

module.exports = {
  handleChatbotQuery,
};
