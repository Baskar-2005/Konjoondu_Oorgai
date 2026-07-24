import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    quote: "My grandmother's mango pickle tasted exactly like this. Pure nostalgia in a jar. It took me straight back to my childhood summers in Madurai.",
    name: "Priya Subramaniam",
    location: "Chennai",
    rating: 5
  },
  {
    quote: "We order every month. The Gongura pickle is absolutely divine and the packaging is beautiful. Finally, a brand that gets homemade taste right.",
    name: "Ramesh Kumar",
    location: "Hyderabad",
    rating: 5
  },
  {
    quote: "No artificial colors, no vinegary smell—just pure, cold-pressed gingelly oil and traditional spices. The Garlic pickle is my absolute favorite.",
    name: "Meena Iyer",
    location: "Bengaluru",
    rating: 5
  }
];

export default function CustomerLove() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          ref={ref}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Love from our Family</h2>
          <p className="text-xl text-muted-foreground">What people are saying about Konjoondu Oorgai.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.2 + i * 0.2, duration: 0.6 }}
              className="glass p-8 rounded-3xl relative"
            >
              <Quote className="absolute top-6 right-6 text-primary/20 w-12 h-12" />
              <div className="flex gap-1 mb-6 text-secondary">
                {[...Array(test.rating)].map((_, j) => (
                  <Star key={j} size={18} className="fill-secondary" />
                ))}
              </div>
              <p className="text-lg mb-8 font-medium italic leading-relaxed text-foreground/80">"{test.quote}"</p>
              <div>
                <p className="font-bold font-sans text-foreground">{test.name}</p>
                <p className="text-sm text-muted-foreground">{test.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}