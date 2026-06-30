import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Globe, Shield, LogOut, Trash2, ChevronRight, Moon, Sun, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { useTheme } from '@/components/ThemeProvider';

const PRIMARY = 'hsl(4,60%,44%)';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: value ? PRIMARY : '#c4a882', display: 'flex' }}>
      {value ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(139,94,60,0.1)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(139,94,60,0.06)', marginBottom: 16 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(139,94,60,0.07)' }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#8b6344', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function Row({ icon, label, description, right, onClick, danger }: {
  icon: React.ReactNode; label: string; description?: string;
  right?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s', borderBottom: '1px solid rgba(139,94,60,0.05)' }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = 'rgba(139,94,60,0.03)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(139,94,60,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#ef4444' : '#8b6344', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: danger ? '#ef4444' : '#1a0f08' }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: '#8b6344', marginTop: 2 }}>{description}</div>}
      </div>
      {right ?? (onClick && <ChevronRight size={16} color="#c4a882" />)}
    </div>
  );
}

export default function Settings() {
  const { customer, token, apiBase, logout, updateCustomer } = useCustomer();
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState(customer?.communicationPrefs ?? { email: true, sms: true, whatsapp: true });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function updatePref(key: keyof typeof prefs, value: boolean) {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    if (!token) return;
    setSavingPrefs(true);
    try {
      const res = await fetch(`${apiBase}/customer/me`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ communicationPrefs: newPrefs }),
      });
      const d = await res.json();
      if (d.success) updateCustomer({ communicationPrefs: newPrefs });
    } catch { /* silent */ }
    finally { setSavingPrefs(false); }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  function handleDeleteAccount() {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Please contact support at support@konjoondu.com to delete your account.');
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Appearance */}
      <Section title="Appearance">
        <Row
          icon={theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
          label="Dark Mode"
          description={theme === 'dark' ? 'Currently on' : 'Currently off'}
          right={<Toggle value={theme === 'dark'} onChange={v => setTheme(v ? 'dark' : 'light')} />}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row icon={<Bell size={17} />} label="Email Notifications" description="Order updates, offers" right={<Toggle value={prefs.email} onChange={v => updatePref('email', v)} />} />
        <Row icon={<Bell size={17} />} label="SMS Notifications" description="Shipping & delivery alerts" right={<Toggle value={prefs.sms} onChange={v => updatePref('sms', v)} />} />
        <Row icon={<Bell size={17} />} label="WhatsApp Notifications" description="Order confirmations" right={<Toggle value={prefs.whatsapp} onChange={v => updatePref('whatsapp', v)} />} />
        {savingPrefs && <div style={{ padding: '8px 20px', fontSize: 11, color: '#8b6344' }}>Saving preferences…</div>}
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Security">
        <Row icon={<Shield size={17} />} label="Privacy Policy" description="How we handle your data" onClick={() => window.open('https://konjoondu.com/privacy', '_blank')} />
        <Row icon={<Globe size={17} />} label="Terms of Service" onClick={() => window.open('https://konjoondu.com/terms', '_blank')} />
      </Section>

      {/* Account */}
      <Section title="Account">
        <Row
          icon={<LogOut size={17} />}
          label={loggingOut ? 'Signing out…' : 'Sign Out'}
          description={`Signed in as ${customer?.phone}`}
          onClick={loggingOut ? undefined : handleLogout}
        />
        <Row
          icon={<Trash2 size={17} />}
          label="Delete Account"
          description="Permanently remove your data"
          danger
          onClick={handleDeleteAccount}
        />
      </Section>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#c4a882', marginTop: 8 }}>
        Konjoondu Oorgai · All rights reserved
      </p>
    </div>
  );
}
