import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const flavorData = [
  { id: 'prawn',    name: 'Prawn',    emoji: '🦐', profile: 'Bold & Tangy',      pairings: 'Hot Steamed Rice, Curd Rice, Crispy Dosa',   color: '#F97316', angle: 0   },
  { id: 'chicken',  name: 'Chicken',  emoji: '🍗', profile: 'Rich & Spicy',      pairings: 'Plain Rice, Biryani, Soft Parotta',           color: '#DC2626', angle: 45  },
  { id: 'mutton',   name: 'Mutton',   emoji: '🥩', profile: 'Intense & Smoky',   pairings: 'Plain Rice, Kanji (Porridge), Hot Roti',      color: '#9F1239', angle: 90  },
  { id: 'beef',     name: 'Beef',     emoji: '🐄', profile: 'Deep & Fiery',      pairings: 'Porotta, Chapati, Steamed Rice',              color: '#7C2D12', angle: 135 },
  { id: 'nethili',  name: 'Nethili',  emoji: '🐟', profile: 'Crispy & Umami',    pairings: 'Curd Rice, Rasam Rice, Sambar Rice',          color: '#0284C7', angle: 180 },
  { id: 'soorai',   name: 'Soorai',   emoji: '🐠', profile: 'Smoky & Bold',      pairings: 'Hot Rice, Idli, Kuzhambu Rice',              color: '#0369A1', angle: 225 },
  { id: 'vaala',    name: 'Vaala',    emoji: '🐡', profile: 'Earthy & Salty',    pairings: 'Hot Rice & Ghee, Rasam, Plain Porridge',     color: '#065F46', angle: 270 },
  { id: 'maldives', name: 'Maldives', emoji: '🌊', profile: 'Oceanic & Umami',   pairings: 'Idli, Dosa, Curd Rice, Ven Pongal',          color: '#1E40AF', angle: 315 },
];

/** Responsive wheel radius derived from container width via ResizeObserver */
function useWheelRadius(containerRef: React.RefObject<HTMLDivElement | null>): number {
  const [radius, setRadius] = useState(120);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = (w: number) => {
      if (w >= 420) setRadius(155);
      else if (w >= 340) setRadius(128);
      else setRadius(105);
    };
    update(el.offsetWidth);
    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);
  return radius;
}

export default function FlavorWheel() {
  const [active, setActive] = useState(flavorData[0]);
  const [autoPlay, setAutoPlay] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const radius = useWheelRadius(containerRef);

  /* Auto-advance every 2.5s when autoPlay is on */
  useEffect(() => {
    if (!autoPlay) return;
    intervalRef.current = setInterval(() => {
      setActive(prev => {
        const idx = flavorData.findIndex(f => f.id === prev.id);
        return flavorData[(idx + 1) % flavorData.length];
      });
    }, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay]);

  /* Unmount cleanup */
  useEffect(() => () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function handleClick(flavor: typeof flavorData[0]) {
    // Pause auto-play
    setAutoPlay(false);
    setActive(flavor);

    // Clear any previously-scheduled resume before setting a new one
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null;
      setAutoPlay(true);
    }, 8000);
  }

  return (
    <section className="py-20 sm:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">The Flavor Wheel</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Our non-veg pickle range — discover which one is calling your name right now.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-28">

          {/* The Wheel */}
          <div
            ref={containerRef}
            className="relative w-[290px] h-[290px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px] flex items-center justify-center flex-shrink-0"
          >
            {/* Outer decorative rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1.5px dashed rgba(139,94,60,0.15)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-4 rounded-full" style={{ border: '1px solid rgba(139,94,60,0.08)' }} />

            {/* Center Hub */}
            <div
              className="absolute w-20 h-20 sm:w-24 sm:h-24 bg-background rounded-full z-20 flex items-center justify-center"
              style={{
                boxShadow: '0 0 0 4px rgba(181,58,46,0.12), 0 8px 32px rgba(0,0,0,0.12)',
                border: '3px solid rgba(181,58,46,0.15)',
              }}
            >
              <div className="text-center">
                <div style={{ fontSize: 22 }}>🥒</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'hsl(4,60%,44%)', letterSpacing: '0.08em', marginTop: 2 }}>
                  PICKLES
                </div>
              </div>
            </div>

            {/* Flavor buttons */}
            {flavorData.map((flavor) => {
              const rad = (flavor.angle - 90) * (Math.PI / 180);
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              const isActive = active.id === flavor.id;
              return (
                <motion.button
                  key={flavor.id}
                  onClick={() => handleClick(flavor)}
                  className="absolute z-10 rounded-full flex flex-col items-center justify-center select-none"
                  style={{
                    x, y,
                    width: 58,
                    height: 58,
                    backgroundColor: flavor.color,
                    border: `2px solid ${isActive ? '#fff' : 'rgba(255,255,255,0.25)'}`,
                    cursor: 'pointer',
                  }}
                  animate={{
                    opacity: isActive ? 1 : 0.65,
                    scale: isActive ? 1.18 : 1,
                    boxShadow: isActive
                      ? `0 0 0 5px ${flavor.color}35, 0 8px 28px ${flavor.color}55`
                      : '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.12, opacity: 1 }}
                >
                  <span style={{ fontSize: 18 }}>{flavor.emoji}</span>
                  <span style={{
                    fontSize: 7.5, fontWeight: 800, color: '#fff', marginTop: 2,
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
                  }}>
                    {flavor.name}
                  </span>
                </motion.button>
              );
            })}

            {/* SVG spokes */}
            <svg className="absolute inset-0 w-full h-full z-0" style={{ overflow: 'visible' }}>
              {flavorData.map((flavor) => {
                const cx = containerRef.current ? containerRef.current.offsetWidth / 2 : 210;
                const cy = containerRef.current ? containerRef.current.offsetHeight / 2 : 210;
                const rad = (flavor.angle - 90) * (Math.PI / 180);
                const x2 = cx + Math.cos(rad) * radius;
                const y2 = cy + Math.sin(rad) * radius;
                const isActive = active.id === flavor.id;
                return (
                  <line
                    key={`spoke-${flavor.id}`}
                    x1={cx} y1={cy} x2={x2} y2={y2}
                    stroke={isActive ? flavor.color : 'rgba(139,94,60,0.12)'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? 'none' : '4 5'}
                    style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Details Panel */}
          <div className="w-full md:w-96 min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 20, y: 8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: -20, y: 8 }}
                transition={{ duration: 0.32 }}
                className="glass p-6 sm:p-8 rounded-3xl"
              >
                <div className="w-10 h-1.5 rounded-full mb-5" style={{ backgroundColor: active.color }} />
                <div className="text-4xl mb-3">{active.emoji}</div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">{active.name} Pickle</h3>
                <p className="text-lg font-semibold mb-5" style={{ color: active.color }}>{active.profile}</p>

                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Perfect Pairings
                  </h4>
                  <p className="text-base font-medium">{active.pairings}</p>
                </div>

                {/* Dot pagination / auto-play indicator */}
                <div className="mt-5 pt-4 border-t border-border/40 flex items-center gap-2.5">
                  <span className="text-xs text-muted-foreground">{autoPlay ? 'Auto' : 'Paused'}</span>
                  <div className="flex gap-1.5">
                    {flavorData.map(f => (
                      <button
                        key={f.id}
                        onClick={() => handleClick(f)}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: f.id === active.id ? 18 : 6,
                          height: 6,
                          background: f.id === active.id ? active.color : 'rgba(139,94,60,0.2)',
                        }}
                        aria-label={`Go to ${f.name}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
