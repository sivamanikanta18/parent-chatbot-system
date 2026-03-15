const Marks = require("../models/Marks");
const Student = require("../models/Student");
const { enforceStudentAccess } = require("../utils/studentAccess");
const {
  calculateCGPA,
  calculateGroupedCGPA,
  getPerformanceInsights,
} = require("../utils/cgpaCalculator");

const normalizeYear = (record) => {
  if (record.year) {
    return Number(record.year);
  }
  const semester = Number(record.semester) || 1;
  return Math.ceil(semester / 2);
};

const getCgpaSummary = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const student = await Student.findOne({ studentId }).select("name studentId").lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const records = await Marks.find({ studentId }).lean();
    if (records.length === 0) {
      return res.status(404).json({ message: "Marks not found" });
    }

    const current = calculateCGPA(records);

    const semesterWiseCgpa = calculateGroupedCGPA(records, (record) => String(record.semester || "N/A"))
      .map((item) => ({
        semester: Number(item.key),
        cgpa: item.cgpa,
        totalCredits: item.totalCredits,
      }))
      .sort((a, b) => a.semester - b.semester);

    const yearWiseCgpa = calculateGroupedCGPA(records, (record) => String(normalizeYear(record)))
      .map((item) => ({
        year: Number(item.key),
        cgpa: item.cgpa,
        totalCredits: item.totalCredits,
      }))
      .sort((a, b) => a.year - b.year);

    const insights = getPerformanceInsights(records, {
      strongThreshold: req.query.strongThreshold,
      weakThreshold: req.query.weakThreshold,
    });

    return res.status(200).json({
      student,
      currentCgpa: current.cgpa,
      totalCredits: current.totalCredits,
      semesterWiseCgpa,
      yearWiseCgpa,
      insights,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

const getSemesterPerformance = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const targetSemester = req.query.semester ? Number(req.query.semester) : null;
    if (req.query.semester && Number.isNaN(targetSemester)) {
      return res.status(400).json({ message: "semester query must be a valid number" });
    }

    const filter = { studentId };
    if (targetSemester) {
      filter.semester = targetSemester;
    }

    const records = await Marks.find(filter).sort({ semester: 1, subject: 1, attempt: 1 }).lean();
    if (records.length === 0) {
      return res.status(404).json({ message: "Marks not found" });
    }

    const grouped = records.reduce((acc, item) => {
      const key = String(item.semester);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const semesterPerformance = Object.entries(grouped)
      .map(([semester, list]) => {
        const cgpaResult = calculateCGPA(list);
        return {
          semester: Number(semester),
          semesterCgpa: cgpaResult.cgpa,
          subjects: list.map((item) => ({
            subject: item.subject,
            marks: item.marks,
            grade: item.grade,
            credits: item.credits,
            attempt: item.attempt,
          })),
        };
      })
      .sort((a, b) => a.semester - b.semester);

    return res.status(200).json({
      studentId,
      semesterPerformance,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

const getSubjectWiseMarks = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const records = await Marks.find({ studentId }).sort({ subject: 1, attempt: 1 }).lean();
    if (records.length === 0) {
      return res.status(404).json({ message: "Marks not found" });
    }

    const grouped = records.reduce((acc, item) => {
      const key = String(item.subject).trim();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const subjectWiseMarks = Object.entries(grouped).map(([subject, attempts]) => {
      const bestAttempt = attempts.reduce((best, current) =>
        Number(current.marks) > Number(best.marks) ? current : best
      );

      return {
        subject,
        bestMarks: bestAttempt.marks,
        bestGrade: bestAttempt.grade,
        attempts: attempts.map((item) => ({
          semester: item.semester,
          attempt: item.attempt,
          marks: item.marks,
          grade: item.grade,
        })),
      };
    });

    return res.status(200).json({
      studentId,
      subjectWiseMarks,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

module.exports = {
  getCgpaSummary,
  getSemesterPerformance,
  getSubjectWiseMarks,
};
