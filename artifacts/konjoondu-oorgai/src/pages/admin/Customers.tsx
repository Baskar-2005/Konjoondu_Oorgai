import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Star, ShoppingBag, TrendingUp, Phone, Mail, MapPin, MessageSquare, X, Save, Edit2, Filter } from 'lucide-react';
import type { Order } from './types';
import { STATUS_META } from './types';

interface CustomerNote {
  id: number;
  text: string;
  date: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  orders: number;
  lifetime: number;
  lastOrder: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  notes: CustomerNote[];
  orderHistory: string[];
}

const TIER_META: Record<string, { color: string; bg: string; label: string; min: number }> = {
  bronze:   { color: '#b45309', bg: '#fef3c7', label: 'Bronze',   min: 0    },
  silver:   { color: '#6b7280', bg: '#f3f4f6', label: 'Silver',   min: 1000 },
  gold:     { color: '#d97706', bg: '#fffbeb', label: 'Gold',     min: 4000 },
  platinum: { color: '#7c3aed', bg: '#ede9fe', label: 'Platinum', min: 8000 },
};

function getTier(lifetime: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (lifetime >= 8000) return 'platinum';
  if (lifetime >= 4000) return 'gold';
  if (lifetime >= 1000) return 'silver';
  return 'bronze';
}

function buildCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();
  for (const order of orders) {
    const key = order.customer.phone;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
        address: order.customer.address,
        orders: 0,
        lifetime: 0,
        lastOrder: order.createdAt,
        tier: 'bronze',
        notes: [],
        orderHistory: [],
      });
    }
    const c = map.get(key)!;
    c.orders += 1;
    c.lifetime += order.totalAmount;
    c.tier = getTier(c.lifetime);
    if (new Date(order.createdAt) > new Date(c.lastOrder)) c.lastOrder = order.createdAt;
    c.orderHistory.push(order.id);
  }
  return Array.from(map.values());
}

interface FirestoreCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  isVerified: boolean;
  rewardPoints: number;
  createdAt: string;
  orderCount: number;
  lifetimeValue: number;
  lastOrderAt: string | null;
}

interface Props {
  orders?: Order[];
  firestoreCustomers?: FirestoreCustomer[];
  onRefresh?: () => void;
}

export default function Customers({ orders = [], firestoreCustomers = [], onRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [editNote, setEditNote] = useState<{ id: string; noteId: number; text: string } | null>(null);
  const [notes, setNotes] = useState<Record<string, CustomerNote[]>>({});

  // Merge Firestore registered customers with order-derived stats
  const baseCustomers = React.useMemo<Customer[]>(() => {
    const fromOrders = buildCustomers(orders);
    const orderMap = new Map(fromOrders.map(c => [c.phone, c]));

    // Start from Firestore customers (real registered users)
    const merged = firestoreCustomers.map(fc => {
      const fromOrder = orderMap.get(fc.phone);
      return {
        id: fc.id,
        name: fc.name || fromOrder?.name || '',
        phone: fc.phone,
        email: fc.email || fromOrder?.email || '',
        address: fromOrder?.address || '',
        orders: fc.orderCount,
        lifetime: fc.lifetimeValue,
        lastOrder: fc.lastOrderAt ?? fc.createdAt,
        tier: getTier(fc.lifetimeValue),
        notes: notes[fc.id] ?? [],
        orderHistory: fromOrder?.orderHistory ?? [],
      } as Customer;
    });

    // Also include any order-derived customers not in Firestore (e.g. guest orders)
    for (const oc of fromOrders) {
      const alreadyPresent = merged.some(m => m.phone === oc.phone);
      if (!alreadyPresent) {
        merged.push({ ...oc, notes: notes[oc.id] ?? [] });
      }
    }

    return merged;
  }, [firestoreCustomers, orders, notes]);

  const filtered = baseCustomers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const selected = baseCustomers.find(c => c.id === selectedId) || null;

  const totalRevenue = baseCustomers.reduce((s, c) => s + c.lifetime, 0);
  const avgLTV = baseCustomers.length ? Math.round(totalRevenue / baseCustomers.length) : 0;
  const returning = baseCustomers.filter(c => c.orders > 1).length;

  const addNote = (customerId: string) => {
    if (!noteInput.trim()) return;
    const note: CustomerNote = { id: Date.now(), text: noteInput.trim(), date: new Date().toLocaleDateString('en-IN') };
    setNotes(prev => ({ ...prev, [customerId]: [...(prev[customerId] ?? []), note] }));
    setNoteInput('');
  };

  const deleteNote = (customerId: string, noteId: number) => {
    setNotes(prev => ({ ...prev, [customerId]: (prev[customerId] ?? []).filter(n => n.id !== noteId) }));
  };

  const saveEditNote = () => {
    if (!editNote) return;
    setNotes(prev => ({
      ...prev,
      [editNote.id]: (prev[editNote.id] ?? []).map(n => n.id === editNote.noteId ? { ...n, text: editNote.text } : n),
    }));
    setEditNote(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Customers</h1>
        <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>{baseCustomers.length} customers · ₹{avgLTV.toLocaleString('en-IN')} avg LTV</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Customers', value: baseCustomers.length, icon: Users, color: '#2d6a4f', bg: '#d1fae5' },
          { label: 'Returning', value: returning, icon: TrendingUp, color: '#6366f1', bg: '#e0e7ff' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: ShoppingBag, color: '#d97706', bg: '#fef3c7' },
          { label: 'Avg LTV', value: `₹${avgLTV.toLocaleString('en-IN')}`, icon: Star, color: '#7c3aed', bg: '#ede9fe' },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 14, padding: '16px 18px', background: 'var(--adm-card)', border: `1px solid var(--adm-border)`, boxShadow: '0 2px 8px var(--adm-shadow)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <c.icon size={17} color={c.color} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', ...Object.keys(TIER_META)].map(t => {
            const tm = t !== 'all' ? TIER_META[t] : null;
            return (
              <button key={t} onClick={() => setTierFilter(t)}
                style={{ padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${tierFilter === t ? (tm?.color || '#2d6a4f') : 'var(--adm-border)'}`, background: tierFilter === t ? (tm?.bg || '#d1fae5') : 'var(--adm-card)', color: tierFilter === t ? (tm?.color || '#2d6a4f') : 'var(--adm-text2)' }}>
                {t === 'all' ? 'All Tiers' : tm?.label}
              </button>
            );
          })}
        </div>
      </div>

      {baseCustomers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--adm-card)', borderRadius: 18, border: `1px solid var(--adm-border)` }}>
          <Users size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--adm-text)', marginBottom: 6 }}>No customers yet</p>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>Customers will appear here once orders are placed.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1fr 380px' : '1fr', gap: 16 }}>
          {/* List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, alignContent: 'start' }}>
            {filtered.map((c, i) => {
              const tier = TIER_META[c.tier];
              const isSelected = selectedId === c.id;
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedId(isSelected ? null : c.id)}
                  whileHover={{ y: -2 }}
                  style={{ borderRadius: 16, padding: 18, background: 'var(--adm-card)', cursor: 'pointer', border: `1.5px solid ${isSelected ? '#2d6a4f' : 'var(--adm-border)'}`, boxShadow: isSelected ? '0 4px 16px rgba(45,106,79,0.15)' : '0 1px 6px var(--adm-shadow)', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 2 }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--adm-text2)' }}>{c.phone}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: tier.bg, color: tier.color, whiteSpace: 'nowrap' }}>{tier.label}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, paddingTop: 12, borderTop: `1px solid var(--adm-border)` }}>
                    {[
                      { label: 'Orders', value: c.orders },
                      { label: 'LTV', value: `₹${c.lifetime.toLocaleString('en-IN')}` },
                      { label: 'Last', value: new Date(c.lastOrder).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 2 }}>{m.value}</p>
                        <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                style={{ borderRadius: 18, background: 'var(--adm-card)', border: `1px solid var(--adm-border)`, padding: 22, boxShadow: '0 2px 8px var(--adm-shadow)', height: 'fit-content', position: 'sticky', top: 86, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid var(--adm-border)` }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>{selected.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>{selected.name}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: TIER_META[selected.tier].bg, color: TIER_META[selected.tier].color }}>{TIER_META[selected.tier].label}</span>
                  </div>
                  <button onClick={() => setSelectedId(null)} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={14} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {[
                    { icon: Phone, val: selected.phone },
                    ...(selected.email ? [{ icon: Mail, val: selected.email }] : []),
                    { icon: MapPin, val: selected.address },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <item.icon size={13} color="var(--adm-text2)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: 'var(--adm-text3)', lineHeight: 1.5 }}>{item.val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    { label: 'Total Orders', value: selected.orders, color: '#2d6a4f' },
                    { label: 'Lifetime Value', value: `₹${selected.lifetime.toLocaleString('en-IN')}`, color: '#6366f1' },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'var(--adm-card-alt)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.value}</p>
                      <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Order history */}
                {selected.orderHistory.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Order History</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {selected.orderHistory.map(oid => {
                        const o = orders.find(x => x.id === oid);
                        if (!o) return null;
                        const sm = STATUS_META[o.status];
                        return (
                          <div key={oid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--adm-card-alt)', borderRadius: 8 }}>
                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#2d6a4f' }}>{oid.slice(0, 12)}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sm.bg, color: sm.color }}>{sm.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Admin Notes</p>
                  {selected.notes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                      {selected.notes.map(note => (
                        <div key={note.id} style={{ background: '#fef3c7', borderRadius: 10, padding: '10px 12px', position: 'relative' }}>
                          {editNote?.id === selected.id && editNote.noteId === note.id ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <input value={editNote.text} onChange={e => setEditNote(prev => prev ? { ...prev, text: e.target.value } : null)}
                                style={{ flex: 1, fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #d97706', outline: 'none', fontFamily: 'inherit' }} />
                              <button onClick={saveEditNote} style={{ background: '#d1fae5', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#2d6a4f', fontSize: 11, fontWeight: 700 }}>Save</button>
                              <button onClick={() => setEditNote(null)} style={{ background: 'rgba(220,38,38,0.1)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 11 }}>×</button>
                            </div>
                          ) : (
                            <>
                              <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.4, paddingRight: 48 }}>{note.text}</p>
                              <p style={{ fontSize: 10, color: '#d97706', marginTop: 4 }}>{note.date}</p>
                              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                                <button onClick={() => setEditNote({ id: selected.id, noteId: note.id, text: note.text })}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', padding: 2 }}><Edit2 size={11} /></button>
                                <button onClick={() => deleteNote(selected.id, note.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 2 }}><X size={11} /></button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginBottom: 10, fontStyle: 'italic' }}>No notes yet</p>
                  )}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={noteInput} onChange={e => setNoteInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addNote(selected.id)}
                      placeholder="Add a note… (Enter to save)"
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1.5px solid var(--adm-border2)`, fontSize: 12, outline: 'none', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
                    <button onClick={() => addNote(selected.id)}
                      style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#d1fae5', color: '#2d6a4f', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>+</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
