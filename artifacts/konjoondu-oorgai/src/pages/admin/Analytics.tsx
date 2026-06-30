import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const MONTHLY = [
  { month: 'Jan', revenue: 18400, orders: 42, customers: 31 },
  { month: 'Feb', revenue: 24200, orders: 58, customers: 44 },
  { month: 'Mar', revenue: 31500, orders: 74, customers: 57 },
  { month: 'Apr', revenue: 28900, orders: 67, customers: 52 },
  { month: 'May', revenue: 37800, orders: 89, customers: 68 },
  { month: 'Jun', revenue: 44200, orders: 102, customers: 79 },
];

const LOCATION = [
  { city: 'Chennai', sales: 12400 },
  { city: 'Cuddalore', sales: 18700 },
  { city: 'Chidambaram', sales: 8200 },
  { city: 'Villupuram', sales: 5600 },
  { city: 'Kumbakonam', sales: 4100 },
  { city: 'Pondicherry', sales: 9800 },
];

const TOP_PRODUCTS = [
  { name: 'Prawn Pickle', revenue: 52400, orders: 124 },
  { name: 'Chicken Pickle', revenue: 38200, orders: 94 },
  { name: 'Squid Pickle', revenue: 29100, orders: 67 },
  { name: 'Mutton Pickle', revenue: 21800, orders: 49 },
];

const FUNNEL = [
  { stage: 'Visitors', value: 4800, color: '#2d6a4f' },
  { stage: 'Product Views', value: 2200, color: '#52b788' },
  { stage: 'Add to Cart', value: 840, color: '#6b7c3a' },
  { stage: 'Checkout', value: 420, color: '#8b5e3c' },
  { stage: 'Orders', value: 312, color: '#d97706' },
];

export default function Analytics() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const kpis = [
    { label: 'Total Revenue', value: '₹1,84,600', change: '+18.4%', up: true },
    { label: 'Total Orders', value: '432', change: '+12.1%', up: true },
    { label: 'Conversion Rate', value: '6.5%', change: '+0.8%', up: true },
    { label: 'Refund Rate', value: '1.2%', change: '-0.3%', up: true },
    { label: 'Avg Order Value', value: '₹427', change: '+5.6%', up: true },
    { label: 'Returning Customers', value: '38%', change: '+4.2%', up: true },
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
            <AreaChart data={MONTHLY}>
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
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={LOCATION} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,94,60,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#6b7c5a' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Sales']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="sales" fill="#2d6a4f" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 16 }}>Top Products by Revenue</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOP_PRODUCTS.map((p, i) => {
              const maxRev = TOP_PRODUCTS[0].revenue;
              const pct = Math.round((p.revenue / maxRev) * 100);
              const colors = ['#2d6a4f', '#52b788', '#6b7c3a', '#8b5e3c'];
              return (
                <div key={p.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a0f' }}>{p.name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: colors[i] }}>₹{p.revenue.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: 10, color: '#6b7c5a', marginLeft: 6 }}>{p.orders} orders</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(139,94,60,0.1)', borderRadius: 20, height: 7 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 20, background: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
