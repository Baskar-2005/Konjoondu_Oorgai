import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { signInWithPhoneNumber, RecaptchaVerifier, GoogleAuthProvider, signInWithPopup, type ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useCustomer } from '@/context/CustomerContext';

const PRIMARY = 'hsl(4,60%,44%)';
const BG = 'linear-gradient(135deg, #3d1a0f 0%, #5c2518 50%, #3d1a0f 100%)';

type Mode = 'login' | 'register' | 'forgot';
type Step = 'phone' | 'otp' | 'done';

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

function GoogleBtn({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(139,94,60,0.15)' }} />
        <span style={{ fontSize: 11, color: '#8b6344', fontWeight: 600, whiteSpace: 'nowrap' }}>OR CONTINUE WITH</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(139,94,60,0.15)' }} />
      </div>
      <motion.button
        whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
        onClick={onClick} disabled={loading}
        style={{
          width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid rgba(139,94,60,0.2)',
          background: '#fff', color: '#3c3c3c', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Poppins,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: loading ? 0.6 : 1,
        }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </motion.button>
    </>
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
      {loading ? <><span className="spin-border" />Sending OTP…</> : children}
    </motion.button>
  );
}

/** Normalise phone to E.164 (+91XXXXXXXXXX). Adds +91 if no country code. */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  return '+91' + digits;
}

export default function AuthPage({ onSuccess }: { onSuccess?: () => void }) {
  const { login, apiBase } = useCustomer();
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('phone');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);

  // Store verifier on window so it survives Vite HMR cycles.
  // When HMR unmounts+remounts the component, the cleanup would clear the
  // verifier and its pending async callbacks would crash on a null DOM element.
  // Keeping it on window means the same verifier instance persists across reloads.
  useEffect(() => {
    const w = window as Window & { recaptchaVerifier?: RecaptchaVerifier };
    if (!w.recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
        size: 'invisible',
      });
      w.recaptchaVerifier = verifier;
      verifier.render().catch(() => {}); // pre-render silently
    }
    // No cleanup — intentionally let it persist across HMR remounts.
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function reset() {
    confirmationRef.current = null;
    setPhone(''); setPassword(''); setOtp(''); setNewPassword(''); setConfirmPassword('');
    setError(''); setStep('phone'); setLoading(false); setResendCooldown(0);
  }

  function switchMode(m: Mode) { reset(); setMode(m); }

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  async function handleLogin() {
    if (!phone.trim() || !password.trim()) { setError('Phone and password are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalisePhone(phone), password }),
      });
      const data = await res.json();
      if (data.success) { login(data.token, data.customer); onSuccess?.(); }
      else setError(data.message || 'Login failed.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  // ── SEND OTP (shared by register + forgot) ─────────────────────────────────
  async function sendOtp(forMode: 'register' | 'forgot'): Promise<boolean> {
    const e164 = normalisePhone(phone);

    // For forgot-password, first verify the account exists
    if (forMode === 'forgot') {
      try {
        const check = await fetch(`${apiBase}/auth/forgot-password`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: e164 }),
        });
        const checkData = await check.json();
        if (!checkData.success) { setError(checkData.message || 'No account found.'); return false; }
      } catch { setError('Network error. Please try again.'); return false; }
    }

    const w = window as Window & { recaptchaVerifier?: RecaptchaVerifier };
    const verifier = w.recaptchaVerifier;
    if (!verifier) { setError('reCAPTCHA not ready. Please refresh and try again.'); return false; }

    try {
      const result = await signInWithPhoneNumber(firebaseAuth, e164, verifier);
      confirmationRef.current = result;
      setResendCooldown(30);
      return true;
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? '';
      if (msg.includes('invalid-phone-number')) {
        setError('Invalid phone number. Include country code, e.g. +91 98765 43210');
      } else if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (msg.includes('auth/quota-exceeded')) {
        setError('SMS quota exceeded for today. Please try again tomorrow.');
      } else {
        setError('Failed to send OTP. ' + msg);
      }
      return false;
    }
  }

  // ── REGISTER: step 1 — send OTP ───────────────────────────────────────────
  async function handleRegisterSendOtp() {
    if (!phone.trim()) { setError('Phone number is required.'); return; }
    if (!newPassword.trim()) { setError('Password is required.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    const ok = await sendOtp('register');
    setLoading(false);
    if (ok) setStep('otp');
  }

  // ── REGISTER: step 2 — verify OTP → register ──────────────────────────────
  async function handleRegisterVerify() {
    if (!otp.trim()) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true); setError('');
    try {
      const cred = await confirmationRef.current!.confirm(otp.trim());
      const firebaseToken = await cred.user.getIdToken();
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken, password: newPassword }),
      });
      const data = await res.json();
      if (data.success) { login(data.token, data.customer); onSuccess?.(); }
      else setError(data.message || 'Registration failed.');
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? '';
      if (msg.includes('invalid-verification-code')) setError('Incorrect OTP. Please check and try again.');
      else if (msg.includes('code-expired')) setError('OTP expired. Please resend.');
      else setError('Verification failed. ' + msg);
    } finally { setLoading(false); }
  }

  // ── FORGOT: step 1 — send OTP ─────────────────────────────────────────────
  async function handleForgotSendOtp() {
    if (!phone.trim()) { setError('Phone number is required.'); return; }
    setLoading(true); setError('');
    const ok = await sendOtp('forgot');
    setLoading(false);
    if (ok) setStep('otp');
  }

  // ── FORGOT: step 2 — verify OTP → reset password ─────────────────────────
  async function handleResetPassword() {
    if (!otp.trim()) { setError('Enter the 6-digit OTP.'); return; }
    if (!newPassword.trim()) { setError('New password is required.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const cred = await confirmationRef.current!.confirm(otp.trim());
      const firebaseToken = await cred.user.getIdToken();
      const res = await fetch(`${apiBase}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken, newPassword }),
      });
      const data = await res.json();
      if (data.success) { login(data.token, data.customer); onSuccess?.(); }
      else setError(data.message || 'Reset failed.');
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? '';
      if (msg.includes('invalid-verification-code')) setError('Incorrect OTP. Please check and try again.');
      else if (msg.includes('code-expired')) setError('OTP expired. Please resend.');
      else setError('Verification failed. ' + msg);
    } finally { setLoading(false); }
  }

  // ── GOOGLE SIGN-IN ────────────────────────────────────────────────────────
  async function handleGoogleSignIn() {
    setLoading(true); setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseToken = await result.user.getIdToken();
      const res = await fetch(`${apiBase}/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken }),
      });
      const data = await res.json();
      if (data.success) { login(data.token, data.customer); onSuccess?.(); }
      else setError(data.message || 'Google sign-in failed.');
    } catch (err: unknown) {
      const msg = (err as { code?: string; message?: string }).code ?? '';
      if (msg === 'auth/popup-closed-by-user' || msg === 'auth/cancelled-popup-request') {
        // user dismissed popup — no error needed
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally { setLoading(false); }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setOtp(''); setError('');
    setLoading(true);
    const ok = await sendOtp(mode === 'forgot' ? 'forgot' : 'register');
    setLoading(false);
    if (!ok) setStep('phone');
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
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? (step === 'otp' ? 'Verify Your Number' : 'Create Account') : (step === 'otp' ? 'Enter Reset OTP' : 'Reset Password')}
          </h1>
          <p style={{ fontSize: 13, color: '#8b6344' }}>
            {mode === 'login' ? 'Sign in to your Konjoondu Oorgai account'
              : mode === 'register' ? (step === 'otp' ? `OTP sent to ${normalisePhone(phone)}` : 'Join us for a premium pickle experience')
              : (step === 'otp' ? `OTP sent to ${normalisePhone(phone)}` : 'Recover access to your account')}
          </p>
        </div>

        {/* Mode tabs */}
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

        {/* ── LOGIN ── */}
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
            <GoogleBtn onClick={handleGoogleSignIn} loading={loading} />
          </div>
        )}

        {/* ── REGISTER: step 1 — phone + password ── */}
        {mode === 'register' && step === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" icon={<Phone size={15} />} />
            <InputField label="Password" type={showPwd ? 'text' : 'password'} value={newPassword} onChange={setNewPassword} placeholder="Min. 6 characters"
              icon={<Lock size={15} />}
              right={<button onClick={() => setShowPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', display: 'flex' }}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
            />
            <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" icon={<Lock size={15} />} />
            <PrimaryBtn onClick={handleRegisterSendOtp} loading={loading} disabled={!phone.trim() || !newPassword.trim() || !confirmPassword.trim()}>
              Send OTP <ArrowRight size={16} />
            </PrimaryBtn>
            <GoogleBtn onClick={handleGoogleSignIn} loading={loading} />
          </div>
        )}

        {/* ── REGISTER: step 2 — OTP entry ── */}
        {mode === 'register' && step === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>📱 OTP sent via SMS</p>
              <p style={{ fontSize: 11, color: '#1d4ed8', opacity: 0.8, marginTop: 2 }}>Enter the 6-digit code sent to your number.</p>
            </div>
            <InputField label="Enter OTP" type="text" value={otp} onChange={setOtp} placeholder="6-digit code" />
            <PrimaryBtn onClick={handleRegisterVerify} loading={loading} disabled={otp.trim().length < 6}>
              Verify & Create Account <CheckCircle2 size={16} />
            </PrimaryBtn>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => { setStep('phone'); setOtp(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', fontSize: 13, fontFamily: 'Poppins,sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                ← Change number
              </button>
              <button onClick={handleResendOtp} disabled={resendCooldown > 0 || loading}
                style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', color: resendCooldown > 0 ? '#9ca3af' : PRIMARY, fontSize: 13, fontFamily: 'Poppins,sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={13} /> {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {/* ── FORGOT: step 1 — phone ── */}
        {mode === 'forgot' && step === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InputField label="Registered Phone" type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" icon={<Phone size={15} />} />
            <PrimaryBtn onClick={handleForgotSendOtp} loading={loading} disabled={!phone.trim()}>
              Send Reset OTP <ArrowRight size={16} />
            </PrimaryBtn>
            <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', fontSize: 13, fontFamily: 'Poppins,sans-serif', textAlign: 'center' }}>
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* ── FORGOT: step 2 — OTP + new password ── */}
        {mode === 'forgot' && step === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>📱 Reset OTP sent via SMS</p>
              <p style={{ fontSize: 11, color: '#1d4ed8', opacity: 0.8, marginTop: 2 }}>Enter the code and set your new password.</p>
            </div>
            <InputField label="OTP" type="text" value={otp} onChange={setOtp} placeholder="6-digit code" />
            <InputField label="New Password" type={showPwd ? 'text' : 'password'} value={newPassword} onChange={setNewPassword} placeholder="Min. 6 characters"
              icon={<Lock size={15} />}
              right={<button onClick={() => setShowPwd(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', display: 'flex' }}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
            />
            <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" icon={<Lock size={15} />} />
            <PrimaryBtn onClick={handleResetPassword} loading={loading} disabled={otp.trim().length < 6 || !newPassword.trim()}>
              Reset Password <CheckCircle2 size={16} />
            </PrimaryBtn>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => { setStep('phone'); setOtp(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b6344', fontSize: 13, fontFamily: 'Poppins,sans-serif' }}>
                ← Change number
              </button>
              <button onClick={handleResendOtp} disabled={resendCooldown > 0 || loading}
                style={{ background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', color: resendCooldown > 0 ? '#9ca3af' : PRIMARY, fontSize: 13, fontFamily: 'Poppins,sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={13} /> {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
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
