import { useState, useEffect, useCallback, useRef } from "react";

import { LOGO_SRC } from "./assets/logo_b64.js";

// â”€â”€â”€ REGIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const REGIONS = [
  { id: "alaska", name: "Alaska", x: 8, y: 18, r: 3.8, strategic: false },
  { id: "canada", name: "Canada", x: 20, y: 16, r: 4.8, strategic: false },
  { id: "usa", name: "USA", x: 20, y: 28, r: 5.5, strategic: true },
  { id: "mexico", name: "Mexico", x: 16, y: 38, r: 3.2, strategic: false },
  { id: "caribb", name: "Caribbean", x: 26, y: 38, r: 2.8, strategic: false },
  { id: "colombia", name: "Colombia", x: 23, y: 50, r: 3.2, strategic: false },
  { id: "brazil", name: "Brazil", x: 29, y: 60, r: 5.5, strategic: true },
  { id: "argentina", name: "Argentina", x: 25, y: 73, r: 3.8, strategic: false },
  { id: "greenland", name: "Greenland", x: 38, y: 9, r: 3.8, strategic: false },
  { id: "uk", name: "UK", x: 49, y: 19, r: 2.8, strategic: false },
  { id: "france", name: "France", x: 52, y: 25, r: 3.2, strategic: false },
  { id: "germany", name: "Germany", x: 56, y: 21, r: 3.2, strategic: false },
  { id: "poland", name: "Poland", x: 60, y: 21, r: 2.8, strategic: false },
  { id: "ukraine", name: "Ukraine", x: 64, y: 23, r: 3.2, strategic: false },
  { id: "spain", name: "Iberia", x: 49, y: 29, r: 3.2, strategic: false },
  { id: "italy", name: "Italy", x: 56, y: 29, r: 2.8, strategic: false },
  { id: "balkans", name: "Balkans", x: 60, y: 29, r: 2.8, strategic: false },
  { id: "scandinavia", name: "Scandinavia", x: 57, y: 13, r: 3.2, strategic: false },
  { id: "russia_w", name: "W.Russia", x: 69, y: 17, r: 4.8, strategic: true },
  { id: "russia_e", name: "E.Russia", x: 88, y: 16, r: 5.5, strategic: true },
  { id: "russia_s", name: "Caucasus", x: 69, y: 28, r: 3.2, strategic: false },
  { id: "kazakhstan", name: "Kazakhstan", x: 77, y: 26, r: 3.8, strategic: false },
  { id: "siberia", name: "Siberia", x: 94, y: 12, r: 4.8, strategic: false },
  { id: "turkey", name: "Turkey", x: 64, y: 31, r: 3.2, strategic: false },
  { id: "iran", name: "Iran", x: 72, y: 35, r: 3.8, strategic: true },
  { id: "iraq_syria", name: "Iraq/Syria", x: 67, y: 37, r: 3.2, strategic: false },
  { id: "arabia", name: "Arabia", x: 69, y: 43, r: 3.8, strategic: false },
  { id: "israel", name: "Levant", x: 64, y: 37, r: 2.3, strategic: false },
  { id: "n_africa", name: "N.Africa", x: 54, y: 39, r: 4.8, strategic: false },
  { id: "w_africa", name: "W.Africa", x: 49, y: 51, r: 3.8, strategic: false },
  { id: "e_africa", name: "E.Africa", x: 65, y: 53, r: 3.8, strategic: false },
  { id: "congo", name: "Congo", x: 59, y: 59, r: 3.8, strategic: false },
  { id: "s_africa", name: "S.Africa", x: 59, y: 73, r: 3.8, strategic: false },
  { id: "india", name: "India", x: 83, y: 41, r: 4.8, strategic: true },
  { id: "pakistan", name: "Pakistan", x: 79, y: 35, r: 3.2, strategic: false },
  { id: "se_asia", name: "SE Asia", x: 99, y: 49, r: 3.8, strategic: false },
  { id: "indonesia", name: "Indonesia", x: 107, y: 59, r: 3.8, strategic: false },
  { id: "china_n", name: "N.China", x: 102, y: 29, r: 4.8, strategic: true },
  { id: "china_s", name: "S.China", x: 103, y: 41, r: 4.3, strategic: true },
  { id: "mongolia", name: "Mongolia", x: 99, y: 21, r: 3.8, strategic: false },
  { id: "korea", name: "Korea", x: 112, y: 27, r: 2.8, strategic: false },
  { id: "japan", name: "Japan", x: 117, y: 25, r: 2.8, strategic: true },
  { id: "taiwan", name: "Taiwan", x: 112, y: 37, r: 2.3, strategic: false },
  { id: "australia", name: "Australia", x: 117, y: 67, r: 5.5, strategic: false },
  { id: "nz", name: "New Zealand", x: 127, y: 77, r: 2.8, strategic: false },
  { id: "pacific_i", name: "Pacific Is.", x: 134, y: 47, r: 2.8, strategic: false },
];

const ADJ = {};
const ADJ_RAW = {
  alaska: ["canada", "siberia", "russia_e"],
  canada: ["alaska", "usa", "greenland"],
  usa: ["canada", "mexico", "caribb"],
  mexico: ["usa", "caribb", "colombia"],
  caribb: ["usa", "mexico", "colombia"],
  colombia: ["mexico", "caribb", "brazil"],
  brazil: ["colombia", "argentina", "w_africa"],
  argentina: ["brazil"],
  greenland: ["canada", "uk", "scandinavia"],
  uk: ["greenland", "france", "germany", "scandinavia"],
  france: ["uk", "germany", "spain", "italy"],
  germany: ["uk", "france", "poland", "italy", "scandinavia"],
  poland: ["germany", "ukraine", "russia_w"],
  ukraine: ["poland", "russia_w", "russia_s", "balkans", "turkey"],
  spain: ["france", "n_africa"],
  italy: ["france", "germany", "balkans", "n_africa"],
  balkans: ["italy", "ukraine", "turkey", "n_africa"],
  scandinavia: ["uk", "germany", "russia_w"],
  russia_w: ["poland", "ukraine", "russia_s", "russia_e", "kazakhstan", "scandinavia"],
  russia_e: ["russia_w", "siberia", "kazakhstan", "mongolia", "china_n", "alaska"],
  russia_s: ["ukraine", "russia_w", "turkey", "iran", "kazakhstan"],
  kazakhstan: ["russia_w", "russia_e", "russia_s", "iran", "pakistan", "mongolia", "china_n"],
  siberia: ["russia_e", "alaska"],
  turkey: ["balkans", "ukraine", "russia_s", "iraq_syria", "iran", "israel"],
  iran: ["russia_s", "turkey", "iraq_syria", "arabia", "pakistan", "kazakhstan"],
  iraq_syria: ["turkey", "iran", "israel", "arabia", "n_africa"],
  arabia: ["iraq_syria", "iran", "israel", "e_africa"],
  israel: ["turkey", "iraq_syria", "arabia", "n_africa"],
  n_africa: ["spain", "italy", "balkans", "israel", "iraq_syria", "w_africa", "e_africa"],
  w_africa: ["n_africa", "e_africa", "congo", "brazil"],
  e_africa: ["n_africa", "w_africa", "congo", "arabia", "s_africa"],
  congo: ["w_africa", "e_africa", "s_africa"],
  s_africa: ["congo", "e_africa"],
  india: ["pakistan", "iran", "se_asia", "china_s"],
  pakistan: ["iran", "india", "kazakhstan", "china_n"],
  se_asia: ["india", "china_s", "indonesia"],
  indonesia: ["se_asia", "australia"],
  china_n: ["russia_e", "mongolia", "korea", "china_s", "kazakhstan", "pakistan"],
  china_s: ["china_n", "korea", "taiwan", "se_asia", "india"],
  mongolia: ["russia_e", "kazakhstan", "china_n"],
  korea: ["china_n", "china_s", "japan"],
  japan: ["korea", "taiwan", "pacific_i"],
  taiwan: ["china_s", "japan"],
  australia: ["indonesia", "nz", "pacific_i"],
  nz: ["australia", "pacific_i"],
  pacific_i: ["japan", "australia", "nz"],
};
Object.keys(ADJ_RAW).forEach(a => { ADJ[a] = [...(ADJ_RAW[a] || [])]; });
Object.keys(ADJ_RAW).forEach(a => {
  ADJ_RAW[a].forEach(b => {
    if (!ADJ[b]) ADJ[b] = [];
    if (!ADJ[b].includes(a)) ADJ[b].push(a);
  });
});

const FD = {
  NATO: { name: "NATO Alliance", short: "NATO", color: "#3a9eff", flag: "🇺🇸", atk: 1.15, def: 1.0, nukes: 14, income: 22, desc: "Technological superiority & economic dominance.", starts: { usa: 180, canada: 100, uk: 90, france: 110, germany: 120, poland: 80, spain: 60, italy: 70, scandinavia: 70, greenland: 30, australia: 60, brazil: 50 } },
  EAST: { name: "Eastern Alliance", short: "EAST", color: "#ff3333", flag: "🇷🇺", atk: 1.05, def: 1.25, nukes: 18, income: 17, desc: "Vast Eurasian territory & nuclear arsenal.", starts: { russia_w: 200, russia_e: 160, russia_s: 80, siberia: 100, ukraine: 100, kazakhstan: 80, iran: 90, iraq_syria: 60, arabia: 50 } },
  CHINA: { name: "Pacific Pact", short: "CHINA", color: "#ffcc00", flag: "🇨🇳", atk: 1.10, def: 1.10, nukes: 10, income: 20, desc: "World's largest army & Pacific dominance.", starts: { china_n: 220, china_s: 180, mongolia: 70, korea: 80, taiwan: 60, se_asia: 90, indonesia: 70, japan: 80, pacific_i: 40 } },
  NEUTRAL: { name: "Neutral", short: "NEU", color: "#2a3d50", flag: "⚪", atk: 0.8, def: 0.85, nukes: 0, income: 0, desc: "", starts: {} },
};

const GAME_CONFIG = {
  AI_ATTACK_RATIO: 0.62,
  AI_STRATEGIC_BONUS: 28,
  AI_NEUTRAL_BONUS: 20,
  AI_PLAYER_FACTION_BONUS: 25,
  AI_WEAK_DEFENDER_BONUS: 28,
  AI_SURROUND_BONUS: 10,
  AI_EXPOSED_PENALTY: 3,
  AI_MIN_TROOPS_CONSIDER: 18,
  AI_MIN_TROOPS_MOVE: 22,
  PLAYER_REINFORCE_RATIO: 0.42,
  PLAYER_ATTACK_RATIO: 0.65,
  MIN_TROOPS_TO_SELECT: 20,
  NUKE_SURVIVOR_RATIO: 0.07,
  NUKE_TENSION_INC: 22,
  WIN_TENSION_INC: 4
};

function initGame() {
  const rs = {};
  REGIONS.forEach(r => { rs[r.id] = { faction: "NEUTRAL", troops: Math.floor(Math.random() * 18) + 6, bombed: false }; });
  ["NATO", "EAST", "CHINA"].forEach(fk => {
    Object.entries(FD[fk].starts).forEach(([rid, t]) => { if (rs[rid]) rs[rid] = { faction: fk, troops: t, bombed: false }; });
  });
  const fs = {};
  ["NATO", "EAST", "CHINA"].forEach(fk => { fs[fk] = { nukes: FD[fk].nukes, eco: 100 }; });
  return { rs, fs };
}

function doCombat(a, d, ab, db) {
  const ar = a * ab * (0.7 + Math.random() * 0.6), dr = d * db * (0.7 + Math.random() * 0.6);
  const win = ar > dr;
  return { win, al: win ? Math.floor(a * (0.18 + Math.random() * 0.22)) : Math.floor(a * (0.35 + Math.random() * 0.3)), dl: win ? Math.floor(d * (0.55 + Math.random() * 0.35)) : Math.floor(d * (0.12 + Math.random() * 0.2)) };
}

function aiScore(fromId, toId, fromD, toD, aiKey, state, pf) {
  let s = 0;
  const atk = Math.floor(fromD.troops * GAME_CONFIG.AI_ATTACK_RATIO);
  s += (atk / Math.max(1, toD.troops)) * 22;
  const reg = REGIONS.find(r => r.id === toId);
  if (reg?.strategic) s += GAME_CONFIG.AI_STRATEGIC_BONUS;
  if (toD.faction === "NEUTRAL") s += GAME_CONFIG.AI_NEUTRAL_BONUS;
  if (toD.faction === pf) { s += GAME_CONFIG.AI_PLAYER_FACTION_BONUS; if (toD.troops < 50) s += GAME_CONFIG.AI_WEAK_DEFENDER_BONUS; }
  const surround = (ADJ[toId] || []).filter(x => state[x]?.faction === aiKey).length;
  s += surround * GAME_CONFIG.AI_SURROUND_BONUS;
  const exposed = (ADJ[fromId] || []).filter(x => state[x]?.faction !== aiKey).length;
  s -= exposed * GAME_CONFIG.AI_EXPOSED_PENALTY;
  return s;
}

function runAI(aiKey, state, pf) {
  const myIds = Object.entries(state).filter(([, v]) => v.faction === aiKey).map(([k]) => k);
  const moves = [];
  myIds.forEach(fid => {
    const fd = state[fid];
    if (fd.troops < GAME_CONFIG.AI_MIN_TROOPS_CONSIDER) return;
    (ADJ[fid] || []).forEach(tid => {
      const td = state[tid];
      if (!td || td.faction === aiKey) return;
      moves.push({ from: fid, to: tid, score: aiScore(fid, tid, fd, td, aiKey, state, pf) });
    });
  });
  moves.sort((a, b) => b.score - a.score);
  const max = aiKey === "CHINA" ? 5 : aiKey === "EAST" ? 3 : 4;
  const used = new Set(); const out = [];
  for (const m of moves) {
    if (out.length >= max || used.has(m.from)) continue;
    if (state[m.from].troops < GAME_CONFIG.AI_MIN_TROOPS_MOVE) continue;
    used.add(m.from); out.push(m);
  }
  return out;
}

null

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SPLASH SCREEN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function SplashScreen({ onDone }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const doneRef = useRef(false);
  const [phase, setPhase] = useState(0); // 0=black, 1=dust-in, 2=reveal, 3=hold, 4=dust-out, 5=done

  const safeDone = useCallback(() => {
    if (!doneRef.current) { doneRef.current = true; onDone(); }
  }, [onDone]);

  useEffect(() => {
    const totalDuration = 4200; // ms
    // phase timeline: 0â†’300 black, 300â†’1200 dust-in, 1200â†’2200 reveal+hold, 2200â†’3800 dust-out, 3800â†’4200 fade
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3200),
      setTimeout(() => { setPhase(5); safeDone(); }, 4400),
      // Fallback: force completion after 6s even if animation stalls
      setTimeout(() => { safeDone(); }, 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [safeDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    const W = canvas.width, H = canvas.height;
    const PARTICLE_COUNT = 100;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2.5 + 0.4,
      opacity: Math.random() * 0.7 + 0.2,
      hue: Math.random() * 40 + 180,
    }));

    function drawDust(alpha) {
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,65%,${p.opacity * alpha})`;
        ctx.fill();
      });
    }

    function loop() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      const t = frame / 60;
      let dustAlpha = 0;
      if (phase === 1) dustAlpha = Math.min(1, t * 1.2);
      if (phase === 2 || phase === 3) dustAlpha = 0.55 + Math.sin(t * 1.5) * 0.2;
      if (phase === 4) dustAlpha = Math.max(0, 0.7 - (frame % 120) / 120 * 1.2);
      drawDust(dustAlpha);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  const logoVisible = phase >= 2 && phase <= 4;
  const logoOpacity = phase === 2 ? Math.min(1, (Date.now() % 1000) / 800) : phase === 4 ? 0.3 : 1;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, overflow: "hidden",
    }}>
      <canvas ref={canvasRef} width={800} height={500}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {/* Mist glow layers */}
      {(phase >= 1 && phase <= 4) && <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%,rgba(30,120,200,0.12),transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 40% 40% at 50% 50%,rgba(100,200,255,0.07),transparent)", pointerEvents: "none" }} />
      </>}

      {/* Logo + Name */}
      <div style={{
        position: "relative", zIndex: 2, textAlign: "center",
        opacity: phase === 2 ? undefined : phase === 3 ? 1 : phase === 4 ? 0.4 : 0,
        transition: "opacity 0.6s ease",
        animation: logoVisible ? "logoReveal 0.8s ease forwards" : undefined,
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
          @keyframes logoReveal{from{opacity:0;transform:scale(0.88) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
          @keyframes dustGlow{0%,100%{filter:drop-shadow(0 0 18px #3af)drop-shadow(0 0 40px #09f)}50%{filter:drop-shadow(0 0 30px #5cf)drop-shadow(0 0 60px #1af)}}
          @keyframes nameFlicker{0%,100%{opacity:1;text-shadow:0 0 20px #3af,0 0 40px #09f,0 0 80px #07d}50%{opacity:0.85;text-shadow:0 0 35px #5cf,0 0 70px #1af,0 0 100px #09f}}
          @keyframes taglineIn{from{opacity:0;letter-spacing:12px}to{opacity:0.6;letter-spacing:6px}}
        `}</style>

        {/* Logo image with glow */}
        <div style={{
          width: 180, height: 180, margin: "0 auto 16px",
          animation: logoVisible ? "dustGlow 2s ease-in-out infinite" : undefined,
          position: "relative",
        }}>
          {/* Multiple glow rings behind logo */}
          <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle,rgba(58,175,255,0.25),transparent 70%)", animation: logoVisible ? "dustGlow 1.5s ease-in-out infinite" : undefined }} />
          <img src={LOGO_SRC} alt="SOFTCURSE"
            style={{ width: "100%", height: "100%", objectFit: "contain", position: "relative", zIndex: 1, mixBlendMode: "screen" }} />
        </div>

        {/* Studio name */}
        <div style={{
          fontFamily: "'Cinzel',serif",
          fontSize: "clamp(28px,5vw,48px)",
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: 12,
          animation: logoVisible ? "nameFlicker 2s ease-in-out infinite" : undefined,
        }}>SOFTCURSE</div>

        {/* Subtitle */}
        <div style={{
          fontSize: 11, letterSpacing: 6, color: "#5599bb",
          marginTop: 6,
          fontFamily: "'Courier New',monospace",
          animation: logoVisible ? "taglineIn 1.2s 0.4s ease forwards" : undefined,
          opacity: 0,
        }}>STUDIO Â· PRESENTS</div>
      </div>

      {/* Bottom vignette */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(transparent,#000)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "linear-gradient(#000,transparent)", pointerEvents: "none" }} />
    </div>
  );
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INTRO TIMELINE SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const TIMELINE_EVENTS = [
  { year: "2014", icon: "⚔️", color: "#ff6644", title: "Ukraine Crisis", desc: "Russia annexes Crimea. NATO's eastern flank erupts. A frozen conflict begins bleeding across Eastern Europe." },
  { year: "2015", icon: "💣", color: "#ff4422", title: "Syria Collapses", desc: "Russian airstrikes prop up Assad. ISIS seizes territory. 5 million refugees flood Europe, fracturing alliances." },
  { year: "2016", icon: "🗳️", color: "#ffaa22", title: "Democratic Fractures", desc: "Brexit shocks the West. Populist movements sweep Europe and America. NATO's unity begins to crack." },
  { year: "2017", icon: "🚀", color: "#ff3300", title: "North Korea Nukes", desc: "Kim Jong-un test-fires ICBMs. Pyongyang achieves nuclear strike capability. The Pacific holds its breath." },
  { year: "2019", icon: "📡", color: "#aa44ff", title: "Cyber Warfare Age", desc: "State-sponsored hacking paralyzes power grids, elections, hospitals. Attribution becomes an act of war." },
  { year: "2020", icon: "🦠", color: "#44bbff", title: "Global Pandemic", desc: "COVID-19 kills millions. Supply chains collapse. US-China blame war accelerates toward open hostility." },
  { year: "2021", icon: "🇦🇫", color: "#ffcc00", title: "Kabul Falls", desc: "US withdraws from Afghanistan. Taliban returns in hours. America's credibility as a guarantor shatters globally." },
  { year: "2022", icon: "🔥", color: "#ff2200", title: "Ukraine Invasion", desc: "Russia launches full-scale war. Kyiv holds. 200,000+ dead. NATO floods arms eastward. Nuclear alerts rise." },
  { year: "2023", icon: "💥", color: "#ff4400", title: "Middle East Erupts", desc: "October 7th Hamas attack. Gaza war engulfs the region. Iran proxies strike US bases 160+ times." },
  { year: "2024", icon: "⚡", color: "#ffee33", title: "Alliances Shatter", desc: "Taiwan Strait incidents multiply. South China Sea skirmishes. AUKUS vs BRICS blocs harden into cold war 2.0." },
  { year: "2025", icon: "☢️", color: "#ff3300", title: "Point of No Return", desc: "Tactical nuclear device detonated in a conflict zone. UN Security Council paralyzed. The countdown begins." },
  { year: "2026", icon: "🌍", color: "#ff0000", title: "WORLD WAR III", desc: "Three superpowers mobilize. Borders dissolve in fire. The fate of civilization rests in the hands of commanders like you." },
];

function IntroScreen({ onDone }) {
  const [visibleIdx, setVisibleIdx] = useState(-1);
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (skipped) return;
    let i = 0;
    const interval = setInterval(() => {
      setVisibleIdx(i);
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      i++;
      if (i >= TIMELINE_EVENTS.length) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 600);
      }
    }, 620);
    return () => clearInterval(interval);
  }, [skipped]);

  const handleSkip = () => { setSkipped(true); setVisibleIdx(TIMELINE_EVENTS.length - 1); setTimeout(() => setDone(true), 200); };

  return (
    <div style={{
      background: "#020810", height: "100vh", maxHeight: "100vh", display: "flex", flexDirection: "column",
      fontFamily: "'Courier New',monospace", color: "#c8d8e8", overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
        @keyframes evtIn{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
        @keyframes scanI{0%{top:-3%}100%{top:103%}}
        @keyframes pulse3{0%,100%{opacity:0.6}50%{opacity:1}}
        .evt{animation:evtIn 0.35s ease forwards;}
        .scan3{position:absolute;left:0;width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(58,158,255,0.1),transparent);animation:scanI 5s linear infinite;pointer-events:none;}
      `}</style>
      <div className="scan3" />

      {/* Header */}
      <div style={{
        padding: "20px 40px 14px", borderBottom: "1px solid #0d2030",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        background: "linear-gradient(180deg,#030c18,#020810)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={LOGO_SRC} alt="" style={{ width: 38, height: 38, objectFit: "contain", filter: "drop-shadow(0 0 8px #3af)" }} />
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 5, color: "#3a9eff" }}>SOFTCURSE STUDIO</div>
            <div style={{ fontSize: 8, color: "#2a4a5a", letterSpacing: 4, marginTop: 1 }}>PRESENTS</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 900, letterSpacing: 5, color: "#e0eeff", lineHeight: 1 }}>WORLD WAR III</div>
          <div style={{ fontSize: 8, letterSpacing: 4, color: "#2a5a6a", marginTop: 3 }}>HOW WE GOT HERE</div>
        </div>
      </div>

      {/* Timeline */}
      <div ref={containerRef} style={{ flex: 1, overflowY: "auto", padding: "20px 40px", position: "relative" }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: 92, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg,transparent,#1a3a4a 10%,#1a3a4a 90%,transparent)" }} />

        {TIMELINE_EVENTS.map((evt, i) => (
          <div key={i} className={i <= visibleIdx ? "evt" : ""} style={{
            display: "flex", gap: 0, marginBottom: 18, opacity: i <= visibleIdx ? 1 : 0,
            alignItems: "flex-start", position: "relative",
          }}>
            {/* Year */}
            <div style={{ width: 52, textAlign: "right", paddingTop: 3, flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: "bold", color: evt.color, letterSpacing: 1 }}>{evt.year}</div>
            </div>
            {/* Node */}
            <div style={{ width: 42, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 2, flexShrink: 0, position: "relative", zIndex: 1 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: `${evt.color}18`, border: `1px solid ${evt.color}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12,
                boxShadow: i === visibleIdx ? `0 0 12px ${evt.color}66` : "none",
                animation: i === visibleIdx ? "pulse3 1s infinite" : "none",
              }}>{evt.icon}</div>
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div style={{ fontSize: 11, fontWeight: "bold", color: evt.color, marginBottom: 3, letterSpacing: 1 }}>{evt.title}</div>
              <div style={{ fontSize: 9, color: "#7a9aaa", lineHeight: 1.7 }}>{evt.desc}</div>
            </div>
          </div>
        ))}

        {/* Final warning */}
        {done && (
          <div style={{
            textAlign: "center", marginTop: 10, padding: "20px", marginBottom: "40px",
            border: "1px solid #ff220033", borderRadius: 4,
            background: "linear-gradient(135deg,rgba(20,0,0,0.8),rgba(40,5,5,0.5))",
            animation: "evtIn 0.5s ease",
          }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>âš”ï¸</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, letterSpacing: 5, color: "#ff4422", marginBottom: 6 }}>THE WORLD BURNS</div>
            <div style={{ fontSize: 9, color: "#886655", lineHeight: 1.9, marginBottom: 20 }}>
              Every conflict, every miscalculation, every broken treaty led to this moment.<br />
              Three superpowers now control the fate of civilization.<br />
              <strong style={{ color: "#cc6633" }}>You are one of them.</strong>
            </div>
            <button onClick={onDone} style={{
              background: "linear-gradient(135deg,#cc2200,#880000)",
              color: "#fff", border: "none", padding: "13px 40px",
              fontSize: 10, fontWeight: "bold", letterSpacing: 5,
              cursor: "pointer", borderRadius: 3, fontFamily: "'Courier New',monospace",
              boxShadow: "0 0 20px #ff220044",
            }}>
              TAKE COMMAND â†’
            </button>
          </div>
        )}
      </div>

      {/* Skip button */}
      {!done && (
        <div style={{ padding: "10px 40px", borderTop: "1px solid #0d2030", display: "flex", justifyContent: "flex-end", background: "#020810", flexShrink: 0 }}>
          <button onClick={handleSkip} style={{ background: "transparent", color: "#2a4a5a", border: "1px solid #0d2030", padding: "6px 16px", fontSize: 8, letterSpacing: 2, cursor: "pointer", borderRadius: 2, fontFamily: "'Courier New',monospace" }}>
            SKIP â­
          </button>
        </div>
      )}
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN GAME
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// WEB AUDIO SOUND ENGINE
// All sounds synthesized via Web Audio API â€” no external files needed
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let ambientNodes = [];
  let muted = false;
  let ambientRunning = false;

  function getCtx() {
    if (!ctx) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        ctx = new AudioCtx();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.7;
        masterGain.connect(ctx.destination);
      } catch (e) {
        console.warn('AudioContext unavailable:', e.message);
        return null;
      }
    }
    try { if (ctx && ctx.state === 'suspended') ctx.resume(); } catch (e) { }
    return ctx;
  }

  function now() { return getCtx().currentTime; }

  function osc(freq, type, start, dur, gainVal, dest, detune = 0) {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest || masterGain);
    o.start(start); o.stop(start + dur + 0.01);
    return { o, g };
  }

  function noise(dur, gainVal, filterFreq, dest) {
    const c = getCtx();
    const bufSize = c.sampleRate * dur;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = filterFreq;
    filt.Q.value = 1.2;
    const g = c.createGain();
    g.gain.setValueAtTime(gainVal, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(filt); filt.connect(g); g.connect(dest || masterGain);
    src.start(); src.stop(c.currentTime + dur);
  }

  function reverb(wet = 0.4) {
    const c = getCtx();
    const conv = c.createConvolver();
    const dur = 2, decay = 2;
    const rate = c.sampleRate;
    const len = rate * dur;
    const buf = c.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    conv.buffer = buf;
    const dryG = c.createGain(); dryG.gain.value = 1 - wet;
    const wetG = c.createGain(); wetG.gain.value = wet;
    dryG.connect(masterGain);
    wetG.connect(conv); conv.connect(masterGain);
    return { dry: dryG, wet: wetG };
  }

  const sounds = {

    // UI click â€” crisp tactile tick
    click() {
      if (muted) return;
      const c = getCtx(), t = now();
      osc(1200, 'sine', t, 0.06, 0.18);
      osc(800, 'sine', t, 0.04, 0.08);
    },

    // Select territory â€” military radio blip
    select() {
      if (muted) return;
      const c = getCtx(), t = now();
      osc(880, 'square', t, 0.04, 0.12);
      osc(1100, 'square', t + 0.04, 0.04, 0.08);
    },

    // Reinforce â€” marching rhythm thud
    reinforce() {
      if (muted) return;
      const c = getCtx(), t = now();
      noise(0.12, 0.3, 120);
      noise(0.08, 0.2, 100);
      osc(80, 'sine', t, 0.15, 0.4);
    },

    // Attack launch â€” missile whoosh
    attackLaunch() {
      if (muted) return;
      const c = getCtx(), t = now();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(400, t);
      o.frequency.exponentialRampToValueAtTime(80, t + 0.35);
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.4);
      noise(0.3, 0.15, 300);
    },

    // Victory capture â€” triumphant fanfare
    capture() {
      if (muted) return;
      const t = now();
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => osc(f, 'triangle', t + i * 0.1, 0.3, 0.22));
      noise(0.4, 0.1, 2000);
    },

    // Repelled/loss â€” low thud + descend
    repelled() {
      if (muted) return;
      const c = getCtx(), t = now();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(55, t + 0.4);
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.55);
      noise(0.5, 0.25, 80);
    },

    // Explosion â€” layered impact
    explosion() {
      if (muted) return;
      const c = getCtx(), t = now();
      // Low boom
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(60, t);
      o.frequency.exponentialRampToValueAtTime(20, t + 0.6);
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.9);
      // Debris crackle
      noise(0.5, 0.45, 1500);
      noise(0.7, 0.3, 400);
      noise(0.3, 0.2, 3000);
    },

    // Nuclear launch â€” deep horror
    nuclear() {
      if (muted) return;
      const c = getCtx(), t = now();
      // Siren sweep
      const siren = c.createOscillator();
      const sg = c.createGain();
      siren.type = 'sawtooth';
      siren.frequency.setValueAtTime(200, t);
      siren.frequency.linearRampToValueAtTime(800, t + 0.5);
      siren.frequency.linearRampToValueAtTime(200, t + 1.0);
      siren.frequency.linearRampToValueAtTime(800, t + 1.5);
      sg.gain.setValueAtTime(0.4, t);
      sg.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
      siren.connect(sg); sg.connect(masterGain);
      siren.start(t); siren.stop(t + 2.6);
      // Deep rumble
      for (let i = 0; i < 3; i++) {
        noise(2.5 - i * 0.3, 0.5 - i * 0.1, 60 + i * 20);
      }
      // High-pitched shockwave
      osc(4000, 'sine', t, 0.8, 0.15);
      osc(2000, 'sine', t + 0.05, 1.0, 0.2);
    },

    // AI counter-attack â€” enemy alarm
    enemyAttack() {
      if (muted) return;
      const c = getCtx(), t = now();
      // Warning pulses
      [0, 0.18, 0.36].forEach(d => {
        osc(440, 'square', t + d, 0.12, 0.12);
        osc(330, 'square', t + d + 0.06, 0.08, 0.08);
      });
      noise(0.4, 0.15, 200);
    },

    // End turn â€” command confirmed
    endTurn() {
      if (muted) return;
      const t = now();
      osc(660, 'triangle', t, 0.12, 0.15);
      osc(440, 'triangle', t + 0.08, 0.15, 0.12);
      osc(330, 'triangle', t + 0.16, 0.18, 0.10);
    },

    // Victory fanfare â€” full orchestral hit
    victory() {
      if (muted) return;
      const t = now();
      const chord = [261, 329, 392, 523, 659];
      chord.forEach((f, i) => {
        osc(f, 'triangle', t + i * 0.06, 1.5, 0.18);
        osc(f * 2, 'sine', t + i * 0.06, 0.8, 0.08);
      });
      noise(1.5, 0.2, 2000);
      noise(0.3, 0.4, 60);
    },

    // Defeat â€” ominous descent
    defeat() {
      if (muted) return;
      const c = getCtx(), t = now();
      const notes = [392, 349, 311, 261, 196];
      notes.forEach((f, i) => osc(f, 'sawtooth', t + i * 0.22, 0.5, 0.15));
      noise(2.0, 0.2, 80);
    },

    // Tension spike â€” rising alert tone
    tensionSpike() {
      if (muted) return;
      const c = getCtx(), t = now();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(300, t);
      o.frequency.linearRampToValueAtTime(600, t + 0.3);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g); g.connect(masterGain);
      o.start(t); o.stop(t + 0.45);
    },

    // Button hover â€” ultra-subtle
    hover() {
      if (muted) return;
      osc(1400, 'sine', now(), 0.025, 0.04);
    },

    // Menu music â€” drone + atmosphere
    startAmbient() {
      if (muted || ambientRunning) return;
      ambientRunning = true;
      const c = getCtx();
      const baseFreqs = [55, 82.4, 110, 164.8];
      ambientNodes = [];

      baseFreqs.forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        const lfo = c.createOscillator();
        const lfoG = c.createGain();
        o.type = i % 2 === 0 ? 'sine' : 'triangle';
        o.frequency.value = f;
        o.detune.value = (Math.random() - 0.5) * 8;
        lfo.type = 'sine';
        lfo.frequency.value = 0.08 + i * 0.04;
        lfoG.gain.value = 3;
        lfo.connect(lfoG); lfoG.connect(o.frequency);
        g.gain.value = 0.04 - i * 0.006;
        o.connect(g); g.connect(masterGain);
        lfo.start(); o.start();
        ambientNodes.push(o, g, lfo, lfoG);
      });

      // Heartbeat low pulse
      function pulse() {
        if (!ambientRunning || muted) return;
        const t = c.currentTime;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.value = 42;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        o.connect(g); g.connect(masterGain);
        o.start(t); o.stop(t + 0.7);
        setTimeout(pulse, 2200 + Math.random() * 800);
      }
      pulse();

      // Distant rumble stabs
      function rumble() {
        if (!ambientRunning || muted) return;
        noise(0.8 + Math.random() * 0.6, 0.06 + Math.random() * 0.04, 60 + Math.random() * 40);
        setTimeout(rumble, 4000 + Math.random() * 5000);
      }
      setTimeout(rumble, 2000);
    },

    stopAmbient() {
      ambientRunning = false;
      ambientNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) { } });
      ambientNodes = [];
    },

    setMuted(val) {
      muted = val;
      if (masterGain) masterGain.gain.value = val ? 0 : 0.7;
      if (val) sounds.stopAmbient();
    },

    isMuted() { return muted; },
    init() { getCtx(); },
  };

  return sounds;
})();

// Error Boundary â€” catches React rendering crashes and shows fallback UI
class GameErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Game crash:', error, info); }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', { style: { padding: 20, color: '#ff4444', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100vh' } },
        React.createElement('h2', null, 'âš  Game Error'),
        React.createElement('pre', { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 11, color: '#ff8888' } }, this.state.error?.message || 'Unknown error'),
        React.createElement('button', { onClick: () => this.setState({ hasError: false, error: null }), style: { marginTop: 16, padding: '10px 20px', background: '#222', color: '#0af', border: '1px solid #0af', cursor: 'pointer', fontFamily: 'monospace' } }, 'â†» Retry')
      );
    }
    return this.props.children;
  }
}

function WW3GameInner() {
  const [appScreen, setAppScreen] = useState("splash"); // splash | menu | game | gameover
  const [playerFaction, setPlayerFaction] = useState(null);
  const [rs, setRs] = useState({});
  const [fs, setFs] = useState({});
  const [turn, setTurn] = useState(1);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("select");
  const [log, setLog] = useState([]);
  const [nukeMode, setNukeMode] = useState(false);
  const [nukeConfirm, setNukeConfirm] = useState(null);
  const [tension, setTension] = useState(45);
  const [winner, setWinner] = useState(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [flashReg, setFlashReg] = useState(null);
  const [panel, setPanel] = useState("log");
  const [tooltip, setTooltip] = useState(null);

  const [soundMuted, setSoundMuted] = useState(false);

  // Init audio context on first interaction
  const initSound = useCallback(() => { try { AudioEngine.init(); } catch (e) { } }, []);

  const addLog = useCallback((msg, type = "info") => {
    setLog(p => [{ msg, type, id: Date.now() + Math.random() }, ...p].slice(0, 60));
  }, []);

  const getCounts = useCallback(() => {
    const c = { NATO: 0, EAST: 0, CHINA: 0, NEUTRAL: 0 };
    Object.values(rs).forEach(r => { if (c[r.faction] !== undefined) c[r.faction]++; });
    return c;
  }, [rs]);

  const checkWin = useCallback((state) => {
    const total = REGIONS.length;
    const c = { NATO: 0, EAST: 0, CHINA: 0 };
    Object.values(state).forEach(r => { if (c[r.faction] !== undefined) c[r.faction]++; });
    for (const f of ["NATO", "EAST", "CHINA"]) { if (c[f] / total >= 0.55) return f; }
    return null;
  }, []);

  const startGame = (pf) => {
    const { rs: ir, fs: ifs } = initGame();
    setPlayerFaction(pf); setRs(ir); setFs(ifs);
    setTurn(1); setLog([]); setSelected(null); setMode("select");
    setNukeMode(false); setNukeConfirm(null); setTension(45); setWinner(null);
    AudioEngine.stopAmbient();
    AudioEngine.startAmbient();
    setAppScreen("game");
  };

  const doEndTurn = useCallback(() => {
    AudioEngine.endTurn();
    setAiRunning(true); setTurn(t => t + 1);
    setSelected(null); setMode("select"); setNukeMode(false);
  }, []);

  const handleClick = useCallback((regionId) => {
    if (appScreen !== "game" || aiRunning) return;
    const rdata = rs[regionId]; if (!rdata) return;
    if (nukeMode) { if (rdata.faction !== playerFaction) setNukeConfirm(regionId); return; }
    if (mode === "select") {
      if (rdata.faction === playerFaction && rdata.troops > GAME_CONFIG.MIN_TROOPS_TO_SELECT) { AudioEngine.select(); setSelected(regionId); setMode("target"); }
      else { setTooltip(regionId); setTimeout(() => setTooltip(null), 2000); }
    } else {
      if (regionId === selected) { setSelected(null); setMode("select"); return; }
      if (!(ADJ[selected] || []).includes(regionId)) { addLog(`â›” Not adjacent to selected region`, "warn"); return; }
      const fromD = rs[selected], toD = rs[regionId];
      const rname = REGIONS.find(r => r.id === regionId)?.name;
      if (toD.faction === playerFaction) {
        const amt = Math.floor(fromD.troops * GAME_CONFIG.PLAYER_REINFORCE_RATIO);
        setRs(p => ({ ...p, [selected]: { ...p[selected], troops: p[selected].troops - amt }, [regionId]: { ...p[regionId], troops: p[regionId].troops + amt } }));
        AudioEngine.reinforce(); addLog(`ðŸ”„ Reinforced ${rname} +${amt}`, "reinforce");
      } else {
        const atk = Math.floor(fromD.troops * GAME_CONFIG.PLAYER_ATTACK_RATIO);
        AudioEngine.attackLaunch();
        const { win, al, dl } = doCombat(atk, toD.troops, FD[playerFaction].atk, FD[toD.faction]?.def || 1);
        setFlashReg(regionId); setTimeout(() => setFlashReg(null), 600);
        if (win) {
          const rem = Math.max(GAME_CONFIG.WIN_MIN_TROOPS, atk - al);
          setRs(p => {
            const next = { ...p, [selected]: { ...p[selected], troops: Math.max(GAME_CONFIG.WIN_MIN_TROOPS, p[selected].troops - atk) }, [regionId]: { ...p[regionId], faction: playerFaction, troops: rem } };
            const w = checkWin(next); if (w) { setWinner(w); setTimeout(() => setAppScreen("gameover"), 500); }
            return next;
          });
          AudioEngine.capture(); setTimeout(() => AudioEngine.explosion(), 150); addLog(`âœ… Captured ${rname}! (lost ${al}, dealt ${dl})`, "win");
          setTension(t => Math.min(100, t + GAME_CONFIG.WIN_TENSION_INC));
        } else {
          setRs(p => ({ ...p, [selected]: { ...p[selected], troops: Math.max(GAME_CONFIG.WIN_MIN_TROOPS, p[selected].troops - al) }, [regionId]: { ...p[regionId], troops: Math.max(GAME_CONFIG.LOSS_MIN_TROOPS, p[regionId].troops - dl) } }));
          AudioEngine.repelled(); addLog(`â Œ Repelled at ${rname}. Lost ${al}, dealt ${dl}`, "loss");
        }
      }
      setSelected(null); setMode("select");
      doEndTurn();
    }
  }, [appScreen, aiRunning, rs, playerFaction, nukeMode, mode, selected, addLog, checkWin, doEndTurn]);

  const launchNuke = useCallback((tid) => {
    const tname = REGIONS.find(r => r.id === tid)?.name, tf = rs[tid]?.faction;
    setRs(p => ({ ...p, [tid]: { ...p[tid], troops: Math.max(3, Math.floor(p[tid].troops * GAME_CONFIG.NUKE_SURVIVOR_RATIO)), faction: "NEUTRAL", bombed: true } }));
    setFs(p => ({ ...p, [playerFaction]: { ...p[playerFaction], nukes: p[playerFaction].nukes - 1 } }));
    AudioEngine.nuclear(); addLog(`â˜¢ï¸ NUCLEAR STRIKE: ${tname} obliterated!`, "nuke");
    setTension(t => Math.min(100, t + GAME_CONFIG.NUKE_TENSION_INC));
    setNukeMode(false); setNukeConfirm(null);
    doEndTurn();
  }, [rs, playerFaction, addLog, doEndTurn]);

  // AI TURN
  useEffect(() => {
    if (!aiRunning || appScreen !== "game") return;
    const t = setTimeout(() => {
      setRs(prev => {
        let state = { ...prev };
        const enemies = ["NATO", "EAST", "CHINA"].filter(f => f !== playerFaction);
        enemies.forEach(aiKey => {
          const fdef = FD[aiKey];
          const moves = runAI(aiKey, state, playerFaction);
          moves.forEach(m => {
            if (!state[m.from] || !state[m.to]) return;
            const fd = state[m.from], td = state[m.to];
            const atk = Math.floor(fd.troops * 0.6); if (atk < 12) return;
            const { win, al, dl } = doCombat(atk, td.troops, fdef.atk, FD[td.faction]?.def || 1);
            const toName = REGIONS.find(r => r.id === m.to)?.name;
            if (win) {
              state = { ...state, [m.from]: { ...state[m.from], troops: Math.max(8, fd.troops - atk) }, [m.to]: { ...state[m.to], faction: aiKey, troops: Math.max(8, atk - al) } };
              if (td.faction === playerFaction) {
                AudioEngine.enemyAttack(); setLog(p => [{ msg: `${fdef.flag} ${fdef.short} COUNTER-ATTACKED: took ${toName}!`, type: "enemy", id: Date.now() + Math.random() }, ...p].slice(0, 60));
              } else {
                setLog(p => [{ msg: `${fdef.flag} ${fdef.short} seized ${toName}`, type: aiKey === "EAST" ? "east" : "china", id: Date.now() + Math.random() }, ...p].slice(0, 60));
              }
            } else {
              state = { ...state, [m.from]: { ...state[m.from], troops: Math.max(8, fd.troops - al) }, [m.to]: { ...state[m.to], troops: Math.max(5, td.troops - dl) } };
            }
          });
          const owned = Object.entries(state).filter(([, v]) => v.faction === aiKey).map(([k]) => k);
          owned.sort(() => Math.random() - 0.5).slice(0, 4).forEach(rid => {
            state = { ...state, [rid]: { ...state[rid], troops: state[rid].troops + Math.floor(fdef.income / 4) } };
          });
        });
        // Player income
        const po = Object.entries(state).filter(([, v]) => v.faction === playerFaction).map(([k]) => k);
        po.sort(() => Math.random() - 0.5).slice(0, 4).forEach(rid => {
          state = { ...state, [rid]: { ...state[rid], troops: state[rid].troops + Math.floor(FD[playerFaction].income / 4) } };
        });
        // Random event
        if (Math.random() > 0.62) {
          const rr = REGIONS[Math.floor(Math.random() * REGIONS.length)];
          const rf = ["NATO", "EAST", "CHINA"][Math.floor(Math.random() * 3)];
          const ef = EVTS[Math.floor(Math.random() * EVTS.length)];
          setLog(p => [{ msg: ef({ r: rr.name, f: FD[rf].name }), type: "event", id: Date.now() + Math.random() }, ...p].slice(0, 60));
          setTension(t => Math.min(100, t + Math.floor(Math.random() * 7)));
        }
        const w = checkWin(state);
        if (w) { setWinner(w); setTimeout(() => setAppScreen("gameover"), 600); }
        return state;
      });
      setAiRunning(false);
    }, 850);
    return () => clearTimeout(t);
  }, [aiRunning, appScreen, playerFaction, checkWin]);

  // â”€â”€ RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (appScreen === "splash") return <SplashScreen onDone={() => setAppScreen("intro")} />;

  if (appScreen === "intro") return <IntroScreen onDone={() => setAppScreen("menu")} />;

  if (appScreen === "menu") {
    return (
      <div style={{
        background: "#020810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Courier New',monospace", color: "#c8d8e8", overflow: "hidden", position: "relative",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
          @keyframes sc2{0%{top:-5%}100%{top:105%}}
          @keyframes mr{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          @keyframes mg{0%,100%{opacity:0.8}50%{opacity:1;text-shadow:0 0 30px #3af}}
          .fb2{border:1px solid;padding:14px 18px;margin:7px 0;cursor:pointer;transition:all 0.18s;text-align:left;border-radius:4px;background:rgba(0,0,0,0.6);width:100%;display:block;font-family:'Courier New',monospace;}
          .fb2:hover{filter:brightness(1.3);transform:translateX(6px);}
          .sl2{position:absolute;left:0;width:100%;height:2px;background:linear-gradient(90deg,transparent,rgba(58,158,255,0.07),transparent);animation:sc2 7s linear infinite;pointer-events:none;}
        `}</style>
        <div className="sl2" />
        <div style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%,rgba(5,20,45,0.9),#020810)", position: "absolute", inset: 0 }} />
        <div style={{ width: "100%", maxWidth: 1100, padding: "0 40px", display: "flex", gap: 50, alignItems: "center", position: "relative", animation: "mr 0.6s ease" }}>
          {/* Left: branding */}
          <div style={{ flex: "0 0 320px", textAlign: "center" }}>
            <div style={{ width: 140, height: 140, margin: "0 auto 14px", filter: "drop-shadow(0 0 20px #3af)drop-shadow(0 0 40px #09f)" }}>
              <img src={LOGO_SRC} alt="SOFTCURSE" style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "screen" }} />
            </div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, letterSpacing: 8, color: "#ddeeff", fontWeight: 900, marginBottom: 4 }}>SOFTCURSE</div>
            <div style={{ fontSize: 8, letterSpacing: 5, color: "#2a4a5a", marginBottom: 24 }}>STUDIO</div>
            <div style={{ fontSize: 26, fontWeight: "bold", letterSpacing: 5, color: "#e0eeff", lineHeight: 1.1, animation: "mg 3s infinite" }}>WORLD<br />WAR III</div>
            <div style={{ fontSize: 8, letterSpacing: 5, color: "#2a5a7a", marginTop: 6, marginBottom: 14 }}>STRATEGIC OPERATIONS</div>
            <div style={{ width: 40, height: 1, background: "#ff4444", margin: "0 auto 14px" }} />
            <div style={{ fontSize: 9, color: "#3a5a6a", lineHeight: 1.9 }}>
              {REGIONS.length} territories Â· 3 superpowers<br />
              Smart AI counter-strategy<br />
              <strong style={{ color: "#4488aa" }}>Control 55%</strong> to win the war
            </div>
          </div>
          {/* Right: faction select */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#1a3a4a", letterSpacing: 5, marginBottom: 14, textAlign: "center" }}>â”€ SELECT COMMAND FACTION â”€</div>
            {["NATO", "EAST", "CHINA"].map(fk => {
              const f = FD[fk];
              return (
                <button key={fk} className="fb2" onClick={() => startGame(fk)} onMouseEnter={() => AudioEngine.hover()} style={{ borderColor: `${f.color}44`, color: f.color }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: "bold" }}>{f.flag} {f.name}</span>
                    <span style={{ fontSize: 9, color: "#446677" }}>â˜¢ï¸{f.nukes} Â· income +{f.income}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#446677", marginBottom: 4 }}>{f.desc}</div>
                  <div style={{ fontSize: 8, color: "#2a3a44" }}>ATK Ã—{f.atk} Â· DEF Ã—{f.def}</div>
                </button>
              );
            })}
            <div style={{ textAlign: "center", marginTop: 14, fontSize: 8, color: "#1a3040", letterSpacing: 2 }}>
              AI FLANKING Â· COUNTER-ATTACKS Â· NUCLEAR DOCTRINE Â· INCOME ENGINE
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appScreen === "gameover") {
    useEffect(() => {
      if (winner === playerFaction) AudioEngine.victory();
      else AudioEngine.defeat();
    }, []);
    const isWin = winner === playerFaction;
    const wf = FD[winner];
    return (
      <div style={{ background: isWin ? "#001508" : "#080010", minHeight: "100vh", fontFamily: "'Courier New',monospace", color: isWin ? "#00ee77" : "#ff3366", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 30px" }}>
        <img src={LOGO_SRC} alt="SOFTCURSE" style={{ width: 80, height: 80, objectFit: "contain", mixBlendMode: "screen", filter: isWin ? "drop-shadow(0 0 20px #0f8)" : "drop-shadow(0 0 20px #f33)", marginBottom: 16 }} />
        <div style={{ fontSize: 9, letterSpacing: 6, marginBottom: 6, opacity: 0.6 }}>{isWin ? "TOTAL DOMINANCE" : "STRATEGIC FAILURE"}</div>
        <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}>{wf?.flag} {wf?.name}</div>
        <div style={{ fontSize: 8, color: "#335544", letterSpacing: 4, marginBottom: 22 }}>ACHIEVED GLOBAL SUPREMACY</div>
        <div style={{ border: `1px solid ${isWin ? "#00aa44" : "#aa0033"}33`, borderRadius: 4, padding: "14px 24px", marginBottom: 28, background: "rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: 11, color: "#557766", lineHeight: 2 }}>
            Duration: <strong>{turn}</strong> turns<br />
            {isWin ? "Your strategy reshaped the global order." : "The enemy coalition proved overwhelming."}
          </div>
        </div>
        <button onClick={() => setAppScreen("menu")} style={{ background: isWin ? "#006622" : "#770018", color: "#fff", border: "none", padding: "14px 32px", fontSize: 10, fontWeight: "bold", letterSpacing: 4, cursor: "pointer", borderRadius: 4, fontFamily: "'Courier New',monospace" }}>
          â†© NEW CONFLICT
        </button>
      </div>
    );
  }

  // â”€â”€ GAME SCREEN (LANDSCAPE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pf = FD[playerFaction];
  const cnt = getCounts();
  const myCount = cnt[playerFaction] || 0;
  const total = REGIONS.length;
  const myFs = fs[playerFaction] || {};
  const fc = f => FD[f]?.color || "#2a3d50";

  return (
    <div style={{
      background: "#040a12", height: "100vh", width: "100vw", onClick: initSound,
      fontFamily: "'Courier New',monospace", color: "#c8d8e8",
      display: "flex", flexDirection: "row", overflow: "hidden", userSelect: "none",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        @keyframes pp{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes si{from{transform:translateY(-4px);opacity:0}to{opacity:1;transform:translateY(0)}}
        @keyframes cf{0%{opacity:1}40%{opacity:0.1;transform:scale(1.6)}100%{opacity:1;transform:scale(1)}}
        .rdot{cursor:pointer;} .rdot:hover{filter:brightness(1.45);}
        .bl{animation:pp 1s infinite;} .le{animation:si 0.22s ease;} .cfa{animation:cf 0.5s ease;}
      `}</style>

      {/* LEFT SIDEBAR */}
      <div style={{ width: 200, background: "#030810", borderRight: "1px solid #0a1c2c", display: "flex", flexDirection: "column", padding: "10px 0", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "8px 14px 12px", borderBottom: "1px solid #0a1c2c", textAlign: "center" }}>
          <img src={LOGO_SRC} alt="" style={{ width: 40, height: 40, objectFit: "contain", mixBlendMode: "screen", filter: `drop-shadow(0 0 8px ${pf.color})` }} />
          <div style={{ fontSize: 9, fontFamily: "'Cinzel',serif", letterSpacing: 4, color: pf.color, marginTop: 4 }}>{pf.flag} {pf.short}</div>
          <div style={{ fontSize: 7, color: "#2a4a5a", marginTop: 2 }}>TURN {turn}</div>
        </div>

        {/* Stats */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid #0a1c2c" }}>
          {[
            ["TERRITORIES", `${myCount}/${total}`, pf.color],
            ["CONTROL", `${Math.floor(myCount / total * 100)}%`, myCount / total >= 0.55 ? "#00ee55" : myCount / total >= 0.35 ? "#ffaa22" : pf.color],
            ["NUKES", `${myFs.nukes || 0}`, "#ff8833"],
            ["TENSION", `${tension}%`, `hsl(${Math.max(0, 120 - tension)},85%,55%)`],
          ].map(([label, val, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 7, color: "#2a4a5a", letterSpacing: 1 }}>{label}</div>
              <div style={{ fontSize: 11, color, fontWeight: "bold" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Territory bars */}
        <div style={{ padding: "8px 14px", borderBottom: "1px solid #0a1c2c" }}>
          <div style={{ fontSize: 7, color: "#1a3040", letterSpacing: 2, marginBottom: 6 }}>POWER BALANCE</div>
          {["NATO", "EAST", "CHINA"].map(fk => {
            const c = cnt[fk] || 0; const pct = c / total * 100;
            return (
              <div key={fk} style={{ marginBottom: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 8, color: fc(fk) }}>{FD[fk].flag} {fk}{fk === playerFaction ? " â—€" : ""}</span>
                  <span style={{ fontSize: 8, color: "#335566" }}>{pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: 4, background: "#0a1826", borderRadius: 2, position: "relative" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: fc(fk), borderRadius: 2, transition: "width 0.5s" }} />
                  <div style={{ position: "absolute", top: 0, left: "55%", width: 1, height: "100%", background: "rgba(255,255,255,0.12)" }} />
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 7, color: "#1a3040", marginTop: 4 }}>âšª Neutral: {cnt.NEUTRAL || 0}</div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "8px 12px", borderBottom: "1px solid #0a1c2c", display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            disabled={!myFs.nukes || aiRunning}
            onClick={() => { setNukeMode(n => !n); setSelected(null); setMode("select"); }}
            style={{ background: nukeMode ? "#1a0000" : "#0a0404", color: myFs.nukes ? "#ff6622" : "#2a1010", border: `1px solid ${nukeMode ? "#cc2200" : "#250600"}`, padding: "7px 4px", fontSize: 8, letterSpacing: 1, cursor: myFs.nukes ? "pointer" : "not-allowed", borderRadius: 3, fontFamily: "inherit" }}>
            â˜¢ï¸ NUCLEAR STRIKE
          </button>
          <button
            onClick={() => { const m = !soundMuted; setSoundMuted(m); AudioEngine.setMuted(m); }}
            style={{ background: "#030c18", color: soundMuted ? "#334455" : "#4499bb", border: "1px solid #0a1826", padding: "7px 4px", fontSize: 8, letterSpacing: 1, cursor: "pointer", borderRadius: 3, fontFamily: "inherit" }}>
            {soundMuted ? "ðŸ”‡ SOUND OFF" : "ðŸ”Š SOUND ON"}
          </button>
          <button
            disabled={aiRunning}
            onClick={() => { setSelected(null); setMode("select"); doEndTurn(); }}
            style={{ background: "#05111c", color: pf.color, border: `1px solid ${pf.color}44`, padding: "7px 4px", fontSize: 8, letterSpacing: 2, cursor: "pointer", borderRadius: 3, fontFamily: "inherit" }}>
            â­ END TURN
          </button>
        </div>

        {/* Log panel toggle */}
        <div style={{ display: "flex", gap: 4, padding: "6px 12px", borderBottom: "1px solid #0a1c2c" }}>
          {["log", "intel"].map(p => (
            <button key={p} onClick={() => setPanel(p)} style={{ flex: 1, background: panel === p ? "#0a1826" : "transparent", color: panel === p ? pf.color : "#2a4a5a", border: "1px solid #0a1826", padding: "4px 2px", fontSize: 7, letterSpacing: 1, cursor: "pointer", borderRadius: 2, fontFamily: "inherit", textTransform: "uppercase" }}>
              {p === "log" ? "ðŸ“‹ Log" : "ðŸ“¡ Intel"}
            </button>
          ))}
        </div>

        {/* Log / Intel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 12px" }}>
          {panel === "log" && (
            <>
              {log.length === 0 && <div style={{ fontSize: 8, color: "#1a2a36" }}>Awaiting contact...</div>}
              {log.map((e, i) => (
                <div key={e.id || i} className="le" style={{
                  fontSize: 8, marginBottom: 3, lineHeight: 1.5,
                  color: e.type === "win" ? "#33ee88" : e.type === "loss" ? "#ff6644" : e.type === "nuke" ? "#ff3300" : e.type === "event" ? "#ffcc33" : e.type === "enemy" ? "#ff4444" : e.type === "east" ? "#ff5555" : e.type === "china" ? "#ddaa00" : e.type === "reinforce" ? "#3399ff" : e.type === "warn" ? "#ffaa22" : "#3a5a70",
                  opacity: i > 10 ? 0.4 : i > 5 ? 0.7 : 1
                }}>
                  {e.msg}
                </div>
              ))}
            </>
          )}
          {panel === "intel" && (
            <>
              <div style={{ fontSize: 7, color: "#1a3040", letterSpacing: 2, marginBottom: 6 }}>ENEMY STATUS</div>
              {["NATO", "EAST", "CHINA"].filter(f => f !== playerFaction).map(fk => {
                const fd = FD[fk]; const ffs = fs[fk] || {}; const c = cnt[fk] || 0;
                const bords = Object.entries(rs).filter(([rid, rd]) => {
                  if (rd.faction !== playerFaction) return false;
                  return (ADJ[rid] || []).some(a => rs[a]?.faction === fk);
                }).length;
                return (
                  <div key={fk} style={{ border: `1px solid ${fd.color}28`, borderRadius: 3, padding: "6px 8px", marginBottom: 6 }}>
                    <div style={{ fontSize: 9, color: fd.color, fontWeight: "bold", marginBottom: 3 }}>{fd.flag} {fd.name}</div>
                    <div style={{ fontSize: 8, color: "#335566", lineHeight: 1.8 }}>
                      <div>Regions: {c} ({Math.floor(c / total * 100)}%)</div>
                      <div>Nukes: {ffs.nukes || 0}</div>
                      <div style={{ color: bords > 0 ? "#ff7733" : "#224433" }}>âš”ï¸ {bords} border conflicts</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* MAIN MAP AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: "#030c18", borderBottom: "1px solid #0a1c2c", padding: "6px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: 8, color: nukeMode ? "#ff4444" : mode === "target" ? "#ffee44" : "#2a6a99", letterSpacing: 1 }}>
            {nukeMode ? "â˜¢ï¸  NUCLEAR MODE â€” click enemy territory to target" :
              mode === "select" ? "âš¡  SELECT your territory (tap to command)" :
                `ðŸŽ¯  FROM: ${REGIONS.find(r => r.id === selected)?.name || ""} [${rs[selected]?.troops || 0} troops] â€” click target`}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {mode === "target" && <button onClick={() => { setSelected(null); setMode("select"); }} style={{ background: "#1a0404", color: "#ff7777", border: "1px solid #330808", padding: "3px 8px", fontSize: 7, cursor: "pointer", borderRadius: 2, fontFamily: "inherit" }}>âœ• CANCEL</button>}
            <div style={{ height: 4, width: 120, background: "#0a1826", borderRadius: 2, overflow: "hidden", display: "flex" }}>
              {["NATO", "EAST", "CHINA"].map(fk => (
                <div key={fk} style={{ width: `${(cnt[fk] || 0) / total * 100}%`, background: fc(fk), height: "100%", transition: "width 0.5s" }} />
              ))}
            </div>
            <div style={{ fontSize: 7, color: "#2a4a5a" }}>55% to win</div>
          </div>
        </div>

        {/* SVG MAP */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#030c16" }}>
          <svg viewBox="-5 2 155 85" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="og2" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#06122a" /><stop offset="100%" stopColor="#020810" />
              </radialGradient>
              <filter id="gl2">
                <feGaussianBlur stdDeviation="0.9" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect x="-10" y="-5" width="220" height="110" fill="url(#og2)" />
            {[0, 30, 60, 90, 120, 150].map(x => <line key={`gv${x}`} x1={x} y1={0} x2={x} y2={95} stroke="#070f1e" strokeWidth={0.18} />)}
            {[0, 20, 40, 60, 80].map(y => <line key={`gh${y}`} x1={-5} y1={y} x2={155} y2={y} stroke="#070f1e" strokeWidth={0.18} />)}
            <line x1={-5} y1={46} x2={155} y2={46} stroke="#0c1e2e" strokeWidth={0.3} strokeDasharray="3,2" opacity={0.5} />

            {/* Adjacency lines */}
            {REGIONS.map(region => (ADJ[region.id] || []).filter(tid => tid > region.id).map(tid => {
              const to = REGIONS.find(r => r.id === tid); if (!to) return null;
              const frs = rs[region.id], trs = rs[tid];
              const same = frs && trs && frs.faction === trs.faction && frs.faction !== "NEUTRAL";
              return <line key={`${region.id}-${tid}`} x1={region.x} y1={region.y} x2={to.x} y2={to.y}
                stroke={same ? fc(frs.faction) : "#0c1c2c"} strokeWidth={same ? 0.4 : 0.2}
                opacity={same ? 0.35 : 0.55} strokeDasharray={same ? "none" : "1.2,2"} />;
            }))}

            {/* Regions */}
            {REGIONS.map(region => {
              const rdata = rs[region.id]; if (!rdata) return null;
              const color = fc(rdata.faction);
              const isSel = selected === region.id;
              const isAdj = selected && (ADJ[selected] || []).includes(region.id);
              const isFlash = flashReg === region.id;
              const isMe = rdata.faction === playerFaction;
              const r = isSel ? region.r + 1.1 : region.r;
              return (
                <g key={region.id} onClick={() => handleClick(region.id)}>
                  {isSel && <circle cx={region.x} cy={region.y} r={r + 2.2} fill="none" stroke={pf.color} strokeWidth={0.65} opacity={0.5} className="bl" />}
                  {isAdj && <circle cx={region.x} cy={region.y} r={r + 1.8} fill="none" stroke="#ffee44" strokeWidth={0.45} opacity={0.4} />}
                  {isFlash && <circle cx={region.x} cy={region.y} r={r + 3} fill="#ff2200" opacity={0.35} className="cfa" />}
                  {rdata.bombed && <circle cx={region.x} cy={region.y} r={r + 1.5} fill="#1a0000" stroke="#ff1100" strokeWidth={0.25} opacity={0.5} />}
                  <circle cx={region.x} cy={region.y} r={r} fill={color} opacity={isSel ? 1 : 0.82}
                    stroke={isSel ? pf.color : "#06101a"} strokeWidth={isSel ? 0.8 : 0.3}
                    className="rdot" filter={isMe ? "url(#gl2)" : "none"} />
                  {region.strategic && <text x={region.x} y={region.y + 0.6} textAnchor="middle" fontSize={2.2} fill="rgba(255,255,255,0.5)" style={{ pointerEvents: "none" }}>â˜…</text>}
                  <text x={region.x} y={region.y + r + 2.8} textAnchor="middle" fontSize={2.0} fill={isMe ? "#77ccff" : "#3a5566"} style={{ pointerEvents: "none" }}>
                    {rdata.troops >= 1000 ? `${(rdata.troops / 1000).toFixed(1)}k` : rdata.troops}
                  </text>
                  <text x={region.x} y={region.y - r - 1.0} textAnchor="middle" fontSize={1.7} fill={isMe ? "#99ccee" : "#2a3e50"} style={{ pointerEvents: "none" }}>
                    {region.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}

            {/* Continent labels */}
            {[["AMERICAS", 20, 85], ["EUROPE", 56, 7], ["RUSSIA", 84, 7], ["AFRICA", 57, 84], ["M.EAST", 68, 50], ["S.ASIA", 85, 84], ["CHINA", 107, 10], ["PACIFIC", 132, 84]].map(([l, x, y]) => (
              <text key={l} x={x} y={y} textAnchor="middle" fontSize={2.2} fill="#0b1a28" fontWeight="bold" letterSpacing={0.7} style={{ pointerEvents: "none" }}>{l}</text>
            ))}

            {/* Tooltip */}
            {tooltip && (() => {
              const reg = REGIONS.find(r => r.id === tooltip);
              const rd = rs[tooltip];
              if (!reg || !rd) return null;
              return (
                <g style={{ pointerEvents: "none" }}>
                  <rect x={reg.x - 15} y={reg.y - reg.r - 13} width={30} height={11} rx={1.5} fill="#07111e" stroke="#152535" strokeWidth={0.4} />
                  <text x={reg.x} y={reg.y - reg.r - 8} textAnchor="middle" fontSize={2.4} fill="#99ccee">{reg.name}</text>
                  <text x={reg.x} y={reg.y - reg.r - 3.5} textAnchor="middle" fontSize={2.0} fill={fc(rd.faction)}>{FD[rd.faction]?.short} Â· {rd.troops} troops</text>
                </g>
              );
            })()}
          </svg>

          {/* Legend */}
          <div style={{ position: "absolute", bottom: 8, right: 10, display: "flex", gap: 8, background: "rgba(3,8,18,0.85)", padding: "4px 8px", borderRadius: 3, border: "1px solid #0a1826" }}>
            {["NATO", "EAST", "CHINA", "NEUTRAL"].map(fk => (
              <div key={fk} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: fc(fk) }} />
                <span style={{ fontSize: 7, color: "#3a5566" }}>{fk === "NEUTRAL" ? "NEU" : fk} {cnt[fk] || 0}</span>
              </div>
            ))}
          </div>

          {/* AI overlay */}
          {aiRunning && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(2,6,14,0.5)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ fontSize: 10, color: "#ff4444", letterSpacing: 3, animation: "pp 0.45s infinite" }}>âš™ AI EXECUTING STRATEGY...</div>
            </div>
          )}
        </div>
      </div>

      {/* NUKE CONFIRM */}
      {nukeConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, fontFamily: "'Courier New',monospace" }}>
          <div style={{ background: "#060002", border: "1px solid #cc1100", borderRadius: 6, padding: 28, maxWidth: 320, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>â˜¢ï¸</div>
            <div style={{ fontSize: 11, color: "#ff4444", letterSpacing: 3, marginBottom: 10 }}>NUCLEAR AUTHORIZATION</div>
            <div style={{ fontSize: 9, color: "#aa4444", marginBottom: 18, lineHeight: 1.8 }}>
              TARGET: <strong style={{ color: "#ff8888" }}>{REGIONS.find(r => r.id === nukeConfirm)?.name}</strong><br />
              FACTION: <strong style={{ color: "#ff8888" }}>{FD[rs[nukeConfirm]?.faction]?.name}</strong><br />
              <span style={{ color: "#552222", fontSize: 8 }}>Tension +22 Â· Remaining warheads: {(myFs.nukes || 1) - 1}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => launchNuke(nukeConfirm)} style={{ flex: 1, background: "#aa0000", color: "#fff", border: "none", padding: "11px 4px", fontSize: 9, letterSpacing: 2, cursor: "pointer", borderRadius: 3, fontFamily: "inherit" }}>â˜¢ï¸ LAUNCH</button>
              <button onClick={() => { setNukeConfirm(null); setNukeMode(false); }} style={{ flex: 1, background: "transparent", color: "#ff6666", border: "1px solid #330808", padding: "11px 4px", fontSize: 9, letterSpacing: 2, cursor: "pointer", borderRadius: 3, fontFamily: "inherit" }}>ABORT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function WW3Game() { return <GameErrorBoundary><WW3GameInner /></GameErrorBoundary>; }
