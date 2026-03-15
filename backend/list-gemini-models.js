const dotenv = require("dotenv");

dotenv.config();

async function listModels() {
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in backend/.env");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const models = Array.isArray(data.models) ? data.models : [];

  if (models.length === 0) {
    console.log("No models returned for this key.");
    return;
  }

  console.log("Available Gemini models for this key:");
  models
    .map((m) => m.name)
    .filter(Boolean)
    .forEach((name) => console.log(`- ${name}`));
}

listModels().catch((error) => {
  console.error("Failed to list Gemini models:", error.message);
  process.exit(1);
});
