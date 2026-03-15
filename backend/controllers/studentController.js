const Marks = require("../models/Marks");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const { enforceStudentAccess } = require("../utils/studentAccess");

const FAIL_GRADES = new Set(["F", "FAIL", "RA", "AB"]);

const isFailRecord = (record, passMarks) => {
  const marks = Number(record.marks);
  const grade = String(record.grade || "").trim().toUpperCase();
  if (!Number.isNaN(marks) && marks < passMarks) {
    return true;
  }
  return FAIL_GRADES.has(grade);
};

const getBacklogs = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const student = await Student.findOne({ studentId }).select("name studentId").lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const passMarks = Number(req.query.passMarks) || 40;
    const marksRecords = await Marks.find({ studentId }).sort({ semester: 1, subject: 1, attempt: 1 }).lean();

    if (marksRecords.length === 0) {
      return res.status(404).json({ message: "Marks not found" });
    }

    const backlogs = marksRecords
      .filter((record) => isFailRecord(record, passMarks))
      .map((record) => ({
        subject: record.subject,
        semester: record.semester,
        marks: record.marks,
        grade: record.grade,
        attempt: record.attempt,
      }));

    const attemptsBySubject = marksRecords.reduce((acc, record) => {
      const key = String(record.subject).trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const repeatedSubjects = Object.entries(attemptsBySubject)
      .filter(([, attempts]) => attempts > 1)
      .map(([subject, attempts]) => ({ subject, attempts }));

    return res.status(200).json({
      student,
      passMarks,
      backlogCount: backlogs.length,
      repeatedSubjects,
      backlogs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

const getCourseStatus = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const student = await Student.findOne({ studentId }).select("name studentId department year").lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const passMarks = Number(req.query.passMarks) || 40;
    const marksRecords = await Marks.find({ studentId }).lean();
    if (marksRecords.length === 0) {
      return res.status(404).json({ message: "Marks not found" });
    }

    const subjectFilter = {};
    if (student.department) {
      subjectFilter.department = student.department;
    }
    if (student.year) {
      subjectFilter.year = student.year;
    }

    const subjects = await Subject.find(subjectFilter).lean();

    const allSubjects = new Set(subjects.map((subject) => subject.name));
    const attemptedSubjects = new Set(marksRecords.map((item) => item.subject));
    const completedSubjects = new Set(
      marksRecords.filter((item) => !isFailRecord(item, passMarks)).map((item) => item.subject)
    );

    const incompleteSubjects = Array.from(allSubjects).filter(
      (subjectName) => !attemptedSubjects.has(subjectName)
    );

    const backlogSubjects = Array.from(
      new Set(marksRecords.filter((item) => isFailRecord(item, passMarks)).map((item) => item.subject))
    );

    const completionPercentage =
      allSubjects.size > 0
        ? Number(((completedSubjects.size / allSubjects.size) * 100).toFixed(2))
        : null;

    const statusLabel =
      completionPercentage === null
        ? "unknown"
        : completionPercentage >= 100 && backlogSubjects.length === 0
          ? "completed"
          : "in-progress";

    return res.status(200).json({
      student,
      status: statusLabel,
      completionPercentage,
      totalSubjects: allSubjects.size,
      attemptedSubjects: attemptedSubjects.size,
      completedSubjects: Array.from(completedSubjects),
      backlogSubjects,
      incompleteSubjects,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

module.exports = {
  getBacklogs,
  getCourseStatus,
};
