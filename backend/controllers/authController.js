const jwt = require("jsonwebtoken");

const Student = require("../models/Student");
const generateOTP = require("../utils/generateOTP");
const sendOTP = require("../services/emailService");

const normalizeStudentId = (value = "") => value.trim().toUpperCase();

const verifyStudent = async (req, res) => {
  try {
    const { studentId, mobileNumber } = req.body;

    if (!studentId || !mobileNumber) {
      return res.status(400).json({ message: "studentId and mobileNumber are required" });
    }

    const student = await Student.findOne({
      studentId: normalizeStudentId(studentId),
      mobileNumber,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student verified" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const student = await Student.findOne({ studentId: normalizeStudentId(studentId) });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    student.otp = otp;
    student.otpExpiry = otpExpiry;
    await student.save();

    let emailSent = true;
    try {
      await sendOTP(student.email, otp);
    } catch (error) {
      emailSent = false;
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({ message: "Failed to deliver OTP" });
      }
    }

    const responsePayload = { message: "OTP generated" };
    if (process.env.NODE_ENV !== "production") {
      responsePayload.otp = otp;
      responsePayload.expiresAt = otpExpiry;
      responsePayload.emailStatus = emailSent ? "sent" : "not-sent";
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { studentId, otp } = req.body;

    if (!studentId || !otp) {
      return res.status(400).json({ message: "studentId and otp are required" });
    }

    const student = await Student.findOne({ studentId: normalizeStudentId(studentId) });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.otp || !student.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please request a new OTP." });
    }

    if (student.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > student.otpExpiry) {
      student.otp = null;
      student.otpExpiry = null;
      await student.save();
      return res.status(400).json({ message: "Expired OTP" });
    }

    student.otp = null;
    student.otpExpiry = null;
    await student.save();

    const token = jwt.sign(
      {
        studentId: student.studentId,
        id: student._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "OTP verified. Login successful.",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password -otp -otpExpiry");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  verifyStudent,
  sendOtp,
  verifyOtp,
  getProfile,
};
