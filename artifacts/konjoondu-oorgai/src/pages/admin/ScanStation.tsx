import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Check, X, RefreshCw, Package, Truck, CheckCircle2, AlertCircle, Clock, Zap, ArrowLeft } from 'lucide-react';
import type { Order, OrderStatus } from './types';
import { STATUS_META } from './types';

const STATIONS = [
  { id: 'packing', label: 'Packing Station', icon: Package, description: 'Scan to mark orders as Packed', color: '#2d6a4f', bg: '#d1fae5', targetStatus: 'packed' as OrderStatus, nextStatus: 'ready_for_pickup' as OrderStatus },
  { id: 'shipping', label: 'Shipping Station', icon: Truck, description: 'Scan to mark orders as Shipped', color: '#6366f1', bg: '#e0e7ff', targetStatus: 'shipped' as OrderStatus, nextStatus: 'in_transit' as OrderStatus },
  { id: 'delivery', label: 'Delivery Station', icon: CheckCircle2, description: 'Scan to mark orders as Delivered', color: '#16a34a', bg: '#dcfce7', targetStatus: 'delivered' as OrderStatus, nextStatus: 'delivered' as OrderStatus },
];

interface ScanResult {
  orderId: string;
  success: boolean;
  message: string;
  order?: Order;
  timestamp: Date;
}

interface Props {
  orders: Order[];
  token: string;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  onBack: () => void;
}

export default function ScanStation({ orders, token, onUpdateStatus, onBack }: Props) {
  const [station, setStation] = useState<typeof STATIONS[number] | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState({ scanned: 0, success: 0, failed: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (station && inputRef.current) {
      inputRef.current.focus();
    }
  }, [station]);

  const playBeep = (success: boolean) => {
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
  };

  const handleScan = async (raw: string) => {
    if (!station || processing) return;
    const id = raw.trim().replace(/^KO-ORDER:/, '');
    if (!id) return;

    setProcessing(true);
    setScanInput('');

    const order = orders.find(o => o.id === id || o.id.includes(id) || id.includes(o.id.slice(-8)));
    const timestamp = new Date();

    if (!order) {
      const result: ScanResult = { orderId: id, success: false, message: `Order "${id}" not found in the system`, timestamp };
      setResults(prev => [result, ...prev.slice(0, 29)]);
      setStats(p => ({ ...p, scanned: p.scanned + 1, failed: p.failed + 1 }));
      playBeep(false);
      setProcessing(false);
      return;
    }

    if (order.status === station.targetStatus || order.status === station.nextStatus) {
      const result: ScanResult = { orderId: order.id, success: false, message: `Order already at "${STATUS_META[order.status]?.label}" — no update needed`, order, timestamp };
      setResults(prev => [result, ...prev.slice(0, 29)]);
      setStats(p => ({ ...p, scanned: p.scanned + 1, failed: p.failed + 1 }));
      playBeep(false);
      setProcessing(false);
      return;
    }

    try {
      await onUpdateStatus(order.id, station.targetStatus);
      const result: ScanResult = { orderId: order.id, success: true, message: `✓ Marked as "${STATUS_META[station.targetStatus]?.label}" — ${order.customer.name}`, order, timestamp };
      setResults(prev => [result, ...prev.slice(0, 29)]);
      setStats(p => ({ ...p, scanned: p.scanned + 1, success: p.success + 1 }));
      playBeep(true);
    } catch {
      const result: ScanResult = { orderId: order.id, success: false, message: 'Status update failed — check connection', order, timestamp };
      setResults(prev => [result, ...prev.slice(0, 29)]);
      setStats(p => ({ ...p, scanned: p.scanned + 1, failed: p.failed + 1 }));
      playBeep(false);
    }
    setProcessing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: station ? station.bg : 'var(--adm-bg)', transition: 'background 0.4s' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <button onClick={onBack}
            style={{ width: 40, height: 40, borderRadius: 12, border: '1.5px solid var(--adm-border)', background: 'var(--adm-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text2)' }}>
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: station?.color || 'var(--adm-text)', marginBottom: 2 }}>
              {station ? station.label : 'QR Scan Station'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>
              {station ? station.description : 'Select a station to begin scanning'}
            </p>
          </div>
        </div>

        {/* Station selection */}
        {!station && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {STATIONS.map((s, i) => (
              <motion.button key={s.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => setStation(s)}
                whileHover={{ y: -4, boxShadow: `0 12px 32px ${s.color}25` }} whileTap={{ scale: 0.97 }}
                style={{ borderRadius: 20, padding: '28px 24px', background: 'var(--adm-card)', border: `2px solid ${s.color}30`, cursor: 'pointer', textAlign: 'center', fontFamily: 'Poppins, sans-serif', transition: 'box-shadow 0.2s' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 4px 16px ${s.color}20` }}>
                  <s.icon size={28} color={s.color} />
                </div>
                <p style={{ fontSize: 17, fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontSize: 12, color: 'var(--adm-text2)', lineHeight: 1.5 }}>{s.description}</p>
                <div style={{ marginTop: 18, padding: '8px 14px', background: s.bg, borderRadius: 10, display: 'inline-block' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: s.color }}>
                    Scan → {STATUS_META[s.targetStatus]?.label}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Active station */}
        {station && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Scanned', value: stats.scanned, color: station.color, bg: station.bg },
                { label: 'Success', value: stats.success, color: '#16a34a', bg: '#dcfce7' },
                { label: 'Failed', value: stats.failed, color: '#dc2626', bg: '#fee2e2' },
              ].map(s => (
                <div key={s.label} style={{ borderRadius: 16, padding: '16px 18px', background: s.bg, border: `1.5px solid ${s.color}25`, textAlign: 'center' }}>
                  <p style={{ fontSize: 32, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Scanner input */}
            <div style={{ borderRadius: 24, background: 'var(--adm-card)', border: `2px solid ${station.color}`, padding: 28, marginBottom: 20, boxShadow: `0 8px 32px ${station.color}15` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: station.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {processing ? <RefreshCw size={22} color={station.color} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Scan size={22} color={station.color} />}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 2 }}>Scan an Order QR Code</p>
                  <p style={{ fontSize: 12, color: 'var(--adm-text2)' }}>Point your scanner at the order QR code, or type the order ID below</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  ref={inputRef}
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan(scanInput)}
                  placeholder="Order ID will auto-fill when QR scanned…"
                  disabled={processing}
                  autoFocus
                  style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: `2px solid ${station.color}40`, fontSize: 14, outline: 'none', fontFamily: 'monospace', background: station.bg + '44', color: 'var(--adm-text)', letterSpacing: '0.04em' }}
                />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleScan(scanInput)} disabled={!scanInput.trim() || processing}
                  style={{ padding: '14px 22px', borderRadius: 12, border: 'none', cursor: scanInput.trim() && !processing ? 'pointer' : 'not-allowed', background: station.color, color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', opacity: !scanInput.trim() || processing ? 0.6 : 1 }}>
                  {processing ? 'Processing…' : 'Scan'}
                </motion.button>
              </div>

              {/* Manual order selector */}
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text2)', marginBottom: 8 }}>Or tap an order to scan:</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 140, overflowY: 'auto' }}>
                  {orders.filter(o => !['delivered','cancelled','returned','refunded'].includes(o.status)).map(o => (
                    <button key={o.id} onClick={() => handleScan(o.id)} disabled={processing}
                      style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${station.color}30`, background: station.bg, color: station.color, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'monospace' }}>
                      {o.id.slice(-10)} · {o.customer.name.split(' ')[0]}
                    </button>
                  ))}
                  {orders.filter(o => !['delivered','cancelled','returned','refunded'].includes(o.status)).length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--adm-text2)', padding: '8px 0' }}>No pending orders to scan</p>
                  )}
                </div>
              </div>
            </div>

            {/* Results feed */}
            {results.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Scan History</p>
                  <button onClick={() => { setResults([]); setStats({ scanned: 0, success: 0, failed: 0 }); }}
                    style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    Clear
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <AnimatePresence initial={false}>
                    {results.map((r, i) => (
                      <motion.div key={`${r.orderId}-${r.timestamp.getTime()}`}
                        initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ borderRadius: 14, padding: '14px 18px', background: r.success ? '#d1fae5' : '#fee2e2', border: `1.5px solid ${r.success ? 'rgba(45,106,79,0.2)' : 'rgba(220,38,38,0.2)'}`, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: r.success ? '#2d6a4f' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {r.success ? <Check size={15} color="#fff" strokeWidth={3} /> : <X size={15} color="#fff" />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: r.success ? '#166534' : '#991b1b', marginBottom: 2 }}>{r.message}</p>
                            {r.order && <p style={{ fontSize: 11, color: r.success ? '#16a34a' : '#dc2626', opacity: 0.8 }}>{r.order.items.length} item{r.order.items.length !== 1 ? 's' : ''} · ₹{r.order.totalAmount.toLocaleString('en-IN')} · {r.order.customer.address.slice(0, 40)}</p>}
                          </div>
                          <span style={{ fontSize: 10, color: r.success ? '#16a34a' : '#dc2626', opacity: 0.7, flexShrink: 0, fontFamily: 'monospace' }}>
                            {r.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Change station */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button onClick={() => { setStation(null); setResults([]); setStats({ scanned: 0, success: 0, failed: 0 }); }}
                style={{ padding: '10px 20px', borderRadius: 12, border: `1.5px solid var(--adm-border)`, background: 'var(--adm-card)', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>
                ← Change Station
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
