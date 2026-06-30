import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronUp, RefreshCw, User, Phone,
  Mail, MapPin, CreditCard, Calendar, Package, Printer,
  FileText, Check, Clock, FlaskConical, Filter,
} from 'lucide-react';
import type { Order, OrderStatus } from './types';
import { STATUS_META, ORDER_STATUSES } from './types';

interface Props {
  orders: Order[];
  token: string;
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  onSeedDemo: () => Promise<void>;
  seeding: boolean;
}

const TIMELINE_STEPS: OrderStatus[] = [
  'pending','confirmed','preparing','packed',
  'ready_for_pickup','picked_up','shipped','in_transit',
  'out_for_delivery','delivered',
];

function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIdx = TIMELINE_STEPS.indexOf(status);
  const isCancelled = ['cancelled','returned','refunded'].includes(status);
  return (
    <div style={{ padding: '16px 0', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 640, padding: '0 8px' }}>
        {TIMELINE_STEPS.map((step, i) => {
          const sm = STATUS_META[step];
          const done = !isCancelled && currentIdx >= i;
          const active = !isCancelled && currentIdx === i;
          return (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: i === TIMELINE_STEPS.length - 1 ? 0 : 1 }}>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: done ? (active ? '#2d6a4f' : '#52b788') : 'rgba(139,94,60,0.12)',
                    border: active ? '3px solid #1a3a2a' : done ? '2px solid #52b788' : '2px solid rgba(139,94,60,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: active ? '0 0 0 4px rgba(45,106,79,0.2)' : 'none',
                    flexShrink: 0,
                  }}>
                  {done ? <Check size={12} color="#fff" strokeWidth={3} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(139,94,60,0.3)' }} />}
                </motion.div>
                <span style={{ fontSize: 9, fontWeight: done ? 700 : 400, color: done ? '#2d6a4f' : '#6b7c5a', textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 60 }}>
                  {sm.label.replace(' for ', '\nfor\n')}
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: done && currentIdx > i ? '#52b788' : 'rgba(139,94,60,0.12)', margin: '0 2px', marginTop: -22 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function Orders({ orders, token, loading, onRefresh, onUpdateStatus, onSeedDemo, seeding }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  async function handleUpdate(id: string, status: OrderStatus) {
    setUpdatingId(id);
    await onUpdateStatus(id, status);
    setUpdatingId(null);
  }

  const statusFilters = ['all', 'pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      (o.paymentId || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Orders</h1>
          <p style={{ fontSize: 13, color: '#6b7c5a' }}>{orders.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onSeedDemo} disabled={seeding}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              borderRadius: 10, border: '1.5px solid rgba(124,58,237,0.2)', cursor: seeding ? 'not-allowed' : 'pointer',
              background: 'rgba(124,58,237,0.06)', color: '#7c3aed',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: seeding ? 0.6 : 1,
            }}>
            <FlaskConical size={13} />
            {seeding ? 'Seeding…' : 'Load Demo'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onRefresh}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)',
              color: '#f0faf5', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(45,106,79,0.25)',
            }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7c5a' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, order ID, payment ID…"
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
              borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', fontSize: 13,
              outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              background: '#fff9f5', color: '#1a1a0f',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {statusFilters.map(s => {
            const sm = s !== 'all' ? STATUS_META[s as OrderStatus] : null;
            const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <motion.button key={s} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '7px 13px', borderRadius: 20, cursor: 'pointer',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                  background: filterStatus === s ? (sm?.bg || '#d1fae5') : '#fff9f5',
                  color: filterStatus === s ? (sm?.color || '#2d6a4f') : '#6b7c5a',
                  border: `1.5px solid ${filterStatus === s ? (sm?.border || '#a7f3d0') : 'rgba(139,94,60,0.14)'}`,
                }}>
                {s === 'all' ? 'All' : STATUS_META[s as OrderStatus]?.label || s} ({count})
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      <p style={{ fontSize: 12, color: '#6b7c5a', marginBottom: 12 }}>
        Showing {filtered.length} of {orders.length} orders
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff9f5', borderRadius: 18, border: '1px solid rgba(139,94,60,0.08)' }}>
          <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a0f', marginBottom: 6 }}>
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </p>
          <p style={{ fontSize: 13, color: '#6b7c5a' }}>
            {orders.length === 0 ? 'Load demo orders to get started.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((order, idx) => {
            const sm = STATUS_META[order.status] || STATUS_META.pending;
            const isExpanded = expandedId === order.id;
            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  borderRadius: 18, overflow: 'hidden',
                  background: '#fff9f5',
                  border: `1.5px solid ${isExpanded ? sm.border : 'rgba(139,94,60,0.08)'}`,
                  boxShadow: isExpanded ? `0 4px 20px ${sm.color}18` : '0 1px 6px rgba(139,94,60,0.05)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}>

                {/* Row */}
                <div onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', flexWrap: 'wrap' }}>

                  <div style={{ minWidth: 110 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#2d6a4f', marginBottom: 2, fontFamily: 'monospace' }}>{order.id.slice(0, 10)}</p>
                    <p style={{ fontSize: 10, color: '#6b7c5a' }}><Calendar size={9} style={{ display: 'inline', marginRight: 3 }} />{fmt(order.createdAt)}</p>
                  </div>

                  <div style={{ flex: 1, minWidth: 140 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a0f', marginBottom: 2 }}>{order.customer.name}</p>
                    <p style={{ fontSize: 11, color: '#6b7c5a' }}>{order.customer.phone}{order.customer.email && ` · ${order.customer.email}`}</p>
                  </div>

                  <div style={{ minWidth: 80, textAlign: 'center' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a0f' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    <p style={{ fontSize: 10, color: '#6b7c5a' }}>{order.items.map(i => i.productName.split(' ')[0]).slice(0, 2).join(', ')}{order.items.length > 2 ? '…' : ''}</p>
                  </div>

                  <div style={{ minWidth: 90, textAlign: 'right' }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#0f2318' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    {order.paymentId ? (
                      <p style={{ fontSize: 9, color: '#2d6a4f', fontWeight: 600 }}>PAID</p>
                    ) : (
                      <p style={{ fontSize: 9, color: '#d97706', fontWeight: 600 }}>COD</p>
                    )}
                  </div>

                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                    background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`, whiteSpace: 'nowrap',
                  }}>{sm.label}</span>

                  <div style={{ color: '#6b7c5a', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                    <ChevronDown size={16} />
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ borderTop: `1.5px solid ${sm.border}`, padding: '20px 24px', background: `${sm.bg}44` }}>

                        {/* Timeline */}
                        <div style={{ marginBottom: 24 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Order Timeline</p>
                          <OrderTimeline status={order.status} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
                          {/* Customer details */}
                          <div style={{ background: '#fff9f5', borderRadius: 12, padding: 16, border: '1px solid rgba(139,94,60,0.1)' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Customer Details</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={13} color="#6b7c5a" />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a0f' }}>{order.customer.name}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Phone size={13} color="#6b7c5a" />
                                <span style={{ fontSize: 13, color: '#4a5568' }}>{order.customer.phone}</span>
                              </div>
                              {order.customer.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Mail size={13} color="#6b7c5a" />
                                  <span style={{ fontSize: 12, color: '#4a5568' }}>{order.customer.email}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <MapPin size={13} color="#6b7c5a" style={{ flexShrink: 0, marginTop: 2 }} />
                                <span style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.4 }}>{order.customer.address}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment details */}
                          <div style={{ background: '#fff9f5', borderRadius: 12, padding: 16, border: '1px solid rgba(139,94,60,0.1)' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Payment & Shipping</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#6b7c5a' }}>Method</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: order.paymentId ? '#2d6a4f' : '#d97706' }}>
                                  {order.paymentId ? 'Online (Razorpay)' : 'Cash on Delivery'}
                                </span>
                              </div>
                              {order.paymentId && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 12, color: '#6b7c5a' }}>Payment ID</span>
                                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#4a5568' }}>{order.paymentId.slice(0, 18)}…</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#6b7c5a' }}>Total Amount</span>
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#0f2318' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#6b7c5a' }}>Order Date</span>
                                <span style={{ fontSize: 12, color: '#4a5568' }}>{fmt(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Items table */}
                        <div style={{ background: '#fff9f5', borderRadius: 12, padding: 16, border: '1px solid rgba(139,94,60,0.1)', marginBottom: 20 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Ordered Items</p>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                              <tr>
                                {['Product', 'Size', 'Price', 'Qty', 'Subtotal'].map(h => (
                                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: '#6b7c5a', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(139,94,60,0.1)' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(139,94,60,0.05)' }}>
                                  <td style={{ padding: '10px 10px', color: '#1a1a0f', fontWeight: 600 }}>{item.productName}</td>
                                  <td style={{ padding: '10px 10px', color: '#6b7c5a' }}>{item.size}</td>
                                  <td style={{ padding: '10px 10px', color: '#4a5568' }}>₹{item.price.toLocaleString('en-IN')}</td>
                                  <td style={{ padding: '10px 10px', color: '#4a5568' }}>×{item.quantity}</td>
                                  <td style={{ padding: '10px 10px', color: '#0f2318', fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={4} style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#6b7c5a', fontSize: 11 }}>Total</td>
                                <td style={{ padding: '10px 10px', fontWeight: 800, color: '#2d6a4f', fontSize: 15 }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Admin notes + Status update */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div style={{ background: '#fff9f5', borderRadius: 12, padding: 16, border: '1px solid rgba(139,94,60,0.1)' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Admin Notes</p>
                            <textarea
                              value={adminNotes[order.id] || ''}
                              onChange={e => setAdminNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                              placeholder="Add packing notes, courier details, tracking number…"
                              rows={3}
                              style={{
                                width: '100%', borderRadius: 8, border: '1.5px solid rgba(139,94,60,0.14)',
                                fontSize: 12, padding: '8px 10px', fontFamily: 'inherit',
                                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                                background: '#fff', color: '#1a1a0f',
                              }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(139,94,60,0.1)', color: '#8b5e3c', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                                <Printer size={12} /> Print Invoice
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                                <FileText size={12} /> Shipping Label
                              </motion.button>
                            </div>
                          </div>

                          <div style={{ background: '#fff9f5', borderRadius: 12, padding: 16, border: '1px solid rgba(139,94,60,0.1)' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Update Status</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                              {ORDER_STATUSES.map(s => {
                                const ssm = STATUS_META[s];
                                const isCurrent = order.status === s;
                                return (
                                  <motion.button key={s} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => !isCurrent && handleUpdate(order.id, s)}
                                    disabled={isCurrent || updatingId === order.id}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                                      borderRadius: 8, border: `1.5px solid ${isCurrent ? ssm.border : 'rgba(139,94,60,0.1)'}`,
                                      cursor: isCurrent ? 'default' : 'pointer',
                                      background: isCurrent ? ssm.bg : 'transparent',
                                      fontFamily: 'inherit', fontSize: 12, fontWeight: isCurrent ? 700 : 400,
                                      color: isCurrent ? ssm.color : '#4a5568',
                                      transition: 'all 0.15s',
                                    }}>
                                    {isCurrent && <Check size={11} strokeWidth={3} />}
                                    <span>{ssm.label}</span>
                                    {updatingId === order.id && !isCurrent && <RefreshCw size={10} className="animate-spin" style={{ marginLeft: 'auto' }} />}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
