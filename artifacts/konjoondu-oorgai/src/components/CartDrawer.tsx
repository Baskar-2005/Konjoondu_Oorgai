import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight, CheckCircle2, Package, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

type Step = 'cart' | 'checkout' | 'confirmed';

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, '');

function CartDrawerContent() {
  const { items, totalAmount, totalItems, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('cart');
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Reset step to 'cart' whenever drawer closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setStep('cart'), 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  async function placeOrder() {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map(i => ({
            productId: i.productId,
            productName: i.productName,
            size: i.size,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        setStep('confirmed');
        clearCart();
        setForm({ name: '', phone: '', email: '', address: '' });
      } else {
        toast({ title: 'Order failed', description: data.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Full-screen backdrop ── */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={closeCart}
          />

          {/* ── Drawer panel ── */}
          <motion.div
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: 440,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--background)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(139,94,60,0.12)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {step === 'checkout' && (
                  <button
                    onClick={() => setStep('cart')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(181,58,46,0.08)', border: 'none',
                      cursor: 'pointer', marginRight: 4,
                    }}
                  >
                    <ChevronLeft size={16} color="hsl(4,60%,44%)" />
                  </button>
                )}
                <ShoppingCart size={20} color="hsl(4,60%,44%)" />
                <span style={{ fontSize: 18, fontWeight: 700 }}>
                  {step === 'cart' && `Your Cart${totalItems > 0 ? ` (${totalItems})` : ''}`}
                  {step === 'checkout' && 'Checkout'}
                  {step === 'confirmed' && 'Order Placed!'}
                </span>
              </div>
              <button
                onClick={closeCart}
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: 'none',
                  background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>

              {/* CART STEP */}
              {step === 'cart' && (
                <>
                  {items.length === 0 ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', height: '100%', padding: '60px 32px',
                      textAlign: 'center', gap: 16,
                    }}>
                      <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(181,58,46,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ShoppingCart size={32} color="hsl(4,60%,44%)" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Your cart is empty</p>
                        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 14 }}>
                          Add some handcrafted pickles to get started!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {items.map(item => (
                        <div key={`${item.productId}-${item.size}`}
                          style={{
                            display: 'flex', gap: 12, padding: 14, borderRadius: 16,
                            border: '1px solid rgba(139,94,60,0.1)',
                            background: 'rgba(181,58,46,0.025)',
                          }}>
                          {/* Image */}
                          <img src={item.image} alt={item.productName}
                            style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />

                          {/* Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                              <p style={{ fontWeight: 700, fontSize: 14, lineHeight: '1.3' }}>{item.productName}</p>
                              <button
                                onClick={() => removeItem(item.productId, item.size)}
                                style={{
                                  flexShrink: 0, padding: '4px', borderRadius: 8, border: 'none',
                                  background: 'transparent', cursor: 'pointer', color: 'hsl(var(--muted-foreground))',
                                  display: 'flex',
                                }}
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 10 }}>
                              {item.size} · ₹{item.price} each
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              {/* Qty stepper */}
                              <div style={{
                                display: 'flex', alignItems: 'center', borderRadius: 10,
                                border: '1px solid rgba(139,94,60,0.2)', overflow: 'hidden',
                              }}>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                  style={{ width: 30, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Minus size={12} />
                                </button>
                                <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                  style={{ width: 30, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              {/* Line total */}
                              <span style={{ fontWeight: 800, fontSize: 15, color: 'hsl(4,60%,44%)' }}>
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* CHECKOUT STEP */}
              {step === 'checkout' && (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
                    Fill in your details and we'll confirm your order within 24 hours.
                  </p>

                  {[
                    { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Your name' },
                    { key: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                    { key: 'email', label: 'Email (optional)', type: 'email', placeholder: 'you@email.com' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type} placeholder={f.placeholder}
                        value={form[f.key as keyof CheckoutForm]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 14,
                          border: '1.5px solid rgba(139,94,60,0.2)', background: 'transparent',
                          outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                          color: 'inherit',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'hsl(4,60%,44%)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(139,94,60,0.2)'; }}
                      />
                    </div>
                  ))}

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                      Delivery Address *
                    </label>
                    <textarea
                      placeholder="Full delivery address with pincode"
                      rows={3} value={form.address}
                      onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 14,
                        border: '1.5px solid rgba(139,94,60,0.2)', background: 'transparent',
                        outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                        color: 'inherit',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'hsl(4,60%,44%)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(139,94,60,0.2)'; }}
                    />
                  </div>

                  {/* Summary */}
                  <div style={{ borderRadius: 14, padding: '14px 16px', background: 'rgba(181,58,46,0.05)', border: '1px solid rgba(181,58,46,0.1)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: 10 }}>
                      Order Summary
                    </p>
                    {items.map(item => (
                      <div key={`${item.productId}-${item.size}`}
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'hsl(var(--foreground))' }}>
                        <span style={{ opacity: 0.75 }}>{item.productName} ({item.size}) × {item.quantity}</span>
                        <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(139,94,60,0.15)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                      <span>Total</span>
                      <span style={{ color: 'hsl(4,60%,44%)', fontSize: 17 }}>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONFIRMED STEP */}
              {step === 'confirmed' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', textAlign: 'center', gap: 20, minHeight: 400 }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
                    style={{
                      width: 88, height: 88, borderRadius: '50%',
                      background: 'rgba(34,197,94,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={48} color="#22c55e" />
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Order Placed! 🎉</h3>
                    <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', marginBottom: 16, lineHeight: 1.6 }}>
                      We've received your order and will contact you within 24 hours to confirm delivery.
                    </p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '8px 18px', borderRadius: 12,
                      background: 'rgba(181,58,46,0.08)', color: 'hsl(4,60%,44%)',
                    }}>
                      <Package size={16} />
                      <span style={{ fontWeight: 800, letterSpacing: '0.05em', fontSize: 14 }}>{orderId}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
                    Payment collected at delivery. We'll call you to confirm.
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer / CTA ── */}
            {step !== 'confirmed' && (
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(139,94,60,0.12)',
                flexShrink: 0,
                background: 'var(--background)',
              }}>
                {step === 'cart' && (
                  <>
                    {items.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
                        <span style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))' }}>
                          {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: 'hsl(4,60%,44%)' }}>
                          ₹{totalAmount}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setStep('checkout')}
                      disabled={items.length === 0}
                      style={{
                        width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                        background: items.length === 0 ? 'rgba(181,58,46,0.2)' : 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                        color: items.length === 0 ? 'rgba(255,249,240,0.5)' : '#FFF9F0',
                        fontWeight: 700, fontSize: 15, cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: items.length > 0 ? '0 6px 20px rgba(181,58,46,0.3)' : 'none',
                        fontFamily: 'inherit',
                      }}
                    >
                      Proceed to Checkout
                      <ArrowRight size={18} />
                    </button>
                  </>
                )}
                {step === 'checkout' && (
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                      background: loading ? 'rgba(181,58,46,0.4)' : 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                      color: '#FFF9F0', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 6px 20px rgba(181,58,46,0.3)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {loading ? 'Placing Order…' : `Place Order · ₹${totalAmount}`}
                  </button>
                )}
              </div>
            )}
            {step === 'confirmed' && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(139,94,60,0.12)', flexShrink: 0, background: 'var(--background)' }}>
                <button
                  onClick={closeCart}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                    background: 'hsl(4,60%,44%)', color: '#FFF9F0',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(<CartDrawerContent />, document.body);
}
