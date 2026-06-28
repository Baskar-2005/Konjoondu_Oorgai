import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

// Curry leaf SVG for loading particles
function CurryLeaf({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 30 60"
      style={style}
      aria-hidden="true"
    >
      <path
        d="M15 2 C5 12, 2 25, 8 38 C10 44, 15 52, 15 58 C15 52, 20 44, 22 38 C28 25, 25 12, 15 2Z"
        fill="hsl(93, 32%, 42%)"
        opacity="0.7"
      />
      <path
        d="M15 8 C15 8, 15 45, 15 58"
        stroke="hsl(93, 45%, 30%)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

// Pickle jar SVG logo
function PickleJarLogo({ progress }: { progress: number }) {
  const fillHeight = 45 * (progress / 100);
  const fillY = 55 - fillHeight;

  return (
    <svg viewBox="0 0 120 140" width="100" height="120" aria-label="Konjoondu Oorgai jar logo">
      {/* Jar lid */}
      <rect x="28" y="18" width="64" height="18" rx="5" fill="hsl(25, 38%, 39%)" />
      <rect x="22" y="22" width="76" height="12" rx="4" fill="hsl(25, 38%, 48%)" />
      {/* Jar body */}
      <rect x="20" y="34" width="80" height="80" rx="12" fill="rgba(255,249,243,0.15)" stroke="rgba(255,249,243,0.5)" strokeWidth="2" />
      {/* Pickle fill (animated) */}
      <clipPath id="jarClip">
        <rect x="21" y="35" width="78" height="78" rx="10" />
      </clipPath>
      <rect
        x="21"
        y={fillY + 10}
        width="78"
        height={fillHeight}
        fill="hsl(4, 60%, 44%)"
        opacity="0.85"
        clipPath="url(#jarClip)"
      />
      {/* Liquid surface wave */}
      {progress > 5 && (
        <ellipse
          cx="60"
          cy={fillY + 10}
          rx="39"
          ry="4"
          fill="hsl(4, 60%, 38%)"
          opacity="0.6"
          clipPath="url(#jarClip)"
        />
      )}
      {/* Jar shine */}
      <rect x="30" y="40" width="10" height="50" rx="5" fill="white" opacity="0.12" />
      {/* Label area */}
      <rect x="30" y="55" width="60" height="40" rx="6" fill="rgba(255,249,243,0.2)" />
      {/* Decorative curry leaf on label */}
      <ellipse cx="60" cy="75" rx="12" ry="16" fill="hsl(93, 32%, 42%)" opacity="0.6" />
      <line x1="60" y1="59" x2="60" y2="91" stroke="hsl(93, 45%, 25%)" strokeWidth="1" opacity="0.5" />
      {/* Bottom */}
      <ellipse cx="60" cy="113" rx="38" ry="5" fill="rgba(0,0,0,0.08)" />
    </svg>
  );
}

const LOADING_DURATION = 2800; // ms

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const [leafParticles] = useState(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 18 + 10,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 80,
    }))
  );

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const raw = (elapsed / LOADING_DURATION) * 100;
      const eased = Math.min(100, raw < 80 ? raw * 1.05 : 80 + (raw - 80) * 3);
      setProgress(Math.min(100, eased));
      if (eased >= 100) {
        clearInterval(interval);
        setPhase('done');
        setTimeout(onComplete, 700);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [onComplete]);

  const brand1 = 'Konjoondu';
  const brand2 = 'Oorgai';

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FFF9F3 0%, #F4EBDD 50%, #FFF0DC 100%)' }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)', transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
        >
          {/* Ambient leaf particles during loading */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {leafParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute"
                style={{ left: `${p.x}%`, top: '-60px', width: p.size, height: p.size * 2 }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, p.drift, p.drift * 0.5, p.drift * 1.3],
                  rotate: [0, 180, 360],
                  opacity: [0, 0.6, 0.6, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <CurryLeaf style={{ width: '100%', height: '100%' }} />
              </motion.div>
            ))}
          </div>

          {/* Warm sunlight radial background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{
              background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(232,182,74,0.18) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center gap-8 px-6">
            {/* Jar logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <PickleJarLogo progress={progress} />
              {/* Shimmer ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{
                  background: 'conic-gradient(from 0deg, transparent 70%, rgba(232,182,74,0.4) 100%)',
                  borderRadius: '50%',
                }}
                aria-hidden="true"
              />
            </motion.div>

            {/* Brand name */}
            <div className="text-center space-y-1">
              {/* "Konjoondu" word */}
              <div className="flex justify-center overflow-hidden" aria-label="Konjoondu">
                {brand1.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                    className="text-5xl md:text-6xl font-black tracking-tight"
                    style={{
                      color: 'hsl(4, 60%, 44%)',
                      textShadow: '0 2px 20px rgba(181,58,46,0.2)',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              {/* "Oorgai" word */}
              <div className="flex justify-center overflow-hidden" aria-label="Oorgai">
                {brand2.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.4 + (brand1.length + i) * 0.06, duration: 0.5, ease: 'easeOut' }}
                    className="text-5xl md:text-6xl font-black tracking-tight"
                    style={{
                      color: 'hsl(18, 18%, 14%)',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="text-sm font-medium tracking-[0.25em] uppercase mt-3"
                style={{ color: 'hsl(25, 38%, 39%)', fontFamily: 'Poppins, sans-serif' }}
              >
                Handcrafted · Heritage · South India
              </motion.p>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-64 space-y-2"
            >
              <div
                className="relative h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(139,94,60,0.15)' }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, hsl(4,60%,44%), hsl(42,78%,60%))',
                    width: `${progress}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
                {/* Shimmer on progress bar */}
                <motion.div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    width: '40%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    left: `${Math.max(0, progress - 40)}%`,
                  }}
                />
              </div>
              <motion.p
                className="text-center text-xs font-semibold"
                style={{ color: 'hsl(25, 38%, 50%)', fontFamily: 'Poppins, sans-serif' }}
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>
          </div>

          {/* Bottom decorative spice dots */}
          <div className="absolute bottom-10 flex gap-3" aria-hidden="true">
            {['hsl(4,60%,44%)', 'hsl(42,78%,60%)', 'hsl(93,32%,42%)', 'hsl(25,38%,39%)'].map((color, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
