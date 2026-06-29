import React, { useMemo } from 'react';

// ─── SVG Elements ─────────────────────────────────────────────────────────────

function CurryLeafSVG({ width, opacity }: { width: number; opacity: number }) {
  return (
    <svg width={width} height={width * 2.4} viewBox="0 0 22 52" fill="none" aria-hidden="true">
      <path
        d="M11 1 C4 8,1 18,5 30 C7 37,11 45,11 51 C11 45,15 37,17 30 C21 18,18 8,11 1Z"
        fill={`hsla(93,40%,40%,${opacity})`}
      />
      <path d="M11 3 Q11 26 11 51" stroke={`hsla(93,52%,24%,${opacity * 0.6})`} strokeWidth="0.7" fill="none" />
      <path d="M11 15 Q7 17 5 19 M11 25 Q7 26 5 28 M11 34 Q7 34 6 36" stroke={`hsla(93,50%,24%,${opacity * 0.4})`} strokeWidth="0.4" fill="none" />
      <path d="M11 15 Q15 17 17 19 M11 25 Q15 26 17 28 M11 34 Q15 34 16 36" stroke={`hsla(93,50%,24%,${opacity * 0.4})`} strokeWidth="0.4" fill="none" />
    </svg>
  );
}

function MangoLeafSVG({ width, opacity }: { width: number; opacity: number }) {
  return (
    <svg width={width} height={width * 3.4} viewBox="0 0 24 80" fill="none" aria-hidden="true">
      <path
        d="M12 2 C2 14,0 32,4 48 C7 59,12 72,12 78 C12 72,17 59,20 48 C24 32,22 14,12 2Z"
        fill={`hsla(88,32%,36%,${opacity})`}
      />
      <path d="M12 4 Q12 40 12 78" stroke={`hsla(88,42%,22%,${opacity * 0.55})`} strokeWidth="0.8" fill="none" />
    </svg>
  );
}

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

// ─── Types ────────────────────────────────────────────────────────────────────

type PType = 'curry' | 'mango-leaf' | 'mango-cube' | 'star-anise' | 'mustard';

interface Particle {
  id: number; type: PType;
  x: number;         // vw %
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;    // total horizontal px drift
  rotEnd: number;    // final rotation deg
  bouncy: boolean;
}

function rnd(min: number, max: number) { return Math.random() * (max - min) + min; }
function coin() { return Math.random() > 0.5 ? 1 : -1; }

function buildParticles(): Particle[] {
  const list: Particle[] = [];
  let id = 0;

  const add = (type: PType, count: number, opts: Partial<Particle>) => {
    for (let i = 0; i < count; i++) {
      list.push({
        id: id++, type,
        x: rnd(0, 100),
        size: rnd(10, 20),
        opacity: rnd(0.45, 0.75),
        duration: rnd(14, 28),
        delay: rnd(0, 22),
        driftX: rnd(60, 130) * coin(),
        rotEnd: rnd(200, 560) * coin(),
        bouncy: false,
        ...opts,
      });
    }
  };

  // 🥇 Curry leaves — dominant, authentic South Indian feel
  add('curry',      16, { size: rnd(10, 24), duration: rnd(14, 26), opacity: rnd(0.5, 0.75) });
  // 🥈 Mango leaves — graceful, slow
  add('mango-leaf',  7, { size: rnd(14, 28), duration: rnd(22, 38), opacity: rnd(0.3, 0.5), driftX: rnd(30, 60) * coin() });
  // 🥭 Mango cubes — tiny, bouncy
  add('mango-cube',  9, { size: rnd(6, 13), duration: rnd(10, 20), opacity: rnd(0.45, 0.7), bouncy: true });
  // ⭐ Star anise — rotate as they fall
  add('star-anise',  6, { size: rnd(14, 22), duration: rnd(18, 32), opacity: rnd(0.3, 0.52), rotEnd: rnd(720, 1440) });
  // · Mustard seeds — tiny, plentiful
  add('mustard',    14, { size: rnd(4, 8),  duration: rnd(10, 18), opacity: rnd(0.5, 0.8), driftX: rnd(10, 35) * coin() });

  return list;
}

// ─── CSS keyframe stylesheet injected once ────────────────────────────────────

const STYLE_ID = 'ko-ambient-style';

function injectStyles(particles: Particle[]) {
  if (document.getElementById(STYLE_ID)) return;
  const rules = particles.map((p) => {
    const driftMid = p.driftX * 0.45;
    const driftAlt = p.driftX * (p.bouncy ? -0.3 : 0.8);
    const scaleFrames = p.bouncy
      ? `transform: translateX(${driftMid}px) rotate(${p.rotEnd * 0.5}deg) scale(1.1);`
      : `transform: translateX(${driftAlt}px) rotate(${p.rotEnd * 0.7}deg) scale(1);`;

    return `
      @keyframes ko-fall-${p.id} {
        0%   { transform: translateY(0px)   translateX(0)              rotate(0deg)          scale(${p.bouncy ? 0.8 : 1}); opacity: 0; }
        5%   { opacity: ${p.opacity}; }
        45%  { ${scaleFrames} }
        90%  { transform: translateY(calc(100vh + 60px)) translateX(${p.driftX}px) rotate(${p.rotEnd}deg) scale(${p.bouncy ? 1.05 : 1}); opacity: ${p.opacity * 0.8}; }
        100% { transform: translateY(calc(100vh + 80px)) translateX(${p.driftX}px) rotate(${p.rotEnd}deg) scale(${p.bouncy ? 0.9 : 1}); opacity: 0; }
      }
      .ko-p-${p.id} {
        position: absolute;
        left: ${p.x}vw;
        top: -60px;
        width: ${p.size}px;
        animation: ko-fall-${p.id} ${p.duration}s ${p.delay}s linear infinite;
        will-change: transform, opacity;
        pointer-events: none;
      }
    `;
  }).join('\n');

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = rules;
  document.head.appendChild(style);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AmbientEffects() {
  const particles = useMemo(buildParticles, []);

  React.useEffect(() => { injectStyles(particles); }, [particles]);

  return (
    <div
      className="fixed inset-0 z-[1] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div key={p.id} className={`ko-p-${p.id}`}>
          {p.type === 'curry'      && <CurryLeafSVG  width={p.size} opacity={p.opacity} />}
          {p.type === 'mango-leaf' && <MangoLeafSVG  width={p.size} opacity={p.opacity} />}
          {p.type === 'mango-cube' && <MangoCubeSVG  size={p.size}  opacity={p.opacity} />}
          {p.type === 'star-anise' && <StarAniseSVG  size={p.size}  opacity={p.opacity} />}
          {p.type === 'mustard'    && <MustardSeedSVG size={p.size} opacity={p.opacity} />}
        </div>
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
