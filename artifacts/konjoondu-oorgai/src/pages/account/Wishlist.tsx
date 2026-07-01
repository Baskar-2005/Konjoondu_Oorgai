import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, ShoppingBag, ArrowRight, Search } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

const PRIMARY = 'hsl(4,60%,44%)';

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  image: string;
  size: string;
  addedAt: string;
}

export default function Wishlist() {
  const { apiBase, token } = useCustomer();
  const { addItem, openCart } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [addingAll, setAddingAll] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${apiBase}/customer/wishlist`, { headers: { 'x-customer-token': token } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const sorted = [...d.items].sort((a: WishlistItem, b: WishlistItem) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
          );
          setItems(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, apiBase]);

  async function remove(id: string) {
    if (!token) return;
    setRemoving(id);
    await fetch(`${apiBase}/customer/wishlist/${id}`, { method: 'DELETE', headers: { 'x-customer-token': token } });
    setItems(prev => prev.filter(i => i.id !== id));
    setRemoving(null);
    toast({ title: 'Removed from wishlist' });
  }

  function moveToCart(item: WishlistItem) {
    addItem({
      productId: Number(item.productId),
      productName: item.productName,
      size: item.size || '250g',
      price: item.price,
      image: item.image || '',
      tag: 'Wishlist',
    });
    toast({ title: `${item.productName} added to cart`, description: 'Go to cart to checkout.' });
  }

  async function moveAllToCart() {
    if (filtered.length === 0) return;
    setAddingAll(true);
    for (const item of filtered) {
      addItem({
        productId: Number(item.productId),
        productName: item.productName,
        size: item.size || '250g',
        price: item.price,
        image: item.image || '',
        tag: 'Wishlist',
      });
    }
    setTimeout(() => {
      setAddingAll(false);
      openCart();
    }, 400);
  }

  const filtered = items.filter(i =>
    i.productName.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filtered.reduce((sum, i) => sum + i.price, 0);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ height: 280, borderRadius: 20, background: 'rgba(139,94,60,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );

  if (items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Heart size={40} color="rgba(239,68,68,0.35)" />
      </motion.div>
      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#1a0f08' }}>Your wishlist is empty</h3>
      <p style={{ fontSize: 13, color: '#8b6344', marginBottom: 24, lineHeight: 1.6 }}>
        Save products you love and come back to them any time.<br />Tap the ♡ on any product to add it here.
      </p>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => window.location.href = '/products'}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, border: 'none', background: PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 4px 16px rgba(181,58,46,0.3)' }}>
        Browse Products <ArrowRight size={16} />
      </motion.button>
    </div>
  );

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, color: '#8b6344', fontWeight: 600 }}>
            {items.length} item{items.length !== 1 ? 's' : ''} saved
            {items.length > 0 && <span style={{ marginLeft: 8, color: PRIMARY, fontWeight: 800 }}>· Total ₹{totalValue.toLocaleString('en-IN')}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#8b6344" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search wishlist…"
              style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.2)', fontSize: 12, fontFamily: 'Poppins,sans-serif', outline: 'none', background: '#faf8f5', color: '#1a0f08', width: 160 }}
            />
          </div>
          {/* Move all to cart */}
          {filtered.length > 1 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={moveAllToCart} disabled={addingAll}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: addingAll ? 'rgba(181,58,46,0.4)' : PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', whiteSpace: 'nowrap' }}>
              <ShoppingBag size={13} /> {addingAll ? 'Adding…' : 'Add All to Cart'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
        <AnimatePresence>
          {filtered.map(item => (
            <motion.div key={item.id} layout
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
              whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(139,94,60,0.15)' }}
              style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(139,94,60,0.1)', boxShadow: '0 2px 12px rgba(139,94,60,0.07)', display: 'flex', flexDirection: 'column' }}>

              {/* Image */}
              <div style={{ position: 'relative', height: 160, background: 'rgba(181,58,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.image ? (
                  <img src={item.image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 56 }}>🥒</span>
                )}
                <button onClick={() => remove(item.id)} disabled={removing === item.id}
                  style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all 0.15s' }}>
                  {removing === item.id
                    ? <span style={{ width: 12, height: 12, border: '2px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    : <Trash2 size={13} color="#ef4444" />}
                </button>
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8 }}>
                  {item.size || '250g'}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a0f08', lineHeight: 1.3 }}>{item.productName}</div>
                <div style={{ fontSize: 10, color: '#c4a882' }}>
                  Saved {new Date(item.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 6 }}>
                  <span style={{ fontWeight: 900, fontSize: 16, color: PRIMARY }}>₹{item.price.toLocaleString('en-IN')}</span>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => moveToCart(item)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 10, border: 'none', background: PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>
                    <ShoppingCart size={12} /> Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && search && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b6344', fontSize: 14 }}>
          No items matching "<strong>{search}</strong>"
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
