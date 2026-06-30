import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, X, MessageSquare, Image, ThumbsUp, Filter } from 'lucide-react';

const MOCK_REVIEWS = [
  { id: 1, customer: 'Karthik Rajan', product: 'Prawn Pickle 250g', rating: 5, date: '2024-06-15', text: 'Absolutely delicious! The spice level is perfect and it tastes exactly like homemade. Will order again.', status: 'pending', images: ['🦐'], helpful: 12 },
  { id: 2, customer: 'Meena Sundaram', product: 'Chicken Pickle 500g', rating: 4, date: '2024-06-10', text: 'Good taste and well packed. Delivery was a bit delayed but the product quality is excellent.', status: 'approved', images: [], helpful: 7 },
  { id: 3, customer: 'Ravi Kumar', product: 'Squid Pickle 250g', rating: 5, date: '2024-06-18', text: 'Never had squid pickle before. This is amazing! Perfect with rice. Ordered 3 more jars.', status: 'pending', images: ['🦑','🍚'], helpful: 24 },
  { id: 4, customer: 'Priya Anand', product: 'Mutton Pickle 500g', rating: 3, date: '2024-05-28', text: 'Taste is okay but a bit too oily for my preference. Packaging could be improved.', status: 'rejected', images: [], helpful: 2 },
  { id: 5, customer: 'Lakshmi Devi', product: 'Prawn Pickle 500g', rating: 5, date: '2024-06-20', text: 'Pure authentic taste! Reminds me of grandmother\'s recipe. The freshness is incredible.', status: 'approved', images: ['🦐','❤️'], helpful: 31 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  );
}

const RATING_DIST = [5,4,3,2,1].map(r => ({
  rating: r,
  count: MOCK_REVIEWS.filter(rv => rv.rating === r).length,
  pct: Math.round((MOCK_REVIEWS.filter(rv => rv.rating === r).length / MOCK_REVIEWS.length) * 100),
}));

export default function Reviews() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [replyOpen, setReplyOpen] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});

  const filtered = MOCK_REVIEWS.filter(r => filter === 'all' || (localStatuses[r.id] || r.status) === filter);
  const avgRating = MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length;

  const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    pending:  { label: 'Pending',  color: '#d97706', bg: '#fef3c7' },
    approved: { label: 'Approved', color: '#16a34a', bg: '#dcfce7' },
    rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' },
  };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Reviews</h1>
        <p style={{ fontSize: 13, color: '#6b7c5a' }}>{MOCK_REVIEWS.length} reviews · {avgRating.toFixed(1)} avg rating</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 22 }}>
        {/* Rating summary */}
        <div style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 22, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 52, fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} />
            <p style={{ fontSize: 12, color: '#6b7c5a', marginTop: 8 }}>Based on {MOCK_REVIEWS.length} reviews</p>
          </div>
          {RATING_DIST.map(d => (
            <div key={d.rating} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', width: 10 }}>{d.rating}</span>
              <Star size={11} fill="#f59e0b" color="#f59e0b" />
              <div style={{ flex: 1, background: 'rgba(139,94,60,0.1)', borderRadius: 20, height: 7 }}>
                <div style={{ width: `${d.pct}%`, height: '100%', borderRadius: 20, background: '#f59e0b', transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ fontSize: 11, color: '#6b7c5a', width: 14 }}>{d.count}</span>
            </div>
          ))}
        </div>

        {/* Filter pills + count */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {(['all','pending','approved','rejected'] as const).map(f => {
              const count = f === 'all' ? MOCK_REVIEWS.length : MOCK_REVIEWS.filter(r => (localStatuses[r.id] || r.status) === f).length;
              const sm = f !== 'all' ? STATUS_META[f] : null;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', border: `1.5px solid ${filter === f ? (sm?.color || '#2d6a4f') : 'rgba(139,94,60,0.14)'}`, background: filter === f ? (sm?.bg || '#d1fae5') : '#fff9f5', color: filter === f ? (sm?.color || '#2d6a4f') : '#6b7c5a' }}>
                  {f === 'all' ? 'All' : STATUS_META[f].label} ({count})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Pending Review', value: MOCK_REVIEWS.filter(r => (localStatuses[r.id] || r.status) === 'pending').length, color: '#d97706', bg: '#fef3c7' },
              { label: 'Total Approved', value: MOCK_REVIEWS.filter(r => (localStatuses[r.id] || r.status) === 'approved').length, color: '#16a34a', bg: '#dcfce7' },
              { label: 'With Images', value: MOCK_REVIEWS.filter(r => r.images.length > 0).length, color: '#6366f1', bg: '#e0e7ff' },
            ].map(c => (
              <div key={c.label} style={{ borderRadius: 14, padding: '16px', background: c.bg, textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: c.color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((review, i) => {
          const status = localStatuses[review.id] || review.status;
          const sm = STATUS_META[status];
          return (
            <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ borderRadius: 16, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 20, boxShadow: '0 1px 6px rgba(139,94,60,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {review.customer[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a0f', marginBottom: 2 }}>{review.customer}</p>
                    <p style={{ fontSize: 11, color: '#2d6a4f', fontWeight: 600 }}>{review.product}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <StarRating rating={review.rating} />
                      <span style={{ fontSize: 11, color: '#6b7c5a' }}>{new Date(review.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: sm.bg, color: sm.color }}>{sm.label}</span>
                  {review.images.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#6366f1', fontWeight: 600 }}><Image size={11} />{review.images.length}</span>}
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 14, padding: '10px 14px', background: 'rgba(139,94,60,0.04)', borderRadius: 10, borderLeft: '3px solid rgba(45,106,79,0.3)' }}>
                "{review.text}"
              </p>

              {review.images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {review.images.map((img, idx) => (
                    <div key={idx} style={{ width: 48, height: 48, borderRadius: 10, background: '#f0faf5', border: '1px solid rgba(45,106,79,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{img}</div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {status === 'pending' && (
                  <>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setLocalStatuses(prev => ({ ...prev, [review.id]: 'approved' }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                      <Check size={12} /> Approve
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setLocalStatuses(prev => ({ ...prev, [review.id]: 'rejected' }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                      <X size={12} /> Reject
                    </motion.button>
                  </>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setReplyOpen(replyOpen === review.id ? null : review.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1.5px solid rgba(139,94,60,0.14)', cursor: 'pointer', background: 'transparent', color: '#6b7c5a', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                  <MessageSquare size={12} /> Reply
                </motion.button>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7c5a', marginLeft: 'auto' }}>
                  <ThumbsUp size={11} /> {review.helpful} found helpful
                </span>
              </div>

              <AnimatePresence>
                {replyOpen === review.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 12 }}>
                    <textarea
                      value={replies[review.id] || ''}
                      onChange={e => setReplies(prev => ({ ...prev, [review.id]: e.target.value }))}
                      placeholder="Write your reply to this review…"
                      rows={3}
                      style={{ width: '100%', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.2)', fontSize: 13, padding: '10px 14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'vertical', background: '#fff', color: '#1a1a0f' }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                        Send Reply
                      </motion.button>
                      <button onClick={() => setReplyOpen(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid rgba(139,94,60,0.14)', cursor: 'pointer', background: 'transparent', color: '#6b7c5a', fontSize: 12, fontFamily: 'inherit' }}>Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
