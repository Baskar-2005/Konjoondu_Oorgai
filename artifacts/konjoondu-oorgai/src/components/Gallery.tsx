import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

import { products } from '@/data/products';

const galleryLayout = [
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
];

const images = products.map((product, index) => ({
  product,
  src: product.image,
  label: product.name,
  className: galleryLayout[index] ?? 'col-span-1 row-span-1',
}));

export default function Gallery() {
  const [selectedProduct, setSelectedProduct] = React.useState<(typeof products)[number] | null>(null);

  function closePreview() {
    setSelectedProduct(null);
  }

  React.useEffect(() => {
    if (!selectedProduct) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closePreview();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct]);

  return (
    <>
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Every Jar, Crafted with Love</h2>
            <p className="text-muted-foreground text-lg">Our products — straight from our kitchen to your table.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[200px]">
            {images.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                className={`${img.className} rounded-2xl overflow-hidden group relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
                role="button"
                tabIndex={0}
                aria-label={`View ${img.label}`}
                onClick={() => setSelectedProduct(img.product)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProduct(img.product);
                  }
                }}
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-sm font-bold">{img.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProduct.name} product image`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={closePreview}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl items-center justify-center overflow-hidden rounded-3xl bg-[#21100b] p-4 shadow-2xl sm:p-8"
            onClick={event => event.stopPropagation()}
          >
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="max-h-[78vh] w-full object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-6 pb-5 pt-14">
              <p className="text-lg font-bold text-white">{selectedProduct.name}</p>
              <p className="mt-1 text-sm text-white/75">Click outside or press Escape to close</p>
            </div>
            <button
              type="button"
              onClick={closePreview}
              aria-label="Close product image"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
