import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

import prawnImg from '@assets/Prawn_Pickle_250g_1782723290485.jpeg';
import chickenImg from '@assets/Chicken_Pickle_250g_1782723290486.jpeg';
import muttonImg from '@assets/Mutton_Pickle_250g_1782723290485.jpeg';
import beefImg from '@assets/Beef_Pickle_250g_1782723290488.jpeg';
import nethiliPickleImg from '@assets/Nethili_Pickle_250g_1782723290489.jpeg';
import nethiliSambalImg from '@assets/Nethili_Sambal_200g_1782723290488.jpeg';
import nethiliKaruvaduImg from '@assets/Nethili_Karuvaadu_250g_1782723290487.jpeg';
import sooraiImg from '@assets/Soorai_Pickle_250g_1782723290487.jpeg';
import vaalaImg from '@assets/Vaala_Karuvaadu_250g_1782723290489.jpeg';
import maldivesImg from '@assets/Maldives_Fish_Sambal_200g_1782723290485.jpeg';
import idlyPodiImg from '@assets/Chennakuni_Idly_Podi_200g_1782723290484.jpeg';

const products = [
  {
    id: 1,
    name: 'Prawn Pickle',
    description: 'Juicy prawns marinated in a bold blend of red chillies, gingelly oil, and traditional spices. A coastal delicacy in a jar.',
    spiceLevel: 4,
    size: '250g',
    image: prawnImg,
    color: 'bg-orange-500/10 border-orange-500/20',
    tag: 'Pickle'
  },
  {
    id: 2,
    name: 'Chicken Pickle',
    description: 'Tender chicken pieces slow-roasted and pickled in mustard oil with fiery whole spices. Rich, bold, and deeply satisfying.',
    spiceLevel: 4,
    size: '250g',
    image: chickenImg,
    color: 'bg-red-500/10 border-red-500/20',
    tag: 'Pickle'
  },
  {
    id: 3,
    name: 'Mutton Pickle',
    description: 'Slow-cooked mutton pieces with bone, marinated in a powerful masala that gets richer with every passing day.',
    spiceLevel: 5,
    size: '250g',
    image: muttonImg,
    color: 'bg-rose-600/10 border-rose-600/20',
    tag: 'Pickle'
  },
  {
    id: 4,
    name: 'Beef Pickle',
    description: 'Tender beef cubes cooked in a deep, aromatic masala and preserved in gingelly oil. Intense and unforgettable.',
    spiceLevel: 5,
    size: '250g',
    image: beefImg,
    color: 'bg-red-700/10 border-red-700/20',
    tag: 'Pickle'
  },
  {
    id: 5,
    name: 'Nethili Pickle',
    description: 'Anchovies (nethili) pickled in tamarind, chilli, and traditional spices. A tangy, savoury treat perfect with plain rice.',
    spiceLevel: 4,
    size: '250g',
    image: nethiliPickleImg,
    color: 'bg-amber-500/10 border-amber-500/20',
    tag: 'Pickle'
  },
  {
    id: 6,
    name: 'Nethili Sambal',
    description: 'Dry-roasted anchovies blended with chillies and aromatics into a coarse, punchy sambal. Addictive with everything.',
    spiceLevel: 3,
    size: '200g',
    image: nethiliSambalImg,
    color: 'bg-yellow-600/10 border-yellow-600/20',
    tag: 'Sambal'
  },
  {
    id: 7,
    name: 'Nethili Karuvaadu',
    description: 'Sun-dried anchovies packed with deep sea flavour. A pantry staple that elevates any South Indian meal.',
    spiceLevel: 2,
    size: '250g',
    image: nethiliKaruvaduImg,
    color: 'bg-orange-700/10 border-orange-700/20',
    tag: 'Karuvaadu'
  },
  {
    id: 8,
    name: 'Soorai Pickle',
    description: 'Tuna (soorai) pickled in a bold, tangy masala. Rich in protein and loaded with the unmistakable taste of the sea.',
    spiceLevel: 4,
    size: '250g',
    image: sooraiImg,
    color: 'bg-teal-600/10 border-teal-600/20',
    tag: 'Pickle'
  },
  {
    id: 9,
    name: 'Vaala Karuvaadu',
    description: 'Ribbon fish (vaala) sun-dried to perfection — a beloved coastal delicacy with a firm texture and bold flavour.',
    spiceLevel: 2,
    size: '250g',
    image: vaalaImg,
    color: 'bg-slate-500/10 border-slate-500/20',
    tag: 'Karuvaadu'
  },
  {
    id: 10,
    name: 'Maldives Fish Sambal',
    description: 'Smoked Maldives fish ground with chillies and spices into a bold, umami-rich sambal. A Sri Lankan coastal classic.',
    spiceLevel: 3,
    size: '200g',
    image: maldivesImg,
    color: 'bg-amber-700/10 border-amber-700/20',
    tag: 'Sambal'
  },
  {
    id: 11,
    name: 'Chennakunni Idly Podi',
    description: 'A fragrant, coarse spice powder made with roasted gram, dried chillies, curry leaves, and traditional masala. Perfect with idly and dosa.',
    spiceLevel: 2,
    size: '200g',
    image: idlyPodiImg,
    color: 'bg-orange-400/10 border-orange-400/20',
    tag: 'Podi'
  },
];

export default function ProductShowcase() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

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
            Small batches. Bold flavours. Prepared with the freshest meats and seafood — exactly how our grandmothers taught us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
      transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
      whileHover={{ y: -8 }}
      className="glass rounded-3xl overflow-hidden group flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur text-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          {product.size}
        </div>
        <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
          {product.tag}
        </div>
      </div>

      <div className={`p-6 flex-1 flex flex-col ${product.color}`}>
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-6 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium mr-1 text-foreground/60">Spice:</span>
            {[...Array(5)].map((_, i) => (
              <Flame
                key={i}
                size={15}
                className={i < product.spiceLevel ? "fill-primary text-primary" : "text-muted-foreground/30"}
              />
            ))}
          </div>
        </div>

        <a
          href="#contact"
          className="w-full rounded-xl py-2.5 text-sm font-bold text-center transition-all duration-300 shadow-md"
          style={{
            background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
            color: '#FFF9F0',
          }}
        >
          Order Now
        </a>
      </div>
    </motion.div>
  );
}
