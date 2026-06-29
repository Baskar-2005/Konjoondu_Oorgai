import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

// Placeholder images for non-veg pickles (will be replaced when drive images are downloaded)
const products = [
  {
    id: 1,
    name: 'Prawn Pickle',
    description: 'Juicy prawns marinated in a bold blend of red chillies, gingelly oil, and traditional spices. A coastal delicacy in a jar.',
    spiceLevel: 4,
    price: '₹350',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
    color: 'bg-orange-500/10 border-orange-500/20',
    badge: '🔴 Non-Veg'
  },
  {
    id: 2,
    name: 'Fish Pickle',
    description: 'Sun-dried country fish slow-cooked in tamarind, chilli, and aromatic spices. Deep, bold flavour that lasts.',
    spiceLevel: 3,
    price: '₹320',
    image: 'https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=600&q=80',
    color: 'bg-amber-500/10 border-amber-500/20',
    badge: '🔴 Non-Veg'
  },
  {
    id: 3,
    name: 'Chicken Pickle',
    description: 'Tender chicken pieces slow-roasted and pickled in mustard oil with fiery whole spices. Finger-licking good.',
    spiceLevel: 4,
    price: '₹380',
    image: 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=600&q=80',
    color: 'bg-red-500/10 border-red-500/20',
    badge: '🔴 Non-Veg'
  },
  {
    id: 4,
    name: 'Mutton Pickle',
    description: 'Slow-cooked mutton pieces with bone, marinated in a powerful masala that gets better with every passing day.',
    spiceLevel: 5,
    price: '₹420',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80',
    color: 'bg-rose-600/10 border-rose-600/20',
    badge: '🔴 Non-Veg'
  },
  {
    id: 5,
    name: 'Anchovies Pickle',
    description: 'Tiny nethili fish packed with omega-3, turned into an intensely savoury and spicy pickle. Perfect with rice.',
    spiceLevel: 4,
    price: '₹300',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80',
    color: 'bg-yellow-600/10 border-yellow-600/20',
    badge: '🔴 Non-Veg'
  },
  {
    id: 6,
    name: 'Crab Pickle',
    description: 'Fresh crab cooked in a rich, spicy oil-based masala. Rare, indulgent, and deeply satisfying.',
    spiceLevel: 5,
    price: '₹450',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
    color: 'bg-orange-700/10 border-orange-700/20',
    badge: '🔴 Non-Veg'
  },
  {
    id: 7,
    name: 'Egg Pickle',
    description: 'Hard-boiled eggs cured in a tangy, spicy vinegar-based brine. A unique homestyle treat.',
    spiceLevel: 3,
    price: '₹280',
    image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&q=80',
    color: 'bg-amber-400/10 border-amber-400/20',
    badge: '🔴 Non-Veg'
  },
  {
    id: 8,
    name: 'Mixed Non-Veg Pickle',
    description: 'A bold combination of prawn, fish, and chicken pickled together in our signature masala blend.',
    spiceLevel: 5,
    price: '₹400',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    color: 'bg-red-700/10 border-red-700/20',
    badge: '🔴 Non-Veg'
  }
];

export default function ProductShowcase() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section id="products" className="py-32 relative bg-muted/30" ref={containerRef}>
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
            style={{ background: 'rgba(181,58,46,0.08)', color: 'hsl(4,60%,44%)', borderColor: 'rgba(181,58,46,0.2)' }}>
            🔴 Non-Veg Only
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Handcrafted Range</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Small batches. Bold flavours. Prepared with the finest meats and seafood — exactly how our grandmothers taught us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index }: { product: any, index: number }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, rotate: 1 }}
      className="glass rounded-3xl overflow-hidden group flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur text-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          {product.price}
        </div>
        <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
          Non-Veg
        </div>
      </div>
      
      <div className={`p-6 flex-1 flex flex-col ${product.color}`}>
        <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-6 flex-1">{product.description}</p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium mr-1 text-foreground/60">Spice:</span>
            {[...Array(5)].map((_, i) => (
              <Flame 
                key={i} 
                size={16} 
                className={i < product.spiceLevel ? "fill-primary text-primary" : "text-muted-foreground/30"} 
              />
            ))}
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <span className="px-2 py-1 rounded-md border border-border bg-background/50">200g</span>
            <span className="px-2 py-1 rounded-md border border-border bg-background/50">500g</span>
          </div>
        </div>
        
        <Button className="w-full rounded-xl bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md">
          Order Now
        </Button>
      </div>
    </motion.div>
  );
}
