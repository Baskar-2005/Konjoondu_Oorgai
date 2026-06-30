import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, Truck, RefreshCw, Tag, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';

const PRIMARY = 'hsl(4,60%,44%)';

interface Notification { id: number; type: string; title: string; body: string; isRead: boolean; metadata: Record<string, string>; createdAt: string; }

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  order_update: { icon: <Package size={16} />, color: '#3b82f6' },
  shipping: { icon: <Truck size={16} />, color: '#06b6d4' },
  refund: { icon: <RefreshCw size={16} />, color: '#10b981' },
  coupon: { icon: <Tag size={16} />, color: '#f59e0b' },
  review_submitted: { icon: <Star size={16} />, color: '#8b5cf6' },
  review_reply: { icon: <Star size={16} />, color: '#8b5cf6' },
  issue_update: { icon: <AlertCircle size={16} />, color: '#ef4444' },
  default: { icon: <Bell size={16} />, color: '#8b6344' },
};

export default function Notifications() {
  const { apiBase, token } = useCustomer();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${apiBase}/customer/notifications`, { headers: { 'x-customer-token': token } })
      .then(r => r.json())
      .then(d => { if (d.success) setNotifications(d.notifications); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, apiBase]);

  async function markRead(id: number) {
    if (!token) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await fetch(`${apiBase}/customer/notifications/${id}/read`, { method: 'PATCH', headers: { 'x-customer-token': token } });
  }

  async function markAllRead() {
    if (!token) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await fetch(`${apiBase}/customer/notifications/read-all`, { method: 'PATCH', headers: { 'x-customer-token': token } });
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 13, color: '#8b6344' }}>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
          {unreadCount > 0 && (
            <span style={{ padding: '2px 8px', borderRadius: 20, background: PRIMARY, color: '#fff', fontSize: 11, fontWeight: 700 }}>{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700 }}>
            <CheckCircle2 size={13} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 72, borderRadius: 14, background: 'rgba(139,94,60,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Bell size={48} color="rgba(139,94,60,0.2)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>All caught up!</h3>
          <p style={{ fontSize: 13, color: '#8b6344' }}>You have no notifications right now.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
              return (
                <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => !n.isRead && markRead(n.id)}
                  style={{ display: 'flex', gap: 14, padding: '14px 18px', borderRadius: 14, background: n.isRead ? '#fff' : `${cfg.color}08`, border: `1px solid ${n.isRead ? 'rgba(139,94,60,0.1)' : `${cfg.color}30`}`, cursor: n.isRead ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontWeight: n.isRead ? 600 : 800, fontSize: 13, color: '#1a0f08', lineHeight: 1.3 }}>{n.title}</span>
                      {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 3 }} />}
                    </div>
                    <p style={{ fontSize: 12, color: '#8b6344', marginTop: 3, lineHeight: 1.5 }}>{n.body}</p>
                    <p style={{ fontSize: 11, color: '#c4a882', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
