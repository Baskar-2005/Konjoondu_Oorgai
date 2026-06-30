import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package, TrendingDown, Plus, Search, ArrowUpRight } from 'lucide-react';

const STOCK_DATA = [
  { id: 1, name: 'Prawn Pickle', sku: 'KO-PP-100', size: '100g', batch: 'B2406A', stock: 42, threshold: 15, incoming: 100, expiry: '2025-06-15', supplier: 'Fresh Catch Co.', cost: 80 },
  { id: 2, name: 'Prawn Pickle', sku: 'KO-PP-250', size: '250g', batch: 'B2406A', stock: 18, threshold: 10, incoming: 0, expiry: '2025-06-15', supplier: 'Fresh Catch Co.', cost: 180 },
  { id: 3, name: 'Prawn Pickle', sku: 'KO-PP-500', size: '500g', batch: 'B2406A', stock: 31, threshold: 10, incoming: 50, expiry: '2025-06-15', supplier: 'Fresh Catch Co.', cost: 340 },
  { id: 4, name: 'Chicken Pickle', sku: 'KO-CP-250', size: '250g', batch: 'B2405B', stock: 27, threshold: 10, incoming: 0, expiry: '2025-05-30', supplier: 'Poultry Fresh Ltd', cost: 150 },
  { id: 5, name: 'Chicken Pickle', sku: 'KO-CP-500', size: '500g', batch: 'B2405B', stock: 14, threshold: 8, incoming: 30, expiry: '2025-05-30', supplier: 'Poultry Fresh Ltd', cost: 290 },
  { id: 6, name: 'Squid Pickle', sku: 'KO-SP-250', size: '250g', batch: 'B2406C', stock: 4, threshold: 10, incoming: 60, expiry: '2025-07-01', supplier: 'Ocean Delights', cost: 200 },
  { id: 7, name: 'Squid Pickle', sku: 'KO-SP-500', size: '500g', batch: 'B2406C', stock: 11, threshold: 8, incoming: 0, expiry: '2025-07-01', supplier: 'Ocean Delights', cost: 390 },
  { id: 8, name: 'Mutton Pickle', sku: 'KO-MP-250', size: '250g', batch: 'B2404D', stock: 22, threshold: 10, incoming: 0, expiry: '2025-04-30', supplier: 'Hill Farm Meats', cost: 210 },
  { id: 9, name: 'Mutton Pickle', sku: 'KO-MP-500', size: '500g', batch: 'B2404D', stock: 2, threshold: 5, incoming: 40, expiry: '2025-04-30', supplier: 'Hill Farm Meats', cost: 380 },
  { id: 10, name: 'Mixed Pickle', sku: 'KO-MX-100', size: '100g', batch: 'B2403E', stock: 0, threshold: 10, incoming: 80, expiry: '2025-03-15', supplier: 'Veg Delights', cost: 60 },
  { id: 11, name: 'Mixed Pickle', sku: 'KO-MX-250', size: '250g', batch: 'B2403E', stock: 0, threshold: 10, incoming: 50, expiry: '2025-03-15', supplier: 'Veg Delights', cost: 140 },
];

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out' | 'incoming'>('all');

  const filtered = STOCK_DATA.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'low' ? (item.stock > 0 && item.stock <= item.threshold) :
      filter === 'out' ? item.stock === 0 :
      filter === 'incoming' ? item.incoming > 0 : true;
    return matchSearch && matchFilter;
  });

  const outOfStock = STOCK_DATA.filter(i => i.stock === 0).length;
  const lowStock = STOCK_DATA.filter(i => i.stock > 0 && i.stock <= i.threshold).length;
  const incomingItems = STOCK_DATA.filter(i => i.incoming > 0).length;
  const totalValue = STOCK_DATA.reduce((s, i) => s + i.stock * i.cost, 0);

  const summaryCards = [
    { label: 'Total SKUs', value: STOCK_DATA.length, icon: Package, color: '#2d6a4f', bg: '#d1fae5' },
    { label: 'Out of Stock', value: outOfStock, icon: TrendingDown, color: '#dc2626', bg: '#fee2e2' },
    { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: '#d97706', bg: '#fef3c7' },
    { label: 'Incoming', value: incomingItems, icon: ArrowUpRight, color: '#6366f1', bg: '#e0e7ff' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Inventory</h1>
          <p style={{ fontSize: 13, color: '#6b7c5a' }}>Live stock · Inventory value ₹{totalValue.toLocaleString('en-IN')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
          <Plus size={15} /> Add Stock
        </motion.button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 14, padding: '16px 18px', background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <c.icon size={17} color={c.color} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7c5a' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff9f5', color: '#1a1a0f' }} />
        </div>
        {(['all','low','out','incoming'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? '#2d6a4f' : 'rgba(139,94,60,0.14)'}`, background: filter === f ? '#d1fae5' : '#fff9f5', color: filter === f ? '#2d6a4f' : '#6b7c5a' }}>
            {f === 'all' ? 'All Items' : f === 'low' ? 'Low Stock' : f === 'out' ? 'Out of Stock' : 'Incoming'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(139,94,60,0.1)', background: 'rgba(139,94,60,0.03)' }}>
                {['Product', 'SKU', 'Batch', 'Stock', 'Threshold', 'Incoming', 'Expiry', 'Supplier', 'Cost/Unit', 'Stock Value', 'Alert'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6b7c5a', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const isOut = item.stock === 0;
                const isLow = !isOut && item.stock <= item.threshold;
                const isExpiringSoon = new Date(item.expiry) < new Date(Date.now() + 30 * 86400000);
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(139,94,60,0.06)', background: isOut ? 'rgba(220,38,38,0.03)' : isLow ? 'rgba(217,119,6,0.03)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1a1a0f' }}>{item.name} <span style={{ color: '#6b7c5a', fontWeight: 400 }}>({item.size})</span></td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: '#6366f1' }}>{item.sku}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#6b7c5a' }}>{item.batch}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#2d6a4f' }}>{item.stock}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7c5a' }}>{item.threshold}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {item.incoming > 0 ? <span style={{ color: '#6366f1', fontWeight: 700 }}>+{item.incoming}</span> : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, color: isExpiringSoon ? '#dc2626' : '#4a5568', fontWeight: isExpiringSoon ? 700 : 400 }}>
                        {new Date(item.expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#4a5568' }}>{item.supplier}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1a1a0f' }}>₹{item.cost}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2d6a4f' }}>₹{(item.stock * item.cost).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {isOut ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>OUT</span>
                        : isLow ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>LOW</span>
                        : isExpiringSoon ? <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>EXPIRING</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#dcfce7', color: '#16a34a' }}>OK</span>}
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
