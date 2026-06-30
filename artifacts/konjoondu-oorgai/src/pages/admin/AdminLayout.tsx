import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Package, Warehouse, Users,
  Tag, BarChart3, Star, Truck, Bell, Settings, LogOut,
  Search, Moon, Sun, ChevronRight, Menu, X, Zap, PlusCircle,
} from 'lucide-react';
import type { AdminPage } from './types';

const NAV_ITEMS: { id: AdminPage; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'dashboard',     label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'orders',        label: 'Orders',            icon: ShoppingBag,   badge: 3 },
  { id: 'create-order',  label: 'Create Order',      icon: PlusCircle },
  { id: 'products',      label: 'Products',          icon: Package },
  { id: 'inventory',     label: 'Inventory',         icon: Warehouse },
  { id: 'customers',     label: 'Customers',         icon: Users },
  { id: 'coupons',       label: 'Coupons',           icon: Tag },
  { id: 'analytics',     label: 'Analytics',         icon: BarChart3 },
  { id: 'reviews',       label: 'Reviews',           icon: Star,          badge: 5 },
  { id: 'delivery',      label: 'Delivery',          icon: Truck },
  { id: 'notifications', label: 'Notifications',     icon: Bell,          badge: 2 },
  { id: 'settings',      label: 'Settings',          icon: Settings },
];

interface Props {
  page: AdminPage;
  onNavigate: (p: AdminPage) => void;
  onLogout: () => void;
  children: React.ReactNode;
  search: string;
  onSearch: (v: string) => void;
}

export default function AdminLayout({ page, onNavigate, onLogout, children, search, onSearch }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [dark, setDark] = useState(false);

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #52b788, #2d6a4f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(82,183,136,0.4)',
          }}>
            <span style={{ fontSize: 18 }}>🥒</span>
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#f0faf5', lineHeight: 1.2 }}>Konjoondu</p>
              <p style={{ fontSize: 11, color: 'rgba(240,250,245,0.5)', marginTop: 1 }}>Oorgai Admin</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileSidebar(false); }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 12, padding: sidebarOpen ? '10px 14px' : '10px',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 2,
                background: active ? 'rgba(82,183,136,0.18)' : 'transparent',
                color: active ? '#7dd3a8' : 'rgba(240,250,245,0.55)',
                fontFamily: 'Poppins, sans-serif', fontWeight: active ? 600 : 400,
                fontSize: 13, textAlign: 'left',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                position: 'relative',
                transition: 'all 0.15s',
              }}>
              {active && (
                <motion.div
                  layoutId="activeNav"
                  style={{
                    position: 'absolute', left: 0, top: '10%', bottom: '10%',
                    width: 3, borderRadius: 3,
                    background: 'linear-gradient(180deg, #52b788, #2d6a4f)',
                  }}
                />
              )}
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              {sidebarOpen && (
                <span style={{ flex: 1 }}>{item.label}</span>
              )}
              {sidebarOpen && item.badge ? (
                <span style={{
                  background: active ? '#52b788' : 'rgba(82,183,136,0.25)',
                  color: active ? '#0f2318' : '#7dd3a8',
                  fontSize: 10, fontWeight: 700, padding: '1px 7px',
                  borderRadius: 20,
                }}>{item.badge}</span>
              ) : null}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <motion.button
          onClick={onLogout}
          whileHover={{ x: 2 }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 12, padding: sidebarOpen ? '10px 14px' : '10px',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent',
            color: 'rgba(252,165,165,0.7)',
            fontFamily: 'Poppins, sans-serif', fontSize: 13,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            transition: 'all 0.15s',
          }}>
          <LogOut size={17} />
          {sidebarOpen && <span>Sign Out</span>}
        </motion.button>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#f0ede6',
      fontFamily: 'Poppins, sans-serif',
    }}>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 68 }}
        style={{
          background: '#0f2318',
          flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
          overflow: 'hidden', zIndex: 40,
          boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
          display: 'none',
        }}
        className="desktop-sidebar"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              style={{
                position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
                background: '#0f2318', zIndex: 60,
                boxShadow: '8px 0 32px rgba(0,0,0,0.3)',
              }}>
              <button
                onClick={() => setMobileSidebar(false)}
                style={{
                  position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff',
                }}>
                <X size={16} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top navbar */}
        <header style={{
          height: 62, background: 'rgba(255,253,250,0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(139,94,60,0.1)',
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
          position: 'sticky', top: 0, zIndex: 30,
          boxShadow: '0 1px 12px rgba(139,94,60,0.06)',
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebar(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d6a4f', padding: 4 }}
            className="mobile-only">
            <Menu size={22} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d6a4f', padding: 4 }}
            className="desktop-only">
            <Menu size={20} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7c5a' }} />
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search orders, products, customers…"
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)',
                fontSize: 13, outline: 'none', boxSizing: 'border-box',
                background: '#f5f2eb', color: '#1a1a0f', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            {/* Quick Action */}
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)',
                color: '#f0faf5', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(45,106,79,0.3)',
              }}>
              <Zap size={13} /> Quick Action
            </motion.button>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              style={{
                width: 36, height: 36, borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#6b7c5a',
              }}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button style={{
                width: 36, height: 36, borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#6b7c5a',
              }}>
                <Bell size={15} />
              </button>
              <span style={{
                position: 'absolute', top: -4, right: -4, width: 16, height: 16,
                background: '#dc2626', borderRadius: '50%', fontSize: 9, fontWeight: 700,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff',
              }}>2</span>
            </div>

            {/* Profile */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
              background: 'linear-gradient(135deg, #52b788, #2d6a4f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#f0faf5',
              boxShadow: '0 2px 8px rgba(45,106,79,0.25)',
            }}>
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px 24px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style>{`
        .desktop-sidebar { display: flex !important; flex-direction: column; }
        .mobile-only { display: none !important; }
        .desktop-only { display: flex !important; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
