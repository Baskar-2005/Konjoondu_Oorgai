import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

import wa1 from '@/assets/review-wa-1.jpeg';
import wa2 from '@/assets/review-wa-2.jpeg';
import wa3 from '@/assets/review-wa-3.jpeg';
import wa4 from '@/assets/review-wa-4.jpeg';
import wa5 from '@/assets/review-wa-5.jpeg';
import wa6 from '@/assets/review-wa-6.jpeg';
import wa7 from '@/assets/review-wa-7.jpeg';

const ALL_SCREENSHOTS = [wa1, wa2, wa3, wa4, wa5, wa6, wa7];

// Split into two rows, alternating
const row1 = [wa1, wa3, wa5, wa7, wa2];
const row2 = [wa4, wa6, wa1, wa3, wa5];

function MarqueeRow({
  images,
  reverse = false,
  speed = 40,
}: {
  images: string[];
  reverse?: boolean;
  speed?: number;
}) {
  // Duplicate so the loop is seamless
  const doubled = [...images, ...images];

  return (
    <div className="overflow-hidden w-full" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
      <motion.div
        className="flex gap-4"
        style={{ width: 'max-content' }}
        animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{
          duration: speed,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl overflow-hidden shadow-lg"
            style={{
              width: 220,
              height: 300,
              border: '2px solid rgba(255,255,255,0.08)',
              background: '#111',
            }}
          >
            <img
              src={src}
              alt="Customer review screenshot"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              draggable={false}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function CustomerLove() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
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
        <MarqueeRow images={row1} reverse={false} speed={45} />
        <MarqueeRow images={row2} reverse={true}  speed={38} />
      </motion.div>
    </section>
  );
}
