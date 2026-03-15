const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const { enforceStudentAccess } = require("../utils/studentAccess");

const getPercentage = (attended, total) => {
  if (!total) return 0;
  return Number(((Number(attended) / Number(total)) * 100).toFixed(2));
};

const getOverallAttendance = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const student = await Student.findOne({ studentId }).select("name studentId department year").lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const records = await Attendance.find({ studentId }).lean();
    if (records.length === 0) {
      return res.status(404).json({ message: "No attendance data found" });
    }

    const threshold = Number(req.query.threshold) || 75;
    const totals = records.reduce(
      (acc, item) => {
        acc.attended += Number(item.attendedClasses) || 0;
        acc.total += Number(item.totalClasses) || 0;
        return acc;
      },
      { attended: 0, total: 0 }
    );

    const lowAttendanceSubjects = records
      .map((item) => ({
        subject: item.subject,
        semester: item.semester,
        attendedClasses: item.attendedClasses,
        totalClasses: item.totalClasses,
        percentage: getPercentage(item.attendedClasses, item.totalClasses),
      }))
      .filter((item) => item.percentage < threshold)
      .sort((a, b) => a.percentage - b.percentage);

    return res.status(200).json({
      student,
      summary: {
        overallAttendance: getPercentage(totals.attended, totals.total),
        totalAttendedClasses: totals.attended,
        totalClasses: totals.total,
        threshold,
        lowAttendanceCount: lowAttendanceSubjects.length,
      },
      lowAttendanceSubjects,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

const getSubjectWiseAttendance = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const records = await Attendance.find({ studentId }).sort({ subject: 1, semester: 1 }).lean();
    if (records.length === 0) {
      return res.status(404).json({ message: "No attendance data found" });
    }

    const threshold = Number(req.query.threshold) || 75;
    const subjects = records.map((item) => ({
      subject: item.subject,
      semester: item.semester,
      attendedClasses: item.attendedClasses,
      totalClasses: item.totalClasses,
      percentage: getPercentage(item.attendedClasses, item.totalClasses),
      alert: getPercentage(item.attendedClasses, item.totalClasses) < threshold,
    }));

    return res.status(200).json({
      studentId,
      threshold,
      subjectWiseAttendance: subjects,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

const getSemesterWiseAttendance = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const records = await Attendance.find({ studentId }).lean();
    if (records.length === 0) {
      return res.status(404).json({ message: "No attendance data found" });
    }

    const grouped = records.reduce((acc, item) => {
      const semesterKey = String(item.semester);
      if (!acc[semesterKey]) {
        acc[semesterKey] = { attended: 0, total: 0 };
      }
      acc[semesterKey].attended += Number(item.attendedClasses) || 0;
      acc[semesterKey].total += Number(item.totalClasses) || 0;
      return acc;
    }, {});

    const semesterWiseAttendance = Object.entries(grouped)
      .map(([semester, totals]) => ({
        semester: Number(semester),
        attendedClasses: totals.attended,
        totalClasses: totals.total,
        percentage: getPercentage(totals.attended, totals.total),
      }))
      .sort((a, b) => a.semester - b.semester);

    return res.status(200).json({
      studentId,
      semesterWiseAttendance,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

module.exports = {
  getOverallAttendance,
  getSubjectWiseAttendance,
  getSemesterWiseAttendance,
};
