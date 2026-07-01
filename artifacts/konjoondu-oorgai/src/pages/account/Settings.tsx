import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Globe, Shield, LogOut, Trash2, ChevronRight, Moon, Sun, ToggleLeft, ToggleRight, User, Phone, Mail, Lock, HelpCircle, MessageSquare, Info, Copy, CheckCircle2, X } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';

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
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(139,94,60,0.07)' }}>
        <h3 style={{ fontSize: 11, fontWeight: 800, color: '#8b6344', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function Row({ icon, label, description, right, onClick, danger, noBorder }: {
  icon: React.ReactNode; label: string; description?: string;
  right?: React.ReactNode; onClick?: () => void; danger?: boolean; noBorder?: boolean;
}) {
  return (
    <div onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s', borderBottom: noBorder ? 'none' : '1px solid rgba(139,94,60,0.05)' }}
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

function InfoRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: `${label} copied` });
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderBottom: '1px solid rgba(139,94,60,0.05)' }}>
      <span style={{ fontSize: 12, color: '#8b6344', fontWeight: 600 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a0f08' }}>{value}</span>
        {copyable && (
          <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', display: 'flex', padding: 4 }}>
            {copied ? <CheckCircle2 size={14} color="#22c55e" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose, apiBase, token }: { onClose: () => void; apiBase: string; token: string }) {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  async function submit() {
    if (!oldPwd || !newPwd || !confirmPwd) { setError('All fields are required.'); return; }
    if (newPwd.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPwd !== confirmPwd) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/customer/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ currentPassword: oldPwd, newPassword: newPwd }),
      });
      const d = await res.json();
      if (d.success) {
        setDone(true);
        toast({ title: 'Password changed successfully' });
      } else {
        setError(d.message || 'Failed to change password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 10, fontSize: 13,
    border: '1.5px solid rgba(139,94,60,0.2)', background: '#faf8f5',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Poppins,sans-serif', color: '#1a0f08',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
        style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400 }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Password Changed!</h3>
            <p style={{ fontSize: 13, color: '#8b6344' }}>Your account is now secured with the new password.</p>
            <button onClick={onClose} style={{ marginTop: 18, padding: '10px 28px', borderRadius: 12, border: 'none', background: PRIMARY, color: '#fff9f0', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: 14 }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1a0f08' }}>Change Password</h3>
              <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Current Password', val: oldPwd, set: setOldPwd },
                { label: 'New Password', val: newPwd, set: setNewPwd },
                { label: 'Confirm New Password', val: confirmPwd, set: setConfirmPwd },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type="password" value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                </div>
              ))}
              {error && <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{error}</p>}
              <button onClick={submit} disabled={loading}
                style={{ padding: '12px', borderRadius: 12, border: 'none', background: loading ? 'rgba(181,58,46,0.4)' : PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif', marginTop: 4 }}>
                {loading ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Settings() {
  const { customer, token, apiBase, logout, updateCustomer } = useCustomer();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState(customer?.communicationPrefs ?? { email: true, sms: true, whatsapp: true });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);

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
      if (d.success) {
        updateCustomer({ communicationPrefs: newPrefs });
        toast({ title: 'Notification preferences saved' });
      }
    } catch { /* silent */ }
    finally { setSavingPrefs(false); }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }

  function handleDeleteAccount() {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({ title: 'Contact support to delete your account', description: 'Email us at support@konjoondu.com', variant: 'destructive' });
    }
  }

  function copyCustomerId() {
    if (customer?.id) {
      navigator.clipboard.writeText(customer.id);
      toast({ title: 'Customer ID copied' });
    }
  }

  const memberSince = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Account Info */}
      <Section title="Account Information">
        {customer?.name && <InfoRow label="Name" value={customer.name} />}
        {customer?.phone && <InfoRow label="Phone" value={customer.phone} copyable />}
        {customer?.email && <InfoRow label="Email" value={customer.email} copyable />}
        <InfoRow label="Member Since" value={memberSince} />
        {customer?.id && <InfoRow label="Customer ID" value={customer.id.slice(0, 12) + '…'} copyable />}
        {customer?.rewardPoints !== undefined && (
          <InfoRow label="Reward Points" value={`${customer.rewardPoints} pts`} />
        )}
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <Row
          icon={theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
          label="Dark Mode"
          description={theme === 'dark' ? 'Currently on' : 'Currently off'}
          right={<Toggle value={theme === 'dark'} onChange={v => setTheme(v ? 'dark' : 'light')} />}
          noBorder
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row icon={<Bell size={17} />} label="Email Notifications" description="Order updates & offers" right={<Toggle value={prefs.email} onChange={v => updatePref('email', v)} />} />
        <Row icon={<Bell size={17} />} label="SMS Notifications" description="Shipping & delivery alerts" right={<Toggle value={prefs.sms} onChange={v => updatePref('sms', v)} />} />
        <Row icon={<Bell size={17} />} label="WhatsApp Notifications" description="Order confirmations" right={<Toggle value={prefs.whatsapp} onChange={v => updatePref('whatsapp', v)} />} noBorder />
        {savingPrefs && <div style={{ padding: '8px 20px 12px', fontSize: 11, color: '#8b6344' }}>Saving preferences…</div>}
      </Section>

      {/* Security */}
      <Section title="Security">
        <Row icon={<Lock size={17} />} label="Change Password" description="Update your account password" onClick={() => setShowChangePwd(true)} />
        <Row icon={<Phone size={17} />} label="Linked Phone" description={customer?.phone ?? '—'} right={<span style={{ fontSize: 11, background: 'rgba(34,197,94,0.12)', color: '#16a34a', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Verified</span>} noBorder />
      </Section>

      {/* Support */}
      <Section title="Help & Support">
        <Row icon={<MessageSquare size={17} />} label="Contact Support" description="We reply within 24 hours"
          onClick={() => window.open('mailto:support@konjoondu.com', '_blank')} />
        <Row icon={<HelpCircle size={17} />} label="FAQs" description="Common questions answered"
          onClick={() => toast({ title: 'FAQs coming soon!' })} />
        <Row icon={<Globe size={17} />} label="Terms of Service"
          onClick={() => toast({ title: 'Terms coming soon!' })} noBorder />
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Legal">
        <Row icon={<Shield size={17} />} label="Privacy Policy" description="How we handle your data"
          onClick={() => toast({ title: 'Privacy Policy coming soon!' })} noBorder />
      </Section>

      {/* About */}
      <Section title="About">
        <Row icon={<Info size={17} />} label="Konjoondu Oorgai" description="Handcrafted pickles since 2024" right={<span style={{ fontSize: 12, color: '#8b6344', fontWeight: 700 }}>v1.0</span>} noBorder />
      </Section>

      {/* Account Actions */}
      <Section title="Account">
        <Row
          icon={<LogOut size={17} />}
          label={loggingOut ? 'Signing out…' : 'Sign Out'}
          description={`Signed in as ${customer?.phone ?? ''}`}
          onClick={loggingOut ? undefined : handleLogout}
        />
        <Row
          icon={<Trash2 size={17} />}
          label="Delete Account"
          description="Permanently remove your data"
          danger
          onClick={handleDeleteAccount}
          noBorder
        />
      </Section>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#c4a882', marginTop: 8, paddingBottom: 16 }}>
        Konjoondu Oorgai · Made with ♥ in India
      </p>

      <AnimatePresence>
        {showChangePwd && token && (
          <ChangePasswordModal onClose={() => setShowChangePwd(false)} apiBase={apiBase} token={token} />
        )}
      </AnimatePresence>
    </div>
  );
}
