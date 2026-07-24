import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Package, TrendingDown, Plus, Search,
  ArrowUpRight, Edit2, Trash2, X, Save, RefreshCw, Loader,
} from 'lucide-react';
import { products as PRODUCTS_DATA } from '@/data/products';

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

// ─── Simplified Edit Modal (stocks + alert only) ───────────────────────────
function EditStockModal({ item, onSave, onClose }: { item: StockItem; onSave: (item: StockItem) => Promise<void>; onClose: () => void }) {
  const [stock, setStock] = useState(item.stock);
  const [threshold, setThreshold] = useState(item.threshold);
  const [addQty, setAddQty] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ ...item, stock: stock + addQty, threshold });
    setSaving(false);
    onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)' }}>Edit Stock</p>
            <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginTop: 2 }}>{item.productName} · {item.size || item.sku}</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
        </div>

        {/* Quick adjustment */}
        <div style={{ background: 'rgba(45,106,79,0.08)', borderRadius: 14, padding: '16px 18px', marginBottom: 20, border: '1px solid rgba(45,106,79,0.15)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#2d6a4f', marginBottom: 10 }}>Quick Stock Adjustment</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--adm-text)', minWidth: 70 }}>
              {stock + addQty} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--adm-text2)' }}>units</span>
            </p>
            <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[-20, -10, -5, +5, +10, +20, +50].map(v => (
                <button key={v} onClick={() => setAddQty(prev => Math.max(-stock, prev + v))}
                  style={{ flex: 1, minWidth: 36, padding: '6px 2px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: v > 0 ? '#d1fae5' : '#fee2e2', color: v > 0 ? '#2d6a4f' : '#dc2626' }}>
                  {v > 0 ? `+${v}` : v}
                </button>
              ))}
            </div>
          </div>
          {addQty !== 0 && (
            <p style={{ fontSize: 11, color: addQty > 0 ? '#2d6a4f' : '#dc2626', marginTop: 8, fontWeight: 600 }}>
              {addQty > 0 ? `Adding ${addQty} units` : `Removing ${Math.abs(addQty)} units`} · New total: {stock + addQty}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Stock</label>
            <input type="number" value={stock}
              onChange={e => setStock(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Low Stock Alert At</label>
            <input type="number" value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
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

// ─── Delete Confirmation Modal ─────────────────────────────────────────────
function DeleteConfirmModal({ item, onConfirm, onClose }: { item: StockItem; onConfirm: () => void; onClose: () => void }) {
  const effectiveSize = item.size || item.sku.replace(/^P\d+-/, '');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 20, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Trash2 size={22} color="#dc2626" />
        </div>
        <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 8 }}>Delete this item?</p>
        <p style={{ fontSize: 13, color: 'var(--adm-text2)', marginBottom: 24, lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--adm-text)' }}>{item.productName} {effectiveSize}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
            Yes, Delete
          </button>
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
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<StockItem | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

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

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/sync`, { method: 'POST', headers });
      const data = await res.json() as { success: boolean; added?: number; skipped?: number; message?: string };
      if (data.success) {
        setSyncMsg(`✓ Synced — ${data.added} SKU(s) added, ${data.skipped} already present`);
        await fetchInventory();
      } else {
        setSyncMsg(`✗ Sync failed: ${data.message ?? 'unknown error'}`);
      }
    } catch {
      setSyncMsg('✗ Sync failed — network error');
    }
    setSyncing(false);
  }

  async function handleSave(updated: StockItem) {
    const { id, ...rest } = updated;
    await fetch(`${API_BASE}/admin/inventory/${id}`, {
      method: 'PATCH', headers, body: JSON.stringify(rest),
    });
    setStock(prev => prev.map(i => i.id === id ? updated : i));
  }

  async function handleDelete(id: string) {
    await fetch(`${API_BASE}/admin/inventory/${id}`, { method: 'DELETE', headers });
    setStock(prev => prev.filter(i => i.id !== id));
    setDeleteItem(null);
  }

  const filtered = stock.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.productName.toLowerCase().includes(q) || (item.sku || '').toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'low' ? (item.stock > 0 && item.stock <= item.threshold) :
      item.stock === 0;
    return matchSearch && matchFilter;
  });

  const outOfStock = stock.filter(i => i.stock === 0).length;
  const lowStock   = stock.filter(i => i.stock > 0 && i.stock <= i.threshold).length;

  const summaryCards = [
    { label: 'Total SKUs',   value: stock.length, color: '#2d6a4f', bg: '#d1fae5', f: 'all' as const },
    { label: 'Out of Stock', value: outOfStock,    color: '#dc2626', bg: '#fee2e2', f: 'out' as const },
    { label: 'Low Stock',    value: lowStock,      color: '#d97706', bg: '#fef3c7', f: 'low' as const },
  ];

  return (
    <div>
      <AnimatePresence>
        {editItem   && <EditStockModal    item={editItem}   onSave={handleSave}             onClose={() => setEditItem(null)} />}
        {deleteItem && <DeleteConfirmModal item={deleteItem} onConfirm={() => handleDelete(deleteItem.id)} onClose={() => setDeleteItem(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Inventory</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>Live stock levels — {stock.length} SKUs</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSync} disabled={syncing || loading}
              title="Add any missing inventory SKUs without changing existing stock"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1.5px solid #2d6a4f', background: '#d1fae5', color: '#2d6a4f', fontSize: 13, fontWeight: 600, cursor: (syncing || loading) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (syncing || loading) ? 0.6 : 1 }}>
              <ArrowUpRight size={14} style={syncing ? { animation: 'spin 0.7s linear infinite' } : {}} />
              {syncing ? 'Syncing…' : 'Sync SKUs'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={fetchInventory} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'var(--adm-card)', color: 'var(--adm-text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              <RefreshCw size={14} style={loading ? { animation: 'spin 0.7s linear infinite' } : {}} /> Refresh
            </motion.button>
          </div>
          {syncMsg && (
            <p style={{ fontSize: 11, color: syncMsg.startsWith('✓') ? '#2d6a4f' : '#dc2626', fontWeight: 600 }}>{syncMsg}</p>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => setFilter(c.f)}
            style={{ borderRadius: 14, padding: '16px 18px', background: 'var(--adm-card)', border: `1.5px solid ${filter === c.f ? c.color : 'var(--adm-border)'}`, cursor: 'pointer', transition: 'border-color 0.2s', boxShadow: '0 2px 8px var(--adm-shadow)' }}
            whileHover={{ y: -2 }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: c.color, marginBottom: 4 }}>{loading ? '—' : c.value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product or SKU…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
        </div>
        {(['all', 'low', 'out'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? '#2d6a4f' : 'var(--adm-border)'}`, background: filter === f ? '#d1fae5' : 'var(--adm-card)', color: filter === f ? '#2d6a4f' : 'var(--adm-text2)' }}>
            {f === 'all' ? 'All Items' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--adm-text2)' }}>
          <Loader size={28} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 0.7s linear infinite', opacity: 0.4 }} />
          <p style={{ fontSize: 13 }}>Loading inventory…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--adm-card)', borderRadius: 18, border: '1px solid var(--adm-border)' }}>
          <Package size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--adm-text)' }}>No items match your filter</p>
        </div>
      ) : (
        <div style={{ background: 'var(--adm-card)', borderRadius: 16, border: '1.5px solid var(--adm-border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--adm-thead)', borderBottom: '1.5px solid var(--adm-border)' }}>
                {['Image', 'Product / Size', 'Stock', 'Alert At', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const isOut = item.stock === 0;
                const isLow = !isOut && item.stock <= item.threshold;
                const effectiveSize = item.size || (item.sku ? item.sku.replace(/^P\d+-/, '') : '');
                const matchedProduct = PRODUCTS_DATA.find(p =>
                  p.name.toLowerCase().includes(item.productName.toLowerCase()) ||
                  item.productName.toLowerCase().includes(p.name.toLowerCase())
                );
                const alertColor = isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a';
                const alertBg   = isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7';
                const statusLabel = isOut ? 'Out of Stock' : isLow ? 'Alert' : 'OK';

                return (
                  <motion.tr key={item.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--adm-border)' : 'none', background: isOut ? 'rgba(220,38,38,0.02)' : isLow ? 'rgba(217,119,6,0.02)' : 'transparent' }}>
                    {/* Image */}
                    <td style={{ padding: '12px 16px' }}>
                      {matchedProduct ? (
                        <img src={matchedProduct.image} alt={item.productName}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--adm-border)', display: 'block' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--adm-thead)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1.5px solid var(--adm-border)' }}>🥒</div>
                      )}
                    </td>

                    {/* Product / Size */}
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 4 }}>{item.productName}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', color: '#6366f1', fontFamily: 'monospace' }}>{effectiveSize}</span>
                    </td>

                    {/* Stock */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: alertColor }}>{item.stock}</span>
                      <span style={{ fontSize: 11, color: 'var(--adm-text2)', marginLeft: 4 }}>units</span>
                    </td>

                    {/* Alert At */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <AlertTriangle size={12} color="var(--adm-text2)" />
                        <span style={{ fontSize: 13, color: 'var(--adm-text2)', fontWeight: 600 }}>{item.threshold}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: alertBg, color: alertColor, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                          onClick={() => setEditItem(item)} title="Edit stock"
                          style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'rgba(45,106,79,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d6a4f' }}>
                          <Edit2 size={14} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                          onClick={() => setDeleteItem(item)} title="Delete"
                          style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
