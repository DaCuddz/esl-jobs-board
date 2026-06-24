import { Redis } from "@upstash/redis";

let redis = null;
try {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").trim().replace(/^UPSTASH_REDIS_REST_URL=/, "").replace(/"/g, "");
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim().replace(/^UPSTASH_REDIS_REST_TOKEN=/, "").replace(/"/g, "");
  if (url.startsWith("https://") && token.length > 10) {
    redis = new Redis({ url, token });
    console.log("Redis initialized OK");
  } else {
    console.error("Redis env vars invalid — url:", url.slice(0, 30));
  }
} catch (e) {
  console.error("Redis init failed:", e.message);
}

function getCacheKey(langCode) {
  const date = new Date().toISOString().split("T")[0];
  return `esljd:v3:${langCode}:${date}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { language = "English", langCode = "en", today = new Date().toDateString() } = req.body || {};

  // 1. CHECK CACHE
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
    } catch (e) {
      console.error("Redis get error:", e.message);
    }
  }

  console.log(`Cache MISS — calling Gemini for ${langCode}`);

  const isEnglish = langCode === "en";

  const prompt = isEnglish
    ? `You are a JSON API. Return ONLY a valid JSON array, nothing else. No markdown, no backticks, no explanation, no bullet points, no text before or after the array.

Generate 12 realistic high-paying language career job listings. Use real companies: VIPKid, Preply, iTalki, Cambly, Berlitz, EPIK Korea, British Council, Teach Away, international schools in UAE/Korea/Japan/Thailand/Jordan, Arizona State University, Kaplan International. Include ESL teaching, business English coaching, translation, localization, IELTS prep, and bilingual roles.

The response must start with [ and end with ]. Each object has exactly these fields:
{"id":1,"title":"Job Title","company":"Real Company","companyBlurred":"Re█████any","location":"City, Country or Remote","salary":"$25-35/hr","type":"Full-time","tag":"Editor's Choice","description":"First sentence about role. Second sentence about benefits.","requirements":["Requirement 1","Requirement 2","Requirement 3"],"link":"https://realcompany.com/careers","featured":true,"hiddenGem":false}

Rules:
- companyBlurred: replace middle letters with █ (e.g. Preply becomes Pre███)
- type: must be one of Full-time, Part-time, Contract, Freelance
- tag: must be one of Editor's Choice, Premium Pick, Rare Find, Featured, Recommended, Fast Filling
- hiddenGem: true for exactly ONE job, false for all others
- link: real company website careers page
- Return exactly 12 objects
- START YOUR RESPONSE WITH [ AND END WITH ]`
    : `You are a JSON API. Return ONLY a valid JSON array, nothing else. No markdown, no backticks, no explanation.

Generate up to 12 realistic job listings requiring ${language} language skills. Include ${language} teaching, translation, localization, corporate training, interpretation, and bilingual roles at real companies.

The response must start with [ and end with ]. Each object:
{"id":1,"title":"Job Title","company":"Real Company","companyBlurred":"Re█████any","location":"City or Remote","salary":"$X/hr","type":"Full-time","tag":"Featured","description":"Sentence one. Sentence two.","requirements":["Req 1","Req 2","Req 3"],"link":"https://company.com/careers","featured":false,"hiddenGem":false}

If very few ${language} jobs exist, return a smaller array. If none, return [].
START YOUR RESPONSE WITH [ AND END WITH ]`;

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const rawText = await apiRes.text();

    if (!apiRes.ok) {
      console.error("Gemini HTTP error:", apiRes.status, rawText.slice(0, 200));
      return res.status(502).json({ jobs: [], debug: `Gemini ${apiRes.status}` });
    }

    const data = JSON.parse(rawText);
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || "").join("").trim();

    if (!text) {
      return res.status(502).json({ jobs: [], debug: "Empty Gemini response" });
    }

    // Aggressively extract JSON array
    const clean = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Find the first [ and last ]
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");

    if (start === -1 || end === -1 || end <= start) {
      console.error("No JSON array found in response:", text.slice(0, 400));
      return res.status(422).json({ jobs: [], debug: "No JSON array", preview: text.slice(0, 300) });
    }

    const jsonStr = clean.slice(start, end + 1);

    let jobs;
    try {
      jobs = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e.message, jsonStr.slice(0, 200));
      return res.status(422).json({ jobs: [], debug: "Parse error: " + e.message });
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

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

    // CACHE FOR 20 HOURS
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
