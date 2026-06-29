import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon, Menu, X } from 'lucide-react';

// ── Logo Mark SVG ────────────────────────────────────────────────
function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="6" width="28" height="8" rx="3" fill="hsl(25, 38%, 48%)" />
      <rect x="8" y="9" width="32" height="5" rx="2.5" fill="hsl(25, 38%, 56%)" />
      <rect x="8" y="14" width="32" height="28" rx="6" fill="hsl(4, 60%, 44%)" opacity="0.9" />
      <rect x="13" y="17" width="5" height="18" rx="2.5" fill="white" opacity="0.18" />
      <ellipse cx="24" cy="28" rx="7" ry="9" fill="hsl(93, 40%, 48%)" opacity="0.85" />
      <line x1="24" y1="19" x2="24" y2="37" stroke="hsl(93, 45%, 28%)" strokeWidth="0.8" opacity="0.7" />
      <circle cx="19" cy="26" r="1.2" fill="hsl(42, 78%, 70%)" opacity="0.8" />
      <circle cx="29" cy="30" r="1" fill="hsl(42, 78%, 70%)" opacity="0.8" />
    </svg>
  );
}

const navLinks = [
  { name: 'Products', href: '#products' },
  { name: 'Our Story', href: '#story' },
  { name: 'Recipes', href: '#recipes' },
  { name: 'Contact', href: '#contact' },
];

// ── Elastic spring — bouncy but controlled ─────────────────────
const SPRING = { type: 'spring' as const, stiffness: 380, damping: 22, mass: 0.9 };

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const onScroll = useCallback(() => setScrolled(window.scrollY > 90), []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return (
    <>
      {/* ══ DESKTOP NAV ══════════════════════════════════════════ */}
      {/* Wrapper: always full-width fixed, just for positioning. */}
      <div className="fixed top-0 left-0 right-0 z-40 hidden md:flex justify-center pointer-events-none">
        <motion.nav
          layout
          initial={false}
          animate={
            scrolled
              ? {
                  marginTop: 14,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 10,
                  paddingBottom: 10,
                  borderRadius: 100,
                  backgroundColor: 'rgba(255,249,243,0.85)',
                  backdropFilter: 'blur(28px)',
                  boxShadow:
                    '0 4px 6px rgba(139,94,60,0.06), 0 12px 40px rgba(139,94,60,0.16), inset 0 1px 0 rgba(255,255,255,0.85)',
                  border: '1.5px solid rgba(255,255,255,0.75)',
                  width: 'auto',
                  minWidth: 480,
                  maxWidth: 780,
                }
              : {
                  marginTop: 0,
                  paddingLeft: 40,
                  paddingRight: 40,
                  paddingTop: 22,
                  paddingBottom: 22,
                  borderRadius: 0,
                  backgroundColor: 'rgba(255,249,243,0)',
                  backdropFilter: 'blur(0px)',
                  boxShadow: 'none',
                  border: '1.5px solid transparent',
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                }
          }
          transition={SPRING}
          className="flex items-center justify-between gap-8 pointer-events-auto"
          style={{ WebkitBackdropFilter: scrolled ? 'blur(28px)' : 'blur(0px)' }}
        >
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 flex-shrink-0 select-none"
            aria-label="Konjoondu Oorgai — home"
          >
            <motion.div animate={{ scale: scrolled ? 0.85 : 1 }} transition={SPRING}>
              <LogoMark size={scrolled ? 30 : 38} />
            </motion.div>
            <span className="flex flex-col leading-none">
              <motion.span
                animate={{ fontSize: scrolled ? '15px' : '20px' }}
                transition={SPRING}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 900,
                  color: 'hsl(4, 60%, 44%)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                Konjoondu
              </motion.span>
              <motion.span
                animate={{ fontSize: scrolled ? '8px' : '10px' }}
                transition={SPRING}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  color: 'hsl(18, 18%, 22%)',
                  letterSpacing: '0.22em',
                  lineHeight: 1.4,
                }}
              >
                OORGAI
              </motion.span>
            </span>
          </a>

          {/* Pill divider */}
          <AnimatePresence>
            {scrolled && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="h-5 w-px flex-shrink-0"
                style={{ background: 'rgba(139,94,60,0.2)' }}
              />
            )}
          </AnimatePresence>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-3.5 py-1.5 rounded-full text-sm font-semibold group"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  color: scrolled ? 'hsl(18,18%,20%)' : 'hsl(18,18%,12%)',
                  textDecoration: 'none',
                }}
              >
                {link.name}
                <span
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(181,58,46,0.07)' }}
                />
                <span
                  className="absolute bottom-0.5 left-3.5 right-3.5 h-[1.5px] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ background: 'hsl(4,60%,44%)' }}
                />
              </motion.a>
            ))}

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.12, rotate: 12 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-2 p-2 rounded-full"
              style={{ background: scrolled ? 'rgba(139,94,60,0.08)' : 'rgba(255,249,243,0.3)' }}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.22 }}
                  style={{ display: 'block' }}
                >
                  {theme === 'dark'
                    ? <Sun size={16} strokeWidth={2} style={{ color: 'hsl(42,78%,50%)' }} />
                    : <Moon size={16} strokeWidth={2} style={{ color: 'hsl(18,18%,28%)' }} />
                  }
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>
      </div>

      {/* ══ MOBILE NAV ═══════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-40 flex md:hidden justify-center pointer-events-none">
        <motion.nav
          animate={
            scrolled
              ? {
                  marginTop: 10,
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 100,
                  backgroundColor: 'rgba(255,249,243,0.9)',
                  backdropFilter: 'blur(28px)',
                  boxShadow: '0 8px 32px rgba(139,94,60,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.75)',
                  width: 'calc(100vw - 32px)',
                }
              : {
                  marginTop: 0,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 18,
                  paddingBottom: 18,
                  borderRadius: 0,
                  backgroundColor: 'rgba(255,249,243,0)',
                  backdropFilter: 'blur(0px)',
                  boxShadow: 'none',
                  border: '1.5px solid transparent',
                  width: '100vw',
                }
          }
          transition={SPRING}
          className="flex items-center justify-between pointer-events-auto"
          style={{ WebkitBackdropFilter: scrolled ? 'blur(28px)' : 'blur(0px)' }}
        >
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 select-none"
            aria-label="Konjoondu Oorgai home"
          >
            <LogoMark size={28} />
            <span
              style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 16, color: 'hsl(4,60%,44%)', letterSpacing: '-0.02em' }}
            >
              Konjoondu <span style={{ color: 'hsl(18,18%,14%)' }}>Oorgai</span>
            </span>
          </a>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full"
              style={{ background: 'rgba(139,94,60,0.08)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full"
              style={{ background: 'rgba(139,94,60,0.08)' }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'x' : 'm'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'block' }}
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 md:hidden"
              style={{ background: 'rgba(45,36,31,0.3)', backdropFilter: 'blur(3px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-40 md:hidden flex flex-col overflow-hidden"
              style={{
                top: scrolled ? 70 : 66,
                left: scrolled ? 16 : 0,
                right: scrolled ? 16 : 0,
                borderRadius: scrolled ? 20 : 0,
                background: 'rgba(255,249,243,0.97)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                boxShadow: '0 20px 50px rgba(139,94,60,0.2)',
                border: '1px solid rgba(255,255,255,0.75)',
              }}
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  onClick={() => setMobileOpen(false)}
                  className="px-6 py-4 text-base font-semibold border-b last:border-b-0 transition-colors"
                  style={{
                    color: 'hsl(18,18%,16%)',
                    borderColor: 'rgba(139,94,60,0.1)',
                    fontFamily: 'Poppins,sans-serif',
                    textDecoration: 'none',
                  }}
                >
                  {link.name}
                </motion.a>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
