import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle2, XCircle,
  CreditCard, Users, Star, Package, AlertTriangle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { Order } from './types';
import { STATUS_META } from './types';

interface Props { orders: Order[] }

function AnimatedCounter({ value, prefix = '', duration = 1200 }: { value: number; prefix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(0);
  const startTime = useRef<number | null>(null);
  useEffect(() => {
    start.current = 0;
    startTime.current = null;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <>{prefix}{display.toLocaleString('en-IN')}</>;
}

const REVENUE_DATA = [
  { month: 'Jan', revenue: 18400, orders: 42 },
  { month: 'Feb', revenue: 24200, orders: 58 },
  { month: 'Mar', revenue: 31500, orders: 74 },
  { month: 'Apr', revenue: 28900, orders: 67 },
  { month: 'May', revenue: 37800, orders: 89 },
  { month: 'Jun', revenue: 44200, orders: 102 },
];

const CATEGORY_DATA = [
  { name: 'Prawn Pickle', value: 38, color: '#2d6a4f' },
  { name: 'Chicken Pickle', value: 27, color: '#52b788' },
  { name: 'Squid Pickle', value: 21, color: '#6b7c3a' },
  { name: 'Mutton Pickle', value: 14, color: '#8b5e3c' },
];

const WEEKLY_DATA = [
  { day: 'Mon', thisWeek: 12, lastWeek: 8 },
  { day: 'Tue', thisWeek: 18, lastWeek: 14 },
  { day: 'Wed', thisWeek: 9, lastWeek: 16 },
  { day: 'Thu', thisWeek: 22, lastWeek: 11 },
  { day: 'Fri', thisWeek: 31, lastWeek: 19 },
  { day: 'Sat', thisWeek: 27, lastWeek: 23 },
  { day: 'Sun', thisWeek: 14, lastWeek: 10 },
];

export default function Dashboard({ orders }: Props) {
  const revenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((s, o) => s + o.totalAmount, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const avgOrder = orders.length ? Math.round(revenue / orders.length) : 0;

  const statCards = [
    { label: "Today's Orders", value: orders.length, icon: ShoppingBag, color: '#2d6a4f', bg: '#d1fae5', trend: '+12%', up: true },
    { label: 'Revenue', value: revenue, prefix: '₹', icon: CreditCard, color: '#1d4ed8', bg: '#dbeafe', trend: '+8.4%', up: true },
    { label: 'Pending', value: pending, icon: Clock, color: '#d97706', bg: '#fef3c7', trend: '-3%', up: false },
    { label: 'Delivered', value: delivered, icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7', trend: '+22%', up: true },
    { label: 'Cancelled', value: cancelled, icon: XCircle, color: '#dc2626', bg: '#fee2e2', trend: '+1%', up: false },
    { label: 'Avg Order Value', value: avgOrder, prefix: '₹', icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe', trend: '+5.2%', up: true },
  ];

  const lowStock = [
    { name: 'Prawn Pickle 250g', stock: 4, threshold: 10 },
    { name: 'Squid Pickle 500g', stock: 2, threshold: 10 },
    { name: 'Mutton Pickle 100g', stock: 7, threshold: 10 },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#6b7c5a' }}>Welcome back — here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(139,94,60,0.12)' }}
              style={{
                borderRadius: 16, padding: '18px 20px',
                background: '#fff9f5',
                border: '1px solid rgba(139,94,60,0.08)',
                boxShadow: '0 2px 8px rgba(139,94,60,0.06)',
                cursor: 'default',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={s.color} />
                </div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  fontSize: 11, fontWeight: 600,
                  color: s.up ? '#16a34a' : '#dc2626',
                }}>
                  {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {s.trend}
                </span>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 6 }}>
                <AnimatedCounter value={s.value} prefix={s.prefix} />
              </p>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 2 }}>Revenue Overview</p>
              <p style={{ fontSize: 11, color: '#6b7c5a' }}>Monthly revenue trend</p>
            </div>
            <span style={{ fontSize: 12, color: '#2d6a4f', fontWeight: 600, background: '#d1fae5', padding: '4px 10px', borderRadius: 20 }}>↑ 18% this month</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,94,60,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 10, border: '1px solid rgba(139,94,60,0.15)', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#2d6a4f" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 2 }}>Top Categories</p>
          <p style={{ fontSize: 11, color: '#6b7c5a', marginBottom: 16 }}>Sales by product</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {CATEGORY_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: '#4a5568' }}>{d.name}</span>
                <span style={{ fontWeight: 700, color: d.color }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Weekly comparison + Low stock + Recent orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Weekly comparison */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 2 }}>Weekly Orders</p>
          <p style={{ fontSize: 11, color: '#6b7c5a', marginBottom: 16 }}>This week vs last week</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_DATA} barSize={10} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,94,60,0.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid rgba(139,94,60,0.15)', fontSize: 12 }} />
              <Bar dataKey="thisWeek" name="This Week" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lastWeek" name="Last Week" fill="rgba(45,106,79,0.25)" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Low stock alerts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={16} color="#d97706" />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318' }}>Low Stock Alerts</p>
          </div>
          {lowStock.map((item, i) => (
            <motion.div key={item.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
              style={{ padding: '12px 0', borderBottom: i < lowStock.length - 1 ? '1px solid rgba(139,94,60,0.08)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a0f' }}>{item.name}</p>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: item.stock <= 3 ? '#fee2e2' : '#fef3c7',
                  color: item.stock <= 3 ? '#dc2626' : '#d97706',
                }}>{item.stock} left</span>
              </div>
              <div style={{ background: 'rgba(139,94,60,0.1)', borderRadius: 20, height: 5 }}>
                <motion.div initial={{ width: 0 }}
                  animate={{ width: `${(item.stock / item.threshold) * 100}%` }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: 20,
                    background: item.stock <= 3 ? '#dc2626' : '#d97706',
                  }} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Recent orders table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 2 }}>Recent Orders</p>
            <p style={{ fontSize: 11, color: '#6b7c5a' }}>Latest {Math.min(orders.length, 5)} orders</p>
          </div>
        </div>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7c5a' }}>
            <ShoppingBag size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
            <p style={{ fontSize: 13 }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7c5a', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(139,94,60,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order, i) => {
                  const sm = STATUS_META[order.status] || STATUS_META.pending;
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + i * 0.04 }}
                      style={{ borderBottom: '1px solid rgba(139,94,60,0.06)' }}>
                      <td style={{ padding: '12px 12px', color: '#2d6a4f', fontWeight: 700 }}>{order.id.slice(0, 8)}…</td>
                      <td style={{ padding: '12px 12px', color: '#1a1a0f', fontWeight: 500 }}>{order.customer.name}</td>
                      <td style={{ padding: '12px 12px', color: '#4a5568' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                      <td style={{ padding: '12px 12px', color: '#0f2318', fontWeight: 700 }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>
                          {sm.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#6b7c5a' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
