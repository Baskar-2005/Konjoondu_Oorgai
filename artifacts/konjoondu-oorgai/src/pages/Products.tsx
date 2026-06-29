import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Flame, ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';
import { products, categories } from '@/data/products';
import type { Product } from '@/data/products';
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
        {/* CartDrawer is mounted globally in App.tsx — not duplicated here */}

        {/* Hero banner */}
        <section
          className="pt-32 pb-12 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, hsl(4,60%,16%) 0%, hsl(18,40%,18%) 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, hsl(25,80%,60%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(4,80%,50%) 0%, transparent 50%)',
            }}
          />
          <div className="container mx-auto px-6 text-center relative">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border"
              style={{
                background: 'rgba(181,58,46,0.2)',
                color: 'hsl(25,80%,75%)',
                borderColor: 'rgba(181,58,46,0.3)',
              }}
            >
              🔴 Non-Veg Only
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              Our Full Range
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg max-w-xl mx-auto"
              style={{ color: 'rgba(255,249,240,0.7)' }}
            >
              Handcrafted in Cuddalore. Bold flavours from fresh meats &amp; seafood — the
              Konjoondu way.
            </motion.p>
          </div>
        </section>

        {/* Filters */}
        <div
          className="sticky top-0 z-40 border-b"
          style={{ background: 'var(--background)', borderColor: 'rgba(139,94,60,0.12)' }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search products…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: 'rgba(139,94,60,0.2)', background: 'transparent' }}
                />
              </div>

              {/* Category filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background:
                        selectedCategory === cat ? 'hsl(4,60%,44%)' : 'rgba(181,58,46,0.08)',
                      color: selectedCategory === cat ? '#FFF9F0' : 'hsl(4,60%,44%)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <main className="container mx-auto px-6 py-12">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <SlidersHorizontal size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-8">
                Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    onOpen={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </>
          )}
        </main>

        <Footer />

        {/* Product detail modal */}
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </ThemeProvider>
  );
}

function ProductCard({
  product,
  index,
  onOpen,
}: {
  product: Product;
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const lowestPrice = Math.min(...product.sizes.map(s => s.price));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      whileHover={{ y: -6 }}
      className="glass rounded-3xl overflow-hidden group flex flex-col h-full cursor-pointer"
      onClick={onOpen}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-muted flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div
          className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
          style={{ background: 'hsl(4,60%,44%)' }}
        >
          {product.tag}
        </div>
        <div
          className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
        >
          from ₹{lowestPrice}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={e => {
              e.stopPropagation();
              onOpen();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: 'rgba(255,249,240,0.95)', color: 'hsl(4,60%,38%)' }}
          >
            <ShoppingCart size={15} />
            View &amp; Add
          </button>
        </div>
      </div>

      {/* Details */}
      <div className={`p-5 flex-1 flex flex-col ${product.color}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
          {product.category}
        </p>
        <h3 className="text-lg font-bold mb-1.5">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">
          {product.description}
        </p>

        {/* Sizes + prices */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {product.sizes.map(s => (
            <span
              key={s.label}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold border"
              style={{ borderColor: 'rgba(139,94,60,0.2)', color: 'hsl(18,18%,30%)' }}
            >
              {s.label} — ₹{s.price}
            </span>
          ))}
        </div>

        {/* Spice + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Flame
                key={i}
                size={13}
                className={
                  i < product.spiceLevel
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground/25'
                }
              />
            ))}
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              onOpen();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'hsl(4,60%,44%)', color: '#FFF9F0' }}
          >
            Order
          </button>
        </div>
      </div>
    </motion.div>
  );
}
