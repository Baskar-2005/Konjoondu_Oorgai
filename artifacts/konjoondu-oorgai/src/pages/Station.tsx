import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Check, X, RefreshCw, Package, Truck, CheckCircle2, AlertCircle, LogOut, BarChart2, Clock, TrendingUp, Award } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

type StationType = 'packing' | 'shipping' | 'delivery';

interface StationInfo {
  station: StationType;
  label: string;
  targetStatus: string;
}

interface ScanResult {
  orderId: string;
  success: boolean;
  message: string;
  timestamp: Date;
}

const STATION_STYLE: Record<StationType, { color: string; bg: string; light: string; icon: typeof Package }> = {
  packing:  { color: '#2d6a4f', bg: '#d1fae5', light: '#f0fdf4', icon: Package },
  shipping: { color: '#6366f1', bg: '#e0e7ff', light: '#f5f3ff', icon: Truck },
  delivery: { color: '#16a34a', bg: '#dcfce7', light: '#f0fdf4', icon: CheckCircle2 },
};

function extractOrderId(raw: string): string {
  let id = raw.trim();
  try {
    const url = new URL(id);
    const match = url.pathname.match(/\/track\/([^/?#]+)/);
    if (match) return match[1];
  } catch { /* not a URL */ }
  return id.replace(/^KO-ORDER:/, '');
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function lsKey(station: string) { return `ko_shift_${station}_${todayKey()}`; }

function loadDayScans(station: string): ScanResult[] {
  try {
    const raw = localStorage.getItem(lsKey(station));
    if (!raw) return [];
    const arr = JSON.parse(raw) as Array<Omit<ScanResult,'timestamp'> & { timestamp: string }>;
    return arr.map(r => ({ ...r, timestamp: new Date(r.timestamp) }));
  } catch { return []; }
}

function saveDayScans(station: string, scans: ScanResult[]) {
  try {
    localStorage.setItem(lsKey(station), JSON.stringify(scans));
  } catch { /* storage full — silently skip */ }
}

// ---------- Shift Summary Panel ----------

function ShiftSummaryPanel({
  stationInfo, scans, color, bg, onClose,
}: {
  stationInfo: StationInfo;
  scans: ScanResult[];
  color: string;
  bg: string;
  onClose: () => void;
}) {
  const success = scans.filter(s => s.success).length;
  const failed  = scans.filter(s => !s.success).length;
  const rate    = scans.length ? Math.round((success / scans.length) * 100) : 0;

  // Build hourly buckets 0-23
  const hourBuckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    success: scans.filter(s => s.success && s.timestamp.getHours() === h).length,
    failed:  scans.filter(s => !s.success && s.timestamp.getHours() === h).length,
  })).filter(b => b.success + b.failed > 0);

  const maxBucket = Math.max(...hourBuckets.map(b => b.success + b.failed), 1);

  const dateLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 520,
        background: '#fff', boxShadow: '-8px 0 60px rgba(0,0,0,0.18)',
        zIndex: 200, display: 'flex', flexDirection: 'column', fontFamily: 'Poppins, sans-serif',
        overflowY: 'auto',
      }}>
      {/* Header */}
      <div style={{ background: color, padding: '20px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart2 size={22} color="#fff" />
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Shift Summary</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '7px 14px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
            Close ✕
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>{stationInfo.label}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{dateLabel}</p>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Scanned', value: scans.length, icon: Scan, c: color, b: bg },
            { label: 'Successful',    value: success,       icon: Check, c: '#16a34a', b: '#dcfce7' },
            { label: 'Failed',        value: failed,        icon: X,     c: '#dc2626', b: '#fee2e2' },
            { label: 'Success Rate',  value: `${rate}%`,    icon: TrendingUp, c: '#7c3aed', b: '#ede9fe' },
          ].map(s => (
            <div key={s.label} style={{ borderRadius: 16, padding: '16px 18px', background: s.b, border: `1.5px solid ${s.c}22`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={16} color={s.c} strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 900, color: s.c, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: s.c, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3, opacity: 0.8 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Hourly breakdown */}
        {hourBuckets.length > 0 && (
          <div style={{ borderRadius: 16, padding: '18px 20px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Clock size={14} color="#6b7c5a" />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hourly Breakdown</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hourBuckets.map(b => {
                const total = b.success + b.failed;
                const pct = Math.round((total / maxBucket) * 100);
                const label = `${String(b.hour).padStart(2,'0')}:00–${String(b.hour+1).padStart(2,'0')}:00`;
                return (
                  <div key={b.hour} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6b7c5a', width: 90, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 22, borderRadius: 8, background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color, borderRadius: 8, transition: 'width 0.5s ease' }} />
                      {b.failed > 0 && (
                        <div style={{ position: 'absolute', left: `${Math.round((b.success / maxBucket) * 100)}%`, top: 0, bottom: 0, width: `${Math.round((b.failed / maxBucket) * 100)}%`, background: '#dc2626', borderRadius: '0 8px 8px 0' }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>✓{b.success}</span>
                      {b.failed > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>✗{b.failed}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Achievement badge */}
        {scans.length >= 10 && (
          <div style={{ borderRadius: 14, padding: '14px 18px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1.5px solid #f59e0b33', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Award size={22} color="#d97706" />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                {rate === 100 ? '🎯 Perfect shift! Zero errors.' : rate >= 90 ? '⭐ Great job! Above 90% accuracy.' : `💪 ${scans.length} orders processed today.`}
              </p>
              <p style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>Keep it up!</p>
            </div>
          </div>
        )}

        {/* Full scan log */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Full Scan Log ({scans.length})
          </p>
          {scans.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No scans yet today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...scans].reverse().map((r, i) => (
                <div key={i} style={{
                  borderRadius: 12, padding: '11px 14px',
                  background: r.success ? '#f0fdf4' : '#fff1f2',
                  border: `1px solid ${r.success ? '#bbf7d0' : '#fecdd3'}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: r.success ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {r.success ? <Check size={12} color="#fff" strokeWidth={3} /> : <X size={12} color="#fff" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: r.success ? '#166534' : '#991b1b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.message}</p>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9ca3af', marginTop: 2 }}>{r.orderId}</p>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9ca3af', flexShrink: 0 }}>
                    {r.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (token: string, info: StationInfo) => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/station/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: input }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(input, { station: data.station, label: data.label, targetStatus: data.targetStatus });
      } else {
        setError(data.message || 'Invalid station token.');
      }
    } catch {
      setError('Cannot reach server. Check connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2318 0%, #1a3a2a 50%, #2d4a1e 100%)',
      fontFamily: 'Poppins, sans-serif', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(45,106,79,0.06)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 400, borderRadius: 28,
          background: 'rgba(255,253,250,0.97)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          padding: '40px 36px',
        }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 18px',
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            }}>
            <Scan size={30} color="#fff" />
          </motion.div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f2318', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Station Login
          </h1>
          <p style={{ fontSize: 13, color: '#6b7c5a', fontWeight: 500 }}>Konjoondu Oorgai · Scan Station</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7c5a', display: 'block', marginBottom: 8 }}>
              Station Token
            </label>
            <input
              type="password"
              placeholder="Enter your station token"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus required
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 14, fontSize: 14,
                border: `2px solid ${error ? '#fca5a5' : 'rgba(99,102,241,0.2)'}`,
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                color: '#0f2318', background: '#fafaf8', transition: 'border-color 0.2s',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = '#6366f1'; }}
              onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(99,102,241,0.2)'; }}
            />
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 12, color: '#dc2626', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertCircle size={12} /> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            style={{
              padding: '14px', borderRadius: 14, border: 'none',
              background: loading ? 'rgba(99,102,241,0.6)' : 'linear-gradient(135deg, #6366f1, #4338ca)',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
              transition: 'all 0.2s', opacity: !input.trim() ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {loading ? (
              <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Checking…</>
            ) : (
              <>Sign In to Station</>
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(99,102,241,0.05)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.12)' }}>
          <p style={{ fontSize: 11, color: '#6b7c5a' }}>
            Packing · Shipping · Delivery stations each have a unique token.
          </p>
          <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>API: {API_BASE}</p>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

interface LiveStats {
  waitingCount: number;
  doneCount: number;
  todayCount: number;
  lastUpdated: Date | null;
}

export default function StationPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('ko_station_token') || '');
  const [stationInfo, setStationInfo] = useState<StationInfo | null>(() => {
    try {
      const saved = sessionStorage.getItem('ko_station_info');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [scanInput, setScanInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState({ scanned: 0, success: 0, failed: 0 });
  const [liveStats, setLiveStats] = useState<LiveStats>({ waitingCount: 0, doneCount: 0, todayCount: 0, lastUpdated: null });
  const [livePulse, setLivePulse] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [allDayScans, setAllDayScans] = useState<ScanResult[]>(() => {
    try {
      const saved = sessionStorage.getItem('ko_station_info');
      if (!saved) return [];
      const info: StationInfo = JSON.parse(saved);
      return loadDayScans(info.station);
    } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (stationInfo && inputRef.current) inputRef.current.focus();
  }, [stationInfo]);

  useEffect(() => {
    if (!stationInfo || !token) return;

    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE}/station/stats`, {
          headers: { 'x-station-token': token },
        });
        const data = await res.json();
        if (data.success) {
          setLiveStats(prev => {
            const changed = prev.waitingCount !== data.waitingCount || prev.doneCount !== data.doneCount;
            if (changed) setLivePulse(true);
            setTimeout(() => setLivePulse(false), 600);
            return { waitingCount: data.waitingCount, doneCount: data.doneCount, todayCount: data.todayCount, lastUpdated: new Date() };
          });
        }
      } catch { /* silent — don't disrupt scanning */ }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [stationInfo, token]);

  function playBeep(success: boolean) {
    try {
      const ctx = audioCtx.current || new AudioContext();
      audioCtx.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = success ? 880 : 300;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch { /* silent */ }
  }

  function handleLogin(tok: string, info: StationInfo) {
    sessionStorage.setItem('ko_station_token', tok);
    sessionStorage.setItem('ko_station_info', JSON.stringify(info));
    setToken(tok);
    setStationInfo(info);
    const dayScans = loadDayScans(info.station);
    setAllDayScans(dayScans);
    const s = dayScans.filter(r => r.success).length;
    const f = dayScans.filter(r => !r.success).length;
    setStats({ scanned: dayScans.length, success: s, failed: f });
  }

  function logout() {
    sessionStorage.removeItem('ko_station_token');
    sessionStorage.removeItem('ko_station_info');
    setToken('');
    setStationInfo(null);
    setResults([]);
    setStats({ scanned: 0, success: 0, failed: 0 });
  }

  async function handleScan(raw: string) {
    if (!stationInfo || processing) return;
    const orderId = extractOrderId(raw);
    if (!orderId) return;

    setProcessing(true);
    setScanInput('');
    const timestamp = new Date();

    try {
      const [orderRes] = await Promise.all([
        fetch(`${API_BASE}/orders/${orderId}`),
      ]);
      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.order) {
        setResults(prev => [{ orderId, success: false, message: `Order "${orderId}" not found`, timestamp }, ...prev.slice(0, 29)]);
        setStats(p => ({ ...p, scanned: p.scanned + 1, failed: p.failed + 1 }));
        playBeep(false);
        return;
      }

      const order = orderData.order;

      const updateRes = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-station-token': token },
        body: JSON.stringify({ status: stationInfo.targetStatus }),
      });
      const updateData = await updateRes.json();

      if (updateData.success) {
        const msg = `✓ ${order.customer.name} — marked as ${stationInfo.targetStatus}`;
        const entry: ScanResult = { orderId, success: true, message: msg, timestamp };
        setResults(prev => [entry, ...prev.slice(0, 29)]);
        setStats(p => ({ ...p, scanned: p.scanned + 1, success: p.success + 1 }));
        setAllDayScans(prev => { const next = [...prev, entry]; saveDayScans(stationInfo.station, next); return next; });
        playBeep(true);
      } else {
        const entry: ScanResult = { orderId, success: false, message: updateData.message || 'Update failed', timestamp };
        setResults(prev => [entry, ...prev.slice(0, 29)]);
        setStats(p => ({ ...p, scanned: p.scanned + 1, failed: p.failed + 1 }));
        setAllDayScans(prev => { const next = [...prev, entry]; saveDayScans(stationInfo.station, next); return next; });
        playBeep(false);
      }
    } catch {
      const entry: ScanResult = { orderId, success: false, message: 'Network error — check connection', timestamp };
      setResults(prev => [entry, ...prev.slice(0, 29)]);
      setStats(p => ({ ...p, scanned: p.scanned + 1, failed: p.failed + 1 }));
      setAllDayScans(prev => { const next = [...prev, entry]; saveDayScans(stationInfo.station, next); return next; });
      playBeep(false);
    } finally {
      setProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  if (!stationInfo) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const style = STATION_STYLE[stationInfo.station] ?? STATION_STYLE.shipping;
  const Icon = style.icon;

  return (
    <div style={{ minHeight: '100vh', background: style.light, fontFamily: 'Poppins, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: style.color, padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: `0 4px 20px ${style.color}40`, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{stationInfo.label}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
              {liveStats.lastUpdated
                ? `Updated ${liveStats.lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Loading live data…'}
            </p>
          </div>
        </div>

        {/* Live stat badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
          {[
            { label: 'Waiting', value: liveStats.waitingCount, bg: 'rgba(255,255,255,0.18)', border: 'rgba(255,255,255,0.3)', pulse: livePulse && liveStats.waitingCount > 0 },
            { label: 'Done Today', value: liveStats.todayCount, bg: 'rgba(255,255,255,0.28)', border: 'rgba(255,255,255,0.45)', pulse: livePulse && liveStats.todayCount > 0 },
            { label: 'Total Done', value: liveStats.doneCount, bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.2)', pulse: false },
          ].map(s => (
            <motion.div key={s.label}
              animate={s.pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 14px', borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, minWidth: 64 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{s.label}</span>
            </motion.div>
          ))}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: liveStats.lastUpdated ? '#4ade80' : '#fbbf24', boxShadow: liveStats.lastUpdated ? '0 0 6px #4ade80' : 'none', flexShrink: 0, animation: 'livePulse 2s infinite' }} title="Live" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowSummary(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', position: 'relative' }}>
            <BarChart2 size={13} />
            Shift Summary
            {allDayScans.length > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: '#fbbf24', color: '#7c2d12', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {allDayScans.length > 99 ? '99+' : allDayScans.length}
              </span>
            )}
          </button>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Scanned', value: stats.scanned, color: style.color, bg: style.bg },
            { label: 'Success', value: stats.success, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Failed',  value: stats.failed,  color: '#dc2626', bg: '#fee2e2' },
          ].map(s => (
            <motion.div key={s.label}
              animate={{ scale: s.value > 0 ? [1, 1.04, 1] : 1 }}
              transition={{ duration: 0.2 }}
              style={{ borderRadius: 18, padding: '18px 16px', background: s.bg, border: `1.5px solid ${s.color}25`, textAlign: 'center', boxShadow: `0 4px 16px ${s.color}10` }}>
              <p style={{ fontSize: 38, fontWeight: 900, color: s.color, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Scanner input */}
        <div style={{ borderRadius: 24, background: '#fff', border: `2.5px solid ${style.color}`, padding: 28, marginBottom: 20, boxShadow: `0 8px 40px ${style.color}18` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${style.color}20` }}>
              {processing
                ? <RefreshCw size={24} color={style.color} style={{ animation: 'spin 0.7s linear infinite' }} />
                : <Scan size={24} color={style.color} />
              }
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#0f2318', marginBottom: 3 }}>Scan Order QR Code</p>
              <p style={{ fontSize: 12, color: '#6b7c5a', lineHeight: 1.5 }}>
                Point your scanner at the shipping label QR, or type the Order ID manually
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              ref={inputRef}
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan(scanInput)}
              placeholder={`Scan QR or type Order ID (e.g. KO-XXXXXXXX)…`}
              disabled={processing}
              autoFocus
              style={{
                flex: 1, padding: '14px 18px', borderRadius: 14,
                border: `2px solid ${style.color}35`, fontSize: 14,
                outline: 'none', fontFamily: 'monospace',
                background: style.bg + '55', color: '#0f2318',
                letterSpacing: '0.04em',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = style.color; }}
              onBlur={e => { e.target.style.borderColor = style.color + '35'; }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleScan(scanInput)}
              disabled={!scanInput.trim() || processing}
              style={{
                padding: '14px 24px', borderRadius: 14, border: 'none',
                cursor: scanInput.trim() && !processing ? 'pointer' : 'not-allowed',
                background: style.color, color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', opacity: !scanInput.trim() || processing ? 0.5 : 1,
                boxShadow: `0 4px 16px ${style.color}40`,
              }}>
              {processing ? 'Processing…' : 'Scan'}
            </motion.button>
          </div>

          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
            Supports full tracking URLs, <code>KO-ORDER:</code> prefix, or plain Order IDs
          </p>
        </div>

        {/* Results feed */}
        {results.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scan History</p>
              <button onClick={() => { setResults([]); setStats({ scanned: 0, success: 0, failed: 0 }); }}
                style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence initial={false}>
                {results.map(r => (
                  <motion.div key={`${r.orderId}-${r.timestamp.getTime()}`}
                    initial={{ opacity: 0, x: -24, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      borderRadius: 14, padding: '14px 18px',
                      background: r.success ? '#d1fae5' : '#fee2e2',
                      border: `1.5px solid ${r.success ? 'rgba(45,106,79,0.2)' : 'rgba(220,38,38,0.2)'}`,
                      overflow: 'hidden',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: r.success ? '#2d6a4f' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {r.success ? <Check size={16} color="#fff" strokeWidth={3} /> : <X size={16} color="#fff" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: r.success ? '#166534' : '#991b1b', marginBottom: 3 }}>{r.message}</p>
                        <p style={{ fontSize: 11, fontFamily: 'monospace', color: r.success ? '#15803d' : '#b91c1c', opacity: 0.75 }}>{r.orderId}</p>
                      </div>
                      <span style={{ fontSize: 10, color: '#6b7c5a', flexShrink: 0, fontFamily: 'monospace' }}>
                        {r.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 20, border: `1.5px dashed ${style.color}30` }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Scan size={28} color={style.color} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: style.color, marginBottom: 6 }}>Ready to Scan</p>
            <p style={{ fontSize: 13, color: '#6b7c5a' }}>Scan a QR code or type an Order ID above to mark it as <strong>{stationInfo.targetStatus}</strong></p>
          </div>
        )}
      </div>

      {/* Shift Summary panel + backdrop */}
      <AnimatePresence>
        {showSummary && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSummary(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 199 }}
            />
            <ShiftSummaryPanel
              key="panel"
              stationInfo={stationInfo}
              scans={allDayScans}
              color={style.color}
              bg={style.bg}
              onClose={() => setShowSummary(false)}
            />
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
