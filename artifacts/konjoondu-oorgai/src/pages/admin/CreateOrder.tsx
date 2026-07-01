import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ShoppingBag, User, Phone, Mail, MapPin, CreditCard, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

const PRODUCTS = [
  { id: 1, name: 'Prawn Pickle',   sizes: [{ label: '100g', price: 120 }, { label: '250g', price: 220 }, { label: '500g', price: 390 }] },
  { id: 2, name: 'Chicken Pickle', sizes: [{ label: '250g', price: 210 }, { label: '500g', price: 380 }] },
  { id: 3, name: 'Squid Pickle',   sizes: [{ label: '250g', price: 260 }, { label: '500g', price: 490 }] },
  { id: 4, name: 'Mutton Pickle',  sizes: [{ label: '250g', price: 270 }, { label: '500g', price: 450 }] },
  { id: 5, name: 'Fish Pickle',    sizes: [{ label: '250g', price: 230 }, { label: '500g', price: 420 }] },
  { id: 6, name: 'Crab Pickle',    sizes: [{ label: '250g', price: 300 }, { label: '500g', price: 560 }] },
];

interface OrderItem { productId: number; productName: string; size: string; price: number; quantity: number; }
interface Customer { name: string; phone: string; email: string; address: string; }

const G = { green: '#1b4332', mid: '#2d6a4f', accent: '#52b788', cream: '#fffdf7', border: '#d8e8d4' };

function Field({ label, required, icon: Icon, children }: { label: string; required?: boolean; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: G.mid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {Icon && <Icon size={13} />}
        {label}{required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: `1.5px solid ${G.border}`, borderRadius: 10,
  fontSize: 14, fontFamily: 'Poppins, sans-serif', color: '#1a2e1a',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default function CreateOrder({ token, onSuccess }: { token: string; onSuccess: () => void }) {
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', email: '', address: '' });
  const [items, setItems] = useState<OrderItem[]>([{ productId: 1, productName: 'Prawn Pickle', size: '250g', price: 220, quantity: 1 }]);
  const [paymentId, setPaymentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; orderId?: string } | null>(null);
  const [focusField, setFocusField] = useState('');

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function addItem() {
    setItems(prev => [...prev, { productId: 1, productName: 'Prawn Pickle', size: '250g', price: 220, quantity: 1 }]);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, productId: number, size: string) {
    const product = PRODUCTS.find(p => p.id === productId)!;
    const sizeObj = product.sizes.find(s => s.label === size) || product.sizes[0];
    setItems(prev => prev.map((item, i) => i === idx
      ? { ...item, productId: product.id, productName: product.name, size: sizeObj.label, price: sizeObj.price }
      : item
    ));
  }

  function updateQty(idx: number, qty: number) {
    if (qty < 1 || qty > 99) return;
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address || items.length === 0) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ customer, items, totalAmount, paymentId: paymentId.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ ok: true, message: `Order ${data.orderId} created successfully!`, orderId: data.orderId });
        setCustomer({ name: '', phone: '', email: '', address: '' });
        setItems([{ productId: 1, productName: 'Prawn Pickle', size: '250g', price: 220, quantity: 1 }]);
        setPaymentId('');
      } else {
        setResult({ ok: false, message: data.message || 'Failed to create order.' });
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: G.green, fontFamily: 'Poppins, sans-serif', marginBottom: 4 }}>
          Create Manual Order
        </h2>
        <p style={{ fontSize: 13, color: '#6b7c5a' }}>Record cash, phone, or walk-in orders directly in the system.</p>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px',
              borderRadius: 12, marginBottom: 24,
              background: result.ok ? '#f0fdf4' : '#fef2f2',
              border: `1.5px solid ${result.ok ? '#86efac' : '#fca5a5'}`,
            }}>
            {result.ok
              ? <CheckCircle size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
              : <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />}
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: result.ok ? '#15803d' : '#dc2626', marginBottom: 2 }}>{result.message}</p>
              {result.ok && (
                <button onClick={onSuccess} style={{ fontSize: 12, color: G.mid, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  View in Orders →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Customer Details */}
          <div style={{ background: '#fff', borderRadius: 16, border: `1.5px solid ${G.border}`, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${G.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={15} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: G.green }}>Customer Details</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>Who is placing the order?</p>
              </div>
            </div>

            <Field label="Full Name" required icon={User}>
              <input
                style={{ ...inputStyle, borderColor: focusField === 'name' ? G.accent : G.border }}
                value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                onFocus={() => setFocusField('name')} onBlur={() => setFocusField('')}
                placeholder="Karthik Rajan" required
              />
            </Field>

            <Field label="Phone" required icon={Phone}>
              <input
                style={{ ...inputStyle, borderColor: focusField === 'phone' ? G.accent : G.border }}
                value={customer.phone} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                onFocus={() => setFocusField('phone')} onBlur={() => setFocusField('')}
                placeholder="9876543210" required type="tel"
              />
            </Field>

            <Field label="Email" icon={Mail}>
              <input
                style={{ ...inputStyle, borderColor: focusField === 'email' ? G.accent : G.border }}
                value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                onFocus={() => setFocusField('email')} onBlur={() => setFocusField('')}
                placeholder="optional@email.com" type="email"
              />
            </Field>

            <Field label="Shipping Address" required icon={MapPin}>
              <textarea
                style={{ ...inputStyle, borderColor: focusField === 'addr' ? G.accent : G.border, minHeight: 80, resize: 'vertical' }}
                value={customer.address} onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))}
                onFocus={() => setFocusField('addr')} onBlur={() => setFocusField('')}
                placeholder="14, Nehru Street, Cuddalore – 607001" required
              />
            </Field>

            <Field label="Payment ID" icon={CreditCard}>
              <input
                style={{ ...inputStyle, borderColor: focusField === 'pay' ? G.accent : G.border }}
                value={paymentId} onChange={e => setPaymentId(e.target.value)}
                onFocus={() => setFocusField('pay')} onBlur={() => setFocusField('')}
                placeholder="pay_XXXX (leave blank for cash/pending)"
              />
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>
                Leave blank → status set to <strong>Pending</strong>. Add payment ID → status set to <strong>Confirmed</strong>.
              </p>
            </Field>
          </div>

          {/* Order Items */}
          <div style={{ background: '#fff', borderRadius: 16, border: `1.5px solid ${G.border}`, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${G.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={15} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: G.green }}>Order Items</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>What products are ordered?</p>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {items.map((item, idx) => {
                const product = PRODUCTS.find(p => p.id === item.productId)!;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: G.cream, borderRadius: 12, padding: '14px', marginBottom: 10, border: `1px solid ${G.border}`, position: 'relative' }}>

                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)}
                        style={{ position: 'absolute', top: 10, right: 10, background: '#fee2e2', border: 'none', borderRadius: 7, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={12} color="#dc2626" />
                      </button>
                    )}

                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: G.mid, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Product</p>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={item.productId}
                          onChange={e => updateItem(idx, Number(e.target.value), item.size)}
                          style={{ ...inputStyle, appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7c5a' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: G.mid, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Size</p>
                        <div style={{ position: 'relative' }}>
                          <select value={item.size} onChange={e => updateItem(idx, item.productId, e.target.value)}
                            style={{ ...inputStyle, appearance: 'none', paddingRight: 28, cursor: 'pointer', fontSize: 13 }}>
                            {product.sizes.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                          </select>
                          <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7c5a' }} />
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: G.mid, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Qty</p>
                        <input type="number" min="1" max="99" value={item.quantity} onChange={e => updateQty(idx, Number(e.target.value))}
                          style={{ ...inputStyle, fontSize: 13, textAlign: 'center' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: G.mid, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Price</p>
                        <div style={{ padding: '10px 14px', border: `1.5px solid ${G.border}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: G.green, background: '#f0fdf4' }}>
                          ₹{item.price}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 8, textAlign: 'right', fontSize: 12, color: G.mid, fontWeight: 600 }}>
                      Subtotal: ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button type="button" onClick={addItem}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: `1.5px dashed ${G.accent}`, background: 'rgba(82,183,136,0.05)', color: G.mid, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
              <Plus size={15} /> Add Another Item
            </button>

            {/* Total */}
            <div style={{ marginTop: 16, padding: '14px 18px', background: G.green, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Total</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{items.reduce((s, i) => s + i.quantity, 0)} item(s)</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  Status: <strong style={{ color: paymentId ? '#86efac' : '#fcd34d' }}>{paymentId ? 'Confirmed' : 'Pending'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={() => { setCustomer({ name: '', phone: '', email: '', address: '' }); setItems([{ productId: 1, productName: 'Prawn Pickle', size: '250g', price: 220, quantity: 1 }]); setPaymentId(''); setResult(null); }}
            style={{ padding: '12px 24px', borderRadius: 10, border: `1.5px solid ${G.border}`, background: '#fff', color: G.mid, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Clear Form
          </button>
          <motion.button
            type="submit"
            disabled={submitting || !customer.name || !customer.phone || !customer.address}
            whileHover={{ scale: submitting ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 32px', borderRadius: 10, border: 'none',
              background: submitting || !customer.name || !customer.phone || !customer.address
                ? '#9ca3af' : `linear-gradient(135deg, ${G.mid}, ${G.green})`,
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting || !customer.name || !customer.phone || !customer.address ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: submitting ? 'none' : '0 4px 12px rgba(45,106,79,0.4)',
            }}>
            {submitting ? '⏳ Creating Order…' : '✓ Create Order'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
