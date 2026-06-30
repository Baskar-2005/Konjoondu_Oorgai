import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Star, ShoppingBag, TrendingUp, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Karthik Rajan', phone: '9876543210', email: 'karthik@example.com', address: '14, Nehru Street, Cuddalore', orders: 7, lifetime: 4820, lastOrder: '2024-06-10', tier: 'gold', notes: 'Prefers Prawn Pickle, always orders 250g' },
  { id: 2, name: 'Meena Sundaram', phone: '9444112233', email: 'meena.s@gmail.com', address: '7/3, Raja Nagar, Chidambaram', orders: 3, lifetime: 1260, lastOrder: '2024-05-28', tier: 'silver', notes: '' },
  { id: 3, name: 'Selvam Murugan', phone: '8012345678', email: '', address: '22, Fishermen Colony, Cuddalore Port', orders: 12, lifetime: 9810, lastOrder: '2024-06-18', tier: 'platinum', notes: 'High-value customer, bulk orders monthly' },
  { id: 4, name: 'Priya Anand', phone: '9500667788', email: 'priya.a@outlook.com', address: '5, Gandhi Road, Villupuram', orders: 2, lifetime: 640, lastOrder: '2024-04-15', tier: 'bronze', notes: '' },
  { id: 5, name: 'Ravi Kumar', phone: '7299001122', email: 'ravi.k@yahoo.com', address: '88, Anna Salai, Chennai', orders: 9, lifetime: 6730, lastOrder: '2024-06-20', tier: 'gold', notes: 'Loves Squid Pickle, gift buyer' },
  { id: 6, name: 'Lakshmi Devi', phone: '9988776655', email: 'lakshmi@gmail.com', address: '3, Temple Road, Kumbakonam', orders: 5, lifetime: 2980, lastOrder: '2024-06-05', tier: 'silver', notes: '' },
];

const TIER_META: Record<string, { color: string; bg: string; label: string }> = {
  bronze:   { color: '#b45309', bg: '#fef3c7', label: 'Bronze' },
  silver:   { color: '#6b7280', bg: '#f3f4f6', label: 'Silver' },
  gold:     { color: '#d97706', bg: '#fffbeb', label: 'Gold' },
  platinum: { color: '#7c3aed', bg: '#ede9fe', label: 'Platinum' },
};

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = MOCK_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const selected = MOCK_CUSTOMERS.find(c => c.id === selectedId);

  const totalCustomers = MOCK_CUSTOMERS.length;
  const totalRevenue = MOCK_CUSTOMERS.reduce((s, c) => s + c.lifetime, 0);
  const avgLTV = Math.round(totalRevenue / totalCustomers);
  const returning = MOCK_CUSTOMERS.filter(c => c.orders > 1).length;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Customers</h1>
        <p style={{ fontSize: 13, color: '#6b7c5a' }}>{totalCustomers} customers · ₹{avgLTV.toLocaleString('en-IN')} avg LTV</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Customers', value: totalCustomers, icon: Users, color: '#2d6a4f', bg: '#d1fae5' },
          { label: 'Returning', value: returning, icon: TrendingUp, color: '#6366f1', bg: '#e0e7ff' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: ShoppingBag, color: '#d97706', bg: '#fef3c7' },
          { label: 'Avg LTV', value: `₹${avgLTV.toLocaleString('en-IN')}`, icon: Star, color: '#7c3aed', bg: '#ede9fe' },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 14, padding: '16px 18px', background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <c.icon size={17} color={c.color} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1fr 360px' : '1fr', gap: 16, transition: 'grid-template-columns 0.3s' }}>
        {/* List */}
        <div>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7c5a' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
              style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff9f5', color: '#1a1a0f' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {filtered.map((c, i) => {
              const tier = TIER_META[c.tier];
              const isSelected = selectedId === c.id;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedId(isSelected ? null : c.id)}
                  whileHover={{ y: -2 }}
                  style={{
                    borderRadius: 16, padding: 18, background: '#fff9f5', cursor: 'pointer',
                    border: `1.5px solid ${isSelected ? '#2d6a4f' : 'rgba(139,94,60,0.08)'}`,
                    boxShadow: isSelected ? '0 4px 16px rgba(45,106,79,0.15)' : '0 1px 6px rgba(139,94,60,0.05)',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a0f', marginBottom: 2 }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: '#6b7c5a' }}>{c.phone}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: tier.bg, color: tier.color }}>{tier.label}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(139,94,60,0.08)' }}>
                    {[
                      { label: 'Orders', value: c.orders },
                      { label: 'Lifetime', value: `₹${c.lifetime.toLocaleString('en-IN')}` },
                      { label: 'Last Order', value: new Date(c.lastOrder).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f2318', marginBottom: 2 }}>{m.value}</p>
                        <p style={{ fontSize: 9, fontWeight: 600, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)', height: 'fit-content', position: 'sticky', top: 86 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(139,94,60,0.08)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>{selected.name[0]}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#0f2318', marginBottom: 2 }}>{selected.name}</p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: TIER_META[selected.tier].bg, color: TIER_META[selected.tier].color }}>{TIER_META[selected.tier].label}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {[
                { icon: Phone, val: selected.phone },
                ...(selected.email ? [{ icon: Mail, val: selected.email }] : []),
                { icon: MapPin, val: selected.address },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <item.icon size={13} color="#6b7c5a" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.5 }}>{item.val}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[
                { label: 'Total Orders', value: selected.orders, color: '#2d6a4f' },
                { label: 'Lifetime Value', value: `₹${selected.lifetime.toLocaleString('en-IN')}`, color: '#6366f1' },
              ].map(m => (
                <div key={m.label} style={{ background: 'rgba(45,106,79,0.05)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.value}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div style={{ background: '#fef3c7', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <MessageSquare size={13} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.4 }}>{selected.notes}</p>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[{ label: 'View Orders', bg: '#d1fae5', color: '#2d6a4f' }, { label: 'Send Message', bg: '#e0e7ff', color: '#6366f1' }, { label: 'Add Note', bg: '#fef3c7', color: '#d97706' }].map(btn => (
                <motion.button key={btn.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: btn.bg, color: btn.color, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
