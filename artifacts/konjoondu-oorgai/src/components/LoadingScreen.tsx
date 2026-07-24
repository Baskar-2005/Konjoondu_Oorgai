import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import prawnImg from '@/assets/prawn.png';
import fishImg  from '@/assets/fish.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

const DURATION = 3200;

// ─── Non-veg jar SVG ───────────────────────────────────────────────────────────
// Crimson-maroon fill, prawn curve + fish chunk + bone-white oil droplets inside

function PremiumJar({ progress }: { progress: number }) {
  const maxFill = 130;
  const filled = maxFill * (progress / 100);
  const fillY = 170 - filled;

  return (
    <svg viewBox="0 0 200 220" width="190" height="210" aria-label="Konjoondu Oorgai">
      <defs>
        <clipPath id="bodyClip">
          <rect x="22" y="55" width="156" height="148" rx="28" />
        </clipPath>

        {/* Glass body */}
        <linearGradient id="jarBodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,245,235,0.10)" />
          <stop offset="40%"  stopColor="rgba(255,245,235,0.20)" />
          <stop offset="100%" stopColor="rgba(255,245,235,0.04)" />
        </linearGradient>

        {/* Fill: deep crimson → near-black maroon — meat pickle oil */}
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#8B1A1A" />
          <stop offset="50%"  stopColor="#5C0A0A" />
          <stop offset="100%" stopColor="#2E0404" />
        </linearGradient>

        {/* Oil-shimmer on liquid surface */}
        <linearGradient id="oilSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(181,58,46,0.0)" />
          <stop offset="30%"  stopColor="rgba(232,130,80,0.35)" />
          <stop offset="60%"  stopColor="rgba(181,58,46,0.15)" />
          <stop offset="100%" stopColor="rgba(232,130,80,0.0)" />
        </linearGradient>

        {/* Lid */}
        <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#5A3020" />
          <stop offset="100%" stopColor="#2C1408" />
        </linearGradient>
        <radialGradient id="lidShine" cx="38%" cy="28%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.30)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
        </radialGradient>

        {/* Glow filter */}
        <filter id="jarGlow">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Blood-red shimmer used on meat chunks */}
        <radialGradient id="meatGrad" cx="35%" cy="30%">
          <stop offset="0%"   stopColor="#C0392B" />
          <stop offset="100%" stopColor="#7B0E0E" />
        </radialGradient>
      </defs>

      {/* ── LID ── */}
      <rect x="42" y="35" width="116" height="24" rx="8"  fill="url(#lidGrad)" />
      <rect x="28" y="18" width="144" height="24" rx="10" fill="url(#lidGrad)" />
      <rect x="28" y="18" width="144" height="24" rx="10" fill="url(#lidShine)" />
      <rect x="82" y="8"  width="36"  height="14" rx="7"  fill="#3D1A0A" />
      <ellipse cx="100" cy="10" rx="14" ry="5" fill="#5A2E14" opacity="0.7" />

      {/* ── JAR BODY ── */}
      <rect x="22" y="55" width="156" height="148" rx="28"
        fill="url(#jarBodyGrad)"
        stroke="rgba(255,245,235,0.28)"
        strokeWidth="1.5"
      />

      {/* ── DARK MEAT-PICKLE OIL FILL ── */}
      <rect
        x="22" y={fillY} width="156" height={filled + 10}
        fill="url(#fillGrad)"
        clipPath="url(#bodyClip)"
        opacity="0.94"
      />

      {/* ── OIL SURFACE ── */}
      {progress > 3 && (
        <>
          <ellipse cx="100" cy={fillY} rx="78" ry="7"
            fill="url(#oilSheen)" clipPath="url(#bodyClip)" />
          {/* Tiny bone-white fat droplets on surface */}
          <circle cx="82"  cy={fillY - 1} r="3.5" fill="rgba(255,245,230,0.45)" clipPath="url(#bodyClip)" />
          <circle cx="112" cy={fillY + 1} r="2.5" fill="rgba(255,245,230,0.35)" clipPath="url(#bodyClip)" />
          <circle cx="66"  cy={fillY}     r="2"   fill="rgba(255,245,230,0.30)" clipPath="url(#bodyClip)" />
        </>
      )}

      {/* ── CONTENTS: real prawn + fish PNGs + peppercorn + chili ── */}
      {progress > 28 && (
        <g clipPath="url(#bodyClip)" opacity={Math.min(1, (progress - 28) / 30)}>

          {/* Real prawn PNG — left side of jar, tilted */}
          <image
            href={prawnImg}
            x="24" y="105"
            width="72" height="72"
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))' }}
            transform="rotate(-20, 60, 141)"
          />

          {/* Real fish PNG — right-centre of jar */}
          <image
            href={fishImg}
            x="108" y="118"
            width="64" height="48"
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))' }}
            transform="rotate(12, 140, 142)"
          />

          {/* Whole peppercorn */}
          <circle cx="58"  cy="170" r="5" fill="#1A0800" opacity="0.85" />
          <circle cx="58"  cy="169" r="2" fill="rgba(255,245,230,0.15)" />

          {/* Dried chili */}
          <path d="M 148 158 Q 158 153 160 160 Q 158 168 148 166 Z"
            fill="#8B1A1A" opacity="0.88"
          />
          <circle cx="148" cy="162" r="2" fill="#5C0A0A" opacity="0.7" />
        </g>
      )}

      {/* ── LABEL ── */}
      <rect x="42" y="90" width="116" height="70" rx="12"
        fill="rgba(255,245,235,0.14)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <text x="100" y="130" textAnchor="middle" fontFamily="Poppins,sans-serif"
        fontWeight="900" fontSize="22" fill="rgba(255,245,235,0.88)" letterSpacing="2">
        KO
      </text>
      <text x="100" y="148" textAnchor="middle" fontFamily="Poppins,sans-serif"
        fontWeight="600" fontSize="8" fill="rgba(255,245,235,0.52)" letterSpacing="4">
        OORGAI
      </text>

      {/* ── SHINE STREAK (glass highlight) ── */}
      <rect x="36" y="62" width="12" height="90" rx="6"
        fill="rgba(255,255,255,0.10)" clipPath="url(#bodyClip)" />
      <rect x="50" y="62" width="4"  height="58" rx="2"
        fill="rgba(255,255,255,0.05)" clipPath="url(#bodyClip)" />

      {/* ── GROUND SHADOW ── */}
      <ellipse cx="100" cy="208" rx="60" ry="8" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

// ─── PNG floating particle (prawn / fish) — real image, HTML layer ─────────────

function PngParticle({
  x, y, sizePx, src, delay, rotateTo = 0,
}: {
  x: number; y: number; sizePx: number; src: string; delay: number; rotateTo?: number;
}) {
  const driftX = (Math.random() - 0.5) * 90;
  const driftY = (Math.random() - 0.5) * 90;
  const repeatDelay = Math.random() * 2.5 + 0.5;
  return (
    <motion.img
      src={src}
      alt=""
      style={{
        position: 'absolute',
        width: sizePx,
        height: sizePx,
        objectFit: 'contain',
        // x,y are SVG units (-400..400 from center); convert to CSS offset from centre
        left: `calc(50% + ${x}px - ${sizePx / 2}px)`,
        top:  `calc(50% + ${y}px - ${sizePx / 2}px)`,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))',
      }}
      initial={{ opacity: 0, scale: 0, rotate: 0, x: 0, y: 0 }}
      animate={{
        opacity:  [0, 0.92, 0.92, 0],
        scale:    [0, 1, 1, 0],
        rotate:   [0, rotateTo],
        x:        [0, driftX],
        y:        [0, driftY],
      }}
      transition={{ duration: 3.2, delay, repeat: Infinity, repeatDelay, ease: 'easeInOut' }}
    />
  );
}

// ─── SVG-only particles: chili + oil drop ───────────────────────────────────────

function SvgParticle({
  x, y, size, kind, delay,
}: {
  x: number; y: number; size: number; kind: 'chili' | 'drop'; delay: number;
}) {
  const drift = { x: (Math.random() - 0.5) * 70, y: (Math.random() - 0.5) * 70 };

  if (kind === 'chili') {
    return (
      <motion.g
        initial={{ opacity: 0, scale: 0, rotate: 0 }}
        animate={{ opacity: [0, 0.72, 0.72, 0], scale: [0, 1, 1, 0], rotate: [0, 45], x: [0, drift.x], y: [0, drift.y] }}
        transition={{ duration: 2.8, delay, repeat: Infinity, repeatDelay: Math.random() * 3 }}
      >
        <ellipse cx={x} cy={y} rx={size * 0.5} ry={size * 2} fill="#8B1A1A" />
        <circle cx={x} cy={y - size * 2} r={size * 0.6} fill="#5C0A0A" />
      </motion.g>
    );
  }

  // drop — oil droplet
  return (
    <motion.ellipse
      cx={x} cy={y} rx={size} ry={size * 1.3}
      fill="rgba(139,26,26,0.5)"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.6, 0.6, 0], scale: [0, 1, 1, 0], y: [0, 30] }}
      transition={{ duration: 2.2, delay, repeat: Infinity, repeatDelay: Math.random() * 2 }}
    />
  );
}

// ─── Pulsing ring (smoke rings — coastal charcoal vibe) ───────────────────────

function SmokePulse({ radius, delay, duration }: { radius: number; delay: number; duration: number }) {
  const ticks = 10;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0.20, 0.10, 0], scale: [0.5, 1.3, 1.8], rotate: [0, 20] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    >
      {Array.from({ length: ticks }).map((_, i) => {
        const angle = (i / ticks) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <g key={i} transform={`translate(${x},${y}) rotate(${(i / ticks) * 360})`}>
            {/* Bone-shard tick marks instead of floral petals */}
            <rect width="5" height="2" rx="1" x="-2.5" y="-1" fill="rgba(232,182,74,0.9)" />
          </g>
        );
      })}
      <circle r={radius} fill="none" stroke="rgba(181,58,46,0.5)" strokeWidth="0.6" strokeDasharray="3 9" />
    </motion.g>
  );
}

// ─── Corner ornament: prawn silhouette ────────────────────────────────────────

function PrawnOrnament({ flip }: { flip?: boolean }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      {/* Prawn body crescent */}
      <path
        d="M 14 42 Q 6 28 14 14 Q 20 8 27 12 Q 33 16 28 26 Q 22 36 28 44 Q 22 48 14 42 Z"
        fill="#8B1A1A" opacity="0.75"
      />
      {/* Antennae */}
      <line x1="22" y1="12" x2="10" y2="4"  stroke="#5C0A0A" strokeWidth="1.2" opacity="0.6" />
      <line x1="25" y1="11" x2="16" y2="2"  stroke="#5C0A0A" strokeWidth="1.2" opacity="0.6" />
      {/* Tail fan */}
      <path d="M 28 44 L 38 46 L 34 40 Z" fill="#5C0A0A" opacity="0.6" />
      <path d="M 28 44 L 40 42 L 36 36 Z" fill="#5C0A0A" opacity="0.5" />
      {/* Segment lines */}
      <line x1="15" y1="22" x2="26" y2="20" stroke="#5C0A0A" strokeWidth="1" opacity="0.45" />
      <line x1="14" y1="30" x2="26" y2="30" stroke="#5C0A0A" strokeWidth="1" opacity="0.45" />
      <line x1="16" y1="38" x2="27" y2="38" stroke="#5C0A0A" strokeWidth="1" opacity="0.45" />
    </svg>
  );
}

// ─── Loading screen ────────────────────────────────────────────────────────────

// PNG-based (real photos): prawn + fish
const PNG_PARTICLES: { x: number; y: number; sizePx: number; src: string; delay: number; rotateTo: number }[] = [
  { x: -310, y: -190, sizePx: 110, src: 'prawn', delay: 0.3,  rotateTo:  18 },
  { x:  270, y: -210, sizePx:  90, src: 'fish',  delay: 0.8,  rotateTo: -25 },
  { x:  295, y:  110, sizePx: 130, src: 'prawn', delay: 1.6,  rotateTo: -14 },
  { x: -345, y:  -35, sizePx:  95, src: 'fish',  delay: 2.2,  rotateTo:  30 },
  { x:   55, y: -255, sizePx: 100, src: 'prawn', delay: 1.4,  rotateTo:  10 },
  { x:  -75, y:  275, sizePx:  88, src: 'fish',  delay: 2.0,  rotateTo: -20 },
];

// SVG-only: chili + oil drop
const SVG_PARTICLES: { x: number; y: number; size: number; kind: 'chili' | 'drop'; delay: number }[] = [
  { x: -255, y:  65,  size: 4, kind: 'chili', delay: 1.1 },
  { x: -175, y: 225,  size: 5, kind: 'drop',  delay: 0.5 },
  { x:  205, y: 245,  size: 4, kind: 'chili', delay: 1.9 },
  { x:  340, y: -80,  size: 5, kind: 'drop',  delay: 0.9 },
];

const LOADING_LABELS = [
  'Marinating the prawns…',
  'Slow-cooking the mutton…',
  'Sealing coastal flavors…',
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'reveal' | 'loading' | 'burst' | 'exit'>('reveal');

  useEffect(() => {
    const revealTimer = setTimeout(() => setPhase('loading'), 600);

    const startTime = Date.now();
    const progressTimer = setTimeout(() => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime - 600;
        const raw = (elapsed / DURATION) * 100;
        const val = Math.min(100, raw < 70 ? raw * 1.1 : 70 + (raw - 70) * 2.5);
        setProgress(Math.min(100, val));
        if (val >= 100) {
          clearInterval(interval);
          setPhase('burst');
          setTimeout(() => {
            setPhase('exit');
            setTimeout(onComplete, 900);
          }, 600);
        }
      }, 16);
      return () => clearInterval(interval);
    }, 600);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(progressTimer);
    };
  }, [onComplete]);

  const label = progress < 38
    ? LOADING_LABELS[0]
    : progress < 76
    ? LOADING_LABELS[1]
    : LOADING_LABELS[2];

  const brand1 = 'KONJOONDU';
  const brand2 = 'OORGAI';
  const isExiting = phase === 'exit';

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          style={{ background: '#0D0504' }}
        >
          {/* ── CURTAIN EXIT ── */}
          {isExiting && (
            <>
              <motion.div className="absolute left-0 right-0 top-0 z-10"
                style={{ height: '50%', background: '#0D0504' }}
                initial={{ y: 0 }} animate={{ y: '-100%' }}
                transition={{ duration: 0.82, ease: [0.76, 0, 0.24, 1] }}
              />
              <motion.div className="absolute left-0 right-0 bottom-0 z-10"
                style={{ height: '50%', background: '#0D0504' }}
                initial={{ y: 0 }} animate={{ y: '100%' }}
                transition={{ duration: 0.82, ease: [0.76, 0, 0.24, 1] }}
              />
            </>
          )}

          {/* ── BACKGROUND: Deep smoked charcoal — like a coastal smokehouse ── */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6 }}
            style={{
              background:
                'radial-gradient(ellipse 85% 75% at 50% 48%, #2A0A04 0%, #160403 45%, #0D0504 100%)',
            }}
          />

          {/* ── BLOOD-RED HEAT HAZE — replaces warm gold glow ── */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 0.55 }}
            transition={{ duration: 2.2, delay: 0.5 }}
          >
            <div style={{
              width: 900, height: 900, borderRadius: '50%',
              background: `conic-gradient(
                from 0deg,
                transparent 0deg,   rgba(139,26,26,0.07)  12deg, transparent  24deg,
                transparent 36deg,  rgba(181,58,46,0.09)  48deg, transparent  60deg,
                transparent 72deg,  rgba(139,26,26,0.06)  84deg, transparent  96deg,
                transparent 108deg, rgba(181,58,46,0.10) 120deg, transparent 132deg,
                transparent 144deg, rgba(139,26,26,0.07) 156deg, transparent 168deg,
                transparent 180deg, rgba(181,58,46,0.08) 192deg, transparent 204deg,
                transparent 216deg, rgba(139,26,26,0.06) 228deg, transparent 240deg,
                transparent 252deg, rgba(181,58,46,0.09) 264deg, transparent 276deg,
                transparent 288deg, rgba(139,26,26,0.07) 300deg, transparent 312deg,
                transparent 324deg, rgba(181,58,46,0.10) 336deg, transparent 360deg
              )`,
            }} />
          </motion.div>

          {/* ── SMOKE-RING PULSES ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="800" height="800" viewBox="-400 -400 800 800" overflow="visible">
              <SmokePulse radius={155} delay={0.5} duration={3.8} />
              <SmokePulse radius={240} delay={1.3} duration={4.8} />
              <SmokePulse radius={325} delay={2.1} duration={5.8} />
              {/* Dark pulsing core — glowing like a charcoal ember */}
              <motion.circle r={18} fill="#8B1A1A"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.65, 0.35], scale: [0, 1, 0.75] }}
                transition={{ duration: 1.6, delay: 0.3, repeat: Infinity, repeatType: 'reverse' }}
              />
            </svg>
          </div>

          {/* ── FLOATING PNG PARTICLES: real prawn & fish photos ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {PNG_PARTICLES.map((p, i) => (
              <PngParticle
                key={i}
                x={p.x}
                y={p.y}
                sizePx={p.sizePx}
                src={p.src === 'prawn' ? prawnImg : fishImg}
                delay={p.delay}
                rotateTo={p.rotateTo}
              />
            ))}
          </div>

          {/* ── FLOATING SVG PARTICLES: chili + oil drops ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="800" height="800" viewBox="-400 -400 800 800" overflow="visible">
              {SVG_PARTICLES.map((p, i) => (
                <SvgParticle key={i} {...p} />
              ))}
            </svg>
          </div>

          {/* ── HOT GLOW BEHIND JAR ── */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: isExiting ? 0 : [0, 0.65, 0.45], scale: [0.5, 1.2, 1] }}
            transition={{ duration: 1.9, delay: 0.2 }}
            style={{
              width: 320, height: 320, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,26,26,0.30) 0%, rgba(92,10,10,0.14) 50%, transparent 72%)',
              filter: 'blur(22px)',
            }}
          />

          {/* ── BURST PARTICLES ── */}
          {phase === 'burst' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: 22 }).map((_, i) => {
                const angle = (i / 22) * Math.PI * 2;
                // palette: blood-red, charred black, gold accent, bone-white
                const col = i % 4 === 0 ? '#C0392B' : i % 4 === 1 ? '#8B1A1A' : i % 4 === 2 ? '#E8B64A' : '#FFF0E0';
                return (
                  <motion.div key={i} className="absolute rounded-full"
                    style={{ width: Math.random() * 7 + 4, height: Math.random() * 7 + 4, background: col }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(angle) * (90 + Math.random() * 130),
                      y: Math.sin(angle) * (90 + Math.random() * 130),
                      opacity: 0, scale: 0,
                    }}
                    transition={{ duration: 0.85, ease: 'easeOut' }}
                  />
                );
              })}
            </div>
          )}

          {/* ── MAIN CONTENT ── */}
          <div className="relative flex flex-col items-center gap-6 px-8 z-10">

            {/* Jar with rotating shimmer aura */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 44 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.05, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Rotating conic aura — blood red & gold */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, transparent 55%, rgba(139,26,26,0.55) 78%, rgba(232,182,74,0.25) 88%, transparent 100%)',
                  filter: 'blur(10px)',
                  transform: 'scale(1.45)',
                }}
              />
              <PremiumJar progress={progress} />
            </motion.div>

            {/* Brand name */}
            <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>

              {/* KONJOONDU — blood-red with gold shadow */}
              <div className="flex justify-center" aria-label="Konjoondu">
                {brand1.split('').map((ch, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, y: 42, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.45 + i * 0.055, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 'clamp(36px, 7vw, 68px)',
                      fontWeight: 900,
                      color: '#E8B64A',
                      letterSpacing: '0.04em',
                      textShadow: '0 0 36px rgba(139,26,26,0.80), 0 4px 0 rgba(0,0,0,0.55)',
                      lineHeight: 1,
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>

              {/* OORGAI — bone-white */}
              <div className="flex justify-center" aria-label="Oorgai">
                {brand2.split('').map((ch, i) => (
                  <motion.span key={i}
                    initial={{ opacity: 0, y: 30, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.65 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 'clamp(28px, 5vw, 52px)',
                      fontWeight: 900,
                      color: '#FFF5EB',
                      letterSpacing: '0.22em',
                      textShadow: '0 2px 0 rgba(0,0,0,0.6)',
                      lineHeight: 1,
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>

              {/* Divider line — deep crimson */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.4, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-3 mb-2 h-px"
                style={{ width: 200, background: 'linear-gradient(90deg, transparent, #8B1A1A, #C0392B, #8B1A1A, transparent)' }}
              />

              {/* Tagline — coastal non-veg identity */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 0.65, letterSpacing: '0.28em' }}
                transition={{ delay: 1.65, duration: 0.85 }}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 10, fontWeight: 600,
                  color: 'rgba(255,220,190,0.75)',
                  textTransform: 'uppercase',
                }}
              >
                Seafood · Meat · Coastal Heritage
              </motion.p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05 }}
              className="w-72"
            >
              <div className="relative h-1 rounded-full overflow-hidden mb-2"
                style={{ background: 'rgba(255,245,235,0.08)' }}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #5C0A0A, #C0392B, #E8B64A, #C0392B, #5C0A0A)',
                    backgroundSize: '250% 100%',
                  }}
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                />
                {/* Glow dot */}
                <motion.div
                  className="absolute top-1/2 rounded-full"
                  style={{
                    left: `${progress}%`,
                    width: 8, height: 8,
                    background: '#E8B64A',
                    boxShadow: '0 0 8px #E8B64A',
                    transform: 'translateX(-50%) translateY(-50%)',
                  }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span style={{ fontFamily: 'Poppins', fontSize: 11, color: 'rgba(255,220,190,0.4)', fontWeight: 500 }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'Poppins', fontSize: 12, color: '#E8B64A', fontWeight: 700 }}>
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── CORNER PRAWN ORNAMENTS ── */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((pos, i) => (
            <motion.div
              key={pos}
              className="absolute"
              style={{
                top:    pos.startsWith('t') ? 20 : 'auto',
                bottom: pos.startsWith('b') ? 20 : 'auto',
                left:   pos.endsWith('l')   ? 20 : 'auto',
                right:  pos.endsWith('r')   ? 20 : 'auto',
                transform: pos.endsWith('r') ? 'scaleX(-1)' : undefined,
                opacity: 0,
              }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 1.2 + i * 0.1 }}
            >
              <PrawnOrnament flip={pos.endsWith('r')} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
