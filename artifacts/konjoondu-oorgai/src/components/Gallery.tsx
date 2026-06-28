import React from 'react';
import { motion } from 'framer-motion';

import g1 from '@assets/gallery-1.jpg';
import g2 from '@assets/gallery-2.jpg';
import g3 from '@assets/gallery-3.jpg';
import g4 from '@assets/gallery-4.jpg';
import g5 from '@assets/gallery-5.jpg';
import g6 from '@assets/gallery-6.jpg';
import g7 from '@assets/gallery-7.jpg';
import g8 from '@assets/gallery-8.jpg';

const images = [
  { src: g1, className: "col-span-1 row-span-1 aspect-square" },
  { src: g4, className: "col-span-1 row-span-2 aspect-[1/2]" },
  { src: g3, className: "col-span-1 row-span-1 aspect-square" },
  { src: g7, className: "col-span-1 md:col-span-2 row-span-1 aspect-video" },
  { src: g2, className: "col-span-1 row-span-1 aspect-square" },
  { src: g6, className: "col-span-1 row-span-1 aspect-square" },
  { src: g5, className: "col-span-1 md:col-span-2 row-span-1 aspect-video" },
  { src: g8, className: "col-span-1 row-span-1 aspect-square" },
];

export default function Gallery() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Life in our Kitchen</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-auto">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
              className={`${img.className} rounded-2xl overflow-hidden group`}
            >
              <img 
                src={img.src} 
                alt="Gallery" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}