import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, Clock, XCircle, MapPin, Phone, Mail, ChevronRight, RefreshCw } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/ko-api';

const COURIER_URLS: Record<string, string> = {
  DTDC:         'https://www.dtdc.in/tracking/tracking_results.asp?podNo=',
  Delhivery:    'https://www.delhivery.com/track/package/',
  'Blue Dart':  'https://www.bluedart.com/tracking?trackFor=0&awbNo=',
  'India Post': 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?tracking=',
  XpressBees:   'https://www.xpressbees.com/track?awbNo=',
};

interface TrackData {
  id: string;
  status: string;
  statusLabel: string;
  statusDescription: string;
  customer: { name: string; phone: string; email?: string; address: string };
  items: { productName: string; size: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentId?: string;
  createdAt: string;
  updatedAt?: string;
  trackingAvailable?: boolean;
  courierPartner?: string;
  trackingNumber?: string;
  shippedAt?: string;
}

const STEPS = [
  { key: 'pending',          label: 'Order Placed',       icon: '📦' },
  { key: 'confirmed',        label: 'Confirmed',           icon: '✅' },
  { key: 'preparing',        label: 'Preparing',           icon: '🥒' },
  { key: 'packed',           label: 'Packed',              icon: '📫' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup',    icon: '🚀' },
  { key: 'picked_up',        label: 'Picked Up',           icon: '🚚' },
  { key: 'shipped',          label: 'Shipped',             icon: '✈️'  },
  { key: 'in_transit',       label: 'In Transit',          icon: '🛣️'  },
  { key: 'out_for_delivery', label: 'Out for Delivery',    icon: '🏍️'  },
  { key: 'delivered',        label: 'Delivered',           icon: '🎉' },
];

const TERMINAL = ['cancelled', 'returned', 'refunded'];

function StatusIcon({ status }: { status: string }) {
  if (status === 'delivered') return <CheckCircle2 size={28} color="#16a34a" />;
  if (TERMINAL.includes(status)) return <XCircle size={28} color="#dc2626" />;
  return <Truck size={28} color="#2d6a4f" />;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TrackOrder({ orderId }: { orderId: string }) {
  const isMobile = useIsMobile();
  const [data, setData]       = useState<TrackData | null>(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/track/${orderId}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) setData(j.order);
        else setError(j.message || 'Order not found');
      })
      .catch(() => setError('Could not reach server. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [orderId]);

  const currentStep = data ? STEPS.findIndex(s => s.key === data.status) : -1;
  const isTerminal  = data ? TERMINAL.includes(data.status) : false;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0f2318 0%, #1a3a2a 60%, #2d6a4f 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🥒</div>
          </a>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#f0faf5', letterSpacing: '-0.01em' }}>Konjoondu Oorgai</p>
            <p style={{ fontSize: 11, color: 'rgba(240,250,245,0.5)' }}>Order Tracking</p>
          </div>
        </div>
        <button onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#f0faf5', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px 60px' }}>
        <div style={{ width: '100%', maxWidth: 600 }}>

          {/* Loading */}
          {loading && !data && (
            <div style={{ textAlign: 'center', color: '#f0faf5', padding: '80px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <RefreshCw size={24} color="#52b788" style={{ animation: 'spin 0.7s linear infinite' }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, opacity: 0.7 }}>Looking up your order…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(220,38,38,0.12)', border: '1.5px solid rgba(220,38,38,0.3)', borderRadius: 20, padding: 28, textAlign: 'center', color: '#f0faf5' }}>
              <XCircle size={40} color="#f87171" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Order Not Found</p>
              <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 20 }}>{error}</p>
              <p style={{ fontSize: 12, fontFamily: 'monospace', background: 'rgba(255,255,255,0.07)', padding: '8px 14px', borderRadius: 8, display: 'inline-block' }}>{orderId}</p>
            </motion.div>
          )}

          {/* Order found */}
          {data && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

                {/* Status hero */}
                <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: isMobile ? 20 : 28, marginBottom: 16, textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                    style={{ width: 72, height: 72, borderRadius: 22, background: isTerminal ? 'rgba(220,38,38,0.15)' : 'rgba(82,183,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `2px solid ${isTerminal ? 'rgba(220,38,38,0.3)' : 'rgba(82,183,136,0.3)'}` }}>
                    <StatusIcon status={data.status} />
                  </motion.div>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#f0faf5', marginBottom: 6 }}>{data.statusLabel}</p>
                  <p style={{ fontSize: 13, color: 'rgba(240,250,245,0.65)', marginBottom: 16, lineHeight: 1.5 }}>{data.statusDescription}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '8px 16px' }}>
                    <Package size={14} color="#52b788" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#52b788', fontFamily: 'monospace' }}>{data.id}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(240,250,245,0.4)', marginTop: 8 }}>Ordered on {fmt(data.createdAt)}</p>
                </div>

                {/* Progress timeline */}
                {!isTerminal && (
                  <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '20px 20px 16px', marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(240,250,245,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Delivery Progress</p>
                    <div style={{ overflowX: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', minWidth: 520, paddingBottom: 4 }}>
                        {STEPS.map((step, i) => {
                          const done    = currentStep >= i;
                          const current = currentStep === i;
                          return (
                            <React.Fragment key={step.key}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: i === STEPS.length - 1 ? 0 : undefined }}>
                                <motion.div initial={false} animate={{ scale: current ? 1.1 : 1 }}
                                  style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#52b788' : 'rgba(255,255,255,0.1)', border: current ? '3px solid #f0faf5' : 'none', boxShadow: current ? '0 0 0 4px rgba(82,183,136,0.3)' : 'none', flexShrink: 0, fontSize: 13 }}>
                                  {done ? (current ? step.icon : <ChevronRight size={12} color="#0f2318" strokeWidth={3} />) : <span style={{ color: 'rgba(240,250,245,0.3)', fontSize: 10 }}>·</span>}
                                </motion.div>
                                <span style={{ fontSize: 8, fontWeight: done ? 700 : 400, color: done ? '#a7f3d0' : 'rgba(240,250,245,0.3)', textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 52 }}>
                                  {step.label}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: currentStep > i ? '#52b788' : 'rgba(255,255,255,0.1)', margin: '0 2px', marginTop: -24, minWidth: 8 }} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Two-column info */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {/* Customer */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 18 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,250,245,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Delivering To</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#f0faf5', marginBottom: 8 }}>{data.customer.name}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Phone size={11} color="#52b788" />
                        <span style={{ fontSize: 12, color: 'rgba(240,250,245,0.65)' }}>{data.customer.phone}</span>
                      </div>
                      {data.customer.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Mail size={11} color="#52b788" />
                          <span style={{ fontSize: 11, color: 'rgba(240,250,245,0.55)', wordBreak: 'break-all' }}>{data.customer.email}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 2 }}>
                        <MapPin size={11} color="#52b788" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 11, color: 'rgba(240,250,245,0.55)', lineHeight: 1.4 }}>{data.customer.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 18 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,250,245,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Payment</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#f0faf5', marginBottom: 6 }}>₹{data.totalAmount.toLocaleString('en-IN')}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: data.paymentId ? 'rgba(22,163,74,0.2)' : 'rgba(217,119,6,0.2)', border: `1px solid ${data.paymentId ? 'rgba(22,163,74,0.3)' : 'rgba(217,119,6,0.3)'}` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: data.paymentId ? '#4ade80' : '#fbbf24' }}>
                        {data.paymentId ? '● Paid Online' : '○ Cash on Delivery'}
                      </span>
                    </div>
                    {data.paymentId && (
                      <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(240,250,245,0.35)', marginTop: 8, wordBreak: 'break-all' }}>{data.paymentId.slice(0, 20)}…</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 18, marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,250,245,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Your Order</p>
                  {data.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < data.items.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#f0faf5', marginBottom: 2 }}>{item.productName}</p>
                        <p style={{ fontSize: 11, color: 'rgba(240,250,245,0.45)' }}>{item.size} × {item.quantity}</p>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#a7f3d0' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 4, borderTop: '1.5px solid rgba(255,255,255,0.12)' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(240,250,245,0.7)' }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#f0faf5' }}>₹{data.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Shipment tracking card */}
                {data.status !== 'pending' && data.status !== 'confirmed' && data.status !== 'cancelled' && data.status !== 'refunded' && (
                  <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 20, marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(240,250,245,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Shipment Tracking</p>

                    {data.trackingAvailable && data.courierPartner && data.trackingNumber ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 12, color: 'rgba(240,250,245,0.55)' }}>Courier Partner</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#f0faf5' }}>{data.courierPartner}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <span style={{ fontSize: 12, color: 'rgba(240,250,245,0.55)' }}>Tracking Number</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#a7f3d0', fontFamily: 'monospace' }}>{data.trackingNumber}</span>
                        </div>
                        {COURIER_URLS[data.courierPartner] ? (
                          <a
                            href={`${COURIER_URLS[data.courierPartner]}${data.trackingNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(45,106,79,0.4)' }}
                          >
                            <Truck size={16} />
                            Track on {data.courierPartner} Website
                          </a>
                        ) : (
                          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(240,250,245,0.5)' }}>
                            Use tracking number <strong style={{ color: '#a7f3d0' }}>{data.trackingNumber}</strong> on the courier's website.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '12px 0' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22 }}>📦</div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#f0faf5', marginBottom: 8 }}>Your Oorgai is being carefully packed.</p>
                        <p style={{ fontSize: 12, color: 'rgba(240,250,245,0.55)', lineHeight: 1.6 }}>
                          Once your parcel is shipped, your tracking details will be available here.<br />
                          We will notify you as soon as your shipment is ready to track.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', color: 'rgba(240,250,245,0.35)', fontSize: 11 }}>
                  <p>Need help? Contact us at <span style={{ color: '#52b788' }}>support@konjoonduoorgai.com</span></p>
                  <p style={{ marginTop: 4 }}>or call <span style={{ color: '#52b788' }}>+91 98765 43210</span></p>
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
