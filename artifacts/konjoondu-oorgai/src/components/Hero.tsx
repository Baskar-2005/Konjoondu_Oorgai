import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Star, Heart, Leaf, Clock } from 'lucide-react';
import heroImg from '@assets/hero-bg.jpg';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headlineRef.current) return;
    
    // Simple split text fallback since we don't have SplitText GSAP plugin
    const headline = headlineRef.current;
    const text = headline.innerText;
    headline.innerHTML = '';
    
    const words = text.trim().split(/\s+/);
    words.forEach((word, idx) => {
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.verticalAlign = 'bottom';
      if (idx < words.length - 1) wrapper.style.marginRight = '0.28em';

      const span = document.createElement('span');
      span.innerText = word;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(24px)';
      wrapper.appendChild(span);
      headline.appendChild(wrapper);
    });

    const spans = headline.querySelectorAll('span');
    
    const tl = gsap.timeline({ delay: 0.2 });
    
    tl.to(spans, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out"
    })
    .fromTo(Array.from(buttonsRef.current?.children || []), 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(Array.from(cardsRef.current?.children || []),
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)" },
      "-=0.2"
    );

  }, []);

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImg} 
          alt="Rustic South Indian kitchen" 
          className="w-full h-full object-cover object-center"
        />
        {/* Soft overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent dark:from-background/95 dark:via-background/80 dark:to-background/40"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-32 pb-20">
        <div className="max-w-2xl">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 uppercase tracking-wider backdrop-blur-sm border border-primary/20">
            Handcrafted in South India
          </span>
          
          <h1 
            ref={headlineRef}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-foreground"
          >
            Every Jar Holds a Family Tradition.
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-xl font-medium">
            Handcrafted homemade pickles prepared with authentic recipes, premium ingredients, and the warmth of home.
          </p>
          
          <div ref={buttonsRef} className="flex flex-wrap gap-4 mb-16">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 h-14 rounded-full font-semibold shadow-lg shadow-primary/20">
              Shop Now
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full font-semibold bg-background/50 backdrop-blur-sm border-border hover:bg-background/80">
              Explore Pickles
            </Button>
            <Button size="lg" variant="ghost" className="text-lg px-8 h-14 rounded-full font-semibold hover:bg-background/50">
              Our Story
            </Button>
          </div>
        </div>

        {/* Floating cards */}
        <div ref={cardsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className="bg-secondary/20 p-2 rounded-full text-secondary">
              <Star size={20} className="fill-secondary" />
            </div>
            <div>
              <p className="font-bold text-foreground">5.0 Rating</p>
              <p className="text-xs text-muted-foreground">Loved by customers</p>
            </div>
          </div>
          
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
              <Heart size={20} />
            </div>
            <div>
              <p className="font-bold text-foreground">Homemade</p>
              <p className="text-xs text-muted-foreground">Family recipes</p>
            </div>
          </div>
          
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-full text-accent">
              <Leaf size={20} />
            </div>
            <div>
              <p className="font-bold text-foreground">100% Natural</p>
              <p className="text-xs text-muted-foreground">No preservatives</p>
            </div>
          </div>
          
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className="bg-muted-foreground/10 p-2 rounded-full text-muted-foreground">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-bold text-foreground">Sun Cured</p>
              <p className="text-xs text-muted-foreground">Traditional process</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
