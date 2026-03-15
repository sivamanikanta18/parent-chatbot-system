const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

async function testGemini() {
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in backend/.env");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent("Hello Gemini");
  const text = result?.response?.text?.() || "No response text returned.";

  console.log("Gemini model:", modelName);
  console.log("Gemini response:", text);
}

testGemini().catch((error) => {
  console.error("Gemini test failed:", error.message);
  process.exit(1);
});
