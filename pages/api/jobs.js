export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { language = "English", langCode = "en", today } = req.body || {};
  const isEnglish = langCode === "en";

  const prompt = isEnglish
    ? `Today is ${today}. Search the web and find 12 of the best, highest-paying language career opportunities currently available. Include a broad mix: ESL/EFL teaching (online and abroad), business English coaching, translation, localization, corporate language training, IELTS/TOEFL prep, curriculum design, and bilingual professional roles. Prioritize salaries above $20/hr or $45,000/yr. Search platforms like VIPKid, Preply, iTalki, Cambly, Berlitz, EPIK Korea, British Council, Teach Away, international schools in UAE/Korea/Japan/Thailand/Jordan, US universities, and major EdTech companies. For every job, find the ACTUAL direct URL to the job listing or application page.

Return a JSON array of exactly 12 objects with these exact fields:
- id (1-12)
- title (job title)
- company (real company name)
- companyBlurred (company name with middle letters replaced by ████ e.g. "Pre███ Business")
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

Return a JSON array of up to 12 objects (fewer if fewer quality results exist, return [] if none found). Each object must have:
- id (sequential from 1)
- title
- company (real company name)
- companyBlurred (company name with middle letters replaced by ████)
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
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4000,
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 8,
        }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const rawText = await apiRes.text();

    if (!apiRes.ok) {
      console.error("Anthropic API HTTP error:", apiRes.status, rawText.slice(0, 400));
      return res.status(200).json({ jobs: [], debug: `HTTP ${apiRes.status}: ${rawText.slice(0, 200)}` });
    }

    let data;
    try { data = JSON.parse(rawText); }
    catch (e) { return res.status(200).json({ jobs: [], debug: "Failed to parse API response: " + rawText.slice(0, 200) }); }

    if (data.error) {
      console.error("Anthropic error:", data.error);
      return res.status(200).json({ jobs: [], debug: data.error.message });
    }

    const fullText = (data.content || [])
      .map(b => b.type === "text" ? b.text : "")
      .filter(Boolean)
      .join("\n");

    // Strip markdown code fences if present
    const stripped = fullText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const match = stripped.match(/\[[\s\S]*\]/);

    if (!match) {
      console.error("No JSON array found. Response was:", fullText.slice(0, 500));
      return res.status(200).json({ jobs: [], debug: "No JSON array in response", preview: fullText.slice(0, 300) });
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
