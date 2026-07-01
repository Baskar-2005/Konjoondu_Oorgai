import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, X, MessageSquare, ThumbsUp, RefreshCw } from 'lucide-react';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  status: string;
  adminReply: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  token: string;
  apiBase: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={13} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  );
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#d97706', bg: '#fef3c7' },
  approved: { label: 'Approved', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' },
};

export default function Reviews({ token, apiBase }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/reviews`, {
        headers: { 'x-admin-token': token },
      });
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function updateReview(review: Review, updates: { status?: string; adminReply?: string }) {
    setSaving(review.id);
    try {
      const res = await fetch(`${apiBase}/admin/reviews/${review.customerId}/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, ...updates } : r));
        if (updates.adminReply !== undefined) setReplyOpen(null);
      }
    } catch { /* silent */ } finally {
      setSaving(null);
    }
  }

  const filtered = reviews.filter(r => filter === 'all' || r.status === filter);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviews.filter(rv => rv.rating === r).length,
    pct: reviews.length ? Math.round((reviews.filter(rv => rv.rating === r).length / reviews.length) * 100) : 0,
  }));

  return (
    <div>
      <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Reviews</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>
            {loading ? 'Loading…' : `${reviews.length} reviews · ${avgRating.toFixed(1)} avg rating`}
          </p>
        </div>
        <button onClick={fetchReviews} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'var(--adm-card)', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--adm-border)', borderTopColor: '#2d6a4f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--adm-text2)', fontSize: 13 }}>Loading reviews from Firestore…</p>
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--adm-card)', borderRadius: 18, border: '1px solid var(--adm-border)' }}>
          <Star size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--adm-text)', marginBottom: 6 }}>No reviews yet</p>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>Customer reviews will appear here once submitted.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 22 }}>
            {/* Rating summary */}
            <div style={{ borderRadius: 18, background: 'var(--adm-card)', border: '1px solid var(--adm-border)', padding: 22, boxShadow: '0 2px 8px var(--adm-shadow)' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 52, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{avgRating.toFixed(1)}</p>
                <StarRating rating={Math.round(avgRating)} />
                <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginTop: 8 }}>Based on {reviews.length} reviews</p>
              </div>
              {ratingDist.map(d => (
                <div key={d.rating} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--adm-text2)', width: 10 }}>{d.rating}</span>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  <div style={{ flex: 1, background: 'var(--adm-border)', borderRadius: 20, height: 7 }}>
                    <div style={{ width: `${d.pct}%`, height: '100%', borderRadius: 20, background: '#f59e0b', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--adm-text2)', width: 14 }}>{d.count}</span>
                </div>
              ))}
            </div>

            {/* Filter pills + stats */}
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => {
                  const count = f === 'all' ? reviews.length : reviews.filter(r => r.status === f).length;
                  const sm = f !== 'all' ? STATUS_META[f] : null;
                  return (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{ padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? (sm?.color || '#2d6a4f') : 'var(--adm-border)'}`, background: filter === f ? (sm?.bg || '#d1fae5') : 'var(--adm-card)', color: filter === f ? (sm?.color || '#2d6a4f') : 'var(--adm-text2)' }}>
                      {f === 'all' ? 'All' : STATUS_META[f].label} ({count})
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Pending Review', value: reviews.filter(r => r.status === 'pending').length, color: '#d97706', bg: '#fef3c7' },
                  { label: 'Total Approved', value: reviews.filter(r => r.status === 'approved').length, color: '#16a34a', bg: '#dcfce7' },
                  { label: 'With Reply',     value: reviews.filter(r => r.adminReply).length,            color: '#6366f1', bg: '#e0e7ff' },
                ].map(c => (
                  <div key={c.label} style={{ borderRadius: 14, padding: 16, background: c.bg, textAlign: 'center' }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</p>
                    <p style={{ fontSize: 10, fontWeight: 600, color: c.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((review, i) => {
              const sm = STATUS_META[review.status] ?? STATUS_META.pending;
              const isSaving = saving === review.id;
              return (
                <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ borderRadius: 16, background: 'var(--adm-card)', border: '1px solid var(--adm-border)', padding: 20, boxShadow: '0 1px 6px var(--adm-shadow)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {(review.customerName || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 2 }}>{review.customerName}</p>
                        <p style={{ fontSize: 11, color: '#2d6a4f', fontWeight: 600 }}>{review.productName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <StarRating rating={review.rating} />
                          <span style={{ fontSize: 11, color: 'var(--adm-text2)' }}>
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: sm.bg, color: sm.color }}>{sm.label}</span>
                  </div>

                  {review.title && (
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 6 }}>"{review.title}"</p>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--adm-text3)', lineHeight: 1.6, marginBottom: 14, padding: '10px 14px', background: 'var(--adm-card-alt)', borderRadius: 10, borderLeft: '3px solid rgba(45,106,79,0.3)' }}>
                    {review.body}
                  </p>

                  {review.adminReply && (
                    <div style={{ marginBottom: 14, padding: '10px 14px', background: '#d1fae5', borderRadius: 10, borderLeft: '3px solid #2d6a4f' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#2d6a4f', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Reply</p>
                      <p style={{ fontSize: 12, color: '#065f46', lineHeight: 1.5 }}>{review.adminReply}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {review.status === 'pending' && (
                      <>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={isSaving}
                          onClick={() => updateReview(review, { status: 'approved' })}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: isSaving ? 0.6 : 1 }}>
                          <Check size={12} /> Approve
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={isSaving}
                          onClick={() => updateReview(review, { status: 'rejected' })}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: isSaving ? 0.6 : 1 }}>
                          <X size={12} /> Reject
                        </motion.button>
                      </>
                    )}
                    {review.status === 'approved' && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={isSaving}
                        onClick={() => updateReview(review, { status: 'rejected' })}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: isSaving ? 0.6 : 1 }}>
                        <X size={12} /> Reject
                      </motion.button>
                    )}
                    {review.status === 'rejected' && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={isSaving}
                        onClick={() => updateReview(review, { status: 'approved' })}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: isSaving ? 0.6 : 1 }}>
                        <Check size={12} /> Approve
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setReplyOpen(replyOpen === review.id ? null : review.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1.5px solid var(--adm-border)', cursor: 'pointer', background: 'transparent', color: 'var(--adm-text2)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                      <MessageSquare size={12} /> {review.adminReply ? 'Edit Reply' : 'Reply'}
                    </motion.button>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--adm-text2)', marginLeft: 'auto' }}>
                      <ThumbsUp size={11} /> {review.helpfulCount} helpful
                    </span>
                  </div>

                  <AnimatePresence>
                    {replyOpen === review.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 12 }}>
                        <textarea
                          value={replyText[review.id] ?? review.adminReply ?? ''}
                          onChange={e => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                          placeholder="Write your reply to this review…"
                          rows={3}
                          style={{ width: '100%', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, padding: '10px 14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'vertical', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={isSaving}
                            onClick={() => updateReview(review, { adminReply: replyText[review.id] ?? review.adminReply ?? '' })}
                            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: isSaving ? 0.6 : 1 }}>
                            {isSaving ? 'Saving…' : 'Send Reply'}
                          </motion.button>
                          <button onClick={() => setReplyOpen(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--adm-border)', cursor: 'pointer', background: 'transparent', color: 'var(--adm-text2)', fontSize: 12, fontFamily: 'inherit' }}>Cancel</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
