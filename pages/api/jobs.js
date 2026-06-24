import { z } from "zod";
import { Redis } from "@upstash/redis";

// ─── ZOD SCHEMA ──────────────────────────────────────────────────────────────
const JobSchema = z.object({
  id:             z.number(),
  title:          z.string(),
  company:        z.string(),
  companyBlurred: z.string(),
  location:       z.string(),
  salary:         z.string(),
  type:           z.string(),
  tag:            z.string(),
  description:    z.string(),
  requirements:   z.array(z.string()).max(3),
  link:           z.string().url(),
  featured:       z.boolean(),
  hiddenGem:      z.boolean(),
});

const JobsArraySchema = z.array(JobSchema);

// ─── GEMINI RESPONSE SCHEMA ──────────────────────────────────────────────────
const responseSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      id:             { type: "NUMBER" },
      title:          { type: "STRING" },
      company:        { type: "STRING" },
      companyBlurred: { type: "STRING" },
      location:       { type: "STRING" },
      salary:         { type: "STRING" },
      type:           { type: "STRING" },
      tag:            { type: "STRING" },
      description:    { type: "STRING" },
      requirements:   { type: "ARRAY", items: { type: "STRING" } },
      link:           { type: "STRING" },
      featured:       { type: "BOOLEAN" },
      hiddenGem:      { type: "BOOLEAN" },
    },
    required: ["id","title","company","companyBlurred","location","salary","type","tag","description","requirements","link","featured","hiddenGem"],
  },
};

// ─── REDIS CLIENT ─────────────────────────────────────────────────────────────
let redis;
try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch {
  redis = null;
}

// ─── CACHE HELPERS ───────────────────────────────────────────────────────────
function getCacheKey(langCode) {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `esljd:jobs:${langCode}:${date}`;
}

async function getFromCache(key) {
  if (!redis) return null;
  try {
    const cached = await redis.get(key);
    return cached || null;
  } catch { return null; }
}

async function setInCache(key, data) {
  if (!redis) return;
  try {
    // Cache until end of day — 20 hours
    await redis.setex(key, 72000, JSON.stringify(data));
  } catch { /* cache write failure is non-fatal */ }
}

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { language = "English", langCode = "en", today = new Date().toDateString() } = req.body || {};

  // 1. Check Redis cache first
  const cacheKey = getCacheKey(langCode);
  const cached = await getFromCache(cacheKey);

  if (cached) {
    console.log(`Cache hit for ${langCode}`);
    res.setHeader("X-Cache", "HIT");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ jobs: JSON.parse(cached), fromCache: true });
  }

  console.log(`Cache miss for ${langCode} — calling Gemini`);

  const isEnglish = langCode === "en";

  const prompt = isEnglish
    ? `Today is ${today}. Search the web and find 12 of the best highest-paying language career opportunities currently available. Include a broad mix: ESL/EFL teaching online and abroad, business English coaching, translation, localization, corporate language training, IELTS/TOEFL prep, curriculum design, and bilingual professional roles. Prioritize salaries above $20/hr or $45000/yr. Search VIPKid, Preply, iTalki, Cambly, Berlitz, EPIK Korea, British Council, Teach Away, international schools in UAE Korea Japan Thailand Jordan, US universities, and major EdTech companies. For every job find the ACTUAL direct URL to the listing. For companyBlurred replace middle letters with █ e.g. Pre███ for Preply. Set hiddenGem true for exactly ONE job only. Return exactly 12 jobs.`
    : `Today is ${today}. Search the web for the best paying jobs requiring ${language} language skills. Include ${language} teaching, translation, localization, corporate training, interpretation, content creation, and bilingual roles. Search globally. For every job find the actual direct URL. For companyBlurred replace middle letters with █. Set hiddenGem true for at most ONE job. If no legitimate ${language} jobs exist, return an empty array.`;

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    const rawText = await apiRes.text();

    if (!apiRes.ok) {
      console.error("Gemini HTTP error:", apiRes.status, rawText.slice(0, 400));
      return res.status(502).json({ jobs: [], debug: `Gemini HTTP ${apiRes.status}: ${rawText.slice(0, 300)}` });
    }

    let data;
    try { data = JSON.parse(rawText); }
    catch { return res.status(502).json({ jobs: [], debug: "Failed to parse Gemini response" }); }

    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      console.error("No text in Gemini response:", JSON.stringify(data).slice(0, 300));
      return res.status(502).json({ jobs: [], debug: "Empty Gemini response" });
    }

    let rawJobs;
    try { rawJobs = JSON.parse(jsonText); }
    catch (e) { return res.status(422).json({ jobs: [], debug: "JSON parse error: " + e.message }); }

    // 2. Zod validation
    const result = JobsArraySchema.safeParse(rawJobs);

    let jobs;
    if (result.success) {
      jobs = result.data;
      console.log(`Zod validation passed — ${jobs.length} jobs`);
    } else {
      // Zod failed — clean and remap manually as fallback
      console.warn("Zod validation failed, cleaning manually:", result.error.issues.slice(0, 3));
      jobs = (Array.isArray(rawJobs) ? rawJobs : [])
        .filter(j => j && j.title && j.link)
        .map((j, i) => ({
          id: i + 1,
          title: String(j.title || ""),
          company: String(j.company || ""),
          companyBlurred: String(j.companyBlurred || j.company || ""),
          location: String(j.location || "Remote"),
          salary: String(j.salary || "Competitive"),
          type: String(j.type || "Full-time"),
          tag: String(j.tag || "Featured"),
          description: String(j.description || ""),
          requirements: Array.isArray(j.requirements) ? j.requirements.slice(0, 3).map(String) : [],
          link: String(j.link || "#"),
          featured: Boolean(j.featured),
          hiddenGem: Boolean(j.hiddenGem),
        }));
    }

    if (jobs.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    // 3. Store in Redis cache
    await setInCache(cacheKey, jobs);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ jobs });

  } catch (err) {
    console.error("Handler exception:", err);
    return res.status(500).json({ jobs: [], debug: "Exception: " + err.message });
  }
}
