import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import prawnImg from '@/assets/prawn.png';
import fishImg from '@/assets/fish.png';

function MangoCubeSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="18" height="18" rx="4" fill={`hsla(42,85%,62%,${opacity})`} />
      <rect x="2.5" y="2.5" width="8" height="5" rx="1.5" fill={`rgba(255,255,255,${opacity * 0.35})`} />
    </svg>
  );
}

function StarAniseSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const cx = 20 + Math.cos(a) * 9;
        const cy = 20 + Math.sin(a) * 9;
        const tipX = 20 + Math.cos(a) * 16;
        const tipY = 20 + Math.sin(a) * 16;
        return (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx="4" ry="2"
              transform={`rotate(${(i / 8) * 360},${cx},${cy})`}
              fill={`hsla(30,48%,30%,${opacity * 0.85})`} />
            <circle cx={tipX} cy={tipY} r="1.8" fill={`hsla(25,50%,26%,${opacity})`} />
          </g>
        );
      })}
      <circle cx="20" cy="20" r="3.5" fill={`hsla(25,45%,28%,${opacity})`} />
      <circle cx="20" cy="20" r="1.5" fill={`hsla(42,60%,55%,${opacity * 0.8})`} />
    </svg>
  );
}

function MustardSeedSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r="4" fill={`hsla(45,75%,60%,${opacity})`} />
      <circle cx="4" cy="4" r="1.5" fill={`rgba(255,255,255,${opacity * 0.3})`} />
    </svg>
  );
}

// ─── Particle data ────────────────────────────────────────────────────────────

function rnd(min: number, max: number) { return Math.random() * (max - min) + min; }
function coin() { return Math.random() > 0.5 ? 1 : -1; }

type PType = 'prawn' | 'fish' | 'mango-cube' | 'star-anise' | 'mustard';

interface Particle {
  id: number;
  type: PType;
  x: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  rotEnd: number;
}

function buildParticles(): Particle[] {
  const list: Particle[] = [];
  let id = 0;

  const add = (type: PType, count: number, sizeFn: () => number, opts: () => Partial<Particle>) => {
    for (let i = 0; i < count; i++) {
      list.push({
        id: id++,
        type,
        x: rnd(2, 95),
        size: sizeFn(),
        opacity: rnd(0.55, 0.82),
        duration: rnd(14, 26),
        delay: rnd(0, 20),
        driftX: rnd(50, 110) * coin(),
        rotEnd: rnd(180, 400) * coin(),
        ...opts(),
      });
    }
  };

  // 🦐 Prawns — real photo, a few prominent ones
  add('prawn', 5,
    () => rnd(70, 100),
    () => ({ duration: rnd(18, 30), opacity: rnd(0.55, 0.78), delay: rnd(0, 8) }),
  );
  // 🐟 Fish — real photo, slow and graceful
  add('fish', 4,
    () => rnd(90, 120),
    () => ({ duration: rnd(22, 38), opacity: rnd(0.5, 0.72), driftX: rnd(30, 70) * coin(), delay: rnd(0, 10) }),
  );
  // ⭐ Star anise — medium, spinning
  add('star-anise', 6,
    () => rnd(18, 28),
    () => ({ duration: rnd(18, 32), opacity: rnd(0.3, 0.52), rotEnd: rnd(720, 1440) }),
  );
  // · Mustard seeds — tiny accent dots
  add('mustard', 18,
    () => rnd(5, 9),
    () => ({ duration: rnd(10, 18), opacity: rnd(0.5, 0.8), driftX: rnd(10, 35) * coin() }),
  );

  return list;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AmbientEffects() {
  const particles = useMemo(buildParticles, []);

  return (
    <div
      className="fixed inset-0 z-[1] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{ position: 'absolute', left: `${p.x}vw`, top: -180 }}
          animate={{
            y: ['0px', 'calc(100vh + 200px)'],
            x: [0, p.driftX * 0.4, p.driftX],
            rotate: [0, p.rotEnd],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.08, 0.88, 1],
          }}
        >
          {p.type === 'prawn' && (
            <img
              src={prawnImg}
              style={{ width: p.size, height: 'auto', display: 'block' }}
              alt=""
              aria-hidden="true"
            />
          )}
          {p.type === 'fish' && (
            <img
              src={fishImg}
              style={{ width: p.size, height: 'auto', display: 'block' }}
              alt=""
              aria-hidden="true"
            />
          )}
          {p.type === 'star-anise' && <StarAniseSVG size={p.size}  opacity={1} />}
          {p.type === 'mustard'    && <MustardSeedSVG size={p.size} opacity={1} />}
        </motion.div>
      ))}

      {/* Warm atmospheric overlays */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse 70% 50% at 15% 20%, rgba(232,182,74,0.055) 0%, transparent 60%),' +
            'radial-gradient(ellipse 55% 40% at 85% 75%, rgba(107,142,74,0.045) 0%, transparent 60%)',
        }}
      />
      {/* Noise grain texture */}
      <div
        style={{
          position: 'absolute', inset: 0,
          opacity: 0.025,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  );
}
