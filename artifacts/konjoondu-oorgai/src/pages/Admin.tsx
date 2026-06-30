import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, AlertCircle, Leaf } from 'lucide-react';

import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Orders from './admin/Orders';
import Products from './admin/Products';
import Inventory from './admin/Inventory';
import Customers from './admin/Customers';
import Analytics from './admin/Analytics';
import Reviews from './admin/Reviews';
import Delivery from './admin/Delivery';
import Notifications from './admin/Notifications';
import Settings from './admin/Settings';
import Coupons from './admin/Coupons';
import CreateOrder from './admin/CreateOrder';
import type { Order, OrderStatus, AdminPage } from './admin/types';

const API_BASE = '/ko-api';

const DEMO_ORDERS = [
  {
    customer: { name: 'Karthik Rajan', phone: '9876543210', email: 'karthik@example.com', address: '14, Nehru Street, Cuddalore - 607001' },
    items: [{ productId: 1, productName: 'Prawn Pickle', size: '250g', price: 220, quantity: 2 }, { productId: 2, productName: 'Chicken Pickle', size: '500g', price: 380, quantity: 1 }],
    totalAmount: 820, paymentId: 'pay_demo_QkR9xZ3mVc',
  },
  {
    customer: { name: 'Meena Sundaram', phone: '9444112233', email: 'meena.s@gmail.com', address: '7/3, Raja Nagar, Chidambaram - 608001' },
    items: [{ productId: 3, productName: 'Squid Pickle', size: '250g', price: 260, quantity: 1 }],
    totalAmount: 260, paymentId: 'pay_demo_Lp7wYn2bAj',
  },
  {
    customer: { name: 'Selvam Murugan', phone: '8012345678', email: '', address: '22, Fishermen Colony, Cuddalore Port - 607003' },
    items: [{ productId: 4, productName: 'Mutton Pickle', size: '500g', price: 450, quantity: 1 }, { productId: 1, productName: 'Prawn Pickle', size: '100g', price: 120, quantity: 3 }],
    totalAmount: 810, paymentId: 'pay_demo_Ht4sKm8vWe',
  },
  {
    customer: { name: 'Priya Anand', phone: '9500667788', email: 'priya.a@outlook.com', address: '5, Gandhi Road, Villupuram - 605602' },
    items: [{ productId: 2, productName: 'Chicken Pickle', size: '250g', price: 210, quantity: 2 }],
    totalAmount: 420, paymentId: undefined,
  },
  {
    customer: { name: 'Ravi Kumar', phone: '7299001122', email: 'ravi.k@yahoo.com', address: '88, Anna Salai, Chennai - 600002' },
    items: [{ productId: 3, productName: 'Squid Pickle', size: '500g', price: 490, quantity: 1 }, { productId: 4, productName: 'Mutton Pickle', size: '250g', price: 270, quantity: 2 }],
    totalAmount: 1030, paymentId: 'pay_demo_Cq2xJn9pFr',
  },
];

const DEMO_STATUSES: OrderStatus[] = ['delivered', 'shipped', 'confirmed', 'pending', 'delivered'];

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string, orders: Order[]) => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'x-admin-token': input },
      });
      if (res.status === 403) { setError('Incorrect admin token.'); setLoading(false); return; }
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('ko_admin_token', input);
        onLogin(input, data.orders);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch {
      setError('Network error — make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2318 0%, #1a3a2a 50%, #2d4a1e 100%)',
      fontFamily: 'Poppins, sans-serif', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(82,183,136,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(107,124,58,0.05)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 400, borderRadius: 28,
          background: 'rgba(255,253,250,0.97)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          padding: '40px 36px',
        }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 18px',
              background: 'linear-gradient(135deg, #52b788, #2d6a4f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(82,183,136,0.4)',
              fontSize: 30,
            }}>
            🥒
          </motion.div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f2318', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Konjoondu Oorgai
          </h1>
          <p style={{ fontSize: 13, color: '#6b7c5a', fontWeight: 500 }}>Premium Admin Dashboard · Sign In</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7c5a', display: 'block', marginBottom: 8 }}>
              Admin Token
            </label>
            <input
              type="password"
              placeholder="Enter your admin token"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 14, fontSize: 14,
                border: `2px solid ${error ? '#fca5a5' : 'rgba(139,94,60,0.15)'}`,
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                color: '#0f2318', background: '#fafaf8',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = '#2d6a4f'; }}
              onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(139,94,60,0.15)'; }}
            />
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 12, color: '#dc2626', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertCircle size={12} /> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            style={{
              padding: '14px', borderRadius: 14, border: 'none',
              background: loading ? 'rgba(45,106,79,0.6)' : 'linear-gradient(135deg, #2d6a4f, #1a3a2a)',
              color: '#f0faf5', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(45,106,79,0.35)',
              transition: 'all 0.2s', opacity: !input.trim() ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {loading ? (
              <><span style={{ width: 16, height: 16, border: '2px solid rgba(240,250,245,0.4)', borderTopColor: '#f0faf5', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Signing in…</>
            ) : (
              <>Sign In to Dashboard</>
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(45,106,79,0.05)', borderRadius: 12, border: '1px solid rgba(45,106,79,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Leaf size={12} color="#2d6a4f" />
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>API Connection</p>
          </div>
          <p style={{ fontSize: 11, color: '#6b7c5a' }}>API: <strong>{API_BASE}</strong></p>
          <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Proxied to backend server automatically</p>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main Admin App ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('ko_admin_token') || '');
  const [loggedIn, setLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<AdminPage>('dashboard');
  const [search, setSearch] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchOrders = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'x-admin-token': tok },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
      else if (res.status === 403) { setLoggedIn(false); sessionStorage.removeItem('ko_admin_token'); }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchOrders(token).then(() => setLoggedIn(true));
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
    } catch { /* silent */ }
  }

  async function seedDemo() {
    setSeeding(true);
    for (let i = 0; i < DEMO_ORDERS.length; i++) {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DEMO_ORDERS[i]),
        });
        const data = await res.json();
        if (data.success && DEMO_STATUSES[i] !== 'pending') {
          await fetch(`${API_BASE}/orders/${data.orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
            body: JSON.stringify({ status: DEMO_STATUSES[i] }),
          });
        }
      } catch { /* skip */ }
    }
    await fetchOrders(token);
    setSeeding(false);
  }

  function logout() {
    sessionStorage.removeItem('ko_admin_token');
    setToken('');
    setLoggedIn(false);
    setOrders([]);
    setPage('dashboard');
  }

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={(tok, fetchedOrders) => {
          setToken(tok);
          setOrders(fetchedOrders);
          setLoggedIn(true);
        }}
      />
    );
  }

  function renderPage() {
    switch (page) {
      case 'dashboard':    return <Dashboard orders={orders} />;
      case 'orders':       return <Orders orders={orders} token={token} loading={loading} onRefresh={() => fetchOrders(token)} onUpdateStatus={updateStatus} onSeedDemo={seedDemo} seeding={seeding} />;
      case 'create-order': return <CreateOrder token={token} onSuccess={() => { fetchOrders(token); setPage('orders'); }} />;
      case 'products':     return <Products />;
      case 'inventory':    return <Inventory />;
      case 'customers':    return <Customers />;
      case 'coupons':      return <Coupons />;
      case 'analytics':    return <Analytics />;
      case 'reviews':      return <Reviews />;
      case 'delivery':     return <Delivery />;
      case 'notifications': return <Notifications />;
      case 'settings':     return <Settings />;
      default:             return <Dashboard orders={orders} />;
    }
  }

  return (
    <AdminLayout
      page={page}
      onNavigate={setPage}
      onLogout={logout}
      search={search}
      onSearch={setSearch}
    >
      {renderPage()}
    </AdminLayout>
  );
}
