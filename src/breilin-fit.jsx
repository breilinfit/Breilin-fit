import { useState, useEffect, useRef } from "react";

// ─── PALETTE (from logo) ───────────────────────────────────────
const C = {
  navy:    "#0f1630",
  navyDark:"#080e20",
  navyMid: "#1a2545",
  gold:    "#c9a84c",
  goldLight:"#e4c76b",
  goldDim: "#8a6f2e",
  purple:  "#5b3fa0",
  purpleLight:"#7c5cc4",
  purpleDim:"#3a2870",
  white:   "#f0eeea",
  muted:   "#8a92b2",
  glass:   "rgba(255,255,255,0.04)",
  glassBorder: "rgba(201,168,76,0.18)",
};

// ─── SYSTEM PROMPT ─────────────────────────────────────────────
const COACH_PROMPT = `You are Briant, the virtual assistant of BREILIN FIT — a premium online fitness coaching platform.

LANGUAGE: Detect the user's language automatically and respond in the same language. If they write in Spanish, respond in Spanish. If they write in English, respond in English. You are fully fluent in both.

PERSONALITY: Professional, motivating, warm, and empathetic. You are concise (max 4 sentences per reply).

YOUR ROLE:
- Introduce yourself as "Briant, asistente virtual de Breilin Fit" / "Briant, Breilin Fit's virtual assistant"
- Help with: training questions, basic nutrition, goal tracking, and plan guidance
- If asked about pricing, mention the Básico, Pro, and Elite plans available in the Plans section
- When someone wants to start, recommend booking a free consultation

Always be encouraging and results-focused.`;

// ─── MOCK DATA ─────────────────────────────────────────────────
const MOCK_CLIENTS = [
  { id:1, name:"María González", plan:"Pro", progress:72, checkins:8, goal:"Pérdida de peso", status:"active", joined:"Mar 2025" },
  { id:2, name:"Carlos Ruiz",    plan:"Elite", progress:88, checkins:14, goal:"Masa muscular",  status:"active", joined:"Ene 2025" },
  { id:3, name:"Ana Martínez",   plan:"Básico", progress:45, checkins:3,  goal:"Tonificación",  status:"active", joined:"Abr 2025" },
  { id:4, name:"Luis Pérez",     plan:"Pro",   progress:61, checkins:9,  goal:"Resistencia",   status:"active", joined:"Feb 2025" },
  { id:5, name:"Sofia Torres",   plan:"Elite", progress:94, checkins:22, goal:"Competencia",   status:"active", joined:"Oct 2024" },
];

const PLANS = [
  {
    name: "Básico",
    price: "$49",
    period: "/mes",
    color: C.muted,
    accent: "#8a92b2",
    features: ["Plan de entrenamiento personalizado","Seguimiento semanal","Acceso al chatbot IA","Biblioteca de ejercicios","Soporte por WhatsApp"],
    cta: "Comenzar",
    popular: false,
  },
  {
    name: "Pro",
    price: "$89",
    period: "/mes",
    color: C.gold,
    accent: C.goldLight,
    features: ["Todo lo de Básico","Plan nutricional incluido","Check-ins 2x por semana","Ajustes de plan mensuales","Video-llamada mensual (30 min)","Acceso prioritario"],
    cta: "Más Popular",
    popular: true,
  },
  {
    name: "Elite",
    price: "$149",
    period: "/mes",
    color: C.purpleLight,
    accent: "#a07de8",
    features: ["Todo lo de Pro","Coaching ilimitado","Check-ins diarios","Suplementación guiada","Video-llamadas semanales","Acceso 24/7 directo al coach"],
    cta: "Élite",
    popular: false,
  },
];

// ─── STYLES ────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Nunito+Sans:wght@300;400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.navyDark}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${C.navyDark}; }
  ::-webkit-scrollbar-thumb { background: ${C.goldDim}; border-radius: 2px; }
  textarea:focus, input:focus { outline: none; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
  @keyframes gradMove { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
  @keyframes dotBounce { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-5px);} }

  .fade-up { animation: fadeUp .5s ease both; }
  .fade-up-1 { animation: fadeUp .5s .1s ease both; }
  .fade-up-2 { animation: fadeUp .5s .2s ease both; }
  .fade-up-3 { animation: fadeUp .5s .3s ease both; }
  .float-anim { animation: float 4s ease-in-out infinite; }

  .dot-loader span { display:inline-block; width:5px; height:5px; background:${C.gold}; border-radius:50%; margin:0 2px; animation: dotBounce 1.2s infinite ease-in-out; }
  .dot-loader span:nth-child(2) { animation-delay:.2s; }
  .dot-loader span:nth-child(3) { animation-delay:.4s; }

  .nav-link { transition: color .2s; cursor: pointer; }
  .nav-link:hover { color: ${C.goldLight} !important; }

  .plan-card { transition: transform .3s, box-shadow .3s; }
  .plan-card:hover { transform: translateY(-6px); }

  .client-row { transition: background .2s; }
  .client-row:hover { background: rgba(201,168,76,0.06) !important; }

  .btn-gold { transition: all .2s; }
  .btn-gold:hover { background: ${C.goldLight} !important; color: ${C.navyDark} !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(201,168,76,0.3); }

  .shimmer-text {
    background: linear-gradient(90deg, ${C.gold}, ${C.goldLight}, ${C.gold});
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }
`;

// ─── HELPERS ───────────────────────────────────────────────────
const T = {
  display: { fontFamily:"'Cormorant Garamond', serif" },
  body:    { fontFamily:"'Nunito Sans', sans-serif" },
};

const Badge = ({ plan }) => {
  const map = { Básico:{bg:"#8a92b222",c:C.muted}, Pro:{bg:"#c9a84c22",c:C.gold}, Elite:{bg:"#5b3fa022",c:C.purpleLight} };
  const s = map[plan] || map["Básico"];
  return <span style={{ background:s.bg, color:s.c, ...T.body, fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20, letterSpacing:1 }}>{plan}</span>;
};

const ProgressBar = ({ value, color=C.gold }) => (
  <div style={{ height:4, background:"#ffffff0f", borderRadius:4, overflow:"hidden" }}>
    <div style={{ height:"100%", width:`${value}%`, background:`linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius:4, transition:"width 1s ease" }} />
  </div>
);

// ─── SECTIONS ──────────────────────────────────────────────────

function HeroSection({ onNav }) {
  return (
    <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:"120px 24px 80px" }}>
      {/* BG layers */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 30% 40%, ${C.purpleDim}55 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, ${C.goldDim}22 0%, transparent 50%)`, pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"10%", left:"5%", width:320, height:320, borderRadius:"50%", border:`1px solid ${C.glassBorder}`, opacity:.25, animation:"float 6s ease-in-out infinite", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"15%", right:"5%", width:200, height:200, borderRadius:"50%", border:`1px solid ${C.glassBorder}`, opacity:.15, animation:"float 8s 2s ease-in-out infinite", pointerEvents:"none" }} />

      <div style={{ textAlign:"center", maxWidth:700, position:"relative", zIndex:2 }}>
        {/* Logo mark */}
        <div className="fade-up float-anim" style={{ fontSize:64, marginBottom:24 }}>🏋️</div>

        <div className="fade-up-1" style={{ ...T.body, fontSize:12, fontWeight:700, letterSpacing:4, color:C.gold, marginBottom:16, textTransform:"uppercase" }}>Online Fitness Coaching</div>

        <h1 className="fade-up-2 shimmer-text" style={{ ...T.display, fontSize:"clamp(52px,10vw,96px)", fontWeight:700, lineHeight:1, marginBottom:8 }}>
          BREILIN FIT
        </h1>

        <p className="fade-up-3" style={{ ...T.body, fontSize:18, color:C.muted, lineHeight:1.7, marginBottom:40, fontWeight:300 }}>
          Transformación real. Resultados medibles.<br />Tu coach personal, disponible 24/7.
        </p>

        <div className="fade-up-3" style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn-gold" onClick={() => onNav("chat")} style={{ ...T.body, background:C.gold, color:C.navyDark, border:"none", borderRadius:8, padding:"14px 32px", fontSize:15, fontWeight:700, cursor:"pointer", letterSpacing:.5 }}>
            Hablar con el Coach IA →
          </button>
          <button onClick={() => onNav("plans")} style={{ ...T.body, background:"transparent", color:C.white, border:`1px solid ${C.glassBorder}`, borderRadius:8, padding:"14px 32px", fontSize:15, fontWeight:600, cursor:"pointer", transition:"all .2s" }}>
            Ver Planes
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="fade-up-3" style={{ display:"flex", gap:40, marginTop:80, flexWrap:"wrap", justifyContent:"center" }}>
        {[["150+","Clientes activos"],["98%","Satisfacción"],["3 años","De experiencia"],["24/7","Soporte IA"]].map(([n,l]) => (
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ ...T.display, fontSize:36, color:C.gold, fontWeight:700 }}>{n}</div>
            <div style={{ ...T.body, fontSize:12, color:C.muted, letterSpacing:1 }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlansSection({ onNav }) {
  return (
    <section style={{ padding:"100px 24px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:60 }}>
        <div style={{ ...T.body, fontSize:11, fontWeight:700, letterSpacing:4, color:C.gold, marginBottom:12, textTransform:"uppercase" }}>Inversión en ti</div>
        <h2 style={{ ...T.display, fontSize:"clamp(36px,6vw,64px)", color:C.white, fontWeight:700, marginBottom:16 }}>Planes & Precios</h2>
        <p style={{ ...T.body, color:C.muted, fontSize:16, fontWeight:300 }}>Elige el nivel que se adapta a tus metas</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
        {PLANS.map((plan) => (
          <div key={plan.name} className="plan-card" style={{
            background: plan.popular ? `linear-gradient(145deg, ${C.navyMid}, ${C.purpleDim}66)` : C.glass,
            border: `1px solid ${plan.popular ? C.gold+"55" : C.glassBorder}`,
            borderRadius:16, padding:32, position:"relative",
            boxShadow: plan.popular ? `0 0 40px ${C.gold}22` : "none",
          }}>
            {plan.popular && (
              <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(90deg,${C.goldDim},${C.gold})`, color:C.navyDark, ...T.body, fontSize:11, fontWeight:800, letterSpacing:2, padding:"4px 20px", borderRadius:20 }}>
                MÁS POPULAR
              </div>
            )}
            <div style={{ ...T.body, fontSize:13, fontWeight:700, color:plan.color, letterSpacing:2, marginBottom:8, textTransform:"uppercase" }}>{plan.name}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:24 }}>
              <span style={{ ...T.display, fontSize:52, color:C.white, fontWeight:700 }}>{plan.price}</span>
              <span style={{ ...T.body, color:C.muted, fontSize:14 }}>{plan.period}</span>
            </div>
            <div style={{ borderTop:`1px solid ${C.glassBorder}`, paddingTop:24, marginBottom:28 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:12 }}>
                  <span style={{ color:plan.accent, fontSize:14, marginTop:1 }}>✦</span>
                  <span style={{ ...T.body, color:C.muted, fontSize:14, lineHeight:1.5 }}>{f}</span>
                </div>
              ))}
            </div>
            <button className="btn-gold" onClick={() => onNav("chat")} style={{
              width:"100%", padding:"13px", border:`1px solid ${plan.popular ? C.gold : C.glassBorder}`,
              background: plan.popular ? C.gold : "transparent",
              color: plan.popular ? C.navyDark : C.white,
              borderRadius:8, ...T.body, fontSize:14, fontWeight:700, cursor:"pointer", letterSpacing:.5,
            }}>
              {plan.cta} — Empezar
            </button>
          </div>
        ))}
      </div>

      <p style={{ textAlign:"center", marginTop:32, ...T.body, color:C.muted, fontSize:13 }}>
        * Primera consulta <span style={{ color:C.gold }}>100% gratis</span>. Sin contratos a largo plazo.
      </p>
    </section>
  );
}

function ChatSection() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    initChat();
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const initChat = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:800, system:COACH_PROMPT,
          messages:[{ role:"user", content:"Hola" }] }),
      });
      const d = await res.json();
      const text = d.content?.map(b=>b.text||"").join("") || "¡Hola! Soy Briant, tu asistente virtual de Breilin Fit. ¿En qué puedo ayudarte?";
      setMessages([{ role:"assistant", content:text }]);
    } catch { setMessages([{ role:"assistant", content:"¡Hola! Soy Briant, asistente virtual de Breilin Fit 💪 ¿Cómo puedo ayudarte hoy?" }]); }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content:input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:800, system:COACH_PROMPT, messages:history }),
      });
      const d = await res.json();
      const text = d.content?.map(b=>b.text||"").join("") || "Entiendo. ¿Puedes decirme más?";
      setMessages(prev => [...prev, { role:"assistant", content:text }]);
    } catch { setMessages(prev => [...prev, { role:"assistant", content:"Error de conexión. Intenta de nuevo." }]); }
    setLoading(false);
  };

  return (
    <section style={{ padding:"100px 24px", maxWidth:720, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <div style={{ ...T.body, fontSize:11, fontWeight:700, letterSpacing:4, color:C.gold, marginBottom:12, textTransform:"uppercase" }}>Asistente IA</div>
        <h2 style={{ ...T.display, fontSize:"clamp(36px,6vw,64px)", color:C.white, fontWeight:700, marginBottom:16 }}>Briant — Virtual Assistant</h2>
        <p style={{ ...T.body, color:C.muted, fontSize:16, fontWeight:300 }}>Respuestas instantáneas sobre tu entrenamiento, nutrición y planes</p>
      </div>

      <div style={{ background:C.glass, border:`1px solid ${C.glassBorder}`, borderRadius:20, overflow:"hidden" }}>
        {/* Chat header */}
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.glassBorder}`, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏋️</div>
          <div>
            <div style={{ ...T.body, fontWeight:700, color:C.white, fontSize:15 }}>Briant</div>
            <div style={{ ...T.body, color:C.gold, fontSize:11, fontWeight:600, letterSpacing:.5 }}>Asistente Virtual · Virtual Assistant</div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", animation:"pulse 2s infinite" }} />
              <span style={{ ...T.body, color:C.muted, fontSize:12 }}>En línea</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ height:420, overflowY:"auto", padding:"20px 20px", display:"flex", flexDirection:"column", gap:14 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:10 }} className="fade-up">
              {m.role==="assistant" && (
                <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, marginTop:2 }}>🏋️</div>
              )}
              <div style={{
                maxWidth:"78%", padding:"12px 16px", borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role==="user" ? `linear-gradient(135deg,${C.gold},${C.goldLight})` : C.navyMid,
                border: m.role==="user" ? "none" : `1px solid ${C.glassBorder}`,
                color: m.role==="user" ? C.navyDark : C.white,
                ...T.body, fontSize:14, lineHeight:1.65, fontWeight: m.role==="user" ? 600 : 400,
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🏋️</div>
              <div style={{ background:C.navyMid, border:`1px solid ${C.glassBorder}`, borderRadius:"16px 16px 16px 4px", padding:"14px 18px" }}>
                <div className="dot-loader"><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding:"16px 20px", borderTop:`1px solid ${C.glassBorder}`, display:"flex", gap:10, alignItems:"flex-end" }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
            placeholder="Escribe tu pregunta..."
            rows={1} style={{ flex:1, background:"transparent", border:`1px solid ${C.glassBorder}`, borderRadius:10, padding:"10px 14px", color:C.white, ...T.body, fontSize:14, resize:"none", maxHeight:80, overflowY:"auto" }} />
          <button onClick={send} disabled={loading||!input.trim()} style={{
            width:40, height:40, borderRadius:10, border:"none",
            background: loading||!input.trim() ? "#ffffff11" : `linear-gradient(135deg,${C.gold},${C.goldLight})`,
            color: C.navyDark, fontSize:16, cursor: loading?"not-allowed":"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>↑</button>
        </div>
      </div>
    </section>
  );
}

function DashboardSection() {
  const [view, setView] = useState("overview");
  const [selected, setSelected] = useState(null);

  const totalClients = MOCK_CLIENTS.length;
  const avgProgress = Math.round(MOCK_CLIENTS.reduce((a,c)=>a+c.progress,0)/totalClients);
  const totalCheckins = MOCK_CLIENTS.reduce((a,c)=>a+c.checkins,0);

  return (
    <section style={{ padding:"80px 24px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:40 }}>
        <div>
          <div style={{ ...T.body, fontSize:11, fontWeight:700, letterSpacing:4, color:C.gold, marginBottom:8, textTransform:"uppercase" }}>Panel de Control</div>
          <h2 style={{ ...T.display, fontSize:"clamp(32px,5vw,56px)", color:C.white, fontWeight:700 }}>Dashboard Admin</h2>
        </div>
        <div style={{ background:C.glass, border:`1px solid ${C.glassBorder}`, borderRadius:10, padding:"6px", display:"flex", gap:4 }}>
          {["overview","clients"].map(v => (
            <button key={v} onClick={()=>setView(v)} style={{
              ...T.body, fontSize:13, fontWeight:600, padding:"8px 20px", borderRadius:8, border:"none", cursor:"pointer",
              background: view===v ? C.gold : "transparent",
              color: view===v ? C.navyDark : C.muted,
              transition:"all .2s",
            }}>{v==="overview"?"Resumen":"Clientes"}</button>
          ))}
        </div>
      </div>

      {view==="overview" && (
        <div>
          {/* KPI cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:20, marginBottom:32 }}>
            {[
              { label:"Clientes Activos", value:totalClients, icon:"👥", color:C.gold },
              { label:"Progreso Promedio", value:`${avgProgress}%`, icon:"📈", color:C.purpleLight },
              { label:"Check-ins Totales", value:totalCheckins, icon:"✅", color:"#4ade80" },
              { label:"Ingresos Est./mes", value:"$641", icon:"💰", color:C.goldLight },
            ].map(k => (
              <div key={k.label} style={{ background:C.glass, border:`1px solid ${C.glassBorder}`, borderRadius:14, padding:"24px 20px" }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{k.icon}</div>
                <div style={{ ...T.display, fontSize:38, color:k.color, fontWeight:700, lineHeight:1 }}>{k.value}</div>
                <div style={{ ...T.body, color:C.muted, fontSize:13, marginTop:6 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Recent clients */}
          <div style={{ background:C.glass, border:`1px solid ${C.glassBorder}`, borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.glassBorder}` }}>
              <h3 style={{ ...T.body, color:C.white, fontWeight:700, fontSize:15 }}>Clientes Recientes</h3>
            </div>
            {MOCK_CLIENTS.slice(0,4).map(c => (
              <div key={c.id} className="client-row" style={{ padding:"16px 24px", borderBottom:`1px solid ${C.glassBorder}22`, display:"flex", alignItems:"center", gap:16, cursor:"pointer" }}
                onClick={()=>{ setSelected(c); setView("clients"); }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", ...T.body, fontWeight:800, color:C.white, fontSize:14, flexShrink:0 }}>
                  {c.name[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ ...T.body, color:C.white, fontWeight:600, fontSize:14 }}>{c.name}</div>
                  <div style={{ ...T.body, color:C.muted, fontSize:12, marginTop:2 }}>{c.goal}</div>
                </div>
                <div style={{ minWidth:120 }}>
                  <ProgressBar value={c.progress} />
                  <div style={{ ...T.body, color:C.muted, fontSize:11, marginTop:4, textAlign:"right" }}>{c.progress}% completado</div>
                </div>
                <Badge plan={c.plan} />
              </div>
            ))}
          </div>
        </div>
      )}

      {view==="clients" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap:20 }}>
            <div style={{ background:C.glass, border:`1px solid ${C.glassBorder}`, borderRadius:16, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.glassBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3 style={{ ...T.body, color:C.white, fontWeight:700, fontSize:15 }}>Todos los Clientes ({MOCK_CLIENTS.length})</h3>
              </div>
              {MOCK_CLIENTS.map(c => (
                <div key={c.id} className="client-row" onClick={()=>setSelected(selected?.id===c.id?null:c)}
                  style={{ padding:"16px 20px", borderBottom:`1px solid ${C.glassBorder}22`, display:"flex", alignItems:"center", gap:14, cursor:"pointer",
                    background: selected?.id===c.id ? `${C.gold}11` : "transparent" }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", ...T.body, fontWeight:800, color:C.white, fontSize:15, flexShrink:0 }}>
                    {c.name[0]}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                      <span style={{ ...T.body, color:C.white, fontWeight:600, fontSize:14 }}>{c.name}</span>
                      <Badge plan={c.plan} />
                    </div>
                    <ProgressBar value={c.progress} />
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ ...T.body, color:C.gold, fontWeight:700, fontSize:15 }}>{c.progress}%</div>
                    <div style={{ ...T.body, color:C.muted, fontSize:11 }}>{c.checkins} check-ins</div>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div style={{ background:C.glass, border:`1px solid ${C.gold}44`, borderRadius:16, padding:24, height:"fit-content" }} className="fade-up">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                  <div style={{ width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", ...T.display, fontWeight:700, color:C.white, fontSize:22 }}>{selected.name[0]}</div>
                  <button onClick={()=>setSelected(null)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18 }}>✕</button>
                </div>
                <h3 style={{ ...T.body, color:C.white, fontWeight:700, fontSize:17, marginBottom:4 }}>{selected.name}</h3>
                <div style={{ marginBottom:20 }}><Badge plan={selected.plan} /></div>

                {[["Meta",selected.goal],["Miembro desde",selected.joined],["Check-ins",`${selected.checkins} realizados`]].map(([l,v])=>(
                  <div key={l} style={{ marginBottom:14 }}>
                    <div style={{ ...T.body, color:C.muted, fontSize:11, letterSpacing:1, marginBottom:4, textTransform:"uppercase" }}>{l}</div>
                    <div style={{ ...T.body, color:C.white, fontSize:14 }}>{v}</div>
                  </div>
                ))}

                <div style={{ marginBottom:8 }}>
                  <div style={{ ...T.body, color:C.muted, fontSize:11, letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Progreso General</div>
                  <ProgressBar value={selected.progress} />
                  <div style={{ ...T.body, color:C.gold, fontWeight:700, fontSize:22, marginTop:6 }}>{selected.progress}%</div>
                </div>

                <button className="btn-gold" style={{ width:"100%", marginTop:16, padding:"11px", background:C.gold, color:C.navyDark, border:"none", borderRadius:8, ...T.body, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  📩 Enviar Mensaje
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────
export default function BreilinFit() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id:"home", label:"Inicio" },
    { id:"plans", label:"Planes" },
    { id:"chat", label:"Coach IA" },
    { id:"dashboard", label:"Dashboard" },
  ];

  const navigate = (p) => { setPage(p); setMenuOpen(false); window.scrollTo({top:0,behavior:"smooth"}); };

  return (
    <div style={{ minHeight:"100vh", background:C.navyDark, color:C.white }}>
      <style>{GLOBAL_CSS}</style>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:`${C.navyDark}ee`, backdropFilter:"blur(16px)", borderBottom:`1px solid ${C.glassBorder}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={()=>navigate("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>🏋️</span>
            <span style={{ ...T.display, fontSize:22, color:C.gold, fontWeight:700, letterSpacing:2 }}>BREILIN FIT</span>
          </button>
          <div style={{ display:"flex", gap:8 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={()=>navigate(n.id)} className="nav-link" style={{
                background: page===n.id ? `${C.gold}18` : "transparent",
                border: `1px solid ${page===n.id ? C.gold+"44" : "transparent"}`,
                color: page===n.id ? C.gold : C.muted,
                borderRadius:8, padding:"7px 16px", cursor:"pointer", ...T.body, fontSize:13, fontWeight:600,
              }}>{n.label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ paddingTop:64 }}>
        {page==="home"      && <><HeroSection onNav={navigate}/><PlansSection onNav={navigate}/></>}
        {page==="plans"     && <PlansSection onNav={navigate}/>}
        {page==="chat"      && <ChatSection/>}
        {page==="dashboard" && <DashboardSection/>}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${C.glassBorder}`, padding:"40px 24px", textAlign:"center", marginTop:40 }}>
        <div style={{ ...T.display, fontSize:28, color:C.gold, fontWeight:700, letterSpacing:3, marginBottom:8 }}>BREILIN FIT</div>
        <p style={{ ...T.body, color:C.muted, fontSize:13 }}>© 2025 Breilin Fit · Online Fitness Coaching · Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
