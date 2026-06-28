import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Gift, Plus } from 'lucide-react';

const options = [
  "Mango", "Lemon", "Garlic", "Mixed Veg", "Vaalai", "Gongura", "Tomato", "Citron"
];

export default function GiftBoxBuilder() {
  const [selected, setSelected] = useState<string[]>([]);
  const [packaging, setPackaging] = useState('Classic Wooden Box');

  const toggleSelect = (opt: string) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter(item => item !== opt));
    } else if (selected.length < 3) {
      setSelected([...selected, opt]);
    }
  };

  return (
    <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/30">
              <Gift size={18} />
              <span className="font-semibold tracking-wider text-sm">GIFTING COLLECTION</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Build a Custom Gift Box</h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              Select any three pickles to create a personalized heritage gift box. Perfect for festivals, weddings, and corporate gifting.
            </p>
            
            <div className="mb-10">
              <h3 className="font-bold text-xl mb-4">1. Choose 3 Pickles ({selected.length}/3)</h3>
              <div className="flex flex-wrap gap-3">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleSelect(opt)}
                    className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                      selected.includes(opt) 
                        ? 'bg-white text-primary border-white shadow-lg scale-105'
                        : selected.length >= 3
                          ? 'border-white/30 text-white/50 cursor-not-allowed'
                          : 'border-white/50 text-white hover:border-white'
                    }`}
                  >
                    {selected.includes(opt) && <Check size={16} className="inline mr-1" />}
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-bold text-xl mb-4">2. Choose Packaging</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Classic Wooden Box', 'Premium Hamper', 'Simple Gift Wrap'].map(pkg => (
                  <button
                    key={pkg}
                    onClick={() => setPackaging(pkg)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      packaging === pkg 
                        ? 'bg-white/20 border-white backdrop-blur-md shadow-lg' 
                        : 'border-white/30 bg-black/10 hover:bg-black/20'
                    }`}
                  >
                    <div className="font-bold mb-1">{pkg}</div>
                    <div className="text-xs opacity-80">
                      {pkg === 'Classic Wooden Box' ? '+ ₹200' : pkg === 'Premium Hamper' ? '+ ₹400' : 'Free'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full h-14 px-8 text-lg font-bold"
              disabled={selected.length < 3}
            >
              Add Gift Box to Cart
            </Button>
          </div>

          {/* Visual Representation */}
          <div className="relative h-[400px] md:h-[500px] flex items-center justify-center bg-black/10 rounded-3xl border border-white/20 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80%] h-[60%] border-4 border-dashed border-white/30 rounded-2xl flex items-center justify-center relative bg-black/5">
                <div className="absolute -top-4 bg-primary px-4 py-1 text-sm font-bold border-2 border-white/30 rounded-full">
                  {packaging}
                </div>
                
                <div className="flex gap-4">
                  {[0, 1, 2].map((slot) => (
                    <div key={slot} className="w-24 h-32 md:w-32 md:h-40 rounded-xl bg-white/10 border-2 border-white/20 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
                      <AnimatePresence mode="wait">
                        {selected[slot] ? (
                          <motion.div
                            key={selected[slot]}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="w-full h-full flex items-center justify-center bg-white text-primary font-bold text-center p-2 shadow-inner"
                          >
                            <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center mb-2">
                              {selected[slot].slice(0, 2).toUpperCase()}
                            </div>
                            <span className="absolute bottom-2 text-xs w-full text-center">{selected[slot]}</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            className="text-white/30"
                          >
                            <Plus size={32} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}