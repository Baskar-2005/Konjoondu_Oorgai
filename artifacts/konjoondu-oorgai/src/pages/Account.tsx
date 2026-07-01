import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, User, MapPin, Heart, Bell, Star, Settings as SettingsIcon, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import AuthPage from './account/AuthPage';
import CustomerDashboard from './account/CustomerDashboard';
import MyOrders from './account/MyOrders';
import Profile from './account/Profile';
import Addresses from './account/Addresses';
import Wishlist from './account/Wishlist';
import Notifications from './account/Notifications';
import Reviews from './account/Reviews';
import SettingsPage from './account/Settings';

const PRIMARY = 'hsl(4,60%,44%)';

type AccountPage = 'dashboard' | 'orders' | 'profile' | 'addresses' | 'wishlist' | 'notifications' | 'reviews' | 'settings' | 'rewards';

interface NavItem { id: AccountPage; label: string; icon: React.ReactNode; badge?: number; }

function useUnreadCount(token: string | null, apiBase: string) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!token) return;
    fetch(`${apiBase}/customer/notifications`, { headers: { 'x-customer-token': token } })
      .then(r => r.json())
      .then(d => { if (d.success) setCount(d.notifications.filter((n: { isRead: boolean }) => !n.isRead).length); })
      .catch(() => {});
  }, [token, apiBase]);
  return count;
}

function Sidebar({ page, onNavigate, onLogout, unread }: { page: AccountPage; onNavigate: (p: AccountPage) => void; onLogout: () => void; unread: number }) {
  const { customer } = useCustomer();

  const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={17} /> },
    { id: 'profile', label: 'Profile', icon: <User size={17} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={17} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={17} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={17} />, badge: unread },
    { id: 'reviews', label: 'Reviews', icon: <Star size={17} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={17} /> },
  ];

  return (
    <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Profile card */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(139,94,60,0.1)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${PRIMARY}, hsl(4,60%,30%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 3px 10px rgba(181,58,46,0.3)', flexShrink: 0 }}>
            {customer?.name?.charAt(0)?.toUpperCase() || '🥒'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1a0f08', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {customer?.name || 'Customer'}
            </div>
            <div style={{ fontSize: 11, color: '#8b6344', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {customer?.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = page === item.id;
          return (
            <motion.button key={item.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 12, border: 'none', marginBottom: 2, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: active ? 700 : 600, fontSize: 13, textAlign: 'left', transition: 'all 0.15s', position: 'relative',
                background: active ? `${PRIMARY}12` : 'transparent',
                color: active ? PRIMARY : '#4a3728',
              }}>
              <span style={{ color: active ? PRIMARY : '#8b6344', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {(item.badge ?? 0) > 0 && (
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: PRIMARY, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.badge}
                </span>
              )}
              {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: PRIMARY }} />}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(139,94,60,0.1)' }}>
        <button onClick={onLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 13, background: 'rgba(239,68,68,0.06)', color: '#ef4444' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}

function MobileNav({ page, onNavigate, unread }: { page: AccountPage; onNavigate: (p: AccountPage) => void; unread: number }) {
  const MOBILE_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Orders', icon: <Package size={20} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { id: 'notifications', label: 'Alerts', icon: <Bell size={20} />, badge: unread },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,252,248,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(139,94,60,0.12)', display: 'flex', boxShadow: '0 -4px 20px rgba(139,94,60,0.1)' }}>
      {MOBILE_ITEMS.map(item => {
        const active = page === item.id;
        return (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            style={{ flex: 1, padding: '10px 4px 12px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative', fontFamily: 'Poppins,sans-serif' }}>
            <span style={{ color: active ? PRIMARY : '#8b6344', position: 'relative' }}>
              {item.icon}
              {(item.badge ?? 0) > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: PRIMARY, color: '#fff', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.badge}
                </span>
              )}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 600, color: active ? PRIMARY : '#8b6344' }}>{item.label}</span>
            {active && <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, borderRadius: '0 0 3px 3px', background: PRIMARY }} />}
          </button>
        );
      })}
    </div>
  );
}

const PAGE_TITLES: Record<AccountPage, string> = {
  dashboard: 'Dashboard', orders: 'My Orders', profile: 'Profile', addresses: 'Saved Addresses',
  wishlist: 'Wishlist', notifications: 'Notifications', reviews: 'My Reviews', settings: 'Settings', rewards: 'Rewards',
};

// Profile setup modal shown on first login
function FirstLoginModal({ onComplete }: { onComplete: () => void }) {
  const { customer, token, apiBase, updateCustomer } = useCustomer();
  const [step, setStep] = useState<'profile' | 'address'>('profile');
  const [form, setForm] = useState({ name: customer?.name || '', email: customer?.email || '', phone: customer?.phone || '', dob: '', gender: '' });
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    if (!token || !form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/customer/me`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ ...form, isFirstLogin: false }),
      });
      const d = await res.json();
      if (d.success) { updateCustomer(d.customer); setStep('address'); }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ y: 40, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
        style={{ background: '#fffcf8', borderRadius: 28, padding: '36px 32px', width: '100%', maxWidth: 440, boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a0f08', marginBottom: 6 }}>Welcome to Konjoondu Oorgai!</h2>
          <p style={{ fontSize: 13, color: '#8b6344' }}>
            {step === 'profile' ? "Tell us a bit about yourself to personalise your experience." : "Add a delivery address to make checkout faster."}
          </p>
        </div>

        {step === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Your full name' },
              { key: 'email', label: 'Email (optional)', type: 'email', placeholder: 'your@email.com' },
              { key: 'phone', label: 'Phone Number (optional)', type: 'tel', placeholder: '+91 98765 43210' },
              { key: 'dob', label: 'Date of Birth (optional)', type: 'date', placeholder: '' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b6344', display: 'block', marginBottom: 7 }}>{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '11px 13px', borderRadius: 12, fontSize: 14, fontFamily: 'Poppins,sans-serif', border: '1.5px solid rgba(139,94,60,0.2)', outline: 'none', boxSizing: 'border-box', color: '#1a0f08', background: '#faf8f5' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b6344', display: 'block', marginBottom: 7 }}>Gender (optional)</label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                style={{ width: '100%', padding: '11px 13px', borderRadius: 12, fontSize: 14, fontFamily: 'Poppins,sans-serif', border: '1.5px solid rgba(139,94,60,0.2)', outline: 'none', background: '#faf8f5', color: form.gender ? '#1a0f08' : '#9ca3af' }}>
                <option value="">Select…</option>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={onComplete} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid rgba(139,94,60,0.2)', background: 'transparent', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#8b6344' }}>Skip</button>
              <button onClick={saveProfile} disabled={saving || !form.name.trim()}
                style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: !form.name.trim() ? 'rgba(181,58,46,0.3)' : PRIMARY, color: '#fff9f0', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, boxShadow: form.name.trim() ? '0 4px 16px rgba(181,58,46,0.3)' : 'none' }}>
                {saving ? 'Saving…' : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {step === 'address' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: '#8b6344', textAlign: 'center', lineHeight: 1.6 }}>
              You can add your delivery address now or later from the Addresses section.
            </p>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={onComplete} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid rgba(139,94,60,0.2)', background: 'transparent', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#8b6344' }}>Skip</button>
              <button onClick={onComplete} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: PRIMARY, color: '#fff9f0', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14 }}>Go to Dashboard →</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function AccountPage() {
  const { customer, loading, logout } = useCustomer();
  const { token, apiBase } = useCustomer();
  const [page, setPage] = useState<AccountPage>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const unread = useUnreadCount(token, apiBase);

  useEffect(() => {
    if (customer?.isFirstLogin) {
      const timer = setTimeout(() => setShowFirstLogin(true), 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [customer?.isFirstLogin]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffcf8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid rgba(181,58,46,0.15)`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#8b6344', fontSize: 13, fontWeight: 600 }}>Loading…</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!customer) {
    return <AuthPage onSuccess={() => setShowFirstLogin(false)} />;
  }

  function renderPage() {
    switch (page) {
      case 'dashboard': return <CustomerDashboard onNavigate={p => setPage(p as AccountPage)} />;
      case 'orders': return <MyOrders />;
      case 'profile': return <Profile />;
      case 'addresses': return <Addresses />;
      case 'wishlist': return <Wishlist />;
      case 'notifications': return <Notifications />;
      case 'reviews': return <Reviews />;
      case 'settings': return <SettingsPage />;
      default: return <CustomerDashboard onNavigate={p => setPage(p as AccountPage)} />;
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', fontFamily: 'Poppins,sans-serif' }}>
      {/* First login modal */}
      <AnimatePresence>
        {showFirstLogin && customer.isFirstLogin && (
          <FirstLoginModal onComplete={() => setShowFirstLogin(false)} />
        )}
      </AnimatePresence>

      {/* Desktop layout */}
      <div className="hidden md:flex" style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ width: 256, flexShrink: 0, background: '#fff', borderRight: '1px solid rgba(139,94,60,0.1)', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10, overflowY: 'auto', boxShadow: '2px 0 20px rgba(139,94,60,0.06)' }}>
          {/* Brand */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(139,94,60,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🥒</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#1a0f08', letterSpacing: '-0.01em' }}>Konjoondu</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8b6344', letterSpacing: '0.15em' }}>OORGAI</div>
            </div>
          </div>
          <Sidebar page={page} onNavigate={setPage} onLogout={logout} unread={unread} />
        </div>

        {/* Content */}
        <div style={{ marginLeft: 256, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '28px 32px', borderBottom: '1px solid rgba(139,94,60,0.08)', background: '#fff', position: 'sticky', top: 0, zIndex: 5 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a0f08', letterSpacing: '-0.02em' }}>{PAGE_TITLES[page]}</h1>
          </div>
          <div style={{ flex: 1, padding: '28px 32px' }}>
            <AnimatePresence mode="wait">
              <motion.div key={page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden" style={{ minHeight: '100vh', paddingBottom: 72 }}>
        {/* Mobile top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(139,94,60,0.1)', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'rgba(139,94,60,0.08)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a3728' }}>
            <Menu size={18} />
          </button>
          <h1 style={{ fontSize: 17, fontWeight: 900, color: '#1a0f08', flex: 1 }}>{PAGE_TITLES[page]}</h1>
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                onClick={() => setMobileSidebarOpen(false)} />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, zIndex: 50, background: '#fff', boxShadow: '8px 0 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 16px', borderBottom: '1px solid rgba(139,94,60,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>🥒</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#1a0f08' }}>My Account</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <Sidebar page={page} onNavigate={(p) => { setPage(p); setMobileSidebarOpen(false); }} onLogout={logout} unread={unread} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile content */}
        <div style={{ padding: '20px 16px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>

        <MobileNav page={page} onNavigate={setPage} unread={unread} />
      </div>
    </div>
  );
}
