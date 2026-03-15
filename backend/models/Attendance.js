const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
    },
    attendedClasses: {
      type: Number,
      required: true,
      min: 0,
    },
    totalClasses: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ studentId: 1, subject: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
