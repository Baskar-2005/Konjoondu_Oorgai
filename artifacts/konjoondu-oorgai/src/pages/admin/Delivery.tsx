import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle2, Clock, MapPin, Phone, Package, ExternalLink, Edit2, X, Save, Plus } from 'lucide-react';
import type { Order, OrderStatus } from './types';
import { STATUS_META } from './types';

interface ShipmentInfo {
  orderId: string;
  courier: string;
  trackingNo: string;
  weight: string;
  estimatedDelivery: string;
  lastUpdate: string;
  cod: boolean;
}

const DELIVERY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  preparing:        { label: 'Preparing',          color: '#d97706', bg: '#fef3c7' },
  packed:           { label: 'Packed',             color: '#6366f1', bg: '#e0e7ff' },
  ready_for_pickup: { label: 'Ready for Pickup',   color: '#8b5cf6', bg: '#ede9fe' },
  shipped:          { label: 'Shipped',            color: '#0891b2', bg: '#cffafe' },
  in_transit:       { label: 'In Transit',         color: '#6366f1', bg: '#e0e7ff' },
  out_for_delivery: { label: 'Out for Delivery',   color: '#f59e0b', bg: '#fef3c7' },
  delivered:        { label: 'Delivered',          color: '#16a34a', bg: '#dcfce7' },
};

const TIMELINE_STEPS = ['preparing','packed','shipped','in_transit','out_for_delivery','delivered'];

const COURIERS = ['DTDC', 'Blue Dart', 'Delhivery', 'Shiprocket', 'Xpressbees', 'Ecom Express', 'India Post'];

interface ShipmentEditProps {
  orderId: string;
  existing?: ShipmentInfo;
  onSave: (info: ShipmentInfo) => void;
  onClose: () => void;
}
function ShipmentEditModal({ orderId, existing, onSave, onClose }: ShipmentEditProps) {
  const [form, setForm] = useState<ShipmentInfo>({
    orderId,
    courier: existing?.courier || 'DTDC',
    trackingNo: existing?.trackingNo || '',
    weight: existing?.weight || '250g',
    estimatedDelivery: existing?.estimatedDelivery || '',
    lastUpdate: existing?.lastUpdate || new Date().toLocaleDateString('en-IN'),
    cod: existing?.cod ?? false,
  });

  const fieldStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--adm-text)' }}>{existing ? 'Edit Shipment' : 'Add Tracking'}</p>
            <p style={{ fontSize: 11, color: 'var(--adm-text2)', fontFamily: 'monospace', marginTop: 2 }}>{orderId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={15} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Courier</label>
            <select value={form.courier} onChange={e => setForm(p => ({ ...p, courier: e.target.value }))} style={fieldStyle}>
              {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tracking Number</label>
            <input value={form.trackingNo} onChange={e => setForm(p => ({ ...p, trackingNo: e.target.value }))} placeholder="e.g. Z12345678" style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weight</label>
            <input value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 500g" style={fieldStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ETA</label>
            <input type="date" value={form.estimatedDelivery} onChange={e => setForm(p => ({ ...p, estimatedDelivery: e.target.value }))} style={fieldStyle} />
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="cod-check" checked={form.cod} onChange={e => setForm(p => ({ ...p, cod: e.target.checked }))} style={{ accentColor: '#2d6a4f', width: 15, height: 15, cursor: 'pointer' }} />
          <label htmlFor="cod-check" style={{ fontSize: 13, color: 'var(--adm-text)', cursor: 'pointer' }}>Cash on Delivery (COD)</label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onSave(form); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
            <Save size={14} /> Save Shipment
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface Props {
  orders?: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
}

export default function Delivery({ orders = [], onUpdateStatus }: Props) {
  const [filter, setFilter] = useState('all');
  const [shipmentMap, setShipmentMap] = useState<Map<string, ShipmentInfo>>(new Map());
  const [editShipment, setEditShipment] = useState<{ orderId: string; existing?: ShipmentInfo } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const DELIVERY_ORDER_STATUSES: OrderStatus[] = ['preparing','packed','ready_for_pickup','shipped','in_transit','out_for_delivery','delivered'];

  const deliveryOrders = orders.filter(o => DELIVERY_ORDER_STATUSES.includes(o.status));

  const filtered = deliveryOrders.filter(o => filter === 'all' || o.status === filter);

  const stats = {
    total: deliveryOrders.length,
    inTransit: deliveryOrders.filter(o => ['shipped','in_transit','out_for_delivery'].includes(o.status)).length,
    delivered: deliveryOrders.filter(o => o.status === 'delivered').length,
    pending: deliveryOrders.filter(o => ['preparing','packed','ready_for_pickup'].includes(o.status)).length,
    cod: [...shipmentMap.values()].filter(s => s.cod).length,
    successRate: deliveryOrders.length ? Math.round((deliveryOrders.filter(o => o.status === 'delivered').length / deliveryOrders.length) * 100) : 0,
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    await onUpdateStatus(orderId, status);
    setUpdatingId(null);
  };

  const saveShipment = (info: ShipmentInfo) => {
    setShipmentMap(prev => new Map(prev).set(info.orderId, info));
  };

  return (
    <div>
      <AnimatePresence>
        {editShipment && (
          <ShipmentEditModal orderId={editShipment.orderId} existing={editShipment.existing}
            onSave={saveShipment} onClose={() => setEditShipment(null)} />
        )}
      </AnimatePresence>

      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Delivery Tracking</h1>
        <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>{stats.total} active shipments · {stats.successRate}% delivery rate</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Shipments', value: stats.total, color: '#2d6a4f', bg: '#d1fae5', icon: Truck },
          { label: 'In Transit', value: stats.inTransit, color: '#6366f1', bg: '#e0e7ff', icon: MapPin },
          { label: 'Delivered', value: stats.delivered, color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
          { label: 'Preparing', value: stats.pending, color: '#d97706', bg: '#fef3c7', icon: Clock },
          { label: 'COD', value: stats.cod, color: '#dc2626', bg: '#fee2e2', icon: Package },
          { label: 'Success Rate', value: `${stats.successRate}%`, color: '#2d6a4f', bg: '#d1fae5', icon: CheckCircle2 },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 14, padding: '16px 18px', background: 'var(--adm-card)', border: `1px solid var(--adm-border)`, boxShadow: '0 2px 8px var(--adm-shadow)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <c.icon size={16} color={c.color} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {['all', ...DELIVERY_ORDER_STATUSES].map(f => {
          const sm = f !== 'all' ? DELIVERY_STATUS[f] : null;
          const count = f === 'all' ? deliveryOrders.length : deliveryOrders.filter(o => o.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? (sm?.color || '#2d6a4f') : 'var(--adm-border)'}`, background: filter === f ? (sm?.bg || '#d1fae5') : 'var(--adm-card)', color: filter === f ? (sm?.color || '#2d6a4f') : 'var(--adm-text2)' }}>
              {f === 'all' ? 'All' : (sm?.label || f)} ({count})
            </button>
          );
        })}
      </div>

      {/* Order cards */}
      {deliveryOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--adm-card)', borderRadius: 18, border: `1px solid var(--adm-border)` }}>
          <Truck size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--adm-text)', marginBottom: 6 }}>No active shipments</p>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>Orders being prepared and shipped will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((order, i) => {
            const sm = DELIVERY_STATUS[order.status] || DELIVERY_STATUS.preparing;
            const stepIdx = TIMELINE_STEPS.indexOf(order.status);
            const shipment = shipmentMap.get(order.id);
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ borderRadius: 18, background: 'var(--adm-card)', border: `1px solid var(--adm-border)`, padding: 22, boxShadow: '0 1px 6px var(--adm-shadow)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--adm-text)' }}>{order.customer.name}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: sm.bg, color: sm.color }}>{sm.label}</span>
                      {shipment?.cod && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>COD</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--adm-text2)', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={10} />{order.customer.phone}</span>
                      <span style={{ fontSize: 11, color: 'var(--adm-text2)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{order.customer.address}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ textAlign: 'right', marginRight: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 2 }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#2d6a4f' }}>{order.id.slice(0, 12)}</p>
                      {shipment && (
                        <p style={{ fontSize: 11, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
                          {shipment.courier} · {shipment.trackingNo} <ExternalLink size={9} />
                        </p>
                      )}
                    </div>
                    <button onClick={() => setEditShipment({ orderId: order.id, existing: shipment })}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--adm-border)', background: shipment ? 'rgba(99,102,241,0.08)' : 'rgba(45,106,79,0.08)', color: shipment ? '#6366f1' : '#2d6a4f', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      {shipment ? <><Edit2 size={11} /> Edit</>  : <><Plus size={11} /> Add Tracking</>}
                    </button>
                  </div>
                </div>

                {/* Mini timeline */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 14px', padding: '12px 16px', background: 'var(--adm-card-alt)', borderRadius: 12, overflowX: 'auto' }}>
                  {TIMELINE_STEPS.map((step, idx) => {
                    const done = stepIdx >= idx;
                    const active = stepIdx === idx;
                    const ls = DELIVERY_STATUS[step];
                    return (
                      <React.Fragment key={step}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? (active ? '#2d6a4f' : '#52b788') : 'var(--adm-border)', border: active ? '3px solid #1a3a2a' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? '0 0 0 4px rgba(45,106,79,0.15)' : 'none' }}>
                            {done && <CheckCircle2 size={11} color="#fff" />}
                          </div>
                          <span style={{ fontSize: 9, fontWeight: done ? 700 : 400, color: done ? '#2d6a4f' : 'var(--adm-text2)', textAlign: 'center', whiteSpace: 'nowrap', minWidth: 44 }}>{ls?.label?.split(' ')[0]}</span>
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: stepIdx > idx ? '#52b788' : 'var(--adm-border)', margin: '0 4px', marginBottom: 16 }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Update status + details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {DELIVERY_ORDER_STATUSES.map(s => {
                      const ssm = STATUS_META[s] || DELIVERY_STATUS[s];
                      const isCurrent = order.status === s;
                      return (
                        <button key={s} onClick={() => !isCurrent && handleStatusUpdate(order.id, s)} disabled={isCurrent || updatingId === order.id}
                          style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${isCurrent ? (ssm?.border || '#a7f3d0') : 'var(--adm-border)'}`, background: isCurrent ? (ssm?.bg || '#d1fae5') : 'transparent', color: isCurrent ? (ssm?.color || '#2d6a4f') : 'var(--adm-text2)', cursor: isCurrent ? 'default' : 'pointer', fontSize: 10, fontWeight: isCurrent ? 700 : 400, fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                          {isCurrent ? '✓ ' : ''}{DELIVERY_STATUS[s]?.label || ssm?.label || s}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--adm-text2)' }}>
                    {shipment?.estimatedDelivery && <span>ETA: <strong style={{ color: 'var(--adm-text)' }}>{new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong></span>}
                    {shipment?.weight && <span>Weight: <strong style={{ color: 'var(--adm-text)' }}>{shipment.weight}</strong></span>}
                    <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
