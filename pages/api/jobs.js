import { Redis } from "@upstash/redis";

let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL.trim(),
      token: process.env.UPSTASH_REDIS_REST_TOKEN.trim(),
    });
  }
} catch (e) {
  console.error("Redis init failed:", e.message);
}

function getCacheKey(langCode) {
  const date = new Date().toISOString().split("T")[0];
  return `esljd:v2:${langCode}:${date}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { language = "English", langCode = "en", today = new Date().toDateString() } = req.body || {};

  // ── 1. CHECK CACHE ──────────────────────────────────────────────────────
  const cacheKey = getCacheKey(langCode);
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`Cache HIT for ${langCode}`);
        const jobs = typeof cached === "string" ? JSON.parse(cached) : cached;
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json({ jobs, fromCache: true });
      }
      console.log(`Cache MISS for ${langCode}`);
    } catch (e) {
      console.error("Redis get error:", e.message);
    }
  }

  // ── 2. BUILD PROMPT ─────────────────────────────────────────────────────
  const isEnglish = langCode === "en";

  const prompt = isEnglish
    ? `Today is ${today}. Generate a list of 12 realistic, high-paying language career job opportunities. Include a mix of: online ESL/EFL teaching, business English coaching, translation, localization, corporate language training, IELTS/TOEFL prep, and bilingual professional roles. Use real companies like VIPKid, Preply, iTalki, Cambly, Berlitz, EPIK Korea, British Council, Teach Away, international schools in UAE/Korea/Japan/Thailand, US universities, and EdTech companies. Prioritize salaries above $20/hr or $45,000/yr.

Return a JSON array of exactly 12 objects. Each object must have these exact fields:
- id: number (1-12)
- title: string (job title)
- company: string (real company name)
- companyBlurred: string (same company but middle letters replaced with █ e.g. Pre███ for Preply, Cam███ for Cambly)
- location: string (city/country or Remote)
- salary: string (e.g. "$22-26/hr" or "$55,000/yr" or "$2,800/mo + Housing")
- type: string (one of: Full-time, Part-time, Contract, Freelance)
- tag: string (one of: Editor's Choice, Premium Pick, Rare Find, Featured, Recommended, Fast Filling)
- description: string (exactly 2 compelling sentences about the role)
- requirements: array of exactly 3 strings
- link: string (real URL to company careers or job posting page)
- featured: boolean (true if salary is very competitive)
- hiddenGem: boolean (true for exactly ONE job, the most interesting hidden opportunity)

Return ONLY the raw JSON array. No markdown fences, no backticks, no explanation text.`
    : `Today is ${today}. Generate a list of up to 12 realistic job opportunities that require ${language} language skills. Include ${language} teaching, translation, localization, corporate training, interpretation, and bilingual professional roles at real companies worldwide.

Return a JSON array of job objects (return [] if ${language} has very limited opportunities). Each object must have:
- id: number
- title: string
- company: string
- companyBlurred: string (middle letters replaced with █)
- location: string
- salary: string
- type: string (Full-time, Part-time, Contract, or Freelance)
- tag: string (one of: Editor's Choice, Premium Pick, Rare Find, Featured, Recommended, Fast Filling)
- description: string (2 sentences)
- requirements: array of 3 strings
- link: string (real company URL)
- featured: boolean
- hiddenGem: boolean (true for at most one)

Return ONLY the raw JSON array. No markdown, no backticks, no explanation.`;

  // ── 3. CALL GEMINI (no google_search — saves money) ─────────────────────
  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const rawText = await apiRes.text();

    if (!apiRes.ok) {
      console.error("Gemini error:", apiRes.status, rawText.slice(0, 200));
      return res.status(502).json({ jobs: [], debug: `Gemini ${apiRes.status}` });
    }

    const data = JSON.parse(rawText);
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || "").join("");

    if (!text) {
      return res.status(502).json({ jobs: [], debug: "Empty Gemini response" });
    }

    // Strip markdown if present
    const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const match = clean.match(/\[[\s\S]*\]/);

    if (!match) {
      console.error("No JSON array found:", text.slice(0, 300));
      return res.status(422).json({ jobs: [], debug: "No JSON in response" });
    }

    let jobs;
    try {
      jobs = JSON.parse(match[0]);
    } catch (e) {
      return res.status(422).json({ jobs: [], debug: "Parse error: " + e.message });
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    // Clean each job
    const cleaned = jobs
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
        requirements: Array.isArray(j.requirements)
          ? j.requirements.slice(0, 3).map(String)
          : ["See full job listing"],
        link: String(j.link || "#"),
        featured: Boolean(j.featured),
        hiddenGem: Boolean(j.hiddenGem),
      }));

    // ── 4. CACHE FOR 20 HOURS ──────────────────────────────────────────────
    if (redis && cleaned.length > 0) {
      try {
        await redis.setex(cacheKey, 72000, JSON.stringify(cleaned));
        console.log(`Cached ${cleaned.length} jobs for ${langCode}`);
      } catch (e) {
        console.error("Redis set error:", e.message);
      }
    }

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ jobs: cleaned });

  } catch (err) {
    console.error("Exception:", err.message);
    return res.status(500).json({ jobs: [], debug: err.message });
  }
}
