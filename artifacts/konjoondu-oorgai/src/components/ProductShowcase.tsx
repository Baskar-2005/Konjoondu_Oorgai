import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Flame, ShoppingCart, ArrowRight, Plus, Minus, Eye, Heart } from 'lucide-react';
import { useLocation } from 'wouter';
import { products } from '@/data/products';
import type { Product, ProductSize } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import ProductModal from '@/components/ProductModal';

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [, navigate] = useLocation();

  // Show first 8 products on homepage
  const featured = products.slice(0, 8);

  return (
    <section id="products" className="py-28 relative bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
            style={{ background: 'rgba(181,58,46,0.08)', color: 'hsl(4,60%,44%)', borderColor: 'rgba(181,58,46,0.2)' }}>
            🔴 Non-Veg Only
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-5">Our Handcrafted Range</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Small batches. Bold flavours. Prepared with the freshest meats and seafood — exactly how our grandmothers taught us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onViewDetails={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
              color: '#FFF9F0',
              boxShadow: '0 8px 28px rgba(181,58,46,0.3)',
            }}
          >
            View All Products
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}

function ProductCard({
  product, index, onViewDetails,
}: {
  product: Product;
  index: number;
  onViewDetails: () => void;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const { addItem } = useCart();
  const { token, apiBase } = useCustomer();

  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  const selectedSize: ProductSize = product.sizes[selectedSizeIdx];

  async function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (!token) { window.location.href = '/account'; return; }
    if (wishlisted) return;
    const selectedSize: ProductSize = product.sizes[selectedSizeIdx];
    try {
      await fetch(`${apiBase}/customer/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ productId: product.id, productName: product.name, price: selectedSize.price, image: product.image }),
      });
      setWishlisted(true);
    } catch { /* silent */ }
  }

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem({
      productId: product.id,
      productName: product.name,
      size: selectedSize.label,
      price: selectedSize.price,
      image: product.image,
      tag: product.tag,
    }, qty);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    setAdded(true);
    addedTimer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
      className="rounded-2xl overflow-hidden flex flex-col border shadow-sm hover:shadow-md transition-shadow duration-300"
      style={{ borderColor: 'rgba(139,94,60,0.12)', background: 'var(--background)' }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-muted flex-shrink-0 group">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Tag */}
        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow"
          style={{ background: 'hsl(4,60%,44%)' }}>
          {product.tag}
        </div>

        {/* View details eye */}
        <button
          onClick={e => { e.stopPropagation(); onViewDetails(); }}
          className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow"
          style={{ background: 'rgba(255,255,255,0.9)', color: 'hsl(4,60%,38%)' }}
          title="View details"
        >
          <Eye size={13} />
        </button>
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-12 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow"
          style={{ background: wishlisted ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.9)' }}
          title={wishlisted ? 'In wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} fill={wishlisted ? '#fff' : 'none'} color={wishlisted ? '#fff' : '#8b6344'} />
        </button>

        {/* Spice flames */}
        <div className="absolute bottom-3 left-3 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Flame key={i} size={12}
              className={i < product.spiceLevel ? 'fill-orange-400 text-orange-400' : 'text-white/30'} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
          {product.category}
        </p>
        <h3 className="text-base font-bold mb-1 leading-tight">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Size selector */}
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Size</p>
          <div className="flex gap-1.5 flex-wrap">
            {product.sizes.map((s, idx) => (
              <button
                key={s.label}
                onClick={e => { e.stopPropagation(); setSelectedSizeIdx(idx); setQty(1); }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-150"
                style={{
                  borderColor: selectedSizeIdx === idx ? 'hsl(4,60%,44%)' : 'rgba(139,94,60,0.2)',
                  background: selectedSizeIdx === idx ? 'rgba(181,58,46,0.1)' : 'transparent',
                  color: selectedSizeIdx === idx ? 'hsl(4,60%,44%)' : 'hsl(18,18%,35%)',
                  fontWeight: selectedSizeIdx === idx ? 700 : 600,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="text-2xl font-bold" style={{ color: 'hsl(4,60%,44%)' }}>
            ₹{selectedSize.price}
          </span>
          <span className="text-xs text-muted-foreground">/ {selectedSize.label}</span>
        </div>

        {/* Qty + Add to Cart */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center rounded-xl border overflow-hidden flex-shrink-0"
            style={{ borderColor: 'rgba(139,94,60,0.2)' }}>
            <button
              onClick={e => { e.stopPropagation(); setQty(q => Math.max(1, q - 1)); }}
              className="w-8 h-9 flex items-center justify-center transition-colors hover:bg-muted"
            >
              <Minus size={13} />
            </button>
            <span className="w-8 h-9 flex items-center justify-center text-sm font-bold border-x"
              style={{ borderColor: 'rgba(139,94,60,0.15)' }}>
              {qty}
            </span>
            <button
              onClick={e => { e.stopPropagation(); setQty(q => q + 1); }}
              className="w-8 h-9 flex items-center justify-center transition-colors hover:bg-muted"
            >
              <Plus size={13} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.button
              key={added ? 'added' : 'add'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={handleAdd}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{
                background: added
                  ? 'hsl(140,60%,38%)'
                  : 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                color: '#FFF9F0',
                boxShadow: added
                  ? '0 4px 14px rgba(34,197,94,0.25)'
                  : '0 4px 14px rgba(181,58,46,0.25)',
              }}
            >
              <ShoppingCart size={13} />
              {added ? 'Added ✓' : `Add · ₹${selectedSize.price * qty}`}
            </motion.button>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
