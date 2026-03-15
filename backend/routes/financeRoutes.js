const express = require("express");

const { getFeeStatus, getFeeHistory } = require("../controllers/financeController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/status/:studentId", getFeeStatus);
router.get("/history/:studentId", getFeeHistory);

module.exports = router;
