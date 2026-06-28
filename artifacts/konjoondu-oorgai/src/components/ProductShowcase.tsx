import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

import mangoImg from '@assets/pickle-mango.jpg';
import lemonImg from '@assets/pickle-lemon.jpg';
import garlicImg from '@assets/pickle-garlic.jpg';
import mixedImg from '@assets/pickle-mixed.jpg';
import vaalaiImg from '@assets/pickle-vaalai.jpg';
import gonguraImg from '@assets/pickle-gongura.jpg';
import tomatoImg from '@assets/pickle-tomato.jpg';
import citronImg from '@assets/pickle-citron.jpg';

const products = [
  {
    id: 1,
    name: 'Mango Pickle',
    description: 'Fresh Rajapalayam mangoes cut and marinated with our signature blend of traditional spices.',
    spiceLevel: 3,
    price: '₹250',
    image: mangoImg,
    color: 'bg-yellow-500/10 border-yellow-500/20'
  },
  {
    id: 2,
    name: 'Lemon Pickle',
    description: 'Juicy lemons sun-cured to perfection. Tangy, slightly sweet, and immensely flavorful.',
    spiceLevel: 2,
    price: '₹220',
    image: lemonImg,
    color: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    id: 3,
    name: 'Garlic Pickle',
    description: 'Peeled garlic cloves roasted in gingelly oil and mixed with fiery ground spices.',
    spiceLevel: 4,
    price: '₹300',
    image: garlicImg,
    color: 'bg-orange-500/10 border-orange-500/20'
  },
  {
    id: 4,
    name: 'Mixed Vegetable',
    description: 'A crunchy medley of carrots, mangoes, and chilies. The perfect versatile side.',
    spiceLevel: 3,
    price: '₹260',
    image: mixedImg,
    color: 'bg-red-500/10 border-red-500/20'
  },
  {
    id: 5,
    name: 'Vaalai Thokku',
    description: 'Tender banana stem cooked down into a rich, savory, and uniquely textured thokku.',
    spiceLevel: 4,
    price: '₹280',
    image: vaalaiImg,
    color: 'bg-green-600/10 border-green-600/20'
  },
  {
    id: 6,
    name: 'Gongura Pickle',
    description: 'The iconic tangy sorrel leaves from Andhra, tempered with mustard and dried red chilies.',
    spiceLevel: 5,
    price: '₹290',
    image: gonguraImg,
    color: 'bg-green-700/10 border-green-700/20'
  },
  {
    id: 7,
    name: 'Tomato Thokku',
    description: 'Ripe country tomatoes slow-cooked into a tangy, sweet, and spicy jam-like consistency.',
    spiceLevel: 2,
    price: '₹240',
    image: tomatoImg,
    color: 'bg-red-600/10 border-red-600/20'
  },
  {
    id: 8,
    name: 'Citron Pickle',
    description: 'Narthangai (Citron) known for its digestive properties, cured for weeks for a deep flavor.',
    spiceLevel: 1,
    price: '₹260',
    image: citronImg,
    color: 'bg-lime-500/10 border-lime-500/20'
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Handcrafted Range</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Small batches. Authentic recipes. Prepared exactly how our grandmothers taught us.
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
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}