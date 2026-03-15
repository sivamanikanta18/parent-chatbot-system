const { GoogleGenerativeAI } = require("@google/generative-ai");
const { INTENT_KEYS, fallbackDetectIntent } = require("./chatbotIntents");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const ENTITY_MAX_LENGTH = 100;

const getGeminiClient = () => {
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const sanitizeText = (value) => String(value || "").trim();

const sanitizeEntity = (value) => sanitizeText(value).slice(0, ENTITY_MAX_LENGTH);

const normalizeIntent = (value) => {
  const raw = sanitizeText(value).toLowerCase();
  if (!raw) return "unknown";

  const normalized = raw.replace(/[\s-]+/g, "_");
  const aliases = {
    exam: "exam_timetable",
    timetable: "exam_timetable",
    exam_schedule: "exam_timetable",
    calendar: "academic_calendar",
    fee: "finance",
    fees: "finance",
    payment: "finance",
    backlog: "academic_status",
    status: "academic_status",
    notification: "notifications",
    notice: "notifications",
  };

  const resolved = aliases[normalized] || normalized;
  return INTENT_KEYS.includes(resolved) ? resolved : "unknown";
};

const defaultParsedResult = {
  intent: "unknown",
  entities: {
    subject: "",
    timeframe: "",
  },
};

const normalizeParsedPayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return defaultParsedResult;
  }

  const intent = normalizeIntent(payload.intent);
  const rawEntities = payload.entities;
  const entities =
    rawEntities && typeof rawEntities === "object" && !Array.isArray(rawEntities)
      ? {
          subject: sanitizeEntity(rawEntities.subject),
          timeframe: sanitizeEntity(rawEntities.timeframe),
        }
      : { ...defaultParsedResult.entities };

  return { intent, entities };
};

const tryExtractJsonObject = (rawText = "") => {
  const text = sanitizeText(rawText).replace(/```json|```/gi, "").trim();
  if (!text) {
    return "";
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return text;
  }

  return text.slice(firstBrace, lastBrace + 1);
};

const parseGeminiIntent = (rawText = "") => {
  const jsonCandidate = tryExtractJsonObject(rawText);

  try {
    const parsed = JSON.parse(jsonCandidate);
    return normalizeParsedPayload(parsed);
  } catch {
    // Ignore and fallback below.
  }

  const compact = sanitizeText(rawText).toLowerCase();
  const matched = INTENT_KEYS.find((intent) => compact.includes(intent));
  return {
    intent: matched || "unknown",
    entities: { ...defaultParsedResult.entities },
  };
};

const detectIntentWithGemini = async (queryText) => {
  const fallbackIntent = fallbackDetectIntent(queryText);
  const client = getGeminiClient();

  if (!client) {
    return {
      intent: fallbackIntent,
      entities: { ...defaultParsedResult.entities },
      source: "keyword-fallback",
    };
  }

  try {
    const model = client.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = [
      "You are an intent classifier for a university parent chatbot.",
      `Allowed intents: ${INTENT_KEYS.join(", ")}`,
      "Return only valid JSON and no markdown.",
      "Use this exact JSON schema:",
      '{"intent":"attendance","entities":{"subject":"","timeframe":""}}',
      "If uncertain, set intent to unknown.",
      "If uncertain, use unknown.",
      `Query: ${queryText}`,
      "Example output: {\"intent\":\"faculty\",\"entities\":{\"subject\":\"Maths\",\"timeframe\":\"\"}}",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.() || "";
    const parsed = parseGeminiIntent(responseText);
    const intent = parsed.intent === "unknown" ? fallbackIntent : parsed.intent;

    return {
      intent,
      entities: parsed.entities,
      source: "gemini",
    };
  } catch {
    return {
      intent: fallbackIntent,
      entities: { ...defaultParsedResult.entities },
      source: "keyword-fallback",
    };
  }
};

module.exports = {
  detectIntentWithGemini,
};
