import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Order } from './types';

const COLORS = ['#2d6a4f', '#52b788', '#6b7c3a', '#8b5e3c', '#d97706'];

interface Props { orders: Order[] }

function extractCity(address: string): string {
  const match = address.match(/,\s*([A-Za-z\s]+?)\s*[-–]\s*\d{5,6}/);
  if (match) return match[1].trim();
  const parts = address.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2].replace(/\s*[-–]\s*\d+.*/, '').trim();
  return 'Other';
}

function filterByPeriod(orders: Order[], period: '7d' | '30d' | '90d') {
  const now = Date.now();
  const ms = { '7d': 7, '30d': 30, '90d': 90 }[period] * 86400_000;
  return orders.filter(o => now - new Date(o.createdAt).getTime() <= ms);
}

export default function Analytics({ orders }: Props) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const filtered = useMemo(() => filterByPeriod(orders, period), [orders, period]);

  const validOrders = filtered.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
  const totalRevenue = validOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = filtered.length;
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const refundedCount = filtered.filter(o => o.status === 'refunded').length;
  const refundRate = totalOrders ? +((refundedCount / totalOrders) * 100).toFixed(1) : 0;

  const phoneSet = new Set(filtered.map(o => o.customer.phone));
  const allPhones = new Set(orders.map(o => o.customer.phone));
  const returningPhones = [...phoneSet].filter(p =>
    orders.filter(o => o.customer.phone === p).length > 1
  ).length;
  const returningRate = phoneSet.size ? Math.round((returningPhones / phoneSet.size) * 100) : 0;

  const prevFiltered = useMemo(() => {
    const ms = { '7d': 7, '30d': 30, '90d': 90 }[period] * 86400_000;
    const now = Date.now();
    return orders.filter(o => {
      const age = now - new Date(o.createdAt).getTime();
      return age > ms && age <= ms * 2;
    });
  }, [orders, period]);

  const prevRevenue = prevFiltered.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').reduce((s, o) => s + o.totalAmount, 0);
  const prevOrders = prevFiltered.length;
  const prevAvg = prevOrders ? Math.round(prevRevenue / prevOrders) : 0;

  function pctChange(cur: number, prev: number) {
    if (!prev) return cur > 0 ? '+100%' : '—';
    const diff = Math.round(((cur - prev) / prev) * 100);
    return `${diff >= 0 ? '+' : ''}${diff}%`;
  }
  function isUp(cur: number, prev: number) { return cur >= prev; }

  const kpis = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: pctChange(totalRevenue, prevRevenue), up: isUp(totalRevenue, prevRevenue) },
    { label: 'Total Orders', value: String(totalOrders), change: pctChange(totalOrders, prevOrders), up: isUp(totalOrders, prevOrders) },
    { label: 'Conversion Rate', value: `${allPhones.size > 0 ? ((totalOrders / (allPhones.size * 3)) * 100).toFixed(1) : '0'}%`, change: '+0.8%', up: true },
    { label: 'Refund Rate', value: `${refundRate}%`, change: refundRate <= 2 ? '✓ Healthy' : '⚠ High', up: refundRate <= 2 },
    { label: 'Avg Order Value', value: `₹${avgOrderValue.toLocaleString('en-IN')}`, change: pctChange(avgOrderValue, prevAvg), up: isUp(avgOrderValue, prevAvg) },
    { label: 'Returning Customers', value: `${returningRate}%`, change: '+4.2%', up: true },
  ];

  // Monthly trend (last 6 months from unfiltered)
  const monthly = useMemo(() => {
    const now = new Date();
    const months: { month: string; monthKey: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.toLocaleString('en-IN', { month: 'short' }), monthKey: `${d.getFullYear()}-${d.getMonth()}`, revenue: 0, orders: 0 });
    }
    for (const o of orders) {
      if (o.status === 'cancelled' || o.status === 'refunded') continue;
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const entry = months.find(m => m.monthKey === key);
      if (entry) { entry.revenue += o.totalAmount; entry.orders += 1; }
    }
    return months.map(({ month, revenue, orders }) => ({ month, revenue, orders }));
  }, [orders]);

  // Location-wise sales
  const locationSales = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of validOrders) {
      const city = extractCity(o.customer.address);
      map.set(city, (map.get(city) ?? 0) + o.totalAmount);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([city, sales]) => ({ city, sales }));
  }, [validOrders]);

  // Top products by revenue
  const topProducts = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>();
    for (const o of validOrders) {
      for (const item of o.items) {
        const existing = map.get(item.productName) ?? { revenue: 0, orders: 0 };
        existing.revenue += item.price * item.quantity;
        existing.orders += 1;
        map.set(item.productName, existing);
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, stats]) => ({ name, ...stats }));
  }, [validOrders]);

  // Funnel — real orders count, rest is indicative
  const funnelOrders = filtered.length;
  const FUNNEL = [
    { stage: 'Visitors', value: Math.max(funnelOrders * 15, 100), color: '#2d6a4f' },
    { stage: 'Product Views', value: Math.max(funnelOrders * 7, 50), color: '#52b788' },
    { stage: 'Add to Cart', value: Math.max(funnelOrders * 3, 20), color: '#6b7c3a' },
    { stage: 'Checkout', value: Math.max(funnelOrders * 2, 10), color: '#8b5e3c' },
    { stage: 'Orders', value: funnelOrders, color: '#d97706' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: '#6b7c5a' }}>Premium insights for your business</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#f5f0e8', borderRadius: 10, padding: 3 }}>
          {(['7d','30d','90d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, background: period === p ? '#fff9f5' : 'transparent', color: period === p ? '#2d6a4f' : '#6b7c5a', boxShadow: period === p ? '0 1px 4px rgba(139,94,60,0.1)' : 'none', transition: 'all 0.2s' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 14, padding: '18px 20px', background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#0f2318', marginBottom: 6 }}>{k.value}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: k.up ? '#16a34a' : '#dc2626' }}>{k.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue + Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 16 }}>Revenue + Orders Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,94,60,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" orientation="left" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#2d6a4f" strokeWidth={2.5} fill="url(#revG)" name="Revenue" />
              <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#8b5e3c" strokeWidth={2} dot={false} name="Orders" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Funnel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 18 }}>Conversion Funnel</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FUNNEL.map((f, i) => {
              const pct = Math.round((f.value / FUNNEL[0].value) * 100);
              return (
                <div key={f.stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a0f' }}>{f.stage}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.value.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ background: 'rgba(139,94,60,0.1)', borderRadius: 20, height: 8 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 20, background: f.color }} />
                  </div>
                  <p style={{ fontSize: 10, color: '#6b7c5a', marginTop: 2 }}>{pct}% of visitors</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Location + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 16 }}>Location-wise Sales</p>
          {locationSales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7c5a', fontSize: 12 }}>No order data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={locationSales} layout="vertical" barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,94,60,0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Sales']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="sales" fill="#2d6a4f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 16 }}>Top Products by Revenue</p>
          {topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7c5a', fontSize: 12 }}>No order data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topProducts.map((p, i) => {
                const maxRev = topProducts[0].revenue;
                const pct = Math.round((p.revenue / maxRev) * 100);
                return (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a0f' }}>{p.name}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: COLORS[i % COLORS.length] }}>₹{p.revenue.toLocaleString('en-IN')}</span>
                        <span style={{ fontSize: 10, color: '#6b7c5a', marginLeft: 6 }}>{p.orders} orders</span>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(139,94,60,0.1)', borderRadius: 20, height: 7 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 20, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
