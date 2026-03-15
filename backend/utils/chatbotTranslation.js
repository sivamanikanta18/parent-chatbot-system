const { GoogleGenerativeAI } = require("@google/generative-ai");

const LANGUAGE_DEFINITIONS = [
  { code: "en", name: "English", aliases: ["english", "in english"] },
  { code: "hi", name: "Hindi", aliases: ["hindi", "in hindi"] },
  { code: "te", name: "Telugu", aliases: ["telugu", "in telugu"] },
  { code: "ta", name: "Tamil", aliases: ["tamil", "in tamil"] },
  { code: "kn", name: "Kannada", aliases: ["kannada", "in kannada"] },
  { code: "ml", name: "Malayalam", aliases: ["malayalam", "in malayalam"] },
  { code: "mr", name: "Marathi", aliases: ["marathi", "in marathi"] },
  { code: "bn", name: "Bengali", aliases: ["bengali", "bangla", "in bengali", "in bangla"] },
  { code: "gu", name: "Gujarati", aliases: ["gujarati", "in gujarati"] },
  { code: "pa", name: "Punjabi", aliases: ["punjabi", "in punjabi"] },
  { code: "ur", name: "Urdu", aliases: ["urdu", "in urdu"] },
  { code: "or", name: "Odia", aliases: ["odia", "oriya", "in odia", "in oriya"] },
  { code: "as", name: "Assamese", aliases: ["assamese", "in assamese"] },
];

const TRANSLATION_MODELS = [
  process.env.GEMINI_TRANSLATION_MODEL,
  "models/gemini-2.5-flash",
  process.env.GEMINI_MODEL,
].filter(Boolean);

const detectRequestedLanguage = (queryText = "") => {
  const text = String(queryText || "").toLowerCase();

  for (const language of LANGUAGE_DEFINITIONS) {
    if (language.aliases.some((alias) => text.includes(alias))) {
      return language;
    }
  }

  return LANGUAGE_DEFINITIONS[0];
};

const getGeminiClient = () => {
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

const translateResponseText = async (englishText, language) => {
  if (!englishText) return "";
  if (!language || language.code === "en") return englishText;

  const client = getGeminiClient();
  if (!client) return englishText;

  const prompt = [
    "Translate the text into the requested language.",
    `Target language: ${language.name}`,
    "Rules:",
    "1) Keep meaning exactly same.",
    "2) Keep numbers, names, email addresses, phone numbers, percentages unchanged.",
    "3) Keep markdown links and mailto links unchanged.",
    "4) Keep bullet points and line breaks unchanged.",
    "5) Return only translated text.",
    "Text to translate:",
    englishText,
  ].join("\n");

  for (const modelName of TRANSLATION_MODELS) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const translated = String(result?.response?.text?.() || "").trim();
      if (translated) {
        return translated;
      }
    } catch {
      // Try next model when one is unavailable or rate-limited.
    }
  }

  return englishText;
};

module.exports = {
  detectRequestedLanguage,
  translateResponseText,
};
