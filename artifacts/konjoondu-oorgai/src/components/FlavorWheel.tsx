import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const flavorData = [
  { id: 'mango', name: 'Mango', profile: 'Spicy & Tangy', pairings: 'Curd Rice, Sambar, Dosa', color: '#E8B64A', angle: 0 },
  { id: 'lemon', name: 'Lemon', profile: 'Zesty & Sour', pairings: 'Fish Curry, Rasam, Upma', color: '#FCD34D', angle: 45 },
  { id: 'garlic', name: 'Garlic', profile: 'Pungent & Fiery', pairings: 'Roti, Paratha, Plain Rice', color: '#F97316', angle: 90 },
  { id: 'mixed', name: 'Mixed Veg', profile: 'Crunchy & Savory', pairings: 'Pulao, Chapati, Dal', color: '#EF4444', angle: 135 },
  { id: 'vaalai', name: 'Vaalai', profile: 'Earthy & Rich', pairings: 'Hot Rice & Ghee, Idli', color: '#16A34A', angle: 180 },
  { id: 'gongura', name: 'Gongura', profile: 'Tart & Spicy', pairings: 'Biryani, White Rice', color: '#15803D', angle: 225 },
  { id: 'tomato', name: 'Tomato', profile: 'Sweet & Tangy', pairings: 'Idli, Dosa, Chapati', color: '#DC2626', angle: 270 },
  { id: 'citron', name: 'Citron', profile: 'Bitter-Sour & Medicinal', pairings: 'Curd Rice, Porridge', color: '#84CC16', angle: 315 },
];

export default function FlavorWheel() {
  const [active, setActive] = useState(flavorData[0]);

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">The Flavor Wheel</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the perfect pickle for your palate and plate.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-16 lg:gap-32">
          
          {/* The Wheel */}
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-border/50 shadow-2xl flex items-center justify-center">
            {/* Center Hub */}
            <div className="absolute w-24 h-24 bg-background rounded-full z-20 shadow-inner flex items-center justify-center border-4 border-muted">
              <span className="font-bold text-lg text-primary text-center leading-tight">Konjoondu<br/><span className="text-xs text-foreground">Flavors</span></span>
            </div>

            {/* Slices */}
            {flavorData.map((flavor) => {
              const rad = (flavor.angle - 90) * (Math.PI / 180);
              const r = window.innerWidth < 768 ? 120 : 160;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;
              const isActive = active.id === flavor.id;

              return (
                <motion.button
                  key={flavor.id}
                  className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-full z-10 flex items-center justify-center text-xs md:text-sm font-bold shadow-lg transition-all duration-300 border-2 ${
                    isActive ? 'scale-125 z-30 ring-4 ring-primary/30' : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    x, y,
                    backgroundColor: flavor.color,
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                  onClick={() => setActive(flavor)}
                  whileHover={{ scale: 1.15 }}
                >
                  {flavor.name}
                </motion.button>
              );
            })}
            
            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full -z-10" viewBox="0 0 400 400">
              {flavorData.map((flavor) => {
                const rad = (flavor.angle - 90) * (Math.PI / 180);
                const x2 = 200 + Math.cos(rad) * 160;
                const y2 = 200 + Math.sin(rad) * 160;
                return (
                  <line 
                    key={`line-${flavor.id}`} 
                    x1="200" y1="200" x2={x2} y2={y2} 
                    stroke="var(--color-border)" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                );
              })}
            </svg>
          </div>

          {/* Details Panel */}
          <div className="w-full md:w-96 min-h-[250px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass p-8 rounded-3xl"
              >
                <div 
                  className="w-12 h-2 rounded-full mb-6" 
                  style={{ backgroundColor: active.color }}
                />
                <h3 className="text-3xl font-bold mb-2">{active.name} Pickle</h3>
                <p className="text-xl text-primary font-medium mb-6">{active.profile}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Perfect Pairings</h4>
                    <p className="text-lg font-medium">{active.pairings}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}