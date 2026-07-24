import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, X, Save, Package, Flame, RefreshCw, UploadCloud } from 'lucide-react';
import { products as REAL_PRODUCTS, type Product } from '@/data/products';

interface AdminProduct {
  id: number;
  firestoreId?: string; // Firestore document ID — present for products fetched from backend
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
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Flame key={i} size={12}
          style={{ color: i <= level ? '#dc2626' : 'rgba(220,38,38,0.15)', fill: i <= level ? '#dc2626' : 'rgba(220,38,38,0.15)' }} />
      ))}
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps { product: AdminProduct; onSave: (p: AdminProduct) => void; onClose: () => void; }
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
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <img src={form.image} alt={form.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 16, border: '2px solid var(--adm-border)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[{ label: 'Product Name', key: 'name', type: 'text' }, { label: 'Category', key: 'category', type: 'text' }, { label: 'Tag', key: 'tag', type: 'text' }].map(f => (
            <div key={f.key} style={{ gridColumn: f.key === 'name' ? '1 / -1' : undefined }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
          <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)', resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Sizes / Pricing</label>
          {form.weights.map((w, i) => (
            <div key={w} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--adm-text)', textAlign: 'center', background: 'var(--adm-card-alt)', borderRadius: 8, padding: '8px 4px' }}>{w}</div>
              {[{ label: 'MRP (₹)', val: form.mrp[i], key: 'mrp' }, { label: 'Price (₹)', val: form.price[i], key: 'price' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 9, color: 'var(--adm-text2)', display: 'block', marginBottom: 2 }}>{f.label}</label>
                  <input type="number" value={f.val}
                    onChange={e => { const v = Number(e.target.value); setForm(prev => { const arr = [...(prev as any)[f.key]]; arr[i] = v; return { ...prev, [f.key]: arr }; }); }}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: 8, border: '1.5px solid var(--adm-border2)', fontSize: 12, outline: 'none', boxSizing: 'border-box', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
                </div>
              ))}
              <button onClick={() => removeSize(i)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}>
                <X size={12} />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="e.g. 500g"
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px dashed var(--adm-border2)', fontSize: 12, outline: 'none', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
            <button onClick={addSize} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#d1fae5', color: '#2d6a4f', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add Size</button>
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
            <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
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

// ─── Add Product Modal ────────────────────────────────────────────────────────
interface AddProductModalProps { onSave: (p: AdminProduct) => void; onClose: () => void; token?: string; }
function AddProductModal({ onSave, onClose, token }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pickle');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [spiceLevel, setSpiceLevel] = useState(3);
  const [sizes, setSizes] = useState<{ label: string; mrp: number; price: number }[]>([{ label: '', mrp: 0, price: 0 }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addSize = () => setSizes(p => [...p, { label: '', mrp: 0, price: 0 }]);
  const removeSize = (i: number) => setSizes(p => p.filter((_, idx) => idx !== i));
  const updateSize = (i: number, key: 'label' | 'mrp' | 'price', val: string | number) =>
    setSizes(p => p.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Product name is required'); return; }
    if (sizes.length === 0) { setError('At least one size is required'); return; }
    if (sizes.some(s => !s.label.trim())) { setError('All size labels must be filled in'); return; }
    setSaving(true); setError('');
    try {
      const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';
      let imageBase64 = ''; let imageType = '';
      if (imageFile) {
        imageBase64 = await new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve((e.target?.result as string).split(',')[1]);
          reader.readAsDataURL(imageFile);
        });
        imageType = imageFile.type;
      }
      const payload = {
        name: name.trim(), category: category.trim() || 'Pickle',
        description: description.trim(), tag: tag.trim(), spiceLevel,
        weights: sizes.map(s => s.label.trim()),
        mrp: sizes.map(s => Number(s.mrp)),
        prices: sizes.map(s => Number(s.price)),
        imageBase64, imageType,
      };
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token ?? '' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? 'Failed to save');
      const p = data.product;
      onSave({
        id: Date.now(),
        name: p.name, category: p.category, image: p.image,
        weights: p.weights, mrp: p.mrp, price: p.prices,
        stock: Object.fromEntries((p.weights as string[]).map((w: string) => [w, 0])),
        status: 'active', description: p.description,
        spiceLevel: p.spiceLevel, tag: p.tag,
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' };
  const smallInp: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--adm-border2)', fontSize: 12, outline: 'none', boxSizing: 'border-box', background: 'var(--adm-input-bg)', color: 'var(--adm-text)', fontFamily: 'inherit' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px 48px', overflowY: 'auto' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 640, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', marginTop: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--adm-text)' }}>Add New Product</p>
          <button onClick={onClose} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
        </div>

        {/* Image upload */}
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <label style={{ cursor: 'pointer', display: 'inline-block' }}>
            {imagePreview
              ? <img src={imagePreview} alt="preview" style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 16, border: '2px solid var(--adm-border)' }} />
              : (
                <div style={{ width: 110, height: 110, borderRadius: 16, border: '2px dashed var(--adm-border2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text2)', margin: '0 auto', background: 'var(--adm-card-alt)' }}>
                  <UploadCloud size={24} style={{ marginBottom: 6, opacity: 0.5 }} />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>Upload Image</span>
                </div>
              )}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
          {imagePreview && (
            <div>
              <button onClick={() => { setImageFile(null); setImagePreview(''); }}
                style={{ marginTop: 6, fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Remove image</button>
            </div>
          )}
          <p style={{ fontSize: 10, color: 'var(--adm-text2)', marginTop: 6 }}>Click to upload product image</p>
        </div>

        {/* Basic fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Product Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mango Avakaya" style={inp} />
          </div>
          <div>
            <label style={lbl}>Category</label>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Pickle" style={inp} />
          </div>
          <div>
            <label style={lbl}>Tag</label>
            <input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. Bestseller" style={inp} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            placeholder="Describe the product…" style={{ ...inp, resize: 'vertical' }} />
        </div>

        {/* Spice level */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Spice Level</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} onClick={() => setSpiceLevel(i)}
                style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${spiceLevel >= i ? '#dc2626' : 'var(--adm-border)'}`, background: spiceLevel >= i ? 'rgba(220,38,38,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={16} style={{ color: spiceLevel >= i ? '#dc2626' : 'var(--adm-text2)', fill: spiceLevel >= i ? '#dc2626' : 'transparent' }} />
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'var(--adm-text2)', marginLeft: 4 }}>{spiceLevel} / 5</span>
          </div>
        </div>

        {/* Sizes & Pricing */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Sizes & Pricing</label>
          {sizes.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
              <div>
                {i === 0 && <label style={{ ...lbl, marginBottom: 4, fontSize: 9 }}>Label</label>}
                <input value={s.label} onChange={e => updateSize(i, 'label', e.target.value)} placeholder="250g" style={smallInp} />
              </div>
              <div>
                {i === 0 && <label style={{ ...lbl, marginBottom: 4, fontSize: 9 }}>MRP (₹)</label>}
                <input type="number" value={s.mrp || ''} onChange={e => updateSize(i, 'mrp', e.target.value)} placeholder="0" style={smallInp} />
              </div>
              <div>
                {i === 0 && <label style={{ ...lbl, marginBottom: 4, fontSize: 9 }}>Price (₹)</label>}
                <input type="number" value={s.price || ''} onChange={e => updateSize(i, 'price', e.target.value)} placeholder="0" style={smallInp} />
              </div>
              <button onClick={() => removeSize(i)} disabled={sizes.length === 1}
                style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: sizes.length === 1 ? 'var(--adm-border)' : '#fee2e2', color: sizes.length === 1 ? 'var(--adm-text2)' : '#dc2626', cursor: sizes.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={12} />
              </button>
            </div>
          ))}
          <button onClick={addSize}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1.5px dashed var(--adm-border2)', background: 'transparent', color: '#2d6a4f', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', marginTop: 4 }}>
            + Add Size
          </button>
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 14, padding: '8px 12px', background: '#fee2e2', borderRadius: 8 }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose}
            style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? '#9ca3af' : 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: saving ? 'none' : '0 4px 12px rgba(45,106,79,0.25)' }}>
            {saving ? 'Saving…' : <><Plus size={14} /> Add Product</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, index, selected, onToggleSelect, onEdit, onDelete, onPreview, onToggleStatus }: {
  product: AdminProduct;
  index: number;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
  onToggleStatus: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        borderRadius: 18,
        border: `1.5px solid ${selected ? '#2d6a4f' : 'var(--adm-border)'}`,
        background: selected ? 'rgba(45,106,79,0.03)' : 'var(--adm-card)',
        overflow: 'hidden',
        marginBottom: 12,
        boxShadow: '0 2px 8px var(--adm-shadow)',
      }}>

      {/* ── Product Header ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '44px 64px 1fr auto', gap: 0, alignItems: 'center', padding: '16px 16px 14px', borderBottom: '1px solid var(--adm-border)', background: 'var(--adm-thead)' }}>
        {/* Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <input type="checkbox" checked={selected} onChange={onToggleSelect}
            style={{ accentColor: '#2d6a4f', cursor: 'pointer', width: 16, height: 16 }} />
        </div>

        {/* Image */}
        <div style={{ paddingRight: 12 }}>
          <img src={product.image} alt={product.name}
            style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 12, border: '1.5px solid var(--adm-border)', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
        </div>

        {/* Name + meta */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--adm-text)' }}>{product.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: 'rgba(107,124,58,0.12)', color: '#6b7c3a' }}>{product.tag}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{product.category}</span>
            <button onClick={onToggleStatus}
              style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: product.status === 'active' ? '#dcfce7' : '#f3f4f6', color: product.status === 'active' ? '#16a34a' : '#6b7280', letterSpacing: '0.03em' }}>
              {product.status === 'active' ? '● Active' : '○ Inactive'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SpiceIndicator level={product.spiceLevel} />
            <span style={{ fontSize: 11, color: 'var(--adm-text2)' }}>{product.weights.length} size{product.weights.length !== 1 ? 's' : ''}</span>
            <span style={{ fontSize: 11, color: 'var(--adm-text3)', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[
            { icon: Eye,    color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  action: onPreview, title: 'Preview' },
            { icon: Edit2,  color: '#2d6a4f', bg: 'rgba(45,106,79,0.1)',   action: onEdit,    title: 'Edit'    },
            { icon: Trash2, color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   action: onDelete,  title: 'Delete'  },
          ].map(a => (
            <motion.button key={a.title} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              title={a.title} onClick={a.action}
              style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: a.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color }}>
              <a.icon size={14} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Size Rows ── */}
      <div>
        {product.weights.map((w, wi) => {
          const sizeStock = product.stock[w] ?? 0;
          const isOut  = sizeStock === 0;
          const isLow  = !isOut && sizeStock < 15;
          const discount = product.mrp[wi] > product.price[wi]
            ? Math.round((1 - product.price[wi] / product.mrp[wi]) * 100)
            : 0;

          return (
            <div key={w}
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 64px 120px 1fr 160px 130px',
                alignItems: 'center',
                padding: '13px 16px',
                borderBottom: wi < product.weights.length - 1 ? '1px solid var(--adm-border)' : 'none',
                background: isOut ? 'rgba(220,38,38,0.03)' : isLow ? 'rgba(217,119,6,0.02)' : 'transparent',
                gap: 0,
              }}>
              {/* Indent spacer */}
              <div />
              {/* SKU badge */}
              <div style={{ paddingRight: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', padding: '4px 10px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'inline-block', letterSpacing: '0.03em' }}>
                  {w}
                </span>
              </div>

              {/* Price */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#2d6a4f' }}>₹{product.price[wi]}</span>
                  {discount > 0 && (
                    <>
                      <span style={{ fontSize: 11, color: 'var(--adm-text2)', textDecoration: 'line-through' }}>₹{product.mrp[wi]}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: '#dcfce7', color: '#16a34a' }}>{discount}% off</span>
                    </>
                  )}
                </div>
                <p style={{ fontSize: 10, color: 'var(--adm-text2)', marginTop: 2 }}>Sale price / {w}</p>
              </div>

              {/* Description of size (spacer) */}
              <div />

              {/* Stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 12,
                  background: isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7',
                  border: `1px solid ${isOut ? 'rgba(220,38,38,0.2)' : isLow ? 'rgba(217,119,6,0.2)' : 'rgba(45,106,79,0.15)'}`,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a', lineHeight: 1 }}>
                    {sizeStock}
                  </span>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a', lineHeight: 1.2 }}>
                      {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                    </p>
                    <p style={{ fontSize: 9, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a', opacity: 0.7, lineHeight: 1.2 }}>units</p>
                  </div>
                </div>
              </div>

              {/* Stock bar */}
              <div style={{ paddingLeft: 8 }}>
                <div style={{ height: 6, borderRadius: 6, background: 'var(--adm-border)', overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 6,
                    width: `${Math.min(100, (sizeStock / 100) * 100)}%`,
                    background: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <p style={{ fontSize: 9, color: 'var(--adm-text2)' }}>{sizeStock} / 100 capacity</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ product, onClose }: { product: AdminProduct; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        <button onClick={onClose} style={{ float: 'right', background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
        <img src={product.image} alt={product.name} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 16, marginBottom: 18 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>{product.name}</p>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(107,124,58,0.12)', color: '#6b7c3a' }}>{product.tag}</span>
          </div>
          <SpiceIndicator level={product.spiceLevel} />
        </div>
        <p style={{ fontSize: 13, color: 'var(--adm-text2)', lineHeight: 1.6, marginBottom: 16 }}>{product.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${product.weights.length}, 1fr)`, gap: 8 }}>
          {product.weights.map((w, i) => {
            const s = product.stock[w] ?? 0;
            const isOut = s === 0;
            return (
              <div key={w} style={{ background: 'var(--adm-card-alt)', borderRadius: 12, padding: '12px 10px', textAlign: 'center', border: isOut ? '1px solid rgba(220,38,38,0.2)' : '1px solid var(--adm-border)' }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#2d6a4f' }}>₹{product.price[i]}</p>
                <p style={{ fontSize: 10, color: 'var(--adm-text2)', textDecoration: 'line-through' }}>₹{product.mrp[i]}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-text3)', margin: '4px 0 2px' }}>{w}</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: isOut ? '#dc2626' : '#16a34a' }}>{isOut ? 'Out' : `${s} units`}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface ProductsProps { token?: string; }

export default function Products({ token }: ProductsProps) {
  const [products, setProducts] = useState<AdminProduct[]>(buildAdminProducts);
  const [refreshing, setRefreshing] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);

  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

  // ── Sync stock from inventory ──────────────────────────────────────────────
  const refreshStock = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const data = await fetch(`${API_BASE}/admin/inventory`, { headers: { 'x-admin-token': token } }).then(r => r.json());
      if (!data.success) return;
      setProducts(prev => prev.map(p => {
        const updatedStock = { ...p.stock };
        for (const item of data.inventory) {
          const nameMatch = item.productName?.toLowerCase().includes(p.name.toLowerCase()) ||
            p.name.toLowerCase().includes(item.productName?.toLowerCase() ?? '');
          const effectiveSize: string = item.size || (item.sku ? String(item.sku).replace(/^P\d+-/, '') : '');
          if (nameMatch && effectiveSize && effectiveSize in updatedStock) {
            updatedStock[effectiveSize] = item.stock;
          }
        }
        return { ...p, stock: updatedStock };
      }));
    } finally {
      setRefreshing(false);
    }
  }, [token, API_BASE]);

  React.useEffect(() => { refreshStock(); }, [refreshStock]);

  // ── Fetch Firestore products and merge with local ──────────────────────────
  React.useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/products`, { headers: { 'x-admin-token': token } })
      .then(r => r.json())
      .then(data => {
        if (!data.success) return;
        setProducts(prev => {
          const localNames = new Set(prev.map(p => p.name.toLowerCase()));
          const incoming: AdminProduct[] = data.products
            .filter((p: any) => !localNames.has(String(p.name).toLowerCase()))
            .map((p: any, i: number) => ({
              id: Date.now() + i + 9000,
              firestoreId: p.id,
              name: p.name, category: p.category,
              image: p.image || '/products/placeholder.jpg',
              weights: p.weights ?? [], mrp: p.mrp ?? [], price: p.prices ?? [],
              stock: Object.fromEntries((p.weights ?? []).map((w: string) => [w, 0])),
              status: p.status ?? 'active', description: p.description ?? '',
              spiceLevel: p.spiceLevel ?? 3, tag: p.tag ?? '',
            }));
          return [...prev, ...incoming];
        });
      })
      .catch(() => {});
  }, [token, API_BASE]);

  const [search,      setSearch]      = useState('');
  const [filterCat,   setFilterCat]   = useState('All');
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [selected,    setSelected]    = useState<number[]>([]);
  const [preview,     setPreview]     = useState<AdminProduct | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const toggleSelect  = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allSelected   = filtered.length > 0 && filtered.every(p => selected.includes(p.id));
  const deleteSelected = () => { setProducts(prev => prev.filter(p => !selected.includes(p.id))); setSelected([]); };
  const handleSave    = async (updated: AdminProduct) => {
    if (updated.firestoreId) {
      try {
        await fetch(`${API_BASE}/admin/products/${updated.firestoreId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': token ?? '' },
          body: JSON.stringify({
            name: updated.name, category: updated.category,
            description: updated.description, tag: updated.tag,
            spiceLevel: updated.spiceLevel, weights: updated.weights,
            mrp: updated.mrp, prices: updated.price, status: updated.status,
          }),
        });
      } catch { /* silent — local state still updates */ }
    }
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };
  const toggleStatus  = (id: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));

  const totalSKUs   = products.reduce((n, p) => n + p.weights.length, 0);
  const activeCount = products.filter(p => p.status === 'active').length;
  const outCount    = products.reduce((n, p) => n + p.weights.filter(w => (p.stock[w] ?? 0) === 0).length, 0);
  const lowCount    = products.reduce((n, p) => n + p.weights.filter(w => { const s = p.stock[w] ?? 0; return s > 0 && s < 15; }).length, 0);

  return (
    <div>
      <AnimatePresence>
        {editProduct    && <EditModal product={editProduct} onSave={handleSave} onClose={() => setEditProduct(null)} />}
        {preview      && <PreviewModal product={preview} onClose={() => setPreview(null)} />}
        {addingProduct && <AddProductModal token={token} onSave={p => setProducts(prev => [p, ...prev])} onClose={() => setAddingProduct(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>
            {products.length} products · {totalSKUs} SKUs · {activeCount} active
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={refreshStock} disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'var(--adm-card)', color: 'var(--adm-text2)', cursor: refreshing ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing…' : 'Refresh Stock'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setAddingProduct(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
            <Plus size={13} /> Add Product
          </motion.button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Products', value: products.length, color: '#2d6a4f', bg: '#d1fae5' },
          { label: 'Total SKUs',     value: totalSKUs,       color: '#6366f1', bg: '#e0e7ff' },
          { label: 'Out of Stock',   value: outCount,        color: '#dc2626', bg: '#fee2e2' },
          { label: 'Low Stock',      value: lowCount,        color: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} style={{ borderRadius: 12, padding: '12px 16px', background: s.bg, border: `1px solid ${s.color}22` }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: s.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--adm-text2)', fontWeight: 600 }}>{selected.length} selected</span>
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={deleteSelected}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: 'rgba(220,38,38,0.1)', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
              <Trash2 size={12} /> Delete selected
            </motion.button>
            <button onClick={() => setSelected([])}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
              Clear
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : filtered.map(p => p.id))}
            style={{ accentColor: '#2d6a4f', cursor: 'pointer', width: 15, height: 15 }} />
          <span style={{ fontSize: 12, color: 'var(--adm-text2)' }}>Select all</span>
        </div>
      </div>

      {/* Product cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--adm-text2)', background: 'var(--adm-card)', borderRadius: 18, border: '1px solid var(--adm-border)' }}>
          <Package size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontSize: 14, fontWeight: 600 }}>No products match your search</p>
        </div>
      ) : (
        filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i}
            selected={selected.includes(p.id)}
            onToggleSelect={() => toggleSelect(p.id)}
            onEdit={() => setEditProduct(p)}
            onDelete={() => setProducts(prev => prev.filter(x => x.id !== p.id))}
            onPreview={() => setPreview(p)}
            onToggleStatus={() => toggleStatus(p.id)} />
        ))
      )}
    </div>
  );
}
