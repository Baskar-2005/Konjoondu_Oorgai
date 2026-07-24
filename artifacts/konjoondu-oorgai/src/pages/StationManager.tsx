import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, AlertTriangle, RefreshCw, LogOut, BarChart2, Clock, Eye, Bell, BellOff, Minus, Plus, Check } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

interface StationStat {
  key: string;
  label: string;
  targetStatus: string;
  waitingCount: number;
  doneCount: number;
  todayCount: number;
}

interface AlertEntry {
  type: 'alert' | 'cleared';
  station: string;
  label: string;
  count: number;
  threshold: number;
  timestamp: string;
}

const STATION_META: Record<string, { color: string; bg: string; light: string; icon: typeof Package; accent: string }> = {
  packing:  { color: '#2d6a4f', bg: '#d1fae5', light: '#f0fdf4', icon: Package,      accent: '#bbf7d0' },
  shipping: { color: '#6366f1', bg: '#e0e7ff', light: '#f5f3ff', icon: Truck,        accent: '#c7d2fe' },
  delivery: { color: '#16a34a', bg: '#dcfce7', light: '#f0fdf4', icon: CheckCircle2, accent: '#bbf7d0' },
};

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---------- Login Screen ----------
function ManagerLogin({ onLogin }: { onLogin: (secret: string) => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/station/manager/stats`, {
        headers: { 'x-admin-token': input },
      });
      const data = await res.json();
      if (data.success) {
        onLogin(input);
      } else {
        setError('Invalid admin secret.');
      }
    } catch {
      setError('Cannot reach server. Check connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2318 0%, #1a3a2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: '#fafaf8', borderRadius: 28, padding: '48px 40px', maxWidth: 420, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(45,106,79,0.4)' }}>
          <BarChart2 size={26} color="#fff" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f2318', textAlign: 'center', marginBottom: 6 }}>Station Manager</h1>
        <p style={{ fontSize: 13, color: '#6b7c5a', textAlign: 'center', marginBottom: 32 }}>Live supervisor dashboard — all three stations at a glance</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7c5a', display: 'block', marginBottom: 8 }}>Admin Secret</label>
            <input
              type="password"
              placeholder="Enter admin secret"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus required
              style={{ width: '100%', padding: '13px 16px', borderRadius: 14, fontSize: 14, border: `2px solid ${error ? '#fca5a5' : 'rgba(45,106,79,0.2)'}`, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f2318', background: '#fafaf8', transition: 'border-color 0.2s' }}
              onFocus={e => { if (!error) e.target.style.borderColor = '#2d6a4f'; }}
              onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(45,106,79,0.2)'; }}
            />
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</motion.p>
              )}
            </AnimatePresence>
          </div>
          <motion.button type="submit" disabled={loading || !input.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px', borderRadius: 14, border: 'none', background: loading ? 'rgba(45,106,79,0.5)' : 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(45,106,79,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading
              ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Verifying…</>
              : 'Open Dashboard'
            }
          </motion.button>
        </form>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ---------- Station Card ----------
function StationCard({ s, isBottleneck, pulse }: { s: StationStat; isBottleneck: boolean; pulse: boolean }) {
  const meta = STATION_META[s.key] ?? STATION_META.packing;
  const Icon = meta.icon;
  const total = s.waitingCount + s.doneCount;
  const pipelinePct = total > 0 ? Math.round((s.doneCount / total) * 100) : 0;

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        borderRadius: 24, overflow: 'hidden',
        border: isBottleneck ? `2.5px solid ${meta.color}` : '2px solid rgba(0,0,0,0.07)',
        boxShadow: isBottleneck ? `0 8px 40px ${meta.color}30` : '0 4px 20px rgba(0,0,0,0.06)',
        background: '#fff',
        position: 'relative',
      }}>
      {isBottleneck && (
        <div style={{ position: 'absolute', top: 12, right: 12, background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 8, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5, zIndex: 2 }}>
          <AlertTriangle size={11} color="#d97706" />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bottleneck</span>
        </div>
      )}

      {/* Card header */}
      <div style={{ background: meta.color, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{s.label}</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>Marks orders → <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{s.targetStatus}</strong></p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Waiting', value: s.waitingCount, color: s.waitingCount > 0 ? '#d97706' : '#9ca3af', bg: s.waitingCount > 0 ? '#fef3c7' : '#f9fafb' },
            { label: 'Done Today', value: s.todayCount, color: meta.color, bg: meta.bg },
            { label: 'All Time',   value: s.doneCount,  color: '#6b7c5a', bg: '#f3f4f6' },
          ].map(stat => (
            <div key={stat.label} style={{ borderRadius: 14, padding: '12px 10px', background: stat.bg, textAlign: 'center' }}>
              <p style={{ fontSize: 26, fontWeight: 900, color: stat.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
              <p style={{ fontSize: 9, fontWeight: 700, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4, opacity: 0.8 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pipeline progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pipeline completion</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: meta.color }}>{pipelinePct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 6, background: '#f3f4f6', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pipelinePct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${meta.color}90, ${meta.color})` }}
            />
          </div>
          <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 5 }}>
            {s.doneCount} done · {s.waitingCount} queued · {total} total reached
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Main Manager Dashboard ----------
export default function StationManager() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem('ko_manager_secret') || '');
  const [authed, setAuthed]   = useState(false);
  const [stations, setStations] = useState<StationStat[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pulse, setPulse] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  // Threshold config state
  const [threshold, setThreshold] = useState(5);
  const [thresholdInput, setThresholdInput] = useState(5);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Alert log state
  const [alertLog, setAlertLog] = useState<AlertEntry[]>([]);

  function handleLogin(s: string) {
    sessionStorage.setItem('ko_manager_secret', s);
    setSecret(s);
    setAuthed(true);
  }

  function logout() {
    sessionStorage.removeItem('ko_manager_secret');
    setSecret('');
    setAuthed(false);
    setStations([]);
    setAlertLog([]);
  }

  const fetchConfig = useCallback(async (sec: string) => {
    try {
      const res = await fetch(`${API_BASE}/station/manager/config`, { headers: { 'x-admin-token': sec } });
      const data = await res.json();
      if (data.success) { setThreshold(data.threshold); setThresholdInput(data.threshold); }
    } catch { /* silent */ }
  }, []);

  const fetchAlerts = useCallback(async (sec: string) => {
    try {
      const res = await fetch(`${API_BASE}/station/manager/alerts`, { headers: { 'x-admin-token': sec } });
      const data = await res.json();
      if (data.success) setAlertLog(data.alerts);
    } catch { /* silent */ }
  }, []);

  async function saveThreshold() {
    if (thresholdInput === threshold) return;
    setSavingThreshold(true);
    try {
      const res = await fetch(`${API_BASE}/station/manager/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': secret },
        body: JSON.stringify({ threshold: thresholdInput }),
      });
      const data = await res.json();
      if (data.success) {
        setThreshold(data.threshold);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }
    } catch { /* silent */ }
    setSavingThreshold(false);
  }

  async function fetchStats(manual = false) {
    if (!secret) return;
    if (manual) setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/station/manager/stats`, {
        headers: { 'x-admin-token': secret },
      });
      const data = await res.json();
      if (data.success) {
        setStations(prev => {
          const newStations: StationStat[] = data.stations;
          const newPulse: Record<string, boolean> = {};
          newStations.forEach(ns => {
            const old = prev.find(p => p.key === ns.key);
            if (old && (old.waitingCount !== ns.waitingCount || old.doneCount !== ns.doneCount)) {
              newPulse[ns.key] = true;
            }
          });
          if (Object.keys(newPulse).length > 0) {
            setPulse(newPulse);
            setTimeout(() => setPulse({}), 600);
          }
          return newStations;
        });
        setLastUpdated(new Date());
        if (!authed) setAuthed(true);
      } else {
        setAuthed(false);
      }
    } catch { /* silent */ }
    if (manual) setRefreshing(false);
  }

  // Try to auto-login if we have a stored secret
  useEffect(() => {
    if (secret) {
      fetchStats();
      fetchConfig(secret);
      fetchAlerts(secret);
    }
  }, []);

  // Poll stats every 5s, alerts every 30s
  useEffect(() => {
    if (!secret || !authed) return;
    const statsInterval  = setInterval(() => fetchStats(), 5000);
    const alertsInterval = setInterval(() => fetchAlerts(secret), 30000);
    return () => { clearInterval(statsInterval); clearInterval(alertsInterval); };
  }, [secret, authed]);

  if (!authed) {
    return <ManagerLogin onLogin={handleLogin} />;
  }

  const bottleneckKey = stations.reduce((max, s) => s.waitingCount > (stations.find(x => x.key === max)?.waitingCount ?? 0) ? s.key : max, stations[0]?.key ?? '');
  const hasBottleneck = (stations.find(s => s.key === bottleneckKey)?.waitingCount ?? 0) > 0;

  const totalWaiting = stations.reduce((a, s) => a + s.waitingCount, 0);
  const totalToday   = stations.reduce((a, s) => a + s.todayCount, 0);
  const totalDone    = stations.reduce((a, s) => a + s.doneCount, 0);

  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg, #0f2318, #1a3a2a)', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Station Manager</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Konjoondu Oorgai · {todayDate}</p>
          </div>
        </div>

        {/* Global summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { label: 'Queued', value: totalWaiting, warn: totalWaiting > 5 },
            { label: 'Today',  value: totalToday, warn: false },
            { label: 'Total Done', value: totalDone, warn: false },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 14px', borderRadius: 10, background: s.warn ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.1)', border: s.warn ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: s.warn ? '#fbbf24' : '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
              <span style={{ fontSize: 9, color: s.warn ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{s.label}</span>
            </div>
          ))}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: lastUpdated ? '#4ade80' : '#fbbf24', boxShadow: lastUpdated ? '0 0 6px #4ade80' : 'none', marginLeft: 4, animation: 'livePulse 2s infinite' }} title="Live" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => fetchStats(true)} disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: refreshing ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={14} color="#6b7c5a" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7c5a' }}>Live · refreshes every 5 seconds</span>
          </div>
          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={12} color="#9ca3af" />
              <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                Last updated: {fmtTime(lastUpdated)}
              </span>
            </div>
          )}
        </div>

        {/* Bottleneck alert */}
        <AnimatePresence>
          {hasBottleneck && (
            <motion.div
              key="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ borderRadius: 16, padding: '14px 20px', background: '#fef3c7', border: '1.5px solid #fbbf24', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <AlertTriangle size={20} color="#d97706" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>
                  Bottleneck detected — {stations.find(s => s.key === bottleneckKey)?.label}
                </p>
                <p style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
                  {stations.find(s => s.key === bottleneckKey)?.waitingCount} orders queued. Consider assigning more staff to this station.
                </p>
              </div>
              <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 28, fontWeight: 900, color: '#d97706' }}>
                {stations.find(s => s.key === bottleneckKey)?.waitingCount}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Station cards */}
        {stations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <RefreshCw size={32} color="#9ca3af" style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading station data…</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {stations.map(s => (
              <StationCard
                key={s.key}
                s={s}
                isBottleneck={hasBottleneck && s.key === bottleneckKey}
                pulse={!!pulse[s.key]}
              />
            ))}
          </div>
        )}

        {/* Threshold config + bottleneck alert notification status */}
        {stations.length > 0 && (
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Threshold panel */}
            <div style={{ borderRadius: 20, background: '#fff', border: '1.5px solid #e2e8f0', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Bell size={15} color="#6366f1" />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Alert Threshold</p>
              </div>
              <p style={{ fontSize: 12, color: '#6b7c5a', marginBottom: 16, lineHeight: 1.5 }}>
                Send Telegram + email when any station's queue reaches this many orders.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setThresholdInput(v => Math.max(1, v - 1))}
                  style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={14} color="#374151" />
                </button>
                <div style={{ flex: 1, textAlign: 'center', borderRadius: 12, border: '2px solid #6366f1', padding: '8px 16px', background: '#f5f3ff' }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#4338ca', fontVariantNumeric: 'tabular-nums' }}>{thresholdInput}</span>
                  <span style={{ fontSize: 11, color: '#7c3aed', marginLeft: 6 }}>orders</span>
                </div>
                <button onClick={() => setThresholdInput(v => Math.min(999, v + 1))}
                  style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} color="#374151" />
                </button>
              </div>
              <motion.button
                onClick={saveThreshold}
                disabled={savingThreshold || thresholdInput === threshold}
                whileHover={{ scale: savingThreshold || thresholdInput === threshold ? 1 : 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ marginTop: 14, width: '100%', padding: '10px', borderRadius: 12, border: 'none', background: savedFlash ? '#16a34a' : thresholdInput === threshold ? '#f3f4f6' : '#6366f1', color: thresholdInput === threshold ? '#9ca3af' : '#fff', fontWeight: 700, fontSize: 13, cursor: savingThreshold || thresholdInput === threshold ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.3s' }}>
                {savedFlash ? <><Check size={14} /> Saved!</> : savingThreshold ? 'Saving…' : thresholdInput === threshold ? `Active threshold: ${threshold}` : `Save threshold: ${thresholdInput}`}
              </motion.button>
            </div>

            {/* Notification status panel */}
            <div style={{ borderRadius: 20, background: '#fff', border: '1.5px solid #e2e8f0', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <BellOff size={15} color="#6b7c5a" />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Notification Channels</p>
              </div>
              {[
                { label: 'Telegram', env: 'TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID', desc: 'Alert message sent to your bot chat', color: '#2563eb', bg: '#eff6ff' },
                { label: 'Email',    env: 'EMAIL_USER + EMAIL_APP_PASSWORD',         desc: 'HTML email sent to admin address', color: '#16a34a', bg: '#f0fdf4' },
              ].map(ch => (
                <div key={ch.label} style={{ borderRadius: 12, padding: '12px 14px', background: ch.bg, border: `1px solid ${ch.color}22`, marginBottom: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Bell size={14} color={ch.color} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: ch.color }}>{ch.label}</p>
                    <p style={{ fontSize: 11, color: '#6b7c5a', marginTop: 2 }}>{ch.desc}</p>
                    <p style={{ fontSize: 9, fontFamily: 'monospace', color: '#9ca3af', marginTop: 3 }}>{ch.env}</p>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                Monitor checks every 60s. Alerts fire once on threshold-crossing; cleared notice sent when queue drops back below.
              </p>
            </div>
          </div>
        )}

        {/* Alert log */}
        {alertLog.length > 0 && (
          <div style={{ marginTop: 20, borderRadius: 20, background: '#fff', border: '1.5px solid #e2e8f0', padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Bell size={14} color="#6b7c5a" />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Recent Bottleneck Alerts ({alertLog.length})
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alertLog.map((a, i) => {
                const isAlert = a.type === 'alert';
                const ts = new Date(a.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={i} style={{ borderRadius: 12, padding: '11px 16px', background: isAlert ? '#fef3c7' : '#f0fdf4', border: `1px solid ${isAlert ? '#fbbf24' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16 }}>{isAlert ? '⚠️' : '✅'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: isAlert ? '#92400e' : '#166534' }}>
                        {isAlert ? 'ALERT' : 'CLEARED'} — {a.label}
                      </p>
                      <p style={{ fontSize: 11, color: '#6b7c5a', marginTop: 2 }}>
                        {isAlert ? `${a.count} orders queued` : `Queue back to ${a.count} orders`} · threshold was {a.threshold}
                      </p>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9ca3af', flexShrink: 0 }}>{ts}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pipeline flow diagram */}
        {stations.length > 0 && (
          <div style={{ marginTop: 20, borderRadius: 20, background: '#fff', border: '1.5px solid #e2e8f0', padding: '24px 28px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Order Pipeline Flow</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
              {[
                { label: 'Confirmed / Preparing', count: stations[0]?.waitingCount ?? 0, color: '#f59e0b', bg: '#fef3c7' },
                null,
                { label: 'Packing', count: stations[0]?.doneCount ?? 0, color: STATION_META.packing.color, bg: STATION_META.packing.bg },
                null,
                { label: 'Ready / Pickup', count: stations[1]?.waitingCount ?? 0, color: '#f59e0b', bg: '#fef3c7' },
                null,
                { label: 'Shipping', count: stations[1]?.doneCount ?? 0, color: STATION_META.shipping.color, bg: STATION_META.shipping.bg },
                null,
                { label: 'In Transit', count: stations[2]?.waitingCount ?? 0, color: '#f59e0b', bg: '#fef3c7' },
                null,
                { label: 'Delivered', count: stations[2]?.doneCount ?? 0, color: STATION_META.delivery.color, bg: STATION_META.delivery.bg },
              ].map((node, i) => node === null ? (
                <div key={i} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                  <div style={{ width: 24, height: 2, background: '#e2e8f0' }} />
                  <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '8px solid #e2e8f0' }} />
                </div>
              ) : (
                <div key={i} style={{ flexShrink: 0, textAlign: 'center', borderRadius: 14, padding: '12px 14px', background: node.bg, border: `1.5px solid ${node.color}30`, minWidth: 90 }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: node.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{node.count}</p>
                  <p style={{ fontSize: 9, color: node.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 5, opacity: 0.8 }}>{node.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
