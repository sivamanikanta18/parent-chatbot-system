const Fees = require("../models/Fees");
const Student = require("../models/Student");
const { enforceStudentAccess } = require("../utils/studentAccess");

const getFeeStatus = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const student = await Student.findOne({ studentId }).select("name studentId").lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feesRecord = await Fees.findOne({ studentId }).lean();
    if (!feesRecord) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    const totalFees = Number(feesRecord.totalFees) || 0;
    const paidAmount = Number(feesRecord.paidAmount) || 0;
    const scholarshipAmount = Number(feesRecord.scholarshipAmount) || 0;
    const pendingAmount = Math.max(totalFees - paidAmount - scholarshipAmount, 0);

    const paymentStatus =
      pendingAmount === 0 ? "paid" : paidAmount > 0 || scholarshipAmount > 0 ? "partial" : "pending";

    return res.status(200).json({
      student,
      finance: {
        totalFees,
        paidAmount,
        scholarshipAmount,
        pendingAmount,
        paymentStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

const getFeeHistory = async (req, res) => {
  try {
    const studentId = enforceStudentAccess(req, res, req.params.studentId);
    if (!studentId) return;

    const feesRecord = await Fees.findOne({ studentId }).lean();
    if (!feesRecord) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    const paymentHistory = [...(feesRecord.paymentHistory || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return res.status(200).json({
      studentId,
      paymentHistory,
      transactionCount: paymentHistory.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

module.exports = {
  getFeeStatus,
  getFeeHistory,
};
