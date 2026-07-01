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

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';
const COLORS = ['#2d6a4f', '#52b788', '#6b7c3a', '#8b5e3c', '#d97706'];

interface Props { orders: Order[]; token: string }

interface LowStockItem { id: string; productName: string; size: string; stock: number; threshold: number }

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

function getMonthlyData(orders: Order[]) {
  const now = new Date();
  const months: { month: string; monthKey: string; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.toLocaleString('en-IN', { month: 'short' }),
      monthKey: `${d.getFullYear()}-${d.getMonth()}`,
      revenue: 0,
      orders: 0,
    });
  }
  for (const order of orders) {
    if (order.status === 'cancelled' || order.status === 'refunded') continue;
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const entry = months.find(m => m.monthKey === key);
    if (entry) { entry.revenue += order.totalAmount; entry.orders += 1; }
  }
  return months.map(({ month, revenue, orders }) => ({ month, revenue, orders }));
}

function getWeeklyData(orders: Order[]) {
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysFromMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - daysFromMon);
  thisMonday.setHours(0, 0, 0, 0);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  const thisWeek = [0, 0, 0, 0, 0, 0, 0];
  const lastWeek = [0, 0, 0, 0, 0, 0, 0];
  for (const order of orders) {
    const d = new Date(order.createdAt);
    const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    if (d >= thisMonday) thisWeek[idx]++;
    else if (d >= lastMonday) lastWeek[idx]++;
  }
  return DAY_NAMES.map((day, i) => ({ day, thisWeek: thisWeek[i], lastWeek: lastWeek[i] }));
}

function getCategoryData(orders: Order[]) {
  const map = new Map<string, number>();
  for (const order of orders) {
    if (order.status === 'cancelled' || order.status === 'refunded') continue;
    for (const item of order.items) {
      map.set(item.productName, (map.get(item.productName) ?? 0) + item.price * item.quantity);
    }
  }
  if (!map.size) return [];
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = sorted.reduce((s, [, v]) => s + v, 0);
  return sorted.map(([name, rev], i) => ({
    name,
    value: Math.round((rev / total) * 100),
    color: COLORS[i % COLORS.length],
  }));
}

export default function Dashboard({ orders, token }: Props) {
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/inventory`, { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLowStock(
            (data.inventory as LowStockItem[])
              .filter(i => i.stock < i.threshold)
              .sort((a, b) => a.stock - b.stock)
              .slice(0, 5)
          );
        }
      })
      .catch(() => {});
  }, [token]);

  const revenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((s, o) => s + o.totalAmount, 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;
  const avgOrder = orders.length ? Math.round(revenue / orders.length) : 0;

  const revenueData = getMonthlyData(orders);
  const weeklyData = getWeeklyData(orders);
  const categoryData = getCategoryData(orders);

  const prevMonth = revenueData[revenueData.length - 2]?.revenue ?? 0;
  const curMonth = revenueData[revenueData.length - 1]?.revenue ?? 0;
  const monthTrend = prevMonth > 0 ? Math.round(((curMonth - prevMonth) / prevMonth) * 100) : 0;

  const statCards = [
    { label: "Today's Orders", value: orders.length, icon: ShoppingBag, color: '#2d6a4f', bg: '#d1fae5', trend: '+12%', up: true },
    { label: 'Revenue', value: revenue, prefix: '₹', icon: CreditCard, color: '#1d4ed8', bg: '#dbeafe', trend: '+8.4%', up: true },
    { label: 'Pending', value: pending, icon: Clock, color: '#d97706', bg: '#fef3c7', trend: '-3%', up: false },
    { label: 'Delivered', value: delivered, icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7', trend: '+22%', up: true },
    { label: 'Cancelled', value: cancelled, icon: XCircle, color: '#dc2626', bg: '#fee2e2', trend: '+1%', up: false },
    { label: 'Avg Order Value', value: avgOrder, prefix: '₹', icon: TrendingUp, color: '#7c3aed', bg: '#ede9fe', trend: '+5.2%', up: true },
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
            <span style={{ fontSize: 12, color: monthTrend >= 0 ? '#2d6a4f' : '#dc2626', fontWeight: 600, background: monthTrend >= 0 ? '#d1fae5' : '#fee2e2', padding: '4px 10px', borderRadius: 20 }}>
              {monthTrend >= 0 ? '↑' : '↓'} {Math.abs(monthTrend)}% this month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
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
          {categoryData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7c5a', fontSize: 12 }}>No order data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {categoryData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#4a5568' }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: d.color }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
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
            <BarChart data={weeklyData} barSize={10} barGap={4}>
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
          {lowStock.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7c5a', fontSize: 12 }}>
              <Package size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.25 }} />
              All products well stocked
            </div>
          ) : (
            lowStock.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                style={{ padding: '12px 0', borderBottom: i < lowStock.length - 1 ? '1px solid rgba(139,94,60,0.08)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a0f' }}>{item.productName} {item.size}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: item.stock <= 3 ? '#fee2e2' : '#fef3c7',
                    color: item.stock <= 3 ? '#dc2626' : '#d97706',
                  }}>{item.stock} left</span>
                </div>
                <div style={{ background: 'rgba(139,94,60,0.1)', borderRadius: 20, height: 5 }}>
                  <motion.div initial={{ width: 0 }}
                    animate={{ width: `${Math.round((item.stock / item.threshold) * 100)}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%', borderRadius: 20,
                      background: item.stock <= 3 ? '#dc2626' : '#d97706',
                    }} />
                </div>
              </motion.div>
            ))
          )}
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
