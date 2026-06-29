import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight, CheckCircle2, Package } from 'lucide-react';
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

export default function CartDrawer() {
  const { items, totalAmount, totalItems, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('cart');
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  function handleClose() {
    closeCart();
    if (step === 'confirmed') {
      setTimeout(() => setStep('cart'), 400);
    }
  }

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
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[151] w-full max-w-md flex flex-col shadow-2xl"
            style={{ background: 'var(--background)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: 'rgba(139,94,60,0.12)' }}>
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} style={{ color: 'hsl(4,60%,44%)' }} />
                <h2 className="text-lg font-bold">
                  {step === 'cart' ? `Your Cart (${totalItems})` :
                   step === 'checkout' ? 'Checkout' : 'Order Confirmed!'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full transition-colors hover:bg-muted"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* CART STEP */}
              {step === 'cart' && (
                <>
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(181,58,46,0.08)' }}>
                        <ShoppingCart size={32} style={{ color: 'hsl(4,60%,44%)' }} />
                      </div>
                      <p className="font-semibold text-lg">Your cart is empty</p>
                      <p className="text-sm text-muted-foreground">
                        Add some handcrafted pickles to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col gap-3">
                      {items.map(item => (
                        <div key={`${item.productId}-${item.size}`}
                          className="flex gap-3 p-3 rounded-2xl border"
                          style={{ borderColor: 'rgba(139,94,60,0.12)', background: 'rgba(181,58,46,0.03)' }}>
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                              <button
                                onClick={() => removeItem(item.productId, item.size)}
                                className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{item.size}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 rounded-lg border p-0.5"
                                style={{ borderColor: 'rgba(139,94,60,0.2)' }}>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                  className="p-1 rounded hover:bg-muted"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                  className="p-1 rounded hover:bg-muted"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                              <span className="font-bold text-sm" style={{ color: 'hsl(4,60%,44%)' }}>
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
                <div className="p-6 flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">Fill in your details and we'll confirm your order.</p>

                  {[
                    { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Your name' },
                    { key: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                    { key: 'email', label: 'Email (optional)', type: 'email', placeholder: 'you@email.com' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key as keyof CheckoutForm]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                        style={{
                          borderColor: 'rgba(139,94,60,0.2)',
                          background: 'transparent',
                        }}
                        onFocus={e => e.target.style.borderColor = 'hsl(4,60%,44%)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(139,94,60,0.2)'}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Delivery Address *
                    </label>
                    <textarea
                      placeholder="Full delivery address with pincode"
                      rows={3}
                      value={form.address}
                      onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors resize-none"
                      style={{ borderColor: 'rgba(139,94,60,0.2)', background: 'transparent' }}
                      onFocus={e => e.target.style.borderColor = 'hsl(4,60%,44%)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(139,94,60,0.2)'}
                    />
                  </div>

                  {/* Order summary */}
                  <div className="rounded-2xl p-4 mt-2" style={{ background: 'rgba(181,58,46,0.05)', border: '1px solid rgba(181,58,46,0.1)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground">Order Summary</p>
                    {items.map(item => (
                      <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm mb-1.5">
                        <span className="text-foreground/70">{item.productName} ({item.size}) × {item.quantity}</span>
                        <span className="font-semibold">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2 flex justify-between font-bold"
                      style={{ borderColor: 'rgba(139,94,60,0.15)' }}>
                      <span>Total</span>
                      <span style={{ color: 'hsl(4,60%,44%)' }}>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONFIRMED STEP */}
              {step === 'confirmed' && (
                <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.12)' }}
                  >
                    <CheckCircle2 size={48} className="text-green-500" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Order Placed! 🎉</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      We've received your order and will contact you within 24 hours to confirm.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{ background: 'rgba(181,58,46,0.08)', color: 'hsl(4,60%,44%)' }}>
                      <Package size={16} />
                      <span className="font-bold tracking-wide text-sm">{orderId}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Payment will be collected at delivery. We'll reach out on your phone number.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {step !== 'confirmed' && (
              <div className="p-4 border-t" style={{ borderColor: 'rgba(139,94,60,0.12)' }}>
                {step === 'cart' && (
                  <>
                    <div className="flex justify-between items-center mb-4 px-1">
                      <span className="text-sm text-muted-foreground">Subtotal</span>
                      <span className="text-xl font-bold" style={{ color: 'hsl(4,60%,44%)' }}>₹{totalAmount}</span>
                    </div>
                    <button
                      onClick={() => setStep('checkout')}
                      disabled={items.length === 0}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                        color: '#FFF9F0',
                        boxShadow: items.length > 0 ? '0 6px 20px rgba(181,58,46,0.3)' : 'none',
                      }}
                    >
                      Proceed to Checkout
                      <ArrowRight size={18} />
                    </button>
                  </>
                )}
                {step === 'checkout' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('cart')}
                      className="px-4 py-3.5 rounded-2xl font-semibold text-sm border transition-colors"
                      style={{ borderColor: 'rgba(139,94,60,0.2)' }}
                    >
                      Back
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base transition-all disabled:opacity-60"
                      style={{
                        background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                        color: '#FFF9F0',
                        boxShadow: '0 6px 20px rgba(181,58,46,0.3)',
                      }}
                    >
                      {loading ? 'Placing Order…' : 'Place Order'}
                    </button>
                  </div>
                )}
              </div>
            )}
            {step === 'confirmed' && (
              <div className="p-4 border-t" style={{ borderColor: 'rgba(139,94,60,0.12)' }}>
                <button
                  onClick={handleClose}
                  className="w-full py-3.5 rounded-2xl font-bold text-base"
                  style={{ background: 'hsl(4,60%,44%)', color: '#FFF9F0' }}
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
