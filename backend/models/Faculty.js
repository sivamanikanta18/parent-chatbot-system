const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    office: {
      type: String,
      trim: true,
    },
    advisorForDepartment: {
      type: String,
      trim: true,
    },
    advisorForYear: {
      type: Number,
      min: 1,
      max: 6,
    },
  },
  {
    timestamps: true,
  }
);

facultySchema.index({ subject: 1, name: 1 });

module.exports = mongoose.model("Faculty", facultySchema);
