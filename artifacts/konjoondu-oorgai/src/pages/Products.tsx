import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Flame, ShoppingCart, Search, SlidersHorizontal, Plus, Minus, Clock, Heart } from 'lucide-react';
import { getPrimaryProductSize, products, categories } from '@/data/products';
import type { Product, ProductSize } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useCustomer } from '@/context/CustomerContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navigation from '@/components/Navigation';
import ProductModal from '@/components/ProductModal';
import Footer from '@/components/Footer';

const RECENTLY_VIEWED_KEY = 'ko_recently_viewed';
const MAX_RECENT = 4;
const sizeFilters = ['All', ...Array.from(
  new Set(products.flatMap(product => product.sizes.map(size => size.label))),
).sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10))];

function getRecentlyViewed(): number[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentlyViewed(id: number) {
  try {
    const current = getRecentlyViewed().filter(i => i !== id);
    const updated = [id, ...current].slice(0, MAX_RECENT);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

interface StockEntry { productName: string; size: string; stock: number; }

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [stockData, setStockData] = useState<StockEntry[]>([]);
  const [stockLoaded, setStockLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/products/stock`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.stock)) setStockData(d.stock);
        setStockLoaded(true);
      })
      .catch(() => setStockLoaded(true));
  }, []);

  // Load recently viewed on mount and refresh when modal closes
  useEffect(() => {
    setRecentIds(getRecentlyViewed());
  }, [selectedProduct]);

  function openProduct(product: Product) {
    addRecentlyViewed(product.id);
    setSelectedProduct(product);
  }

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Each package size is a separate card so customers can compare variants directly.
  const flatItems = filtered.flatMap(p =>
    p.sizes
      .filter(size => selectedSize === 'All' || size.label === selectedSize)
      .map(size => ({
        ...p,
        sizes: [size] as Product['sizes'],
        _cardKey: `${p.id}-${size.label}`,
      })),
  );
  const visibleProductCount = new Set(flatItems.map(item => item.id)).size;

  const recentProducts = recentIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <ThemeProvider defaultTheme="light">
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
        <Navigation />

        {/* Hero banner */}
        <section
          className="pt-24 sm:pt-32 pb-8 sm:pb-14 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(4,60%,14%) 0%, hsl(18,45%,16%) 100%)' }}
        >
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(25,80%,60%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(4,80%,50%) 0%, transparent 50%)' }} />
          <div className="container mx-auto px-6 text-center relative">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border"
              style={{ background: 'rgba(181,58,46,0.18)', color: 'hsl(25,80%,72%)', borderColor: 'rgba(181,58,46,0.25)' }}
            >
              🔴 Non-Veg Only
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              Our Full Range
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,249,240,0.65)' }}
            >
              Handcrafted in Cuddalore. Bold flavours from fresh meats &amp; seafood.
            </motion.p>
          </div>
        </section>

        {/* Filters bar */}
        <div className="sticky top-0 z-40 border-b shadow-sm"
          style={{ background: 'hsl(var(--background))', borderColor: 'rgba(139,94,60,0.12)' }}>
          <div className="container mx-auto px-4 sm:px-6 py-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" placeholder="Search products…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none"
                  style={{ borderColor: 'rgba(139,94,60,0.2)', background: 'transparent' }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: selectedCategory === cat ? 'hsl(4,60%,44%)' : 'rgba(181,58,46,0.08)',
                      color: selectedCategory === cat ? '#FFF9F0' : 'hsl(4,60%,44%)',
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t"
              style={{ borderColor: 'rgba(139,94,60,0.1)' }}>
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground mr-1">
                Size
              </span>
              {sizeFilters.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: selectedSize === size ? 'hsl(18,45%,28%)' : 'rgba(139,94,60,0.08)',
                    color: selectedSize === size ? '#FFF9F0' : 'hsl(18,45%,28%)',
                  }}>
                  {size === 'All' ? 'All sizes' : size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <main className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
          {flatItems.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <SlidersHorizontal size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm mt-1">Try a different search, category, or size</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {flatItems.length} variant{flatItems.length !== 1 ? 's' : ''} · {visibleProductCount} product{visibleProductCount !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {flatItems.map((item, i) => {
                  const fullProduct = products.find(p => p.id === item.id) ?? item;
                  return (
                    <ProductCard key={item._cardKey} product={item} index={i}
                      onViewDetails={() => openProduct(fullProduct)} stockData={stockData} stockLoaded={stockLoaded} />
                  );
                })}
              </div>
            </>
          )}
        </main>

        {/* Recently Viewed */}
        {recentProducts.length > 0 && (
          <section className="border-t" style={{ borderColor: 'rgba(139,94,60,0.12)' }}>
            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
              <div className="flex items-center gap-3 mb-8">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(181,58,46,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Clock size={18} color="hsl(4,60%,44%)" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Recently Viewed</h2>
                  <p className="text-xs text-muted-foreground">Pick up where you left off</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {recentProducts.map((product, i) => (
                  <RecentCard key={product.id} product={product} index={i}
                    onViewDetails={() => openProduct(product)} />
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </ThemeProvider>
  );
}

function ProductCard({ product, index, onViewDetails, stockData, stockLoaded }: {
  product: Product; index: number; onViewDetails: () => void;
  stockData: StockEntry[]; stockLoaded: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const { addItem } = useCart();

  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  const selectedSize: ProductSize = product.sizes[selectedSizeIdx];

  // Find stock level for selected size
  const stockEntry = stockData?.find(s => {
    const nameMatch = s.productName.toLowerCase().includes(product.name.toLowerCase()) ||
      product.name.toLowerCase().includes(s.productName.toLowerCase());
    const sizeMatch = s.size === selectedSize.label;
    return nameMatch && sizeMatch;
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
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      className="rounded-2xl overflow-hidden flex flex-col border shadow-sm hover:shadow-lg transition-shadow duration-300"
      style={{ borderColor: 'rgba(139,94,60,0.14)', background: 'hsl(var(--background))' }}
    >
      {/* Image — portrait 3:4 ratio, object-cover, no blank areas */}
       <div className="relative overflow-hidden flex-shrink-0 group"
         style={{ aspectRatio: '3/4', background: '#120800', cursor: 'pointer' }}
         role="button"
         tabIndex={0}
         aria-label={`View details for ${product.name}`}
         onClick={onViewDetails}
         onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewDetails(); } }}>
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
          style={{ background: 'rgba(181,58,46,0.88)', backdropFilter: 'blur(4px)' }}>
          {product.category}
        </div>

        {/* Stock badge on image */}
        {isOutOfStock && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow"
            style={{ background: 'rgba(220,38,38,0.9)', color: '#fff' }}>
            Out of Stock 😅
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow"
            style={{ background: 'rgba(245,158,11,0.9)', color: '#fff' }}>
            Only {stockLevel} left!
          </div>
        )}

        {/* Spice flames */}
        <div className="absolute bottom-2.5 left-2.5 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Flame key={i} size={11}
              className={i < product.spiceLevel ? 'fill-orange-400 text-orange-400' : 'text-white/25'} />
          ))}
        </div>
      </div>

      {/* Info — compact */}
      <div className="p-3 flex flex-col gap-2">
        {/* Name */}
        <h3 className="text-sm font-bold leading-tight line-clamp-1" style={{ fontFamily: 'Poppins,sans-serif' }}>
          {product.name}
        </h3>

        {/* Size + Price */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
            style={{ borderColor: 'rgba(139,94,60,0.22)', color: 'hsl(18,18%,38%)', background: 'rgba(139,94,60,0.06)' }}>
            {selectedSize.label}
          </span>
          <span className="text-base font-extrabold" style={{ color: 'hsl(4,60%,44%)', fontFamily: 'Poppins,sans-serif' }}>
            ₹{selectedSize.price}
          </span>
        </div>

        {/* Stock alert text */}
        {isOutOfStock && (
          <p className="text-[11px] font-semibold rounded-lg px-2 py-1.5"
            style={{ background: 'rgba(107,114,128,0.08)', color: 'hsl(220,9%,42%)', border: '1px solid rgba(107,114,128,0.18)' }}>
            😅 Gaali aagiduchu — Restock Panidivom Nanba!
          </p>
        )}
        {isLowStock && !isOutOfStock && (
          <p className="text-[11px] font-semibold rounded-lg px-2 py-1.5"
            style={{ background: 'rgba(239,68,68,0.07)', color: 'hsl(0,72%,44%)', border: '1px solid rgba(239,68,68,0.2)' }}>
            🔥 Only {stockLevel} left — order soon!
          </p>
        )}

        {/* Qty stepper + Add to cart */}
        <div className="flex items-center gap-1.5 mt-auto">
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
              }}>
              <ShoppingCart size={11} />
              {!stockLoaded ? 'Checking stock…' : isOutOfStock ? 'Out of Stock' : added ? 'Added ✓' : `Add · ₹${selectedSize.price * qty}`}
            </motion.button>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function RecentCard({ product, index, onViewDetails }: {
  product: Product; index: number; onViewDetails: () => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const { addItem } = useCart();
  const { token, apiBase } = useCustomer();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const firstSize = getPrimaryProductSize(product);

  async function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (!token) { window.location.href = '/account'; return; }
    if (wishlisted) return;
    try {
      await fetch(`${apiBase}/customer/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify({ productId: product.id, productName: product.name, price: firstSize.price, image: product.image }),
      });
      setWishlisted(true);
    } catch { /* silent */ }
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem({
      productId: product.id,
      productName: product.name,
      size: firstSize.label,
      price: firstSize.price,
      image: product.image,
      tag: product.tag,
    }, 1);
    if (timer.current) clearTimeout(timer.current);
    setAdded(true);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onClick={onViewDetails}
      className="rounded-xl overflow-hidden border cursor-pointer group transition-all duration-200 hover:shadow-md"
      style={{ borderColor: 'rgba(139,94,60,0.12)', background: 'hsl(var(--background))' }}
    >
      {/* Image */}
      <div className="relative h-32 overflow-hidden bg-muted">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ background: 'hsl(4,60%,44%)' }}>
          {product.tag}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">{product.category}</p>
        <p className="text-sm font-bold leading-tight mb-2 line-clamp-1">{product.name}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold" style={{ color: 'hsl(4,60%,44%)' }}>₹{firstSize.price}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={handleWishlist} title={wishlisted ? 'In wishlist' : 'Add to wishlist'}
              className="flex items-center justify-center w-7 h-7 rounded-lg"
              style={{ background: wishlisted ? 'rgba(239,68,68,0.1)' : 'rgba(139,94,60,0.08)', border: 'none', cursor: 'pointer' }}>
              <Heart size={12} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#8b6344'} />
            </button>
            <AnimatePresence mode="wait">
              <motion.button
                key={added ? 'done' : 'add'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
                onClick={handleQuickAdd}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                style={{
                  background: added ? 'hsl(140,60%,38%)' : 'rgba(181,58,46,0.1)',
                  color: added ? '#fff' : 'hsl(4,60%,44%)',
                }}>
                {added ? '✓' : <ShoppingCart size={11} />}
                {added ? 'Added' : 'Add'}
              </motion.button>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
