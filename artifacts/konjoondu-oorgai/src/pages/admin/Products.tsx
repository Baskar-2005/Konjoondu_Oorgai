import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Copy, Eye, MoreVertical, Package, Filter } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Prawn Pickle', category: 'Seafood', image: '🦐', weights: ['100g','250g','500g'], mrp: [150,280,520], price: [120,220,420], stock: { '100g': 42, '250g': 18, '500g': 31 }, status: 'active' },
  { id: 2, name: 'Chicken Pickle', category: 'Meat', image: '🍗', weights: ['250g','500g'], mrp: [250,460], price: [210,380], stock: { '250g': 27, '500g': 14 }, status: 'active' },
  { id: 3, name: 'Squid Pickle', category: 'Seafood', image: '🦑', weights: ['250g','500g'], mrp: [300,560], price: [260,490], stock: { '250g': 4, '500g': 11 }, status: 'active' },
  { id: 4, name: 'Mutton Pickle', category: 'Meat', image: '🥩', weights: ['250g','500g'], mrp: [320,590], price: [270,450], stock: { '250g': 22, '500g': 2 }, status: 'active' },
  { id: 5, name: 'Mixed Pickle', category: 'Vegetarian', image: '🥒', weights: ['100g','250g'], mrp: [100,220], price: [80,180], stock: { '100g': 0, '250g': 0 }, status: 'inactive' },
];

export default function Products() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selected, setSelected] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const filtered = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p.id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 13, color: '#6b7c5a' }}>{MOCK_PRODUCTS.length} products · {MOCK_PRODUCTS.filter(p => p.status === 'active').length} active</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
          <Plus size={15} /> Add Product
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7c5a' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff9f5', color: '#1a1a0f' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', background: '#fff9f5', cursor: 'pointer', fontSize: 12, color: '#6b7c5a', fontFamily: 'inherit' }}>
          <Filter size={13} /> Filter
        </button>
        {selected.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', gap: 6 }}>
            <button style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: 'rgba(220,38,38,0.1)', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
              Delete ({selected.length})
            </button>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(139,94,60,0.1)', background: 'rgba(139,94,60,0.03)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', width: 40 }}>
                  <input type="checkbox" checked={allSelected}
                    onChange={() => setSelected(allSelected ? [] : filtered.map(p => p.id))}
                    style={{ accentColor: '#2d6a4f', cursor: 'pointer' }} />
                </th>
                {['Product', 'Category', 'Weights', 'MRP / Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
                const isLow = totalStock < 10 && totalStock > 0;
                const isOut = totalStock === 0;
                return (
                  <motion.tr key={p.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid rgba(139,94,60,0.06)', background: selected.includes(p.id) ? 'rgba(45,106,79,0.04)' : 'transparent', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ accentColor: '#2d6a4f', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(45,106,79,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.image}</div>
                        <span style={{ fontWeight: 700, color: '#1a1a0f' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(107,124,58,0.1)', color: '#6b7c3a' }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7c5a', fontSize: 12 }}>{p.weights.join(', ')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.weights.map((w, wi) => (
                        <div key={w} style={{ fontSize: 11, color: '#4a5568' }}>
                          <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{p.mrp[wi]}</span>
                          {' '}<span style={{ fontWeight: 700, color: '#2d6a4f' }}>₹{p.price[wi]}</span>
                          <span style={{ color: '#6b7c5a' }}> / {w}</span>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                        background: isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7',
                        color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a',
                      }}>
                        {isOut ? 'Out of Stock' : isLow ? `Low (${totalStock})` : `${totalStock} units`}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: p.status === 'active' ? '#dcfce7' : '#f3f4f6', color: p.status === 'active' ? '#16a34a' : '#6b7280' }}>
                        {p.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {[
                          { icon: Eye, color: '#6366f1', label: 'Preview' },
                          { icon: Edit2, color: '#2d6a4f', label: 'Edit' },
                          { icon: Copy, color: '#d97706', label: 'Duplicate' },
                          { icon: Trash2, color: '#dc2626', label: 'Delete' },
                        ].map(action => (
                          <motion.button key={action.label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            title={action.label}
                            style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(139,94,60,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color }}>
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
