import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Heart, Bell, Star, Gift, TrendingUp, Clock, CheckCircle2, Truck } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';

const PRIMARY = 'hsl(4,60%,44%)';

interface DashboardStats { orders: number; pending: number; delivered: number; wishlist: number; addresses: number; notifications: number; unread: number; }

function StatCard({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: number; color: string; onClick?: () => void }) {
  return (
    <motion.div whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(139,94,60,0.15)' }} transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{ padding: '20px 18px', borderRadius: 18, background: '#fff', border: '1px solid rgba(139,94,60,0.1)', cursor: onClick ? 'pointer' : 'default', boxShadow: '0 2px 12px rgba(139,94,60,0.08)' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#1a0f08', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#8b6344', marginTop: 4, fontWeight: 600 }}>{label}</div>
    </motion.div>
  );
}

interface OrderItem { name: string; size: string; price: number; quantity: number; }
interface Order { id: string; status: string; createdAt: string; totalAmount: number; items: OrderItem[]; }

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', packed: '#8b5cf6',
  shipped: '#06b6d4', out_for_delivery: '#f97316', delivered: '#22c55e',
  cancelled: '#ef4444', returned: '#6b7280', refunded: '#10b981',
};
const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={12} />, confirmed: <CheckCircle2 size={12} />,
  shipped: <Truck size={12} />, delivered: <CheckCircle2 size={12} />, out_for_delivery: <Truck size={12} />,
};

export default function CustomerDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { customer, apiBase, token } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ orders: 0, pending: 0, delivered: 0, wishlist: 0, addresses: 0, notifications: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      const headers = { 'x-customer-token': token };
      try {
        const [ordersRes, wishlistRes, addressRes, notifRes] = await Promise.all([
          fetch(`${apiBase}/customer/orders`, { headers }),
          fetch(`${apiBase}/customer/wishlist`, { headers }),
          fetch(`${apiBase}/customer/addresses`, { headers }),
          fetch(`${apiBase}/customer/notifications`, { headers }),
        ]);
        const [od, wd, ad, nd] = await Promise.all([ordersRes.json(), wishlistRes.json(), addressRes.json(), notifRes.json()]);
        const allOrders: Order[] = od.success ? od.orders : [];
        setOrders(allOrders.slice(0, 3));
        setStats({
          orders: allOrders.length,
          pending: allOrders.filter((o: Order) => !['delivered', 'cancelled', 'refunded', 'returned'].includes(o.status)).length,
          delivered: allOrders.filter((o: Order) => o.status === 'delivered').length,
          wishlist: wd.success ? wd.items.length : 0,
          addresses: ad.success ? ad.addresses.length : 0,
          notifications: nd.success ? nd.notifications.length : 0,
          unread: nd.success ? nd.notifications.filter((n: { isRead: boolean }) => !n.isRead).length : 0,
        });
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [token, apiBase]);

  const profileComplete = [customer?.name, customer?.email, customer?.phone, customer?.dob, customer?.gender].filter(Boolean).length;
  const profilePct = Math.round((profileComplete / 5) * 100);

  const quickActions = [
    { icon: <Package size={18} />, label: 'My Orders', color: '#3b82f6', page: 'orders' },
    { icon: <Heart size={18} />, label: 'Wishlist', color: '#ef4444', page: 'wishlist' },
    { icon: <MapPin size={18} />, label: 'Addresses', color: '#8b5cf6', page: 'addresses' },
    { icon: <Star size={18} />, label: 'Reviews', color: '#f59e0b', page: 'reviews' },
    { icon: <Bell size={18} />, label: 'Alerts', color: '#06b6d4', page: 'notifications', badge: stats.unread },
    { icon: <Gift size={18} />, label: 'Rewards', color: '#22c55e', page: 'rewards' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 4px' }}>
      {/* Welcome card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ borderRadius: 24, padding: '28px 28px', marginBottom: 24, background: `linear-gradient(135deg, ${PRIMARY} 0%, hsl(4,60%,30%) 100%)`, color: '#fff9f0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 4, fontWeight: 600 }}>Welcome back 👋</p>
              <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6 }}>
                {customer?.name || customer?.phone || 'Customer'}
              </h2>
              <p style={{ fontSize: 13, opacity: 0.8 }}>📞 {customer?.phone}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 900 }}>🏅 {customer?.rewardPoints || 0}</div>
              <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 600, marginTop: 2 }}>REWARD POINTS</div>
            </div>
          </div>
          {/* Profile completion bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>Profile Completion</span>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{profilePct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${profilePct}%` }} transition={{ duration: 0.8, delay: 0.3 }}
                style={{ height: '100%', background: '#fff', borderRadius: 4 }} />
            </div>
            {profilePct < 100 && (
              <button onClick={() => onNavigate('profile')} style={{ marginTop: 8, fontSize: 11, opacity: 0.85, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: '#fff9f0', textDecoration: 'underline', fontFamily: 'Poppins,sans-serif' }}>
                Complete your profile →
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: <Package size={20} />, label: 'Total Orders', value: stats.orders, color: '#3b82f6', page: 'orders' },
          { icon: <Clock size={20} />, label: 'Active Orders', value: stats.pending, color: '#f59e0b', page: 'orders' },
          { icon: <CheckCircle2 size={20} />, label: 'Delivered', value: stats.delivered, color: '#22c55e', page: 'orders' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} onClick={() => onNavigate(s.page)} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ marginBottom: 24, padding: '22px 20px', background: '#fff', borderRadius: 20, border: '1px solid rgba(139,94,60,0.1)', boxShadow: '0 2px 12px rgba(139,94,60,0.06)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a0f08', marginBottom: 16, letterSpacing: '-0.01em' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {quickActions.map((a, i) => (
            <motion.button key={a.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(a.page)}
              style={{ padding: '14px 10px', borderRadius: 14, border: '1px solid rgba(139,94,60,0.1)', background: '#faf8f5', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: a.color }}>{a.icon}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4a3728', fontFamily: 'Poppins,sans-serif' }}>{a.label}</span>
              {(a.badge ?? 0) > 0 && (
                <span style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: PRIMARY, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {a.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Orders */}
      {!loading && orders.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(139,94,60,0.1)', boxShadow: '0 2px 12px rgba(139,94,60,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(139,94,60,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a0f08' }}>Recent Orders</h3>
            <button onClick={() => onNavigate('orders')} style={{ fontSize: 12, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700 }}>View All →</button>
          </div>
          {orders.map((o, i) => {
            const color = STATUS_COLORS[o.status] || '#8b6344';
            return (
              <div key={o.id} style={{ padding: '14px 20px', borderBottom: i < orders.length - 1 ? '1px solid rgba(139,94,60,0.06)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={18} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1a0f08' }}>{o.id}</div>
                  <div style={{ fontSize: 12, color: '#8b6344' }}>{o.items.map((it: OrderItem) => it.name).join(', ')}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: PRIMARY }}>₹{o.totalAmount.toLocaleString('en-IN')}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: `${color}15`, marginTop: 3 }}>
                    <span style={{ color }}>{STATUS_ICONS[o.status]}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'capitalize' }}>{o.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {!loading && orders.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 20, border: '1px solid rgba(139,94,60,0.1)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🥒</div>
          <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>No orders yet</h3>
          <p style={{ fontSize: 13, color: '#8b6344' }}>Your first order is one click away!</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/products'}
            style={{ marginTop: 16, padding: '10px 24px', borderRadius: 12, border: 'none', background: PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins,sans-serif' }}>
            Shop Now
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
