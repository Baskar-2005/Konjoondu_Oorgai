import React, { useRef, useState, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

import wa1 from '@/assets/review-wa-1.jpeg';
import wa2 from '@/assets/review-wa-2.jpeg';
import wa3 from '@/assets/review-wa-3.jpeg';
import wa4 from '@/assets/review-wa-4.jpeg';
import wa5 from '@/assets/review-wa-5.jpeg';
import wa6 from '@/assets/review-wa-6.jpeg';
import wa7 from '@/assets/review-wa-7.jpeg';

const row1 = [wa1, wa3, wa5, wa7, wa2];
const row2 = [wa4, wa6, wa1, wa3, wa5];

// ── Lightbox ────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
          cursor: 'zoom-out',
        }}
      >
        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12 }}
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <X size={20} />
        </motion.button>

        {/* Image */}
        <motion.img
          key="img"
          src={src}
          alt="Customer review"
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '90vw',
            maxHeight: '88vh',
            width: 'auto',
            height: 'auto',
            borderRadius: 20,
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            cursor: 'default',
            objectFit: 'contain',
          }}
          draggable={false}
        />
      </motion.div>
    </AnimatePresence>
  );
}

// ── Marquee row ─────────────────────────────────────────────────
function MarqueeRow({
  images,
  reverse = false,
  speed = 40,
  onImageClick,
}: {
  images: string[];
  reverse?: boolean;
  speed?: number;
  onImageClick: (src: string) => void;
}) {
  const doubled = [...images, ...images];

  return (
    <div
      className="overflow-hidden w-full"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <motion.div
        className="flex gap-4"
        style={{ width: 'max-content' }}
        animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((src, i) => (
          <motion.div
            key={i}
            className="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg relative group"
            style={{
              width: 220, height: 300,
              border: '2px solid rgba(255,255,255,0.08)',
              background: '#111',
              cursor: 'zoom-in',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 16px 48px rgba(0,0,0,0.35)' }}
            transition={{ duration: 0.2 }}
            onClick={() => onImageClick(src)}
          >
            <img
              src={src}
              alt="Customer review screenshot"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
              draggable={false}
            />
            {/* Hover overlay hint */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '50%',
                  width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <ZoomIn size={22} color="#fff" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function CustomerLove() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeImg, setActiveImg] = useState<string | null>(null);

  const handleOpen = useCallback((src: string) => setActiveImg(src), []);
  const handleClose = useCallback(() => setActiveImg(null), []);

  return (
    <>
      {activeImg && <Lightbox src={activeImg} onClose={handleClose} />}

      <section className="py-24 relative overflow-hidden" style={{ background: 'hsl(30, 100%, 97%)' }}>
        {/* Heading */}
        <div className="container mx-auto px-6 relative z-10 mb-14 text-center" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] mb-5"
              style={{
                background: 'rgba(232,140,30,0.13)',
                color: 'hsl(28,80%,38%)',
                border: '1px solid rgba(232,140,30,0.25)',
                fontFamily: 'Poppins,sans-serif',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: 'hsl(4,68%,50%)' }} />
              Real customers · Real messages
            </span>

            <h2
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ fontFamily: 'Poppins,sans-serif', color: 'hsl(20,30%,14%)' }}
            >
              Love from our Family
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: 'hsl(20,15%,45%)', fontFamily: 'Poppins,sans-serif' }}
            >
              Unfiltered WhatsApp messages from people who tasted the difference.
            </p>
          </motion.div>
        </div>

        {/* Marquee rows */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          <MarqueeRow images={row1} reverse={false} speed={45} onImageClick={handleOpen} />
          <MarqueeRow images={row2} reverse={true}  speed={38} onImageClick={handleOpen} />
        </motion.div>
      </section>
    </>
  );
}
