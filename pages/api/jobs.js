import { z } from "zod";
import { Redis } from "@upstash/redis";

const JobSchema = z.object({
  id:             z.number(),
  title:          z.string().min(1),
  company:        z.string().min(1),
  companyBlurred: z.string().min(1),
  location:       z.string().min(1),
  salary:         z.string().min(1),
  type:           z.string().min(1),
  tag:            z.string().min(1),
  description:    z.string().min(1),
  requirements:   z.array(z.string()).min(1).max(3),
  link:           z.string().min(1),
  featured:       z.boolean(),
  hiddenGem:      z.boolean(),
});

const JobsArraySchema = z.array(JobSchema);

let redis;
try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch {
  redis = null;
}

function getCacheKey(langCode) {
  const date = new Date().toISOString().split("T")[0];
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
    await redis.setex(key, 72000, JSON.stringify(data));
  } catch {}
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { language = "English", langCode = "en", today = new Date().toDateString() } = req.body || {};

  const cacheKey = getCacheKey(langCode);
  const cached = await getFromCache(cacheKey);

  if (cached) {
    console.log(`Cache hit for ${langCode}`);
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json({ jobs: typeof cached === "string" ? JSON.parse(cached) : cached, fromCache: true });
  }

  console.log(`Cache miss for ${langCode} — calling Gemini`);

  const isEnglish = langCode === "en";

  const prompt = isEnglish
    ? `Today is ${today}. Search the web and find 12 of the best highest-paying language career opportunities currently available. Include ESL/EFL teaching online and abroad, business English coaching, translation, localization, corporate language training, IELTS/TOEFL prep, curriculum design, and bilingual professional roles. Prioritize salaries above $20/hr or $45000/yr. Search VIPKid, Preply, iTalki, Cambly, Berlitz, EPIK Korea, British Council, Teach Away, international schools in UAE Korea Japan Thailand Jordan, US universities, and major EdTech companies. For every job find the ACTUAL direct URL to the listing. For companyBlurred replace middle letters with the unicode block character █.

You MUST return a valid JSON array of exactly 12 job objects. Each object must have these exact fields:
- id: number (1-12)
- title: string
- company: string (real company name)
- companyBlurred: string (middle letters replaced with █)
- location: string
- salary: string
- type: string (Full-time, Part-time, Contract, or Freelance)
- tag: string (one of: Editor's Choice, Premium Pick, Rare Find, Featured, Recommended, Fast Filling)
- description: string (2 sentences)
- requirements: array of 3 strings
- link: string (real URL)
- featured: boolean
- hiddenGem: boolean (true for exactly ONE job)

Return ONLY the JSON array. No markdown, no backticks, no explanation.`
    : `Today is ${today}. Search the web for the best paying jobs requiring ${language} language skills. Include ${language} teaching, translation, localization, corporate training, interpretation, content creation, and bilingual roles. Search globally. For every job find the actual direct URL. For companyBlurred replace middle letters with █. Set hiddenGem true for at most ONE job.

Return a JSON array of up to 12 job objects (return [] if none found). Each object must have:
- id: number
- title: string
- company: string
- companyBlurred: string
- location: string
- salary: string
- type: string
- tag: string (one of: Editor's Choice, Premium Pick, Rare Find, Featured, Recommended, Fast Filling)
- description: string
- requirements: array of 3 strings
- link: string
- featured: boolean
- hiddenGem: boolean

Return ONLY the JSON array. No markdown, no backticks, no explanation.`;

  try {
    // Use google_search grounding WITHOUT responseSchema (they can't be combined)
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
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

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const jsonText = parts.map(p => p.text || "").join("");

    if (!jsonText) {
      console.error("No text in Gemini response");
      return res.status(502).json({ jobs: [], debug: "Empty Gemini response" });
    }

    // Extract JSON array - strip markdown fences if present
    const stripped = jsonText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const match = stripped.match(/\[[\s\S]*\]/);

    if (!match) {
      console.error("No JSON array found in:", jsonText.slice(0, 500));
      return res.status(422).json({ jobs: [], debug: "No JSON array in response", preview: jsonText.slice(0, 300) });
    }

    let rawJobs;
    try { rawJobs = JSON.parse(match[0]); }
    catch (e) { return res.status(422).json({ jobs: [], debug: "JSON parse error: " + e.message }); }

    // Zod validation with fallback cleaning
    const result = JobsArraySchema.safeParse(rawJobs);
    let jobs;

    if (result.success) {
      jobs = result.data;
      console.log(`Zod validation passed — ${jobs.length} jobs`);
    } else {
      console.warn("Zod validation failed, cleaning manually");
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
          requirements: Array.isArray(j.requirements) ? j.requirements.slice(0, 3).map(String) : ["See job listing"],
          link: String(j.link || "#"),
          featured: Boolean(j.featured),
          hiddenGem: Boolean(j.hiddenGem),
        }));
    }

    if (jobs.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    await setInCache(cacheKey, jobs);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ jobs });

  } catch (err) {
    console.error("Handler exception:", err);
    return res.status(500).json({ jobs: [], debug: "Exception: " + err.message });
  }
}
