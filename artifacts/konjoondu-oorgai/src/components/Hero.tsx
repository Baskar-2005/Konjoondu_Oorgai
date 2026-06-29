import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { Star, Heart, Leaf, Clock, ArrowDown, ShoppingBag, BookOpen } from 'lucide-react';
import heroImg from '@assets/hero-bg.jpg';

// Cinematic word-by-word reveal using Framer Motion
function AnimatedHeadline() {
  const lines = [
    { words: ['Every', 'Jar'], color: 'default' },
    { words: ['Holds', 'a'], color: 'default' },
    { words: ['Family'], color: 'accent' },
    { words: ['Tradition.'], color: 'default' },
  ];

  return (
    <h1 className="mb-8" aria-label="Every Jar Holds a Family Tradition.">
      {lines.map((line, li) => (
        <div key={li} className="overflow-hidden leading-none mb-1">
          <motion.div
            className="flex flex-wrap gap-x-[0.3em]"
            initial="hidden"
            animate="visible"
          >
            {line.words.map((word, wi) => (
              <motion.span
                key={wi}
                variants={{
                  hidden: { y: '110%', opacity: 0 },
                  visible: {
                    y: 0, opacity: 1,
                    transition: {
                      delay: 0.1 + li * 0.18 + wi * 0.08,
                      duration: 0.75,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                className="inline-block"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(40px, 6.5vw, 88px)',
                  lineHeight: 1.05,
                  color: line.color === 'accent' ? 'hsl(4, 60%, 44%)' : 'hsl(18, 18%, 10%)',
                  letterSpacing: '-0.02em',
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </div>
      ))}
    </h1>
  );
}

function FloatingBadge({
  icon, title, sub, delay, color,
}: {
  icon: React.ReactNode; title: string; sub: string; delay: number; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.03 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-default"
      style={{
        background: 'rgba(255,249,243,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(139,94,60,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color }}
      >
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm leading-none mb-0.5" style={{ color: 'hsl(18,18%,12%)', fontFamily: 'Poppins,sans-serif' }}>{title}</p>
        <p className="text-xs leading-none" style={{ color: 'hsl(25,30%,50%)', fontFamily: 'Poppins,sans-serif' }}>{sub}</p>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0.55, 0.85]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden"
    >
      {/* ── PARALLAX BACKGROUND ── */}
      <motion.div
        ref={imgRef}
        className="absolute inset-0 z-0"
        style={{ y: imgY }}
      >
        <img
          src={heroImg}
          alt="Rustic South Indian kitchen with ceramic pickle jars"
          className="w-full h-full object-cover object-center scale-110"
        />
      </motion.div>

      {/* ── LAYERED OVERLAYS ── */}
      {/* Left warm gradient for text readability */}
      <motion.div
        className="absolute inset-0 z-[1]"
        style={{ opacity: overlayOpacity }}
      >
        <div
          className="w-full h-full"
          style={{
            background: `
              linear-gradient(105deg,
                rgba(255,249,243,0.96) 0%,
                rgba(255,249,243,0.88) 28%,
                rgba(255,249,243,0.60) 50%,
                rgba(255,249,243,0.15) 70%,
                transparent 100%
              )
            `,
          }}
        />
      </motion.div>

      {/* Warm radial glow */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(232,182,74,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── CONTENT ── */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 pt-28 pb-24 flex flex-col justify-between min-h-[100dvh]">
        <div className="flex-1 flex flex-col justify-center max-w-3xl">

          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 mb-8 self-start"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em]"
              style={{
                background: 'rgba(181,58,46,0.1)',
                color: 'hsl(4,60%,40%)',
                border: '1px solid rgba(181,58,46,0.2)',
                backdropFilter: 'blur(8px)',
                fontFamily: 'Poppins,sans-serif',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
              Handcrafted in South India · Est. Family Tradition
            </span>
          </motion.div>

          {/* Animated headline */}
          <AnimatedHeadline />

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="text-lg md:text-xl max-w-lg mb-10 leading-relaxed"
            style={{
              color: 'hsl(18,18%,28%)',
              fontFamily: 'Poppins,sans-serif',
              fontWeight: 400,
            }}
          >
            Handcrafted homemade pickles prepared with{' '}
            <em style={{ fontStyle: 'normal', color: 'hsl(4,60%,44%)', fontWeight: 600 }}>
              authentic recipes
            </em>
            , premium ingredients, and the warmth of home — one jar at a time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.6 }}
            className="flex flex-wrap gap-3 mb-14"
          >
            {/* Primary */}
            <motion.a
              href="#products"
              whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(181,58,46,0.35)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-7 h-14 rounded-full font-bold text-base cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                color: '#FFF9F3',
                fontFamily: 'Poppins,sans-serif',
                boxShadow: '0 8px 28px rgba(181,58,46,0.28), inset 0 1px 0 rgba(255,255,255,0.15)',
                textDecoration: 'none',
              }}
            >
              <ShoppingBag size={18} />
              Shop Now
            </motion.a>

            {/* Secondary */}
            <motion.a
              href="#products"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-7 h-14 rounded-full font-bold text-base cursor-pointer"
              style={{
                background: 'rgba(255,249,243,0.75)',
                color: 'hsl(18,18%,14%)',
                fontFamily: 'Poppins,sans-serif',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(139,94,60,0.25)',
                boxShadow: '0 4px 20px rgba(139,94,60,0.1)',
                textDecoration: 'none',
              }}
            >
              Explore Pickles
            </motion.a>

            {/* Ghost */}
            <motion.a
              href="#story"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-7 h-14 rounded-full font-semibold text-base cursor-pointer"
              style={{
                color: 'hsl(4,60%,40%)',
                fontFamily: 'Poppins,sans-serif',
                background: 'transparent',
                border: '1.5px solid rgba(181,58,46,0.3)',
                textDecoration: 'none',
              }}
            >
              <BookOpen size={17} />
              Our Story
            </motion.a>
          </motion.div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FloatingBadge
              delay={1.25}
              icon={<Star size={16} strokeWidth={2} style={{ color: '#FFF9F3' }} fill="#FFF9F3" />}
              title="5.0 Rating"
              sub="Loved by families"
              color="hsl(42,75%,52%)"
            />
            <FloatingBadge
              delay={1.35}
              icon={<Heart size={16} strokeWidth={2} style={{ color: '#FFF9F3' }} fill="#FFF9F3" />}
              title="Homemade"
              sub="Family recipes"
              color="hsl(4,60%,44%)"
            />
            <FloatingBadge
              delay={1.45}
              icon={<Leaf size={16} strokeWidth={2} style={{ color: '#FFF9F3' }} fill="#FFF9F3" />}
              title="100% Natural"
              sub="No preservatives"
              color="hsl(93,32%,42%)"
            />
            <FloatingBadge
              delay={1.55}
              icon={<Clock size={16} strokeWidth={2} style={{ color: '#FFF9F3' }} />}
              title="Sun Cured"
              sub="Traditional process"
              color="hsl(25,38%,48%)"
            />
          </div>
        </div>

        {/* ── SCROLL INDICATOR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="flex flex-col items-start gap-2 mt-10"
        >
          <span
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: 'hsl(25,30%,50%)', fontFamily: 'Poppins,sans-serif' }}
          >
            Scroll to discover
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={18} style={{ color: 'hsl(4,60%,44%)' }} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── DECORATIVE BOTTOM WAVE ── */}
      <div className="absolute bottom-0 left-0 right-0 z-[2]" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ width: '100%', height: 64 }}>
          <path
            d="M0,48 C240,0 480,64 720,40 C960,16 1200,64 1440,32 L1440,64 L0,64 Z"
            fill="hsl(30,100%,98%)"
            opacity="0.9"
          />
        </svg>
      </div>
    </section>
  );
}
