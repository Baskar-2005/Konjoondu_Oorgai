import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Flame, ShoppingCart, ArrowRight, Plus, Minus, Heart } from 'lucide-react';
import { useLocation } from 'wouter';
import { getPrimaryProductSize, products } from '@/data/products';
import type { Product, ProductSize } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import ProductModal from '@/components/ProductModal';

interface StockEntry {
  productName: string;
  size: string;
  stock: number;
}

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockData, setStockData] = useState<StockEntry[]>([]);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [isProductRowPaused, setIsProductRowPaused] = useState(false);
  const productRowRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { apiBase } = useCustomer();

  useEffect(() => {
    const row = productRowRef.current;
    if (!row) return;

    let frame = 0;
    let previousTime = 0;
    const scrollSpeed = 34;

    const animate = (time: number) => {
      if (!previousTime) previousTime = time;
      if (!isProductRowPaused && row.scrollWidth > row.clientWidth) {
        const elapsed = Math.min(time - previousTime, 100);
        row.scrollLeft += (scrollSpeed * elapsed) / 1000;
        if (row.scrollLeft >= row.scrollWidth - row.clientWidth - 1) {
          row.scrollLeft = 0;
        }
      }
      previousTime = time;
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isProductRowPaused]);

  // Keep all products in one horizontally scrolling row on the homepage.
  const featured = products;

  useEffect(() => {
    fetch(`${apiBase}/products/stock`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.stock)) setStockData(d.stock);
        setStockLoaded(true);
      })
      .catch(() => setStockLoaded(true));
  }, [apiBase]);

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

        <div
          ref={productRowRef}
          className="flex gap-3 sm:gap-5 overflow-x-auto pb-4"
          role="region"
          aria-label="Featured products"
          onMouseEnter={() => setIsProductRowPaused(true)}
          onMouseLeave={() => setIsProductRowPaused(false)}
          onTouchStart={() => setIsProductRowPaused(true)}
          onFocus={() => setIsProductRowPaused(true)}
          onBlur={e => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setIsProductRowPaused(false);
            }
          }}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            overscrollBehaviorX: 'contain',
          }}
        >
          {featured.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onViewDetails={() => setSelectedProduct(product)}
              stockData={stockData}
              stockLoaded={stockLoaded}
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
  product, index, onViewDetails, stockData, stockLoaded,
}: {
  product: Product;
  index: number;
  onViewDetails: () => void;
  stockData: StockEntry[];
  stockLoaded: boolean;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const { addItem } = useCart();
  const { token, apiBase } = useCustomer();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  const selectedSize: ProductSize = getPrimaryProductSize(product);
  const stockEntry = stockData.find(s => {
    const nameMatch = s.productName.toLowerCase().includes(product.name.toLowerCase()) ||
      product.name.toLowerCase().includes(s.productName.toLowerCase());
    return nameMatch && s.size === selectedSize.label;
  });
  // Missing inventory is unavailable, never unlimited.
  const stockLevel = stockEntry?.stock ?? (stockLoaded ? 0 : null);
  const isLowStock = stockLevel !== null && stockLevel > 0 && stockLevel < 10;
  const isOutOfStock = stockLevel !== null && stockLevel === 0;

  // Keep the selected quantity valid when live inventory arrives or changes.
  useEffect(() => {
    setQty(current => stockLevel === null
      ? Math.max(1, current)
      : Math.min(Math.max(1, current), Math.max(1, stockLevel)));
  }, [stockLevel]);

  async function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (!token) { window.location.href = '/account'; return; }
    if (wishlisted) return;
    const selectedSize: ProductSize = getPrimaryProductSize(product);
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
    if (!stockLoaded || isOutOfStock || (stockLevel !== null && qty > stockLevel)) {
      setQty(stockLevel !== null ? Math.max(1, stockLevel) : 1);
      return;
    }
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
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.08 }}
       className="w-[220px] sm:w-[245px] flex-shrink-0 rounded-2xl overflow-hidden flex flex-col border shadow-sm hover:shadow-lg transition-shadow duration-300"
      style={{ borderColor: 'rgba(139,94,60,0.14)', background: 'var(--background)' }}
    >
      {/* Image — portrait 3:4 aspect, object-cover fills cleanly */}
      <div className="relative overflow-hidden flex-shrink-0 group"
        style={{ aspectRatio: '3/4', background: '#120800', cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
        onClick={onViewDetails}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewDetails(); } }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Subtle gradient at bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category badge — top left */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
          style={{ background: 'rgba(181,58,46,0.88)', backdropFilter: 'blur(4px)' }}>
          {product.category}
        </div>

        {/* Wishlist + View — top right, show on hover */}
        <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={handleWishlist}
            className="p-1.5 rounded-full shadow"
            style={{ background: wishlisted ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.88)' }}>
            <Heart size={12} fill={wishlisted ? '#fff' : 'none'} color={wishlisted ? '#fff' : '#8b6344'} />
          </button>
        </div>

        {/* Spice level — bottom left */}
        <div className="absolute bottom-2.5 left-2.5 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Flame key={i} size={11}
              className={i < product.spiceLevel ? 'fill-orange-400 text-orange-400' : 'text-white/25'} />
          ))}
        </div>

        {/* Stock status — bottom right */}
        {isOutOfStock && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow"
            style={{ background: 'rgba(220,38,38,0.9)', color: '#fff' }}>
            Out of Stock 😅
          </div>
        )}
        {isLowStock && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow"
            style={{ background: 'rgba(245,158,11,0.9)', color: '#fff' }}>
            Only {stockLevel} left!
          </div>
        )}
      </div>

      {/* Info — compact, no description */}
      <div className="p-3 flex flex-col gap-2">
        {/* Name */}
        <h3 className="text-sm font-bold leading-tight line-clamp-1" style={{ fontFamily: 'Poppins,sans-serif' }}>
          {product.name}
        </h3>

        {/* Size chip + Price row */}
        <div className="flex items-center justify-between gap-2">
          {/* Primary size — largest in the array */}
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
            style={{ borderColor: 'rgba(139,94,60,0.22)', color: 'hsl(18,18%,38%)', background: 'rgba(139,94,60,0.06)' }}>
            {selectedSize.label}
          </span>
          <span className="text-base font-extrabold" style={{ color: 'hsl(4,60%,44%)', fontFamily: 'Poppins,sans-serif' }}>
            ₹{selectedSize.price}
          </span>
        </div>

        {/* Stock alert */}
        {isOutOfStock && (
          <p className="text-[11px] font-semibold rounded-lg px-2 py-1.5"
            style={{ background: 'rgba(107,114,128,0.08)', color: 'hsl(220,9%,42%)', border: '1px solid rgba(107,114,128,0.18)' }}>
            😅 Gaali aagiduchu — Restock Panidivom Nanba!
          </p>
        )}
        {isLowStock && (
          <p className="text-[11px] font-semibold rounded-lg px-2 py-1.5"
            style={{ background: 'rgba(239,68,68,0.07)', color: 'hsl(0,72%,44%)', border: '1px solid rgba(239,68,68,0.2)' }}>
            🔥 Only {stockLevel} left — order soon!
          </p>
        )}

        {/* Qty stepper + Add to cart */}
        <div className="flex items-center gap-1.5">
          {/* Stepper */}
          <div className="flex items-center rounded-lg border overflow-hidden flex-shrink-0"
            style={{ borderColor: 'rgba(139,94,60,0.2)' }}>
            <button onClick={e => { e.stopPropagation(); setQty(q => Math.max(1, q - 1)); }}
              className="w-7 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              disabled={!stockLoaded || isOutOfStock}>
              <Minus size={11} />
            </button>
            <span className="w-7 h-8 flex items-center justify-center text-xs font-bold border-x"
              style={{ borderColor: 'rgba(139,94,60,0.15)' }}>{qty}</span>
            <button onClick={e => { e.stopPropagation(); setQty(q => Math.min(q + 1, stockLevel !== null ? stockLevel : q + 1)); }}
              className="w-7 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              disabled={!stockLoaded || isOutOfStock || (stockLevel !== null && qty >= stockLevel)}>
              <Plus size={11} />
            </button>
          </div>

          {/* Add button */}
          <AnimatePresence mode="wait">
            <motion.button
              key={added ? 'added' : 'add'}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.13 }}
              onClick={handleAdd}
              disabled={!stockLoaded || isOutOfStock}
              className="flex-1 h-8 flex items-center justify-center gap-1 rounded-lg text-[11px] font-bold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isOutOfStock ? 'hsl(220,9%,72%)' : added ? 'hsl(140,60%,38%)' : 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                color: '#FFF9F0',
                boxShadow: isOutOfStock ? 'none' : added ? '0 3px 10px rgba(34,197,94,0.22)' : '0 3px 10px rgba(181,58,46,0.22)',
              }}
            >
              <ShoppingCart size={11} />
              {!stockLoaded ? 'Checking stock…' : isOutOfStock ? 'Out of Stock' : added ? 'Added ✓' : `Add · ₹${selectedSize.price * qty}`}
            </motion.button>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
