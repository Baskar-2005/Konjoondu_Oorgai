import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon, Menu, X } from 'lucide-react';

// Creative SVG Logo Mark — a stylised pickle jar with a curry leaf
function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Jar lid */}
      <rect x="10" y="6" width="28" height="8" rx="3" fill="hsl(25, 38%, 48%)" />
      <rect x="8" y="9" width="32" height="5" rx="2.5" fill="hsl(25, 38%, 56%)" />
      {/* Jar body */}
      <rect x="8" y="14" width="32" height="28" rx="6" fill="hsl(4, 60%, 44%)" opacity="0.9" />
      {/* Shine */}
      <rect x="13" y="17" width="5" height="18" rx="2.5" fill="white" opacity="0.18" />
      {/* Curry leaf inside jar */}
      <ellipse cx="24" cy="28" rx="7" ry="9" fill="hsl(93, 40%, 48%)" opacity="0.85" />
      <line x1="24" y1="19" x2="24" y2="37" stroke="hsl(93, 45%, 28%)" strokeWidth="0.8" opacity="0.7" />
      {/* Small seed dots */}
      <circle cx="19" cy="26" r="1.2" fill="hsl(42, 78%, 70%)" opacity="0.8" />
      <circle cx="29" cy="30" r="1" fill="hsl(42, 78%, 70%)" opacity="0.8" />
    </svg>
  );
}

function LogoText({ scrolled }: { scrolled: boolean }) {
  return (
    <span className="flex flex-col leading-none select-none">
      <span
        className="font-black tracking-tight transition-all duration-500"
        style={{
          fontSize: scrolled ? '15px' : '20px',
          color: 'hsl(4, 60%, 44%)',
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        Konjoondu
      </span>
      <span
        className="font-extrabold tracking-widest transition-all duration-500"
        style={{
          fontSize: scrolled ? '9px' : '11px',
          color: 'hsl(18, 18%, 20%)',
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '0.18em',
          lineHeight: 1.3,
        }}
      >
        OORGAI
      </span>
    </span>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const navLinks = [
    { name: 'Products', href: '#products' },
    { name: 'Our Story', href: '#story' },
    { name: 'Recipes', href: '#recipes' },
    { name: 'Contact', href: '#contact' },
  ];

  // Spring configs for smooth pill animation
  const springConfig = { stiffness: 280, damping: 32, mass: 1 };

  return (
    <>
      {/* ─── Desktop Navigation ─── */}
      <motion.header
        layout
        initial={false}
        animate={
          scrolled
            ? {
                top: 16,
                left: '50%',
                x: '-50%',
                width: 'auto',
                maxWidth: '760px',
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '20px',
                paddingRight: '20px',
                borderRadius: '100px',
                backgroundColor: 'rgba(255,249,243,0.82)',
                backdropFilter: 'blur(24px)',
                boxShadow:
                  '0 8px 40px rgba(139,94,60,0.18), 0 2px 8px rgba(139,94,60,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.7)',
              }
            : {
                top: 0,
                left: 0,
                x: '0%',
                width: '100%',
                maxWidth: '100%',
                paddingTop: '20px',
                paddingBottom: '20px',
                paddingLeft: '24px',
                paddingRight: '24px',
                borderRadius: '0px',
                backgroundColor: 'rgba(255,249,243,0)',
                backdropFilter: 'blur(0px)',
                boxShadow: 'none',
                border: '1px solid transparent',
              }
        }
        transition={springConfig}
        className="fixed z-40 hidden md:flex items-center justify-between gap-6"
        style={{
          willChange: 'transform, width, border-radius',
          WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'blur(0px)',
        }}
      >
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2.5 flex-shrink-0"
          aria-label="Konjoondu Oorgai - Home"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <motion.div
            animate={{ scale: scrolled ? 0.82 : 1 }}
            transition={springConfig}
          >
            <LogoMark size={scrolled ? 30 : 38} />
          </motion.div>
          <LogoText scrolled={scrolled} />
        </a>

        {/* Divider (only when scrolled) */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              className="h-6 w-px flex-shrink-0"
              style={{ background: 'rgba(139,94,60,0.2)' }}
            />
          )}
        </AnimatePresence>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.href}
              className="relative px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 group"
              style={{
                color: scrolled ? 'hsl(18, 18%, 22%)' : 'hsl(18, 18%, 14%)',
                fontFamily: 'Poppins, sans-serif',
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10">{link.name}</span>
              {/* Hover pill bg */}
              <span
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'rgba(181,58,46,0.08)' }}
              />
              {/* Underline */}
              <span
                className="absolute bottom-0.5 left-3 right-3 h-[1.5px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ background: 'hsl(4, 60%, 44%)' }}
              />
            </motion.a>
          ))}

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="ml-1 p-2 rounded-full transition-colors duration-200"
            style={{ background: scrolled ? 'rgba(139,94,60,0.08)' : 'rgba(255,255,255,0.25)' }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {theme === 'dark'
                  ? <Sun size={16} strokeWidth={2.2} style={{ color: 'hsl(42, 78%, 50%)' }} />
                  : <Moon size={16} strokeWidth={2.2} style={{ color: 'hsl(18, 18%, 30%)' }} />
                }
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </nav>
      </motion.header>

      {/* ─── Mobile Navigation ─── */}
      <motion.header
        animate={
          scrolled
            ? {
                top: 12,
                left: '50%',
                x: '-50%',
                width: 'calc(100% - 32px)',
                paddingTop: '8px',
                paddingBottom: '8px',
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRadius: '100px',
                backgroundColor: 'rgba(255,249,243,0.88)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 8px 32px rgba(139,94,60,0.18)',
                border: '1px solid rgba(255,255,255,0.7)',
              }
            : {
                top: 0,
                left: 0,
                x: '0%',
                width: '100%',
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '20px',
                paddingRight: '20px',
                borderRadius: '0px',
                backgroundColor: 'rgba(255,249,243,0)',
                backdropFilter: 'blur(0px)',
                boxShadow: 'none',
                border: '1px solid transparent',
              }
        }
        transition={springConfig}
        className="fixed z-40 flex md:hidden items-center justify-between"
        style={{ WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'blur(0px)' }}
      >
        <a
          href="#"
          className="flex items-center gap-2"
          aria-label="Konjoondu Oorgai - Home"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <LogoMark size={28} />
          <span
            className="font-black"
            style={{ fontSize: '16px', color: 'hsl(4, 60%, 44%)', fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}
          >
            Konjoondu <span style={{ color: 'hsl(18, 18%, 14%)' }}>Oorgai</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-full"
            style={{ background: 'rgba(139,94,60,0.08)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            className="p-1.5 rounded-full"
            style={{ background: 'rgba(139,94,60,0.08)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileMenuOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-30 md:hidden flex flex-col overflow-hidden"
            style={{
              top: scrolled ? 72 : 68,
              left: scrolled ? 16 : 0,
              right: scrolled ? 16 : 0,
              borderRadius: scrolled ? 24 : 0,
              background: 'rgba(255,249,243,0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 20px 50px rgba(139,94,60,0.2)',
              border: '1px solid rgba(255,255,255,0.7)',
            }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="px-6 py-4 text-base font-semibold border-b last:border-b-0 transition-colors"
                style={{
                  color: 'hsl(18, 18%, 18%)',
                  borderColor: 'rgba(139,94,60,0.12)',
                  fontFamily: 'Poppins, sans-serif',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 md:hidden"
            style={{ background: 'rgba(45,36,31,0.25)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
