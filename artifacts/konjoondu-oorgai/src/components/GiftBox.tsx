import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Sparkles, Heart, ArrowRight } from 'lucide-react';

interface Props {
  onOpen: () => void;
  hasDraft?: boolean;
}

export default function GiftBox({ onOpen, hasDraft = false }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a0800 100%)',
        padding: '96px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '15%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(181,58,46,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(232,182,74,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(181,58,46,0.08) 0%, transparent 60%)', borderRadius: '50%' }} />
      </div>

      {/* Floating sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#e8b64a' : '#b53a2e',
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 3) * 30}%`,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 32 }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 40, background: 'rgba(232,182,74,0.12)', border: '1px solid rgba(232,182,74,0.3)' }}
          >
            <Sparkles size={12} color="#e8b64a" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#e8b64a' }}>Gift Something Meaningful</span>
          </motion.div>

          {/* Giant gift box icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{ position: 'relative', cursor: 'default' }}
          >
            {/* Glow ring */}
            <motion.div
              animate={{ scale: hovered ? 1.12 : 1, opacity: hovered ? 1 : 0.6 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', inset: -24, borderRadius: '50%', background: 'radial-gradient(circle, rgba(181,58,46,0.4) 0%, transparent 70%)' }}
            />

            <motion.div
              animate={{ y: hovered ? -8 : 0, rotate: hovered ? [0, -5, 5, 0] : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {/* Box body */}
              <div style={{
                width: 110, height: 90, marginTop: 28,
                background: 'linear-gradient(145deg, #b53a2e, #8b2a20)',
                borderRadius: 12,
                boxShadow: '0 12px 40px rgba(181,58,46,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                position: 'relative',
              }}>
                {/* Ribbon vertical */}
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 18, transform: 'translateX(-50%)', background: 'linear-gradient(180deg, #e8b64a, #c9922e)', borderRadius: 2 }} />
                {/* Lid */}
                <div style={{
                  position: 'absolute', top: -22, left: -6, right: -6, height: 28,
                  background: 'linear-gradient(145deg, #d44236, #a02a20)',
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(181,58,46,0.4)',
                }}>
                  {/* Ribbon horizontal on lid */}
                  <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 18, transform: 'translateX(-50%)', background: 'linear-gradient(180deg, #e8b64a, #c9922e)', borderRadius: 2 }} />
                </div>
                {/* Bow */}
                <div style={{ position: 'absolute', top: -52, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                  {/* Left loop */}
                  <div style={{ width: 28, height: 22, background: 'linear-gradient(135deg, #e8b64a, #c9922e)', borderRadius: '50% 50% 0 50%', transform: 'rotate(-20deg)', boxShadow: '0 2px 8px rgba(232,182,74,0.4)' }} />
                  {/* Right loop */}
                  <div style={{ width: 28, height: 22, background: 'linear-gradient(135deg, #e8b64a, #c9922e)', borderRadius: '50% 50% 50% 0', transform: 'rotate(20deg)', boxShadow: '0 2px 8px rgba(232,182,74,0.4)' }} />
                </div>
              </div>

              {/* Heart floating */}
              <motion.div
                animate={{ y: [-4, -12, -4], opacity: [0.7, 1, 0.7], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{ position: 'absolute', top: 0, right: 4 }}
              >
                <Heart size={18} fill="#e8b64a" color="#e8b64a" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}
          >
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(32px, 6vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#FFF9F0',
              margin: 0,
            }}>
              Send the Gift of{' '}
              <span style={{ color: '#e8b64a', textShadow: '0 0 32px rgba(232,182,74,0.4)' }}>
                Home Taste
              </span>
            </h2>

            <p style={{
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              color: 'rgba(255,249,240,0.65)',
              lineHeight: 1.65,
              maxWidth: 520,
              margin: 0,
            }}>
              Surprise someone you love with a handcrafted pickle gift box — curated by you, made with our heart. Add a personal message to make it unforgettable.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.25 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {[
              { icon: '🎁', text: 'Custom gift box' },
              { icon: '💌', text: 'Personal message' },
              { icon: '🏠', text: 'Delivered to their door' },
              { icon: '🫙', text: 'Handcrafted pickles' },
            ].map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 40,
                  background: 'rgba(255,249,240,0.06)',
                  border: '1px solid rgba(255,249,240,0.12)',
                  fontSize: 13, color: 'rgba(255,249,240,0.8)', fontWeight: 500,
                }}
              >
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
          >
            <motion.button
              onClick={onOpen}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '18px 40px', borderRadius: 56,
                background: 'linear-gradient(135deg, #e8b64a 0%, #c9922e 100%)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontSize: 17, fontWeight: 800,
                color: '#1a0800',
                boxShadow: '0 8px 32px rgba(232,182,74,0.45), 0 2px 8px rgba(0,0,0,0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              <Gift size={20} />
              {hasDraft ? 'Resume Gift Order' : 'Create a Gift Order'}
              <ArrowRight size={18} />
            </motion.button>

            {/* Draft resume pill */}
            {hasDraft && (
              <motion.button
                onClick={onOpen}
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 20px', borderRadius: 40,
                  background: 'rgba(181,58,46,0.12)',
                  border: '1.5px solid rgba(181,58,46,0.35)',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 12, fontWeight: 700,
                  color: '#e87a6a',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase' as const,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#b53a2e', display: 'inline-block', boxShadow: '0 0 6px #b53a2e' }} />
                You have a saved draft — resume →
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
