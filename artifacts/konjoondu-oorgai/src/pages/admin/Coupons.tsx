import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Copy, Trash2, Check, Calendar, Users, ShoppingBag, Edit2, X, RefreshCw, Save, Clock } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  maxUses: number;
  used: number;
  expiry: string;
  active: boolean;
  description: string;
  maxDiscount?: number;
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

interface CouponFormProps {
  initial?: Coupon;
  onSave: (c: Omit<Coupon, 'id' | 'used'>) => void;
  onClose: () => void;
  title: string;
}
function CouponForm({ initial, onSave, onClose, title }: CouponFormProps) {
  const [form, setForm] = useState({
    code: initial?.code || '',
    type: initial?.type || 'percent',
    value: initial?.value?.toString() || '',
    minOrder: initial?.minOrder?.toString() || '0',
    maxUses: initial?.maxUses?.toString() || '100',
    expiry: initial?.expiry || '',
    description: initial?.description || '',
    active: initial?.active ?? true,
    maxDiscount: initial?.maxDiscount?.toString() || '',
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 560, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)' }}>{title}</p>
          <button onClick={onClose} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coupon Code</label>
            <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 15, fontWeight: 700, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: 'var(--adm-input-bg)', color: '#2d6a4f', letterSpacing: '0.1em' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Discount Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }}>
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Discount Value</label>
            <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder={form.type === 'percent' ? '20 (%)' : '50 (₹)'}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
          {form.type === 'percent' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max Discount (₹)</label>
              <input type="number" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))} placeholder="Leave blank for no cap"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Min Order (₹)</label>
            <input type="number" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max Uses</label>
            <input type="number" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expiry Date</label>
            <input type="date" value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Welcome discount for new customers"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--adm-text2)' }}>Status:</span>
            <button onClick={() => setForm(p => ({ ...p, active: !p.active }))}
              style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: form.active ? '#2d6a4f' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.active ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 600, color: form.active ? '#2d6a4f' : '#6b7280' }}>{form.active ? 'Active' : 'Inactive'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: `1.5px solid var(--adm-border)`, background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!form.code || !form.value) return;
                onSave({ code: form.code, type: form.type, value: Number(form.value), minOrder: Number(form.minOrder) || 0, maxUses: Number(form.maxUses) || 100, expiry: form.expiry || '2026-12-31', active: form.active, description: form.description || '', ...(form.maxDiscount ? { maxDiscount: Number(form.maxDiscount) } : {}) });
                onClose();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
              <Save size={14} /> {initial ? 'Save Changes' : 'Create Coupon'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExtendModal({ coupon, onExtend, onClose }: { coupon: Coupon; onExtend: (id: string, expiry: string) => void; onClose: () => void }) {
  const [days, setDays] = useState(30);
  const newDate = new Date(Math.max(new Date(coupon.expiry).getTime(), Date.now()) + days * 86400000).toISOString().split('T')[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 20, padding: 28, maxWidth: 360, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Extend Coupon</p>
        <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginBottom: 20 }}>{coupon.code} · Current expiry: {new Date(coupon.expiry).toLocaleDateString('en-IN')}</p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Extend by (days)</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[7, 14, 30, 60, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1.5px solid ${days === d ? '#2d6a4f' : 'var(--adm-border)'}`, background: days === d ? '#d1fae5' : 'transparent', color: days === d ? '#2d6a4f' : 'var(--adm-text2)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                {d}d
              </button>
            ))}
          </div>
          <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min={1}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
        </div>
        <div style={{ background: 'rgba(45,106,79,0.08)', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: 'var(--adm-text2)' }}>New expiry: <strong style={{ color: '#2d6a4f' }}>{new Date(newDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 10, border: `1.5px solid var(--adm-border)`, background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onExtend(coupon.id, newDate); onClose(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            <Clock size={14} /> Extend
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Coupons({ token, onRefresh: _onRefresh }: { token: string; onRefresh?: () => void }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [extendCoupon, setExtendCoupon] = useState<Coupon | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/admin/coupons`, {
        headers: { 'x-admin-token': token },
      });
      const d = await res.json();
      if (d.success) setCoupons(d.coupons);
      else setError(d.message || 'Failed to load coupons.');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleToggle = async (id: string) => {
    const c = coupons.find(x => x.id === id);
    if (!c) return;
    try {
      await fetch(`${API_BASE}/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ active: !c.active }),
      });
      setCoupons(prev => prev.map(x => x.id === id ? { ...x, active: !x.active } : x));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      setCoupons(prev => prev.filter(x => x.id !== id));
    } catch { /* silent */ }
  };

  const handleCreate = async (data: Omit<Coupon, 'id' | 'used'>) => {
    try {
      const res = await fetch(`${API_BASE}/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (d.success) setCoupons(prev => [d.coupon, ...prev]);
      else alert(d.message || 'Failed to create coupon.');
    } catch { /* silent */ }
  };

  const handleEdit = async (data: Omit<Coupon, 'id' | 'used'>) => {
    if (!editCoupon) return;
    try {
      await fetch(`${API_BASE}/admin/coupons/${editCoupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(data),
      });
      setCoupons(prev => prev.map(c => c.id === editCoupon.id ? { ...c, ...data } : c));
    } catch { /* silent */ }
  };

  const handleExtend = async (id: string, expiry: string) => {
    try {
      await fetch(`${API_BASE}/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ expiry, active: true }),
      });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, expiry, active: true } : c));
    } catch { /* silent */ }
  };

  const totalUses = coupons.reduce((s, c) => s + c.used, 0);

  return (
    <div>
      <AnimatePresence>
        {showCreate && <CouponForm title="Create Coupon" onSave={handleCreate} onClose={() => setShowCreate(false)} />}
        {editCoupon && <CouponForm title="Edit Coupon" initial={editCoupon} onSave={handleEdit} onClose={() => setEditCoupon(null)} />}
        {extendCoupon && <ExtendModal coupon={extendCoupon} onExtend={handleExtend} onClose={() => setExtendCoupon(null)} />}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Coupons</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>{coupons.filter(c => c.active).length} active · {coupons.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchCoupons} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
            <Plus size={15} /> Create Coupon
          </motion.button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Active Coupons', value: coupons.filter(c => c.active && new Date(c.expiry) >= new Date()).length, color: '#2d6a4f', bg: '#d1fae5', icon: Tag },
          { label: 'Expired', value: coupons.filter(c => new Date(c.expiry) < new Date()).length, color: '#dc2626', bg: '#fee2e2', icon: Clock },
          { label: 'Total Uses', value: totalUses, color: '#6366f1', bg: '#e0e7ff', icon: Users },
          { label: 'Discount Given', value: `₹${coupons.reduce((s, c) => s + c.used * (c.type === 'flat' ? c.value : Math.min(400 * c.value / 100, c.maxDiscount || Infinity)), 0).toLocaleString('en-IN')}`, color: '#d97706', bg: '#fef3c7', icon: ShoppingBag },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 14, padding: '16px 18px', background: 'var(--adm-card)', border: `1px solid var(--adm-border)`, boxShadow: '0 2px 8px var(--adm-shadow)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <c.icon size={17} color={c.color} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 120, borderRadius: 18, background: 'var(--adm-border)', opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.2}}`}</style>
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#dc2626' }}>
          <p style={{ fontSize: 14, fontWeight: 700 }}>{error}</p>
          <button onClick={fetchCoupons} style={{ marginTop: 12, padding: '9px 18px', borderRadius: 10, border: '1.5px solid #dc2626', background: 'transparent', color: '#dc2626', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Retry</button>
        </div>
      )}

      {!loading && !error && coupons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--adm-text2)' }}>
          <Tag size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 700 }}>No coupons yet</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Create your first coupon to offer discounts to customers.</p>
        </div>
      )}

      {/* Coupon cards */}
      {!loading && !error && coupons.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {coupons.map((c, i) => {
              const usedPct = Math.min(100, Math.round((c.used / c.maxUses) * 100));
              const isExpired = new Date(c.expiry) < new Date();
              const daysLeft = Math.ceil((new Date(c.expiry).getTime() - Date.now()) / 86400000);
              const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} transition={{ delay: i * 0.03 }}
                  style={{ borderRadius: 18, background: 'var(--adm-card)', border: `1.5px solid var(--adm-border)`, padding: '20px 24px', boxShadow: '0 1px 6px var(--adm-shadow)', opacity: c.active && !isExpired ? 1 : 0.7, transition: 'opacity 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ background: 'rgba(45,106,79,0.08)', borderRadius: 12, padding: '10px 18px', border: '1.5px dashed rgba(45,106,79,0.3)' }}>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#2d6a4f', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{c.code}</p>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--adm-text)' }}>
                            {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                            {c.maxDiscount ? <span style={{ fontSize: 11, color: 'var(--adm-text2)', fontWeight: 400, marginLeft: 6 }}>(max ₹{c.maxDiscount})</span> : null}
                          </p>
                          {isExpired && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>EXPIRED</span>}
                          {isExpiringSoon && !isExpired && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>EXPIRES IN {daysLeft}D</span>}
                          {!isExpired && !c.active && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(107,114,128,0.12)', color: '#6b7280' }}>INACTIVE</span>}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginBottom: 4 }}>{c.description}</p>
                        <div style={{ display: 'flex', gap: 12 }}>
                          {c.minOrder > 0 && <span style={{ fontSize: 11, color: 'var(--adm-text3)' }}>Min: ₹{c.minOrder}</span>}
                          <span style={{ fontSize: 11, color: 'var(--adm-text3)', display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} />{new Date(c.expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Extend */}
                      <motion.button whileHover={{ scale: 1.08 }} onClick={() => setExtendCoupon(c)}
                        title="Extend expiry"
                        style={{ padding: '6px 10px', borderRadius: 8, border: `1.5px solid var(--adm-border)`, cursor: 'pointer', background: 'var(--adm-card-alt)', color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                        <Clock size={11} /> Extend
                      </motion.button>
                      {/* Edit */}
                      <motion.button whileHover={{ scale: 1.08 }} onClick={() => setEditCoupon(c)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--adm-card-alt)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={13} />
                      </motion.button>
                      {/* Toggle */}
                      <button onClick={() => handleToggle(c.id)}
                        style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: c.active ? '#2d6a4f' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: c.active ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                      </button>
                      {/* Copy */}
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleCopy(c.id, c.code)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: copied === c.id ? '#dcfce7' : 'rgba(99,102,241,0.1)', color: copied === c.id ? '#16a34a' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {copied === c.id ? <Check size={13} /> : <Copy size={13} />}
                      </motion.button>
                      {/* Delete */}
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(c.id)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </div>
                  {/* Usage bar */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--adm-text2)' }}>{c.used} / {c.maxUses} uses</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: usedPct >= 90 ? '#dc2626' : '#2d6a4f' }}>{usedPct}%</span>
                    </div>
                    <div style={{ background: 'var(--adm-border)', borderRadius: 20, height: 6 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${usedPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 20, background: usedPct >= 90 ? '#dc2626' : '#2d6a4f' }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
