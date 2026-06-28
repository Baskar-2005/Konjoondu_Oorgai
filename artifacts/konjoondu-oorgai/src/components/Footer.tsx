import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background pt-20 pb-10 rounded-t-[3rem] -mt-10 relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-bold mb-4 text-primary">Konjoondu Oorgai</h2>
            <p className="text-background/70 max-w-sm mb-6 leading-relaxed">
              Crafted with love, delivered to your table. Bringing the authentic taste of a South Indian grandmother's kitchen to homes everywhere.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" aria-label="Follow us on Instagram" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" aria-label="Follow us on Facebook" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" aria-label="Follow us on Twitter" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#products" className="hover:text-primary transition-colors">Shop All</a></li>
              <li><a href="#story" className="hover:text-primary transition-colors">Our Story</a></li>
              <li><a href="#recipes" className="hover:text-primary transition-colors">Recipes</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-background/50">
          <p>© {new Date().getFullYear()} Konjoondu Oorgai. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ in South India</p>
        </div>
      </div>
    </footer>
  );
}