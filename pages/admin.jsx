import { useState } from "react";

const GUMROAD_ACCESS = "https://esljd.gumroad.com/l/thakqu";
const GUMROAD_CV = "https://esljd.gumroad.com/l/lnrji";
const CV_EMAIL = "TeacherEvonia@gmail.com";

function getAccess() {
  try {
    const raw = localStorage.getItem("esljd_access");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.expiry) { localStorage.removeItem("esljd_access"); return null; }
    return parsed;
  } catch { return null; }
}

export default function Admin() {
  const [logs, setLogs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState(() => getAccess());
  const [cacheStatus, setCacheStatus] = useState("");

  const log = (type, msg) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [...prev, { type, msg, time }]);
  };

  const simulateUnlock = () => {
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const data = { code: "ADMIN-TEST-" + Date.now(), expiry, granted: Date.now() };
    localStorage.setItem("esljd_access", JSON.stringify(data));
    setAccess(data);
    log("ok", "✓ Access unlocked — site will show paid state");
  };

  const clearAccess = () => {
    localStorage.removeItem("esljd_access");
    setAccess(null);
    log("warn", "✕ Access cleared — site will show locked state");
  };

  const fetchJobs = async () => {
    setLoading(true);
    setLogs([]);
    setJobs([]);
    setCacheStatus("");
    log("info", "Calling /api/jobs...");

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    });

    try {
      const start = Date.now();
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "English", langCode: "en", today }),
      });

      const duration = ((Date.now() - start) / 1000).toFixed(1);
      const cache = res.headers.get("X-Cache") || "unknown";
      const data = await res.json();

      log(res.ok ? "ok" : "err", `Status: ${res.status} · ${duration}s · Cache: ${cache}`);
      if (data.debug) log("err", `Debug: ${data.debug}`);
      if (data.preview) log("err", `Preview: ${data.preview}`);

      if (data.fromCache) {
        log("ok", "✓ Served from Redis — zero Gemini cost");
        setCacheStatus("hit");
      } else if (data.jobs?.length > 0) {
        log("ok", "⚡ Fresh Gemini call — now cached 20hrs");
        setCacheStatus("miss");
      }

      if (data.jobs?.length > 0) {
        log("ok", `✓ ${data.jobs.length} jobs returned`);
        log("info", `First: "${data.jobs[0].title}" at ${data.jobs[0].company}`);
        setJobs(data.jobs);
      } else {
        log("err", "✗ No jobs returned — check Vercel logs");
      }
    } catch (e) {
      log("err", `Exception: ${e.message}`);
    }
    setLoading(false);
  };

  const days = access ? Math.ceil((access.expiry - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const logColors = { ok: "#4ade80", err: "#ff6060", info: "#c8a060", warn: "#fbbf24" };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0805; color: #f0ece4; font-family: 'Courier New', monospace; }
        a { color: inherit; text-decoration: none; }
      `}</style>

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* HEADER */}
        <div style={{ borderBottom: "1px solid #1a1008", paddingBottom: 20, marginBottom: 28 }}>
          <div style={{ display: "inline-block", background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff6060", fontSize: 10, letterSpacing: "0.12em", padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", marginBottom: 12 }}>
            ⚡ Admin Only — Do Not Share
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#c8a060", marginBottom: 4 }}>ESL Jobs Daily</div>
          <div style={{ color: "#3a3020", fontSize: 12 }}>Test panel · esl-jobs-board.vercel.app</div>
        </div>

        {/* ACCESS STATUS */}
        <Section title="Access Status">
          <Box>
            {access ? (
              <>
                <Row label="Status" val="✓ Unlocked" color="#4ade80" />
                <Row label="Days remaining" val={days} />
                <Row label="Code" val={access.code} />
                <Row label="Granted" val={new Date(access.granted).toLocaleString()} />
              </>
            ) : (
              <Row label="Status" val="🔒 Locked (no access)" color="#ff6060" />
            )}
          </Box>
        </Section>

        {/* SIMULATE */}
        <Section title="Simulate User Actions">
          <Btn color="green" onClick={simulateUnlock}>✓ Simulate Paid User (Unlock Access)</Btn>
          <Btn color="red" onClick={clearAccess}>✕ Clear Access (Back to Locked State)</Btn>
          <a href="/" target="_blank">
            <Btn color="dark">↗ Open Live Site</Btn>
          </a>
        </Section>

        {/* PAYMENT LINKS */}
        <Section title="Test Payment Links">
          <a href={GUMROAD_ACCESS} target="_blank"><Btn color="dark">☕ Test $5 Access Pass → Gumroad</Btn></a>
          <a href={GUMROAD_CV} target="_blank"><Btn color="dark">📄 Test $19 CV Audit → Gumroad</Btn></a>
          <a href={`mailto:${CV_EMAIL}?subject=CV Audit Test&body=This is a test submission.`}>
            <Btn color="dark">✉ Test CV Email → {CV_EMAIL}</Btn>
          </a>
        </Section>

        {/* API TEST */}
        <Section title="Test API & Jobs">
          <Btn color="gold" onClick={fetchJobs} disabled={loading}>
            {loading ? "⟳ Fetching..." : "⟳ Fetch Jobs from API Now"}
          </Btn>

          {/* LOG */}
          <div style={{ background: "#060402", border: "1px solid #1a1008", borderRadius: 8, padding: 12, minHeight: 60, maxHeight: 200, overflowY: "auto", fontSize: 11, lineHeight: 1.9 }}>
            {logs.length === 0
              ? <span style={{ color: "#2a2010" }}>API log will appear here...</span>
              : logs.map((l, i) => (
                <div key={i} style={{ color: logColors[l.type] || "#c8bfb0" }}>
                  [{l.time}] {l.msg}
                </div>
              ))
            }
          </div>

          {/* CACHE STATUS */}
          {cacheStatus && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: cacheStatus === "hit" ? "rgba(74,222,128,0.07)" : "rgba(251,191,36,0.07)", border: `1px solid ${cacheStatus === "hit" ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`, fontSize: 12, color: cacheStatus === "hit" ? "#4ade80" : "#fbbf24" }}>
              {cacheStatus === "hit"
                ? "✓ Redis cache working — zero cost for this call"
                : "⚡ Fresh Gemini call made — results now cached 20hrs"}
            </div>
          )}
        </Section>

        {/* APPLY LINKS */}
        <Section title="Job Apply Links">
          {jobs.length === 0 ? (
            <div style={{ color: "#3a3020", fontSize: 12, padding: "10px 0" }}>
              Run "Fetch Jobs" first to load links
            </div>
          ) : (
            <>
              <div style={{ color: "#3a3020", fontSize: 11, marginBottom: 12 }}>
                Tap "Test →" to verify each link opens correctly
              </div>
              {jobs.map((job, i) => {
                const isReal = job.link && job.link.startsWith("http") && job.link !== "#";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #1a1008" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#c8bfb0", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</div>
                      <div style={{ color: "#3a3020", fontSize: 11 }}>{job.company}</div>
                    </div>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{isReal ? "✅" : "❌"}</span>
                    {isReal ? (
                      <a href={job.link} target="_blank" style={{ color: "#c8a060", fontSize: 11, flexShrink: 0 }}>Test →</a>
                    ) : (
                      <span style={{ color: "#ff6060", fontSize: 11 }}>No link</span>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </Section>

      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#3a3020", textTransform: "uppercase", marginBottom: 14, paddingBottom: 6, borderBottom: "1px solid #1a1008" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Box({ children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.8 }}>
      {children}
    </div>
  );
}

function Row({ label, val, color }) {
  return (
    <div>
      <span style={{ color: "#3a3020" }}>{label}: </span>
      <span style={{ color: color || "#c8bfb0" }}>{val}</span>
    </div>
  );
}

function Btn({ color, onClick, children, disabled }) {
  const colors = {
    gold: { bg: "linear-gradient(135deg,#c8a060,#9a7040)", text: "#0a0805" },
    green: { bg: "rgba(74,222,128,0.12)", text: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" },
    red: { bg: "rgba(255,80,80,0.1)", text: "#ff6060", border: "1px solid rgba(255,80,80,0.25)" },
    dark: { bg: "rgba(255,255,255,0.04)", text: "#c8bfb0", border: "1px solid rgba(255,255,255,0.08)" },
  };
  const s = colors[color] || colors.dark;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "block", width: "100%", padding: "13px 18px",
        background: s.bg, border: s.border || "none",
        borderRadius: 10, color: s.text,
        fontFamily: "'Courier New', monospace", fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        marginBottom: 10, textAlign: "left",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
