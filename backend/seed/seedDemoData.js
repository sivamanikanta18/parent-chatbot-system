const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Marks = require("../models/Marks");
const Fees = require("../models/Fees");
const Faculty = require("../models/Faculty");
const Notification = require("../models/Notification");

dotenv.config();

const DEMO_STUDENT_IDS = ["231FA04331", "231FA04332", "231FA04355", "231FA04334"];
const LEGACY_DEMO_STUDENT_IDS = ["STU101", "STU102", "STU103"];
const ALL_DEMO_STUDENT_IDS = Array.from(new Set([...DEMO_STUDENT_IDS, ...LEGACY_DEMO_STUDENT_IDS]));

const students = [
  {
    name: "PADARTHI VENKATA SAI CHARAN",
    studentId: "231FA04331",
    mobileNumber: "9001101111",
    email: "231fa04331@gmail.com",
    parentEmail: "231fa04331@gmail.com",
    department: "CSE",
    year: 3,
    password: "123456",
  },
  {
    name: "POTHURAJU SIVAMANIKANTA",
    studentId: "231FA04332",
    mobileNumber: "9001102222",
    email: "231fa04332@gmail.com",
    parentEmail: "231fa04332@gmail.com",
    department: "CSE",
    year: 3,
    password: "123456",
  },
  {
    name: "RAMIREDDY GNANESWAR REDDY",
    studentId: "231FA04355",
    mobileNumber: "9001103333",
    email: "231fa04355@gmail.com",
    parentEmail: "231fa04355@gmail.com",
    department: "CSE",
    year: 3,
    password: "123456",
  },
  {
    name: "PULIPAKA RISHI SARAN",
    studentId: "231FA04334",
    mobileNumber: "9001104444",
    email: "231fa04334@gmail.com",
    parentEmail: "231fa04334@gmail.com",
    department: "CSE",
    year: 3,
    password: "123456",
  },
];

const attendance = [
  { studentId: "231FA04331", subject: "Data Structures", semester: 5, attendedClasses: 46, totalClasses: 52 },
  { studentId: "231FA04331", subject: "DBMS", semester: 5, attendedClasses: 44, totalClasses: 52 },
  { studentId: "231FA04331", subject: "Operating Systems", semester: 5, attendedClasses: 41, totalClasses: 52 },
  { studentId: "231FA04332", subject: "Data Structures", semester: 5, attendedClasses: 42, totalClasses: 52 },
  { studentId: "231FA04332", subject: "DBMS", semester: 5, attendedClasses: 39, totalClasses: 52 },
  { studentId: "231FA04332", subject: "Computer Networks", semester: 5, attendedClasses: 43, totalClasses: 52 },
  { studentId: "231FA04355", subject: "Operating Systems", semester: 5, attendedClasses: 45, totalClasses: 52 },
  { studentId: "231FA04355", subject: "Computer Networks", semester: 5, attendedClasses: 40, totalClasses: 52 },
  { studentId: "231FA04355", subject: "Software Engineering", semester: 5, attendedClasses: 47, totalClasses: 52 },
  { studentId: "231FA04334", subject: "DBMS", semester: 5, attendedClasses: 43, totalClasses: 52 },
  { studentId: "231FA04334", subject: "Operating Systems", semester: 5, attendedClasses: 38, totalClasses: 52 },
  { studentId: "231FA04334", subject: "Software Engineering", semester: 5, attendedClasses: 45, totalClasses: 52 },
];

const marks = [
  { studentId: "231FA04331", subject: "Data Structures", semester: 5, marks: 86, grade: "A+", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04331", subject: "DBMS", semester: 5, marks: 79, grade: "A", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04331", subject: "Operating Systems", semester: 5, marks: 74, grade: "A", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04332", subject: "Data Structures", semester: 5, marks: 67, grade: "B+", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04332", subject: "DBMS", semester: 5, marks: 58, grade: "B", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04332", subject: "Computer Networks", semester: 5, marks: 81, grade: "A", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04355", subject: "Operating Systems", semester: 5, marks: 91, grade: "A+", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04355", subject: "Computer Networks", semester: 5, marks: 76, grade: "A", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04355", subject: "Software Engineering", semester: 5, marks: 88, grade: "A+", credits: 3, attempt: 1, year: 3 },
  { studentId: "231FA04334", subject: "DBMS", semester: 5, marks: 63, grade: "B+", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04334", subject: "Operating Systems", semester: 5, marks: 37, grade: "F", credits: 4, attempt: 1, year: 3 },
  { studentId: "231FA04334", subject: "Software Engineering", semester: 5, marks: 72, grade: "A", credits: 3, attempt: 1, year: 3 },
];

const fees = [
  {
    studentId: "231FA04331",
    totalFees: 135000,
    paidAmount: 110000,
    pendingAmount: 25000,
    scholarshipAmount: 0,
    paymentHistory: [
      { amount: 65000, date: new Date("2026-01-11"), method: "UPI", reference: "UPI4331A", status: "success" },
      { amount: 45000, date: new Date("2026-02-22"), method: "Card", reference: "CARD4331B", status: "success" },
    ],
  },
  {
    studentId: "231FA04332",
    totalFees: 130000,
    paidAmount: 130000,
    pendingAmount: 0,
    scholarshipAmount: 0,
    paymentHistory: [
      { amount: 130000, date: new Date("2026-01-18"), method: "NetBanking", reference: "NB4332A", status: "success" },
    ],
  },
  {
    studentId: "231FA04355",
    totalFees: 140000,
    paidAmount: 90000,
    pendingAmount: 30000,
    scholarshipAmount: 20000,
    paymentHistory: [
      { amount: 90000, date: new Date("2026-02-03"), method: "UPI", reference: "UPI4355A", status: "success" },
    ],
  },
  {
    studentId: "231FA04334",
    totalFees: 132000,
    paidAmount: 60000,
    pendingAmount: 62000,
    scholarshipAmount: 10000,
    paymentHistory: [
      { amount: 60000, date: new Date("2026-02-06"), method: "Card", reference: "CARD4334A", status: "success" },
    ],
  },
];

const faculty = [
  {
    name: "Dr. Ramesh Kumar",
    subject: "Data Structures",
    email: "ramesh.faculty.demo@college.edu",
    phone: "9000011111",
    office: "CSE Block - 204",
    advisorForDepartment: "CSE",
    advisorForYear: 2,
  },
  {
    name: "Dr. Meena Iyer",
    subject: "DBMS",
    email: "meena.faculty.demo@college.edu",
    phone: "9000022222",
    office: "CSE Block - 206",
    advisorForDepartment: "CSE",
    advisorForYear: 2,
  },
  {
    name: "Prof. Sandeep Rao",
    subject: "Physics",
    email: "sandeep.faculty.demo@college.edu",
    phone: "9000033333",
    office: "Science Block - 110",
    advisorForDepartment: "ECE",
    advisorForYear: 1,
  },
  {
    name: "Dr. Kavitha Menon",
    subject: "Thermodynamics",
    email: "kavitha.faculty.demo@college.edu",
    phone: "9000044444",
    office: "Mech Block - 302",
    advisorForDepartment: "MECH",
    advisorForYear: 3,
  },
];

const notifications = [
  {
    title: "Mid-Sem Exam Schedule Released",
    description: "Mid-semester exam timetable has been published on the portal.",
    date: new Date("2026-03-18"),
    category: "exam",
    attachmentUrl: "/mock-docs/mock-exam-timetable.pdf",
  },
  {
    title: "Assignment Submission Deadline",
    description: "Data Structures assignment-2 deadline is 2026-03-20.",
    date: new Date("2026-03-16"),
    category: "assignment",
    attachmentUrl: "/mock-docs/mock-assignment-details.pdf",
  },
  {
    title: "Academic Calendar Update",
    description: "Summer break dates have been updated in the academic calendar.",
    date: new Date("2026-03-14"),
    category: "calendar",
    attachmentUrl: "/mock-docs/mock-academic-calendar.pdf",
  },
];

const seedDemoData = async () => {
  try {
    await connectDB();

    await Student.deleteMany({ studentId: { $in: ALL_DEMO_STUDENT_IDS } });
    await Attendance.deleteMany({ studentId: { $in: ALL_DEMO_STUDENT_IDS } });
    await Marks.deleteMany({ studentId: { $in: ALL_DEMO_STUDENT_IDS } });
    await Fees.deleteMany({ studentId: { $in: ALL_DEMO_STUDENT_IDS } });

    await Faculty.deleteMany({ email: /\.faculty\.demo@college\.edu$/i });
    await Notification.deleteMany({
      title: {
        $in: notifications.map((item) => item.title),
      },
    });

    await Student.create(students);
    await Attendance.insertMany(attendance);
    await Marks.insertMany(marks);
    await Fees.insertMany(fees);
    await Faculty.insertMany(faculty);
    await Notification.insertMany(notifications);

    console.log("Demo data inserted successfully");
    console.log("Students:", students.length);
    console.log("Attendance:", attendance.length);
    console.log("Marks:", marks.length);
    console.log("Fees:", fees.length);
    console.log("Faculty:", faculty.length);
    console.log("Notifications:", notifications.length);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Demo data seeding failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDemoData();
