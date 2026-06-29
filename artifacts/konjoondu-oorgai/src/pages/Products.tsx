import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Flame, ShoppingCart, Search, SlidersHorizontal, Plus, Minus, Eye } from 'lucide-react';
import { products, categories } from '@/data/products';
import type { Product, ProductSize } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navigation from '@/components/Navigation';
import ProductModal from '@/components/ProductModal';
import Footer from '@/components/Footer';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tag.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <ThemeProvider defaultTheme="light">
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
        <Navigation />

        {/* Hero banner */}
        <section
          className="pt-32 pb-14 relative overflow-hidden"
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
          style={{ background: 'var(--background)', borderColor: 'rgba(139,94,60,0.12)' }}>
          <div className="container mx-auto px-6 py-3.5">
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
          </div>
        </div>

        {/* Grid */}
        <main className="container mx-auto px-6 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <SlidersHorizontal size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i}
                    onViewDetails={() => setSelectedProduct(product)} />
                ))}
              </div>
            </>
          )}
        </main>

        <Footer />
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </ThemeProvider>
  );
}

function ProductCard({ product, index, onViewDetails }: {
  product: Product; index: number; onViewDetails: () => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const { addItem } = useCart();

  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  const selectedSize: ProductSize = product.sizes[selectedSizeIdx];

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
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      className="rounded-2xl overflow-hidden flex flex-col border shadow-sm hover:shadow-md transition-shadow duration-300"
      style={{ borderColor: 'rgba(139,94,60,0.12)', background: 'hsl(var(--background))' }}
    >
      {/* ── Image ── */}
      <div className="relative h-56 overflow-hidden bg-muted flex-shrink-0 group">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {/* Tag */}
        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow"
          style={{ background: 'hsl(4,60%,44%)' }}>
          {product.tag}
        </div>

        {/* View details button on hover */}
        <button
          onClick={e => { e.stopPropagation(); onViewDetails(); }}
          className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow"
          style={{ background: 'rgba(255,255,255,0.9)', color: 'hsl(4,60%,38%)' }}
          title="View details"
        >
          <Eye size={13} />
        </button>

        {/* Spice */}
        <div className="absolute bottom-3 left-3 flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Flame key={i} size={12}
              className={i < product.spiceLevel ? 'fill-orange-400 text-orange-400' : 'text-white/30'} />
          ))}
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category + name */}
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
          {product.category}
        </p>
        <h3 className="text-base font-bold mb-1 leading-tight">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* ── Size selector ── */}
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Size
          </p>
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

        {/* ── Price ── */}
        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="text-2xl font-bold" style={{ color: 'hsl(4,60%,44%)' }}>
            ₹{selectedSize.price}
          </span>
          <span className="text-xs text-muted-foreground">/ {selectedSize.label}</span>
        </div>

        {/* ── Qty stepper + Add to Cart ── */}
        <div className="flex items-center gap-2 mt-auto">
          {/* Stepper */}
          <div className="flex items-center rounded-xl border overflow-hidden flex-shrink-0"
            style={{ borderColor: 'rgba(139,94,60,0.2)' }}>
            <button
              onClick={e => { e.stopPropagation(); setQty(q => Math.max(1, q - 1)); }}
              className="w-8 h-9 flex items-center justify-center transition-colors hover:bg-muted text-sm"
            >
              <Minus size={13} />
            </button>
            <span className="w-8 h-9 flex items-center justify-center text-sm font-bold border-x"
              style={{ borderColor: 'rgba(139,94,60,0.15)' }}>
              {qty}
            </span>
            <button
              onClick={e => { e.stopPropagation(); setQty(q => q + 1); }}
              className="w-8 h-9 flex items-center justify-center transition-colors hover:bg-muted text-sm"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add to Cart */}
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
                boxShadow: added ? '0 4px 14px rgba(34,197,94,0.25)' : '0 4px 14px rgba(181,58,46,0.25)',
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
