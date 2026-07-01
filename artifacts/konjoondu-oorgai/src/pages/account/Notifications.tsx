import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, Truck, RefreshCw, Tag, Star, AlertCircle, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { useToast } from '@/hooks/use-toast';
import { usePolling } from '@/hooks/usePolling';

const PRIMARY = 'hsl(4,60%,44%)';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, string>;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; emoji: string }> = {
  order_update:     { icon: <Package size={16} />,    color: '#3b82f6', emoji: '📦' },
  shipping:         { icon: <Truck size={16} />,      color: '#06b6d4', emoji: '🚚' },
  refund:           { icon: <RefreshCw size={16} />,  color: '#10b981', emoji: '💚' },
  coupon:           { icon: <Tag size={16} />,        color: '#f59e0b', emoji: '🏷️' },
  review_submitted: { icon: <Star size={16} />,       color: '#8b5cf6', emoji: '⭐' },
  review_reply:     { icon: <Star size={16} />,       color: '#8b5cf6', emoji: '💬' },
  issue_update:     { icon: <AlertCircle size={16} />,color: '#ef4444', emoji: '⚠️' },
  default:          { icon: <Bell size={16} />,       color: '#8b6344', emoji: '🔔' },
};

export default function Notifications() {
  const { apiBase, token } = useCustomer();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const initialLoad = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/customer/notifications`, {
        headers: { 'x-customer-token': token },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const d = await res.json();
      if (!d.success) return;

      const incoming: Notification[] = [...d.notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (!initialLoad.current) {
        const newOnes = incoming.filter(n => !knownIds.current.has(n.id));
        for (const n of newOnes) {
          const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.default;
          toast({
            title: `${cfg.emoji} ${n.title}`,
            description: n.body,
            duration: 6000,
          });
        }
      } else {
        initialLoad.current = false;
      }

      setNotifications(incoming);
      knownIds.current = new Set(incoming.map(n => n.id));
      setLastUpdated(new Date());
      setLive(true);
    } catch {
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, [token, apiBase, toast]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  usePolling(fetchNotifications, 5000, !!token);

  async function markRead(id: string) {
    if (!token) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await fetch(`${apiBase}/customer/notifications/${id}/read`, {
      method: 'PATCH', headers: { 'x-customer-token': token },
    });
  }

  async function markAllRead() {
    if (!token) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await fetch(`${apiBase}/customer/notifications/read-all`, {
      method: 'PATCH', headers: { 'x-customer-token': token },
    });
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 13, color: '#8b6344' }}>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
          {unreadCount > 0 && (
            <motion.span key={unreadCount} initial={{ scale: 0.7 }} animate={{ scale: 1 }}
              style={{ padding: '2px 8px', borderRadius: 20, background: PRIMARY, color: '#fff', fontSize: 11, fontWeight: 700 }}>
              {unreadCount} new
            </motion.span>
          )}
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {live ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>LIVE</span>
              </>
            ) : (
              <>
                <WifiOff size={10} color="#ef4444" />
                <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>OFFLINE</span>
              </>
            )}
          </div>
          {lastUpdated && (
            <span style={{ fontSize: 10, color: '#c4a882' }}>
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700 }}>
              <CheckCircle2 size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 72, borderRadius: 14, background: 'rgba(139,94,60,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,94,60,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Bell size={36} color="rgba(139,94,60,0.25)" />
          </motion.div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>All caught up!</h3>
          <p style={{ fontSize: 13, color: '#8b6344' }}>You have no notifications right now. We'll alert you here when your order status changes.</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => !n.isRead && markRead(n.id)}
                  style={{
                    display: 'flex', gap: 14, padding: '14px 18px', borderRadius: 14,
                    background: n.isRead ? '#fff' : `${cfg.color}08`,
                    border: `1px solid ${n.isRead ? 'rgba(139,94,60,0.1)' : `${cfg.color}30`}`,
                    cursor: n.isRead ? 'default' : 'pointer', transition: 'all 0.2s',
                    boxShadow: n.isRead ? 'none' : `0 2px 12px ${cfg.color}15`,
                  }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontWeight: n.isRead ? 600 : 800, fontSize: 13, color: '#1a0f08', lineHeight: 1.3 }}>{n.title}</span>
                      {!n.isRead && (
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                          style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 3 }} />
                      )}
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

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.4)} }
      `}</style>
    </div>
  );
}
