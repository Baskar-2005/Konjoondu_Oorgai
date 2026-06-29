import React from 'react';
import { motion } from 'framer-motion';

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

const images = [
  { src: prawnImg, label: 'Prawn Pickle', className: "col-span-1 row-span-2" },
  { src: chickenImg, label: 'Chicken Pickle', className: "col-span-1 row-span-1" },
  { src: muttonImg, label: 'Mutton Pickle', className: "col-span-1 row-span-1" },
  { src: beefImg, label: 'Beef Pickle', className: "col-span-1 row-span-1" },
  { src: nethiliPickleImg, label: 'Nethili Pickle', className: "col-span-1 row-span-1" },
  { src: sooraiImg, label: 'Soorai Pickle', className: "col-span-1 row-span-2" },
  { src: nethiliSambalImg, label: 'Nethili Sambal', className: "col-span-1 row-span-1" },
  { src: nethiliKaruvaduImg, label: 'Nethili Karuvaadu', className: "col-span-1 row-span-1" },
  { src: maldivesImg, label: 'Maldives Fish Sambal', className: "col-span-1 row-span-1" },
  { src: vaalaImg, label: 'Vaala Karuvaadu', className: "col-span-1 row-span-1" },
  { src: idlyPodiImg, label: 'Chennakunni Idly Podi', className: "col-span-2 row-span-1" },
];

export default function Gallery() {
  return (
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
              className={`${img.className} rounded-2xl overflow-hidden group relative`}
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
  );
}
