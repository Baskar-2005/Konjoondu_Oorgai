import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Check, ChevronRight } from 'lucide-react';

const PRODUCTS = [
  { id: 1, name: 'Prawn Pickle', price: 330, size: '250g', image: '/__mockup/images/Prawn_Pickle_250_1784776178703.png', tag: 'Seafood' },
  { id: 2, name: 'Chicken Pickle', price: 320, size: '250g', image: '/__mockup/images/Chicken_Pickle_250_1784776178707.png', tag: 'Meat' },
  { id: 3, name: 'Mutton Pickle', price: 450, size: '250g', image: '/__mockup/images/Mutton_Pickle_250_1784776178707.png', tag: 'Meat' },
  { id: 4, name: 'Nethili Pickle', price: 310, size: '250g', image: '/__mockup/images/Nethili_Pickle_250_1784776178706.png', tag: 'Seafood' },
  { id: 5, name: 'Idly Podi', price: 240, size: '200g', image: '/__mockup/images/Chinnakunni_podi_200_1784776178705.png', tag: 'Podi' },
];

export default function GiftExperience() {
  const [selectedItems, setSelectedItems] = useState<{ id: number, qty: number }[]>([]);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'letter' | 'delivery'>('products');

  const updateQty = (id: number, delta: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.id === id);
      if (!existing) {
        if (delta > 0 && prev.reduce((acc, curr) => acc + curr.qty, 0) < 4) {
          return [...prev, { id, qty: 1 }];
        }
        return prev;
      }
      
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter(item => item.id !== id);
      
      const totalOtherQty = prev.filter(item => item.id !== id).reduce((acc, curr) => acc + curr.qty, 0);
      if (totalOtherQty + newQty > 4) return prev; // Max 4 jars in a box
      
      return prev.map(item => item.id === id ? { ...item, qty: newQty } : item);
    });
  };

  const getQty = (id: number) => selectedItems.find(item => item.id === id)?.qty || 0;
  
  const totalAmount = selectedItems.reduce((sum, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const totalJars = selectedItems.reduce((sum, item) => sum + item.qty, 0);

  // Derive flat array of jars for the visualizer
  const jarsInBox = selectedItems.flatMap(item => {
    const p = PRODUCTS.find(p => p.id === item.id);
    return Array.from({ length: item.qty }).map((_, i) => ({ ...p!, instanceId: `${item.id}-${i}` }));
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1a0800] overflow-hidden selection:bg-[#b53a2e] selection:text-white font-sans text-[#fdf8f3]">
      <style>{`
        .font-serif { font-family: 'Playfair Display', serif; }
        .bg-noise { background-image: url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E'); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .box-shadow-glow { box-shadow: 0 0 100px rgba(232, 182, 74, 0.15); }
        .paper-texture { 
          background-color: #fdf8f3;
          background-image: 
            linear-gradient(90deg, transparent 79px, #abced4 79px, #abced4 81px, transparent 81px),
            linear-gradient(#eee .1em, transparent .1em);
          background-size: 100% 1.2em;
        }
      `}</style>

      {/* LEFT: Visualizer */}
      <div className="w-full h-[45vh] md:h-auto md:flex-1 relative flex items-center justify-center overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-noise pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(181,58,46,0.15)_0%,transparent_60%)] pointer-events-none rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center transform scale-[0.6] sm:scale-75 md:scale-100">
          
          {/* THE BOX */}
          <div className="relative w-[460px] h-[340px] mt-10 md:mt-20">
            {/* Box Back Wall */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b2a20] to-[#591710] rounded-2xl shadow-[inset_0_10px_30px_rgba(0,0,0,0.5)] border border-[#b53a2e]/30">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {/* Ribbon on back wall */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-[#e8b64a] to-[#b8860b] shadow-lg opacity-80"></div>
            
            {/* Jars Container */}
            <div className="absolute bottom-12 left-0 right-0 h-[200px] flex justify-center items-end gap-2 px-8 z-10">
              <AnimatePresence mode="popLayout">
                {jarsInBox.map((jar, i) => (
                  <motion.div
                    key={jar.instanceId}
                    initial={{ opacity: 0, y: -40, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.05 }}
                    className="relative w-[90px] h-[120px] shrink-0"
                    style={{ zIndex: 10 + i }}
                  >
                    <img src={jar.image} alt={jar.name} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Box Front Lip */}
            <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[#b53a2e] to-[#701c13] rounded-b-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.4)] z-20 border-t border-[#e87a6a]/40 backdrop-blur-md overflow-hidden">
               {/* Ribbon on front lip */}
               <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-b from-[#ffcc5c] to-[#d4a017] shadow-[0_0_15px_rgba(0,0,0,0.3)]"></div>
               {/* Brand logo simple */}
               <div className="absolute inset-0 flex items-center justify-center opacity-20 mix-blend-overlay">
                 <span className="font-serif text-3xl tracking-widest text-[#e8b64a]">KONJOONDU</span>
               </div>
            </div>

            {/* Empty State Text */}
            {totalJars === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              >
                <p className="font-serif text-[#e8b64a]/60 text-lg italic">Select up to 4 jars</p>
              </motion.div>
            )}

            {/* THE LETTER */}
            <motion.div 
              className="absolute -right-24 -top-12 w-[280px] h-[360px] bg-[#fdf8f3] rounded-sm shadow-[15px_25px_40px_rgba(0,0,0,0.6)] z-30 p-8 transform rotate-6 origin-bottom-left border border-[#e2d5c5]"
              initial={{ x: 50, opacity: 0, rotate: 12 }}
              animate={{ x: 0, opacity: 1, rotate: 6 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Paper texture overlay */}
              <div className="absolute inset-0 opacity-[0.03] bg-noise rounded-sm"></div>
              
              <div className="relative z-10 h-full flex flex-col font-serif text-[#3d2b1f]">
                <div className="flex justify-between items-center mb-6 border-b border-[#e2d5c5] pb-4">
                  <span className="text-[10px] tracking-[0.2em] text-[#8b5e3c] uppercase font-sans font-bold">Gift Message</span>
                  <div className="w-6 h-6 rounded-full border border-[#e8b64a] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#e8b64a]/20"></div>
                  </div>
                </div>

                <div className="text-sm italic text-[#8b5e3c] mb-2">Dear {recipientName || 'Recipient'},</div>
                
                <div className="flex-1 text-base leading-relaxed overflow-hidden">
                  {message ? (
                    <span className="italic">{message}</span>
                  ) : (
                    <span className="italic text-[#8b5e3c]/40">Your heartfelt message will appear here...</span>
                  )}
                </div>

                <div className="mt-4 text-sm italic text-[#8b5e3c]">
                  With love,<br/>
                  <span className="text-[#b53a2e] font-medium text-lg">{senderName || 'You'}</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div className="w-full md:w-[500px] flex-1 md:flex-none bg-[#fdf8f3] text-[#1a0800] flex flex-col relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] md:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] min-h-[55vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 border-b border-[#e2d5c5]">
          <h1 className="font-serif text-3xl font-bold text-[#1a0800] mb-2">Curate Your Gift</h1>
          <p className="text-sm text-[#8b5e3c]">Build a custom box of handcrafted coastal flavors.</p>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-[#e2d5c5]">
          {[
            { id: 'products', label: '1. Jars' },
            { id: 'letter', label: '2. Letter' },
            { id: 'delivery', label: '3. Details' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 pt-5 px-4 text-xs font-bold uppercase tracking-wider relative transition-colors ${
                activeTab === tab.id ? 'text-[#b53a2e]' : 'text-[#8b5e3c] hover:text-[#b53a2e]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b53a2e]" />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-8">
          <AnimatePresence mode="wait">
            
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-[#8b5e3c] uppercase tracking-wider">Select up to 4</span>
                  <span className="text-sm font-bold text-[#b53a2e] bg-[#b53a2e]/10 px-3 py-1 rounded-full">{totalJars} / 4 Filled</span>
                </div>

                {PRODUCTS.map(product => {
                  const qty = getQty(product.id);
                  const isSelected = qty > 0;
                  
                  return (
                    <div 
                      key={product.id}
                      className={`flex gap-4 p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-[#b53a2e] bg-[#b53a2e]/[0.02] shadow-[0_4px_15px_rgba(181,58,46,0.08)]' 
                          : 'border-[#e2d5c5] bg-white hover:border-[#b53a2e]/40'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-lg bg-[#fdf8f3] border border-[#e2d5c5] p-2 flex items-center justify-center shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-[#1a0800]">{product.name}</h3>
                          <span className="text-xs font-bold text-[#8b5e3c]">₹{product.price}</span>
                        </div>
                        <div className="text-xs text-[#8b5e3c] mb-3">{product.size} • {product.tag}</div>
                        
                        {isSelected ? (
                          <div className="flex items-center gap-4 bg-[#fdf8f3] w-fit rounded-lg border border-[#e2d5c5] p-1">
                            <button 
                              onClick={() => updateQty(product.id, -1)}
                              className="w-7 h-7 rounded-md flex items-center justify-center bg-white text-[#b53a2e] shadow-sm hover:bg-[#b53a2e] hover:text-white transition-colors"
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{qty}</span>
                            <button 
                              onClick={() => updateQty(product.id, 1)}
                              disabled={totalJars >= 4}
                              className="w-7 h-7 rounded-md flex items-center justify-center bg-white text-[#b53a2e] shadow-sm hover:bg-[#b53a2e] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#b53a2e]"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => updateQty(product.id, 1)}
                            disabled={totalJars >= 4}
                            className="flex items-center gap-2 text-xs font-bold text-[#b53a2e] uppercase tracking-wider disabled:opacity-50 hover:opacity-80 transition-opacity w-fit"
                          >
                            <Plus size={14} strokeWidth={3} /> Add to Box
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'letter' && (
              <motion.div
                key="letter"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <label className="block text-[10px] font-bold text-[#8b5e3c] uppercase tracking-[0.1em] mb-2">Sender Name</label>
                  <input 
                    type="text" 
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="Who is this from?"
                    className="w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-[#8b5e3c] uppercase tracking-[0.1em] mb-2">Recipient Name</label>
                  <input 
                    type="text" 
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="Who is this for?"
                    className="w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-bold text-[#8b5e3c] uppercase tracking-[0.1em]">Special Message</label>
                    <span className="text-[10px] text-[#8b5e3c]">{message.length}/200</span>
                  </div>
                  <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 200))}
                    placeholder="Write something nice..."
                    rows={5}
                    className="w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all resize-none font-serif italic"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'delivery' && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-[#b53a2e]/5 p-5 rounded-xl border border-[#b53a2e]/10">
                  <h3 className="font-serif text-lg font-bold text-[#b53a2e] mb-1">Almost there!</h3>
                  <p className="text-xs text-[#8b5e3c]">Just need to know where to send this beautiful box.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8b5e3c] uppercase tracking-[0.1em] mb-2">Delivery Address</label>
                  <input 
                    type="text" 
                    placeholder="House/Flat No., Street"
                    className="w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input 
                      type="text" 
                      placeholder="City"
                      className="w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all"
                    />
                    <input 
                      type="text" 
                      placeholder="Pincode"
                      className="w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="State"
                    className="w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8b5e3c] uppercase tracking-[0.1em] mb-2">Recipient Phone</label>
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number"
                    className="w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all"
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#e2d5c5] bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-[#8b5e3c]">Total Amount</span>
            <span className="font-serif text-2xl font-bold text-[#b53a2e]">₹{totalAmount.toLocaleString()}</span>
          </div>

          <button 
            onClick={() => {
              if (totalJars === 0) return;
              if (activeTab === 'products') setActiveTab('letter');
              else if (activeTab === 'letter') setActiveTab('delivery');
              // otherwise review & pay (no-op for mockup)
            }}
            className={`w-full py-4 rounded-full flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all shadow-lg ${
              totalJars > 0 
                ? 'bg-gradient-to-r from-[#e8b64a] to-[#c9922e] text-[#1a0800] hover:shadow-xl hover:scale-[1.02]' 
                : 'bg-[#e2d5c5] text-[#8b5e3c] cursor-not-allowed opacity-70'
            }`}
          >
            {activeTab === 'products' ? (
              totalJars > 0 ? <>Write the Letter <ChevronRight size={18} /></> : <>Add a Jar to Continue</>
            ) : activeTab === 'letter' ? (
              <>Add Delivery Details <ChevronRight size={18} /></>
            ) : (
              <>Review & Pay <Check size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
