import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Edit2, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';

const PRIMARY = 'hsl(4,60%,44%)';

interface Review { id: number; orderId: string; productId: string; productName: string; rating: number; title: string; body: string; status: string; adminReply: string; createdAt: string; }

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: { icon: <Clock size={12} />, color: '#f59e0b', label: 'Pending Approval' },
  approved: { icon: <CheckCircle2 size={12} />, color: '#22c55e', label: 'Published' },
  rejected: { icon: <XCircle size={12} />, color: '#ef4444', label: 'Rejected' },
};

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{ background: 'none', border: 'none', padding: 2, cursor: onChange ? 'pointer' : 'default' }}>
          <Star size={22} fill={i <= (hover || value) ? '#f59e0b' : 'none'} color={i <= (hover || value) ? '#f59e0b' : 'rgba(139,94,60,0.3)'} />
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { apiBase, token } = useCustomer();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, title: '', body: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${apiBase}/customer/reviews`, { headers: { 'x-customer-token': token } })
      .then(r => r.json())
      .then(d => { if (d.success) setReviews(d.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, apiBase]);

  function startEdit(r: Review) {
    setEditId(r.id);
    setEditForm({ rating: r.rating, title: r.title, body: r.body });
  }

  async function saveEdit(id: number) {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/customer/reviews/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify(editForm),
      });
      const d = await res.json();
      if (d.success) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, ...editForm, status: 'pending' } : r));
        setEditId(null);
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  async function deleteReview(id: number) {
    if (!token || !window.confirm('Delete this review?')) return;
    await fetch(`${apiBase}/customer/reviews/${id}`, { method: 'DELETE', headers: { 'x-customer-token': token } });
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1,2].map(i => <div key={i} style={{ height: 140, borderRadius: 20, background: 'rgba(139,94,60,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );

  if (reviews.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <Star size={48} color="rgba(139,94,60,0.2)" style={{ margin: '0 auto 16px' }} />
      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No reviews yet</h3>
      <p style={{ fontSize: 13, color: '#8b6344' }}>After you receive an order, you can review the products here.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {reviews.map(review => {
        const cfg = STATUS_CONFIG[review.status] || STATUS_CONFIG.pending;
        const isEditing = editId === review.id;
        return (
          <motion.div key={review.id} layout
            style={{ background: '#fff', borderRadius: 20, padding: '20px', border: '1px solid rgba(139,94,60,0.1)', boxShadow: '0 2px 12px rgba(139,94,60,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1a0f08', marginBottom: 4 }}>{review.productName}</div>
                <div style={{ fontSize: 11, color: '#8b6344' }}>Order: {review.orderId}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: `${cfg.color}15` }}>
                  <span style={{ color: cfg.color }}>{cfg.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                </div>
                {!isEditing && (
                  <>
                    <button onClick={() => startEdit(review)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(139,94,60,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b6344' }}><Edit2 size={12} /></button>
                    <button onClick={() => deleteReview(review.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={12} /></button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 6 }}>Rating</label>
                  <StarRating value={editForm.rating} onChange={v => setEditForm(f => ({ ...f, rating: v }))} />
                </div>
                <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Review title (optional)"
                  style={{ padding: '10px 13px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.2)', fontSize: 13, fontFamily: 'Poppins,sans-serif', outline: 'none', color: '#1a0f08', background: '#faf8f5' }} />
                <textarea value={editForm.body} onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))} placeholder="Your review…" rows={3}
                  style={{ padding: '10px 13px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.2)', fontSize: 13, fontFamily: 'Poppins,sans-serif', outline: 'none', resize: 'none', color: '#1a0f08', background: '#faf8f5' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditId(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.2)', background: 'transparent', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 13, color: '#8b6344' }}>Cancel</button>
                  <button onClick={() => saveEdit(review.id)} disabled={saving || !editForm.body.trim()}
                    style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: PRIMARY, color: '#fff9f0', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 13 }}>
                    {saving ? 'Saving…' : 'Save Review'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <StarRating value={review.rating} />
                {review.title && <div style={{ fontWeight: 700, fontSize: 13, color: '#1a0f08', marginTop: 10 }}>{review.title}</div>}
                <p style={{ fontSize: 13, color: '#4a3728', marginTop: 6, lineHeight: 1.6 }}>{review.body}</p>
                <p style={{ fontSize: 11, color: '#c4a882', marginTop: 8 }}>
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {review.adminReply && (
                  <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#15803d', marginBottom: 4 }}>🏪 Response from Konjoondu Oorgai</div>
                    <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>{review.adminReply}</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
