import { useState, useEffect, useRef } from "react";

// ── ADSENSE CONFIG ────────────────────────────────────────────────────────────
// When you get your AdSense account, replace YOUR_PUBLISHER_ID below.
// Set ADS_ENABLED to true to activate. That's all you need to change.
const ADS_ENABLED = true;
const ADSENSE_PUBLISHER_ID = "ca-pub-6542257341433326";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const GUMROAD_ACCESS_URL = "https://esljd.gumroad.com/l/thakqu";
const GUMROAD_CV_URL = "https://esljd.gumroad.com/l/lnrji";
const CV_EMAIL = "TeacherEvonia@gmail.com";
const ACCESS_DAYS = 30;

const LANGUAGES = [
  { code:"en", label:"English", flag:"🇬🇧" },{ code:"es", label:"Spanish", flag:"🇪🇸" },
  { code:"fr", label:"French", flag:"🇫🇷" },{ code:"zh", label:"Mandarin", flag:"🇨🇳" },
  { code:"ar", label:"Arabic", flag:"🇦🇪" },{ code:"de", label:"German", flag:"🇩🇪" },
  { code:"ja", label:"Japanese", flag:"🇯🇵" },{ code:"pt", label:"Portuguese", flag:"🇧🇷" },
  { code:"it", label:"Italian", flag:"🇮🇹" },{ code:"ko", label:"Korean", flag:"🇰🇷" },
  { code:"nl", label:"Dutch", flag:"🇳🇱" },{ code:"ru", label:"Russian", flag:"🇷🇺" },
  { code:"hi", label:"Hindi", flag:"🇮🇳" },{ code:"tr", label:"Turkish", flag:"🇹🇷" },
  { code:"sw", label:"Swahili", flag:"🇰🇪" },{ code:"af", label:"Afrikaans", flag:"🇿🇦" },
  { code:"zu", label:"Zulu", flag:"🇿🇦" },{ code:"xh", label:"Xhosa", flag:"🇿🇦" },
];

const JOBS = [
  { id:1, title:"Senior Business English Coach", companyBlurred:"Pre███ Business", company:"Preply Business", location:"Remote", salary:"$40–$60/hr", type:"Contract", tag:"Editor's Choice", description:"Coach senior executives at Fortune 500 companies on professional communication and international negotiations. Premium clientele, premium rates.", requirements:["CELTA or equivalent","Corporate training background","C2 English fluency"], link:"https://preply.com/en/teach", featured:true, hiddenGem:false },
  { id:2, title:"ESL Lead Teacher", companyBlurred:"Int'l School ████████", company:"ISB Bangkok", location:"Bangkok, Thailand", salary:"$3,200/mo + Housing", type:"Full-time", tag:"Rare Find", description:"Join a prestigious IB school with full relocation support, furnished housing and 45 days annual leave. Life begins here.", requirements:["State teaching license","3+ yrs IB experience","Multicultural mindset"], link:"https://www.teachaway.com/teaching-jobs/thailand", featured:false, hiddenGem:false },
  { id:3, title:"Online English Tutor", companyBlurred:"iTa███", company:"iTalki", location:"Remote (Worldwide)", salary:"$18–$45/hr", type:"Freelance", tag:"Recommended", description:"Set your own schedule and rates. Build a loyal global student base while the platform handles everything else.", requirements:["TEFL certification","Reliable internet","Patience & adaptability"], link:"https://www.italki.com/en/teach", featured:false, hiddenGem:true },
  { id:4, title:"Academic English Instructor", companyBlurred:"████ State University", company:"Arizona State University", location:"Remote (US)", salary:"$65,000–$78,000/yr", type:"Full-time", tag:"Premium Pick", description:"Teach academic writing and critical reading to international graduate students at one of the world's most innovative universities.", requirements:["MA in TESOL or English","University teaching experience","Curriculum design skills"], link:"https://hr.asu.edu/careers", featured:false, hiddenGem:false },
  { id:5, title:"IELTS Exam Prep Specialist", companyBlurred:"Brit███ Council", company:"British Council", location:"Various / Remote", salary:"$32–$48/hr", type:"Contract", tag:"Featured", description:"High-stakes exam preparation with above-market hourly rates and year-round demand from serious candidates globally.", requirements:["Cambridge CELTA/DELTA","IELTS examiner experience","Strong analytical mindset"], link:"https://www.britishcouncil.org/organisation/careers", featured:false, hiddenGem:false },
  { id:6, title:"English Teacher — High School", companyBlurred:"Int'l School ███ Dhabi", company:"ADEK UAE", location:"Abu Dhabi, UAE", salary:"$4,800/mo tax-free", type:"Full-time", tag:"Editor's Choice", description:"Tax-free salary in the highest-paying ESL market on earth. Full medical, annual flights home, and end-of-service gratuity await.", requirements:["Teaching license","2+ yrs secondary experience","UAE visa eligibility"], link:"https://www.teachaway.com/teaching-jobs/united-arab-emirates", featured:true, hiddenGem:false },
  { id:7, title:"Government ESL Teacher", companyBlurred:"EPIK ████ Korea", company:"EPIK South Korea", location:"South Korea", salary:"$2,200/mo + Pension", type:"Full-time", tag:"Rare Find", description:"Government-placed with free furnished housing, severance pay and return flights. The cultural experience of a lifetime comes standard.", requirements:["BA in any field","TEFL certificate","Clean background check"], link:"https://www.epik.go.kr", featured:true, hiddenGem:false },
  { id:8, title:"Corporate Language Trainer", companyBlurred:"Ber████", company:"Berlitz", location:"Remote", salary:"$28–$38/hr", type:"Part-time", tag:"Recommended", description:"Deliver immersive language training to global professionals at one of the world's most recognised language brands.", requirements:["TEFL certificate","Professional communication","Cultural sensitivity"], link:"https://www.berlitz.com/careers/teach-with-berlitz", featured:false, hiddenGem:false },
  { id:9, title:"ESL Content Creator & Instructor", companyBlurred:"Cam███", company:"Cambly", location:"Remote", salary:"$17.50/hr", type:"Part-time", tag:"Fast Filling", description:"Teach conversational English to adult learners worldwide while contributing original content to a platform of millions.", requirements:["Native English speaker","Creative content skills","Energetic on camera"], link:"https://www.cambly.com/en/tutor", featured:false, hiddenGem:false },
  { id:10, title:"Head of EFL Department", companyBlurred:"Int'l Community ██████", company:"ICS Amman", location:"Amman, Jordan", salary:"$5,100/mo + Benefits", type:"Full-time", tag:"Premium Pick", description:"Lead EFL for a 600-student international school. Housing, dependent schooling and a professional development budget included.", requirements:["MA in Education/TESOL","5+ yrs leadership","IB or AP experience"], link:"https://www.icsj.edu.jo/careers", featured:true, hiddenGem:false },
  { id:11, title:"English Program Coordinator", companyBlurred:"Kap███ International", company:"Kaplan International", location:"New York, USA", salary:"$62,000–$72,000/yr", type:"Full-time", tag:"Featured", description:"Lead a team of instructors across curriculum development, student admissions and corporate language partnerships.", requirements:["MA in TESOL","5+ yrs experience","Management background"], link:"https://www.kaplaninternational.com/jobs", featured:false, hiddenGem:false },
  { id:12, title:"JET Programme ALT", companyBlurred:"JET Pro██████", company:"JET Programme Japan", location:"Japan (Nationwide)", salary:"$2,600/mo + Housing", type:"Full-time", tag:"Rare Find", description:"Live and teach anywhere in Japan on the world's most celebrated cultural exchange programme. Applications open now.", requirements:["BA in any field","Native English speaker","Cultural curiosity"], link:"https://jetprogramme.org", featured:false, hiddenGem:false },
];

const TAG_CONFIG = {
  "Editor's Choice": { color:"#d4a84b", bg:"rgba(212,168,75,0.1)", border:"rgba(212,168,75,0.25)" },
  "Premium Pick":    { color:"#b8a0e8", bg:"rgba(184,160,232,0.1)", border:"rgba(184,160,232,0.25)" },
  "Rare Find":       { color:"#6fcf97", bg:"rgba(111,207,151,0.1)", border:"rgba(111,207,151,0.25)" },
  "Featured":        { color:"#7eb8f7", bg:"rgba(126,184,247,0.1)", border:"rgba(126,184,247,0.25)" },
  "Recommended":     { color:"#f0a070", bg:"rgba(240,160,112,0.1)", border:"rgba(240,160,112,0.25)" },
  "Fast Filling":    { color:"#f08080", bg:"rgba(240,128,128,0.1)", border:"rgba(240,128,128,0.25)" },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getAccess() {
  try {
    const r = localStorage.getItem("esljd_access");
    if (!r) return null;
    const p = JSON.parse(r);
    if (Date.now() > p.expiry) { localStorage.removeItem("esljd_access"); return null; }
    return p;
  } catch { return null; }
}
function grantAccess(code, days = ACCESS_DAYS, sponsor = false) {
  localStorage.setItem("esljd_access", JSON.stringify({ code, expiry: Date.now() + days * 86400000, granted: Date.now(), sponsor }));
}
function daysLeft() {
  const a = getAccess(); return a ? Math.ceil((a.expiry - Date.now()) / 86400000) : 0;
}
function getIdentity() {
  try {
    const stored = localStorage.getItem("esljd_identity");
    if (stored) return JSON.parse(stored);
    const num = Math.floor(1000 + Math.random() * 8999);
    const id = { user: `Seeker #${num}`, flag: "🌍", auto: true };
    localStorage.setItem("esljd_identity", JSON.stringify(id));
    return id;
  } catch { return { user: "Seeker", flag: "🌍", auto: true }; }
}
function saveIdentity(user, flag) {
  try { localStorage.setItem("esljd_identity", JSON.stringify({ user, flag, auto: false })); } catch {}
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
function useSeekers() {
  const [n, setN] = useState(94);
  useEffect(() => {
    const id = setInterval(() => setN(p => Math.min(Math.max(p + Math.floor(Math.random()*7)-3, 76), 147)), 4400);
    return () => clearInterval(id);
  }, []);
  return n;
}

// ── ADSENSE SLOT ──────────────────────────────────────────────────────────────
function AdSlot({ slot = "XXXXXXXXXX", format = "auto" }) {
  useEffect(() => {
    if (!ADS_ENABLED) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, []);
  if (!ADS_ENABLED) return null;
  return (
    <div style={{ margin:"24px 0", textAlign:"center", minHeight:90 }}>
      <ins className="adsbygoogle"
        style={{ display:"block" }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true" />
    </div>
  );
}

// ── MODALS ────────────────────────────────────────────────────────────────────
function UnlockModal({ onClose, onUnlocked, showSponsor }) {
  const [code, setCode] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const verify = () => {
    if (code.trim().length < 8) { setErr("Check your Gumroad email for the code."); return; }
    setLoading(true);
    setTimeout(() => { grantAccess(code.trim()); setLoading(false); onUnlocked(); }, 900);
  };
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.mClose} onClick={onClose}>✕</button>
        <div style={{ fontSize:34, marginBottom:14 }}>☕</div>
        <h2 style={S.mTitle}>Support the Curation</h2>
        <p style={S.mBody}>Every morning we search the world for opportunities worth your time. A coffee unlocks 30 days of full access — real company names, direct apply links, everything.</p>
        <a href={GUMROAD_ACCESS_URL} target="_blank" rel="noopener noreferrer" style={{ ...S.btnGold, display:"block", textAlign:"center", textDecoration:"none", marginBottom:10 }}>
          Unlock Access — $5
        </a>
        <button onClick={showSponsor} style={{ ...S.btnGhost, cursor:"pointer", marginBottom:20 }}>Watch a short ad instead →</button>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:16 }}>
          <div style={{ color:"#4a3a1a", fontSize:12, fontFamily:"monospace", marginBottom:8 }}>Already supported us?</div>
          <input value={code} onChange={e => { setCode(e.target.value); setErr(""); }} placeholder="Paste your Gumroad code..." style={S.input} />
          {err && <div style={{ color:"#f87171", fontSize:12, marginTop:6 }}>{err}</div>}
          <button onClick={verify} disabled={loading} style={{ ...S.btnGhost, marginTop:8, cursor:"pointer" }}>
            {loading ? "Verifying..." : "Unlock Access →"}
          </button>
        </div>
        <p style={{ color:"#2a1e10", fontSize:11, marginTop:14, lineHeight:1.7 }}>Code arrives by email from Gumroad. Check spam if it's shy.</p>
      </div>
    </div>
  );
}

function SponsorModal({ onClose, onUnlocked }) {
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!watching) return;
    const id = setInterval(() => setCountdown(p => { if (p <= 1) { clearInterval(id); setDone(true); return 0; } return p - 1; }), 1000);
    return () => clearInterval(id);
  }, [watching]);
  const claim = () => { grantAccess("SPONSOR-FREE", 1, true); onUnlocked(); };
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.mClose} onClick={onClose}>✕</button>
        {!watching ? (
          <>
            <div style={{ fontSize:32, marginBottom:14 }}>📺</div>
            <h2 style={S.mTitle}>Watch & Unlock</h2>
            <p style={S.mBody}>Watch a 15-second sponsor message to unlock <strong style={{ color:"#d4a84b" }}>today's featured opportunity</strong> for 24 hours. For full 30-day access, unlock for $5.</p>
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:20, textAlign:"center", marginBottom:20 }}>
              <div style={{ color:"#2a2010", fontSize:11, fontFamily:"monospace", marginBottom:6 }}>Today's sponsor</div>
              <div style={{ color:"#d4a84b", fontSize:16, fontFamily:"Georgia,serif" }}>Your Brand Here</div>
              <div style={{ color:"#4a3a1a", fontSize:12, marginTop:4 }}>Language learning tools for professionals</div>
            </div>
            <button onClick={() => setWatching(true)} style={{ ...S.btnGold, border:"none", cursor:"pointer", width:"100%", marginBottom:10 }}>Watch & Unlock →</button>
            <a href={GUMROAD_ACCESS_URL} target="_blank" rel="noopener noreferrer" style={{ display:"block", textAlign:"center", color:"#d4a84b", fontSize:12, fontFamily:"monospace", textDecoration:"none" }}>Or unlock 30 days — $5</a>
          </>
        ) : done ? (
          <>
            <div style={{ fontSize:44, textAlign:"center", marginBottom:16 }}>✦</div>
            <h2 style={{ ...S.mTitle, textAlign:"center" }}>Featured Unlocked</h2>
            <p style={{ ...S.mBody, textAlign:"center" }}>You have 24-hour access to today's featured opportunity. Upgrade anytime for full board access.</p>
            <button onClick={claim} style={{ ...S.btnGold, border:"none", cursor:"pointer", width:"100%", marginBottom:10 }}>View Featured Opportunity →</button>
            <a href={GUMROAD_ACCESS_URL} target="_blank" rel="noopener noreferrer" style={{ display:"block", textAlign:"center", color:"#d4a84b", fontSize:12, fontFamily:"monospace", textDecoration:"none" }}>Upgrade to full access — $5</a>
          </>
        ) : (
          <>
            <div style={{ background:"rgba(212,168,75,0.04)", border:"1px solid rgba(212,168,75,0.12)", borderRadius:12, padding:"32px 20px", textAlign:"center", marginBottom:16 }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:52, color:"#d4a84b", lineHeight:1 }}>{countdown}</div>
              <div style={{ color:"#4a3a1a", fontSize:11, fontFamily:"monospace", marginTop:6 }}>seconds remaining</div>
              <div style={{ marginTop:16, height:3, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,#c8903c,#d4a84b)", width:`${((15-countdown)/15)*100}%`, transition:"width 1s linear", borderRadius:3 }} />
              </div>
            </div>
            <div style={{ textAlign:"center", color:"#2a2010", fontSize:11, fontFamily:"monospace" }}>Sponsor message · 15 seconds</div>
          </>
        )}
      </div>
    </div>
  );
}

function CVModal({ onClose }) {
  const [step, setStep] = useState("offer");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [ref, setRef] = useState("");
  if (step === "done") return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, textAlign:"center" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:44, marginBottom:16 }}>✦</div>
        <h2 style={S.mTitle}>You're in the queue.</h2>
        <p style={S.mBody}>Expect a thorough audit within 24 hours. You've done the hard part.</p>
        <button onClick={onClose} style={{ ...S.btnGold, border:"none", cursor:"pointer", width:"100%" }}>Back to Opportunities</button>
      </div>
    </div>
  );
  if (step === "upload") return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.mClose} onClick={onClose}>✕</button>
        <h2 style={S.mTitle}>Send Your CV</h2>
        <p style={S.mBody}>Fill in your details — we'll open your email app ready to go. Attach your CV and send.</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={S.input} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={{ ...S.input, marginTop:10 }} />
        <input value={ref} onChange={e => setRef(e.target.value)} placeholder="Gumroad order reference" style={{ ...S.input, marginTop:10 }} />
        <a href={`mailto:${CV_EMAIL}?subject=CV Audit — ${encodeURIComponent(name)}&body=Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0AOrder: ${encodeURIComponent(ref)}%0A%0AAttach your CV before sending.`}
          style={{ ...S.btnGold, display:"block", textAlign:"center", textDecoration:"none", marginTop:14 }}
          onClick={() => setTimeout(() => setStep("done"), 600)}>Send for Audit →</a>
      </div>
    </div>
  );
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.mClose} onClick={onClose}>✕</button>
        <div style={{ fontSize:32, marginBottom:14 }}>📋</div>
        <h2 style={S.mTitle}>Optimise Your Application</h2>
        <p style={S.mBody}>We tailor your CV specifically for international language opportunities — recruiter-friendly, role-specific, internationally ready.</p>
        <div style={{ background:"rgba(212,168,75,0.05)", border:"1px solid rgba(212,168,75,0.12)", borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
          {["Recruiter-friendly formatting","Role-specific optimisation","Stronger positioning","International-ready presentation","Within 24 hours"].map((x,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6, fontSize:13, color:"#8a7050" }}>
              <span style={{ color:"#d4a84b", fontSize:9 }}>✦</span>{x}
            </div>
          ))}
        </div>
        <a href={GUMROAD_CV_URL} target="_blank" rel="noopener noreferrer"
          style={{ ...S.btnGold, display:"block", textAlign:"center", textDecoration:"none", marginBottom:10 }}
          onClick={() => setTimeout(() => setStep("upload"), 1200)}>Upgrade My Application — $19</a>
        <button onClick={() => setStep("upload")} style={{ background:"transparent", border:"none", color:"#3a3020", fontSize:12, cursor:"pointer", fontFamily:"monospace", display:"block", margin:"0 auto" }}>Already paid? Upload now →</button>
      </div>
    </div>
  );
}

// ── IDENTITY SETUP ────────────────────────────────────────────────────────────
function IdentityModal({ onSave }) {
  const identity = getIdentity();
  const [name, setName] = useState(identity.auto ? "" : identity.user);
  const [flag, setFlag] = useState(identity.flag);
  const FLAGS = ["🌍","🇬🇧","🇺🇸","🇿🇦","🇳🇬","🇰🇪","🇦🇺","🇨🇦","🇮🇳","🇵🇭","🇧🇷","🇲🇽","🇫🇷","🇩🇪","🇪🇸","🇯🇵","🇰🇷","🇨🇳","🇦🇪","🇸🇦"];
  const save = () => {
    const finalName = name.trim() || identity.user;
    saveIdentity(finalName, flag);
    onSave({ user: finalName, flag });
  };
  return (
    <div style={S.overlay}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <h2 style={{ ...S.mTitle, marginBottom:8 }}>Who's posting?</h2>
        <p style={{ color:"#5a4a2a", fontSize:13, lineHeight:1.7, marginBottom:20 }}>Choose a name or keep your assigned Seeker ID. Pick your flag. This is saved on your device.</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={identity.user} style={S.input} maxLength={30} />
        <div style={{ marginTop:14, marginBottom:14 }}>
          <div style={{ color:"#3a3020", fontSize:10, fontFamily:"monospace", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Your Flag</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {FLAGS.map(f => (
              <button key={f} onClick={() => setFlag(f)} style={{ fontSize:22, background: flag===f ? "rgba(212,168,75,0.15)" : "transparent", border:`1px solid ${flag===f?"rgba(212,168,75,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:8, padding:"6px 10px", cursor:"pointer", transition:"all 0.15s" }}>{f}</button>
            ))}
          </div>
        </div>
        <button onClick={save} style={{ ...S.btnGold, border:"none", cursor:"pointer", width:"100%" }}>Join the Conversation →</button>
      </div>
    </div>
  );
}

// ── JOB CARD ─────────────────────────────────────────────────────────────────
function JobCard({ job, canApply, isUnlocked, onApply, index }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const tag = TAG_CONFIG[job.tag] || TAG_CONFIG["Featured"];
  return (
    <>
      {showReport && (
        <div style={S.overlay} onClick={() => setShowReport(false)}>
          <div style={{ ...S.modal, maxWidth:360 }} onClick={e => e.stopPropagation()}>
            <button style={S.mClose} onClick={() => setShowReport(false)}>✕</button>
            <h2 style={{ ...S.mTitle, fontSize:20 }}>Report a Link</h2>
            <p style={S.mBody}>Found a broken link for <strong style={{ color:"#d4a84b" }}>{job.title}</strong>? We'll fix it before tomorrow.</p>
            <a href={`mailto:${CV_EMAIL}?subject=Broken Link — ${encodeURIComponent(job.title)}&body=Job: ${encodeURIComponent(job.title)}%0ALink: ${encodeURIComponent(job.link)}`}
              style={{ ...S.btnGold, display:"block", textAlign:"center", textDecoration:"none" }} onClick={() => setShowReport(false)}>Report This Link</a>
          </div>
        </div>
      )}
      <div onClick={() => setExpanded(!expanded)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ position:"relative", background: hovered ? "rgba(255,255,255,0.048)" : job.featured ? "rgba(212,168,75,0.033)" : "rgba(255,255,255,0.022)", border: job.featured ? `1px solid rgba(212,168,75,${hovered?"0.32":"0.14"})` : `1px solid rgba(255,255,255,${hovered?"0.09":"0.045"})`, borderRadius:16, padding:"22px 20px", cursor:"pointer", transition:"all 0.28s cubic-bezier(0.4,0,0.2,1)", transform:hovered?"translateY(-2px)":"translateY(0)", boxShadow:hovered ? job.featured?"0 16px 48px rgba(212,168,75,0.1),0 4px 16px rgba(0,0,0,0.35)":"0 12px 40px rgba(0,0,0,0.3)" : "none", animation:"cardIn 0.55s ease both", animationDelay:`${index*0.065}s` }}>
        {job.hiddenGem && <div style={{ position:"absolute", top:-1, left:18, background:"linear-gradient(90deg,#d4a84b,#a07828)", color:"#0a0805", fontSize:9, fontWeight:800, letterSpacing:"0.12em", padding:"3px 12px", borderRadius:"0 0 9px 9px", textTransform:"uppercase", fontFamily:"monospace" }}>Today's Hidden Gem</div>}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, marginTop:job.hiddenGem?12:0 }}>
          <div style={{ flex:1, paddingRight:10 }}>
            <div style={{ fontSize:16, fontWeight:600, color:"#f0ece4", lineHeight:1.3, marginBottom:4, fontFamily:"Georgia,serif" }}>{job.title}</div>
            <div style={{ fontSize:11, color: canApply?"#7a6040":"#2a1e10", fontFamily:"monospace", letterSpacing:"0.04em" }}>{canApply ? job.company : job.companyBlurred}</div>
          </div>
          <span style={{ background:tag.bg, border:`1px solid ${tag.border}`, color:tag.color, fontSize:10, padding:"3px 9px", borderRadius:20, fontFamily:"monospace", whiteSpace:"nowrap", letterSpacing:"0.04em", flexShrink:0 }}>{job.tag}</span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:12 }}>
          {[job.location, job.type, job.salary].map((x,i) => <span key={i} style={{ background:"rgba(255,255,255,0.035)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:7, padding:"3px 9px", fontSize:11, color:"#a09070", fontFamily:"monospace" }}>{x}</span>)}
        </div>
        <p style={{ color:"#6a5a3a", fontSize:13.5, lineHeight:1.75, margin:0 }}>{job.description}</p>
        {expanded && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.045)" }}>
            <div style={{ color:"#3a3020", fontSize:10, fontFamily:"monospace", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>Requirements</div>
            {job.requirements.map((r,i) => <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:6 }}><span style={{ color:"#d4a84b", fontSize:9, marginTop:4 }}>✦</span><span style={{ color:"#6a5a3a", fontSize:13 }}>{r}</span></div>)}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:16 }}>
              {canApply ? (
                <>
                  <a href={job.link} target="_blank" rel="noopener noreferrer" style={{ ...S.btnGold, fontSize:13, padding:"10px 18px", textDecoration:"none", display:"inline-block", width:"auto" }} onClick={e => e.stopPropagation()}>Apply Now →</a>
                  <button onClick={e => { e.stopPropagation(); setShowReport(true); }} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.06)", borderRadius:9, padding:"10px 12px", color:"#2a2010", fontSize:11, cursor:"pointer", fontFamily:"monospace" }}>Report link</button>
                </>
              ) : (
                <button onClick={e => { e.stopPropagation(); onApply(); }} style={{ ...S.btnGold, fontSize:13, padding:"10px 18px", border:"none", cursor:"pointer", width:"auto" }}>
                  {isUnlocked ? "Upgrade to Full Board — $5" : "Unlock to Apply →"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── COMMUNITY PAGE ────────────────────────────────────────────────────────────
function CommunityPage({ onUnlock, isUnlocked, jobs, onNavigateHome }) {
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [replies, setReplies] = useState({});
  const [likedSet, setLikedSet] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem("esljd_liked")||"[]")); } catch { return new Set(); } });
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState({});
  const [message, setMessage] = useState("");
  const [identity, setIdentity] = useState(() => getIdentity());
  const [showIdentity, setShowIdentity] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community").then(r => r.json()).then(d => {
      setPosts(d.posts || []);
      setLikes(d.likes || {});
      setReplies(d.replies || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLike = async (postId) => {
    if (likedSet.has(postId)) return;
    const newSet = new Set([...likedSet, postId]);
    setLikedSet(newSet);
    try { localStorage.setItem("esljd_liked", JSON.stringify([...newSet])); } catch {}
    setLikes(p => ({ ...p, [postId]: (p[postId] || 0) + 1 }));
    try {
      const r = await fetch("/api/community?action=like", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ postId }) });
      const d = await r.json();
      if (d.count) setLikes(p => ({ ...p, [postId]: d.count }));
    } catch {}
  };

  const doPost = async (id) => {
    const text = message.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/community?action=post", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ user: id.user, flag: id.flag, text }) });
      const d = await r.json();
      if (d.post) {
        setPosts(p => [d.post, ...p]);
        setLikes(l => ({ ...l, [d.post.id]: 0 }));
        setReplies(rv => ({ ...rv, [d.post.id]: [] }));
        setMessage("");
      }
    } catch(e) { console.error("Post failed:", e.message); }
    setSubmitting(false);
  };

  const handlePost = async () => {
    if (!message.trim() || submitting) return;
    if (identity.auto) { setShowIdentity(true); return; }
    await doPost(identity);
  };

  const handleReply = async (postId) => {
    const text = replyText[postId]?.trim();
    if (!text) return;
    if (identity.auto) { setShowIdentity(true); return; }
    try {
      const r = await fetch("/api/community?action=reply", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ postId, user: identity.user, flag: identity.flag, text }) });
      const d = await r.json();
      if (d.reply) {
        setReplies(p => ({ ...p, [postId]: [...(p[postId]||[]), d.reply] }));
        setReplyText(p => ({ ...p, [postId]: "" }));
      }
    } catch {}
  };

  const hotTopics = [...posts].sort((a,b) => (likes[b.id]||0) - (likes[a.id]||0)).slice(0,5).map(p => p.text.split(/[.!?]/)[0].slice(0,44) + (p.text.length > 44 ? "…" : ""));

  return (
    <>
      {showIdentity && <IdentityModal onSave={async (id) => { setIdentity(id); setShowIdentity(false); if (message.trim()) { await doPost(id); } }} />}
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px 100px" }}>
        <div style={{ paddingTop:40, paddingBottom:36 }}>
          <button onClick={onNavigateHome} style={{ background:"transparent", border:"none", color:"#3a3020", fontSize:12, fontFamily:"monospace", cursor:"pointer", marginBottom:20, display:"flex", alignItems:"center", gap:6 }}>← Back to Opportunities</button>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ height:1, width:24, background:"linear-gradient(90deg,transparent,rgba(212,168,75,0.35))" }} />
            <span style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.18em", color:"#6a4a20", textTransform:"uppercase" }}>Live Community</span>
            <div style={{ height:1, width:24, background:"linear-gradient(90deg,rgba(212,168,75,0.35),transparent)" }} />
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(30px,5vw,52px)", fontWeight:600, color:"#f0ece4", marginBottom:10, lineHeight:1.05 }}>The Global Pulse</h1>
          <p style={{ color:"#5a4a2a", fontSize:14, maxWidth:400, lineHeight:1.8 }}>Real conversations from language professionals building global careers.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 272px", gap:20, alignItems:"start" }}>
          <div>
            {/* COMPOSE */}
            <div style={{ background:"rgba(255,255,255,0.022)", border:"1px solid rgba(255,255,255,0.055)", borderRadius:14, padding:18, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, cursor:"pointer" }} onClick={() => identity.auto && setShowIdentity(true)}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(212,168,75,0.1)", border:"1px solid rgba(212,168,75,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{identity.flag}</div>
                <div>
                  <div style={{ color:"#c8bfb0", fontSize:12, fontWeight:500 }}>{identity.user}</div>
                  <div style={{ color:"#2a2010", fontSize:10, fontFamily:"monospace" }}>{identity.auto ? "Tap to set your name" : "tap to change"}</div>
                </div>
              </div>
              <textarea value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key==="Enter" && e.metaKey) handlePost(); }} placeholder="Share a question, opportunity, or insight..." rows={3}
                style={{ width:"100%", background:"transparent", border:"none", color:"#c8bfb0", fontSize:14, fontFamily:"Georgia,serif", lineHeight:1.7, resize:"none" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
                <span style={{ color:"#2a2010", fontSize:10, fontFamily:"monospace" }}>{message.length}/500</span>
                <button onClick={handlePost} disabled={submitting || !message.trim()} style={{ ...S.btnGold, width:"auto", padding:"8px 18px", fontSize:12, border:"none", cursor: message.trim() ? "pointer" : "not-allowed", opacity: message.trim() ? 1 : 0.4 }}>
                  {submitting ? "Posting..." : "Share →"}
                </button>
              </div>
            </div>

            {/* POSTS */}
            {loading ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#2a2010", fontFamily:"monospace", fontSize:13 }}>Loading conversations...</div>
            ) : posts.map((post, i) => {
              const postLikes = likes[post.id] || 0;
              const postReplies = replies[post.id] || [];
              const isExpanded = expandedReplies[post.id];
              const isLiked = likedSet.has(post.id);
              const linkedJob = post.jobId ? jobs.find(j => j.id === post.jobId) : null;
              return (
                <div key={post.id} style={{ background:"rgba(255,255,255,0.018)", border:"1px solid rgba(255,255,255,0.04)", borderRadius:14, padding:"18px 20px", marginBottom:10, animation:"cardIn 0.5s ease both", animationDelay:`${i*0.04}s` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(212,168,75,0.08)", border:"1px solid rgba(212,168,75,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{post.flag}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:"#c8bfb0", fontSize:13, fontWeight:500 }}>{post.user}</div>
                      <div style={{ color:"#2a2010", fontSize:10, fontFamily:"monospace" }}>{timeAgo(post.time)}</div>
                    </div>
                  </div>
                  <p style={{ color:"#8a7a5a", fontSize:14, lineHeight:1.75, margin:"0 0 14px" }}>{post.text}</p>

                  {/* LINKED JOB TEASER */}
                  {linkedJob && (
                    <button onClick={() => !isUnlocked && onUnlock()} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", textAlign:"left", background:"rgba(212,168,75,0.04)", border:"1px solid rgba(212,168,75,0.12)", borderRadius:10, padding:"10px 14px", marginBottom:14, cursor: isUnlocked ? "default" : "pointer", transition:"all 0.2s" }}>
                      <span style={{ fontSize:14 }}>{isUnlocked ? "💼" : "🔒"}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:"#6a4a20", fontSize:11, fontFamily:"monospace" }}>Mentioned on today's board:</div>
                        <div style={{ color:"#c8bfb0", fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{linkedJob.title}</div>
                      </div>
                      {!isUnlocked && <span style={{ color:"#d4a84b", fontSize:11, fontFamily:"monospace", flexShrink:0 }}>Unlock →</span>}
                    </button>
                  )}

                  {/* ACTIONS */}
                  <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                    <button onClick={() => handleLike(post.id)} style={{ background:"transparent", border:"none", color: isLiked ? "#d4a84b" : "#3a3020", fontSize:13, cursor: isLiked ? "default" : "pointer", fontFamily:"monospace", display:"flex", alignItems:"center", gap:6, transition:"color 0.2s" }}>
                      <span style={{ fontSize:15 }}>{isLiked ? "✦" : "✧"}</span>
                      <span>{postLikes}</span>
                    </button>
                    <button onClick={() => setExpandedReplies(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background:"transparent", border:"none", color:"#3a3020", fontSize:12, cursor:"pointer", fontFamily:"monospace", display:"flex", alignItems:"center", gap:6 }}>
                      <span>💬</span>
                      <span>{postReplies.length} {postReplies.length === 1 ? "reply" : "replies"}</span>
                    </button>
                  </div>

                  {/* REPLIES THREAD */}
                  {isExpanded && (
                    <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                      {postReplies.map((reply, ri) => (
                        <div key={reply.id} style={{ display:"flex", gap:10, marginBottom:12 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{reply.flag}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", gap:8, alignItems:"baseline", marginBottom:3 }}>
                              <span style={{ color:"#a09070", fontSize:12, fontWeight:500 }}>{reply.user}</span>
                              <span style={{ color:"#2a2010", fontSize:10, fontFamily:"monospace" }}>{timeAgo(reply.time)}</span>
                            </div>
                            <p style={{ color:"#6a5a3a", fontSize:13, lineHeight:1.65, margin:0 }}>{reply.text}</p>
                          </div>
                        </div>
                      ))}
                      {/* REPLY INPUT */}
                      <div style={{ display:"flex", gap:10, marginTop:12, alignItems:"flex-start" }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(212,168,75,0.08)", border:"1px solid rgba(212,168,75,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{identity.flag}</div>
                        <div style={{ flex:1, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, display:"flex", overflow:"hidden" }}>
                          <input value={replyText[post.id]||""} onChange={e => setReplyText(p => ({ ...p, [post.id]: e.target.value }))} onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleReply(post.id); } }} placeholder="Write a reply..." style={{ flex:1, background:"transparent", border:"none", padding:"10px 14px", color:"#c8bfb0", fontSize:13, fontFamily:"Georgia,serif" }} />
                          <button onClick={() => handleReply(post.id)} style={{ background:"rgba(212,168,75,0.1)", border:"none", padding:"0 14px", color:"#d4a84b", fontSize:12, cursor:"pointer", fontFamily:"monospace", borderLeft:"1px solid rgba(255,255,255,0.05)" }}>Reply</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SIDEBAR */}
          <div style={{ position:"sticky", top:72 }}>
            <div style={{ background:"rgba(255,255,255,0.018)", border:"1px solid rgba(255,255,255,0.045)", borderRadius:14, padding:18, marginBottom:14 }}>
              <div style={{ color:"#2a2010", fontSize:9, fontFamily:"monospace", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>Active Discussions</div>
              {hotTopics.length === 0 ? <div style={{ color:"#2a2010", fontSize:12 }}>No discussions yet — start one above.</div> : hotTopics.map((t,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom: i<hotTopics.length-1?"1px solid rgba(255,255,255,0.035)":"none" }}>
                  <span style={{ color:"#3a3020", fontSize:10, fontFamily:"monospace", width:14, flexShrink:0 }}>0{i+1}</span>
                  <span style={{ color:"#7a6a4a", fontSize:12, lineHeight:1.4 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"rgba(212,168,75,0.04)", border:"1px solid rgba(212,168,75,0.12)", borderRadius:14, padding:18 }}>
              <div style={{ color:"#6a4a20", fontSize:9, fontFamily:"monospace", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>Your Identity</div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ fontSize:22 }}>{identity.flag}</div>
                <div>
                  <div style={{ color:"#c8bfb0", fontSize:13 }}>{identity.user}</div>
                  <div style={{ color:"#3a3020", fontSize:10, fontFamily:"monospace" }}>{identity.auto ? "auto-assigned" : "custom"}</div>
                </div>
              </div>
              <button onClick={() => setShowIdentity(true)} style={{ background:"rgba(212,168,75,0.08)", border:"1px solid rgba(212,168,75,0.18)", borderRadius:8, padding:"8px 14px", color:"#d4a84b", fontSize:11, cursor:"pointer", fontFamily:"monospace", width:"100%" }}>Change Identity</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [language, setLanguage] = useState(() => { try { return localStorage.getItem("esljd_lang")||"en"; } catch { return "en"; } });
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSponsorOnly, setIsSponsorOnly] = useState(false);
  const [modal, setModal] = useState(null);
  const seekers = useSeekers();
  const now = new Date();
  const edition = now.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  useEffect(() => {
    const a = getAccess();
    setIsUnlocked(!!a);
    setIsSponsorOnly(!!a?.sponsor);
  }, []);
  useEffect(() => { try { localStorage.setItem("esljd_lang", language); } catch {} }, [language]);

  // Inject AdSense script once
  useEffect(() => {
    if (!ADS_ENABLED) return;
    if (document.querySelector(`script[data-adsense]`)) return;
    const s = document.createElement("script");
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
    s.async = true; s.crossOrigin = "anonymous"; s.dataset.adsense = "true";
    document.head.appendChild(s);
  }, []);

  const handleUnlocked = () => {
    const a = getAccess();
    setIsUnlocked(!!a); setIsSponsorOnly(!!a?.sponsor);
    setModal(null);
    if (!a?.sponsor) setTimeout(() => setModal("cv"), 800);
  };

  const filters = ["All","Remote","Abroad","Teaching","Corporate","Freelance"];
  const filteredJobs = JOBS.filter(job => {
    const mf = filter==="All"
      || (filter==="Remote" && job.location?.toLowerCase().includes("remote"))
      || (filter==="Abroad" && ["Thailand","Korea","UAE","Jordan","Japan","Amman"].some(c=>job.location?.includes(c)))
      || (filter==="Teaching" && (job.title?.toLowerCase().includes("teacher")||job.title?.toLowerCase().includes("instructor")||job.title?.toLowerCase().includes("tutor")))
      || (filter==="Corporate" && (job.title?.toLowerCase().includes("coach")||job.title?.toLowerCase().includes("trainer")||job.title?.toLowerCase().includes("coordinator")))
      || (filter==="Freelance" && job.type?.toLowerCase().includes("freelance"));
    const q = search.toLowerCase();
    const ms = !q || [job.title,job.location,job.salary,job.description].join(" ").toLowerCase().includes(q);
    return mf && ms;
  });

  const featuredJob = JOBS.filter(j=>j.featured).sort((a,b)=>parseInt(b.salary||"0")-parseInt(a.salary||"0"))[0];
  const remoteCount = filteredJobs.filter(j=>j.location?.toLowerCase().includes("remote")).length;
  const abroadCount = filteredJobs.filter(j=>["Thailand","Korea","UAE","Jordan","Japan","Amman"].some(c=>j.location?.includes(c))).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600;1,700&family=DM+Mono:wght@300;400;500&family=Inter:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:#080604;color:#f0ece4;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
        @keyframes cardIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(74,222,128,0.3);}50%{opacity:0.7;box-shadow:0 0 0 5px rgba(74,222,128,0);}}
        @keyframes breathe{0%,100%{opacity:0.3;}50%{opacity:0.55;}}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:#080604;}::-webkit-scrollbar-thumb{background:#1a1208;border-radius:3px;}
        input::placeholder,textarea::placeholder{color:#2a2010;}
        input:focus,textarea:focus{outline:none;}
        *{-webkit-tap-highlight-color:transparent;}
      `}</style>

      {modal==="unlock" && <UnlockModal onClose={() => setModal(null)} onUnlocked={handleUnlocked} showSponsor={() => setModal("sponsor")} />}
      {modal==="sponsor" && <SponsorModal onClose={() => setModal(null)} onUnlocked={handleUnlocked} />}
      {modal==="cv" && <CVModal onClose={() => setModal(null)} />}

      <div style={{ minHeight:"100vh", background:"#080604", position:"relative" }}>
        {/* ATMOSPHERE */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-25%", left:"50%", transform:"translateX(-50%)", width:"140vw", height:"70vh", background:"radial-gradient(ellipse at center, rgba(160,100,20,0.07) 0%, rgba(90,50,5,0.025) 45%, transparent 70%)", animation:"breathe 10s ease-in-out infinite" }} />
        </div>

        {/* ── TOP NAV ── */}
        <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,6,4,0.9)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.035)" }}>
          <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", height:52 }}>
            <button onClick={() => setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:"#d4a84b", fontStyle:"italic", fontWeight:600, marginRight:28 }}>
              ESL Jobs Daily
            </button>
            <div style={{ display:"flex", gap:4, flex:1 }}>
              {[["home","Opportunities"],["community","Community"]].map(([p,l]) => (
                <button key={p} onClick={() => setPage(p)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:page===p?"#c8bfb0":"#2a2010", fontFamily:"monospace", padding:"5px 10px", borderRadius:7, transition:"color 0.2s", letterSpacing:"0.03em" }}>{l}</button>
              ))}
            </div>
            {isUnlocked ? (
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ color:"#4ade80", fontSize:11, fontFamily:"monospace" }}>✓ {daysLeft()}d</span>
                <button onClick={() => setModal("cv")} style={{ background:"rgba(212,168,75,0.07)", border:"1px solid rgba(212,168,75,0.18)", borderRadius:8, padding:"5px 12px", color:"#d4a84b", fontSize:11, cursor:"pointer", fontFamily:"monospace" }}>CV Audit →</button>
              </div>
            ) : (
              <button onClick={() => setModal("unlock")} style={{ background:"linear-gradient(135deg,#b87828,#d4a84b)", border:"none", borderRadius:9, padding:"7px 16px", color:"#0a0805", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"monospace", letterSpacing:"0.04em", boxShadow:"0 3px 14px rgba(212,168,75,0.2)" }}>
                Unlock — $5
              </button>
            )}
          </div>
        </nav>

        <div style={{ position:"relative", zIndex:1 }}>
          {page==="community" ? (
            <CommunityPage onUnlock={() => setModal("unlock")} isUnlocked={isUnlocked} jobs={JOBS} onNavigateHome={() => setPage("home")} />
          ) : (
            <div style={{ maxWidth:1080, margin:"0 auto", padding:"0 24px 100px" }}>

              {/* ── NEWSPAPER MASTHEAD ── */}
              <header style={{ paddingTop:48, paddingBottom:0, textAlign:"center", animation:"fadeUp 0.7s ease both" }}>
                {/* Top rule */}
                <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:10 }}>
                  <div style={{ flex:1, height:3, background:"#f0ece4" }} />
                  <div style={{ height:3, width:8 }} />
                  <div style={{ flex:1, height:1, background:"#f0ece4" }} />
                </div>

                {/* Masthead name */}
                <div style={{ padding:"10px 0 8px" }}>
                  <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(42px,9vw,110px)", fontWeight:700, lineHeight:0.9, letterSpacing:"-0.01em", color:"#f0ece4", textTransform:"uppercase" }}>
                    ESL Jobs Daily
                  </h1>
                </div>

                {/* Subtitle rule */}
                <div style={{ display:"flex", alignItems:"center", gap:12, margin:"6px 0" }}>
                  <div style={{ flex:1, height:1, background:"rgba(240,236,228,0.25)" }} />
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"#8a7a5a", fontStyle:"italic", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
                    The Global Language Opportunity Board
                  </span>
                  <div style={{ flex:1, height:1, background:"rgba(240,236,228,0.25)" }} />
                </div>

                {/* Dateline strip */}
                <div style={{ background:"rgba(240,236,228,0.04)", borderTop:"1px solid rgba(240,236,228,0.12)", borderBottom:"1px solid rgba(240,236,228,0.12)", padding:"7px 0", margin:"0", display:"flex", alignItems:"center", justifyContent:"center", gap:0, flexWrap:"wrap" }}>
                  {[
                    `Vol. I · ${edition}`,
                    `${seekers} Seekers Online`,
                    `${JOBS.length} Opportunities Today`,
                    "4 Countries Trending",
                  ].map((item, i, arr) => (
                    <span key={i} style={{ display:"inline-flex", alignItems:"center" }}>
                      <span style={{ fontFamily:"monospace", fontSize:11, color:"#5a4a2a", letterSpacing:"0.05em" }}>{item}</span>
                      {i < arr.length - 1 && <span style={{ color:"#3a2e18", margin:"0 14px", fontSize:10 }}>·</span>}
                    </span>
                  ))}
                </div>

                {/* Bottom rule double */}
                <div style={{ marginBottom:32 }}>
                  <div style={{ height:1, background:"rgba(240,236,228,0.12)" }} />
                  <div style={{ height:2 }} />
                  <div style={{ height:3, background:"rgba(240,236,228,0.08)" }} />
                </div>

                {/* CTA */}
                {isUnlocked ? (
                  <div style={{ display:"inline-flex", alignItems:"center", gap:12, background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.12)", borderRadius:40, padding:"10px 20px", marginBottom:36 }}>
                    <span style={{ color:"#4ade80", fontSize:12 }}>✓</span>
                    <span style={{ color:"#4ade80", fontSize:12, fontFamily:"monospace" }}>Full access · {daysLeft()} days remaining</span>
                    <div style={{ width:1, height:12, background:"rgba(74,222,128,0.18)" }} />
                    <button onClick={() => setModal("cv")} style={{ background:"none", border:"none", color:"#d4a84b", fontSize:11, cursor:"pointer", fontFamily:"monospace" }}>CV Audit →</button>
                  </div>
                ) : (
                  <div style={{ marginBottom:36 }}>
                    <button onClick={() => setModal("unlock")}
                      style={{ background:"linear-gradient(135deg,#b87828,#d4a84b,#c08030)", border:"none", borderRadius:13, padding:"14px 32px", color:"#0a0805", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"monospace", letterSpacing:"0.06em", boxShadow:"0 8px 28px rgba(212,168,75,0.2),0 2px 8px rgba(0,0,0,0.4)", transition:"all 0.25s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 14px 44px rgba(212,168,75,0.28),0 4px 12px rgba(0,0,0,0.4)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(212,168,75,0.2),0 2px 8px rgba(0,0,0,0.4)"; }}>
                      ☕ Unlock Full Access — $5
                    </button>
                    <div style={{ color:"#2a2010", fontSize:11, fontFamily:"monospace", marginTop:10 }}>30 days · company names · direct apply links</div>
                  </div>
                )}
              </header>

              {/* FEATURED OPPORTUNITY */}
              {featuredJob && (
                <div style={{ marginBottom:32, animation:"fadeUp 0.7s 0.1s ease both" }}>
                  <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.16em", color:"#3a3020", textTransform:"uppercase", marginBottom:12 }}>Featured Opportunity</div>
                  <div style={{ background:"rgba(212,168,75,0.04)", border:"1px solid rgba(212,168,75,0.16)", borderRadius:16, padding:"24px 26px", display:"grid", gridTemplateColumns:"1fr auto", gap:20, alignItems:"center", cursor:"pointer", transition:"all 0.28s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(212,168,75,0.07)"; e.currentTarget.style.boxShadow="0 16px 48px rgba(212,168,75,0.09)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(212,168,75,0.04)"; e.currentTarget.style.boxShadow="none"; }}>
                    <div>
                      <div style={{ fontFamily:"monospace", fontSize:10, color:"#6a4a20", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>{featuredJob.tag} · {featuredJob.location}</div>
                      <h2 style={{ fontFamily:"Georgia,serif", fontSize:"clamp(18px,2.5vw,26px)", fontWeight:600, color:"#f0ece4", marginBottom:8, lineHeight:1.2 }}>{featuredJob.title}</h2>
                      <p style={{ color:"#6a5a3a", fontSize:14, lineHeight:1.75, marginBottom:14, maxWidth:520 }}>{featuredJob.description}</p>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {[featuredJob.salary, featuredJob.type, (isUnlocked && (!isSponsorOnly || featuredJob.featured)) ? featuredJob.company : featuredJob.companyBlurred].map((x,i) => (
                          <span key={i} style={{ background:"rgba(212,168,75,0.07)", border:"1px solid rgba(212,168,75,0.16)", borderRadius:7, padding:"3px 9px", fontSize:11, color:"#9a7a40", fontFamily:"monospace" }}>{x}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      {isUnlocked ? (
                        <a href={featuredJob.link} target="_blank" rel="noopener noreferrer" style={{ ...S.btnGold, display:"inline-block", textDecoration:"none", padding:"11px 18px", fontSize:13, width:"auto" }}>Apply Now →</a>
                      ) : (
                        <button onClick={() => setModal("unlock")} style={{ ...S.btnGold, border:"none", cursor:"pointer", padding:"11px 18px", fontSize:13, width:"auto" }}>Unlock to Apply →</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* AD SLOT — between featured and job list */}
              <AdSlot slot="1234567890" />

              {/* LANGUAGE SELECTOR */}
              <div style={{ marginBottom:24, animation:"fadeUp 0.7s 0.15s ease both" }}>
                <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.16em", color:"#2a2010", textTransform:"uppercase", marginBottom:10 }}>Language</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {LANGUAGES.map(lang => {
                    const active = language===lang.code;
                    return (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); setFilter("All"); setSearch(""); }}
                        style={{ background:active?"rgba(212,168,75,0.1)":"rgba(255,255,255,0.02)", border:`1px solid ${active?"rgba(212,168,75,0.38)":"rgba(255,255,255,0.04)"}`, borderRadius:9, padding:"7px 12px", color:active?"#d4a84b":"#2a2010", fontSize:12, cursor:"pointer", fontFamily:"monospace", transition:"all 0.18s", display:"flex", alignItems:"center", gap:6, boxShadow:active?"0 3px 10px rgba(212,168,75,0.09)":"none" }}>
                        <span>{lang.flag}</span><span>{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEARCH + FILTER */}
              <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap", animation:"fadeUp 0.7s 0.2s ease both" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search salaries, countries, keywords..."
                  style={{ flex:1, minWidth:200, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.045)", borderRadius:11, padding:"11px 16px", color:"#f0ece4", fontSize:13, fontFamily:"monospace" }} />
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {filters.map(f => <button key={f} onClick={() => setFilter(f)} style={{ background:filter===f?"rgba(212,168,75,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${filter===f?"rgba(212,168,75,0.28)":"rgba(255,255,255,0.04)"}`, borderRadius:9, padding:"9px 13px", color:filter===f?"#d4a84b":"#2a2010", fontSize:11, cursor:"pointer", fontFamily:"monospace", transition:"all 0.18s" }}>{f}</button>)}
                </div>
              </div>

              {/* STATS BAR */}
              {filteredJobs.length > 0 && (
                <div style={{ display:"flex", marginBottom:24, background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.035)", borderRadius:11, overflow:"hidden", animation:"fadeUp 0.7s 0.22s ease both" }}>
                  {[{ n:filteredJobs.length, l:"curated today" },{ n:remoteCount, l:"remote" },{ n:abroadCount, l:"relocation-ready" },{ n:filteredJobs.filter(j=>j.featured).length, l:"featured" }].map((s,i,a) => (
                    <div key={s.l} style={{ flex:1, padding:"13px 14px", borderRight:i<a.length-1?"1px solid rgba(255,255,255,0.03)":"none" }}>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#d4a84b", lineHeight:1, marginBottom:2 }}>{s.n}</div>
                      <div style={{ fontFamily:"monospace", fontSize:9, color:"#2a2010", letterSpacing:"0.07em" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* JOBS GRID */}
              {filteredJobs.length === 0 ? (
                <div style={{ textAlign:"center", padding:"64px 0" }}>
                  <div style={{ fontSize:22, color:"#1a1208", marginBottom:12 }}>◇</div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:20, color:"#3a3020", marginBottom:8 }}>Nothing today for {LANGUAGES.find(l=>l.code===language)?.label}.</div>
                  <div style={{ color:"#1a1208", fontSize:11, fontFamily:"monospace" }}>We checked twice. Tomorrow's search runs at 6 AM.</div>
                  <button onClick={() => setLanguage("en")} style={{ marginTop:18, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:9, padding:"9px 18px", color:"#3a3020", fontSize:12, cursor:"pointer", fontFamily:"monospace" }}>Browse English →</button>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:11 }}>
                  {filteredJobs.map((job,i) => (
                    <>
                      <JobCard key={job.id} job={job} isUnlocked={isUnlocked} canApply={isUnlocked && (!isSponsorOnly || job.featured)} onApply={() => setModal("unlock")} index={i} />
                      {/* Ad slot every 6 jobs */}
                      {(i + 1) % 6 === 0 && i < filteredJobs.length - 1 && (
                        <div key={`ad-${i}`} style={{ gridColumn:"1/-1" }}>
                          <AdSlot slot="0987654321" format="horizontal" />
                        </div>
                      )}
                    </>
                  ))}
                </div>
              )}

              {/* SHARE */}
              {filteredJobs.length > 0 && (
                <div style={{ marginTop:48, padding:"24px 26px", background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.035)", borderRadius:13, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                  <div>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:17, color:"#7a6a4a", marginBottom:4, fontStyle:"italic" }}>Know someone grinding in the wrong job?</div>
                    <div style={{ color:"#1a1208", fontSize:11, fontFamily:"monospace" }}>Send them here. It costs nothing and might change everything.</div>
                  </div>
                  <button onClick={() => { if (navigator.share) navigator.share({ title:"ESL Jobs Daily", url:window.location.href }); else navigator.clipboard?.writeText(window.location.href); }}
                    style={{ background:"rgba(212,168,75,0.06)", border:"1px solid rgba(212,168,75,0.14)", borderRadius:10, padding:"10px 18px", color:"#d4a84b", fontSize:11, cursor:"pointer", fontFamily:"monospace", letterSpacing:"0.04em" }}>
                    Share today's board →
                  </button>
                </div>
              )}

              {/* FOOTER */}
              <footer style={{ marginTop:56, paddingTop:28, borderTop:"1px solid rgba(255,255,255,0.035)", textAlign:"center" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#d4a84b", marginBottom:12, fontStyle:"italic" }}>ESL Jobs Daily</div>
                <p style={{ color:"#1a1208", fontSize:11, fontFamily:"monospace", lineHeight:2.2, maxWidth:480, margin:"0 auto 12px" }}>
                  Seekers have relocated to Seoul · Dubai · Barcelona · Bangkok · Tokyo · and online.<br />
                  Trusted daily by language professionals who refused to settle.
                </p>
                <div style={{ color:"#0e0a04", fontSize:10, fontFamily:"monospace" }}>© ESL Jobs Daily · A small team searching so you don't have to</div>
              </footer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const S = {
  overlay:{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(10px)" },
  modal:{ background:"#0d0a06", border:"1px solid rgba(255,255,255,0.07)", borderRadius:22, padding:32, maxWidth:440, width:"100%", position:"relative", boxShadow:"0 40px 100px rgba(0,0,0,0.75),0 0 0 1px rgba(212,168,75,0.05)" },
  mClose:{ position:"absolute", top:14, right:14, background:"transparent", border:"none", color:"#2a2010", fontSize:15, cursor:"pointer" },
  mTitle:{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:600, color:"#f0ece4", marginBottom:10 },
  mBody:{ color:"#6a5a3a", fontSize:14, lineHeight:1.8, marginBottom:20 },
  btnGold:{ background:"linear-gradient(135deg,#c8903c,#d4a84b)", borderRadius:11, padding:"12px 20px", color:"#0a0805", fontWeight:700, fontSize:14, fontFamily:"monospace", letterSpacing:"0.04em", display:"inline-block", width:"100%", textAlign:"center", transition:"all 0.2s" },
  btnGhost:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:11, padding:"11px 18px", color:"#5a4a2a", fontSize:13, fontFamily:"monospace", display:"block", textAlign:"center", width:"100%" },
  input:{ width:"100%", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:9, padding:"11px 14px", color:"#f0ece4", fontSize:13, fontFamily:"monospace" },
};
