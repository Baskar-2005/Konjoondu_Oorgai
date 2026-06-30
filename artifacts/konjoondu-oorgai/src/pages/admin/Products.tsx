import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, X, Save, Star, Package, Filter, ChevronDown } from 'lucide-react';
import { products as REAL_PRODUCTS, type Product } from '@/data/products';

interface AdminProduct {
  id: number;
  name: string;
  category: string;
  image: string;
  weights: string[];
  mrp: number[];
  price: number[];
  stock: Record<string, number>;
  status: 'active' | 'inactive';
  description: string;
  spiceLevel: number;
  tag: string;
}

function buildAdminProducts(): AdminProduct[] {
  return REAL_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    image: p.image,
    weights: p.sizes.map(s => s.label),
    mrp: p.sizes.map(s => Math.round(s.price * 1.2)),
    price: p.sizes.map(s => s.price),
    stock: Object.fromEntries(p.sizes.map((s, i) => [s.label, 20 + i * 8])),
    status: 'active',
    description: p.description,
    spiceLevel: p.spiceLevel,
    tag: p.tag,
  }));
}

function SpiceIndicator({ level }: { level: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i <= level ? '#dc2626' : 'rgba(220,38,38,0.15)' }} />
      ))}
    </div>
  );
}

interface EditModalProps {
  product: AdminProduct;
  onSave: (p: AdminProduct) => void;
  onClose: () => void;
}
function EditModal({ product, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<AdminProduct>({ ...product });
  const [newWeight, setNewWeight] = useState('');

  const addSize = () => {
    if (!newWeight.trim()) return;
    setForm(prev => ({
      ...prev,
      weights: [...prev.weights, newWeight],
      mrp: [...prev.mrp, 0],
      price: [...prev.price, 0],
      stock: { ...prev.stock, [newWeight]: 0 },
    }));
    setNewWeight('');
  };

  const removeSize = (idx: number) => {
    const w = form.weights[idx];
    const { [w]: _, ...restStock } = form.stock;
    setForm(prev => ({
      ...prev,
      weights: prev.weights.filter((_, i) => i !== idx),
      mrp: prev.mrp.filter((_, i) => i !== idx),
      price: prev.price.filter((_, i) => i !== idx),
      stock: restStock,
    }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 640, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--adm-text)' }}>Edit Product</p>
          <button onClick={onClose} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
        </div>

        {/* Image preview */}
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <img src={form.image} alt={form.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 16, border: '2px solid var(--adm-border)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'Product Name', key: 'name', type: 'text' },
            { label: 'Category', key: 'category', type: 'text' },
            { label: 'Tag', key: 'tag', type: 'text' },
          ].map(f => (
            <div key={f.key} style={{ gridColumn: f.key === 'name' ? '1 / -1' : undefined }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
          <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)', resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sizes / Pricing / Stock</label>
          </div>
          {form.weights.map((w, i) => (
            <div key={w} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--adm-text)', textAlign: 'center', background: 'var(--adm-card-alt)', borderRadius: 8, padding: '8px 4px' }}>{w}</div>
              {[
                { label: 'MRP (₹)', val: form.mrp[i], key: 'mrp' },
                { label: 'Price (₹)', val: form.price[i], key: 'price' },
                { label: 'Stock', val: form.stock[w] ?? 0, key: 'stock' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 9, color: 'var(--adm-text2)', display: 'block', marginBottom: 2 }}>{f.label}</label>
                  <input type="number" value={f.val}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (f.key === 'stock') setForm(prev => ({ ...prev, stock: { ...prev.stock, [w]: v } }));
                      else setForm(prev => { const arr = [...(prev as any)[f.key]]; arr[i] = v; return { ...prev, [f.key]: arr }; });
                    }}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: 8, border: `1.5px solid var(--adm-border2)`, fontSize: 12, outline: 'none', boxSizing: 'border-box', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
                </div>
              ))}
              <button onClick={() => removeSize(i)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}>
                <X size={12} />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="e.g. 500g"
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1.5px dashed var(--adm-border2)`, fontSize: 12, outline: 'none', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
            <button onClick={addSize} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#d1fae5', color: '#2d6a4f', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Size</button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spice Level</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map(l => (
              <button key={l} onClick={() => setForm(prev => ({ ...prev, spiceLevel: l }))}
                style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.spiceLevel >= l ? '#dc2626' : 'var(--adm-border)'}`, background: form.spiceLevel >= l ? '#fee2e2' : 'transparent', cursor: 'pointer', fontSize: 14 }}>
                🌶️
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['active', 'inactive'] as const).map(s => (
              <button key={s} onClick={() => setForm(prev => ({ ...prev, status: s }))}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${form.status === s ? '#2d6a4f' : 'var(--adm-border)'}`, background: form.status === s ? '#d1fae5' : 'transparent', color: form.status === s ? '#2d6a4f' : 'var(--adm-text2)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: `1.5px solid var(--adm-border)`, background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { onSave(form); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
              <Save size={14} /> Save Changes
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Products() {
  const [products, setProducts] = useState<AdminProduct[]>(buildAdminProducts);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [preview, setPreview] = useState<AdminProduct | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p.id));

  const deleteSelected = () => {
    setProducts(prev => prev.filter(p => !selected.includes(p.id)));
    setSelected([]);
  };

  const handleSave = (updated: AdminProduct) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const toggleStatus = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
  };

  return (
    <div>
      <AnimatePresence>
        {editProduct && (
          <EditModal product={editProduct} onSave={handleSave} onClose={() => setEditProduct(null)} />
        )}
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
              <button onClick={() => setPreview(null)} style={{ float: 'right', background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
              <img src={preview.image} alt={preview.name} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 16, marginBottom: 18 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>{preview.name}</p>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(107,124,58,0.12)', color: '#6b7c3a' }}>{preview.tag}</span>
                </div>
                <SpiceIndicator level={preview.spiceLevel} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--adm-text2)', lineHeight: 1.6, marginBottom: 16 }}>{preview.description}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {preview.weights.map((w, i) => (
                  <div key={w} style={{ background: 'var(--adm-card-alt)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#2d6a4f' }}>₹{preview.price[i]}</p>
                    <p style={{ fontSize: 10, color: 'var(--adm-text2)', textDecoration: 'line-through' }}>₹{preview.mrp[i]}</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text3)' }}>{w}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>{products.length} products · {products.filter(p => p.status === 'active').length} active</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filterCat === c ? '#2d6a4f' : 'var(--adm-border)'}`, background: filterCat === c ? '#d1fae5' : 'var(--adm-card)', color: filterCat === c ? '#2d6a4f' : 'var(--adm-text2)' }}>
              {c}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={deleteSelected}
            style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: 'rgba(220,38,38,0.1)', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            Delete ({selected.length})
          </motion.button>
        )}
      </div>

      {/* Table */}
      <div style={{ borderRadius: 18, background: 'var(--adm-card)', border: `1px solid var(--adm-border)`, overflow: 'hidden', boxShadow: '0 2px 8px var(--adm-shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid var(--adm-border)`, background: 'var(--adm-thead)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', width: 40 }}>
                  <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : filtered.map(p => p.id))} style={{ accentColor: '#2d6a4f', cursor: 'pointer' }} />
                </th>
                {['Product', 'Category', 'Spice', 'MRP / Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
                const isLow = totalStock < 15 && totalStock > 0;
                const isOut = totalStock === 0;
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: `1px solid var(--adm-border)`, background: selected.includes(p.id) ? 'rgba(45,106,79,0.04)' : 'transparent', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ accentColor: '#2d6a4f', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={p.image} alt={p.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: `1px solid var(--adm-border)` }} />
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--adm-text)', fontSize: 13 }}>{p.name}</p>
                          <p style={{ fontSize: 10, color: 'var(--adm-text2)', marginTop: 2 }}>{p.tag}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(107,124,58,0.1)', color: '#6b7c3a' }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <SpiceIndicator level={p.spiceLevel} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.weights.map((w, wi) => (
                        <div key={w} style={{ fontSize: 11, color: 'var(--adm-text3)', marginBottom: 2 }}>
                          <span style={{ textDecoration: 'line-through', color: 'var(--adm-text2)', opacity: 0.6 }}>₹{p.mrp[wi]}</span>
                          {' '}<span style={{ fontWeight: 700, color: '#2d6a4f' }}>₹{p.price[wi]}</span>
                          <span style={{ color: 'var(--adm-text2)', opacity: 0.7 }}> / {w}</span>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7', color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a' }}>
                        {isOut ? 'Out of Stock' : isLow ? `Low (${totalStock})` : `${totalStock} units`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => toggleStatus(p.id)}
                        style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: p.status === 'active' ? '#dcfce7' : '#f3f4f6', color: p.status === 'active' ? '#16a34a' : '#6b7280' }}>
                        {p.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[
                          { icon: Eye, color: '#6366f1', action: () => setPreview(p), title: 'Preview' },
                          { icon: Edit2, color: '#2d6a4f', action: () => setEditProduct(p), title: 'Edit' },
                          { icon: Trash2, color: '#dc2626', action: () => setProducts(prev => prev.filter(x => x.id !== p.id)), title: 'Delete' },
                        ].map(action => (
                          <motion.button key={action.title} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            title={action.title} onClick={action.action}
                            style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--adm-card-alt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color }}>
                            <action.icon size={13} />
                          </motion.button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
