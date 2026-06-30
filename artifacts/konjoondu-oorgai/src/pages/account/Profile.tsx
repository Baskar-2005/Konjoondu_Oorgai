import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, ChevronDown, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';

const PRIMARY = 'hsl(4,60%,44%)';

function Field({ label, value, onChange, type = 'text', icon, placeholder, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void; type?: string;
  icon?: React.ReactNode; placeholder?: string; readOnly?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b6344', display: 'block', marginBottom: 7 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>{icon}</span>}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          readOnly={readOnly}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: `12px ${isPassword ? 40 : 14}px 12px ${icon ? 40 : 14}px`,
            borderRadius: 12, fontSize: 14, fontFamily: 'Poppins,sans-serif',
            border: '1.5px solid rgba(139,94,60,0.2)',
            outline: 'none', boxSizing: 'border-box', color: readOnly ? '#8b6344' : '#1a0f08',
            background: readOnly ? 'rgba(139,94,60,0.04)' : '#faf8f5', transition: 'border-color 0.2s',
          }}
          onFocus={e => { if (!readOnly) e.target.style.borderColor = PRIMARY; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(139,94,60,0.2)'; }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(v => !v)}
            style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', display: 'flex' }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b6344', display: 'block', marginBottom: 7 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 12, fontSize: 14, fontFamily: 'Poppins,sans-serif', border: '1.5px solid rgba(139,94,60,0.2)', outline: 'none', background: '#faf8f5', color: '#1a0f08', appearance: 'none', cursor: 'pointer' }}>
          <option value="">Select…</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={15} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: '#8b6344', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

export default function Profile() {
  const { customer, token, apiBase, updateCustomer } = useCustomer();
  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    dob: customer?.dob || '',
    gender: customer?.gender || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password change
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');

  async function saveProfile() {
    if (!token) return;
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch(`${apiBase}/customer/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { updateCustomer(data.customer); setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(data.message || 'Failed to save.');
    } catch { setError('Network error.'); }
    finally { setSaving(false); }
  }

  async function changePassword() {
    if (!token) return;
    if (pwdForm.new !== pwdForm.confirm) { setPwdMsg('Passwords do not match.'); return; }
    if (pwdForm.new.length < 6) { setPwdMsg('Password must be at least 6 characters.'); return; }
    setPwdSaving(true); setPwdMsg('');
    try {
      const res = await fetch(`${apiBase}/customer/me/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.new }),
      });
      const data = await res.json();
      setPwdMsg(data.success ? '✅ Password updated successfully.' : data.message || 'Failed.');
      if (data.success) setPwdForm({ current: '', new: '', confirm: '' });
    } catch { setPwdMsg('Network error.'); }
    finally { setPwdSaving(false); }
  }

  const profilePct = [form.name, form.email, customer?.phone, form.dob, form.gender].filter(Boolean).length;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Avatar + completion */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid rgba(139,94,60,0.1)', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 2px 12px rgba(139,94,60,0.06)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${PRIMARY}, hsl(4,60%,30%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 4px 16px rgba(181,58,46,0.3)' }}>
          {customer?.name?.charAt(0)?.toUpperCase() || '🥒'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1a0f08' }}>{customer?.name || 'Your Name'}</div>
          <div style={{ fontSize: 12, color: '#8b6344', marginTop: 2 }}>📞 {customer?.phone}</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: '#8b6344', fontWeight: 600 }}>Profile Completion</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: PRIMARY }}>{profilePct * 20}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(139,94,60,0.12)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div animate={{ width: `${profilePct * 20}%` }} transition={{ duration: 0.6 }}
                style={{ height: '100%', background: PRIMARY, borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid rgba(139,94,60,0.1)', boxShadow: '0 2px 12px rgba(139,94,60,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a0f08', marginBottom: 20 }}>Personal Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} icon={<User size={15} />} placeholder="Your full name" />
          <Field label="Phone Number" value={customer?.phone || ''} readOnly icon={<Phone size={15} />} />
          <Field label="Email Address" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" icon={<Mail size={15} />} placeholder="your@email.com" />
          <Field label="Date of Birth" value={form.dob} onChange={v => setForm(f => ({ ...f, dob: v }))} type="date" icon={<Calendar size={15} />} />
          <SelectField label="Gender" value={form.gender} onChange={v => setForm(f => ({ ...f, gender: v }))}
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }, { value: 'prefer_not', label: 'Prefer not to say' }]} />
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} color="#dc2626" />
            <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
          </div>
        )}
        {saved && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={14} color="#22c55e" />
            <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>Profile saved successfully!</span>
          </motion.div>
        )}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={saveProfile} disabled={saving}
          style={{ width: '100%', marginTop: 18, padding: '13px', borderRadius: 12, border: 'none', background: saving ? 'rgba(181,58,46,0.4)' : `linear-gradient(135deg, ${PRIMARY}, hsl(4,60%,34%))`, color: '#fff9f0', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: saving ? 'none' : '0 4px 16px rgba(181,58,46,0.3)' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </motion.button>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid rgba(139,94,60,0.1)', boxShadow: '0 2px 12px rgba(139,94,60,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a0f08', marginBottom: 20 }}>Change Password</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Current Password" value={pwdForm.current} onChange={v => setPwdForm(f => ({ ...f, current: v }))} type="password" icon={<Lock size={15} />} placeholder="Current password" />
          <Field label="New Password" value={pwdForm.new} onChange={v => setPwdForm(f => ({ ...f, new: v }))} type="password" icon={<Lock size={15} />} placeholder="Min. 6 characters" />
          <Field label="Confirm New Password" value={pwdForm.confirm} onChange={v => setPwdForm(f => ({ ...f, confirm: v }))} type="password" icon={<Lock size={15} />} placeholder="Re-enter new password" />
        </div>
        {pwdMsg && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: pwdMsg.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(220,38,38,0.08)', border: `1px solid ${pwdMsg.startsWith('✅') ? 'rgba(34,197,94,0.25)' : 'rgba(220,38,38,0.2)'}` }}>
            <span style={{ fontSize: 13, color: pwdMsg.startsWith('✅') ? '#15803d' : '#dc2626', fontWeight: 600 }}>{pwdMsg}</span>
          </div>
        )}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={changePassword} disabled={pwdSaving || !pwdForm.current || !pwdForm.new}
          style={{ width: '100%', marginTop: 18, padding: '13px', borderRadius: 12, border: 'none', background: pwdSaving ? 'rgba(139,94,60,0.3)' : 'rgba(139,94,60,0.12)', color: '#5c3d26', fontWeight: 700, fontSize: 15, cursor: pwdSaving ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif' }}>
          {pwdSaving ? 'Updating…' : 'Update Password'}
        </motion.button>
      </motion.div>
    </div>
  );
}
