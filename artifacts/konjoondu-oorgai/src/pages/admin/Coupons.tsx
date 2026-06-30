import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Copy, Trash2, Check, Calendar, Users, ShoppingBag } from 'lucide-react';

const MOCK_COUPONS = [
  { id: 1, code: 'WELCOME20', type: 'percent', value: 20, minOrder: 300, maxUses: 100, used: 42, expiry: '2024-12-31', active: true, description: 'Welcome discount for new customers' },
  { id: 2, code: 'FLAT50', type: 'flat', value: 50, minOrder: 500, maxUses: 200, used: 187, expiry: '2024-07-31', active: true, description: 'Flat ₹50 off on orders above ₹500' },
  { id: 3, code: 'PRAWN15', type: 'percent', value: 15, minOrder: 0, maxUses: 50, used: 50, expiry: '2024-06-30', active: false, description: 'Prawn Pickle launch offer — expired' },
  { id: 4, code: 'BULK100', type: 'flat', value: 100, minOrder: 1000, maxUses: 500, used: 23, expiry: '2024-12-31', active: true, description: 'Bulk order discount ₹100 off' },
  { id: 5, code: 'FISH25', type: 'percent', value: 25, minOrder: 400, maxUses: 30, used: 12, expiry: '2024-08-15', active: true, description: 'Seafood special 25% off' },
];

const [copiedId, setCopiedId] = [null as number | null, (_: number | null) => {}];

export default function Coupons() {
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [copied, setCopied] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', description: '' });

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleToggle = (id: number) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDelete = (id: number) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Coupons</h1>
          <p style={{ fontSize: 13, color: '#6b7c5a' }}>{coupons.filter(c => c.active).length} active · {coupons.length} total</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
          <Plus size={15} /> Create Coupon
        </motion.button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Active Coupons', value: coupons.filter(c => c.active).length, color: '#2d6a4f', bg: '#d1fae5', icon: Tag },
          { label: 'Total Uses', value: coupons.reduce((s, c) => s + c.used, 0), color: '#6366f1', bg: '#e0e7ff', icon: Users },
          { label: 'Discount Given', value: `₹${(coupons.reduce((s, c) => s + c.used * (c.type === 'flat' ? c.value : 400 * c.value / 100), 0)).toLocaleString('en-IN')}`, color: '#d97706', bg: '#fef3c7', icon: ShoppingBag },
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

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ borderRadius: 18, background: '#fff9f5', border: '1.5px solid rgba(45,106,79,0.2)', padding: 24, boxShadow: '0 4px 16px rgba(45,106,79,0.1)' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 18 }}>Create New Coupon</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                {[
                  { label: 'Coupon Code', key: 'code', placeholder: 'e.g. SAVE20', type: 'text' },
                  { label: 'Discount Value', key: 'value', placeholder: '20 (% or ₹)', type: 'number' },
                  { label: 'Min Order (₹)', key: 'minOrder', placeholder: '0 for no minimum', type: 'number' },
                  { label: 'Max Uses', key: 'maxUses', placeholder: '100', type: 'number' },
                  { label: 'Expiry Date', key: 'expiry', placeholder: '', type: 'date' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7c5a', display: 'block', marginBottom: 6 }}>{field.label}</label>
                    <input type={field.type} placeholder={field.placeholder}
                      value={(form as any)[field.key]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', color: '#1a1a0f' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7c5a', display: 'block', marginBottom: 6 }}>Type</label>
                  <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', color: '#1a1a0f' }}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!form.code || !form.value) return;
                    setCoupons(prev => [...prev, { id: Date.now(), code: form.code.toUpperCase(), type: form.type as 'percent' | 'flat', value: Number(form.value), minOrder: Number(form.minOrder) || 0, maxUses: Number(form.maxUses) || 100, used: 0, expiry: form.expiry || '2024-12-31', active: true, description: form.description || '' }]);
                    setForm({ code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', description: '' });
                    setShowForm(false);
                  }}
                  style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
                  Create Coupon
                </motion.button>
                <button onClick={() => setShowForm(false)} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', cursor: 'pointer', background: 'transparent', color: '#6b7c5a', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupon cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {coupons.map((c, i) => {
            const usedPct = Math.min(100, Math.round((c.used / c.maxUses) * 100));
            const isExpired = new Date(c.expiry) < new Date();
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.04 }}
                style={{ borderRadius: 16, background: '#fff9f5', border: `1.5px solid ${c.active && !isExpired ? 'rgba(45,106,79,0.2)' : 'rgba(139,94,60,0.1)'}`, padding: '18px 22px', boxShadow: '0 1px 6px rgba(139,94,60,0.05)', opacity: c.active && !isExpired ? 1 : 0.65 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ background: 'rgba(45,106,79,0.08)', borderRadius: 12, padding: '10px 18px', border: '1.5px dashed rgba(45,106,79,0.3)' }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#2d6a4f', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{c.code}</p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: '#0f2318' }}>
                          {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                        </p>
                        {isExpired && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>EXPIRED</span>}
                        {!isExpired && !c.active && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280' }}>INACTIVE</span>}
                      </div>
                      <p style={{ fontSize: 12, color: '#6b7c5a' }}>{c.description}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                        {c.minOrder > 0 && <span style={{ fontSize: 11, color: '#4a5568' }}>Min: ₹{c.minOrder}</span>}
                        <span style={{ fontSize: 11, color: '#4a5568', display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} />{new Date(c.expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Toggle */}
                    <button onClick={() => handleToggle(c.id)}
                      style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: c.active ? '#2d6a4f' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: c.active ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleCopy(c.id, c.code)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: copied === c.id ? '#dcfce7' : 'rgba(99,102,241,0.1)', color: copied === c.id ? '#16a34a' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {copied === c.id ? <Check size={13} /> : <Copy size={13} />}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(c.id)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={13} />
                    </motion.button>
                  </div>
                </div>
                {/* Usage bar */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#6b7c5a' }}>{c.used} / {c.maxUses} uses</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: usedPct >= 90 ? '#dc2626' : '#2d6a4f' }}>{usedPct}%</span>
                  </div>
                  <div style={{ background: 'rgba(139,94,60,0.1)', borderRadius: 20, height: 6 }}>
                    <div style={{ width: `${usedPct}%`, height: '100%', borderRadius: 20, background: usedPct >= 90 ? '#dc2626' : '#2d6a4f', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
