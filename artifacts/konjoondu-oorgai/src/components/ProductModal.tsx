import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShoppingCart, Plus, Minus, Star } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

/** Inner modal rendered only when product is guaranteed non-null */
function ModalContent({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Reset when product changes
  React.useEffect(() => {
    setSelectedSizeIdx(0);
    setQuantity(1);
  }, [product.id]);

  const selectedSize = product.sizes[selectedSizeIdx];

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        productName: product.name,
        size: selectedSize.label,
        price: selectedSize.price,
        image: product.image,
        tag: product.tag,
      },
      quantity,
    );
    toast({
      title: 'Added to cart!',
      description: `${product.name} (${selectedSize.label}) × ${quantity}`,
    });
    onClose();
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Image */}
      <div className="relative md:w-2/5 h-64 md:h-auto flex-shrink-0 overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div
          className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: 'hsl(4,60%,44%)' }}
        >
          {product.tag}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-0.5 items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-white/40'}
              />
            ))}
            <span className="text-white/70 text-xs ml-1 font-medium">4.8</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-6 md:p-8 flex flex-col">
        <div className="mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {product.category}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-3">{product.name}</h2>

        {/* Spice level */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-xs font-medium text-muted-foreground">Spice level:</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Flame
                key={i}
                size={14}
                className={
                  i < product.spiceLevel
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground/25'
                }
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Taste */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(181,58,46,0.06)' }}>
          <p
            className="text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: 'hsl(4,60%,44%)' }}
          >
            Taste Profile
          </p>
          <p className="text-sm text-foreground/80">{product.taste}</p>
        </div>

        <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(139,94,60,0.06)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">
            Best Paired With
          </p>
          <p className="text-sm text-foreground/80">{product.bestWith}</p>
        </div>

        {/* Size selector */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
            Select Size
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((s, idx) => (
              <button
                key={s.label}
                onClick={() => setSelectedSizeIdx(idx)}
                className="flex flex-col items-center px-4 py-2.5 rounded-xl border-2 transition-all duration-200 font-semibold"
                style={{
                  borderColor:
                    selectedSizeIdx === idx ? 'hsl(4,60%,44%)' : 'rgba(139,94,60,0.2)',
                  background:
                    selectedSizeIdx === idx ? 'rgba(181,58,46,0.08)' : 'transparent',
                  color: selectedSizeIdx === idx ? 'hsl(4,60%,44%)' : 'inherit',
                }}
              >
                <span className="text-sm font-bold">{s.label}</span>
                <span
                  className="text-sm"
                  style={{
                    color:
                      selectedSizeIdx === idx ? 'hsl(4,60%,44%)' : 'hsl(18,18%,40%)',
                  }}
                >
                  ₹{s.price}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Qty
          </p>
          <div
            className="flex items-center gap-2 rounded-xl border p-1"
            style={{ borderColor: 'rgba(139,94,60,0.2)' }}
          >
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1.5 rounded-lg transition-colors hover:bg-muted"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center font-bold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-1.5 rounded-lg transition-colors hover:bg-muted"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-sm font-bold ml-auto" style={{ color: 'hsl(4,60%,44%)' }}>
            Total: ₹{selectedSize.price * quantity}
          </span>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-base transition-all duration-300 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
            color: '#FFF9F0',
            boxShadow: '0 8px 24px rgba(181,58,46,0.35)',
          }}
        >
          <ShoppingCart size={18} />
          Add {quantity > 1 ? `${quantity} ` : ''}to Cart — ₹{selectedSize.price * quantity}
        </button>
      </div>
    </div>
  );
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl pointer-events-auto"
              style={{
                background: 'var(--background)',
                border: '1px solid rgba(181,58,46,0.15)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
                style={{ background: 'rgba(0,0,0,0.08)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <ModalContent product={product} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
