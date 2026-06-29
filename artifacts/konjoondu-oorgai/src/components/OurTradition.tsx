import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Fresh Catch & Meat",
    desc: "We source the freshest seafood and meats daily — prawns, fish, crab, chicken, and mutton — picked at their prime.",
    icon: "🦐"
  },
  {
    title: "Traditional Cleaning",
    desc: "Washed thoroughly and completely dried. Even a drop of water can ruin a good pickle.",
    icon: "💧"
  },
  {
    title: "Hand Mixing",
    desc: "Spices are freshly ground in stone mortars and hand-mixed with cold-pressed gingelly oil.",
    icon: "🤲"
  },
  {
    title: "Sun Curing",
    desc: "Resting in warm sunlight for weeks in ceramic 'bharanis' to develop deep, complex flavors.",
    icon: "☀️"
  },
  {
    title: "Natural Resting",
    desc: "Patience is our main ingredient. We wait until the oil floats to the top, sealing the goodness.",
    icon: "⏳"
  },
  {
    title: "Careful Packing",
    desc: "Sterilized glass jars packed with love, ensuring the aroma is locked inside until it reaches you.",
    icon: "🎁"
  }
];

export default function OurTradition() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const pathLength = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  return (
    <section id="story" ref={sectionRef} className="py-32 bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto px-6">
        <motion.div 
          className="max-w-3xl mb-24"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">The Art of Patience.</h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            There are no shortcuts in our kitchen. Making a true South Indian pickle is an exercise in time, weather, and instinct. Here is how every jar of Konjoondu comes to life.
          </p>
        </motion.div>

        <div className="relative" ref={timelineRef}>
          {/* Central Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-border/30 rounded-full transform md:-translate-x-1/2 overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-primary origin-top"
              style={{ scaleY: pathLength, height: '100%' }}
            />
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <Step 
                  key={step.title} 
                  step={step} 
                  index={index} 
                  isEven={isEven} 
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ step, index, isEven }: { step: any, index: number, isEven: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
    >
      <div className={`hidden md:block w-1/2 ${isEven ? 'pr-16 text-right' : 'pl-16 text-left'}`}>
        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
        <p className="text-muted-foreground">{step.desc}</p>
      </div>
      
      <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-background border-4 border-primary z-10 flex items-center justify-center text-xl shadow-xl shadow-primary/20">
          {step.icon}
        </div>
      </div>

      <div className="ml-16 md:hidden w-full">
        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
        <p className="text-muted-foreground text-sm">{step.desc}</p>
      </div>
      
      <div className={`hidden md:block w-1/2 ${isEven ? 'pl-16' : 'pr-16'}`} />
    </motion.div>
  );
}