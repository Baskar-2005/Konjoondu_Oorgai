import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle2, Clock, XCircle, MapPin, Phone, Package, ExternalLink } from 'lucide-react';

const DELIVERIES = [
  { id: 'SHP001', orderId: 'ORD-2406-001', customer: 'Karthik Rajan', phone: '9876543210', address: '14, Nehru Street, Cuddalore - 607001', courier: 'DTDC', trackingNo: 'Z12345678', status: 'in_transit', estimatedDelivery: '2024-06-22', weight: '500g', cod: false, amount: 820, lastUpdate: '2024-06-20 14:32' },
  { id: 'SHP002', orderId: 'ORD-2406-002', customer: 'Meena Sundaram', phone: '9444112233', address: '7/3, Raja Nagar, Chidambaram - 608001', courier: 'Blue Dart', trackingNo: 'BD98765432', status: 'out_for_delivery', estimatedDelivery: '2024-06-21', weight: '250g', cod: false, amount: 260, lastUpdate: '2024-06-21 08:15' },
  { id: 'SHP003', orderId: 'ORD-2406-003', customer: 'Selvam Murugan', phone: '8012345678', address: '22, Fishermen Colony, Cuddalore Port - 607003', courier: 'Delhivery', trackingNo: 'DL11223344', status: 'delivered', estimatedDelivery: '2024-06-19', weight: '750g', cod: true, amount: 810, lastUpdate: '2024-06-19 16:45' },
  { id: 'SHP004', orderId: 'ORD-2406-004', customer: 'Priya Anand', phone: '9500667788', address: '5, Gandhi Road, Villupuram - 605602', courier: 'DTDC', trackingNo: 'Z98765432', status: 'pending_pickup', estimatedDelivery: '2024-06-23', weight: '250g', cod: false, amount: 420, lastUpdate: '2024-06-20 10:00' },
  { id: 'SHP005', orderId: 'ORD-2406-005', customer: 'Ravi Kumar', phone: '7299001122', address: '88, Anna Salai, Chennai - 600002', courier: 'Shiprocket', trackingNo: 'SR55667788', status: 'shipped', estimatedDelivery: '2024-06-22', weight: '750g', cod: false, amount: 1030, lastUpdate: '2024-06-20 12:20' },
];

const DELIVERY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending_pickup:   { label: 'Pending Pickup',   color: '#d97706', bg: '#fef3c7' },
  shipped:          { label: 'Shipped',           color: '#6366f1', bg: '#e0e7ff' },
  in_transit:       { label: 'In Transit',        color: '#8b5cf6', bg: '#ede9fe' },
  out_for_delivery: { label: 'Out for Delivery',  color: '#f59e0b', bg: '#fef3c7' },
  delivered:        { label: 'Delivered',         color: '#16a34a', bg: '#dcfce7' },
  failed:           { label: 'Failed',            color: '#dc2626', bg: '#fee2e2' },
};

const TIMELINE_STEPS = ['pending_pickup','shipped','in_transit','out_for_delivery','delivered'];

export default function Delivery() {
  const [filter, setFilter] = useState('all');

  const filtered = DELIVERIES.filter(d => filter === 'all' || d.status === filter);

  const stats = {
    total: DELIVERIES.length,
    inTransit: DELIVERIES.filter(d => d.status === 'in_transit' || d.status === 'out_for_delivery').length,
    delivered: DELIVERIES.filter(d => d.status === 'delivered').length,
    pending: DELIVERIES.filter(d => d.status === 'pending_pickup').length,
    cod: DELIVERIES.filter(d => d.cod).length,
    successRate: Math.round((DELIVERIES.filter(d => d.status === 'delivered').length / DELIVERIES.length) * 100),
  };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Delivery Tracking</h1>
        <p style={{ fontSize: 13, color: '#6b7c5a' }}>{stats.total} active shipments · {stats.successRate}% success rate</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Shipments', value: stats.total, color: '#2d6a4f', bg: '#d1fae5', icon: Truck },
          { label: 'In Transit', value: stats.inTransit, color: '#8b5cf6', bg: '#ede9fe', icon: MapPin },
          { label: 'Delivered', value: stats.delivered, color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
          { label: 'Awaiting Pickup', value: stats.pending, color: '#d97706', bg: '#fef3c7', icon: Clock },
          { label: 'COD Pending', value: stats.cod, color: '#dc2626', bg: '#fee2e2', icon: Package },
          { label: 'Success Rate', value: `${stats.successRate}%`, color: '#2d6a4f', bg: '#d1fae5', icon: CheckCircle2 },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 14, padding: '16px 18px', background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <c.icon size={16} color={c.color} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {['all', ...Object.keys(DELIVERY_STATUS)].map(f => {
          const sm = f !== 'all' ? DELIVERY_STATUS[f] : null;
          const count = f === 'all' ? DELIVERIES.length : DELIVERIES.filter(d => d.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? (sm?.color || '#2d6a4f') : 'rgba(139,94,60,0.14)'}`, background: filter === f ? (sm?.bg || '#d1fae5') : '#fff9f5', color: filter === f ? (sm?.color || '#2d6a4f') : '#6b7c5a' }}>
              {f === 'all' ? 'All' : sm?.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Shipment cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((ship, i) => {
          const sm = DELIVERY_STATUS[ship.status] || DELIVERY_STATUS.pending_pickup;
          const stepIdx = TIMELINE_STEPS.indexOf(ship.status);
          return (
            <motion.div key={ship.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 1px 6px rgba(139,94,60,0.05)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#0f2318' }}>{ship.customer}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: sm.bg, color: sm.color }}>{sm.label}</span>
                    {ship.cod && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>COD</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#6b7c5a', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={10} />{ship.phone}</span>
                    <span style={{ fontSize: 11, color: '#6b7c5a', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{ship.address}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>₹{ship.amount.toLocaleString('en-IN')}</p>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 11, color: '#6b7c5a' }}>{ship.courier}</span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6366f1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {ship.trackingNo} <ExternalLink size={10} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini timeline */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 14px', padding: '12px 16px', background: 'rgba(45,106,79,0.04)', borderRadius: 12 }}>
                {TIMELINE_STEPS.map((step, idx) => {
                  const done = stepIdx >= idx;
                  const active = stepIdx === idx;
                  const ls = DELIVERY_STATUS[step];
                  return (
                    <React.Fragment key={step}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? (active ? '#2d6a4f' : '#52b788') : 'rgba(139,94,60,0.15)', border: active ? '3px solid #1a3a2a' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? '0 0 0 4px rgba(45,106,79,0.15)' : 'none' }}>
                          {done && <CheckCircle2 size={10} color="#fff" />}
                        </div>
                        <span style={{ fontSize: 9, fontWeight: done ? 700 : 400, color: done ? '#2d6a4f' : '#6b7c5a', textAlign: 'center', whiteSpace: 'nowrap' }}>{ls?.label.split(' ')[0]}</span>
                      </div>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: stepIdx > idx ? '#52b788' : 'rgba(139,94,60,0.12)', margin: '0 4px', marginTop: -16 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7c5a' }}>
                <span>ETA: <strong style={{ color: '#1a1a0f' }}>{new Date(ship.estimatedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong></span>
                <span>Last Update: <strong style={{ color: '#1a1a0f' }}>{ship.lastUpdate}</strong></span>
                <span>Weight: <strong style={{ color: '#1a1a0f' }}>{ship.weight}</strong></span>
                <span>Order: <strong style={{ color: '#2d6a4f' }}>{ship.orderId}</strong></span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
