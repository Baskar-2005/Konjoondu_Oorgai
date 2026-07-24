import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, Phone, MapPin, Clock, ChevronRight, Heart } from 'lucide-react';

const PRODUCTS = [
  'Prawn Pickle', 'Chicken Pickle', 'Mutton Pickle', 'Beef Pickle',
  'Nethili Pickle', 'Nethili Sambal', 'Nethili Karuvaadu',
  'Soorai Pickle', 'Vaala Karuvaadu', 'Maldives Fish Sambal', 'Idly Podi',
];

const QUICK_LINKS = [
  { label: 'Shop All', href: '#products' },
  { label: 'Our Story', href: '#story' },
  { label: 'Gift Builder', href: '#gift' },
  { label: 'Contact Us', href: '#contact' },
  { label: 'Track Order', href: '/track' },
];

const LEGAL = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Refund Policy', href: '#' },
  { label: 'Shipping Info', href: '#' },
];

const SOCIALS = [
  { icon: Instagram, href: 'https://www.instagram.com/konjoonduoorgai?utm_source=qr&igsh=dTNmbjVwZ3FpdW9p', label: 'Instagram', color: '#E1306C' },
  { icon: Mail, href: 'mailto:venpa13g@gmail.com', label: 'Email', color: '#f59e0b' },
  { icon: Phone, href: 'tel:+919790387121', label: 'Call', color: '#22c55e' },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0d0500 0%, #1a0800 40%, #0a0300 100%)',
        borderTop: '1px solid rgba(212,160,23,0.15)',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '3rem 3rem 0 0',
        marginTop: '-2.5rem',
        zIndex: 10,
      }}
    >
      {/* ── Decorative background glow ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(212,160,23,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: '-100px',
          width: '400px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(180,40,10,0.06) 0%, transparent 70%)',
        }} />
      </div>

      {/* ── Big brand marquee strip ── */}
      <div style={{
        borderBottom: '1px solid rgba(212,160,23,0.12)',
        padding: '28px 0',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
          style={{ display: 'flex', gap: '60px', whiteSpace: 'nowrap', width: 'max-content' }}
        >
          {[...Array(6)].map((_, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,160,23,0.5)' }}>
                Konjoondu Oorgai
              </span>
              <span style={{ color: 'rgba(212,160,23,0.25)', fontSize: 10 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,160,23,0.5)' }}>
                Homemade Pickles
              </span>
              <span style={{ color: 'rgba(212,160,23,0.25)', fontSize: 10 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,160,23,0.5)' }}>
                No Preservatives
              </span>
              <span style={{ color: 'rgba(212,160,23,0.25)', fontSize: 10 }}>✦</span>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(212,160,23,0.5)' }}>
                South Indian Tradition
              </span>
              <span style={{ color: 'rgba(212,160,23,0.25)', fontSize: 10 }}>✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 32px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* ── Top: brand + tagline ── */}
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #d4a017 0%, #f5c842 45%, #c17f10 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 12,
              lineHeight: 1.1,
            }}
          >
            Konjoondu Oorgai
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
          >
            Crafted with love · Delivered to your table
          </motion.p>

          {/* Decorative divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <div style={{ height: 1, width: 80, background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4))' }} />
            <span style={{ color: '#d4a017', fontSize: 16 }}>✦</span>
            <div style={{ height: 1, width: 80, background: 'linear-gradient(90deg, rgba(212,160,23,0.4), transparent)' }} />
          </div>
        </div>

        {/* ── Products row ── */}
        <div style={{
          marginBottom: 56,
          background: 'rgba(212,160,23,0.04)',
          border: '1px solid rgba(212,160,23,0.1)',
          borderRadius: 20,
          padding: '28px 32px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,160,23,0.6)', marginBottom: 16 }}>
            Our Products
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px' }}>
            {PRODUCTS.map((p) => (
              <a
                key={p}
                href="#products"
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#d4a017')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                <ChevronRight size={11} style={{ opacity: 0.4 }} />
                {p}
              </a>
            ))}
          </div>
        </div>

        {/* ── 3-column grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
          marginBottom: 56,
        }}>
          {/* Contact info */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,160,23,0.6)', marginBottom: 20 }}>
              Reach Us
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <MapPin size={15} style={{ color: '#d4a017', marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  49, KDR Nagar, Gundusalai Road,<br />Alpet, Cuddalore – 607001
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Clock size={15} style={{ color: '#d4a017', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Mon – Sat, 9AM to 6PM</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Phone size={15} style={{ color: '#d4a017', flexShrink: 0 }} />
                <a href="tel:+919790387121" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>+91 97903 87121</a>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Mail size={15} style={{ color: '#d4a017', flexShrink: 0 }} />
                <a href="mailto:venpa13g@gmail.com" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>venpa13g@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,160,23,0.6)', marginBottom: 20 }}>
              Quick Links
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {QUICK_LINKS.map(l => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#d4a017')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    <span style={{ width: 16, height: 1, background: 'rgba(212,160,23,0.4)', display: 'inline-block', flexShrink: 0 }} />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,160,23,0.6)', marginBottom: 20 }}>
              Legal
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LEGAL.map(l => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#d4a017')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    <span style={{ width: 16, height: 1, background: 'rgba(212,160,23,0.4)', display: 'inline-block', flexShrink: 0 }} />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              {SOCIALS.map(({ icon: Icon, href, label, color }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `${color}22`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}66`;
                    (e.currentTarget as HTMLElement).style.color = color;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  <Icon size={17} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          borderTop: '1px solid rgba(212,160,23,0.12)',
          paddingTop: 28,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            © {new Date().getFullYear()} Konjoondu Oorgai. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            Made with <Heart size={11} fill="#d4a017" color="#d4a017" /> in South India
          </p>
        </div>
      </div>
    </footer>
  );
}
