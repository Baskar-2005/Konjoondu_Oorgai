import React from 'react';
import { motion } from 'framer-motion';

import recipe1 from '@assets/recipe-1.jpg';
import recipe2 from '@assets/recipe-2.jpg';
import recipe3 from '@assets/recipe-3.jpg';
import recipe4 from '@assets/recipe-4.jpg';

const pairings = [
  { image: recipe1, meal: "Curd Rice", pickle: "Mango Pickle", desc: "The ultimate South Indian comfort food combo. Cool yogurt rice meets spicy, tangy mango." },
  { image: recipe2, meal: "Crispy Dosa", pickle: "Lemon Pickle", desc: "A smear of zesty lemon pickle inside a hot ghee dosa elevates breakfast to an art form." },
  { image: recipe3, meal: "Hot Rotis", pickle: "Garlic Pickle", desc: "Pungent garlic pickle smeared on hot buttered rotis for a robust, satisfying meal." },
  { image: recipe4, meal: "Sambar Rice", pickle: "Gongura Pickle", desc: "The tartness of gongura cuts perfectly through the rich, lentil-heavy sambar." }
];

export default function RecipePairing() {
  return (
    <section id="recipes" className="py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Perfect Pairings</h2>
            <p className="text-xl text-muted-foreground">
              A meal without pickle is like a story without a punchline. Here's how we love to eat ours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pairings.map((pair, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group cursor-pointer"
            >
              <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-6">
                <img 
                  src={pair.image} 
                  alt={pair.meal} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {pair.pickle}
                    </span>
                    <span className="text-white/80 text-sm font-medium">+ {pair.meal}</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{pair.meal} & {pair.pickle.split(' ')[0]}</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-lg px-2">{pair.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}