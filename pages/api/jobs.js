import { Redis } from "@upstash/redis";

let redis = null;
try {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").trim().replace(/^UPSTASH_REDIS_REST_URL=/, "").replace(/"/g, "");
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim().replace(/^UPSTASH_REDIS_REST_TOKEN=/, "").replace(/"/g, "");
  if (url.startsWith("https://") && token.length > 10) {
    redis = new Redis({ url, token });
    console.log("Redis initialized OK");
  }
} catch (e) {
  console.error("Redis init failed:", e.message);
}

function getCacheKey(langCode) {
  const date = new Date().toISOString().split("T")[0];
  return `esljd:v4:${langCode}:${date}`;
}

// Attempt to repair common JSON issues Gemini produces
function repairJSON(str) {
  // Remove trailing commas before ] or }
  let fixed = str
    .replace(/,\s*]/g, "]")
    .replace(/,\s*}/g, "}")
    // Fix unescaped quotes inside strings (basic)
    .replace(/:\s*"([^"]*)"([^,}\]]*)"([^"]*)"/, ': "$1$2$3"')
    // Remove any trailing content after last ]
    .replace(/\]\s*[^]*$/, "]");
  return fixed;
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
    ? `You are a JSON generator. Output ONLY a valid JSON array of 12 job objects. No markdown, no backticks, no comments, no trailing commas. Start with [ and end with ].

Each object must follow this exact structure (copy it exactly, replacing values):
{"id":1,"title":"Senior ESL Instructor","company":"VIPKid","companyBlurred":"VIP███","location":"Remote","salary":"$22-26/hr","type":"Full-time","tag":"Editor's Choice","description":"Teach K-12 students across Asia using North American curriculum. Enjoy flexible hours and performance bonuses.","requirements":["TEFL or BA in Education","2+ years ESL experience","Native English speaker"],"link":"https://www.vipkid.com/teach","featured":true,"hiddenGem":false}

Generate 12 unique jobs using real companies like VIPKid, Preply, iTalki, Cambly, Berlitz, EPIK, British Council, Teach Away, international schools in UAE/Korea/Japan/Thailand, US universities. Mix teaching, translation, localization, corporate training, IELTS prep, bilingual roles. One job must have hiddenGem:true.

CRITICAL: Valid JSON only. No trailing commas. No line breaks inside string values. Start with [ end with ].`
    : `You are a JSON generator. Output ONLY a valid JSON array of job objects requiring ${language} skills. No markdown, no backticks, no comments, no trailing commas. Start with [ and end with ]. Return [] if no good results exist.

Each object: {"id":1,"title":"string","company":"string","companyBlurred":"string with middle letters as █","location":"string","salary":"string","type":"Full-time","tag":"Featured","description":"Two sentences.","requirements":["req1","req2","req3"],"link":"https://example.com","featured":false,"hiddenGem":false}

CRITICAL: Valid JSON only. No trailing commas. Start with [ end with ].`;

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
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

    // Extract JSON array
    const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");

    if (start === -1 || end === -1 || end <= start) {
      console.error("No JSON array:", text.slice(0, 300));
      return res.status(422).json({ jobs: [], debug: "No JSON array", preview: text.slice(0, 200) });
    }

    let jsonStr = clean.slice(start, end + 1);

    // Try parsing, then try repair if it fails
    let jobs;
    try {
      jobs = JSON.parse(jsonStr);
    } catch (e1) {
      console.warn("First parse failed, trying repair:", e1.message);
      try {
        jobs = JSON.parse(repairJSON(jsonStr));
        console.log("Repair succeeded");
      } catch (e2) {
        console.error("Repair also failed:", e2.message);
        // Last resort: extract individual job objects
        const jobMatches = jsonStr.match(/\{[^{}]*"title"[^{}]*\}/g);
        if (jobMatches && jobMatches.length > 0) {
          jobs = jobMatches.reduce((acc, match) => {
            try { acc.push(JSON.parse(match)); } catch {}
            return acc;
          }, []);
          console.log(`Extracted ${jobs.length} jobs individually`);
        } else {
          return res.status(422).json({ jobs: [], debug: "Could not parse JSON: " + e2.message });
        }
      }
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

    if (cleaned.length === 0) {
      return res.status(200).json({ jobs: [] });
    }

    // CACHE FOR 20 HOURS
    if (redis) {
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
