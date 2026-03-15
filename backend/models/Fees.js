const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      default: "success",
    },
  },
  {
    _id: false,
  }
);

const feesSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    totalFees: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    scholarshipAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentHistory: [paymentHistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fees", feesSchema);
