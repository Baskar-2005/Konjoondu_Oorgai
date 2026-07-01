import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Package, TrendingDown, Plus, Search,
  ArrowUpRight, Edit2, X, Save, RefreshCw, Loader,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

interface StockItem {
  id: string;
  productName: string;
  sku: string;
  size: string;
  batch: string;
  stock: number;
  threshold: number;
  incoming: number;
  expiry: string;
  supplier: string;
  cost: number;
}

interface Props { token: string }

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditStockModal({ item, onSave, onClose }: { item: StockItem; onSave: (item: StockItem) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({ ...item });
  const [addQty, setAddQty] = useState(0);
  const [saving, setSaving] = useState(false);

  const field = (label: string, key: keyof StockItem, type = 'text') => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input type={type} value={(form as Record<string, unknown>)[key] as string | number}
        onChange={e => setForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
    </div>
  );

  async function handleSave() {
    setSaving(true);
    await onSave({ ...form, stock: form.stock + addQty });
    setSaving(false);
    onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 520, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)' }}>Edit Stock</p>
            <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginTop: 2 }}>
              {item.productName} · {item.size}
              {item.sku && <> · <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>{item.sku}</span></>}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
        </div>

        {/* Quick stock adjust */}
        <div style={{ background: 'rgba(45,106,79,0.08)', borderRadius: 14, padding: '16px 18px', marginBottom: 20, border: '1px solid rgba(45,106,79,0.15)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#2d6a4f', marginBottom: 10 }}>Quick Stock Adjustment</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--adm-text)', minWidth: 60 }}>
              {form.stock + addQty} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-text2)' }}>units</span>
            </p>
            <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[-20, -10, -5, +5, +10, +20, +50].map(v => (
                <button key={v} onClick={() => setAddQty(prev => Math.max(-form.stock, prev + v))}
                  style={{ flex: 1, minWidth: 36, padding: '6px 2px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: v > 0 ? '#d1fae5' : '#fee2e2', color: v > 0 ? '#2d6a4f' : '#dc2626' }}>
                  {v > 0 ? `+${v}` : v}
                </button>
              ))}
            </div>
          </div>
          {addQty !== 0 && (
            <p style={{ fontSize: 11, color: addQty > 0 ? '#2d6a4f' : '#dc2626', marginTop: 8, fontWeight: 600 }}>
              {addQty > 0 ? `Adding ${addQty} units` : `Removing ${Math.abs(addQty)} units`} · New total: {form.stock + addQty}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          {field('Current Stock', 'stock', 'number')}
          {field('Low Stock Threshold', 'threshold', 'number')}
          {field('Incoming Stock', 'incoming', 'number')}
          {field('Cost / Unit (₹)', 'cost', 'number')}
          {field('Batch Number', 'batch')}
          {field('Expiry Date', 'expiry', 'date')}
          <div style={{ gridColumn: '1 / -1' }}>{field('Supplier', 'supplier')}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)', opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Stock'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────
function AddStockModal({ onAdd, onClose }: { onAdd: (item: Omit<StockItem, 'id'>) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({ productName: '', sku: '', size: '', batch: '', stock: 0, threshold: 10, incoming: 0, expiry: '', supplier: '', cost: 0 });
  const [saving, setSaving] = useState(false);

  const field = (label: string, key: string, type = 'text', ph = '') => (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input type={type} placeholder={ph} value={(form as Record<string, unknown>)[key] as string | number}
        onChange={e => setForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
    </div>
  );

  async function handleAdd() {
    if (!form.productName) return;
    setSaving(true);
    await onAdd(form);
    setSaving(false);
    onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 540, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)' }}>Add Stock Entry</p>
          <button onClick={onClose} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ gridColumn: '1 / -1' }}>{field('Product Name *', 'productName', 'text', 'e.g. Prawn Pickle')}</div>
          {field('SKU', 'sku', 'text', 'e.g. KO-PP-250')}
          {field('Size', 'size', 'text', 'e.g. 250g')}
          {field('Initial Stock', 'stock', 'number')}
          {field('Low Stock Alert At', 'threshold', 'number')}
          {field('Incoming (PO)', 'incoming', 'number')}
          {field('Cost / Unit (₹)', 'cost', 'number')}
          {field('Batch Number', 'batch', 'text', 'e.g. B2407A')}
          {field('Expiry Date', 'expiry', 'date')}
          <div style={{ gridColumn: '1 / -1' }}>{field('Supplier', 'supplier', 'text', 'e.g. Fresh Catch Co.')}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleAdd} disabled={saving || !form.productName}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: saving || !form.productName ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)', opacity: saving || !form.productName ? 0.6 : 1 }}>
            {saving ? <Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Plus size={14} />}
            {saving ? 'Adding…' : 'Add Entry'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Inventory({ token }: Props) {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out' | 'incoming'>('all');
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const headers = { 'x-admin-token': token, 'Content-Type': 'application/json' };

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/inventory`, { headers });
      const data = await res.json();
      if (data.success) setStock(data.inventory as StockItem[]);
    } catch { /* silent */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  async function handleSave(updated: StockItem) {
    const { id, ...rest } = updated;
    await fetch(`${API_BASE}/admin/inventory/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(rest),
    });
    setStock(prev => prev.map(i => i.id === id ? updated : i));
  }

  async function handleAdd(item: Omit<StockItem, 'id'>) {
    const res = await fetch(`${API_BASE}/admin/inventory`, {
      method: 'POST',
      headers,
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (data.success) {
      setStock(prev => [...prev, { ...item, id: data.id as string }]);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`${API_BASE}/admin/inventory/${id}`, { method: 'DELETE', headers });
    setStock(prev => prev.filter(i => i.id !== id));
  }

  const filtered = stock.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.productName.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'low' ? (item.stock > 0 && item.stock <= item.threshold) :
      filter === 'out' ? item.stock === 0 :
      filter === 'incoming' ? item.incoming > 0 : true;
    return matchSearch && matchFilter;
  });

  const outOfStock = stock.filter(i => i.stock === 0).length;
  const lowStock = stock.filter(i => i.stock > 0 && i.stock <= i.threshold).length;
  const incomingItems = stock.filter(i => i.incoming > 0).length;
  const totalValue = stock.reduce((s, i) => s + i.stock * i.cost, 0);

  const summaryCards = [
    { label: 'Total SKUs', value: stock.length, icon: Package, color: '#2d6a4f', bg: '#d1fae5', f: 'all' as const },
    { label: 'Out of Stock', value: outOfStock, icon: TrendingDown, color: '#dc2626', bg: '#fee2e2', f: 'out' as const },
    { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: '#d97706', bg: '#fef3c7', f: 'low' as const },
    { label: 'Incoming POs', value: incomingItems, icon: ArrowUpRight, color: '#6366f1', bg: '#e0e7ff', f: 'incoming' as const },
  ];

  return (
    <div>
      <AnimatePresence>
        {editItem && <EditStockModal item={editItem} onSave={handleSave} onClose={() => setEditItem(null)} />}
        {showAdd && <AddStockModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Inventory</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>
            Live stock · Inventory value{' '}
            <strong style={{ color: '#2d6a4f' }}>₹{totalValue.toLocaleString('en-IN')}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={fetchInventory} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'var(--adm-card)', color: 'var(--adm-text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 0.7s linear infinite' } : {}} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
            <Plus size={15} /> Add Stock Entry
          </motion.button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => setFilter(c.f)}
            style={{ borderRadius: 14, padding: '16px 18px', background: 'var(--adm-card)', border: `1.5px solid ${filter === c.f ? c.color : 'var(--adm-border)'}`, boxShadow: '0 2px 8px var(--adm-shadow)', cursor: 'pointer', transition: 'border-color 0.2s' }}
            whileHover={{ y: -2 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <c.icon size={17} color={c.color} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: c.color, marginBottom: 4 }}>{loading ? '—' : c.value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product, SKU, or supplier…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
        </div>
        {(['all', 'low', 'out', 'incoming'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? '#2d6a4f' : 'var(--adm-border)'}`, background: filter === f ? '#d1fae5' : 'var(--adm-card)', color: filter === f ? '#2d6a4f' : 'var(--adm-text2)' }}>
            {f === 'all' ? 'All Items' : f === 'low' ? 'Low Stock' : f === 'out' ? 'Out of Stock' : 'Incoming'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--adm-text2)' }}>
          <Loader size={28} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 0.7s linear infinite', opacity: 0.4 }} />
          <p style={{ fontSize: 13 }}>Loading inventory from Firestore…</p>
        </div>
      ) : (
        <div style={{ borderRadius: 18, background: 'var(--adm-card)', border: '1px solid var(--adm-border)', overflow: 'hidden', boxShadow: '0 2px 8px var(--adm-shadow)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--adm-border)', background: 'var(--adm-thead)' }}>
                  {['Product', 'SKU', 'Batch', 'Stock', 'Threshold', 'Incoming', 'Expiry', 'Supplier', 'Cost/Unit', 'Stock Value', 'Alert', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--adm-text2)' }}>
                      <Package size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.2 }} />
                      <p style={{ fontSize: 13 }}>No items match your filter</p>
                    </td>
                  </tr>
                ) : filtered.map((item, i) => {
                  const isOut = item.stock === 0;
                  const isLow = !isOut && item.stock <= item.threshold;
                  const isExpiringSoon = item.expiry ? new Date(item.expiry) < new Date(Date.now() + 60 * 86400000) : false;
                  return (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: '1px solid var(--adm-border)', background: isOut ? 'rgba(220,38,38,0.04)' : isLow ? 'rgba(217,119,6,0.04)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--adm-text)', whiteSpace: 'nowrap' }}>
                        {item.productName} <span style={{ color: 'var(--adm-text2)', fontWeight: 400 }}>({item.size})</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: '#6366f1' }}>{item.sku || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--adm-text2)' }}>{item.batch || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#2d6a4f' }}>{item.stock}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--adm-text2)' }}>{item.threshold}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {item.incoming > 0
                          ? <span style={{ color: '#6366f1', fontWeight: 700 }}>+{item.incoming}</span>
                          : <span style={{ color: 'var(--adm-border2)' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {item.expiry
                          ? <span style={{ fontSize: 11, color: isExpiringSoon ? '#dc2626' : 'var(--adm-text3)', fontWeight: isExpiringSoon ? 700 : 400 }}>
                              {new Date(item.expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </span>
                          : <span style={{ color: 'var(--adm-border2)' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--adm-text3)' }}>{item.supplier || '—'}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--adm-text)' }}>
                        {item.cost > 0 ? `₹${item.cost}` : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2d6a4f' }}>
                        {item.cost > 0 ? `₹${(item.stock * item.cost).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {isOut
                          ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>OUT</span>
                          : isLow
                          ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>LOW</span>
                          : isExpiringSoon
                          ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>EXPIRING</span>
                          : <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#dcfce7', color: '#16a34a' }}>OK</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditItem(item)}
                            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(45,106,79,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d6a4f' }}>
                            <Edit2 size={12} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(item.id)}
                            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                            <X size={12} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
