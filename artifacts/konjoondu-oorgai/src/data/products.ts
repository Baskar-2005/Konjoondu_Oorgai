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

export interface ProductSize {
  label: string;   // e.g. "100g", "250g"
  price: number;   // in INR
}

export interface Product {
  id: number;
  name: string;
  description: string;
  taste: string;
  bestWith: string;
  spiceLevel: number;   // 1–5
  sizes: ProductSize[];
  image: string;
  color: string;        // tailwind classes for card tint
  tag: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Prawn Pickle',
    description: 'Juicy prawns marinated in a bold blend of red chillies, gingelly oil, and traditional coastal spices. A sea-fresh delicacy in a jar.',
    taste: 'Bold, tangy, and mildly smoky with a lingering heat. The prawns stay plump and absorb every drop of the masala.',
    bestWith: 'Hot rice, curd rice, chapati, or as a side with dosa.',
    spiceLevel: 4,
    sizes: [
      { label: '100g', price: 160 },
      { label: '250g', price: 330 },
    ],
    image: prawnImg,
    color: 'bg-orange-500/10 border-orange-500/20',
    tag: 'Pickle',
    category: 'Seafood',
  },
  {
    id: 2,
    name: 'Chicken Pickle',
    description: 'Tender chicken pieces slow-roasted and pickled in mustard oil with fiery whole spices. Rich, bold, and deeply satisfying.',
    taste: 'Deep, meaty, and spiced with a rich oil base that gets better with every passing day.',
    bestWith: 'Plain rice, biryani, parotta, or as a starter.',
    spiceLevel: 4,
    sizes: [
      { label: '100g', price: 145 },
      { label: '250g', price: 320 },
    ],
    image: chickenImg,
    color: 'bg-red-500/10 border-red-500/20',
    tag: 'Pickle',
    category: 'Meat',
  },
  {
    id: 3,
    name: 'Mutton Pickle',
    description: 'Slow-cooked mutton pieces with bone, marinated in a powerful masala that gets richer and more complex with every passing day.',
    taste: 'Intense, gamey, and richly spiced. The bone-in pieces add extra depth to the oil and masala.',
    bestWith: 'Plain rice, porridge (kanji), or hot roti.',
    spiceLevel: 5,
    sizes: [
      { label: '100g', price: 200 },
    ],
    image: muttonImg,
    color: 'bg-rose-600/10 border-rose-600/20',
    tag: 'Pickle',
    category: 'Meat',
  },
  {
    id: 4,
    name: 'Beef Pickle',
    description: 'Tender beef cubes cooked in a deep, aromatic masala and preserved in gingelly oil. Intense, unforgettable, and addictive.',
    taste: 'Bold and umami-rich with a thick masala coating. Deep red colour with a robust chilli heat.',
    bestWith: 'Kerala parotta, appam, or mixed into hot rice.',
    spiceLevel: 5,
    sizes: [
      { label: '100g', price: 150 },
      { label: '250g', price: 450 },
    ],
    image: beefImg,
    color: 'bg-red-700/10 border-red-700/20',
    tag: 'Pickle',
    category: 'Meat',
  },
  {
    id: 5,
    name: 'Nethili Pickle',
    description: 'Anchovies (nethili) pickled in tamarind, chilli, and traditional coastal spices. A tangy, savoury treat perfect with plain rice.',
    taste: 'Tangy and salty with a firm anchovy bite. The tamarind and chilli balance each other beautifully.',
    bestWith: 'Plain white rice, curd rice, or as a side with sambar.',
    spiceLevel: 4,
    sizes: [
      { label: '100g', price: 140 },
      { label: '250g', price: 310 },
    ],
    image: nethiliPickleImg,
    color: 'bg-amber-500/10 border-amber-500/20',
    tag: 'Pickle',
    category: 'Seafood',
  },
  {
    id: 6,
    name: 'Nethili Sambal',
    description: 'Dry-roasted anchovies blended with chillies and aromatics into a coarse, punchy sambal. Addictive with everything.',
    taste: 'Smoky, spicy, and intensely savoury. Coarse texture with crunch from roasted anchovies.',
    bestWith: 'Idly, dosa, rice, or eaten straight as a condiment.',
    spiceLevel: 3,
    sizes: [
      { label: '100g', price: 110 },
      { label: '200g', price: 220 },
    ],
    image: nethiliSambalImg,
    color: 'bg-yellow-600/10 border-yellow-600/20',
    tag: 'Sambal',
    category: 'Seafood',
  },
  {
    id: 7,
    name: 'Nethili Karuvaadu',
    description: 'Sun-dried anchovies packed with deep sea flavour. A pantry staple that elevates any South Indian meal.',
    taste: 'Intensely savoury, salty, and briny with the concentrated essence of the sea.',
    bestWith: 'Kuzhambu, rasam, or fried as a crispy accompaniment.',
    spiceLevel: 2,
    sizes: [
      { label: '250g', price: 310 },
    ],
    image: nethiliKaruvaduImg,
    color: 'bg-orange-700/10 border-orange-700/20',
    tag: 'Karuvaadu',
    category: 'Seafood',
  },
  {
    id: 8,
    name: 'Soorai Pickle',
    description: 'Tuna (soorai) pickled in a bold, tangy masala. Rich in protein and loaded with the unmistakable taste of the sea.',
    taste: 'Bold, oily, and packed with the robust flavour of tuna. Chilli and tamarind cut through the richness perfectly.',
    bestWith: 'Hot rice, curd rice, or as a side with dal.',
    spiceLevel: 4,
    sizes: [
      { label: '100g', price: 140 },
      { label: '250g', price: 310 },
    ],
    image: sooraiImg,
    color: 'bg-teal-600/10 border-teal-600/20',
    tag: 'Pickle',
    category: 'Seafood',
  },
  {
    id: 9,
    name: 'Vaala Karuvaadu',
    description: 'Ribbon fish (vaala) sun-dried to perfection — a beloved coastal delicacy with a firm texture and bold flavour.',
    taste: 'Salty, chewy, and intensely flavoured. The sun-drying concentrates all the natural sea flavour.',
    bestWith: 'Kuzhambu, tamarind rice, or pan-fried with curry leaves.',
    spiceLevel: 2,
    sizes: [
      { label: '100g', price: 120 },
      { label: '250g', price: 270 },
    ],
    image: vaalaImg,
    color: 'bg-slate-500/10 border-slate-500/20',
    tag: 'Karuvaadu',
    category: 'Seafood',
  },
  {
    id: 10,
    name: 'Maldives Fish Sambal',
    description: 'Smoked Maldives fish ground with chillies and spices into a bold, umami-rich sambal. A Sri Lankan coastal classic.',
    taste: 'Deeply smoky, umami-forward, and mildly spiced. The smoked fish gives it an unmatched depth of flavour.',
    bestWith: 'String hoppers, idiyappam, rice, or spread on bread.',
    spiceLevel: 3,
    sizes: [
      { label: '100g', price: 165 },
      { label: '200g', price: 300 },
    ],
    image: maldivesImg,
    color: 'bg-amber-700/10 border-amber-700/20',
    tag: 'Sambal',
    category: 'Seafood',
  },
  {
    id: 11,
    name: 'Chennakunni Idly Podi',
    description: 'A fragrant, coarse spice powder made with roasted gram, dried chillies, curry leaves, and traditional masala. Perfect with idly and dosa.',
    taste: 'Nutty, spiced, and aromatic with a satisfying crunch. The curry leaves and chilli give it a South Indian soul.',
    bestWith: 'Idly, dosa, upma, or mixed with gingelly oil as a dip.',
    spiceLevel: 2,
    sizes: [
      { label: '100g', price: 130 },
      { label: '200g', price: 240 },
    ],
    image: idlyPodiImg,
    color: 'bg-orange-400/10 border-orange-400/20',
    tag: 'Podi',
    category: 'Masala',
  },
];

export const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
