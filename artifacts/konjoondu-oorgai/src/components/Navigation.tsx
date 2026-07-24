import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon, Menu, X, ShoppingCart, UserCircle, Gift } from 'lucide-react';
import { useLocation } from 'wouter';
import { useCustomer } from '@/context/CustomerContext';
import { useCart } from '@/context/CartContext';
import { hasSavedGiftDraft } from '@/components/GiftOrderModal';

// ── Logo Mark ────────────────────────────────────────────────────
function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="Konjoondu Oorgai"
      style={{ height: size * 1.6, width: 'auto', display: 'block', objectFit: 'contain', flexShrink: 0 }}
    />
  );
}

// Nav links — Products goes to /products page, others are hash anchors on Home
const NAV_LINKS = [
  { label: 'Products', href: '/products', isRoute: true },
  { label: 'Our Story', href: '#story', isRoute: false },
  { label: 'For You', href: '#for-whom', isRoute: false },
  { label: 'Contact', href: '#contact', isRoute: false },
];

const SPRING = { type: 'spring' as const, stiffness: 340, damping: 28, mass: 0.85 };

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [giftDraft, setGiftDraft] = useState(() => hasSavedGiftDraft());
  const { theme, setTheme } = useTheme();
  const [location, navigate] = useLocation();
  const { totalItems, openCart } = useCart();
  const { isLoggedIn } = useCustomer();

  const isProductsPage = location === '/products';

  function openGiftModal() {
    setMobileOpen(false);
    window.dispatchEvent(new CustomEvent('ko:openGiftModal'));
    // Re-check draft after modal could have been opened
    setTimeout(() => setGiftDraft(hasSavedGiftDraft()), 500);
  }

  // Refresh draft badge whenever the modal closes (Home.tsx clears/saves draft)
  useEffect(() => {
    const handler = () => setTimeout(() => setGiftDraft(hasSavedGiftDraft()), 200);
    window.addEventListener('ko:giftDraftChanged', handler);
    return () => window.removeEventListener('ko:giftDraftChanged', handler);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // On the products page, nav is always in "scrolled" (pill-visible) state
  const navScrolled = isProductsPage ? true : scrolled;

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, link: typeof NAV_LINKS[0]) {
    e.preventDefault();
    setMobileOpen(false);
    if (link.isRoute) {
      navigate(link.href);
    } else {
      if (isProductsPage) {
        // Go home first then scroll
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(link.href);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        const el = document.querySelector(link.href);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    if (isProductsPage) {
      navigate('/');
    } else {
      window.dispatchEvent(new CustomEvent('ko:showSplash'));
    }
  }

  return (
    <>
      {/* ── DESKTOP ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center items-start pointer-events-none">
        <motion.nav
          layout
          initial={false}
          animate={
            navScrolled
              ? {
                  maxWidth: 920,
                  marginTop: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 18,
                  paddingRight: 18,
                  borderRadius: 100,
                  backgroundColor: 'rgba(255,249,243,0.92)',
                  backdropFilter: 'blur(28px)',
                  boxShadow: '0 2px 8px rgba(139,94,60,0.08), 0 12px 40px rgba(139,94,60,0.16), inset 0 1px 0 rgba(255,255,255,0.9)',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                }
              : {
                  maxWidth: 2000,
                  marginTop: 0,
                  paddingTop: 20,
                  paddingBottom: 20,
                  paddingLeft: 48,
                  paddingRight: 48,
                  borderRadius: 0,
                  backgroundColor: 'rgba(255,249,243,0)',
                  backdropFilter: 'blur(0px)',
                  boxShadow: 'none',
                  border: '1.5px solid transparent',
                }
          }
          transition={SPRING}
          className="w-full flex items-center justify-between gap-3 pointer-events-auto"
          style={{ WebkitBackdropFilter: navScrolled ? 'blur(28px)' : 'blur(0px)' }}
        >
          {/* Logo */}
          <a
            href="#"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 flex-shrink-0 select-none"
            aria-label="Konjoondu Oorgai home"
          >
            <motion.span animate={{ scale: navScrolled ? 0.88 : 1 }} transition={SPRING} style={{ display: 'block' }}>
              <LogoMark size={navScrolled ? 30 : 36} />
            </motion.span>
            <span className="flex flex-col leading-none">
              <motion.span
                animate={{ fontSize: navScrolled ? '14px' : '19px', color: navScrolled ? 'hsl(4,60%,44%)' : '#FFF9F0' }}
                transition={SPRING}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, display: 'block',
                  textShadow: navScrolled ? 'none' : '0 1px 6px rgba(0,0,0,0.5)' }}
              >
                Konjoondu
              </motion.span>
              <motion.span
                animate={{ fontSize: navScrolled ? '8px' : '10px', color: navScrolled ? 'hsl(18,18%,24%)' : 'rgba(255,249,240,0.75)' }}
                transition={SPRING}
                style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, letterSpacing: '0.2em', lineHeight: 1.4, display: 'block',
                  textShadow: navScrolled ? 'none' : '0 1px 4px rgba(0,0,0,0.4)' }}
              >
                OORGAI
              </motion.span>
            </span>
          </a>

          {/* Divider */}
          <AnimatePresence>
            {navScrolled && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }} transition={{ duration: 0.2 }}
                className="h-5 w-px flex-shrink-0 rounded-full"
                style={{ background: 'rgba(139,94,60,0.22)' }}
              />
            )}
          </AnimatePresence>

          {/* Links */}
          <div className="flex items-center gap-0.5 flex-1 justify-end">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={e => handleNavClick(e, link)}
                className="relative px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 group"
                style={{
                  fontFamily: 'Poppins,sans-serif',
                  color: navScrolled ? 'hsl(18,18%,18%)' : 'hsl(18,18%,95%)',
                  textDecoration: 'none',
                  textShadow: navScrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.4)',
                  fontWeight: link.isRoute && isProductsPage ? 800 : 600,
                }}
              >
                <span className="relative z-10">{link.label}</span>
                <span
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: navScrolled ? 'rgba(181,58,46,0.08)' : 'rgba(255,255,255,0.12)' }}
                />
                <span
                  className="absolute bottom-0.5 left-3.5 right-3.5 h-[1.5px] rounded-full origin-left transition-transform duration-300"
                  style={{
                    background: navScrolled ? 'hsl(4,60%,44%)' : 'rgba(255,249,243,0.8)',
                    transform: link.isRoute && isProductsPage ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </a>
            ))}

            {/* Account icon */}
            <button
              onClick={() => navigate('/account')}
              className="relative ml-1 p-2 rounded-full flex-shrink-0 transition-colors"
              style={{ background: navScrolled ? 'rgba(181,58,46,0.08)' : 'rgba(255,255,255,0.14)', position: 'relative' }}
              aria-label="My account"
            >
              <UserCircle size={16} style={{ color: navScrolled ? 'hsl(4,60%,44%)' : '#FFF9F3' }} />
              {isLoggedIn && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'hsl(93,32%,42%)', border: '1.5px solid #fff' }} />
              )}
            </button>

            {/* Cart icon */}
            <button
              onClick={openCart}
              className="relative ml-1 p-2 rounded-full flex-shrink-0 transition-colors"
              style={{ background: navScrolled ? 'rgba(181,58,46,0.08)' : 'rgba(255,255,255,0.14)' }}
              aria-label="Open cart"
            >
              <ShoppingCart size={16} style={{ color: navScrolled ? 'hsl(4,60%,44%)' : '#FFF9F3' }} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'hsl(4,60%,44%)' }}
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* 🎁 Gift button */}
            <motion.button
              onClick={openGiftModal}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="relative ml-1 overflow-hidden whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-bold flex-shrink-0 flex items-center gap-1.5"
              style={{
                background: navScrolled
                  ? 'linear-gradient(135deg, #e8b64a, #c9922e)'
                  : 'rgba(232,182,74,0.22)',
                color: navScrolled ? '#1a0800' : '#e8b64a',
                fontFamily: 'Poppins,sans-serif',
                border: navScrolled ? 'none' : '1.5px solid rgba(232,182,74,0.5)',
                boxShadow: navScrolled ? '0 3px 10px rgba(232,182,74,0.35)' : 'none',
              }}
              aria-label="Create gift order"
            >
              <Gift size={13} />
              <span>Gift</span>
              {/* Draft indicator dot */}
              {giftDraft && (
                <span style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, borderRadius: '50%', background: '#b53a2e', border: '1.5px solid #fff' }} />
              )}
            </motion.button>

            {/* Order Oorgai CTA — always visible */}
            <motion.a
              href="/products"
              onClick={e => { e.preventDefault(); navigate('/products'); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="ml-2 overflow-hidden whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold flex-shrink-0 flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                color: '#FFF9F3',
                fontFamily: 'Poppins,sans-serif',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(181,58,46,0.32)',
              }}
            >
              <span>🥒</span> Order Oorgai
            </motion.a>

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-1 p-2 rounded-full flex-shrink-0"
              style={{ background: navScrolled ? 'rgba(139,94,60,0.08)' : 'rgba(255,255,255,0.14)' }}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'block' }}
                >
                  {theme === 'dark'
                    ? <Sun size={15} strokeWidth={2} style={{ color: 'hsl(42,78%,55%)' }} />
                    : <Moon size={15} strokeWidth={2} style={{ color: navScrolled ? 'hsl(18,18%,28%)' : '#FFF9F3' }} />
                  }
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>
      </div>

      {/* ── MOBILE ──────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden justify-center items-start pointer-events-none">
        <motion.nav
          initial={false}
          animate={
            navScrolled
              ? {
                  maxWidth: 9999, width: 'calc(100vw - 32px)', marginTop: 10,
                  paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16,
                  borderRadius: 100, backgroundColor: 'rgba(255,249,243,0.92)',
                  backdropFilter: 'blur(28px)', boxShadow: '0 8px 32px rgba(139,94,60,0.2)',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                }
              : {
                  maxWidth: 9999, width: '100vw', marginTop: 0,
                  paddingTop: 18, paddingBottom: 18, paddingLeft: 20, paddingRight: 20,
                  borderRadius: 0, backgroundColor: 'rgba(255,249,243,0)',
                  backdropFilter: 'blur(0px)', boxShadow: 'none', border: '1.5px solid transparent',
                }
          }
          transition={SPRING}
          className="flex items-center justify-between pointer-events-auto"
          style={{ WebkitBackdropFilter: navScrolled ? 'blur(28px)' : 'blur(0px)' }}
        >
          <a
            href="#"
            onClick={handleLogoClick}
            className="flex items-center gap-1.5 select-none"
            aria-label="Konjoondu Oorgai home"
          >
            <LogoMark size={24} />
            <span style={{
              fontFamily: 'Poppins', fontWeight: 900, fontSize: 13,
              color: navScrolled ? 'hsl(4,60%,44%)' : '#FFF9F0',
              letterSpacing: '-0.02em',
              textShadow: navScrolled ? 'none' : '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              Konjoondu{' '}
              <span style={{ color: navScrolled ? 'hsl(18,18%,22%)' : 'rgba(255,249,240,0.85)' }}>
                Oorgai
              </span>
            </span>
          </a>

          <div className="flex items-center gap-1">
            {/* Mobile account */}
            <button onClick={() => navigate('/account')} className="relative p-2 rounded-full"
              style={{ background: navScrolled ? 'rgba(139,94,60,0.1)' : 'rgba(255,255,255,0.15)' }} aria-label="Account">
              <UserCircle size={16} style={{ color: navScrolled ? 'hsl(4,60%,44%)' : '#FFF9F0' }} />
              {isLoggedIn && <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: 'hsl(93,32%,42%)', border: '1.5px solid #fff' }} />}
            </button>
            {/* Mobile cart */}
            <button onClick={openCart} className="relative p-2 rounded-full"
              style={{ background: navScrolled ? 'rgba(139,94,60,0.1)' : 'rgba(255,255,255,0.15)' }} aria-label="Cart">
              <ShoppingCart size={16} style={{ color: navScrolled ? 'hsl(4,60%,44%)' : '#FFF9F0' }} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: 'hsl(4,60%,44%)' }}>
                  {totalItems}
                </span>
              )}
            </button>
            {/* Mobile Gift button */}
            <button
              onClick={openGiftModal}
              className="relative p-2 rounded-full flex items-center justify-center"
              style={{ background: navScrolled ? 'rgba(232,182,74,0.15)' : 'rgba(232,182,74,0.2)', border: navScrolled ? '1.5px solid rgba(232,182,74,0.4)' : '1.5px solid rgba(232,182,74,0.35)' }}
              aria-label="Create gift order"
            >
              <Gift size={15} style={{ color: navScrolled ? '#c9922e' : '#e8b64a' }} />
              {giftDraft && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: '#b53a2e', border: '1.5px solid #fff' }} />}
            </button>
            {/* Hamburger — theme toggle lives inside the drawer */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="p-2 rounded-full"
              style={{ background: navScrolled ? 'rgba(139,94,60,0.1)' : 'rgba(255,255,255,0.15)' }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'x' : 'm'}
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.16 }}
                  style={{ display: 'block' }}
                >
                  {mobileOpen
                    ? <X size={18} style={{ color: navScrolled ? 'hsl(18,18%,18%)' : '#FFF9F0' }} />
                    : <Menu size={18} style={{ color: navScrolled ? 'hsl(18,18%,18%)' : '#FFF9F0' }} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(30,14,8,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-50 md:hidden flex flex-col overflow-hidden"
              style={{
                top: navScrolled ? 66 : 62, left: navScrolled ? 16 : 0, right: navScrolled ? 16 : 0,
                borderRadius: navScrolled ? 20 : 0,
                background: 'rgba(255,249,243,0.97)',
                backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                boxShadow: '0 20px 60px rgba(139,94,60,0.22)',
                border: '1px solid rgba(255,255,255,0.8)',
              }}
            >
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={e => handleNavClick(e, link)}
                  className="px-6 py-4 text-base font-semibold border-b last:border-b-0"
                  style={{ color: 'hsl(18,18%,16%)', borderColor: 'rgba(139,94,60,0.1)',
                    fontFamily: 'Poppins,sans-serif', textDecoration: 'none' }}
                >
                  {link.label}
                </motion.a>
              ))}
              {/* Theme toggle inside drawer */}
              <motion.button
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: NAV_LINKS.length * 0.04 }}
                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); }}
                className="px-6 py-4 text-base font-semibold flex items-center gap-3"
                style={{ color: 'hsl(18,18%,22%)', fontFamily: 'Poppins,sans-serif', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(139,94,60,0.1)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                {theme === 'dark'
                  ? <><Sun size={16} style={{ color: 'hsl(42,78%,55%)' }} /> Switch to Light Mode</>
                  : <><Moon size={16} style={{ color: 'hsl(18,18%,35%)' }} /> Switch to Dark Mode</>}
              </motion.button>
              {/* 🎁 Gift order row in drawer */}
              <motion.button
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (NAV_LINKS.length + 1) * 0.04 }}
                onClick={openGiftModal}
                className="relative px-6 py-4 text-base font-bold flex items-center gap-2"
                style={{ color: '#1a0800', fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg, rgba(232,182,74,0.15), rgba(201,146,46,0.1))', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(232,182,74,0.2)', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              >
                <Gift size={16} style={{ color: '#c9922e' }} />
                <span style={{ color: '#8b5e3c' }}>
                  {giftDraft ? 'Resume Gift Order' : 'Create a Gift'}
                </span>
                {giftDraft && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: 'rgba(181,58,46,0.1)', color: '#b53a2e', border: '1px solid rgba(181,58,46,0.2)' }}>DRAFT</span>
                )}
              </motion.button>
              <motion.a
                href="/products"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (NAV_LINKS.length + 2) * 0.04 }}
                onClick={e => { e.preventDefault(); setMobileOpen(false); navigate('/products'); }}
                className="px-6 py-4 text-base font-bold flex items-center gap-2"
                style={{ color: '#FFF9F3', fontFamily: 'Poppins,sans-serif', textDecoration: 'none',
                  background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))' }}
              >
                <span>🥒</span> Order Oorgai
              </motion.a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
