import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Package, Truck, CheckCircle2, XCircle, Clock,
  RefreshCw, LogOut, ChevronDown, Search, User, Phone, Mail,
  MapPin, CreditCard, Calendar, AlertCircle, FlaskConical,
} from 'lucide-react';

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, '');

interface OrderItem {
  productId: number;
  productName: string;
  size: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer: { name: string; phone: string; email: string; address: string };
  items: OrderItem[];
  totalAmount: number;
  paymentId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#d97706', bg: 'rgba(217,119,6,0.1)',   icon: Clock },
  confirmed: { label: 'Confirmed', color: '#2563eb', bg: 'rgba(37,99,235,0.1)',   icon: CheckCircle2 },
  shipped:   { label: 'Shipped',   color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  icon: Truck },
  delivered: { label: 'Delivered', color: '#16a34a', bg: 'rgba(22,163,74,0.1)',   icon: Package },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   icon: XCircle },
} as const;

const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('ko_admin_token') || '');
  const [input, setInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchOrders = useCallback(async (tok: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: { 'x-admin-token': tok },
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to load orders.');
        if (res.status === 403) { setLoggedIn(false); sessionStorage.removeItem('ko_admin_token'); }
      } else {
        setOrders(data.orders);
        setLastFetched(new Date());
      }
    } catch {
      setError('Network error — make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    // Quick check: try fetching
    const res = await fetch(`${API_BASE}/api/orders`, {
      headers: { 'x-admin-token': input },
    });
    if (res.status === 403) {
      setLoginError('Incorrect admin token.');
      return;
    }
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('ko_admin_token', input);
      setToken(input);
      setOrders(data.orders);
      setLastFetched(new Date());
      setLoggedIn(true);
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders(token).then(() => setLoggedIn(true));
    }
  }, []);

  async function updateStatus(orderId: string, status: Order['status']) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const [seeding, setSeeding] = useState(false);

  async function seedDemoOrders() {
    setSeeding(true);
    const demos = [
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

    const statuses: Order['status'][] = ['delivered', 'shipped', 'confirmed', 'pending', 'delivered'];

    for (let i = 0; i < demos.length; i++) {
      const d = demos[i];
      try {
        const res = await fetch(`${API_BASE}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d),
        });
        const data = await res.json();
        if (data.success && statuses[i] !== 'pending') {
          await fetch(`${API_BASE}/api/orders/${data.orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
            body: JSON.stringify({ status: statuses[i] }),
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
  }

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0),
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      (o.paymentId || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ─── Login screen ───────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, hsl(4,60%,10%) 0%, hsl(18,45%,12%) 100%)',
        fontFamily: 'Poppins, sans-serif', padding: 24,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%', maxWidth: 380, borderRadius: 24,
            background: 'hsl(30,100%,98%)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            padding: '36px 32px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'rgba(181,58,46,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={26} color="hsl(4,60%,44%)" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'hsl(18,18%,14%)' }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 13, color: 'hsl(25,38%,45%)' }}>Konjoondu Oorgai · Orders</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(25,38%,45%)', display: 'block', marginBottom: 6 }}>
                Admin Token
              </label>
              <input
                type="password" placeholder="Enter admin token"
                value={input} onChange={e => setInput(e.target.value)} required
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14,
                  border: `1.5px solid ${loginError ? 'hsl(0,84%,60%)' : 'rgba(139,94,60,0.2)'}`,
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  color: 'hsl(18,18%,14%)', background: 'white',
                }}
              />
              {loginError && (
                <p style={{ fontSize: 12, color: 'hsl(0,84%,50%)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> {loginError}
                </p>
              )}
            </div>
            <button type="submit"
              style={{
                padding: '13px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, hsl(4,65%,48%), hsl(4,60%,38%))',
                color: '#FFF9F0', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(181,58,46,0.3)',
              }}>
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ─── Dashboard ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'hsl(30,60%,96%)', fontFamily: 'Poppins, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        background: 'hsl(4,60%,12%)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(255,249,240,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingBag size={18} color="#FFF9F0" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#FFF9F0', lineHeight: 1 }}>Konjoondu Oorgai</p>
            <p style={{ fontSize: 11, color: 'rgba(255,249,240,0.5)', marginTop: 1 }}>Admin Dashboard</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastFetched && (
            <p style={{ fontSize: 11, color: 'rgba(255,249,240,0.4)' }}>
              Last updated {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <button onClick={seedDemoOrders} disabled={seeding}
            style={{
              padding: '7px 14px', borderRadius: 10, border: 'none', cursor: seeding ? 'not-allowed' : 'pointer',
              background: 'rgba(124,58,237,0.25)', color: '#c4b5fd',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              opacity: seeding ? 0.7 : 1,
            }}>
            <FlaskConical size={13} />
            {seeding ? 'Seeding…' : 'Load Demo Orders'}
          </button>
          <button onClick={() => fetchOrders(token)}
            style={{
              padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(255,249,240,0.1)', color: '#FFF9F0',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={logout}
            style={{
              padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'rgba(220,38,38,0.15)', color: '#fca5a5',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Orders', value: stats.total, color: '#1e40af', bg: 'rgba(30,64,175,0.08)', icon: ShoppingBag },
            { label: 'Pending', value: stats.pending, color: '#d97706', bg: 'rgba(217,119,6,0.08)', icon: Clock },
            { label: 'Confirmed', value: stats.confirmed, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', icon: CheckCircle2 },
            { label: 'Shipped', value: stats.shipped, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', icon: Truck },
            { label: 'Delivered', value: stats.delivered, color: '#16a34a', bg: 'rgba(22,163,74,0.08)', icon: Package },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'hsl(4,60%,44%)', bg: 'rgba(181,58,46,0.08)', icon: CreditCard },
          ].map(s => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{
                borderRadius: 16, padding: '16px 18px',
                background: 'hsl(30,100%,98%)',
                border: '1px solid rgba(139,94,60,0.1)',
                boxShadow: '0 2px 8px rgba(139,94,60,0.06)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(25,38%,50%)' }}>
                  {s.label}
                </p>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={15} color={s.color} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
          marginBottom: 20,
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(25,38%,50%)' }} />
            <input
              placeholder="Search orders, customers, payment IDs…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                borderRadius: 12, border: '1.5px solid rgba(139,94,60,0.15)',
                fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                background: 'hsl(30,100%,98%)', color: 'hsl(18,18%,14%)',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', ...ALL_STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{
                  padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                  background: filterStatus === s ? 'hsl(4,60%,44%)' : 'hsl(30,100%,98%)',
                  color: filterStatus === s ? '#FFF9F0' : 'hsl(25,38%,45%)',
                  border: filterStatus === s ? 'none' : '1px solid rgba(139,94,60,0.15)',
                }}>
                {s === 'all' ? 'All' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
                {s !== 'all' && ` (${orders.filter(o => o.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {error && (
          <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />{error}
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'hsl(25,38%,50%)' }}>
            <RefreshCw size={32} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
            <p>Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            background: 'hsl(30,100%,98%)', borderRadius: 20,
            border: '1px solid rgba(139,94,60,0.1)',
          }}>
            <ShoppingBag size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p style={{ fontWeight: 700, fontSize: 16, color: 'hsl(18,18%,20%)', marginBottom: 6 }}>
              {orders.length === 0 ? 'No orders yet' : 'No orders match your filter'}
            </p>
            <p style={{ fontSize: 13, color: 'hsl(25,38%,50%)', marginBottom: orders.length === 0 ? 20 : 0 }}>
              {orders.length === 0 ? 'Orders will appear here once customers check out.' : 'Try adjusting your search or filter.'}
            </p>
            {orders.length === 0 && (
              <button onClick={seedDemoOrders} disabled={seeding}
                style={{
                  margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 22px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, hsl(258,60%,54%), hsl(258,60%,44%))',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: seeding ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(124,58,237,0.3)',
                  opacity: seeding ? 0.7 : 1,
                }}>
                <FlaskConical size={16} />
                {seeding ? 'Loading demo orders…' : 'Load Demo Orders'}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'hsl(25,38%,50%)', marginBottom: 4 }}>
              Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
            </p>
            {filtered.map((order, i) => {
              const sc = STATUS_CONFIG[order.status];
              const StatusIcon = sc.icon;
              const isExpanded = expandedId === order.id;
              return (
                <motion.div key={order.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    borderRadius: 18, overflow: 'hidden',
                    background: 'hsl(30,100%,98%)',
                    border: `1px solid ${isExpanded ? 'rgba(181,58,46,0.25)' : 'rgba(139,94,60,0.1)'}`,
                    boxShadow: isExpanded ? '0 4px 20px rgba(181,58,46,0.1)' : '0 2px 8px rgba(139,94,60,0.05)',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                  }}>
                  {/* Row header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                      cursor: 'pointer', flexWrap: 'wrap',
                    }}>
                    {/* Order ID */}
                    <div style={{ minWidth: 120 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'hsl(4,60%,44%)', marginBottom: 2 }}>{order.id}</p>
                      <p style={{ fontSize: 11, color: 'hsl(25,38%,50%)' }}>
                        <Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />
                        {fmt(order.createdAt)}
                      </p>
                    </div>

                    {/* Customer */}
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'hsl(18,18%,14%)', marginBottom: 2 }}>
                        {order.customer.name}
                      </p>
                      <p style={{ fontSize: 11, color: 'hsl(25,38%,50%)' }}>
                        {order.customer.phone}
                        {order.customer.email && ` · ${order.customer.email}`}
                      </p>
                    </div>

                    {/* Items summary */}
                    <div style={{ minWidth: 100 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(18,18%,20%)', marginBottom: 2 }}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p style={{ fontSize: 11, color: 'hsl(25,38%,50%)', whiteSpace: 'nowrap' }}>
                        {order.items.map(i => i.productName.split(' ')[0]).slice(0, 2).join(', ')}
                        {order.items.length > 2 && '…'}
                      </p>
                    </div>

                    {/* Total */}
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'hsl(4,60%,44%)', minWidth: 80, textAlign: 'right' }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </p>

                    {/* Status badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                      borderRadius: 999, background: sc.bg,
                    }}>
                      <StatusIcon size={12} color={sc.color} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: sc.color }}>{sc.label}</span>
                    </div>

                    {/* Chevron */}
                    <ChevronDown size={16} color="hsl(25,38%,55%)"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ borderTop: '1px solid rgba(139,94,60,0.1)', padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                          {/* Customer info */}
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(25,38%,50%)', marginBottom: 12 }}>
                              Customer Details
                            </p>
                            {[
                              { icon: User, text: order.customer.name },
                              { icon: Phone, text: order.customer.phone },
                              ...(order.customer.email ? [{ icon: Mail, text: order.customer.email }] : []),
                              { icon: MapPin, text: order.customer.address },
                              ...(order.paymentId ? [{ icon: CreditCard, text: order.paymentId, mono: true }] : []),
                            ].map((row, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                                <row.icon size={13} color="hsl(25,38%,55%)" style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: 13, color: 'hsl(18,18%,20%)', fontFamily: row.mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>
                                  {row.text}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Items */}
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(25,38%,50%)', marginBottom: 12 }}>
                              Order Items
                            </p>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(18,18%,14%)' }}>{item.productName}</p>
                                  <p style={{ fontSize: 11, color: 'hsl(25,38%,55%)' }}>{item.size} × {item.quantity}</p>
                                </div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'hsl(4,60%,44%)', whiteSpace: 'nowrap' }}>
                                  ₹{item.price * item.quantity}
                                </p>
                              </div>
                            ))}
                            <div style={{ borderTop: '1px solid rgba(139,94,60,0.12)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>Total</span>
                              <span style={{ fontSize: 15, fontWeight: 800, color: 'hsl(4,60%,44%)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Update status */}
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(25,38%,50%)', marginBottom: 12 }}>
                              Update Status
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {ALL_STATUSES.map(s => {
                                const cfg = STATUS_CONFIG[s];
                                const Icon = cfg.icon;
                                const isCurrent = order.status === s;
                                return (
                                  <button key={s}
                                    disabled={isCurrent || updatingId === order.id}
                                    onClick={() => updateStatus(order.id, s)}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 8,
                                      padding: '9px 14px', borderRadius: 12, border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                                      background: isCurrent ? cfg.bg : 'rgba(139,94,60,0.04)',
                                      fontFamily: 'inherit', transition: 'background 0.15s',
                                      opacity: updatingId === order.id && !isCurrent ? 0.5 : 1,
                                    }}>
                                    <Icon size={13} color={isCurrent ? cfg.color : 'hsl(25,38%,55%)'} />
                                    <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? cfg.color : 'hsl(25,38%,45%)' }}>
                                      {cfg.label}
                                    </span>
                                    {isCurrent && (
                                      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: cfg.color }}>CURRENT</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
