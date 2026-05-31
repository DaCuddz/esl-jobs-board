export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Today is ${today}. Search for 12 of the best, highest-paying ESL/EFL teaching jobs currently available. Mix remote, international, and domestic. Prioritize salaries above $20/hr or $45,000/yr. Include platforms like VIPKid, Preply, EPIK, British Council, international schools in UAE/Korea/Japan, US universities, and online EdTech companies.

Return a JSON array of exactly 12 objects with these fields:
- id (1-12)
- title
- company
- location
- salary (e.g. "$25-35/hr" or "$50,000/yr")
- type (Full-time / Part-time / Contract / Freelance)
- tag (one of: "🌟 Top Pick","💼 Business","✈️ Abroad","🏢 Management","🎓 Freelance","📱 EdTech","🎓 University","📊 Test Prep","🌐 Language-Focused","🏆 Leadership")
- description (2 compelling sentences)
- requirements (array of 3 strings)
- link (real URL if found, else "#")
- hot (boolean)

Return ONLY a valid JSON array. No markdown. No extra text.`
      }],
    }),
  });

  const data = await response.json();
  const fullText = (data.content || [])
    .map(b => b.type === "text" ? b.text : "")
    .join("\n");

  const match = fullText.match(/\[[\s\S]*\]/);
  if (!match) return res.status(500).json({ error: "No jobs found" });

  try {
    const jobs = JSON.parse(match[0]);
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json({ jobs });
  } catch {
    return res.status(500).json({ error: "Parse error" });
  }
}
