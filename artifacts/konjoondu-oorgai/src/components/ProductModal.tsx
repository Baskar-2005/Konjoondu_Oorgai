import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShoppingCart, Plus, Minus, Star, Heart } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import { useToast } from '@/hooks/use-toast';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

function ModalInner({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart();
  const { token, apiBase } = useCustomer();
  const { toast } = useToast();
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  React.useEffect(() => {
    setSelectedSizeIdx(0);
    setQuantity(1);
  }, [product.id]);

  const selectedSize = product.sizes[selectedSizeIdx];

  function handleAdd() {
    addItem({
      productId: product.id,
      productName: product.name,
      size: selectedSize.label,
      price: selectedSize.price,
      image: product.image,
      tag: product.tag,
    }, quantity);
    toast({ title: 'Added to cart!', description: `${product.name} (${selectedSize.label}) × ${quantity}` });
    onClose();
  }

  async function handleWishlist() {
    if (!token) { onClose(); window.location.href = '/account'; return; }
    if (wishlisted) return;
    try {
      await fetch(`${apiBase}/customer/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ productId: product.id, productName: product.name, price: selectedSize.price, image: product.image }),
      });
      setWishlisted(true);
      toast({ title: wishlisted ? 'Already in wishlist' : '❤️ Added to wishlist!', description: product.name });
    } catch { /* silent */ }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Modal — centred, max 680px wide */}
      <motion.div
        key="modal-panel"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9991,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%', maxWidth: 660,
            maxHeight: 'calc(100vh - 32px)',
            borderRadius: 24,
            background: 'hsl(var(--background))',
            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            border: '1px solid rgba(181,58,46,0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Top image hero ── */}
          <div style={{ position: 'relative', height: 220, flexShrink: 0, background: '#1a0d08' }}>
            <img src={product.image} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)' }} />

            {/* Close */}
            <button onClick={onClose}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}
            >
              <X size={16} />
            </button>

            {/* Tag + rating */}
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#fff',
                background: 'hsl(4,60%,44%)',
              }}>{product.tag}</span>
              <span style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                4.8
              </span>
            </div>

            {/* Name overlay */}
            <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,249,240,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                {product.category}
              </p>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                {product.name}
              </h2>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* Spice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Spice:</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Flame key={i} size={14}
                    className={i < product.spiceLevel ? 'fill-primary text-primary' : 'text-muted-foreground/20'} />
                ))}
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', lineHeight: 1.65, marginBottom: 16 }}>
              {product.description}
            </p>

            {/* Taste + Pairing — horizontal on desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{ borderRadius: 14, padding: '12px 14px', background: 'rgba(181,58,46,0.06)', border: '1px solid rgba(181,58,46,0.1)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(4,60%,44%)', marginBottom: 6 }}>
                  Taste Profile
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: 'hsl(var(--foreground))' }}>{product.taste}</p>
              </div>
              <div style={{ borderRadius: 14, padding: '12px 14px', background: 'rgba(139,94,60,0.06)', border: '1px solid rgba(139,94,60,0.1)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(18,18%,40%)', marginBottom: 6 }}>
                  Best With
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: 'hsl(var(--foreground))' }}>{product.bestWith}</p>
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--muted-foreground))', marginBottom: 10 }}>
                Select Size
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {product.sizes.map((s, idx) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSizeIdx(idx)}
                    style={{
                      padding: '10px 20px', borderRadius: 14,
                      border: `2px solid ${selectedSizeIdx === idx ? 'hsl(4,60%,44%)' : 'rgba(139,94,60,0.2)'}`,
                      background: selectedSizeIdx === idx ? 'rgba(181,58,46,0.1)' : 'transparent',
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: selectedSizeIdx === idx ? 'hsl(4,60%,44%)' : 'hsl(var(--foreground))' }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: selectedSizeIdx === idx ? 'hsl(4,60%,44%)' : 'hsl(var(--foreground))' }}>
                      ₹{s.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Qty row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--muted-foreground))' }}>
                Qty
              </p>
              <div style={{ display: 'flex', alignItems: 'center', borderRadius: 12, border: '1.5px solid rgba(139,94,60,0.2)', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={14} />
                </button>
                <span style={{ width: 36, textAlign: 'center', fontWeight: 800, fontSize: 15, borderLeft: '1px solid rgba(139,94,60,0.15)', borderRight: '1px solid rgba(139,94,60,0.15)' }}>
                  {quantity}
                </span>
                <button onClick={() => setQuantity(q => q + 1)}
                  style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} />
                </button>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 800, color: 'hsl(4,60%,44%)' }}>
                ₹{selectedSize.price * quantity}
              </span>
            </div>
          </div>

          {/* ── Sticky footer ── */}
          <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(139,94,60,0.1)', flexShrink: 0, background: 'hsl(var(--background))', display: 'flex', gap: 10 }}>
            <button onClick={handleWishlist}
              title={wishlisted ? 'In wishlist' : 'Add to wishlist'}
              style={{
                flexShrink: 0, width: 52, padding: '15px 0', borderRadius: 18, border: '1.5px solid rgba(139,94,60,0.2)',
                background: wishlisted ? 'rgba(239,68,68,0.08)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              <Heart size={20} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#8b6344'} />
            </button>
            <button onClick={handleAdd}
              style={{
                flex: 1, padding: '15px', borderRadius: 18, border: 'none',
                background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                color: '#FFF9F0', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 8px 28px rgba(181,58,46,0.35)',
                fontFamily: 'inherit',
              }}
            >
              <ShoppingCart size={18} />
              Add {quantity > 1 ? `${quantity} × ` : ''}to Cart — ₹{selectedSize.price * quantity}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {product && <ModalInner key={product.id} product={product} onClose={onClose} />}
    </AnimatePresence>,
    document.body,
  );
}
