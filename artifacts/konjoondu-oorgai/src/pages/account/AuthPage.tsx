import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';

const PRIMARY = 'hsl(4,60%,44%)';
const BG = 'linear-gradient(135deg, #3d1a0f 0%, #5c2518 50%, #3d1a0f 100%)';

type Mode = 'login' | 'register' | 'forgot';
type Step = 'phone' | 'otp' | 'password' | 'done';

interface InputFieldProps {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon?: React.ReactNode; right?: React.ReactNode;
  error?: string;
}
function InputField({ label, type, value, onChange, placeholder, icon, right, error }: InputFieldProps) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b6344', display: 'block', marginBottom: 7 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>{icon}</span>}
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: icon ? '12px 14px 12px 40px' : '12px 14px',
            borderRadius: 12, fontSize: 14, fontFamily: 'Poppins,sans-serif',
            border: `1.5px solid ${error ? '#fca5a5' : 'rgba(139,94,60,0.2)'}`,
            outline: 'none', boxSizing: 'border-box', color: '#1a0f08',
            background: '#faf8f5', transition: 'border-color 0.2s',
            paddingRight: right ? 44 : 14,
          }}
          onFocus={e => { e.target.style.borderColor = PRIMARY; }}
          onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : 'rgba(139,94,60,0.2)'; }}
        />
        {right && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{right}</span>}
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 12, color: '#dc2626', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} /> {error}
        </motion.p>
      )}
    </div>
  );
}

function PrimaryBtn({ onClick, disabled, loading, children }: { onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }} whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick} disabled={disabled || loading}
      style={{
        width: '100%', padding: '13px', borderRadius: 12, border: 'none',
        background: disabled || loading ? 'rgba(181,58,46,0.4)' : `linear-gradient(135deg, ${PRIMARY}, hsl(4,60%,34%))`,
        color: '#fff9f0', fontWeight: 700, fontSize: 15, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Poppins,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: disabled || loading ? 'none' : '0 6px 20px rgba(181,58,46,0.3)',
      }}>
      {loading ? <><span className="spin-border" />Processing…</> : children}
    </motion.button>
  );
}

export default function AuthPage({ onSuccess }: { onSuccess?: () => void }) {
  const { login, apiBase } = useCustomer();
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('phone');

  // Shared fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setPhone(''); setPassword(''); setOtp(''); setDevOtp(''); setNewPassword(''); setConfirmPassword('');
    setError(''); setStep('phone'); setLoading(false);
  }

  function switchMode(m: Mode) { reset(); setMode(m); }

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) { setError('Phone and password are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();
      if (data.success) { login(data.token, data.customer); onSuccess?.(); }
      else setError(data.message || 'Login failed.');
    } catch { setError('Network error. Make sure the server is running.'); }
    finally { setLoading(false); }
  }

  // Single-step register: send-otp then immediately register if OTP comes back (dev).
  // Falls back to manual OTP entry if the server doesn't return it (production).
  async function handleRegisterSubmit() {
    if (!phone.trim()) { setError('Phone number is required.'); return; }
    if (!newPassword.trim()) { setError('Password is required.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      // Step 1: request OTP
      const otpRes = await fetch(`${apiBase}/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const otpData = await otpRes.json();
      if (!otpData.success) { setError(otpData.message || 'Failed to send OTP.'); return; }

      const returnedOtp: string | undefined = otpData.otp;

      if (returnedOtp) {
        // Dev mode: OTP in response — register immediately, no manual entry needed
        const regRes = await fetch(`${apiBase}/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phone.trim(), password: newPassword, otp: returnedOtp }),
        });
        const regData = await regRes.json();
        if (regData.success) { login(regData.token, regData.customer); onSuccess?.(); }
        else setError(regData.message || 'Registration failed.');
      } else {
        // Production: OTP sent via SMS, show manual entry step
        setDevOtp('');
        setStep('otp');
      }
    } catch { setError('Network error. Make sure the server is running.'); }
    finally { setLoading(false); }
  }

  async function handleRegister() {
    // Called only in production fallback (manual OTP entry step)
    if (!otp.trim() || !newPassword.trim()) { setError('OTP and password are required.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password: newPassword, otp: otp.trim() }),
      });
      const data = await res.json();
      if (data.success) { login(data.token, data.customer); onSuccess?.(); }
      else setError(data.message || 'Registration failed.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  async function handleForgotSendOtp() {
    if (!phone.trim()) { setError('Phone number is required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiBase}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (data.success) { setDevOtp(data.otp || ''); setStep('otp'); }
      else setError(data.message || 'Failed.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  async function handleResetPassword() {
    if (!otp.trim() || !newPassword.trim()) { setError('OTP and new password required.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim(), newPassword }),
      });
      const data = await res.json();
      if (data.success) { login(data.token, data.customer); onSuccess?.(); }
      else setError(data.message || 'Reset failed.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '15%', left: '8%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(181,58,46,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(139,94,60,0.06)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420, borderRadius: 28, background: 'rgba(255,252,248,0.98)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', padding: '40px 36px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 16px', background: `linear-gradient(135deg, ${PRIMARY}, hsl(4,60%,34%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 8px 24px rgba(181,58,46,0.35)' }}>
            🥒
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a0f08', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h1>
          <p style={{ fontSize: 13, color: '#8b6344' }}>
            {mode === 'login' ? 'Sign in to your Konjoondu Oorgai account' : mode === 'register' ? 'Join us for a premium pickle experience' : 'Recover access to your account'}
          </p>
        </div>

        {/* Mode tabs (login/register) */}
        {mode !== 'forgot' && step === 'phone' && (
          <div style={{ display: 'flex', background: 'rgba(181,58,46,0.06)', borderRadius: 12, padding: 3, marginBottom: 24 }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                  background: mode === m ? '#fff' : 'transparent', color: mode === m ? PRIMARY : '#8b6344',
                  boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={14} color="#dc2626" />
              <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev OTP hint */}
        <AnimatePresence>
          {devOtp && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>📱 OTP (dev mode): <strong style={{ fontSize: 16, letterSpacing: 4 }}>{devOtp}</strong></p>
              <p style={{ fontSize: 11, color: '#15803d', opacity: 0.8 }}>In production, this will be sent via SMS.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" icon={<Phone size={15} />} />
            <InputField label="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Enter your password"
              icon={<Lock size={15} />}
              right={<button onClick={() => setShowPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', display: 'flex' }}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
            />
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <button onClick={() => switchMode('forgot')} style={{ fontSize: 12, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>
            <PrimaryBtn onClick={handleLogin} loading={loading} disabled={!phone.trim() || !password.trim()}>
              Sign In <ArrowRight size={16} />
            </PrimaryBtn>
          </div>
        )}

        {/* REGISTER FORM — single step; OTP is handled automatically in dev */}
        {mode === 'register' && step === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" icon={<Phone size={15} />} />
            <InputField label="Password" type={showPwd ? 'text' : 'password'} value={newPassword} onChange={setNewPassword} placeholder="Min. 6 characters"
              icon={<Lock size={15} />}
              right={<button onClick={() => setShowPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', display: 'flex' }}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
            />
            <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" icon={<Lock size={15} />} />
            <PrimaryBtn onClick={handleRegisterSubmit} loading={loading} disabled={!phone.trim() || !newPassword.trim() || !confirmPassword.trim()}>
              Create Account <ArrowRight size={16} />
            </PrimaryBtn>
          </div>
        )}

        {/* Production fallback: manual OTP entry (shown only when server doesn't return OTP) */}
        {mode === 'register' && step === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>📱 OTP sent to <strong>{phone}</strong></p>
              <p style={{ fontSize: 11, color: '#1d4ed8', opacity: 0.8, marginTop: 2 }}>Check your SMS and enter the code below.</p>
            </div>
            <InputField label="Enter OTP" type="text" value={otp} onChange={setOtp} placeholder="6-digit code" />
            <PrimaryBtn onClick={handleRegister} loading={loading} disabled={!otp.trim()}>
              Verify & Create Account <ArrowRight size={16} />
            </PrimaryBtn>
            <button onClick={() => { setStep('phone'); setOtp(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', fontSize: 13, fontFamily: 'Poppins,sans-serif', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              <RefreshCw size={13} /> Back / Resend OTP
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && step === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField label="Registered Phone" type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" icon={<Phone size={15} />} />
            <PrimaryBtn onClick={handleForgotSendOtp} loading={loading} disabled={!phone.trim()}>
              Send Reset OTP <ArrowRight size={16} />
            </PrimaryBtn>
            <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', fontSize: 13, fontFamily: 'Poppins,sans-serif' }}>
              ← Back to Sign In
            </button>
          </div>
        )}

        {mode === 'forgot' && step === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField label="OTP" type="text" value={otp} onChange={setOtp} placeholder="6-digit code" />
            <InputField label="New Password" type={showPwd ? 'text' : 'password'} value={newPassword} onChange={setNewPassword} placeholder="Min. 6 characters"
              icon={<Lock size={15} />}
              right={<button onClick={() => setShowPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', display: 'flex' }}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
            />
            <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" icon={<Lock size={15} />} />
            <PrimaryBtn onClick={handleResetPassword} loading={loading} disabled={!otp.trim() || !newPassword.trim()}>
              Reset Password <CheckCircle2 size={16} />
            </PrimaryBtn>
          </div>
        )}
      </motion.div>

      <style>{`
        .spin-border { display: inline-block; width: 15px; height: 15px; border: 2px solid rgba(255,249,240,0.3); border-top-color: #fff9f0; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
