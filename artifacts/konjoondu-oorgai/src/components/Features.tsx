import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Sun, Droplets, Leaf, HeartHandshake, Box, Star } from 'lucide-react';

const features = [
  { icon: HeartHandshake, title: "Homemade Taste", desc: "Exactly like your grandmother makes it." },
  { icon: ShieldCheck, title: "No Preservatives", desc: "Zero artificial colors, flavors, or chemicals." },
  { icon: Droplets, title: "Cold-pressed Oil", pure: true, desc: "We use only pure sesame (gingelly) oil." },
  { icon: Sun, title: "Sun Cured", desc: "Patiently fermented in natural sunlight." },
  { icon: Leaf, title: "Premium Ingredients", desc: "Handpicked spices, fresh seafood, and quality meats." },
  { icon: Check, title: "Hygienic Prep", desc: "Strictly sanitized environment and utensils." },
  { icon: Box, title: "Small Batches", desc: "Crafted in small quantities for perfect taste." },
  { icon: Star, title: "Loved by Families", desc: "A staple in thousands of South Indian homes." }
];

export default function Features() {
  return (
    <section className="py-24 bg-muted/50 border-y border-border/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-background shadow-sm border border-border/50 flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <feature.icon size={28} strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}