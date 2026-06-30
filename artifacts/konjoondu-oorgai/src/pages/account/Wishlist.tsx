import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { useCart } from '@/context/CartContext';

const PRIMARY = 'hsl(4,60%,44%)';

interface WishlistItem { id: number; productId: string; productName: string; price: number; image: string; size: string; addedAt: string; }

export default function Wishlist() {
  const { apiBase, token } = useCustomer();
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${apiBase}/customer/wishlist`, { headers: { 'x-customer-token': token } })
      .then(r => r.json())
      .then(d => { if (d.success) setItems(d.items); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, apiBase]);

  async function remove(id: number) {
    if (!token) return;
    setRemoving(id);
    await fetch(`${apiBase}/customer/wishlist/${id}`, { method: 'DELETE', headers: { 'x-customer-token': token } });
    setItems(prev => prev.filter(i => i.id !== id));
    setRemoving(null);
  }

  function moveToCart(item: WishlistItem) {
    addItem({ productId: Number(item.productId), productName: item.productName, size: item.size || '250g', price: item.price, image: item.image || '', tag: 'Wishlist' });
  }

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
      {[1,2,3,4].map(i => <div key={i} style={{ height: 260, borderRadius: 20, background: 'rgba(139,94,60,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );

  if (items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Heart size={36} color="rgba(239,68,68,0.4)" />
      </motion.div>
      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Your wishlist is empty</h3>
      <p style={{ fontSize: 13, color: '#8b6344', marginBottom: 20 }}>Save products you love and come back to them any time.</p>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => window.location.href = '/products'}
        style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 4px 16px rgba(181,58,46,0.3)' }}>
        Browse Products
      </motion.button>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: 13, color: '#8b6344', marginBottom: 16 }}>{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
        <AnimatePresence>
          {items.map(item => (
            <motion.div key={item.id} layout exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(139,94,60,0.15)' }} transition={{ duration: 0.2 }}
              style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(139,94,60,0.1)', boxShadow: '0 2px 12px rgba(139,94,60,0.07)' }}>
              <div style={{ position: 'relative', height: 160, background: 'rgba(181,58,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? (
                  <img src={item.image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 56 }}>🥒</span>
                )}
                <button onClick={() => remove(item.id)} disabled={removing === item.id}
                  style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {removing === item.id ? <span style={{ width: 12, height: 12, border: '2px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : <Trash2 size={13} color="#ef4444" />}
                </button>
              </div>
              <div style={{ padding: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a0f08', marginBottom: 4, lineHeight: 1.3 }}>{item.productName}</div>
                {item.size && <div style={{ fontSize: 11, color: '#8b6344', marginBottom: 8 }}>{item.size}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 900, fontSize: 16, color: PRIMARY }}>₹{item.price.toLocaleString('en-IN')}</span>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => moveToCart(item)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 10, border: 'none', background: PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>
                    <ShoppingCart size={12} /> Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
