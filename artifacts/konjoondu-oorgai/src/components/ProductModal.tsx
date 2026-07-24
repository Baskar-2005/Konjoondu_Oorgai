import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShoppingCart, Plus, Minus, Star, Heart } from 'lucide-react';
import { getPrimaryProductSize, getVisibleProductSizes } from '@/data/products';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import { useToast } from '@/hooks/use-toast';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

interface StockEntry {
  productName: string;
  size: string;
  stock: number;
}

function ModalInner({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart();
  const { token, apiBase } = useCustomer();
  const { toast } = useToast();
  // Modal quantities are deliberately isolated from the product-card steppers.
  // Each package size gets its own quantity while the popup is open.
  const [quantityBySize, setQuantityBySize] = useState<Record<string, number>>({});
  const [wishlisted, setWishlisted] = useState(false);
  const [stockData, setStockData] = useState<StockEntry[]>([]);
  const [stockLoaded, setStockLoaded] = useState(false);
  const visibleSizes = getVisibleProductSizes(product);

  React.useEffect(() => {
    setQuantityBySize({});
    setStockData([]);
    setStockLoaded(false);
  }, [product.id]);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/products/stock`)
      .then(r => r.json())
      .then(d => {
        if (!cancelled && d.success && Array.isArray(d.stock)) {
          setStockData(d.stock);
          setStockLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setStockLoaded(true);
      });
    return () => { cancelled = true; };
  }, [apiBase, product.id]);

  const getStockLevel = (sizeLabel: string) => {
    const stockEntry = stockData.find(s => {
      const nameMatch = s.productName.toLowerCase().includes(product.name.toLowerCase()) ||
        product.name.toLowerCase().includes(s.productName.toLowerCase());
      return nameMatch && s.size === sizeLabel;
    });
    return stockEntry?.stock ?? null;
  };
  const getSizeStock = (sizeLabel: string) =>
    stockLoaded ? (getStockLevel(sizeLabel) ?? 0) : null;

  function getQuantity(sizeLabel: string) {
    return quantityBySize[sizeLabel] ?? 0;
  }

  function setSizeQuantity(sizeLabel: string, update: number | ((current: number) => number)) {
    setQuantityBySize(current => {
      const stock = getSizeStock(sizeLabel);
      const existing = current[sizeLabel] ?? 0;
      const next = typeof update === 'function' ? update(existing) : update;
      const max = stock !== null ? stock : Number.POSITIVE_INFINITY;
      return {
        ...current,
        [sizeLabel]: Math.min(Math.max(0, next), max),
      };
    });
  }

  const selectedItems = visibleSizes
    .map(size => ({
      size,
      quantity: getQuantity(size.label),
      stock: getSizeStock(size.label),
    }))
    .filter(item => item.quantity > 0);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.size.price * item.quantity, 0);

  function handleAdd() {
    if (!stockLoaded || selectedItems.length === 0) return;
    if (selectedItems.some(item => item.stock === null || item.quantity > item.stock)) return;

    selectedItems.forEach(({ size, quantity }) => {
      addItem({
        productId: product.id,
        productName: product.name,
        size: size.label,
        price: size.price,
        image: product.image,
        tag: product.tag,
      }, quantity);
    });
    const summary = selectedItems.map(item => `${item.size.label} × ${item.quantity}`).join(', ');
    toast({ title: 'Added to cart!', description: `${product.name}: ${summary}` });
    onClose();
  }

  async function handleWishlist() {
    if (!token) { onClose(); window.location.href = '/account'; return; }
    if (wishlisted) return;
    try {
      await fetch(`${apiBase}/customer/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ productId: product.id, productName: product.name, price: getPrimaryProductSize(product).price, image: product.image }),
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
          <div style={{ position: 'relative', height: 250, flexShrink: 0, background: 'radial-gradient(circle at center, #4b2818 0%, #1a0d08 72%)' }}>
            <img src={product.image} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', padding: '8px 24px 18px', opacity: 1 }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.62) 100%)' }} />

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

            {/* Size variants — each size has its own stock and quantity control */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--muted-foreground))', marginBottom: 10 }}>
                Size, Price, Stock &amp; Quantity
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visibleSizes.map(s => {
                  const sizeStock = getSizeStock(s.label);
                  const sizeOutOfStock = sizeStock !== null && sizeStock === 0;
                  const sizeLowStock = sizeStock !== null && sizeStock > 0 && sizeStock < 10;
                  const sizeQuantity = getQuantity(s.label);
                  return (
                  <div
                    key={s.label}
                    style={{
                      padding: '11px 12px', borderRadius: 14,
                      border: `1.5px solid ${sizeQuantity > 0 ? 'rgba(181,58,46,0.45)' : 'rgba(139,94,60,0.2)'}`,
                      background: sizeOutOfStock ? 'rgba(107,114,128,0.06)' : sizeQuantity > 0 ? 'rgba(181,58,46,0.06)' : 'transparent',
                      fontFamily: 'inherit',
                      opacity: sizeOutOfStock ? 0.62 : 1,
                      display: 'grid', gridTemplateColumns: '1fr 0.8fr 1fr auto', alignItems: 'center', gap: 10,
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'hsl(var(--foreground))' }}>{s.label}</span>
                      <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Size</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: 'hsl(4,60%,44%)' }}>₹{s.price}</span>
                      <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Price</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: sizeOutOfStock ? 'hsl(220,9%,48%)' : sizeLowStock ? 'hsl(30,85%,42%)' : 'hsl(140,50%,32%)' }}>
                        {!stockLoaded ? 'Checking…' : sizeOutOfStock ? 'Out of stock' : `${sizeStock} in stock`}
                      </span>
                      <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Stock</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderRadius: 10, border: '1px solid rgba(139,94,60,0.2)', overflow: 'hidden' }}>
                      <button onClick={() => setSizeQuantity(s.label, q => q - 1)}
                        disabled={!stockLoaded || sizeQuantity === 0}
                        style={{ width: 29, height: 30, border: 'none', background: 'transparent', cursor: !stockLoaded || sizeQuantity === 0 ? 'not-allowed' : 'pointer', opacity: !stockLoaded || sizeQuantity === 0 ? 0.4 : 1 }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ width: 30, textAlign: 'center', fontSize: 13, fontWeight: 800, borderLeft: '1px solid rgba(139,94,60,0.15)', borderRight: '1px solid rgba(139,94,60,0.15)' }}>{sizeQuantity}</span>
                      <button onClick={() => setSizeQuantity(s.label, q => q + 1)}
                        disabled={!stockLoaded || sizeOutOfStock || (sizeStock !== null && sizeQuantity >= sizeStock)}
                        style={{ width: 29, height: 30, border: 'none', background: 'transparent', cursor: !stockLoaded || sizeOutOfStock || (sizeStock !== null && sizeQuantity >= sizeStock) ? 'not-allowed' : 'pointer', opacity: !stockLoaded || sizeOutOfStock || (sizeStock !== null && sizeQuantity >= sizeStock) ? 0.4 : 1 }}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 2px', borderTop: '1px solid rgba(139,94,60,0.1)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>
                {totalQuantity} item{totalQuantity !== 1 ? 's' : ''} selected
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'hsl(4,60%,44%)' }}>₹{totalAmount}</span>
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
              disabled={!stockLoaded || totalQuantity === 0}
              style={{
                flex: 1, padding: '15px', borderRadius: 18, border: 'none',
                background: !stockLoaded || totalQuantity === 0 ? 'hsl(220,9%,72%)' : 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                color: '#FFF9F0', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: !stockLoaded || totalQuantity === 0 ? 'none' : '0 8px 28px rgba(181,58,46,0.35)',
                fontFamily: 'inherit',
              }}
            >
              <ShoppingCart size={18} />
              {!stockLoaded ? 'Checking stock…' : totalQuantity === 0 ? 'Select a size' : `Add ${totalQuantity} item${totalQuantity !== 1 ? 's' : ''} to Cart — ₹${totalAmount}`}
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
