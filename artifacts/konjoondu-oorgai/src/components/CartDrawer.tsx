import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight, CheckCircle2, Package, ChevronLeft, LogIn } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useCustomer } from '@/context/CustomerContext';
import { useLocation } from 'wouter';

interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

type Step = 'cart' | 'login' | 'checkout' | 'confirmed';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-sdk')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface SavedAddress {
  id: string;
  label: string;
  type: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

function CartDrawerContent() {
  const { items, totalAmount, totalItems, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const { isLoggedIn, customer, token, apiBase, login } = useCustomer();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>('cart');
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; type: string; value: number; maxDiscount?: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseToken = await result.user.getIdToken();
      const res = await fetch(`${apiBase}/auth/google`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.customer);
        setStep('checkout');
      } else {
        toast({ title: 'Google sign-in failed', description: data.message || 'Please try again.', variant: 'destructive' });
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        if (code === 'auth/popup-blocked') {
          toast({ title: 'Popup blocked', description: 'Allow popups for this site and try again.', variant: 'destructive' });
        } else {
          toast({ title: 'Google sign-in failed', description: 'Please try again.', variant: 'destructive' });
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderAmount: totalAmount }),
      });
      const d = await res.json();
      if (d.success) {
        setAppliedCoupon(d.coupon);
        setCouponDiscount(d.discount);
      } else {
        setCouponError(d.message || 'Invalid coupon.');
      }
    } catch { setCouponError('Failed to validate coupon.'); }
    finally { setCouponLoading(false); }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');
  }

  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => setStep('cart'), 350);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (customer) {
      setForm(prev => ({
        ...prev,
        name: customer.name || prev.name,
        phone: customer.phone || prev.phone,
        email: customer.email || prev.email,
      }));
    }
  }, [customer]);

  useEffect(() => {
    if (step !== 'checkout' || !token) return;
    fetch(`${apiBase}/customer/addresses`, { headers: { 'x-customer-token': token } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.addresses.length > 0) {
          setSavedAddresses(d.addresses);
          const def = d.addresses.find((a: SavedAddress) => a.isDefault) ?? d.addresses[0];
          setSelectedAddressId(def.id);
          const fullAddress = [def.line1, def.line2, def.city, def.state, def.pincode].filter(Boolean).join(', ');
          setForm(prev => ({ ...prev, address: fullAddress, name: prev.name || def.recipientName, phone: prev.phone || def.phone }));
        }
      })
      .catch(() => {});
  }, [step, token, apiBase]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  async function placeTestOrder() {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const orderRes = await fetch(`${API_BASE}/orders`, {
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
          totalAmount: Math.max(0, totalAmount - couponDiscount),
          couponCode: appliedCoupon?.code,
          couponDiscount: couponDiscount || undefined,
          paymentId: `TEST_${Date.now()}`,
        }),
      });
      const orderData = await orderRes.json();
      if (orderData.success) {
        setOrderId(orderData.orderId);
        setStep('confirmed');
        clearCart();
        setForm({ name: '', phone: '', email: '', address: '' });
      } else {
        toast({ title: 'Test order failed', description: orderData.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function placeOrder() {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Step 1: load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast({ title: 'Payment SDK failed to load', description: 'Check your internet connection.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Step 2: create Razorpay order on backend
      // TEST MODE: charge ₹1 (Razorpay minimum) to verify the full payment flow.
      // Remove this override (use totalAmount) before going live.
      const TEST_AMOUNT = 1;
      const createRes = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: TEST_AMOUNT }),
      });
      const createData = await createRes.json();
      if (!createData.success) {
        toast({ title: 'Could not initiate payment', description: createData.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Step 3: open Razorpay checkout
      const rzp = new window.Razorpay({
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.orderId,
        name: 'Konjoondu Oorgai',
        description: `Order of ${totalItems} item${totalItems !== 1 ? 's' : ''}`,
        prefill: {
          name: form.name,
          contact: form.phone,
          email: form.email,
        },
        theme: { color: '#B53A2E' },
        handler: async (response: Record<string, string>) => {
          // Step 4: verify payment signature
          const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            toast({ title: 'Payment verification failed', variant: 'destructive' });
            return;
          }

          // Step 5: create order record
          const orderRes = await fetch(`${API_BASE}/orders`, {
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
              totalAmount: Math.max(0, totalAmount - couponDiscount),
              couponCode: appliedCoupon?.code,
              couponDiscount: couponDiscount || undefined,
              paymentId: response.razorpay_payment_id,
            }),
          });
          const orderData = await orderRes.json();
          if (orderData.success) {
            setOrderId(orderData.orderId);
            setStep('confirmed');
            clearCart();
            setForm({ name: '', phone: '', email: '', address: '' });
          } else {
            toast({ title: 'Order recording failed', description: orderData.message, variant: 'destructive' });
          }
        },
        modal: {
          ondismiss: () => { setLoading(false); },
        },
      });

      rzp.open();
      setLoading(false);
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
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
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={closeCart}
          />

          {/* Drawer panel */}
          <motion.div
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: 440, zIndex: 9999,
              display: 'flex', flexDirection: 'column',
              background: 'hsl(var(--background))',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid rgba(139,94,60,0.12)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(step === 'checkout' || step === 'login') && (
                  <button onClick={() => setStep('cart')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(181,58,46,0.08)', border: 'none', cursor: 'pointer', marginRight: 4,
                    }}>
                    <ChevronLeft size={16} color="hsl(4,60%,44%)" />
                  </button>
                )}
                <ShoppingCart size={20} color="hsl(4,60%,44%)" />
                <span style={{ fontSize: 18, fontWeight: 700 }}>
                  {step === 'cart' && `Your Cart${totalItems > 0 ? ` (${totalItems})` : ''}`}
                  {step === 'login' && 'Sign In to Continue'}
                  {step === 'checkout' && 'Checkout'}
                  {step === 'confirmed' && 'Order Placed!'}
                </span>
              </div>
              <button onClick={closeCart}
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: 'none',
                  background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto' }}>

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
                          <img src={item.image} alt={item.productName}
                            style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                              <p style={{ fontWeight: 700, fontSize: 14, lineHeight: '1.3' }}>{item.productName}</p>
                              <button onClick={() => removeItem(item.productId, item.size)}
                                style={{
                                  flexShrink: 0, padding: '4px', borderRadius: 8, border: 'none',
                                  background: 'transparent', cursor: 'pointer', color: 'hsl(var(--muted-foreground))',
                                  display: 'flex',
                                }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 10 }}>
                              {item.size} · ₹{item.price} each
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{
                                display: 'flex', alignItems: 'center', borderRadius: 10,
                                border: '1px solid rgba(139,94,60,0.2)', overflow: 'hidden',
                              }}>
                                <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                  style={{ width: 30, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Minus size={12} />
                                </button>
                                <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
                                  {item.quantity}
                                </span>
                                <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                  style={{ width: 30, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Plus size={12} />
                                </button>
                              </div>
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

              {/* LOGIN STEP */}
              {step === 'login' && (
                <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(181,58,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    🔐
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: 'hsl(var(--foreground))' }}>Sign in to place your order</p>
                    <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                      Your order will be linked to your account so you can track it anytime.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: googleLoading ? 1 : 1.01 }}
                    whileTap={{ scale: googleLoading ? 1 : 0.97 }}
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 14,
                      border: '1.5px solid rgba(139,94,60,0.2)',
                      background: '#fff', color: '#3c3c3c', fontWeight: 700, fontSize: 15,
                      cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)', opacity: googleLoading ? 0.6 : 1,
                    }}>
                    {googleLoading ? (
                      <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                      </svg>
                    )}
                    {googleLoading ? 'Signing in…' : 'Continue with Google'}
                  </motion.button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(139,94,60,0.15)' }} />
                    <span style={{ fontSize: 11, color: '#8b6344', fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(139,94,60,0.15)' }} />
                  </div>

                  <button
                    onClick={() => { closeCart(); navigate('/account'); }}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 14,
                      border: '1.5px solid rgba(181,58,46,0.3)',
                      background: 'transparent', color: 'hsl(4,60%,44%)', fontWeight: 700, fontSize: 14,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                    <LogIn size={16} />
                    Sign in with Phone / Password
                  </button>
                </div>
              )}

              {/* CHECKOUT STEP */}
              {step === 'checkout' && (
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                    borderRadius: 12, background: 'rgba(181,58,46,0.06)', border: '1px solid rgba(181,58,46,0.15)',
                  }}>
                    <span style={{ fontSize: 20 }}>🔒</span>
                    <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                      Secure payment via <strong style={{ color: 'hsl(4,60%,44%)' }}>Razorpay</strong>. UPI, Cards, Net Banking &amp; more accepted.
                    </p>
                  </div>
                  {/* Test mode badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                  }}>
                    <span style={{ fontSize: 14 }}>🧪</span>
                    <p style={{ fontSize: 11, color: '#b45309', lineHeight: 1.4 }}>
                      <strong>Test Mode:</strong> Only ₹1 will be charged. Real order total shown for reference.
                    </p>
                  </div>

                  {[
                    { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Your name' },
                    { key: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                    { key: 'email', label: 'Email *', type: 'email', placeholder: 'you@email.com' },
                  ].map(f => {
                    const isEmailLocked = f.key === 'email' && isLoggedIn && !!customer?.email;
                    return (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                          {f.label}
                          {isEmailLocked && <span style={{ marginLeft: 6, fontSize: 10, color: 'hsl(4,60%,44%)', fontWeight: 700 }}>🔒 Linked to your account</span>}
                        </label>
                        <input
                          type={f.type} placeholder={f.placeholder}
                          value={form[f.key as keyof CheckoutForm]}
                          onChange={e => !isEmailLocked && setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          readOnly={isEmailLocked}
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 14,
                            border: '1.5px solid rgba(139,94,60,0.2)',
                            background: isEmailLocked ? 'rgba(181,58,46,0.04)' : 'transparent',
                            outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: 'inherit',
                            cursor: isEmailLocked ? 'default' : 'text',
                          }}
                          onFocus={e => { if (!isEmailLocked) e.target.style.borderColor = 'hsl(4,60%,44%)'; }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(139,94,60,0.2)'; }}
                        />
                      </div>
                    );
                  })}

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                      Delivery Address *
                    </label>

                    {/* Saved address picker */}
                    {savedAddresses.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                        {savedAddresses.map(addr => (
                          <div key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              const fullAddress = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
                              setForm(prev => ({ ...prev, address: fullAddress }));
                            }}
                            style={{
                              padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                              border: `1.5px solid ${selectedAddressId === addr.id ? 'hsl(4,60%,44%)' : 'rgba(139,94,60,0.2)'}`,
                              background: selectedAddressId === addr.id ? 'rgba(181,58,46,0.06)' : 'transparent',
                              transition: 'all 0.15s',
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: selectedAddressId === addr.id ? 'hsl(4,60%,44%)' : 'hsl(var(--foreground))' }}>
                                {addr.label} {addr.isDefault && <span style={{ fontSize: 10, background: 'hsl(4,60%,44%)', color: '#fff', padding: '1px 6px', borderRadius: 20, marginLeft: 4 }}>DEFAULT</span>}
                              </span>
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedAddressId === addr.id ? 'hsl(4,60%,44%)' : 'rgba(139,94,60,0.3)'}`, background: selectedAddressId === addr.id ? 'hsl(4,60%,44%)' : 'transparent', flexShrink: 0 }} />
                            </div>
                            <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 2, lineHeight: 1.5 }}>
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        ))}
                        <div
                          onClick={() => { setSelectedAddressId(null); setForm(prev => ({ ...prev, address: '' })); }}
                          style={{
                            padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                            border: `1.5px solid ${selectedAddressId === null ? 'hsl(4,60%,44%)' : 'rgba(139,94,60,0.2)'}`,
                            background: selectedAddressId === null ? 'rgba(181,58,46,0.06)' : 'transparent',
                            fontSize: 12, fontWeight: 700,
                            color: selectedAddressId === null ? 'hsl(4,60%,44%)' : 'hsl(var(--muted-foreground))',
                          }}>
                          + Enter a different address
                        </div>
                      </div>
                    )}

                    {/* Manual address input — shown when no saved addresses or "Enter different" selected */}
                    {(savedAddresses.length === 0 || selectedAddressId === null) && (
                      <textarea
                        placeholder="Full delivery address with pincode"
                        rows={3} value={form.address}
                        onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 14,
                          border: '1.5px solid rgba(139,94,60,0.2)', background: 'transparent',
                          outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: 'inherit',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'hsl(4,60%,44%)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(139,94,60,0.2)'; }}
                      />
                    )}
                  </div>

                  {/* Coupon Code */}
                  <div style={{ borderRadius: 14, padding: '14px 16px', background: 'rgba(45,106,79,0.04)', border: '1px solid rgba(45,106,79,0.18)' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2d6a4f', marginBottom: 8 }}>🎟 Have a Coupon?</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={couponCode}
                        onChange={e => { const v = e.target.value.toUpperCase(); setCouponCode(v); if (appliedCoupon) removeCoupon(); }}
                        placeholder="Enter coupon code"
                        disabled={!!appliedCoupon}
                        style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1.5px solid rgba(45,106,79,0.25)', fontSize: 13, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.06em', outline: 'none', background: appliedCoupon ? 'rgba(34,197,94,0.04)' : 'transparent', color: '#2d6a4f', boxSizing: 'border-box' }}
                      />
                      {!appliedCoupon ? (
                        <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                          style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: !couponCode.trim() ? 'rgba(45,106,79,0.3)' : '#2d6a4f', color: '#fff', fontWeight: 700, fontSize: 13, cursor: !couponCode.trim() || couponLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          {couponLoading ? '…' : 'Apply'}
                        </button>
                      ) : (
                        <button onClick={removeCoupon}
                          style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          Remove
                        </button>
                      )}
                    </div>
                    {appliedCoupon && <p style={{ fontSize: 12, color: '#22c55e', marginTop: 7, fontWeight: 700 }}>✅ You save ₹{couponDiscount}! ({appliedCoupon.code} applied)</p>}
                    {couponError && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 7, fontWeight: 600 }}>❌ {couponError}</p>}
                  </div>

                  {/* Order Summary */}
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
                    <div style={{ borderTop: '1px solid rgba(139,94,60,0.15)', marginTop: 8, paddingTop: 8 }}>
                      {couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#8b6344' }}>
                          <span>Subtotal</span>
                          <span>₹{totalAmount}</span>
                        </div>
                      )}
                      {couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#16a34a', fontWeight: 700 }}>
                          <span>🎟 Coupon ({appliedCoupon?.code})</span>
                          <span>−₹{couponDiscount}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                        <span>Total</span>
                        <span style={{ color: 'hsl(4,60%,44%)', fontSize: 17 }}>₹{Math.max(0, totalAmount - couponDiscount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#b45309', marginTop: 4, fontWeight: 600 }}>
                        <span>🧪 Test charge</span>
                        <span>₹1.00</span>
                      </div>
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
                    }}>
                    <CheckCircle2 size={48} color="#22c55e" />
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Payment Successful! 🎉</h3>
                    <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', marginBottom: 16, lineHeight: 1.6 }}>
                      Your order has been confirmed. We'll contact you within 24 hours to arrange delivery.
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
                    Payment collected securely via Razorpay.
                  </p>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            {step !== 'confirmed' && step !== 'login' && (
              <div style={{
                padding: '16px 20px', borderTop: '1px solid rgba(139,94,60,0.12)',
                flexShrink: 0, background: 'hsl(var(--background))',
              }}>
                {step === 'cart' && (
                  <>
                    {items.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
                        <span style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))' }}>
                          {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: 'hsl(4,60%,44%)' }}>₹{totalAmount}</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          setStep('login');
                          return;
                        }
                        setStep('checkout');
                      }}
                      disabled={items.length === 0}
                      style={{
                        width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                        background: items.length === 0 ? 'rgba(181,58,46,0.2)' : 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                        color: items.length === 0 ? 'rgba(255,249,240,0.5)' : '#FFF9F0',
                        fontWeight: 700, fontSize: 15, cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: items.length > 0 ? '0 6px 20px rgba(181,58,46,0.3)' : 'none',
                        fontFamily: 'inherit',
                      }}>
                      Proceed to Checkout
                      <ArrowRight size={18} />
                    </button>
                  </>
                )}
                {step === 'checkout' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Test Order — bypasses Razorpay, goes straight to admin */}
                    <button
                      onClick={placeTestOrder}
                      disabled={loading}
                      style={{
                        width: '100%', padding: '14px', borderRadius: 16, border: '2px dashed rgba(139,94,60,0.4)',
                        background: loading ? 'rgba(139,94,60,0.05)' : 'rgba(139,94,60,0.08)',
                        color: 'hsl(25,38%,39%)', fontWeight: 700, fontSize: 14,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'inherit', transition: 'background 0.2s',
                      }}>
                      {loading ? 'Placing…' : '🧪 Place Test Order (No Payment)'}
                    </button>

                    {/* Razorpay live button */}
                    <button
                      onClick={placeOrder}
                      disabled={loading}
                      style={{
                        width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                        background: loading ? 'rgba(181,58,46,0.4)' : 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                        color: '#FFF9F0', fontWeight: 700, fontSize: 15,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 6px 20px rgba(181,58,46,0.3)', fontFamily: 'inherit',
                      }}>
                      {loading ? 'Opening Payment…' : `Pay ₹1 via Razorpay (Test)`}
                      {!loading && <span style={{ fontSize: 16 }}>🔒</span>}
                    </button>
                  </div>
                )}
              </div>
            )}
            {step === 'confirmed' && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(139,94,60,0.12)', flexShrink: 0, background: 'hsl(var(--background))' }}>
                <button onClick={closeCart}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                    background: 'hsl(4,60%,44%)', color: '#FFF9F0',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
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
