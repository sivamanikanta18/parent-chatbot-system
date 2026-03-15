const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    totalCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  {
    timestamps: true,
  }
);

semesterSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Semester", semesterSchema);
