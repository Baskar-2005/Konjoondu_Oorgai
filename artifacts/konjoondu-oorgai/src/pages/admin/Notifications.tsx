import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, AlertTriangle, CheckCircle, Bell, Check, Trash2, RefreshCw, Package } from 'lucide-react';
import type { Order } from './types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

interface NotifItem {
  id: string;
  type: 'order' | 'stock' | 'delivered';
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

interface Props { orders: Order[]; token: string; }

const TYPE_FILTERS = ['all', 'order', 'stock', 'delivered'] as const;

export default function Notifications({ orders, token }: Props) {
  const [lowStock, setLowStock] = useState<{ productName: string; size: string; stock: number; threshold: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const fetchInventory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/inventory`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (data.success) {
        setLowStock(
          (data.inventory as { productName: string; size: string; stock: number; threshold: number }[])
            .filter(i => i.stock <= i.threshold)
        );
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // Build real notification list
  const notifs: NotifItem[] = [];

  // New orders (pending)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  for (const order of sortedOrders.slice(0, 20)) {
    if (order.status === 'pending') {
      notifs.push({
        id: `order-${order.id}`,
        type: 'order',
        icon: ShoppingBag,
        color: '#2d6a4f',
        bg: '#d1fae5',
        title: 'New Order Received',
        desc: `${order.customer.name} placed an order for ₹${order.totalAmount.toLocaleString('en-IN')} — ${order.items.map(i => i.productName).slice(0, 2).join(', ')}${order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}`,
        time: timeAgo(order.createdAt),
        isRead: false,
      });
    } else if (order.status === 'confirmed') {
      notifs.push({
        id: `confirmed-${order.id}`,
        type: 'order',
        icon: CheckCircle,
        color: '#2563eb',
        bg: '#dbeafe',
        title: 'Order Confirmed',
        desc: `Order ${order.id} confirmed — ${order.customer.name} · ₹${order.totalAmount.toLocaleString('en-IN')}`,
        time: timeAgo(order.createdAt),
        isRead: true,
      });
    } else if (order.status === 'delivered') {
      notifs.push({
        id: `delivered-${order.id}`,
        type: 'delivered',
        icon: Package,
        color: '#16a34a',
        bg: '#dcfce7',
        title: 'Order Delivered',
        desc: `Order ${order.id} delivered to ${order.customer.name} · ₹${order.totalAmount.toLocaleString('en-IN')}`,
        time: timeAgo(order.createdAt),
        isRead: true,
      });
    }
  }

  // Low stock / out of stock alerts
  for (const item of lowStock) {
    const isOut = item.stock === 0;
    notifs.push({
      id: `stock-${item.productName}-${item.size}`,
      type: 'stock',
      icon: AlertTriangle,
      color: isOut ? '#dc2626' : '#d97706',
      bg: isOut ? '#fee2e2' : '#fef3c7',
      title: isOut ? 'Out of Stock' : 'Low Stock Alert',
      desc: `${item.productName} ${item.size} — ${isOut ? 'completely out of stock' : `only ${item.stock} units left (alert at: ${item.threshold})`}`,
      time: 'Now',
      isRead: false,
    });
  }

  const visible = notifs.filter(n => !deletedIds.has(n.id) && (filter === 'all' || n.type === filter));
  const unreadCount = visible.filter(n => !readIds.has(n.id) && !n.isRead).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Notifications</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>{unreadCount} unread · {visible.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={fetchInventory} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1.5px solid var(--adm-border)', cursor: 'pointer', background: 'var(--adm-card)', color: 'var(--adm-text2)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <RefreshCw size={13} style={loading ? { animation: 'spin 0.7s linear infinite' } : {}} /> Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setReadIds(new Set(notifs.map(n => n.id)))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1.5px solid var(--adm-border)', cursor: 'pointer', background: 'var(--adm-card)', color: 'var(--adm-text2)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <Check size={13} /> Mark All Read
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setDeletedIds(new Set(notifs.filter(n => readIds.has(n.id) || n.isRead).map(n => n.id)))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <Trash2 size={13} /> Clear Read
          </motion.button>
        </div>
      </div>

      {/* Type filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TYPE_FILTERS.map(f => {
          const count = f === 'all'
            ? notifs.filter(n => !deletedIds.has(n.id)).length
            : notifs.filter(n => !deletedIds.has(n.id) && n.type === f).length;
          const label = f === 'all' ? 'All' : f === 'order' ? 'Orders' : f === 'stock' ? 'Stock Alerts' : 'Delivered';
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? '#2d6a4f' : 'var(--adm-border)'}`, background: filter === f ? '#d1fae5' : 'var(--adm-card)', color: filter === f ? '#2d6a4f' : 'var(--adm-text2)' }}>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {visible.map((n, i) => {
            const isRead = readIds.has(n.id) || n.isRead;
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  borderRadius: 14, padding: '14px 18px',
                  background: isRead ? 'var(--adm-card)' : `${n.bg}66`,
                  border: `1.5px solid ${isRead ? 'var(--adm-border)' : n.bg}`,
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  boxShadow: isRead ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <n.icon size={17} color={n.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: isRead ? 500 : 700, color: 'var(--adm-text)', marginBottom: 4 }}>{n.title}</p>
                    <span style={{ fontSize: 10, color: 'var(--adm-text2)', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--adm-text2)', lineHeight: 1.5 }}>{n.desc}</p>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {!isRead && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                      title="Mark as read"
                      style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} />
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDeletedIds(prev => new Set([...prev, n.id]))}
                    title="Dismiss"
                    style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={12} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--adm-card)', borderRadius: 18, border: '1px solid var(--adm-border)' }}>
            <Bell size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.15 }} />
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--adm-text)', marginBottom: 6 }}>All caught up!</p>
            <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>No notifications to show. Click Refresh to check for updates.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
