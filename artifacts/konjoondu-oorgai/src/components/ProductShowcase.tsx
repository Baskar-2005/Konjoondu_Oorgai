import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Flame, ShoppingCart, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { products } from '@/data/products';
import type { Product } from '@/data/products';
import ProductModal from '@/components/ProductModal';

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [, navigate] = useLocation();

  // Show first 8 products on homepage
  const featured = products.slice(0, 8);

  return (
    <section id="products" className="py-32 relative bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
            style={{ background: 'rgba(181,58,46,0.08)', color: 'hsl(4,60%,44%)', borderColor: 'rgba(181,58,46,0.2)' }}>
            🔴 Non-Veg Only
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Handcrafted Range</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Small batches. Bold flavours. Prepared with the freshest meats and seafood — exactly how our grandmothers taught us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featured.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onOpen={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105"
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

function ProductCard({ product, index, onOpen }: { product: Product; index: number; onOpen: () => void }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const lowestPrice = Math.min(...product.sizes.map(s => s.price));

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
      whileHover={{ y: -8 }}
      className="glass rounded-3xl overflow-hidden group flex flex-col h-full cursor-pointer"
      onClick={onOpen}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          from ₹{lowestPrice}
        </div>
        <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
          {product.tag}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={e => { e.stopPropagation(); onOpen(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg"
            style={{ background: 'rgba(255,249,240,0.95)', color: 'hsl(4,60%,38%)' }}
          >
            <ShoppingCart size={15} />
            View & Order
          </button>
        </div>
      </div>

      {/* Details */}
      <div className={`p-6 flex-1 flex flex-col ${product.color}`}>
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">{product.description}</p>

        {/* Size / price chips */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {product.sizes.map(s => (
            <span key={s.label}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold border"
              style={{ borderColor: 'rgba(139,94,60,0.2)', color: 'hsl(18,18%,30%)' }}>
              {s.label} · ₹{s.price}
            </span>
          ))}
        </div>

        {/* Spice + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium mr-1 text-foreground/60">Spice:</span>
            {[...Array(5)].map((_, i) => (
              <Flame key={i} size={15}
                className={i < product.spiceLevel ? 'fill-primary text-primary' : 'text-muted-foreground/30'} />
            ))}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onOpen(); }}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'hsl(4,60%,44%)', color: '#FFF9F0' }}
          >
            Order
          </button>
        </div>
      </div>
    </motion.div>
  );
}
