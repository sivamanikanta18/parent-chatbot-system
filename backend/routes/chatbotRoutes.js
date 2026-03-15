const express = require("express");

const { handleChatbotQuery } = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.post("/query", handleChatbotQuery);

module.exports = router;
