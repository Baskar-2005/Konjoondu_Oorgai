import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, Truck, CheckCircle2, Clock, X, MapPin, CreditCard, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';

const PRIMARY = 'hsl(4,60%,44%)';

const TRACKING_STAGES = [
  { status: 'pending', label: 'Order Placed', icon: '📋', color: '#f59e0b' },
  { status: 'confirmed', label: 'Confirmed', icon: '✅', color: '#3b82f6' },
  { status: 'packed', label: 'Packed', icon: '📦', color: '#8b5cf6' },
  { status: 'shipped', label: 'Shipped', icon: '🚚', color: '#06b6d4' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', color: '#f97316' },
  { status: 'delivered', label: 'Delivered', icon: '🎉', color: '#22c55e' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', packed: '#8b5cf6',
  shipped: '#06b6d4', out_for_delivery: '#f97316', delivered: '#22c55e',
  cancelled: '#ef4444', returned: '#6b7280', refunded: '#10b981',
};

interface TrackingStep { id: number; status: string; label: string; description: string; timestamp: string; completed: boolean; }
interface OrderItem { productId: string; name: string; size: string; price: number; quantity: number; }
interface Order {
  id: string; status: string; totalAmount: number; createdAt: string;
  customerName: string; customerPhone: string; customerEmail: string; shippingAddress: string;
  courierName?: string; trackingId?: string; estimatedDelivery?: string;
  items: OrderItem[]; trackingSteps: TrackingStep[];
  razorpayPaymentId?: string;
}

function TrackingTimeline({ order }: { order: Order }) {
  const currentIdx = TRACKING_STAGES.findIndex(s => s.status === order.status);
  const isTerminal = ['cancelled', 'returned', 'refunded'].includes(order.status);

  if (isTerminal) {
    return (
      <div style={{ padding: '16px', background: 'rgba(239,68,68,0.06)', borderRadius: 14, border: '1px solid rgba(239,68,68,0.2)', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <X size={16} color="#ef4444" />
          <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 14, textTransform: 'capitalize' }}>{order.status}</span>
        </div>
        {order.trackingSteps.slice(-1).map(s => (
          <p key={s.id} style={{ fontSize: 12, color: '#8b6344', marginTop: 4 }}>{s.description}</p>
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ fontSize: 12, fontWeight: 800, color: '#8b6344', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Live Tracking</h4>
      <div style={{ position: 'relative' }}>
        {/* Progress line */}
        <div style={{ position: 'absolute', left: 17, top: 0, bottom: 0, width: 2, background: 'rgba(139,94,60,0.1)', borderRadius: 2 }} />
        <motion.div
          initial={{ scaleY: 0, originY: 0 }}
          animate={{ scaleY: currentIdx >= 0 ? (currentIdx + 1) / TRACKING_STAGES.length : 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{ position: 'absolute', left: 17, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${PRIMARY}, ${TRACKING_STAGES[Math.max(0, currentIdx)].color})`, borderRadius: 2 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {TRACKING_STAGES.map((stage, i) => {
            const isCompleted = i <= currentIdx;
            const isCurrent = i === currentIdx;
            const dbStep = order.trackingSteps.find(s => s.status === stage.status);
            return (
              <div key={stage.status} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
                <motion.div
                  initial={isCurrent ? { scale: 0 } : {}}
                  animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                  transition={isCurrent ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    background: isCompleted ? stage.color : 'rgba(139,94,60,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    boxShadow: isCurrent ? `0 0 0 6px ${stage.color}20` : 'none',
                    transition: 'all 0.4s',
                  }}>
                  {isCompleted ? (isCurrent ? stage.icon : <CheckCircle2 size={16} color="#fff" />) : <span style={{ fontSize: 12 }}>○</span>}
                </motion.div>
                <div style={{ paddingTop: 6 }}>
                  <div style={{ fontWeight: isCurrent ? 800 : 600, fontSize: 13, color: isCompleted ? '#1a0f08' : '#c4a882' }}>
                    {stage.label}
                    {isCurrent && <span style={{ marginLeft: 6, fontSize: 10, background: stage.color, color: '#fff', padding: '2px 6px', borderRadius: 20, fontWeight: 700 }}>NOW</span>}
                  </div>
                  {dbStep && <div style={{ fontSize: 11, color: '#8b6344', marginTop: 2 }}>{new Date(dbStep.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onRaiseIssue }: { order: Order; onRaiseIssue: (orderId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const color = STATUS_COLORS[order.status] || '#8b6344';

  return (
    <motion.div layout style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(139,94,60,0.1)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(139,94,60,0.06)' }}>
      {/* Header */}
      <button onClick={() => setExpanded(e => !e)}
        style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Poppins,sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={20} color={color} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1a0f08' }}>{order.id}</div>
              <div style={{ fontSize: 12, color: '#8b6344', marginTop: 2 }}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 16, color: PRIMARY }}>₹{order.totalAmount.toLocaleString('en-IN')}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: `${color}15`, marginTop: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'capitalize' }}>{order.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div style={{ fontSize: 12, color: '#8b6344' }}>{order.items.slice(0, 2).map(i => `${i.name} (${i.size})`).join(', ')}{order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}</div>
          <span style={{ color: '#8b6344' }}>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
        </div>
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(139,94,60,0.08)' }}>
              {/* Items */}
              <div style={{ paddingTop: 16 }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: '#8b6344', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Items Ordered</h4>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(139,94,60,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${PRIMARY}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🥒</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a0f08' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: '#8b6344' }}>{item.size} · Qty {item.quantity}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: PRIMARY }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 900, fontSize: 15, borderTop: '1px solid rgba(139,94,60,0.1)', marginTop: 4 }}>
                  <span>Total</span>
                  <span style={{ color: PRIMARY }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: '#faf8f5', border: '1px solid rgba(139,94,60,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <MapPin size={12} color="#8b6344" />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#8b6344', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ship To</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#1a0f08', lineHeight: 1.5 }}>{order.shippingAddress}</p>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: '#faf8f5', border: '1px solid rgba(139,94,60,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <CreditCard size={12} color="#8b6344" />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#8b6344', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#1a0f08' }}>{order.razorpayPaymentId ? 'Razorpay' : 'Pending'}</p>
                  {order.razorpayPaymentId && <p style={{ fontSize: 10, color: '#8b6344', marginTop: 2 }}>{order.razorpayPaymentId}</p>}
                </div>
              </div>

              {/* Courier info */}
              {order.courierName && (
                <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Truck size={14} color="#06b6d4" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0e7490' }}>{order.courierName}</span>
                    {order.trackingId && <span style={{ fontSize: 12, color: '#0e7490' }}>· {order.trackingId}</span>}
                  </div>
                  {order.estimatedDelivery && (
                    <p style={{ fontSize: 12, color: '#0e7490', marginTop: 4 }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />Est. delivery: {order.estimatedDelivery}
                    </p>
                  )}
                </div>
              )}

              {/* Tracking timeline */}
              <TrackingTimeline order={order} />

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
                {!['delivered', 'cancelled', 'returned', 'refunded'].includes(order.status) && (
                  <button onClick={() => onRaiseIssue(order.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>
                    <AlertCircle size={13} /> Raise Issue
                  </button>
                )}
                <button onClick={() => window.location.href = '/products'}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: `1px solid ${PRIMARY}40`, background: `${PRIMARY}08`, color: PRIMARY, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>
                  <RefreshCw size={13} /> Buy Again
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(139,94,60,0.2)', background: 'rgba(139,94,60,0.04)', color: '#8b6344', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>
                  <Download size={13} /> Invoice
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function IssueModal({ orderId, onClose, apiBase, token }: { orderId: string; onClose: () => void; apiBase: string; token: string }) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const ISSUE_TYPES = ['Damaged Product', 'Wrong Product', 'Missing Product', 'Late Delivery', 'Payment Issue', 'Other'];

  async function submit() {
    if (!type || !description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/orders/${orderId}/issues`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ type, description }),
      });
      if ((await res.json()).success) setDone(true);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
        style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 440 }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Issue Reported</h3>
            <p style={{ fontSize: 13, color: '#8b6344', marginTop: 6 }}>Our team will look into it within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 12, border: 'none', background: PRIMARY, color: '#fff9f0', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1a0f08' }}>Raise Issue</h3>
              <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {ISSUE_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  style={{ padding: '7px 12px', borderRadius: 20, border: `1.5px solid ${type === t ? PRIMARY : 'rgba(139,94,60,0.2)'}`, background: type === t ? `${PRIMARY}10` : 'transparent', color: type === t ? PRIMARY : '#8b6344', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', transition: 'all 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your issue in detail…" rows={4}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid rgba(139,94,60,0.2)', fontFamily: 'Poppins,sans-serif', fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box', color: '#1a0f08' }} />
            <button onClick={submit} disabled={!type || !description.trim() || loading}
              style={{ width: '100%', marginTop: 14, padding: '12px', borderRadius: 12, border: 'none', background: !type || !description.trim() ? 'rgba(181,58,46,0.3)' : PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 14, cursor: !type || !description.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif' }}>
              {loading ? 'Submitting…' : 'Submit Issue'}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function MyOrders() {
  const { apiBase, token } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueOrderId, setIssueOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!token) return;
    fetch(`${apiBase}/customer/orders`, { headers: { 'x-customer-token': token } })
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, apiBase]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['delivered', 'cancelled', 'returned', 'refunded'].includes(o.status);
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return ['cancelled', 'returned', 'refunded'].includes(o.status);
    return true;
  });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${filter === f.key ? PRIMARY : 'rgba(139,94,60,0.2)'}`, background: filter === f.key ? PRIMARY : '#fff', color: filter === f.key ? '#fff9f0' : '#8b6344', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', transition: 'all 0.15s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 100, borderRadius: 20, background: 'rgba(139,94,60,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>No orders found</h3>
          <p style={{ fontSize: 13, color: '#8b6344' }}>
            {filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} onRaiseIssue={id => setIssueOrderId(id)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {issueOrderId && token && (
          <IssueModal orderId={issueOrderId} onClose={() => setIssueOrderId(null)} apiBase={apiBase} token={token} />
        )}
      </AnimatePresence>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
