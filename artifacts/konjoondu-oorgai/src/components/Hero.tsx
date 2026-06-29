import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Heart, Leaf, Clock, ArrowDown, ShoppingBag, BookOpen } from 'lucide-react';
import heroImg from '@assets/hero-bg.jpg';

// ── Animated headline — white text on dark overlay ──────────────
function AnimatedHeadline() {
  // Each entry is a single line. Words are joined with a real space so they
  // never merge visually — we render the whole line as one motion.span.
  const lines: { text: string; accent?: boolean }[] = [
    { text: 'Every Jar' },
    { text: 'Holds a' },
    { text: 'Family', accent: true },
    { text: 'Tradition.' },
  ];

  return (
    <h1 className="mb-8" aria-label="Every Jar Holds a Family Tradition.">
      {lines.map((line, li) => (
        <div key={li} className="overflow-hidden leading-[1.04] mb-0.5">
          <motion.span
            initial={{ y: '115%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.08 + li * 0.16,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="block"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(30px, 4.8vw, 64px)',
              lineHeight: 1.04,
              letterSpacing: '-0.025em',
              color: line.accent ? 'hsl(42, 82%, 62%)' : '#FFF9F0',
              textShadow: line.accent
                ? '0 0 40px rgba(232,182,74,0.4), 0 2px 12px rgba(0,0,0,0.5)'
                : '0 2px 16px rgba(0,0,0,0.55)',
            }}
          >
            {line.text}
          </motion.span>
        </div>
      ))}
    </h1>
  );
}

// ── Trust badge ─────────────────────────────────────────────────
function Badge({
  icon, title, sub, delay, bg,
}: {
  icon: React.ReactNode; title: string; sub: string; delay: number; bg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.03 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-default"
      style={{
        background: 'rgba(255,249,243,0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
      >
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm leading-none mb-0.5"
          style={{ color: '#FFF9F0', fontFamily: 'Poppins,sans-serif' }}>
          {title}
        </p>
        <p className="text-xs leading-none"
          style={{ color: 'rgba(255,249,240,0.6)', fontFamily: 'Poppins,sans-serif' }}>
          {sub}
        </p>
      </div>
    </motion.div>
  );
}

// ── Hero ────────────────────────────────────────────────────────
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imgY       = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const textY      = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const overlayOp  = useTransform(scrollYProgress, [0, 0.7], [0.82, 0.96]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden"
    >
      {/* ── PARALLAX IMAGE ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: imgY }}
      >
        <img
          src={heroImg}
          alt="Rustic South Indian kitchen with ceramic pickle jars"
          className="w-full h-full object-cover object-center scale-110"
        />
      </motion.div>

      {/* ── DARK CINEMATIC OVERLAY ── */}
      {/* Primary dark gradient — ensures legibility */}
      <motion.div
        className="absolute inset-0 z-[1]"
        style={{ opacity: overlayOp }}
      >
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(
              108deg,
              rgba(12,5,2,0.92) 0%,
              rgba(18,8,3,0.82) 35%,
              rgba(18,8,3,0.55) 60%,
              rgba(18,8,3,0.18) 80%,
              transparent 100%
            )`,
          }}
        />
      </motion.div>

      {/* Warm amber glow bottom-left — brand warmth */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 60% at 10% 85%, rgba(181,90,30,0.22) 0%, transparent 65%),' +
            'radial-gradient(ellipse 40% 45% at 0% 50%, rgba(232,140,30,0.1) 0%, transparent 60%)',
        }}
      />

      {/* Top fade — blends into page top cleanly */}
      <div
        className="absolute top-0 left-0 right-0 z-[1] h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(12,5,2,0.45) 0%, transparent 100%)' }}
      />

      {/* ── CONTENT ── */}
      <motion.div
        className="relative z-10 container mx-auto px-6 md:px-14 pt-28 pb-20 flex flex-col justify-between min-h-[100dvh]"
        style={{ y: textY }}
      >
        <div className="flex-1 flex flex-col justify-center max-w-3xl">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 self-start"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em]"
              style={{
                background: 'rgba(232,140,30,0.18)',
                color: 'hsl(42,82%,72%)',
                border: '1px solid rgba(232,140,30,0.3)',
                backdropFilter: 'blur(10px)',
                fontFamily: 'Poppins,sans-serif',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                style={{ background: 'hsl(42,82%,65%)' }}
              />
              Handcrafted in South India · Family Heritage
            </span>
          </motion.div>

          {/* Headline */}
          <AnimatedHeadline />

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82, duration: 0.65 }}
            className="text-lg md:text-xl max-w-lg mb-10 leading-relaxed"
            style={{
              color: 'rgba(255,249,240,0.72)',
              fontFamily: 'Poppins,sans-serif',
              fontWeight: 400,
              textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            }}
          >
            Handcrafted homemade pickles prepared with{' '}
            <em style={{ fontStyle: 'normal', color: 'hsl(42,82%,68%)', fontWeight: 600 }}>
              authentic recipes
            </em>
            , premium ingredients, and the warmth of home — one jar at a time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.55 }}
            className="flex flex-wrap gap-3 mb-14"
          >
            {/* Primary */}
            <motion.a
              href="#products"
              whileHover={{ scale: 1.04, boxShadow: '0 14px 44px rgba(181,58,46,0.45)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-7 h-14 rounded-full font-bold text-base cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, hsl(4,68%,50%), hsl(4,60%,36%))',
                color: '#FFF9F0',
                fontFamily: 'Poppins,sans-serif',
                boxShadow: '0 8px 28px rgba(181,58,46,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
                textDecoration: 'none',
              }}
            >
              <ShoppingBag size={18} />
              Shop Now
            </motion.a>

            {/* Secondary glass */}
            <motion.a
              href="#products"
              whileHover={{ scale: 1.04, background: 'rgba(255,249,240,0.22)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-7 h-14 rounded-full font-bold text-base cursor-pointer"
              style={{
                background: 'rgba(255,249,240,0.12)',
                color: '#FFF9F0',
                fontFamily: 'Poppins,sans-serif',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(255,249,240,0.28)',
                textDecoration: 'none',
              }}
            >
              Explore Pickles
            </motion.a>

            {/* Ghost */}
            <motion.a
              href="#story"
              whileHover={{ scale: 1.04, color: 'hsl(42,82%,68%)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-7 h-14 rounded-full font-semibold text-base cursor-pointer"
              style={{
                color: 'rgba(255,249,240,0.7)',
                fontFamily: 'Poppins,sans-serif',
                background: 'transparent',
                border: '1.5px solid rgba(255,249,240,0.22)',
                textDecoration: 'none',
              }}
            >
              <BookOpen size={17} />
              Our Story
            </motion.a>
          </motion.div>

          {/* Trust badges — dark glass style */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Badge delay={1.2} bg="hsl(42,75%,48%)"
              icon={<Star size={16} strokeWidth={2} style={{ color: '#FFF9F0' }} fill="#FFF9F0" />}
              title="5.0 Rating" sub="Loved by families" />
            <Badge delay={1.3} bg="hsl(4,60%,44%)"
              icon={<Heart size={16} strokeWidth={2} style={{ color: '#FFF9F0' }} fill="#FFF9F0" />}
              title="Homemade" sub="Family recipes" />
            <Badge delay={1.4} bg="hsl(93,32%,40%)"
              icon={<Leaf size={16} strokeWidth={2} style={{ color: '#FFF9F0' }} fill="#FFF9F0" />}
              title="100% Natural" sub="No preservatives" />
            <Badge delay={1.5} bg="hsl(25,38%,44%)"
              icon={<Clock size={16} strokeWidth={2} style={{ color: '#FFF9F0' }} />}
              title="Sun Cured" sub="Traditional process" />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="flex flex-col items-start gap-2 mt-10"
        >
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase"
            style={{ color: 'rgba(255,249,240,0.45)', fontFamily: 'Poppins,sans-serif' }}
          >
            Scroll to discover
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={18} style={{ color: 'rgba(255,249,240,0.5)' }} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom wave blending into next section */}
      <div className="absolute bottom-0 left-0 right-0 z-[2]" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" style={{ width: '100%', height: 72 }}>
          <path
            d="M0,52 C200,8 400,68 720,44 C960,22 1200,66 1440,36 L1440,72 L0,72 Z"
            fill="hsl(30,100%,97%)"
          />
        </svg>
      </div>
    </section>
  );
}
