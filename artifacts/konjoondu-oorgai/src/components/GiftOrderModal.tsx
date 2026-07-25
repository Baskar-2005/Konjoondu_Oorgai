import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Minus, ChevronRight, Check, Loader2, RotateCcw, Heart,
} from 'lucide-react';
import { products, getVisibleProductSizes } from '@/data/products';
import { useToast } from '@/hooks/use-toast';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';
const DRAFT_KEY = 'ko_gift_draft';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-sdk')) { resolve(true); return; }
    const s = document.createElement('script');
    s.id = 'razorpay-sdk';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GiftItem { productId: number; productName: string; size: string; price: number; quantity: number; image: string; }
interface SenderForm { name: string; phone: string; email: string; }
interface RecipientForm { name: string; phone: string; line1: string; city: string; state: string; pincode: string; }
type Tab = 'jars' | 'letter' | 'delivery' | 'review';

interface DraftState { tab: Tab; sender: SenderForm; recipient: RecipientForm; giftItems: GiftItem[]; message: string; }

// ── Draft helpers ─────────────────────────────────────────────────────────────

const EMPTY_SENDER: SenderForm = { name: '', phone: '', email: '' };
const EMPTY_RECIPIENT: RecipientForm = { name: '', phone: '', line1: '', city: '', state: '', pincode: '' };

function readDraft(): DraftState | null {
  try { const r = localStorage.getItem(DRAFT_KEY); return r ? JSON.parse(r) as DraftState : null; } catch { return null; }
}
function saveDraft(s: DraftState) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}
function isDraftMeaningful(d: DraftState): boolean {
  return !!(d.sender.name || d.sender.phone || d.recipient.name || d.giftItems.length > 0 || d.message);
}
export function hasSavedGiftDraft(): boolean {
  const d = readDraft();
  return !!d && isDraftMeaningful(d);
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props { isOpen: boolean; onClose: () => void; }

// ── 3D Gift Box ────────────────────────────────────────────────────────────────

const BOX_W = 300;
const BOX_H = 178;
const LID_H = 54;
const LID_OVH = 8; // lid overhangs each side

function GiftBox3D({
  jars, totalJars, tab, senderName, recipientName, message,
}: {
  jars: { instanceId: string; image: string; name: string }[];
  totalJars: number;
  tab: Tab;
  senderName: string;
  recipientName: string;
  message: string;
}) {
  const isOpen = tab === 'jars';
  const showLetter = tab !== 'jars';
  const n = jars.length;
  const jarW = n === 0 ? 64 : Math.min(64, Math.max(38, Math.floor((BOX_W - 40) / Math.max(n, 1)) - 6));
  const jarH = Math.floor(jarW * 1.45);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, position: 'relative', userSelect: 'none' }}>

      {/* ── BOX COLUMN ── */}
      <div style={{ position: 'relative', width: BOX_W + LID_OVH * 2, flexShrink: 0 }}>

        {/* BOW — floats above lid when closed */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div key="bow"
              initial={{ opacity: 0, scale: 0.4, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.3, y: 14 }}
              transition={{ duration: 0.55, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 3, zIndex: 40,
              }}
            >
              <div style={{ width: 32, height: 26, background: 'linear-gradient(135deg,#ffe066,#c9922e)', borderRadius: '50% 50% 0 50%', transform: 'rotate(-22deg)', boxShadow: '0 2px 10px rgba(232,182,74,0.55)' }} />
              <div style={{ width: 13, height: 13, background: '#d4a017', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.45)' }} />
              <div style={{ width: 32, height: 26, background: 'linear-gradient(135deg,#ffe066,#c9922e)', borderRadius: '50% 50% 50% 0', transform: 'rotate(22deg)', boxShadow: '0 2px 10px rgba(232,182,74,0.55)' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LID — 3D animated ── */}
        <div style={{ perspective: 1000 }}>
          <motion.div
            animate={{ rotateX: isOpen ? -118 : 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: BOX_W + LID_OVH * 2,
              height: LID_H,
              transformOrigin: 'bottom center',
              transformStyle: 'preserve-3d',
              position: 'relative',
              zIndex: isOpen ? 0 : 25,
              borderRadius: '12px 12px 4px 4px',
              background: 'linear-gradient(155deg, #c0392b 0%, #8b1a1a 55%, #5c0a0a 100%)',
              boxShadow: isOpen
                ? '0 12px 36px rgba(0,0,0,0.65)'
                : '0 -8px 28px rgba(181,58,46,0.55), 0 2px 8px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Lid ribbon */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 20, background: 'linear-gradient(180deg,#ffe066,#d4a017)', zIndex: 3 }} />
            {/* Cursive brand name — from jar label */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 4,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 1, pointerEvents: 'none',
            }}>
              <span style={{
                fontFamily: "'Brush Script MT', 'Segoe Script', 'Dancing Script', cursive",
                fontSize: 19, fontWeight: 700,
                color: 'rgba(255,240,190,0.85)',
                textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}>
                Konjoondu Oorgai
              </span>
            </div>
            {/* Lid glass shine */}
            <div style={{ position: 'absolute', top: 0, left: '10%', width: '28%', height: '100%', background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 100%)', borderRadius: 4 }} />
          </motion.div>
        </div>

        {/* ── BOX BODY ── */}
        <div style={{
          width: BOX_W, height: BOX_H,
          marginLeft: LID_OVH,
          background: 'linear-gradient(158deg, #8b1a1a 0%, #5c0a0a 55%, #2e0404 100%)',
          borderRadius: '3px 3px 16px 16px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 28px 64px rgba(0,0,0,0.75), 0 4px 16px rgba(92,10,10,0.5)',
        }}>
          {/* Inner darkness — visible when lid open */}
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.45 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 30%, transparent 58%)',
              zIndex: 2, pointerEvents: 'none',
            }}
          />

          {/* Ribbon vertical */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 20, background: 'linear-gradient(180deg,#ffe066,#d4a017)', zIndex: 5 }} />

          {/* Front face glass shimmer */}
          <div style={{ position: 'absolute', top: 0, left: '8%', width: '16%', height: '100%', background: 'linear-gradient(180deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0) 100%)', zIndex: 3 }} />

          {/* Jars */}
          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0,
            height: BOX_H - 28,
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
            gap: n > 5 ? 3 : 5, padding: '0 14px', zIndex: 6, overflow: 'hidden',
          }}>
            <AnimatePresence mode="popLayout">
              {jars.map((jar, i) => (
                <motion.div
                  key={jar.instanceId}
                  initial={{ opacity: 0, y: -160, scale: 0.45, rotate: i % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.35, y: 60, rotate: i % 2 === 0 ? 20 : -20 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20, delay: i * 0.06 }}
                  style={{ width: jarW, height: jarH, flexShrink: 0, zIndex: 10 + i }}
                  title={jar.name}
                >
                  <img src={jar.image} alt={jar.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.85))' }} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          <AnimatePresence>
            {totalJars === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, zIndex: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none' }}>
                <motion.span animate={{ y: [0, -7, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: 30 }}>🫙</motion.span>
                <p style={{ fontFamily: 'Georgia, serif', color: 'rgba(232,182,74,0.52)', fontSize: 12, fontStyle: 'italic' }}>Fill the box with your picks</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brand on front (subtle) */}
          <div style={{
            position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', zIndex: 4, pointerEvents: 'none',
            fontFamily: "'Brush Script MT','Segoe Script',cursive",
            fontSize: 11, color: 'rgba(232,182,74,0.28)', letterSpacing: '0.04em',
          }}>
            Konjoondu Oorgai
          </div>
        </div>

        {/* Right-side 3D depth panel */}
        <div style={{
          position: 'absolute', top: LID_H + 2, right: 0,
          width: LID_OVH, height: BOX_H,
          background: 'linear-gradient(90deg, #3d0808, #1a0404)',
          borderRadius: '0 4px 8px 0',
        }} />
      </div>

      {/* ── LETTER — slides in beside box when lid closes ── */}
      <AnimatePresence>
        {showLetter && (
          <motion.div
            key="letter"
            initial={{ x: 48, opacity: 0, rotate: 14 }}
            animate={{ x: 0, opacity: 1, rotate: 6 }}
            exit={{ x: 48, opacity: 0, rotate: 14 }}
            transition={{ duration: 0.72, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: 172, height: 248, flexShrink: 0,
              transformOrigin: 'bottom left',
              alignSelf: 'flex-end', marginBottom: 8, marginLeft: -12,
            }}
          >
            <div style={{
              width: '100%', height: '100%', borderRadius: 2,
              border: '1px solid #e2d5c5',
              boxShadow: '10px 18px 38px rgba(0,0,0,0.7)',
              background: '#fdf8f3',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', position: 'relative',
            }}>
              {/* Ruled lines */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(transparent calc(1.4em - 1px),rgba(180,180,220,0.35) 0)', backgroundSize: '100% 1.4em', backgroundPosition: '0 2.8em' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 14px 12px', fontFamily: 'Georgia, serif', color: '#3d2b1f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e2d5c5' }}>
                  <span style={{ fontSize: 7, fontFamily: 'system-ui', fontWeight: 700, letterSpacing: '0.16em', color: '#8b5e3c', textTransform: 'uppercase' }}>Gift Message</span>
                  <Heart size={9} fill="#e8b64a" color="#e8b64a" />
                </div>
                <div style={{ fontSize: 10, fontStyle: 'italic', color: '#8b5e3c', marginBottom: 8 }}>
                  Dear {recipientName || <span style={{ color: '#c9922e' }}>Recipient</span>},
                </div>
                <div style={{ flex: 1, overflow: 'hidden', fontSize: 10, lineHeight: 1.65, fontStyle: 'italic' }}>
                  {message
                    ? <span>{message}</span>
                    : <span style={{ color: 'rgba(139,94,60,0.38)' }}>Your heartfelt message will appear here…</span>
                  }
                </div>
                <div style={{ marginTop: 8, fontSize: 10, fontStyle: 'italic', color: '#8b5e3c' }}>
                  With love,<br />
                  <span style={{ color: '#b53a2e', fontWeight: 600, fontSize: 13 }}>{senderName || 'You'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Input helpers ──────────────────────────────────────────────────────────────

const inputCls = "w-full bg-white border border-[#e2d5c5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#b53a2e] focus:ring-1 focus:ring-[#b53a2e] transition-all font-sans text-[#1a0800] placeholder-[#c5b4a6]";
const labelCls = "block text-[10px] font-bold text-[#8b5e3c] uppercase tracking-[0.1em] mb-1.5";

// ── Main Modal ─────────────────────────────────────────────────────────────────

function GiftModalContent({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const initialDraft = readDraft();
  const hasDraft = !!initialDraft && isDraftMeaningful(initialDraft);

  const [tab, setTab] = useState<Tab>(
    initialDraft?.tab && initialDraft.tab !== ('review' as Tab) ? initialDraft.tab : 'jars'
  );
  const [sender, setSender] = useState<SenderForm>(initialDraft?.sender ?? EMPTY_SENDER);
  const [recipient, setRecipient] = useState<RecipientForm>(initialDraft?.recipient ?? EMPTY_RECIPIENT);
  const [giftItems, setGiftItems] = useState<GiftItem[]>(initialDraft?.giftItems ?? []);
  const [message, setMessage] = useState(initialDraft?.message ?? '');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [loading, setLoading] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [draftRestored, setDraftRestored] = useState(hasDraft);

  // Draft autosave
  useEffect(() => {
    if (confirmedOrderId) return;
    saveDraft({ tab, sender, recipient, giftItems, message });
  }, [tab, sender, recipient, giftItems, message, confirmedOrderId]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const totalAmount = giftItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalJars = giftItems.reduce((s, i) => s + i.quantity, 0);

  // Flat array of jars for the visualizer
  const jarsInBox = giftItems.flatMap(item =>
    Array.from({ length: item.quantity }).map((_, idx) => ({
      instanceId: `${item.productId}-${item.size}-${idx}`,
      image: item.image,
      name: item.productName,
    }))
  );

  function resetForm() {
    clearDraft();
    setTab('jars'); setSender(EMPTY_SENDER); setRecipient(EMPTY_RECIPIENT);
    setGiftItems([]); setMessage(''); setDraftRestored(false);
  }

  // ── Product helpers ──────────────────────────────────────────────────────────
  function getQty(productId: number, size: string) {
    return giftItems.find(i => i.productId === productId && i.size === size)?.quantity ?? 0;
  }
  function addItem(productId: number, size: string, price: number, productName: string, image: string) {
    setGiftItems(prev => {
      const existing = prev.find(i => i.productId === productId && i.size === size);
      if (existing) return prev.map(i => i.productId === productId && i.size === size ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId, productName, size, price, quantity: 1, image }];
    });
  }
  function updateQty(productId: number, size: string, delta: number) {
    setGiftItems(prev => {
      const existing = prev.find(i => i.productId === productId && i.size === size);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter(i => !(i.productId === productId && i.size === size));
      return prev.map(i => i.productId === productId && i.size === size ? { ...i, quantity: newQty } : i);
    });
  }

  // ── Validation per tab ───────────────────────────────────────────────────────
  function validateTab(t: Tab): string | null {
    if (t === 'jars' && giftItems.length === 0) return 'Add at least one jar to the box';
    if (t === 'letter') {
      if (!sender.name.trim()) return 'Enter your name';
      if (!recipient.name.trim()) return 'Enter recipient name';
    }
    if (t === 'delivery') {
      if (!/^[6-9]\d{9}$/.test(sender.phone.replace(/\s/g, ''))) return 'Enter your valid 10-digit mobile number';
      if (!/^[6-9]\d{9}$/.test(recipient.phone.replace(/\s/g, ''))) return 'Enter recipient\'s valid 10-digit mobile number';
      if (!recipient.line1.trim()) return 'Enter delivery address';
      if (!recipient.city.trim()) return 'Enter city';
      if (!recipient.state.trim()) return 'Enter state';
      if (!/^\d{6}$/.test(recipient.pincode)) return 'Enter a valid 6-digit pincode';
    }
    return null;
  }

  const TAB_ORDER: Tab[] = ['jars', 'letter', 'delivery', 'review'];
  function handleNext() {
    const err = validateTab(tab);
    if (err) { toast({ title: err, variant: 'destructive' }); return; }
    const next = TAB_ORDER[TAB_ORDER.indexOf(tab) + 1];
    if (next) setTab(next);
  }

  // ── Order placement ──────────────────────────────────────────────────────────
  async function placeOrderCOD() {
    setLoading(true);
    try {
      const shippingAddress = [recipient.line1, recipient.city, recipient.state, recipient.pincode].filter(Boolean).join(', ');
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: recipient.name, phone: recipient.phone, email: '', address: shippingAddress },
          items: giftItems.map(i => ({ productId: i.productId, productName: i.productName, size: i.size, price: i.price, quantity: i.quantity })),
          totalAmount, isGift: true,
          giftSender: { name: sender.name, phone: sender.phone, email: sender.email },
          giftMessage: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) { clearDraft(); setConfirmedOrderId(data.orderId); }
      else toast({ title: 'Order failed', description: data.message, variant: 'destructive' });
    } finally { setLoading(false); }
  }

  async function placeOrderOnline() {
    setLoading(true);
    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) { toast({ title: 'Payment SDK failed to load', variant: 'destructive' }); setLoading(false); return; }
      const createRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });
      const createData = await createRes.json();
      if (!createData.success) { toast({ title: 'Could not initiate payment', variant: 'destructive' }); setLoading(false); return; }
      const rzp = new window.Razorpay({
        key: createData.keyId, amount: createData.amount, currency: createData.currency,
        order_id: createData.orderId, name: 'Konjoondu Oorgai',
        description: `Gift order — ${totalJars} jar${totalJars !== 1 ? 's' : ''}`,
        prefill: { name: sender.name, contact: sender.phone, email: sender.email },
        theme: { color: '#e8b64a' },
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) { toast({ title: 'Payment verification failed', variant: 'destructive' }); return; }
          const shippingAddress = [recipient.line1, recipient.city, recipient.state, recipient.pincode].filter(Boolean).join(', ');
          const orderRes = await fetch(`${API_BASE}/orders`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer: { name: recipient.name, phone: recipient.phone, email: '', address: shippingAddress },
              items: giftItems.map(i => ({ productId: i.productId, productName: i.productName, size: i.size, price: i.price, quantity: i.quantity })),
              totalAmount, paymentId: response.razorpay_payment_id, isGift: true,
              giftSender: { name: sender.name, phone: sender.phone, email: sender.email },
              giftMessage: message.trim() || undefined,
            }),
          });
          const orderData = await orderRes.json();
          if (orderData.success) { clearDraft(); setConfirmedOrderId(orderData.orderId); }
          else toast({ title: 'Order recording failed', description: orderData.message, variant: 'destructive' });
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
      setLoading(false);
    }
  }

  // ── Confirmed screen ─────────────────────────────────────────────────────────
  if (confirmedOrderId) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(26,8,0,0.82)', backdropFilter: 'blur(10px)' }}>
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden flex flex-col items-center text-center p-12 max-w-sm w-full"
          style={{ background: '#fdf8f3', boxShadow: '0 32px 96px rgba(26,8,0,0.5)' }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #e8b64a, #c9922e)' }}>
            <Check size={36} color="#fff" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1a0800', marginBottom: 8 }}>
            Gift on its way! 🎁
          </h2>
          <p style={{ fontSize: 13, color: '#8b5e3c', marginBottom: 6 }}>
            Order <strong style={{ color: '#b53a2e' }}>#{confirmedOrderId}</strong> placed
          </p>
          <p style={{ fontSize: 12, color: '#8b5e3c', lineHeight: 1.6 }}>
            Your curated box will be lovingly packed and dispatched to <strong>{recipient.name}</strong>.
          </p>
          <button
            onClick={onClose}
            className="mt-8 px-8 py-3 rounded-full font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #b53a2e, #8b2a20)', color: '#fff9f0', boxShadow: '0 4px 20px rgba(181,58,46,0.4)' }}
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[1000] flex overflow-hidden"
      style={{ background: 'rgba(26,8,0,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        .gift-hide-scroll::-webkit-scrollbar { display: none; }
        .gift-hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 20 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col md:flex-row w-full h-full md:h-[95vh] md:m-auto md:rounded-3xl overflow-hidden"
        style={{ maxWidth: 960, boxShadow: '0 40px 120px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── LEFT: Visualizer ────────────────────────────────────────────────── */}
        <div className="relative hidden md:flex flex-1 items-center justify-center overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(160deg, #1a0800 0%, #2d1008 100%)' }}>

          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(181,58,46,0.18) 0%, transparent 65%)', filter: 'blur(20px)' }} />

          {/* Close button (desktop) */}
          <button
            onClick={onClose}
            className="absolute top-5 left-5 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fdf8f3' }}
          >
            <X size={15} />
          </button>

          {/* Draft restored badge */}
          <AnimatePresence>
            {draftRestored && (
              <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="absolute top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(232,182,74,0.15)', border: '1px solid rgba(232,182,74,0.25)', color: '#e8b64a', backdropFilter: 'blur(8px)' }}
              >
                <span>💾 Draft restored</span>
                <button onClick={resetForm} className="underline opacity-80 hover:opacity-100" style={{ fontFamily: 'inherit' }}>
                  Start fresh
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D Box + Letter */}
          <div className="relative z-10 flex flex-col items-center">
            <GiftBox3D
              jars={jarsInBox}
              totalJars={totalJars}
              tab={tab}
              senderName={sender.name}
              recipientName={recipient.name}
              message={message}
            />

            {/* Status pill */}
            <motion.div
              animate={{ scale: totalJars > 0 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className="mt-7 px-5 py-2 rounded-full text-sm font-bold"
              style={{
                background: totalJars > 0 ? 'rgba(232,182,74,0.15)' : 'rgba(255,255,255,0.06)',
                color: totalJars > 0 ? '#e8b64a' : 'rgba(255,255,255,0.30)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              {tab === 'jars'
                ? (totalJars > 0 ? `${totalJars} jar${totalJars !== 1 ? 's' : ''} in the box` : 'Box is open — add jars')
                : (totalJars > 0 ? `${totalJars} jar${totalJars !== 1 ? 's' : ''} sealed inside` : 'Empty box')}
            </motion.div>
          </div>
        </div>

        {/* ── RIGHT: Controls ──────────────────────────────────────────────────── */}
        <div className="w-full md:w-[430px] flex-1 md:flex-none flex flex-col bg-[#fdf8f3] text-[#1a0800] relative z-20 min-h-0 overflow-hidden"
          style={{ boxShadow: '-20px 0 60px rgba(0,0,0,0.4)' }}>

          {/* Header */}
          <div className="px-5 md:px-7 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-[#e2d5c5] shrink-0 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1a0800', marginBottom: 1, lineHeight: 1.2 }}>
                Curate Your Gift 🎁
              </h1>
              <p className="hidden md:block" style={{ fontSize: 12, color: '#8b5e3c' }}>Handcrafted coastal flavors, packed with love.</p>
            </div>
            {/* Mobile close */}
            <button onClick={onClose} className="md:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(181,58,46,0.08)', color: '#b53a2e' }}>
              <X size={16} />
            </button>
          </div>

          {/* Tabs — stepper style on mobile, text tabs on desktop */}
          <div className="shrink-0 border-b border-[#e2d5c5]">
            {/* Mobile stepper */}
            <div className="flex md:hidden items-center px-4 py-3 gap-0">
              {([
                { id: 'jars',     label: 'Jars',     step: 1 },
                { id: 'letter',   label: 'Letter',   step: 2 },
                { id: 'delivery', label: 'Delivery', step: 3 },
                { id: 'review',   label: 'Review',   step: 4 },
              ] as { id: Tab; label: string; step: number }[]).map((t, i) => {
                const tabIdx = TAB_ORDER.indexOf(t.id);
                const curIdx = TAB_ORDER.indexOf(tab);
                const isDone = tabIdx < curIdx;
                const isActive = t.id === tab;
                return (
                  <React.Fragment key={t.id}>
                    <button
                      onClick={() => { if (tabIdx < curIdx) setTab(t.id); }}
                      className="flex flex-col items-center gap-1 flex-1"
                      style={{ cursor: tabIdx <= curIdx ? 'pointer' : 'default' }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: isDone ? '#c9922e' : isActive ? '#b53a2e' : '#e2d5c5',
                          boxShadow: isActive ? '0 0 0 3px rgba(181,58,46,0.15)' : 'none',
                        }}
                      >
                        {isDone
                          ? <Check size={12} color="#fff" strokeWidth={3} />
                          : <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? '#fff' : '#8b5e3c' }}>{t.step}</span>
                        }
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: isActive ? '#b53a2e' : isDone ? '#c9922e' : '#c5b4a6',
                      }}>
                        {t.label}
                      </span>
                    </button>
                    {i < 3 && (
                      <div className="flex-1 h-px mx-1 mt-[-14px]"
                        style={{ background: tabIdx < curIdx ? '#c9922e' : '#e2d5c5', maxWidth: 28 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {/* Desktop text tabs */}
            <div className="hidden md:flex px-7 gap-1">
              {([
                { id: 'jars', label: '1. Jars' },
                { id: 'letter', label: '2. Letter' },
                { id: 'delivery', label: '3. Delivery' },
                { id: 'review', label: '4. Review' },
              ] as { id: Tab; label: string }[]).map(t => {
                const tabIdx = TAB_ORDER.indexOf(t.id);
                const curIdx = TAB_ORDER.indexOf(tab);
                const isDone = tabIdx < curIdx;
                const isActive = t.id === tab;
                return (
                  <button
                    key={t.id}
                    onClick={() => { if (tabIdx < curIdx) setTab(t.id); }}
                    className="pb-3 pt-4 px-2 text-[10px] font-bold uppercase tracking-wider relative transition-colors"
                    style={{ color: isActive ? '#b53a2e' : isDone ? '#c9922e' : '#c5b4a6', cursor: tabIdx <= curIdx ? 'pointer' : 'default' }}
                  >
                    {isDone && <Check size={9} className="inline mr-1 -mt-0.5" strokeWidth={3} />}
                    {t.label}
                    {isActive && (
                      <motion.div layoutId="giftActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#b53a2e]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile status bar — replaces the oversized scaled box */}
          <div className="md:hidden shrink-0 px-5 py-3 border-b border-[#e2d5c5] flex items-center gap-3"
            style={{ background: totalJars > 0 ? 'rgba(181,58,46,0.04)' : '#fdf8f3' }}>
            {/* Mini jar count pill */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span style={{ fontSize: 18 }}>🎁</span>
              <div className="min-w-0">
                <p style={{ fontSize: 12, fontWeight: 700, color: totalJars > 0 ? '#b53a2e' : '#c5b4a6' }}>
                  {totalJars > 0
                    ? `${totalJars} jar${totalJars !== 1 ? 's' : ''} in the box`
                    : tab === 'jars' ? 'Box is empty — add jars below' : 'Box sealed'}
                </p>
                {totalJars > 0 && (
                  <p style={{ fontSize: 11, color: '#8b5e3c' }}>₹{totalAmount.toLocaleString('en-IN')} total</p>
                )}
              </div>
            </div>
            {/* Mini jar image strip */}
            {jarsInBox.length > 0 && (
              <div className="flex items-center -space-x-2 shrink-0">
                {jarsInBox.slice(0, 4).map((jar, i) => (
                  <div key={jar.instanceId} className="w-8 h-8 rounded-lg border-2 border-white bg-[#fdf8f3] flex items-center justify-center overflow-hidden"
                    style={{ zIndex: 10 - i }}>
                    <img src={jar.image} alt={jar.name} className="w-full h-full object-contain" />
                  </div>
                ))}
                {jarsInBox.length > 4 && (
                  <div className="w-8 h-8 rounded-lg border-2 border-white bg-[#b53a2e] flex items-center justify-center"
                    style={{ zIndex: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>+{jarsInBox.length - 4}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto gift-hide-scroll p-4 md:p-7 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >

                {/* ── JARS ── */}
                {tab === 'jars' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#8b5e3c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Pick your jars
                      </span>
                      {totalJars > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(181,58,46,0.08)', color: '#b53a2e' }}>
                          {totalJars} in box · ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {products.map(product => {
                      const sizes = getVisibleProductSizes(product);
                      return (
                        <div key={product.id}
                          className="flex gap-3 p-4 rounded-xl border transition-all"
                          style={{
                            borderColor: sizes.some(sz => getQty(product.id, sz.label) > 0) ? 'rgba(181,58,46,0.4)' : '#e2d5c5',
                            background: sizes.some(sz => getQty(product.id, sz.label) > 0) ? 'rgba(181,58,46,0.02)' : '#fff',
                          }}
                        >
                          <div className="w-14 h-14 rounded-lg border border-[#e2d5c5] p-1.5 flex items-center justify-center shrink-0 bg-[#fdf8f3]">
                            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a0800' }}>{product.name}</span>
                              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(181,58,46,0.08)', color: '#b53a2e' }}>{product.tag}</span>
                            </div>
                            <p style={{ fontSize: 11, color: '#8b5e3c', marginBottom: 10, lineHeight: 1.4 }}>
                              {product.description.slice(0, 60)}…
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {sizes.map(sz => {
                                const qty = getQty(product.id, sz.label);
                                return (
                                  <div key={sz.label}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all"
                                    style={{
                                      borderColor: qty > 0 ? 'rgba(181,58,46,0.35)' : '#e2d5c5',
                                      background: qty > 0 ? 'rgba(181,58,46,0.05)' : 'transparent',
                                    }}
                                  >
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6b4c38' }}>{sz.label}</span>
                                    <span style={{ fontSize: 10, color: '#8b5e3c' }}>₹{sz.price}</span>
                                    {qty > 0 ? (
                                      <div className="flex items-center gap-1 ml-1">
                                        <button onClick={() => updateQty(product.id, sz.label, -1)}
                                          className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
                                          style={{ background: '#b53a2e', color: '#fff' }}>
                                          <Minus size={9} strokeWidth={3} />
                                        </button>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#b53a2e', minWidth: 14, textAlign: 'center' }}>{qty}</span>
                                        <button onClick={() => addItem(product.id, sz.label, sz.price, product.name, product.image)}
                                          className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
                                          style={{ background: '#b53a2e', color: '#fff' }}>
                                          <Plus size={9} strokeWidth={3} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button onClick={() => addItem(product.id, sz.label, sz.price, product.name, product.image)}
                                        className="w-5 h-5 rounded-md flex items-center justify-center transition-colors ml-1"
                                        style={{ background: 'rgba(181,58,46,0.12)', color: '#b53a2e' }}>
                                        <Plus size={9} strokeWidth={3} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* ── LETTER ── */}
                {tab === 'letter' && (
                  <>
                    <p style={{ fontSize: 12, color: '#8b5e3c', lineHeight: 1.5 }}>
                      These names and message will be printed on the gift letter tucked into the box.
                    </p>
                    <div>
                      <label className={labelCls}>From — Your Name *</label>
                      <input className={inputCls} placeholder="e.g. Priya Kumar" value={sender.name}
                        onChange={e => setSender(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>To — Recipient Name *</label>
                      <input className={inputCls} placeholder="e.g. Ravi Shankar" value={recipient.name}
                        onChange={e => setRecipient(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className={labelCls} style={{ marginBottom: 0 }}>Special Message</label>
                        <span style={{ fontSize: 10, color: '#c5b4a6' }}>{message.length}/300</span>
                      </div>
                      <textarea
                        className={`${inputCls} resize-none`}
                        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
                        placeholder="Write something heartfelt here…"
                        rows={5} maxLength={300} value={message}
                        onChange={e => setMessage(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* ── DELIVERY ── */}
                {tab === 'delivery' && (
                  <>
                    <div className="p-4 rounded-xl border border-[#b53a2e]/15"
                      style={{ background: 'rgba(181,58,46,0.04)' }}>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700, color: '#b53a2e', marginBottom: 2 }}>
                        Almost there!
                      </p>
                      <p style={{ fontSize: 11, color: '#8b5e3c' }}>Tell us where to deliver the box and how to reach both of you.</p>
                    </div>

                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#8b5e3c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        Your Contact
                      </p>
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className={labelCls}>Your Mobile *</label>
                          <input className={inputCls} placeholder="10-digit mobile number" value={sender.phone} inputMode="tel" maxLength={10}
                            onChange={e => setSender(p => ({ ...p, phone: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Your Email (optional)</label>
                          <input className={inputCls} placeholder="you@email.com" type="email" value={sender.email}
                            onChange={e => setSender(p => ({ ...p, email: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#8b5e3c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        Recipient Delivery
                      </p>
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className={labelCls}>Recipient Mobile *</label>
                          <input className={inputCls} placeholder="10-digit mobile number" value={recipient.phone} inputMode="tel" maxLength={10}
                            onChange={e => setRecipient(p => ({ ...p, phone: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Address *</label>
                          <input className={inputCls} placeholder="House no., Street, Area" value={recipient.line1}
                            onChange={e => setRecipient(p => ({ ...p, line1: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>City *</label>
                            <input className={inputCls} placeholder="Chennai" value={recipient.city}
                              onChange={e => setRecipient(p => ({ ...p, city: e.target.value }))} />
                          </div>
                          <div>
                            <label className={labelCls}>State *</label>
                            <input className={inputCls} placeholder="Tamil Nadu" value={recipient.state}
                              onChange={e => setRecipient(p => ({ ...p, state: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Pincode *</label>
                          <input className={inputCls} placeholder="6-digit pincode" value={recipient.pincode} inputMode="numeric" maxLength={6}
                            onChange={e => setRecipient(p => ({ ...p, pincode: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ── REVIEW ── */}
                {tab === 'review' && (
                  <>
                    {/* Order summary */}
                    <div className="rounded-xl border border-[#e2d5c5] overflow-hidden">
                      <div className="px-5 py-3 border-b border-[#e2d5c5]"
                        style={{ background: 'rgba(181,58,46,0.04)' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#8b5e3c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Gift Contents
                        </span>
                      </div>
                      <div className="divide-y divide-[#e2d5c5]">
                        {giftItems.map(item => (
                          <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 px-5 py-3">
                            <img src={item.image} alt={item.productName} className="w-9 h-9 object-contain" />
                            <div className="flex-1 min-w-0">
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a0800' }}>{item.productName}</p>
                              <p style={{ fontSize: 11, color: '#8b5e3c' }}>{item.size} × {item.quantity}</p>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#b53a2e' }}>
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center px-5 py-3 border-t border-[#e2d5c5]"
                        style={{ background: 'rgba(181,58,46,0.04)' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5e3c' }}>Total</span>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#b53a2e' }}>
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Addresses summary */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'From', name: sender.name, detail: sender.phone },
                        { label: 'To', name: recipient.name, detail: `${recipient.city}, ${recipient.pincode}` },
                      ].map(b => (
                        <div key={b.label} className="p-4 rounded-xl border border-[#e2d5c5] bg-white">
                          <p style={{ fontSize: 10, fontWeight: 700, color: '#8b5e3c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{b.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1a0800' }}>{b.name}</p>
                          <p style={{ fontSize: 11, color: '#8b5e3c' }}>{b.detail}</p>
                        </div>
                      ))}
                    </div>

                    {/* Message preview */}
                    {message && (
                      <div className="p-4 rounded-xl border-2 border-dashed border-[#e8b64a]/40"
                        style={{ background: '#fff9f0' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Heart size={12} fill="#e8b64a" color="#e8b64a" />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#c9922e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gift Message</span>
                        </div>
                        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#3d2b1f', lineHeight: 1.6 }}>{message}</p>
                      </div>
                    )}

                    {/* Payment method */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#8b5e3c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        Payment Method
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {(['online', 'cod'] as const).map(method => (
                          <button key={method} onClick={() => setPaymentMethod(method)}
                            className="p-4 rounded-xl border-2 text-left transition-all"
                            style={{
                              borderColor: paymentMethod === method ? '#b53a2e' : '#e2d5c5',
                              background: paymentMethod === method ? 'rgba(181,58,46,0.05)' : '#fff',
                            }}
                          >
                            <p style={{ fontSize: 13, fontWeight: 700, color: paymentMethod === method ? '#b53a2e' : '#1a0800', marginBottom: 2 }}>
                              {method === 'online' ? '💳 Pay Online' : '💵 Cash on Delivery'}
                            </p>
                            <p style={{ fontSize: 11, color: '#8b5e3c' }}>
                              {method === 'online' ? 'UPI, Cards, Netbanking' : 'Pay when delivered'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-7 py-5 border-t border-[#e2d5c5] shrink-0 bg-white">
            {tab !== 'jars' && totalAmount > 0 && (
              <div className="flex justify-between items-center mb-3">
                <span style={{ fontSize: 12, color: '#8b5e3c', fontWeight: 600 }}>Total</span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#b53a2e' }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {tab === 'review' ? (
              <button
                onClick={paymentMethod === 'cod' ? placeOrderCOD : placeOrderOnline}
                disabled={loading}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all"
                style={{
                  background: loading ? '#e2d5c5' : 'linear-gradient(135deg, #e8b64a, #c9922e)',
                  color: loading ? '#8b5e3c' : '#1a0800',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(232,182,74,0.4)',
                }}
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : <><Check size={16} strokeWidth={2.5} /> Place Gift Order</>}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all"
                style={{
                  background: giftItems.length > 0 || tab !== 'jars'
                    ? 'linear-gradient(135deg, #b53a2e, #8b2a20)'
                    : '#e2d5c5',
                  color: giftItems.length > 0 || tab !== 'jars' ? '#fff9f0' : '#8b5e3c',
                  boxShadow: giftItems.length > 0 || tab !== 'jars' ? '0 4px 20px rgba(181,58,46,0.35)' : 'none',
                  cursor: giftItems.length === 0 && tab === 'jars' ? 'not-allowed' : 'pointer',
                }}
              >
                {tab === 'jars' && (giftItems.length > 0 ? <>Write the Letter <ChevronRight size={16} /></> : 'Add a jar to continue')}
                {tab === 'letter' && <>Add Delivery Details <ChevronRight size={16} /></>}
                {tab === 'delivery' && <>Review & Pay <ChevronRight size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Portal wrapper ────────────────────────────────────────────────────────────

export default function GiftOrderModal({ isOpen, onClose }: Props) {
  const handleClose = useCallback(onClose, [onClose]);

  if (!isOpen) return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && <GiftModalContent onClose={handleClose} />}
    </AnimatePresence>,
    document.body
  );
}
