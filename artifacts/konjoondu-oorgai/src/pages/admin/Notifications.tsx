import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, AlertTriangle, XCircle, Star, MessageSquare, RotateCcw, Bell, Check, Trash2 } from 'lucide-react';

const NOTIFS = [
  { id: 1, type: 'order', icon: ShoppingBag, color: '#2d6a4f', bg: '#d1fae5', title: 'New Order Received', desc: 'Karthik Rajan placed an order for ₹820 — Prawn Pickle + Chicken Pickle', time: '2 min ago', read: false },
  { id: 2, type: 'stock', icon: AlertTriangle, color: '#d97706', bg: '#fef3c7', title: 'Low Stock Alert', desc: 'Squid Pickle 250g has only 4 units remaining (threshold: 10)', time: '15 min ago', read: false },
  { id: 3, type: 'order', icon: ShoppingBag, color: '#2d6a4f', bg: '#d1fae5', title: 'New Order Received', desc: 'Ravi Kumar placed an order for ₹1,030 — Squid + Mutton Pickle', time: '1 hr ago', read: false },
  { id: 4, type: 'payment', icon: XCircle, color: '#dc2626', bg: '#fee2e2', title: 'Payment Failed', desc: 'Order ORD-2406-008 payment failed for Sundari Devi — ₹540 COD pending', time: '2 hr ago', read: true },
  { id: 5, type: 'review', icon: Star, color: '#f59e0b', bg: '#fffbeb', title: 'New Review Posted', desc: 'Lakshmi Devi rated Prawn Pickle 5 stars — needs your approval', time: '3 hr ago', read: true },
  { id: 6, type: 'review', icon: Star, color: '#f59e0b', bg: '#fffbeb', title: 'New Review Posted', desc: 'Ravi Kumar posted a review for Squid Pickle — "Amazing taste!"', time: '4 hr ago', read: true },
  { id: 7, type: 'return', icon: RotateCcw, color: '#ea580c', bg: '#ffedd5', title: 'Return Requested', desc: 'Priya Anand requested return for ORD-2405-022 — Mutton Pickle 500g', time: '6 hr ago', read: true },
  { id: 8, type: 'support', icon: MessageSquare, color: '#6366f1', bg: '#e0e7ff', title: 'Support Ticket Opened', desc: 'New support message from Meena Sundaram — "Delivery delayed"', time: '8 hr ago', read: true },
  { id: 9, type: 'stock', icon: AlertTriangle, color: '#d97706', bg: '#fef3c7', title: 'Out of Stock', desc: 'Mixed Pickle 100g and 250g are now completely out of stock', time: '1 day ago', read: true },
];

const TYPE_FILTERS = ['all', 'order', 'stock', 'payment', 'review', 'return', 'support'];

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const [readState, setReadState] = useState<Record<number, boolean>>(() => Object.fromEntries(NOTIFS.map(n => [n.id, n.read])));
  const [deleted, setDeleted] = useState<Set<number>>(new Set());

  const visible = NOTIFS.filter(n => !deleted.has(n.id) && (filter === 'all' || n.type === filter));
  const unreadCount = NOTIFS.filter(n => !deleted.has(n.id) && !readState[n.id]).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Notifications</h1>
          <p style={{ fontSize: 13, color: '#6b7c5a' }}>{unreadCount} unread · {NOTIFS.length - deleted.size} total</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setReadState(Object.fromEntries(NOTIFS.map(n => [n.id, true])))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', cursor: 'pointer', background: '#fff9f5', color: '#6b7c5a', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <Check size={13} /> Mark All Read
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setDeleted(new Set(NOTIFS.filter(n => readState[n.id]).map(n => n.id)))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <Trash2 size={13} /> Clear Read
          </motion.button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TYPE_FILTERS.map(f => {
          const count = f === 'all' ? NOTIFS.filter(n => !deleted.has(n.id)).length : NOTIFS.filter(n => !deleted.has(n.id) && n.type === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? '#2d6a4f' : 'rgba(139,94,60,0.14)'}`, background: filter === f ? '#d1fae5' : '#fff9f5', color: filter === f ? '#2d6a4f' : '#6b7c5a', textTransform: 'capitalize' }}>
              {f === 'all' ? 'All' : f} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {visible.map((n, i) => {
            const isRead = readState[n.id];
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  borderRadius: 14, padding: '14px 18px', background: isRead ? '#fff9f5' : `${n.bg}66`,
                  border: `1.5px solid ${isRead ? 'rgba(139,94,60,0.08)' : n.bg}`,
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  boxShadow: isRead ? 'none' : '0 2px 8px rgba(139,94,60,0.08)',
                }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <n.icon size={17} color={n.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: isRead ? 500 : 700, color: '#1a1a0f', marginBottom: 4 }}>{n.title}</p>
                    <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.5 }}>{n.desc}</p>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {!isRead && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setReadState(prev => ({ ...prev, [n.id]: true }))}
                      title="Mark as read"
                      style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} />
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleted(prev => new Set([...prev, n.id]))}
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
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff9f5', borderRadius: 18, border: '1px solid rgba(139,94,60,0.08)' }}>
            <Bell size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.15 }} />
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a0f', marginBottom: 6 }}>All caught up!</p>
            <p style={{ fontSize: 13, color: '#6b7c5a' }}>No notifications in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
