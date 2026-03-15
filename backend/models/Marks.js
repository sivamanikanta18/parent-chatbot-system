const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
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
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      trim: true,
      uppercase: true,
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
    },
    attempt: {
      type: Number,
      default: 1,
      min: 1,
    },
    year: {
      type: Number,
      min: 1,
      max: 6,
    },
  },
  {
    timestamps: true,
  }
);

marksSchema.index({ studentId: 1, semester: 1, subject: 1, attempt: 1 }, { unique: true });

module.exports = mongoose.model("Marks", marksSchema);
