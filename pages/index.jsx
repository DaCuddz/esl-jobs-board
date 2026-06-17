import { useState, useEffect, useCallback } from "react";

const GUMROAD_ACCESS_URL = "https://esljd.gumroad.com/l/thakqu";
const GUMROAD_CV_URL = "https://esljd.gumroad.com/l/lnrji";
const CV_EMAIL = "TeacherEvonia@gmail.com";
const ACCESS_DURATION_DAYS = 30;

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "zh", label: "Mandarin", flag: "🇨🇳" },
  { code: "ar", label: "Arabic", flag: "🇦🇪" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "nl", label: "Dutch", flag: "🇳🇱" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
  { code: "sw", label: "Swahili", flag: "🇰🇪" },
  { code: "af", label: "Afrikaans", flag: "🇿🇦" },
  { code: "zu", label: "Zulu", flag: "🇿🇦" },
  { code: "xh", label: "Xhosa", flag: "🇿🇦" },
];

const SAMPLE_JOBS = [
  { id:1, title:"Senior Online ESL Instructor", companyBlurred:"Global Ed████ Platform", company:"VIPKid", location:"Remote (Worldwide)", salary:"$22–$26/hr", type:"Full-time", tag:"Editor's Choice", description:"Teach North American curriculum to K-12 students across Asia. Flexible hours, consistent student base, and performance bonuses await.", requirements:["TEFL/TESOL or BA in Education","2+ yrs ESL experience","Native English speaker"], link:"https://www.vipkid.com/teach", featured:true, hiddenGem:false },
  { id:2, title:"Business English Coach", companyBlurred:"Pre███ Business", company:"Preply Business", location:"Remote", salary:"$30–$50/hr", type:"Contract", tag:"Premium Pick", description:"Work with corporate clients on professional communication and negotiations. High-value students, high-value pay.", requirements:["Business background preferred","CELTA or equivalent","Strong communication skills"], link:"https://preply.com/en/teach", featured:true, hiddenGem:false },
  { id:3, title:"ESL Lead Teacher", companyBlurred:"Int'l School, ████████", company:"International School of Bangkok", location:"Bangkok, Thailand", salary:"$2,800–$3,400/mo + Housing", type:"Full-time", tag:"Rare Find", description:"Join a prestigious international school with housing allowance, flights, and 45 days annual leave included in your package.", requirements:["State teaching license","3+ yrs classroom experience","IB curriculum knowledge"], link:"https://www.teachaway.com/teaching-jobs/thailand", featured:false, hiddenGem:false },
  { id:4, title:"English Language Program Coordinator", companyBlurred:"Kap███ International", company:"Kaplan International", location:"New York, USA", salary:"$55,000–$68,000/yr", type:"Full-time", tag:"Featured", description:"Lead a team of instructors, manage curriculum, and oversee corporate language contracts at a globally recognised institution.", requirements:["MA in TESOL/Applied Linguistics","5+ yrs experience","Management background"], link:"https://www.kaplaninternational.com/jobs", featured:false, hiddenGem:false },
  { id:5, title:"Online English Tutor — Adult Learners", companyBlurred:"iTa███", company:"iTalki", location:"Remote", salary:"$18–$40/hr", type:"Freelance", tag:"Recommended", description:"Set your own rates and schedule. Build a loyal student base while the platform handles payments, scheduling, and discovery.", requirements:["Any TEFL certification","Reliable internet","Patience & adaptability"], link:"https://www.italki.com/en/teach", featured:false, hiddenGem:true },
  { id:6, title:"ESL Teacher — Elementary School", companyBlurred:"Gov. Program, ████ Korea", company:"EPIK South Korea", location:"South Korea", salary:"$1,800–$2,650/mo + Pension", type:"Full-time", tag:"Rare Find", description:"Government-funded placement with free furnished housing, severance pay, and return flights. Life-changing cultural experience included.", requirements:["BA in any field","TEFL certificate","Clean background check"], link:"https://www.epik.go.kr", featured:true, hiddenGem:false },
  { id:7, title:"Academic English Writing Instructor", companyBlurred:"████ State University", company:"Arizona State University Online", location:"Remote (US-based)", salary:"$62,000–$75,000/yr", type:"Full-time", tag:"Premium Pick", description:"Teach academic writing to international graduate students at one of the most innovative universities in the world.", requirements:["MA in TESOL or English","University teaching experience","Curriculum design skills"], link:"https://hr.asu.edu/careers", featured:false, hiddenGem:false },
  { id:8, title:"ESL Content Creator & Teacher", companyBlurred:"Cam███", company:"Cambly", location:"Remote", salary:"$12–$17.50/hr", type:"Part-time", tag:"Recommended", description:"Teach conversational English while contributing lesson content to a growing platform used by millions of learners worldwide.", requirements:["Native English speaker","Content creation a plus","Energetic on camera"], link:"https://www.cambly.com/en/tutor", featured:false, hiddenGem:false },
  { id:9, title:"English Teacher — High School", companyBlurred:"Int'l School, ███ Dhabi", company:"Teach Away UAE", location:"Abu Dhabi, UAE", salary:"$3,500–$5,500/mo tax-free", type:"Full-time", tag:"Editor's Choice", description:"Tax-free salary in one of the world's highest-paying ESL markets. Full medical, annual flights home, and end-of-service gratuity.", requirements:["Teaching license","2+ yrs secondary experience","IELTS/TOEFL familiarity"], link:"https://www.teachaway.com/teaching-jobs/united-arab-emirates", featured:true, hiddenGem:false },
  { id:10, title:"IELTS Exam Prep Instructor", companyBlurred:"Brit███ Council", company:"British Council", location:"Various / Remote", salary:"$28–$45/hr", type:"Contract", tag:"Featured", description:"Specialise in high-stakes exam preparation with above-market rates. Consistent demand year-round from serious learners.", requirements:["Cambridge CELTA/DELTA","IELTS examiner experience preferred","Strong analytical skills"], link:"https://www.britishcouncil.org/organisation/careers", featured:false, hiddenGem:false },
  { id:11, title:"Online ESL Teacher — Spanish Speakers", companyBlurred:"Ber████", company:"Berlitz", location:"Remote", salary:"$20–$28/hr", type:"Part-time", tag:"Recommended", description:"Teach immersive, structured lessons to Spanish-speaking adult professionals looking to advance their careers globally.", requirements:["TEFL certificate","Spanish comprehension a plus","Professional demeanor"], link:"https://www.berlitz.com/careers/teach-with-berlitz", featured:false, hiddenGem:false },
  { id:12, title:"Head of EFL Department", companyBlurred:"Int'l Community School, ██████", company:"International Community School Amman", location:"Amman, Jordan", salary:"$4,200–$5,100/mo + Benefits", type:"Full-time", tag:"Rare Find", description:"Lead the EFL department for a 600-student international school with housing, dependent schooling, and a professional development budget.", requirements:["MA in Education/TESOL","5+ yrs leadership","IB or AP experience"], link:"https://www.icsj.edu.jo/careers", featured:true, hiddenGem:false },
];

const TAG_STYLES = {
  "Editor's Choice": { bg:"rgba(200,160,96,0.12)", border:"rgba(200,160,96,0.35)", color:"#c8a060" },
  "Premium Pick":    { bg:"rgba(167,139,250,0.12)", border:"rgba(167,139,250,0.35)", color:"#a78bfa" },
  "Rare Find":       { bg:"rgba(52,211,153,0.12)", border:"rgba(52,211,153,0.35)", color:"#34d399" },
  "Featured":        { bg:"rgba(96,165,250,0.12)", border:"rgba(96,165,250,0.35)", color:"#60a5fa" },
  "Recommended":     { bg:"rgba(251,146,60,0.12)", border:"rgba(251,146,60,0.35)", color:"#fb923c" },
  "Fast Filling":    { bg:"rgba(244,114,182,0.12)", border:"rgba(244,114,182,0.35)", color:"#f472b6" },
};

function getAccess() {
  try {
    const raw = localStorage.getItem("esljd_access");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.expiry) { localStorage.removeItem("esljd_access"); return null; }
    return parsed;
  } catch { return null; }
}

function grantAccess(code) {
  const expiry = Date.now() + ACCESS_DURATION_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem("esljd_access", JSON.stringify({ code, expiry, granted: Date.now() }));
}

function daysRemaining() {
  const a = getAccess();
  if (!a) return 0;
  return Math.ceil((a.expiry - Date.now()) / (1000 * 60 * 60 * 24));
}

function useSeekerCount() {
  const [count, setCount] = useState(89);
  useEffect(() => {
    const tick = () => setCount(prev => {
      const delta = Math.floor(Math.random() * 7) - 3;
      return Math.min(Math.max(prev + delta, 72), 141);
    });
    const id = setInterval(tick, 3800 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);
  return count;
}

function UnlockModal({ onClose, onUnlocked }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    const trimmed = code.trim();
    if (trimmed.length < 8) { setError("That doesn't look right. Check your Gumroad email."); return; }
    setLoading(true);
    setTimeout(() => { grantAccess(trimmed); setLoading(false); onUnlocked(); }, 900);
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.modalClose} onClick={onClose}>✕</button>
        <div style={{ fontSize:32, marginBottom:12 }}>☕</div>
        <h2 style={S.modalTitle}>Support the Curation</h2>
        <p style={S.modalBody}>Every morning, we search the internet so you don't have to. If that's worth a coffee, you'll unlock 30 days of full access — company names, direct apply links, and everything we found.</p>
        <a href={GUMROAD_ACCESS_URL} target="_blank" rel="noopener noreferrer" style={{ ...S.primaryBtn, display:"block", textAlign:"center", textDecoration:"none", marginBottom:20 }}>
          Buy Us a Coffee — $5
        </a>
        <div style={{ color:"#6a5a40", fontSize:13, marginBottom:8, fontFamily:"monospace" }}>Already supported us? Enter your Gumroad code:</div>
        <input value={code} onChange={e => { setCode(e.target.value); setError(""); }} placeholder="Paste your access code here..." style={S.input} />
        {error && <div style={{ color:"#f87171", fontSize:12, marginTop:6 }}>{error}</div>}
        <button onClick={handleVerify} disabled={loading} style={{ ...S.secondaryBtn, marginTop:10, cursor:"pointer" }}>
          {loading ? "Verifying..." : "Unlock Access →"}
        </button>
        <p style={{ color:"#3a3020", fontSize:11, marginTop:14, lineHeight:1.7 }}>Your code arrives by email from Gumroad right after purchase. Check spam if it's hiding.</p>
      </div>
    </div>
  );
}

function CVModal({ onClose }) {
  const [step, setStep] = useState("offer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderRef, setOrderRef] = useState("");

  if (step === "sent") return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, textAlign:"center" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:40, marginBottom:12 }}>✦</div>
        <h2 style={S.modalTitle}>You're in the queue.</h2>
        <p style={S.modalBody}>We have your details. Expect a thorough CV audit in your inbox within 24 hours. Go rest — you've done the hard part.</p>
        <button onClick={onClose} style={{ ...S.primaryBtn, border:"none", cursor:"pointer" }}>Back to Jobs</button>
      </div>
    </div>
  );

  if (step === "upload") return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.modalClose} onClick={onClose}>✕</button>
        <h2 style={S.modalTitle}>Upload Your CV</h2>
        <p style={S.modalBody}>Fill in your details below. We'll open your email app with everything pre-filled — just attach your CV and send.</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={S.input} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" style={{ ...S.input, marginTop:10 }} />
        <input value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder="Gumroad order reference" style={{ ...S.input, marginTop:10 }} />
        <a
          href={`mailto:${CV_EMAIL}?subject=CV Audit Request — ${encodeURIComponent(name)}&body=Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0AOrder Ref: ${encodeURIComponent(orderRef)}%0A%0APlease attach your CV to this email before sending.`}
          style={{ ...S.primaryBtn, display:"block", textAlign:"center", textDecoration:"none", marginTop:14 }}
          onClick={() => setTimeout(() => setStep("sent"), 500)}
        >
          Send for Audit →
        </a>
        <p style={{ color:"#3a3020", fontSize:11, marginTop:12, lineHeight:1.7 }}>This opens your email app. Attach your CV (PDF or Word) and hit send. We do the rest.</p>
      </div>
    </div>
  );

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.modalClose} onClick={onClose}>✕</button>
        <div style={{ fontSize:32, marginBottom:12 }}>📄</div>
        <h2 style={S.modalTitle}>Boost Your Application</h2>
        <p style={S.modalBody}>A strong CV is the difference between shortlisted and ignored. Our professional audit gives you specific, actionable feedback tailored to language career roles.</p>
        <div style={{ background:"rgba(200,160,96,0.07)", border:"1px solid rgba(200,160,96,0.18)", borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
          {["Full CV structure review","Language & tone feedback","ATS optimisation tips","Role alignment advice","Delivered within 24 hours"].map((item,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
              <span style={{ color:"#c8a060", fontSize:10 }}>✦</span>
              <span style={{ color:"#8a7a60", fontSize:13 }}>{item}</span>
            </div>
          ))}
        </div>
        <a href={GUMROAD_CV_URL} target="_blank" rel="noopener noreferrer"
          style={{ ...S.primaryBtn, display:"block", textAlign:"center", textDecoration:"none", marginBottom:10 }}
          onClick={() => setTimeout(() => setStep("upload"), 1200)}>
          Get CV Audit — $19
        </a>
        <button onClick={() => setStep("upload")} style={{ ...S.secondaryBtn, cursor:"pointer", background:"transparent", border:"none", color:"#4a4030" }}>
          Already paid? Upload now →
        </button>
      </div>
    </div>
  );
}

function ReportModal({ job, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth:380 }} onClick={e => e.stopPropagation()}>
        <button style={S.modalClose} onClick={onClose}>✕</button>
        <h2 style={{ ...S.modalTitle, fontSize:20 }}>Report a Link Issue</h2>
        <p style={S.modalBody}>Found a broken link for <strong style={{ color:"#c8a060" }}>{job.title}</strong>? We'll fix it before tomorrow's refresh.</p>
        <a
          href={`mailto:${CV_EMAIL}?subject=Broken Link — ${encodeURIComponent(job.title)}&body=Job: ${encodeURIComponent(job.title)}%0ALink: ${encodeURIComponent(job.link)}%0A%0APlease describe the issue:`}
          style={{ ...S.primaryBtn, display:"block", textAlign:"center", textDecoration:"none" }}
          onClick={onClose}
        >
          Report This Link
        </a>
      </div>
    </div>
  );
}

function JobCard({ job, isUnlocked, onApplyClick, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const tagStyle = TAG_STYLES[job.tag] || TAG_STYLES["Featured"];

  return (
    <>
      {showReport && <ReportModal job={job} onClose={() => setShowReport(false)} />}
      <div
        style={{ background:"rgba(255,255,255,0.03)", border: job.hiddenGem ? "1px solid rgba(200,160,96,0.3)" : "1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, cursor:"pointer", transition:"all 0.22s ease", position:"relative", animationName:"fadeUp", animationDuration:"0.5s", animationTimingFunction:"ease", animationFillMode:"both", animationDelay:`${index * 0.055}s` }}
        onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.055)"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
        onClick={() => setExpanded(!expanded)}
      >
        {job.hiddenGem && (
          <div style={{ position:"absolute", top:-1, left:24, background:"linear-gradient(90deg,#c8a060,#9a7040)", color:"#0a0805", fontSize:10, fontWeight:700, letterSpacing:"0.1em", padding:"3px 12px", borderRadius:"0 0 8px 8px", textTransform:"uppercase", fontFamily:"monospace" }}>
            Today's Hidden Gem
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, marginTop: job.hiddenGem ? 14 : 0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:700, color:"#f0ece4", lineHeight:1.3, marginBottom:4 }}>{job.title}</div>
            <div style={{ fontSize:13, color:"#4a4030", fontFamily:"monospace", letterSpacing:"0.03em" }}>
              {isUnlocked ? job.company : job.companyBlurred}
            </div>
          </div>
          <span style={{ background:tagStyle.bg, border:`1px solid ${tagStyle.border}`, color:tagStyle.color, fontSize:10, padding:"3px 10px", borderRadius:20, fontFamily:"monospace", whiteSpace:"nowrap", marginLeft:12, letterSpacing:"0.04em" }}>
            {job.tag}
          </span>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
          {[job.location, job.type, job.salary].map((item,i) => (
            <span key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"4px 10px", fontSize:12, color:"#c8bfb0", fontFamily:"monospace" }}>{item}</span>
          ))}
        </div>

        <p style={{ color:"#7a6a50", fontSize:13.5, lineHeight:1.75, margin:0 }}>{job.description}</p>

        {expanded && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ color:"#5a5040", fontSize:11, fontFamily:"monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Requirements</div>
            {job.requirements.map((r,i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:6 }}>
                <span style={{ color:"#c8a060", fontSize:10, marginTop:3, flexShrink:0 }}>✦</span>
                <span style={{ color:"#7a6a50", fontSize:13 }}>{r}</span>
              </div>
            ))}
            <div style={{ marginTop:16, display:"flex", gap:10, flexWrap:"wrap" }}>
              {isUnlocked ? (
                <>
                  <a href={job.link} target="_blank" rel="noopener noreferrer"
                    style={{ ...S.primaryBtn, fontSize:13, padding:"10px 20px", textDecoration:"none", display:"inline-block", width:"auto" }}
                    onClick={e => e.stopPropagation()}>
                    Apply Now →
                  </a>
                  <button onClick={e => { e.stopPropagation(); setShowReport(true); }}
                    style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"10px 14px", color:"#3a3020", fontSize:12, cursor:"pointer", fontFamily:"monospace" }}>
                    Report link
                  </button>
                </>
              ) : (
                <button onClick={e => { e.stopPropagation(); onApplyClick(); }}
                  style={{ ...S.primaryBtn, fontSize:13, padding:"10px 20px", border:"none", cursor:"pointer", width:"auto" }}>
                  Unlock to Apply →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTime, setSearchTime] = useState(null);
  const [language, setLanguage] = useState(() => { try { return localStorage.getItem("esljd_lang") || "en"; } catch { return "en"; } });
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const seekers = useSeekerCount();
  const langLabel = LANGUAGES.find(l => l.code === language)?.label || "English";

  useEffect(() => { setIsUnlocked(!!getAccess()); }, []);
  useEffect(() => { try { localStorage.setItem("esljd_lang", language); } catch {} }, [language]);

  const fetchJobs = useCallback(async (lang) => {
    setLoading(true);
    setJobs([]);
    setStatusMsg("Bribing the internet for better jobs...");
    const langObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
    const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
    try {
      const res = await fetch("/api/jobs", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ language: langObj.label, langCode: lang, today }) });
      const data = await res.json();
      if (data.debug) console.warn("API debug:", data.debug);
      if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        setSearchTime(new Date());
        setStatusMsg("");
      } else if (lang !== "en") {
        setJobs([]);
        setStatusMsg("nothing_found");
      } else {
        setJobs([]);
        setStatusMsg("api_error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setJobs([]);
      setStatusMsg(lang === "en" ? "api_error" : "nothing_found");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchJobs(language); }, [language, fetchJobs]);

  const filters = ["All","Remote","Abroad","Freelance","Full-time","Contract"];
  const filteredJobs = jobs.filter(job => {
    const mf = filter === "All" || (filter === "Remote" && job.location?.toLowerCase().includes("remote")) || (filter === "Abroad" && ["Thailand","Korea","UAE","Jordan","Japan","Saudi"].some(c => job.location?.includes(c))) || (filter === "Freelance" && job.type?.toLowerCase().includes("freelance")) || (filter === "Full-time" && job.type?.toLowerCase().includes("full")) || (filter === "Contract" && job.type?.toLowerCase().includes("contract"));
    const q = search.toLowerCase();
    const ms = !q || [job.title, job.location, job.salary, job.description].join(" ").toLowerCase().includes(q);
    return mf && ms;
  });

  const handleUnlocked = () => { setIsUnlocked(true); setShowUnlock(false); setTimeout(() => setShowCV(true), 700); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=Lora:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:#0a0805;color:#f0ece4;font-family:'Lora',serif;-webkit-font-smoothing:antialiased;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.25;}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0a0805;}
        ::-webkit-scrollbar-thumb{background:#2a2010;border-radius:4px;}
        input::placeholder{color:#3a3020;}
        input:focus{outline:none;}
      `}</style>

      {showUnlock && <UnlockModal onClose={() => setShowUnlock(false)} onUnlocked={handleUnlocked} />}
      {showCV && <CVModal onClose={() => setShowCV(false)} />}

      <div style={{ minHeight:"100vh", background:"#0a0805" }}>
        <div style={{ position:"fixed", top:"-10%", left:"15%", width:700, height:700, background:"radial-gradient(circle,rgba(180,130,60,0.055) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />
        <div style={{ position:"fixed", bottom:"5%", right:"5%", width:400, height:400, background:"radial-gradient(circle,rgba(100,80,160,0.04) 0%,transparent 65%)", pointerEvents:"none", zIndex:0 }} />

        <div style={{ position:"relative", zIndex:1, maxWidth:1100, margin:"0 auto", padding:"0 20px 80px" }}>

          {/* HEADER */}
          <header style={{ paddingTop:52, paddingBottom:44, textAlign:"center", animation:"fadeUp 0.7s ease both" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:28 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 8px rgba(74,222,128,0.6)", animation:"pulse 2.2s ease infinite" }} />
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#5a5040", letterSpacing:"0.05em" }}>
                <span style={{ color:"#c8bfb0", fontWeight:500 }}>{seekers}</span> Seekers online right now
              </span>
            </div>

            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(200,160,96,0.07)", border:"1px solid rgba(200,160,96,0.18)", borderRadius:30, padding:"5px 16px", fontSize:11, fontFamily:"'DM Mono',monospace", letterSpacing:"0.12em", color:"#c8a060", textTransform:"uppercase", marginBottom:22 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#c8a060", display:"inline-block", animation:"blink 2s ease infinite" }} />
              Daily Curated · Updated Every Morning
            </div>

            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(38px,7vw,78px)", fontWeight:900, lineHeight:1.02, letterSpacing:"-0.02em", marginBottom:18 }}>
              ESL Jobs Daily
              <br />
              <em style={{ color:"#c8a060", fontStyle:"italic" }}>Worth Moving For</em>
            </h1>

            <p style={{ color:"#6a5a40", fontSize:16, maxWidth:500, margin:"0 auto 10px", lineHeight:1.8 }}>
              We wake up early so you don't have to. Every morning, we search for language career opportunities worth your time — teaching, translation, localization, corporate, and beyond.
            </p>

            <p style={{ color:"#3a3020", fontSize:12, fontFamily:"'DM Mono',monospace", marginBottom:32, letterSpacing:"0.04em" }}>
              {searchTime ? `Last searched ${searchTime.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} · Tomorrow's search runs at 6 AM` : "Searching now..."}
            </p>

            {isUnlocked ? (
              <div style={{ display:"inline-flex", alignItems:"center", gap:12, background:"rgba(74,222,128,0.07)", border:"1px solid rgba(74,222,128,0.18)", borderRadius:30, padding:"10px 22px", marginBottom:16 }}>
                <span style={{ color:"#4ade80", fontSize:13 }}>✓</span>
                <span style={{ color:"#4ade80", fontSize:13, fontFamily:"'DM Mono',monospace" }}>Full access · {daysRemaining()} days remaining</span>
                <button onClick={() => setShowCV(true)} style={{ background:"rgba(200,160,96,0.12)", border:"1px solid rgba(200,160,96,0.25)", borderRadius:20, padding:"4px 14px", color:"#c8a060", fontSize:11, cursor:"pointer", fontFamily:"'DM Mono',monospace" }}>
                  CV Audit →
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowUnlock(true)} style={{ ...S.primaryBtn, fontSize:14, padding:"14px 30px", border:"none", cursor:"pointer", width:"auto", marginBottom:10 }}>
                  ☕ Unlock Full Access — $5
                </button>
                <div style={{ color:"#3a3020", fontSize:12, fontFamily:"'DM Mono',monospace" }}>30 days · company names · direct apply links · no fluff</div>
              </>
            )}
          </header>

          {/* LANGUAGE SELECTOR */}
          <div style={{ marginBottom:28, animation:"fadeUp 0.6s 0.1s ease both" }}>
            <div style={{ color:"#3a3020", fontSize:11, fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>Select Language</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); setFilter("All"); setSearch(""); }}
                  style={{ background: language===lang.code ? "rgba(200,160,96,0.15)" : "rgba(255,255,255,0.025)", border:`1px solid ${language===lang.code ? "rgba(200,160,96,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius:10, padding:"8px 14px", color: language===lang.code ? "#c8a060" : "#5a5040", fontSize:13, cursor:"pointer", fontFamily:"'DM Mono',monospace", transition:"all 0.18s", display:"flex", alignItems:"center", gap:6 }}>
                  <span>{lang.flag}</span><span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH + FILTER */}
          <div style={{ display:"flex", gap:12, marginBottom:22, flexWrap:"wrap", animation:"fadeUp 0.6s 0.15s ease both" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search salaries, countries, remote roles..."
              style={{ flex:1, minWidth:220, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"12px 18px", color:"#f0ece4", fontSize:14, fontFamily:"'DM Mono',monospace" }} />
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f ? "rgba(200,160,96,0.12)" : "rgba(255,255,255,0.025)", border:`1px solid ${filter===f ? "rgba(200,160,96,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius:10, padding:"10px 16px", color: filter===f ? "#c8a060" : "#4a4030", fontSize:12, cursor:"pointer", fontFamily:"'DM Mono',monospace", transition:"all 0.18s" }}>{f}</button>
              ))}
            </div>
          </div>

          {/* STATS BAR */}
          {!loading && jobs.length > 0 && (
            <div style={{ display:"flex", gap:28, marginBottom:24, padding:"14px 20px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12, flexWrap:"wrap", animation:"fadeUp 0.6s 0.2s ease both" }}>
              {[
                { v:jobs.length, l:"found this morning" },
                { v:jobs.filter(j=>j.location?.toLowerCase().includes("remote")).length, l:"remote roles" },
                { v:0, l:"duplicates removed" },
                { v:jobs.filter(j=>["Thailand","Korea","UAE","Jordan","Japan","Saudi"].some(c=>j.location?.includes(c))).length, l:"international" },
              ].map(s => (
                <div key={s.l} style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"#c8a060" }}>{s.v}</span>
                  <span style={{ color:"#2a2010", fontSize:11, fontFamily:"'DM Mono',monospace" }}>{s.l}</span>
                </div>
              ))}
            </div>
          )}

          {/* JOBS GRID */}
          {loading ? (
            <div style={{ textAlign:"center", padding:"80px 0" }}>
              <div style={{ fontSize:34, animation:"pulse 1.5s ease infinite", marginBottom:16, color:"#3a3020" }}>◈</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:"#4a4030", letterSpacing:"0.06em" }}>Bribing the internet for better jobs...</div>
            </div>
          ) : statusMsg === "nothing_found" ? (
            <div style={{ textAlign:"center", padding:"80px 0" }}>
              <div style={{ fontSize:28, color:"#2a2010", marginBottom:14 }}>◇</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:"#4a4030", marginBottom:8 }}>Nothing today for {langLabel}.</div>
              <div style={{ color:"#2a2010", fontSize:13, fontFamily:"'DM Mono',monospace", lineHeight:1.8 }}>We checked twice. Tomorrow's search runs at 6 AM — you're not forgotten.</div>
              <button onClick={() => setLanguage("en")} style={{ ...S.secondaryBtn, display:"inline-block", marginTop:22, width:"auto", padding:"12px 24px", cursor:"pointer" }}>Browse English opportunities →</button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#2a2010", fontFamily:"'DM Mono',monospace", fontSize:13 }}>Nothing matched yet. Tomorrow's refresh may.</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
              {filteredJobs.map((job,i) => <JobCard key={job.id||i} job={job} isUnlocked={isUnlocked} onApplyClick={() => setShowUnlock(true)} index={i} />)}
            </div>
          )}

          {/* SHARE STRIP */}
          {!loading && jobs.length > 0 && (
            <div style={{ marginTop:44, padding:"26px 28px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:"#a09080", marginBottom:4 }}>Know someone grinding in the wrong job?</div>
                <div style={{ color:"#3a3020", fontSize:12, fontFamily:"'DM Mono',monospace" }}>Send them here. It costs nothing and might change everything.</div>
              </div>
              <button onClick={() => { if (navigator.share) { navigator.share({ title:"ESL Jobs Daily", text:"Real language career opportunities, curated every morning.", url:window.location.href }); } else { navigator.clipboard?.writeText(window.location.href); } }}
                style={{ background:"rgba(200,160,96,0.08)", border:"1px solid rgba(200,160,96,0.2)", borderRadius:12, padding:"12px 20px", color:"#c8a060", fontSize:13, cursor:"pointer", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>
                Share today's board →
              </button>
            </div>
          )}

          {/* FOOTER */}
          <footer style={{ marginTop:60, paddingTop:28, borderTop:"1px solid rgba(255,255,255,0.04)", textAlign:"center" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#c8a060", marginBottom:12 }}>ESL Jobs Daily</div>
            <p style={{ color:"#2a2010", fontSize:12, fontFamily:"'DM Mono',monospace", lineHeight:2, maxWidth:480, margin:"0 auto 14px" }}>
              Seekers using this board have relocated to Seoul, Dubai, Barcelona, Bangkok, Tokyo, and online.<br />
              Trusted daily by language professionals who refused to settle.
            </p>
            <div style={{ color:"#1a1008", fontSize:11, fontFamily:"'DM Mono',monospace" }}>
              © ESL Jobs Daily · A small team checking job boards so you don't have to
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}

const S = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(6px)" },
  modal: { background:"#110e08", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:32, maxWidth:440, width:"100%", position:"relative", boxShadow:"0 32px 80px rgba(0,0,0,0.65)" },
  modalClose: { position:"absolute", top:16, right:16, background:"transparent", border:"none", color:"#3a3020", fontSize:16, cursor:"pointer" },
  modalTitle: { fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:700, color:"#f0ece4", marginBottom:10 },
  modalBody: { color:"#6a5a40", fontSize:14, lineHeight:1.8, marginBottom:22 },
  primaryBtn: { background:"linear-gradient(135deg,#c8a060,#9a7040)", borderRadius:12, padding:"13px 22px", color:"#0a0805", fontWeight:700, fontSize:14, fontFamily:"'DM Mono',monospace", letterSpacing:"0.04em", display:"inline-block", transition:"opacity 0.2s", width:"100%", textAlign:"center" },
  secondaryBtn: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"11px 18px", color:"#6a5a40", fontSize:13, fontFamily:"'DM Mono',monospace", width:"100%", textAlign:"center", display:"block", marginTop:8 },
  input: { width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:10, padding:"12px 16px", color:"#f0ece4", fontSize:14, fontFamily:"'DM Mono',monospace" },
};

