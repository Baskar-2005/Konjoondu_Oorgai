import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// ── Curry Leaf SVG ──────────────────────────────────────────────
function CurryLeafSVG({ width, opacity }: { width: number; opacity: number }) {
  const h = width * 2.2;
  return (
    <svg width={width} height={h} viewBox="0 0 22 48" fill="none" aria-hidden="true">
      {/* Main leaf body */}
      <path
        d="M11 1 C4 8, 1 18, 5 30 C7 37, 11 44, 11 47 C11 44, 15 37, 17 30 C21 18, 18 8, 11 1Z"
        fill="hsl(93, 38%, 40%)"
        opacity={opacity}
      />
      {/* Midrib */}
      <path d="M11 3 Q11 24 11 47" stroke="hsl(93, 50%, 25%)" strokeWidth="0.7" opacity={opacity * 0.7} fill="none" />
      {/* Lateral veins */}
      <path d="M11 14 Q7 16 5 18 M11 22 Q7 23 5 25 M11 30 Q7 30 6 32" stroke="hsl(93, 50%, 25%)" strokeWidth="0.4" opacity={opacity * 0.5} fill="none" />
      <path d="M11 14 Q15 16 17 18 M11 22 Q15 23 17 25 M11 30 Q15 30 16 32" stroke="hsl(93, 50%, 25%)" strokeWidth="0.4" opacity={opacity * 0.5} fill="none" />
    </svg>
  );
}

// ── Mango Leaf SVG ──────────────────────────────────────────────
function MangoLeafSVG({ width, opacity }: { width: number; opacity: number }) {
  const h = width * 3.2;
  return (
    <svg width={width} height={h} viewBox="0 0 24 76" fill="none" aria-hidden="true">
      <path
        d="M12 2 C2 14, 0 30, 4 46 C7 57, 12 70, 12 74 C12 70, 17 57, 20 46 C24 30, 22 14, 12 2Z"
        fill="hsl(88, 30%, 38%)"
        opacity={opacity}
      />
      <path d="M12 4 Q12 38 12 74" stroke="hsl(88, 40%, 22%)" strokeWidth="0.8" opacity={opacity * 0.6} fill="none" />
      <path d="M12 20 Q7 22 4 26 M12 34 Q7 36 4 39 M12 48 Q7 49 5 52" stroke="hsl(88, 40%, 22%)" strokeWidth="0.35" opacity={opacity * 0.45} fill="none" />
      <path d="M12 20 Q17 22 20 26 M12 34 Q17 36 20 39 M12 48 Q17 49 19 52" stroke="hsl(88, 40%, 22%)" strokeWidth="0.35" opacity={opacity * 0.45} fill="none" />
    </svg>
  );
}

// ── Mango Cube SVG ──────────────────────────────────────────────
function MangoCubeSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" rx="3" fill="hsl(42, 85%, 62%)" opacity={opacity} />
      <rect x="3" y="3" width="7" height="5" rx="1.5" fill="rgba(255,255,255,0.3)" opacity={opacity} />
      <rect x="4" y="10" width="4" height="3" rx="1" fill="rgba(255,255,255,0.15)" opacity={opacity} />
    </svg>
  );
}

// ── Star Anise SVG ──────────────────────────────────────────────
function StarAniseSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* 8 petals radiating from center */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = 20 + Math.cos(angle) * 4;
        const y1 = 20 + Math.sin(angle) * 4;
        const x2 = 20 + Math.cos(angle) * 14;
        const y2 = 20 + Math.sin(angle) * 14;
        const cx = 20 + Math.cos(angle) * 9;
        const cy = 20 + Math.sin(angle) * 9;
        return (
          <g key={i}>
            <ellipse
              cx={cx} cy={cy}
              rx="4.5" ry="2.2"
              transform={`rotate(${(i / 8) * 360}, ${cx}, ${cy})`}
              fill="hsl(30, 50%, 30%)"
              opacity={opacity * 0.85}
            />
            {/* Seed at tip */}
            <circle cx={x2} cy={y2} r="2" fill="hsl(25, 50%, 25%)" opacity={opacity} />
          </g>
        );
      })}
      {/* Center */}
      <circle cx="20" cy="20" r="3.5" fill="hsl(25, 45%, 28%)" opacity={opacity} />
      <circle cx="20" cy="20" r="1.5" fill="hsl(42, 60%, 55%)" opacity={opacity * 0.8} />
    </svg>
  );
}

// ── Particle definitions ─────────────────────────────────────────
type ParticleType = 'curry' | 'mango-leaf' | 'mango-cube' | 'star-anise';

interface Particle {
  id: number;
  type: ParticleType;
  x: number;          // start x (vw)
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;     // horizontal drift (px)
  rotation: number;   // end rotation
  rotationDir: number; // 1 or -1
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function useParticles(): Particle[] {
  return useMemo(() => {
    const particles: Particle[] = [];
    let id = 0;

    // 🥇 Curry leaves — best, most abundant
    for (let i = 0; i < 14; i++) {
      particles.push({
        id: id++,
        type: 'curry',
        x: rand(0, 100),
        size: rand(10, 24),
        opacity: rand(0.45, 0.75),
        duration: rand(14, 26),
        delay: rand(0, 16),
        driftX: rand(-90, 90),   // wind effect
        rotation: rand(200, 520),
        rotationDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    // 🥈 Mango leaves — a few, larger, slower
    for (let i = 0; i < 6; i++) {
      particles.push({
        id: id++,
        type: 'mango-leaf',
        x: rand(0, 100),
        size: rand(14, 28),
        opacity: rand(0.3, 0.55),
        duration: rand(20, 36),
        delay: rand(0, 18),
        driftX: rand(-50, 50),
        rotation: rand(100, 280),
        rotationDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    // 🥭 Mango cubes — tiny, soft bounce feel
    for (let i = 0; i < 8; i++) {
      particles.push({
        id: id++,
        type: 'mango-cube',
        x: rand(0, 100),
        size: rand(6, 13),
        opacity: rand(0.4, 0.7),
        duration: rand(12, 22),
        delay: rand(0, 20),
        driftX: rand(-30, 30),
        rotation: rand(90, 360),
        rotationDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    // ⭐ Star anise — a few, rotate while falling
    for (let i = 0; i < 5; i++) {
      particles.push({
        id: id++,
        type: 'star-anise',
        x: rand(0, 100),
        size: rand(14, 22),
        opacity: rand(0.3, 0.55),
        duration: rand(18, 30),
        delay: rand(0, 22),
        driftX: rand(-20, 20),
        rotation: rand(540, 1080),
        rotationDir: 1,
      });
    }

    return particles;
  }, []);
}

export default function AmbientEffects() {
  const particles = useParticles();

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => {
        const Component = {
          curry: CurryLeafSVG,
          'mango-leaf': MangoLeafSVG,
          'mango-cube': MangoCubeSVG,
          'star-anise': StarAniseSVG,
        }[p.type];

        // Mango cubes get a bounce path; others fall straight down with drift
        const isCube = p.type === 'mango-cube';
        const isStarAnise = p.type === 'star-anise';

        // Y travel: slightly beyond viewport
        const yEnd = typeof window !== 'undefined' ? window.innerHeight + 80 : 900;

        return (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}vw`,
              top: -60,
              width: p.size,
              willChange: 'transform, opacity',
            }}
            animate={{
              y: isCube
                ? [0, yEnd * 0.3, yEnd * 0.7, yEnd]
                : [0, yEnd],
              x: isCube
                ? [0, p.driftX * 0.4, p.driftX * -0.4, p.driftX * 0.2]
                : [0, p.driftX * 0.4, p.driftX, p.driftX * 0.6, p.driftX],
              rotate: [0, p.rotation * p.rotationDir],
              opacity: [0, p.opacity, p.opacity, p.opacity * 0.8, 0],
              // Mango cubes scale slightly to simulate bounce depth
              scale: isCube ? [0.8, 1, 0.9, 1.05, 1] : 1,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: isCube ? [0.22, 0.8, 0.6, 1] : 'linear',
              times: isCube
                ? [0, 0.3, 0.7, 1]
                : [0, 0.08, 0.92, 0.96, 1],
            }}
          >
            {p.type === 'curry' && <CurryLeafSVG width={p.size} opacity={p.opacity} />}
            {p.type === 'mango-leaf' && <MangoLeafSVG width={p.size} opacity={p.opacity} />}
            {p.type === 'mango-cube' && <MangoCubeSVG size={p.size} opacity={p.opacity} />}
            {p.type === 'star-anise' && <StarAniseSVG size={p.size} opacity={p.opacity} />}
          </motion.div>
        );
      })}

      {/* Warm atmospheric gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(232,182,74,0.06) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(107,142,74,0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  );
}
