import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Package, Warehouse, Users,
  Tag, BarChart3, Star, Truck, Bell, Settings, LogOut,
  Search, Moon, Sun, ChevronRight, Menu, X, Zap, PlusCircle,
  UserCircle, ChevronDown, RefreshCw, FileText, PackagePlus,
  Scan, CheckCircle, AlertCircle, Info, Clock,
} from 'lucide-react';
import type { AdminPage } from './types';

const NAV_ITEMS: { id: AdminPage; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'orders',        label: 'Orders',         icon: ShoppingBag,   badge: 3 },
  { id: 'create-order',  label: 'Create Order',   icon: PlusCircle },
  { id: 'products',      label: 'Products',       icon: Package },
  { id: 'inventory',     label: 'Inventory',      icon: Warehouse },
  { id: 'customers',     label: 'Customers',      icon: Users },
  { id: 'coupons',       label: 'Coupons',        icon: Tag },
  { id: 'analytics',     label: 'Analytics',      icon: BarChart3 },
  { id: 'reviews',       label: 'Reviews',        icon: Star, badge: 5 },
  { id: 'delivery',      label: 'Delivery',       icon: Truck },
  { id: 'notifications', label: 'Notifications',  icon: Bell, badge: 2 },
  { id: 'settings',      label: 'Settings',       icon: Settings },
];

const NOTIFICATIONS = [
  { id: 1, type: 'order', icon: ShoppingBag, color: '#2d6a4f', bg: '#d1fae5', title: 'New order received', body: 'Order KO-001 — Karthik Rajan · ₹820', time: '2 min ago', read: false },
  { id: 2, type: 'stock', icon: AlertCircle, color: '#dc2626', bg: '#fee2e2', title: 'Low stock alert', body: 'Squid Pickle 250g — only 4 units left', time: '18 min ago', read: false },
  { id: 3, type: 'payment', icon: CheckCircle, color: '#6366f1', bg: '#e0e7ff', title: 'Payment verified', body: 'Razorpay ₹1,030 — Ravi Kumar', time: '1 hr ago', read: true },
  { id: 4, type: 'review', icon: Star, color: '#d97706', bg: '#fef3c7', title: 'New 5★ review', body: '"Best prawn pickle I\'ve ever had!" — Meena S.', time: '3 hr ago', read: true },
  { id: 5, type: 'info', icon: Info, color: '#0891b2', bg: '#cffafe', title: 'Delivery update', body: 'SHP002 — Out for delivery', time: '5 hr ago', read: true },
];

const QUICK_ACTIONS = [
  { id: 'create-order', label: 'New Order', icon: PlusCircle, color: '#2d6a4f' },
  { id: 'scan-station', label: 'Scan Station', icon: Scan, color: '#6366f1' },
  { id: 'products', label: 'Add Product', icon: PackagePlus, color: '#d97706' },
  { id: 'delivery', label: 'Track Shipment', icon: Truck, color: '#0891b2' },
  { id: 'coupons', label: 'Create Coupon', icon: Tag, color: '#7c3aed' },
  { id: 'orders', label: 'View Orders', icon: ShoppingBag, color: '#059669' },
];

interface Props {
  page: AdminPage;
  onNavigate: (p: AdminPage | 'scan-station') => void;
  onLogout: () => void;
  children: React.ReactNode;
  search: string;
  onSearch: (v: string) => void;
  dark: boolean;
  onToggleDark: () => void;
}

export default function AdminLayout({ page, onNavigate, onLogout, children, search, onSearch, dark, onToggleDark }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const d = dark;
  const sidebar = '#0f2318';
  const sidebarBorder = 'rgba(255,255,255,0.07)';

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(82,183,136,0.4)', flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>🥒</span>
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#f0faf5', lineHeight: 1.2 }}>Konjoondu</p>
              <p style={{ fontSize: 11, color: 'rgba(240,250,245,0.5)', marginTop: 1 }}>Oorgai Admin</p>
            </motion.div>
          )}
        </div>
      </div>
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <motion.button key={item.id}
              onClick={() => { onNavigate(item.id); setMobileSidebar(false); }}
              whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 12, padding: sidebarOpen ? '10px 14px' : '10px',
                borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2,
                background: active ? 'rgba(82,183,136,0.18)' : 'transparent',
                color: active ? '#7dd3a8' : 'rgba(240,250,245,0.55)',
                fontFamily: 'Poppins, sans-serif', fontWeight: active ? 600 : 400,
                fontSize: 13, textAlign: 'left',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                position: 'relative', transition: 'all 0.15s',
              }}>
              {active && <motion.div layoutId="activeNav" style={{ position: 'absolute', left: 0, top: '10%', bottom: '10%', width: 3, borderRadius: 3, background: 'linear-gradient(180deg, #52b788, #2d6a4f)' }} />}
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
              {sidebarOpen && item.badge ? (
                <span style={{ background: active ? '#52b788' : 'rgba(82,183,136,0.25)', color: active ? '#0f2318' : '#7dd3a8', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>{item.badge}</span>
              ) : null}
            </motion.button>
          );
        })}
        {/* Scan Station special button */}
        <motion.button
          onClick={() => { onNavigate('scan-station'); setMobileSidebar(false); }}
          whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 12, padding: sidebarOpen ? '10px 14px' : '10px',
            borderRadius: 10, border: '1.5px dashed rgba(99,102,241,0.35)', cursor: 'pointer', marginTop: 8,
            background: 'rgba(99,102,241,0.08)',
            color: '#a5b4fc',
            fontFamily: 'Poppins, sans-serif', fontWeight: 500,
            fontSize: 13, justifyContent: sidebarOpen ? 'flex-start' : 'center',
            transition: 'all 0.15s',
          }}>
          <Scan size={15} />
          {sidebarOpen && <span>Scan Station</span>}
        </motion.button>
      </nav>
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${sidebarBorder}` }}>
        <motion.button onClick={onLogout} whileHover={{ x: 2 }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: sidebarOpen ? '10px 14px' : '10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(252,165,165,0.7)', fontFamily: 'Poppins, sans-serif', fontSize: 13, justifyContent: sidebarOpen ? 'flex-start' : 'center', transition: 'all 0.15s' }}>
          <LogOut size={17} />
          {sidebarOpen && <span>Sign Out</span>}
        </motion.button>
      </div>
    </div>
  );

  return (
    <div data-theme={d ? 'dark' : 'light'} style={{ display: 'flex', minHeight: '100vh', background: d ? '#0d1f14' : '#f0ede6', fontFamily: 'Poppins, sans-serif' }}>
      {/* CSS Variables injection */}
      <style>{`
        [data-theme="light"] { --adm-bg: #f0ede6; --adm-card: #fff9f5; --adm-card-alt: rgba(139,94,60,0.04); --adm-text: #1a1a0f; --adm-text2: #6b7c5a; --adm-text3: #4a5568; --adm-border: rgba(139,94,60,0.1); --adm-border2: rgba(139,94,60,0.14); --adm-shadow: rgba(139,94,60,0.06); --adm-thead: rgba(139,94,60,0.03); --adm-input-bg: #fff9f5; --adm-hover: rgba(45,106,79,0.04); --adm-header-bg: rgba(255,253,250,0.95); }
        [data-theme="dark"] { --adm-bg: #0d1f14; --adm-card: #132018; --adm-card-alt: rgba(82,183,136,0.06); --adm-text: #f0faf5; --adm-text2: #7dd3a8; --adm-text3: #a7d3b8; --adm-border: rgba(82,183,136,0.12); --adm-border2: rgba(82,183,136,0.16); --adm-shadow: rgba(0,0,0,0.25); --adm-thead: rgba(82,183,136,0.05); --adm-input-bg: #0f2318; --adm-hover: rgba(82,183,136,0.06); --adm-header-bg: rgba(13,31,20,0.97); }
        .desktop-sidebar { display: flex !important; flex-direction: column; }
        .mobile-only { display: none !important; }
        .desktop-only { display: flex !important; }
        @media (max-width: 768px) { .desktop-sidebar { display: none !important; } .mobile-only { display: flex !important; } .desktop-only { display: none !important; } }
        .notif-panel::-webkit-scrollbar { width: 4px; }
        .notif-panel::-webkit-scrollbar-track { background: transparent; }
        .notif-panel::-webkit-scrollbar-thumb { background: rgba(45,106,79,0.3); border-radius: 4px; }
      `}</style>

      {/* Desktop Sidebar */}
      <motion.aside animate={{ width: sidebarOpen ? 220 : 68 }}
        style={{ background: sidebar, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, overflow: 'hidden', zIndex: 40, boxShadow: '4px 0 24px rgba(0,0,0,0.18)', display: 'none' }}
        className="desktop-sidebar">
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: sidebar, zIndex: 60, boxShadow: '8px 0 32px rgba(0,0,0,0.3)' }}>
              <button onClick={() => setMobileSidebar(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#fff' }}>
                <X size={16} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{ height: 62, background: 'var(--adm-header-bg)', backdropFilter: 'blur(16px)', borderBottom: `1px solid var(--adm-border)`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 12px var(--adm-shadow)' }}>
          <button onClick={() => setMobileSidebar(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d6a4f', padding: 4 }} className="mobile-only">
            <Menu size={22} />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2d6a4f', padding: 4 }} className="desktop-only">
            <Menu size={20} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text2)' }} />
            <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search orders, products, customers…"
              style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'var(--adm-input-bg)', color: 'var(--adm-text)', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            {/* Quick Action */}
            <div ref={quickRef} style={{ position: 'relative' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => { setQuickOpen(!quickOpen); setNotifOpen(false); setProfileOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.3)' }}>
                <Zap size={13} /> Quick Action <ChevronDown size={11} style={{ opacity: 0.7 }} />
              </motion.button>
              <AnimatePresence>
                {quickOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--adm-card)', borderRadius: 16, border: `1.5px solid var(--adm-border)`, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 10, minWidth: 200, zIndex: 100 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px 8px' }}>Quick Actions</p>
                    {QUICK_ACTIONS.map(a => (
                      <button key={a.id} onClick={() => { onNavigate(a.id as any); setQuickOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--adm-text)', fontSize: 13, fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--adm-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${a.color}18`, flexShrink: 0 }}>
                          <a.icon size={13} color={a.color} />
                        </div>
                        {a.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark mode toggle */}
            <motion.button onClick={onToggleDark} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid var(--adm-border2)`, background: d ? 'rgba(82,183,136,0.12)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: d ? '#7dd3a8' : '#6b7c5a', transition: 'all 0.2s' }}>
              {d ? <Sun size={15} /> : <Moon size={15} />}
            </motion.button>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setQuickOpen(false); }}
                style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid var(--adm-border2)`, background: notifOpen ? 'var(--adm-hover)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text2)', position: 'relative' }}>
                <Bell size={15} />
              </button>
              {unread > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#dc2626', borderRadius: '50%', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--adm-bg)', pointerEvents: 'none' }}>{unread}</span>
              )}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--adm-card)', borderRadius: 18, border: `1.5px solid var(--adm-border)`, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', width: 340, zIndex: 100 }}>
                    <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid var(--adm-border)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--adm-text)' }}>Notifications</p>
                      {unread > 0 && (
                        <button onClick={markAllRead} style={{ fontSize: 11, color: '#2d6a4f', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Mark all read</button>
                      )}
                    </div>
                    <div className="notif-panel" style={{ maxHeight: 380, overflowY: 'auto' }}>
                      {notifications.map(n => (
                        <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          style={{ display: 'flex', gap: 12, padding: '13px 18px', borderBottom: `1px solid var(--adm-border)`, cursor: 'pointer', background: n.read ? 'transparent' : 'var(--adm-hover)', transition: 'background 0.15s' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <n.icon size={15} color={n.color} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                              <p style={{ fontSize: 12, fontWeight: n.read ? 500 : 700, color: 'var(--adm-text)' }}>{n.title}</p>
                              {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2d6a4f', flexShrink: 0, marginTop: 3 }} />}
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--adm-text2)', lineHeight: 1.4, marginBottom: 3 }}>{n.body}</p>
                            <p style={{ fontSize: 10, color: 'var(--adm-text3)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={9} />{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '12px 18px' }}>
                      <button onClick={() => { onNavigate('notifications'); setNotifOpen(false); }}
                        style={{ width: '100%', padding: '8px', borderRadius: 10, border: `1.5px solid var(--adm-border)`, background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600 }}>
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setQuickOpen(false); }}
                style={{ width: 36, height: 36, borderRadius: 10, cursor: 'pointer', background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#f0faf5', boxShadow: '0 2px 8px rgba(45,106,79,0.25)', border: 'none' }}>
                A
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--adm-card)', borderRadius: 16, border: `1.5px solid var(--adm-border)`, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', width: 220, zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '18px', borderBottom: `1px solid var(--adm-border)`, background: 'linear-gradient(135deg, rgba(45,106,79,0.12), rgba(82,183,136,0.06))' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 10 }}>A</div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 2 }}>Super Admin</p>
                      <p style={{ fontSize: 11, color: 'var(--adm-text2)' }}>admin@konjoonduoorgai.com</p>
                    </div>
                    <div style={{ padding: 8 }}>
                      {[
                        { label: 'Account Settings', icon: Settings, action: () => { onNavigate('settings'); setProfileOpen(false); } },
                        { label: 'Users & Roles', icon: Users, action: () => { onNavigate('settings'); setProfileOpen(false); } },
                      ].map(item => (
                        <button key={item.label} onClick={item.action}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--adm-text)', fontSize: 12, fontFamily: 'inherit', textAlign: 'left' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--adm-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <item.icon size={14} color="var(--adm-text2)" />
                          {item.label}
                        </button>
                      ))}
                      <div style={{ height: 1, background: 'var(--adm-border)', margin: '6px 0' }} />
                      <button onClick={() => { onLogout(); setProfileOpen(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: '#dc2626', fontSize: 12, fontFamily: 'inherit', textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fee2e220')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px 24px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
