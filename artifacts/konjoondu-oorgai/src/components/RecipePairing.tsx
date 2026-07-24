import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Briefcase, Laptop, Home, Plane,
  Users, UtensilsCrossed, Heart, ShoppingBag, X,
} from 'lucide-react';

import collegeImg      from '@/assets/fw-college.jpg';
import officeImg       from '@/assets/fw-office.jpg';
import professionalImg from '@/assets/fw-professional.jpg';
import bachelorImg     from '@/assets/fw-bachelor.jpg';
import travelImg       from '@/assets/fw-travel.jpg';
import familyImg       from '@/assets/fw-family.jpg';
import lunchboxImg     from '@/assets/fw-lunchbox.jpg';
import ammaImg         from '@/assets/fw-amma.jpg';

interface Card {
  icon: React.ElementType;
  title: string;
  image: string;
  emoji: string;
  lines: string[];
  detail: {
    heading: string;
    body: string;
    tip: string;
  };
}

const cards: Card[] = [
  {
    icon: GraduationCap,
    emoji: '🎓',
    title: 'College Students',
    image: collegeImg,
    lines: ['Hostel saapadu bore adikutha?', 'Just hot rice + Konjoondu Oorgai.', '2 mins-la semma meal ready 😋'],
    detail: {
      heading: 'Hostel life, luxury taste.',
      body: 'No kitchen? No problem. One bottle of Konjoondu Oorgai transforms the most boring hostel rice into a meal you actually look forward to. Bold spices, fresh seafood — exactly what a busy student needs between lectures.',
      tip: '💡 Pro tip: Keep a small 200g bottle in your study desk drawer. Instant mood upgrade anytime.',
    },
  },
  {
    icon: Briefcase,
    emoji: '💼',
    title: 'Office Workers',
    image: officeImg,
    lines: ['Office mudichitu vandha apram samaikka mood illa?', 'Oru bottle open pannunga.', 'Saapadu instant level-up. 🔥'],
    detail: {
      heading: 'After a long day — you deserve this.',
      body: 'You\'ve been in back-to-back meetings. Cooking is the last thing on your mind. Open Konjoondu Oorgai, mix it with hot rice, and dinner is sorted in 2 minutes. Homemade taste, zero effort.',
      tip: '💡 Pro tip: Pairs perfectly with curd rice too. A complete reset after a hectic day.',
    },
  },
  {
    icon: Laptop,
    emoji: '👩‍💻',
    title: 'Busy Professionals',
    image: professionalImg,
    lines: ['Meeting mela meeting... cooking-ku time eh illa?', 'Rice irundha pothum.', 'Complete meal ❤️'],
    detail: {
      heading: 'No time to cook. Full time to eat well.',
      body: 'Deadlines, deliverables, back-to-back calls — your schedule leaves no room for cooking. But it does leave room for a quick, satisfying meal. Just rice and Konjoondu Oorgai — that\'s it. That\'s the whole recipe.',
      tip: '💡 Pro tip: Keep a bottle at your work desk. Lunch sorted in minutes, every day.',
    },
  },
  {
    icon: Home,
    emoji: '🏠',
    title: 'Bachelors & PG Stay',
    image: bachelorImg,
    lines: ['Veetu saapadu miss panreengala?', 'Open. Mix. Saapdu.', 'Amma veetu taste feel pannunga.'],
    detail: {
      heading: 'Amma\'s kitchen, in a bottle.',
      body: 'Living away from home means missing that one-of-a-kind taste only your mother\'s kitchen could produce. Konjoondu Oorgai is made with the same traditional recipes and cold-pressed gingelly oil — the closest thing to home.',
      tip: '💡 Pro tip: Sunday rice + Konjoondu Oorgai + a phone call to Amma = perfect weekend.',
    },
  },
  {
    icon: Plane,
    emoji: '✈️',
    title: 'Travelers',
    image: travelImg,
    lines: ['Trip ponaalum homemade taste venuma?', 'Carry pannunga.', 'Enga venumnaalum enjoy pannunga.'],
    detail: {
      heading: 'Home taste, wherever you go.',
      body: 'Business trip, holiday, or a long train journey — restaurant food gets old fast. Pack a small bottle of Konjoondu Oorgai and you always have a taste of home ready. It travels well, keeps fresh, and pairs with anything.',
      tip: '💡 Pro tip: The 200g glass jar fits perfectly in any carry-on bag or laptop backpack.',
    },
  },
  {
    icon: Users,
    emoji: '👨‍👩‍👧',
    title: 'Family Lunch',
    image: familyImg,
    lines: ['Sunday lunch-ku side dish yosikireengala?', 'Konjoondu Oorgai irundha...', 'Ellarum innum konjam rice podunga 😍'],
    detail: {
      heading: 'The secret ingredient of every Sunday lunch.',
      body: 'When the whole family sits down together, the table needs something special. Konjoondu Oorgai\'s bold, rich flavors make even simple rice and dal feel like a feast. Watch everyone quietly reach for a second serving.',
      tip: '💡 Pro tip: The Prawn and Chicken pickles are family favourites — order the combo pack for Sunday.',
    },
  },
  {
    icon: UtensilsCrossed,
    emoji: '🍱',
    title: 'Lunch Box',
    image: lunchboxImg,
    lines: ['Daily same lunch ah?', 'One spoon Konjoondu Oorgai.', 'Whole lunch taste change 🔥'],
    detail: {
      heading: 'Turn any lunch box into a craving.',
      body: 'Rice, sambar, curd — the same lunch every day gets monotonous. One spoonful of Konjoondu Oorgai completely transforms the flavour profile of your meal. Bold, spicy, and packed with umami. Colleagues will notice.',
      tip: '💡 Pro tip: A small 200g bottle lasts a whole month in your lunch bag. Worth every bite.',
    },
  },
  {
    icon: Heart,
    emoji: '❤️',
    title: 'Amma Taste Lovers',
    image: ammaImg,
    lines: ['Amma kai pakkuvam miss panreengala?', 'Every bottle-la irukku', 'Homemade Love ❤️  Authentic Taste 🏡'],
    detail: {
      heading: 'The taste your heart remembers.',
      body: 'There\'s a flavour locked in your memory — your grandmother\'s pickle, your mother\'s secret recipe, the aroma that filled the kitchen on Sunday mornings. Konjoondu Oorgai is made the same way — stone-ground spices, cold-pressed gingelly oil, and time. Exactly how Amma would make it.',
      tip: '💡 Gift idea: Send a bottle to your parents. They\'ll love that you thought of them.',
    },
  },
];

export default function RecipePairing() {
  const [selected, setSelected] = useState<Card | null>(null);

  return (
    <section id="for-whom" className="py-24 sm:py-32 bg-muted/30 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative container mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 sm:mb-20"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
            style={{ background: 'rgba(181,58,46,0.08)', color: 'hsl(4,60%,44%)', borderColor: 'rgba(181,58,46,0.2)' }}
          >
            🫙 Made For Everyone
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight text-foreground">
            Yaarukkaga Konjoondu Oorgai?
          </h2>
          <p className="text-base sm:text-xl text-primary font-semibold italic">
            "Busy life... aana homemade taste miss aaga koodadhu."
          </p>
        </motion.div>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.22 } }}
                onClick={() => setSelected(card)}
                className="glass rounded-3xl overflow-hidden flex flex-col cursor-pointer group"
              >
                {/* Image — full bleed, object-cover */}
                <div className="relative overflow-hidden" style={{ height: 190 }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    style={{ objectPosition: 'center top' }}
                  />
                  {/* gradient fade to card body */}
                  <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.18))' }} />
                  {/* "tap to learn more" hint on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(0,0,0,0.28)' }}>
                    <span className="text-white text-xs font-bold tracking-wider uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur">
                      Tap to know more
                    </span>
                  </div>
                </div>

                {/* Text body */}
                <div className="flex flex-col gap-2 p-5 flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0"
                      style={{ background: 'rgba(181,58,46,0.1)' }}
                    >
                      <Icon size={16} className="text-primary" />
                    </span>
                    <p className="font-bold text-sm sm:text-base text-foreground leading-snug">{card.title}</p>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-auto">
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground/80">{card.lines[0]}</p>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{card.lines[1]}</p>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{card.lines[2]}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Highlight card ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-3xl w-full text-center px-8 py-12 sm:py-16 mb-12 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
            🍚 Rice irukka?<br />Konjoondu Oorgai irukka?
          </h3>
          <div className="flex flex-col items-center gap-1.5">
            {[
              { text: 'Appo saapadu ready!', primary: true },
              { text: 'No Cooking.', primary: false },
              { text: 'No Waiting.', primary: false },
              { text: 'Just Open. Mix. Enjoy 😋', primary: false },
            ].map((item, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.45 }}
                className={`text-base sm:text-xl font-semibold ${item.primary ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {item.text}
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <h4 className="text-2xl sm:text-4xl font-bold text-foreground">
            Taste That Knocks You Out.
          </h4>
          <motion.a
            href="#products"
            whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(181,58,46,0.45), inset 0 1px 0 rgba(255,255,255,0.18)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-7 h-14 rounded-full font-bold text-base cursor-pointer"
            style={{
              background: 'rgba(181,58,46,0.85)',
              color: '#FFF9F0',
              fontFamily: 'Poppins,sans-serif',
              boxShadow: '0 8px 28px rgba(181,58,46,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
              textDecoration: 'none',
            }}
          >
            <ShoppingBag size={18} />
            Explore Our Pickles
          </motion.a>
        </motion.div>
      </div>

      {/* ── Detail Popup Modal ── */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
              style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
              onClick={() => setSelected(null)}
            >
              {/* Modal card — stop propagation so clicking inside doesn't close */}
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.88, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 24 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--card-border))' }}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(0,0,0,0.35)', color: '#fff' }}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                {/* Image — full bleed top */}
                <div className="relative w-full overflow-hidden" style={{ height: 260 }}>
                  <img
                    src={selected.image}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center top' }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--card)))' }}
                  />
                </div>

                {/* Content */}
                <div className="px-7 pb-8 -mt-4 relative z-10">
                  {/* Icon + title */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="inline-flex items-center justify-center w-10 h-10 rounded-2xl flex-shrink-0"
                      style={{ background: 'rgba(181,58,46,0.12)' }}
                    >
                      <selected.icon size={20} className="text-primary" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">{selected.emoji} For</p>
                      <h3 className="text-xl font-bold text-foreground leading-snug">{selected.title}</h3>
                    </div>
                  </div>

                  {/* Heading */}
                  <p className="text-base font-bold text-primary mb-3">{selected.detail.heading}</p>

                  {/* Body */}
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                    {selected.detail.body}
                  </p>

                  {/* Tip */}
                  <div
                    className="rounded-2xl px-4 py-3 text-sm text-foreground/80 font-medium"
                    style={{ background: 'rgba(181,58,46,0.07)', border: '1px solid rgba(181,58,46,0.15)' }}
                  >
                    {selected.detail.tip}
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <a
                      href="#products"
                      onClick={() => setSelected(null)}
                      className="inline-flex items-center gap-2 px-6 h-12 rounded-full font-bold text-sm cursor-pointer w-full justify-center"
                      style={{
                        background: 'rgba(181,58,46,0.85)',
                        color: '#FFF9F0',
                        boxShadow: '0 6px 20px rgba(181,58,46,0.3)',
                        textDecoration: 'none',
                      }}
                    >
                      <ShoppingBag size={16} />
                      Shop Now
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
