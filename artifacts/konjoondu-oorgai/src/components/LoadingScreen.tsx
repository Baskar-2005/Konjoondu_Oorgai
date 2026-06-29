import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const DURATION = 3200;

// ─── SVGs ───────────────────────────────────────────────────────

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
        <linearGradient id="jarBodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,249,243,0.12)" />
          <stop offset="40%" stopColor="rgba(255,249,243,0.22)" />
          <stop offset="100%" stopColor="rgba(255,249,243,0.06)" />
        </linearGradient>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(4,65%,52%)" />
          <stop offset="100%" stopColor="hsl(4,60%,36%)" />
        </linearGradient>
        <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(25,50%,55%)" />
          <stop offset="100%" stopColor="hsl(25,38%,38%)" />
        </linearGradient>
        <filter id="jarGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="lidShine" cx="40%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Neck */}
      <rect x="42" y="35" width="116" height="24" rx="8" fill="url(#lidGrad)" />
      {/* Lid top */}
      <rect x="28" y="18" width="144" height="24" rx="10" fill="url(#lidGrad)" />
      <rect x="28" y="18" width="144" height="24" rx="10" fill="url(#lidShine)" />
      {/* Knob */}
      <rect x="82" y="8" width="36" height="14" rx="7" fill="hsl(25, 42%, 45%)" />
      <ellipse cx="100" cy="10" rx="14" ry="5" fill="hsl(25, 50%, 58%)" opacity="0.6" />

      {/* Jar body frame */}
      <rect x="22" y="55" width="156" height="148" rx="28"
        fill="url(#jarBodyGrad)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />

      {/* Pickle fill — animated */}
      <rect
        x="22" y={fillY} width="156" height={filled + 10}
        fill="url(#fillGrad)"
        clipPath="url(#bodyClip)"
        opacity="0.92"
      />

      {/* Liquid surface */}
      {progress > 2 && (
        <>
          <ellipse cx="100" cy={fillY} rx="78" ry="7"
            fill="hsl(4,65%,48%)" opacity="0.7" clipPath="url(#bodyClip)" />
          <ellipse cx="100" cy={fillY} rx="50" ry="3"
            fill="rgba(255,255,255,0.15)" clipPath="url(#bodyClip)" />
        </>
      )}

      {/* Ingredient details inside jar (show when filled enough) */}
      {progress > 30 && (
        <g clipPath="url(#bodyClip)" opacity={Math.min(1, (progress - 30) / 30)}>
          {/* Mango slices suggestion */}
          <ellipse cx="72" cy="130" rx="18" ry="10" fill="hsl(42,80%,62%)" opacity="0.7" transform="rotate(-15, 72, 130)" />
          <ellipse cx="128" cy="145" rx="14" ry="8" fill="hsl(42,80%,58%)" opacity="0.6" transform="rotate(20, 128, 145)" />
          {/* Curry leaf */}
          <ellipse cx="100" cy="120" rx="10" ry="22" fill="hsl(93,38%,42%)" opacity="0.75" />
          <line x1="100" y1="98" x2="100" y2="142" stroke="hsl(93,45%,28%)" strokeWidth="1" opacity="0.6" />
          {/* Chili */}
          <ellipse cx="145" cy="110" rx="5" ry="14" fill="hsl(4,75%,50%)" opacity="0.8" transform="rotate(-30, 145, 110)" />
          {/* Garlic */}
          <circle cx="62" cy="155" r="8" fill="rgba(255,249,243,0.5)" />
          <circle cx="62" cy="155" r="5" fill="rgba(255,249,243,0.7)" />
        </g>
      )}

      {/* Label on jar */}
      <rect x="42" y="90" width="116" height="70" rx="12"
        fill="rgba(255,249,243,0.18)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

      {/* KO letters in label */}
      <text x="100" y="130" textAnchor="middle" fontFamily="Poppins,sans-serif"
        fontWeight="900" fontSize="22" fill="rgba(255,249,243,0.85)" letterSpacing="2">
        KO
      </text>
      <text x="100" y="148" textAnchor="middle" fontFamily="Poppins,sans-serif"
        fontWeight="600" fontSize="8" fill="rgba(255,249,243,0.55)" letterSpacing="4">
        OORGAI
      </text>

      {/* Shine streak */}
      <rect x="36" y="62" width="14" height="90" rx="7"
        fill="rgba(255,255,255,0.12)" clipPath="url(#bodyClip)" />
      <rect x="50" y="62" width="4" height="60" rx="2"
        fill="rgba(255,255,255,0.06)" clipPath="url(#bodyClip)" />

      {/* Ground shadow */}
      <ellipse cx="100" cy="208" rx="60" ry="8" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

function FloatingSpice({ x, y, size, type, delay }: { x: number; y: number; size: number; type: string; delay: number }) {
  if (type === 'seed') {
    return (
      <motion.circle
        cx={x} cy={y} r={size}
        fill="hsl(42,78%,62%)"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.8, 0.8, 0], scale: [0, 1, 1, 0], x: [(Math.random() - 0.5) * 60], y: [(Math.random() - 0.5) * 60] }}
        transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: Math.random() * 3 }}
      />
    );
  }
  return (
    <motion.ellipse
      cx={x} cy={y} rx={size * 1.5} ry={size * 0.6}
      fill="hsl(93,35%,42%)"
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: [0, 0.7, 0.7, 0], rotate: [0, 360] }}
      transition={{ duration: 3.5, delay, repeat: Infinity, repeatDelay: Math.random() * 2 }}
    />
  );
}

// Ornate mandala ring
function OrnateRing({ radius, delay, duration }: { radius: number; delay: number; duration: number }) {
  const segments = 12;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 0.25, 0.15, 0], scale: [0.6, 1.2, 1.6], rotate: [0, 30] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <g key={i} transform={`translate(${x}, ${y}) rotate(${(i / segments) * 360})`}>
            <ellipse rx="6" ry="2.5" fill="hsl(42,78%,60%)" />
          </g>
        );
      })}
      <circle r={radius} fill="none" stroke="hsl(42,70%,60%)" strokeWidth="0.5" strokeDasharray="4 8" />
    </motion.g>
  );
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'reveal' | 'loading' | 'burst' | 'exit'>('reveal');
  const [leaves] = useState(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 20 + 8,
      dur: Math.random() * 9 + 7,
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 120,
      rot: Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
    }))
  );

  const [seeds] = useState(() =>
    Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 2,
      dur: Math.random() * 8 + 6,
      delay: Math.random() * 8,
    }))
  );

  useEffect(() => {
    // Phase 1: reveal (0.6s delay before progress starts)
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

  const brand1 = 'KONJOONDU';
  const brand2 = 'OORGAI';

  const isExiting = phase === 'exit';

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          style={{ background: '#1A0F0A' }}
          animate={isExiting ? {} : {}}
          exit={{}}
        >
          {/* ── CURTAIN EXIT: top half slides up, bottom slides down ── */}
          {isExiting && (
            <>
              <motion.div
                className="absolute left-0 right-0 top-0 z-10"
                style={{ height: '50%', background: '#1A0F0A', originY: 0 }}
                initial={{ y: 0 }}
                animate={{ y: '-100%' }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              />
              <motion.div
                className="absolute left-0 right-0 bottom-0 z-10"
                style={{ height: '50%', background: '#1A0F0A', originY: 1 }}
                initial={{ y: 0 }}
                animate={{ y: '100%' }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              />
            </>
          )}

          {/* ── DEEP WARM BACKGROUND ── */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4 }}
            style={{
              background:
                'radial-gradient(ellipse 90% 80% at 50% 50%, #3D1A0A 0%, #220D05 50%, #0F0602 100%)',
            }}
            aria-hidden="true"
          />

          {/* ── SUNLIGHT RAYS FROM CENTER ── */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 0.6 }}
            transition={{ duration: 2, delay: 0.4 }}
            aria-hidden="true"
          >
            <div
              style={{
                width: 900,
                height: 900,
                background: `conic-gradient(
                  from 0deg,
                  transparent 0deg, rgba(232,182,74,0.06) 10deg, transparent 20deg,
                  transparent 30deg, rgba(232,182,74,0.08) 40deg, transparent 50deg,
                  transparent 60deg, rgba(232,182,74,0.05) 70deg, transparent 80deg,
                  transparent 90deg, rgba(232,182,74,0.09) 100deg, transparent 110deg,
                  transparent 120deg, rgba(232,182,74,0.06) 130deg, transparent 140deg,
                  transparent 150deg, rgba(232,182,74,0.07) 160deg, transparent 170deg,
                  transparent 180deg, rgba(232,182,74,0.05) 190deg, transparent 200deg,
                  transparent 210deg, rgba(232,182,74,0.08) 220deg, transparent 230deg,
                  transparent 240deg, rgba(232,182,74,0.06) 250deg, transparent 260deg,
                  transparent 270deg, rgba(232,182,74,0.07) 280deg, transparent 290deg,
                  transparent 300deg, rgba(232,182,74,0.05) 310deg, transparent 320deg,
                  transparent 330deg, rgba(232,182,74,0.09) 340deg, transparent 350deg,
                  transparent 360deg
                )`,
                borderRadius: '50%',
              }}
            />
          </motion.div>

          {/* ── ORNATE PULSING RINGS ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <svg width="800" height="800" viewBox="-400 -400 800 800" overflow="visible">
              <OrnateRing radius={160} delay={0.5} duration={3.5} />
              <OrnateRing radius={240} delay={1.2} duration={4.5} />
              <OrnateRing radius={320} delay={2.0} duration={5.5} />
              {/* Glowing center orb */}
              <motion.circle
                r={20}
                fill="hsl(42,78%,62%)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.6, 0.3], scale: [0, 1, 0.8] }}
                transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, repeatType: 'reverse' }}
              />
            </svg>
          </div>

          {/* ── FALLING CURRY LEAVES ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {leaves.map((lf) => (
              <motion.div
                key={lf.id}
                className="absolute"
                style={{ left: `${lf.x}%`, top: -50, width: lf.size, height: lf.size * 2.2 }}
                animate={{
                  y: ['0px', 'calc(100vh + 80px)'],
                  x: [0, lf.drift * 0.5, lf.drift, lf.drift * 0.7],
                  rotate: [0, lf.rot],
                  opacity: [0, 0.65, 0.65, 0],
                }}
                transition={{ duration: lf.dur, delay: lf.delay, repeat: Infinity, ease: 'linear' }}
              >
                <svg viewBox="0 0 22 48" width="100%" height="100%">
                  <path
                    d="M11 1 C4 8,1 18,5 30 C7 37,11 44,11 47 C11 44,15 37,17 30 C21 18,18 8,11 1Z"
                    fill="hsl(93,40%,42%)"
                  />
                  <path d="M11 3 Q11 24 11 47" stroke="hsl(93,52%,24%)" strokeWidth="0.8" fill="none" />
                </svg>
              </motion.div>
            ))}

            {/* Mustard seeds drifting */}
            {seeds.map((s) => (
              <motion.div
                key={`s-${s.id}`}
                className="absolute rounded-full"
                style={{
                  left: `${s.x}%`, top: -10,
                  width: s.size, height: s.size,
                  background: 'hsl(42,78%,65%)',
                }}
                animate={{
                  y: ['0px', 'calc(100vh + 40px)'],
                  opacity: [0, 0.7, 0.7, 0],
                  x: [(Math.random() - 0.5) * 40],
                }}
                transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>

          {/* ── HOT GLOW BEHIND JAR ── */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: isExiting ? 0 : [0, 0.7, 0.5], scale: [0.5, 1.2, 1] }}
            transition={{ duration: 1.8, delay: 0.2 }}
            style={{
              width: 320, height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(232,182,74,0.22) 0%, rgba(181,58,46,0.12) 50%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            aria-hidden="true"
          />

          {/* ── BURST PARTICLES ON COMPLETE ── */}
          {phase === 'burst' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * Math.PI * 2;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: Math.random() * 8 + 4,
                      height: Math.random() * 8 + 4,
                      background: i % 3 === 0 ? 'hsl(42,78%,65%)' : i % 3 === 1 ? 'hsl(4,65%,52%)' : 'hsl(93,38%,50%)',
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos(angle) * (100 + Math.random() * 120),
                      y: Math.sin(angle) * (100 + Math.random() * 120),
                      opacity: 0, scale: 0,
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                );
              })}
            </div>
          )}

          {/* ── MAIN CONTENT ── */}
          <div className="relative flex flex-col items-center gap-6 px-8 z-10">
            {/* Jar */}
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Shimmer aura */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, transparent 60%, rgba(232,182,74,0.5) 80%, transparent 100%)',
                  filter: 'blur(8px)',
                  transform: 'scale(1.4)',
                }}
                aria-hidden="true"
              />
              <PremiumJar progress={progress} />
            </motion.div>

            {/* Brand Name — epic reveal */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* KONJOONDU */}
              <div className="flex justify-center" aria-label="Konjoondu">
                {brand1.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 40, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.5 + i * 0.055, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 'clamp(36px, 7vw, 68px)',
                      fontWeight: 900,
                      color: 'hsl(42,78%,62%)',
                      letterSpacing: '0.04em',
                      textShadow: '0 0 40px rgba(232,182,74,0.5), 0 4px 0 rgba(0,0,0,0.4)',
                      lineHeight: 1,
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>

              {/* OORGAI */}
              <div className="flex justify-center" aria-label="Oorgai">
                {brand2.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.7 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 'clamp(28px, 5vw, 52px)',
                      fontWeight: 900,
                      color: '#FFF9F3',
                      letterSpacing: '0.22em',
                      textShadow: '0 2px 0 rgba(0,0,0,0.5)',
                      lineHeight: 1,
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-3 mb-2 h-px"
                style={{
                  width: 200,
                  background: 'linear-gradient(90deg, transparent, hsl(42,78%,62%), transparent)',
                }}
              />

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 0.7, letterSpacing: '0.3em' }}
                transition={{ delay: 1.6, duration: 0.8 }}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 10,
                  color: 'hsl(33,50%,75%)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Handcrafted · Heritage · South India
              </motion.p>
            </motion.div>

            {/* Progress container */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="w-72"
            >
              {/* Track */}
              <div className="relative h-1 rounded-full overflow-hidden mb-2"
                style={{ background: 'rgba(255,249,243,0.1)' }}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, hsl(4,60%,44%), hsl(42,78%,62%), hsl(4,60%,44%))',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Glow dot at the tip */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${progress}%`,
                    width: 8, height: 8,
                    background: 'hsl(42,78%,75%)',
                    boxShadow: '0 0 8px hsl(42,78%,65%)',
                    transform: 'translateX(-50%) translateY(-50%)',
                  }}
                />
              </div>

              {/* Percentage + label row */}
              <div className="flex justify-between items-center">
                <span style={{ fontFamily: 'Poppins', fontSize: 11, color: 'rgba(255,249,243,0.4)', fontWeight: 500 }}>
                  {progress < 40 ? 'Gathering spices...' : progress < 75 ? 'Preparing pickles...' : 'Almost ready...'}
                </span>
                <span style={{ fontFamily: 'Poppins', fontSize: 12, color: 'hsl(42,78%,62%)', fontWeight: 700 }}>
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── CORNER SPICE ORNAMENTS ── */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((pos, i) => (
            <motion.div
              key={pos}
              className="absolute"
              style={{
                top: pos.startsWith('t') ? 24 : 'auto',
                bottom: pos.startsWith('b') ? 24 : 'auto',
                left: pos.endsWith('l') ? 24 : 'auto',
                right: pos.endsWith('r') ? 24 : 'auto',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.4, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48">
                {/* Mini pickle jar corner ornament */}
                <rect x="14" y="6" width="20" height="6" rx="2" fill="hsl(25,42%,48%)" />
                <rect x="10" y="12" width="28" height="30" rx="6" fill="hsl(4,60%,44%)" opacity="0.6" />
                <ellipse cx="24" cy="27" rx="6" ry="8" fill="hsl(93,38%,42%)" opacity="0.7" />
              </svg>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
