export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { language = "English", langCode = "en", today } = req.body || {};
  const isEnglish = langCode === "en";

  const prompt = isEnglish
    ? `Today is ${today}. Search the web and find 12 of the best, highest-paying language career opportunities currently available. Include a broad mix: ESL/EFL teaching (online and abroad), business English coaching, translation, localization, corporate language training, IELTS/TOEFL prep, curriculum design, and bilingual professional roles. Prioritize salaries above $20/hr or $45,000/yr. Search platforms like VIPKid, Preply, iTalki, Cambly, Berlitz, EPIK Korea, British Council, Teach Away, international schools in UAE/Korea/Japan/Thailand/Jordan, US universities, and major EdTech companies. For every job find the ACTUAL direct URL to the job listing or application page.

Return a JSON array of exactly 12 objects with these exact fields:
- id (1-12)
- title (job title)
- company (real company name)
- companyBlurred (company name with middle letters replaced by █ characters e.g. "Pre███ Business")
- location (city/country or "Remote")
- salary (e.g. "$25-35/hr" or "$50,000/yr")
- type (one of: "Full-time", "Part-time", "Contract", "Freelance")
- tag (one of: "Editor's Choice", "Premium Pick", "Rare Find", "Featured", "Recommended", "Fast Filling")
- description (exactly 2 compelling sentences)
- requirements (array of exactly 3 strings)
- link (REAL working URL to the actual job or apply page)
- featured (boolean, true if salary is very competitive)
- hiddenGem (boolean, true for exactly ONE job only)

Return ONLY a valid JSON array. No markdown. No backticks. No explanation. No extra text.`
    : `Today is ${today}. Search the web for the best paying jobs and career opportunities that require or involve the ${language} language. Include: ${language} teaching jobs (online and in-person), translation work, localization roles, corporate ${language} language training, interpreter positions, ${language} content creation, and any professional role where ${language} fluency is a key requirement. Search globally across job boards, company career pages, and language teaching platforms.

Return a JSON array of up to 12 objects (fewer if fewer quality results exist, return [] if truly none found). Each object must have:
- id (sequential from 1)
- title
- company (real company name)
- companyBlurred (company name with middle letters replaced by █ characters)
- location (city/country or "Remote")
- salary (formatted string, or "Competitive" if unavailable)
- type (one of: "Full-time", "Part-time", "Contract", "Freelance")
- tag (one of: "Editor's Choice", "Premium Pick", "Rare Find", "Featured", "Recommended", "Fast Filling")
- description (exactly 2 sentences)
- requirements (array of exactly 3 strings)
- link (REAL working URL to the job listing)
- featured (boolean)
- hiddenGem (boolean, true for at most ONE job)

Return ONLY valid JSON array. No markdown. No backticks. No explanation.`;

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
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    const rawText = await apiRes.text();

    if (!apiRes.ok) {
      console.error("Gemini API error:", apiRes.status, rawText.slice(0, 400));
      return res.status(200).json({ jobs: [], debug: `Gemini HTTP ${apiRes.status}: ${rawText.slice(0, 300)}` });
    }

    let data;
    try { data = JSON.parse(rawText); }
    catch (e) { return res.status(200).json({ jobs: [], debug: "Failed to parse Gemini response" }); }

    // Extract text from Gemini response structure
    const fullText = data?.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "")
      .join("\n") || "";

    if (!fullText) {
      console.error("Empty Gemini response:", JSON.stringify(data).slice(0, 400));
      return res.status(200).json({ jobs: [], debug: "Empty response from Gemini", raw: JSON.stringify(data).slice(0, 300) });
    }

    // Strip markdown code fences
    const stripped = fullText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const match = stripped.match(/\[[\s\S]*\]/);

    if (!match) {
      console.error("No JSON array in Gemini response:", fullText.slice(0, 500));
      return res.status(200).json({ jobs: [], debug: "No JSON array found", preview: fullText.slice(0, 300) });
    }

    let jobs;
    try { jobs = JSON.parse(match[0]); }
    catch (e) { return res.status(200).json({ jobs: [], debug: "JSON parse error: " + e.message }); }

    if (!Array.isArray(jobs)) {
      return res.status(200).json({ jobs: [], debug: "Response was not an array" });
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
        requirements: Array.isArray(j.requirements) ? j.requirements.slice(0, 3).map(String) : [],
        link: String(j.link || "#"),
        featured: Boolean(j.featured),
        hiddenGem: Boolean(j.hiddenGem),
      }));

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ jobs: cleaned });

  } catch (err) {
    console.error("Handler exception:", err);
    return res.status(200).json({ jobs: [], debug: "Exception: " + err.message });
  }
}
