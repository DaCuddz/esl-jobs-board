import { useState, useEffect, useCallback } from "react";

const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Senior Online ESL Instructor",
    company: "VIPKid",
    location: "Remote (Worldwide)",
    salary: "$22–$26/hr",
    type: "Part-time / Full-time",
    tag: "🌟 Top Pick",
    description: "Teach North American curriculum to K-12 students across Asia. Flexible hours, consistent student base, and performance bonuses.",
    requirements: ["TEFL/TESOL or BA in Education", "2+ yrs ESL experience", "Native English speaker"],
    link: "#",
    hot: true,
  },
  {
    id: 2,
    title: "Business English Coach",
    company: "Preply Business",
    location: "Remote",
    salary: "$30–$50/hr",
    type: "Contract",
    tag: "💼 Business",
    description: "Work with Fortune 500 corporate clients on professional communication, presentations, and negotiations. High-value students.",
    requirements: ["Business background preferred", "CELTA or equivalent", "Strong communication skills"],
    link: "#",
    hot: true,
  },
  {
    id: 3,
    title: "ESL Lead Teacher",
    company: "International School of Bangkok",
    location: "Bangkok, Thailand",
    salary: "$2,800–$3,400/mo + Housing",
    type: "Full-time",
    tag: "✈️ Abroad",
    description: "Join a prestigious international school. Package includes housing allowance, flights, health insurance, and 45 days annual leave.",
    requirements: ["State teaching license", "3+ yrs classroom experience", "IB curriculum knowledge"],
    link: "#",
    hot: false,
  },
  {
    id: 4,
    title: "English Language Program Coordinator",
    company: "Kaplan International",
    location: "New York, USA",
    salary: "$55,000–$68,000/yr",
    type: "Full-time",
    tag: "🏢 Management",
    description: "Lead a team of 12 instructors, manage curriculum, student admissions, and corporate language contracts.",
    requirements: ["MA in TESOL/Applied Linguistics", "5+ yrs experience", "Management background"],
    link: "#",
    hot: false,
  },
  {
    id: 5,
    title: "Online English Tutor – Adult Learners",
    company: "iTalki",
    location: "Remote",
    salary: "$18–$40/hr (self-set)",
    type: "Freelance",
    tag: "🎓 Freelance",
    description: "Set your own rates and schedule. Grow a loyal student base. Platform handles payments and scheduling.",
    requirements: ["Any TEFL certification", "Good internet connection", "Patience & adaptability"],
    link: "#",
    hot: false,
  },
  {
    id: 6,
    title: "ESL Teacher – Elementary School",
    company: "EPIK (South Korea Gov.)",
    location: "South Korea",
    salary: "$1,800–$2,650/mo + Pension",
    type: "Full-time",
    tag: "✈️ Abroad",
    description: "Government-funded program. Free furnished housing, severance pay, and return flights. Iconic cultural experience.",
    requirements: ["BA in any field", "TEFL certificate", "Clean background check"],
    link: "#",
    hot: true,
  },
  {
    id: 7,
    title: "Academic English Writing Instructor",
    company: "Arizona State University Online",
    location: "Remote (US-based)",
    salary: "$62,000–$75,000/yr",
    type: "Full-time",
    tag: "🎓 University",
    description: "Teach academic writing and reading comprehension to international graduate students. Curriculum development included.",
    requirements: ["MA in TESOL or English", "University teaching experience", "Curriculum design skills"],
    link: "#",
    hot: false,
  },
  {
    id: 8,
    title: "ESL Content Creator & Teacher",
    company: "Cambly",
    location: "Remote",
    salary: "$12–$17.50/hr",
    type: "Part-time",
    tag: "📱 EdTech",
    description: "Teach conversation English while also contributing lesson content for the platform's library. Great for those who love creative work.",
    requirements: ["Native English speaker", "Content creation experience a plus", "Energetic on camera"],
    link: "#",
    hot: false,
  },
  {
    id: 9,
    title: "English Teacher – High School",
    company: "Teach Away – UAE",
    location: "Abu Dhabi, UAE",
    salary: "$3,500–$5,500/mo tax-free",
    type: "Full-time",
    tag: "✈️ Abroad",
    description: "Tax-free salary in one of the highest-paying ESL markets. Full medical, annual flights home, and end-of-service gratuity.",
    requirements: ["Teaching license", "2+ yrs secondary experience", "IELTS/TOEFL familiarity"],
    link: "#",
    hot: true,
  },
  {
    id: 10,
    title: "IELTS Exam Prep Instructor",
    company: "British Council",
    location: "Various / Remote",
    salary: "$28–$45/hr",
    type: "Contract",
    tag: "📊 Test Prep",
    description: "Specialize in high-stakes exam preparation. Consistent demand and above-market rates for certified trainers.",
    requirements: ["Cambridge CELTA/DELTA", "IELTS examiner experience preferred", "Strong analytical skills"],
    link: "#",
    hot: false,
  },
  {
    id: 11,
    title: "Online ESL Teacher – Spanish Speakers",
    company: "Berlitz",
    location: "Remote",
    salary: "$20–$28/hr",
    type: "Part-time",
    tag: "🌐 Language-Focused",
    description: "Teach professionally structured immersive lessons to Spanish-speaking adult professionals worldwide.",
    requirements: ["TEFL certificate", "Spanish comprehension a plus", "Professional demeanor"],
    link: "#",
    hot: false,
  },
  {
    id: 12,
    title: "Head of EFL Department",
    company: "International Community School",
    location: "Amman, Jordan",
    salary: "$4,200–$5,100/mo + Benefits",
    type: "Full-time",
    tag: "🏆 Leadership",
    description: "Lead the EFL department for a 600-student international school. Housing, schooling for dependents, and professional development budget included.",
    requirements: ["MA in Education/TESOL", "5+ yrs leadership", "IB or AP experience"],
    link: "#",
    hot: true,
  },
];

const TAG_COLORS = {
  "🌟 Top Pick": "#FFD700",
  "💼 Business": "#4A9FFF",
  "✈️ Abroad": "#FF6B6B",
  "🏢 Management": "#A78BFA",
  "🎓 Freelance": "#34D399",
  "📱 EdTech": "#FB923C",
  "🎓 University": "#60A5FA",
  "📊 Test Prep": "#F472B6",
  "🌐 Language-Focused": "#2DD4BF",
  "🏆 Leadership": "#FBBF24",
};

function JobCard({ job, index }) {
  const [expanded, setExpanded] = useState(false);
  const tagColor = TAG_COLORS[job.tag] || "#aaa";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "16px",
        padding: "24px",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        position: "relative",
        overflow: "hidden",
        animation: "fadeSlideUp 0.5s ease both",
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {job.hot && (
        <div style={{
          position: "absolute", top: 16, right: 16,
          background: "linear-gradient(135deg, #FF6B35, #FF3864)",
          color: "#fff", fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.08em", padding: "3px 10px",
          borderRadius: "20px", textTransform: "uppercase",
        }}>HOT</div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "14px" }}>
        <div style={{
          width: 46, height: 46, borderRadius: "12px",
          background: `linear-gradient(135deg, ${tagColor}22, ${tagColor}44)`,
          border: `1px solid ${tagColor}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", flexShrink: 0,
        }}>
          {job.tag ? job.tag.split(" ")[0] : "📋"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#f0ece4", marginBottom: "3px", lineHeight: 1.3 }}>
            {job.title}
          </div>
          <div style={{ color: "#9b9080", fontSize: "13px", fontWeight: 500 }}>{job.company}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        {[job.location, job.type, job.salary].map((item, i) => (
          <span key={i} style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "4px 10px",
            fontSize: "12px",
            color: "#c8bfb0",
            fontFamily: "'DM Mono', monospace",
          }}>{item}</span>
        ))}
        <span style={{
          background: `${tagColor}18`,
          border: `1px solid ${tagColor}44`,
          borderRadius: "8px",
          padding: "4px 10px",
          fontSize: "12px",
          color: tagColor,
          fontFamily: "'DM Mono', monospace",
        }}>{job.tag}</span>
      </div>

      <p style={{ color: "#a09080", fontSize: "13.5px", lineHeight: 1.65, margin: 0 }}>
        {job.description}
      </p>

      {expanded && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ color: "#c8bfb0", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Requirements
          </div>
          {(job.requirements || []).map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: tagColor, flexShrink: 0 }} />
              <span style={{ color: "#a09080", fontSize: "13px" }}>{r}</span>
            </div>
          ))}
          <a
            href={job.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              marginTop: "14px",
              background: `linear-gradient(135deg, ${tagColor}cc, ${tagColor}88)`,
              border: "none",
              borderRadius: "10px",
              padding: "10px 22px",
              color: "#0a0805",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              letterSpacing: "0.04em",
              width: "100%",
              textAlign: "center",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
            onClick={e => e.stopPropagation()}
          >
            Apply Now →
          </a>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const filters = ["All", "Remote", "Abroad", "University", "Business", "Freelance"];

  const fetchFreshJobs = useCallback(async () => {
    setLoading(true);
    setStatusMsg("🔍 Searching for today's best ESL opportunities...");
    try {
      const response = await fetch("/api/jobs", { method: "POST" });
      const data = await response.json();
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        setLastRefresh(new Date());
        setStatusMsg("✅ Fresh jobs loaded for today!");
        setTimeout(() => setStatusMsg(""), 3000);
        setLoading(false);
        return;
      }
      throw new Error("No jobs returned");
    } catch (err) {
      console.error(err);
      setStatusMsg("⚠️ Using curated sample jobs. Click refresh to try again.");
      setJobs(SAMPLE_JOBS);
      setLastRefresh(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem("esl_jobs_cache")); } catch {}
    const today = new Date().toDateString();
    if (cached && cached.date === today && cached.jobs?.length === 12) {
      setJobs(cached.jobs);
      setLastRefresh(new Date(cached.timestamp));
    } else {
      fetchFreshJobs();
    }
  }, [fetchFreshJobs]);

  useEffect(() => {
    if (lastRefresh) {
      try {
        localStorage.setItem("esl_jobs_cache", JSON.stringify({
          date: new Date().toDateString(),
          timestamp: lastRefresh.toISOString(),
          jobs,
        }));
      } catch {}
    }
  }, [jobs, lastRefresh]);

  const filteredJobs = jobs.filter(job => {
    const matchFilter =
      filter === "All" ||
      (filter === "Remote" && job.location?.toLowerCase().includes("remote")) ||
      (filter === "Abroad" && job.tag?.includes("✈️")) ||
      (filter === "University" && job.tag?.includes("University")) ||
      (filter === "Business" && job.tag?.includes("Business")) ||
      (filter === "Freelance" && (job.tag?.includes("Freelance") || job.type?.toLowerCase().includes("freelance")));
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || [job.title, job.company, job.location, job.description].join(" ").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0805; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0805; }
        ::-webkit-scrollbar-thumb { background: #3a3020; border-radius: 3px; }
        input::placeholder { color: #6b5f4a; }
        input:focus { outline: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0a0805", position: "relative", fontFamily: "'Lora', serif", color: "#f0ece4" }}>

        <div style={{
          position: "fixed", top: "-20%", left: "30%",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(180,130,60,0.08) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "0 20px 60px" }}>

          {/* Header */}
          <header style={{ textAlign: "center", padding: "60px 0 40px", animation: "fadeSlideUp 0.7s ease both" }}>
            <div style={{
              display: "inline-block",
              background: "rgba(180,130,60,0.12)",
              border: "1px solid rgba(180,130,60,0.3)",
              borderRadius: "30px",
              padding: "6px 18px",
              fontSize: "11px",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.12em",
              color: "#c8a060",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}>
              ✦ Daily Curated · Updated Every Morning ✦
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#f0ece4",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}>
              ESL Jobs<br />
              <span style={{ color: "#c8a060", fontStyle: "italic" }}>Worth Teaching For</span>
            </h1>
            <p style={{ color: "#8a7a60", fontSize: "16px", maxWidth: "520px", margin: "0 auto 28px", lineHeight: 1.7 }}>
              12 hand-picked, high-paying English teaching opportunities refreshed each morning — from remote roles to international adventures.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={fetchFreshJobs}
                disabled={loading}
                style={{
                  background: loading ? "rgba(180,130,60,0.2)" : "linear-gradient(135deg, #c8a060, #9a7040)",
                  border: "none", borderRadius: "12px",
                  padding: "12px 24px",
                  color: loading ? "#8a7040" : "#0a0805",
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 700, fontSize: "13px",
                  letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "⟳ Searching..." : "⟳ Refresh Today's Jobs"}
              </button>
              {lastRefresh && (
                <span style={{ color: "#5a5040", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>
                  Last updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>

            {statusMsg && (
              <div style={{
                marginTop: "14px", fontSize: "13px",
                color: statusMsg.includes("✅") ? "#6ee7b7" : statusMsg.includes("⚠️") ? "#fbbf24" : "#c8a060",
                fontFamily: "'DM Mono', monospace",
              }}>
                {statusMsg}
              </div>
            )}
          </header>

          {/* Search & Filter */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap", animation: "fadeSlideUp 0.7s 0.2s ease both" }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search jobs, companies, locations..."
              style={{
                flex: 1, minWidth: "200px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "12px 18px",
                color: "#f0ece4",
                fontSize: "14px",
                fontFamily: "'DM Mono', monospace",
              }}
            />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? "rgba(180,130,60,0.25)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${filter === f ? "rgba(180,130,60,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "10px",
                    padding: "10px 16px",
                    color: filter === f ? "#c8a060" : "#8a7a60",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                    transition: "all 0.2s",
                  }}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{
            display: "flex", gap: "24px", marginBottom: "32px",
            padding: "16px 20px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            flexWrap: "wrap",
          }}>
            {[
              { label: "Jobs Found", value: filteredJobs.length },
              { label: "Remote Options", value: filteredJobs.filter(j => j.location?.toLowerCase().includes("remote")).length },
              { label: "International", value: filteredJobs.filter(j => j.tag?.includes("✈️")).length },
              { label: "Hot Picks", value: filteredJobs.filter(j => j.hot).length },
            ].map(stat => (
              <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#c8a060" }}>{stat.value}</span>
                <span style={{ color: "#5a5040", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#5a5040" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px", animation: "pulse 1.5s ease infinite" }}>◈</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", letterSpacing: "0.1em" }}>
                SEARCHING THE WEB FOR TODAY'S BEST JOBS...
              </div>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
            }}>
              {filteredJobs.map((job, i) => (
                <JobCard key={job.id || i} job={job} index={i} />
              ))}
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#5a5040" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>◇</div>
              <div>No jobs match your current filter. Try "All" or a different search.</div>
            </div>
          )}

          {/* Footer */}
          <footer style={{
            textAlign: "center", marginTop: "60px", paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            color: "#4a4030", fontSize: "12px", fontFamily: "'DM Mono', monospace",
            lineHeight: 1.8,
          }}>
            <div style={{ color: "#c8a060", fontFamily: "'Playfair Display', serif", fontSize: "18px", marginBottom: "8px" }}>
              ESL Jobs Daily
            </div>
            Curated every morning by AI · Click any job card to expand · Tap "Apply Now" to visit the listing
            <br />
            Jobs refreshed daily · Share this page with fellow teachers ✦
          </footer>
        </div>
      </div>
    </>
  );
}
