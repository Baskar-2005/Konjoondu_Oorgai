import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, RefreshCw, User, Phone,
  Mail, MapPin, CreditCard, Calendar, Package, Printer,
  FileText, Check, Clock, FlaskConical, QrCode, X, Download, ExternalLink, Truck, Save,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import QRCodeLib from 'qrcode';
import type { Order, OrderStatus } from './types';
import { STATUS_META, ORDER_STATUSES } from './types';

function orderTrackUrl(orderId: string) {
  return `${window.location.origin}/track/${orderId}`;
}

const COURIER_PARTNERS = ['DTDC', 'Delhivery', 'Blue Dart', 'India Post', 'XpressBees', 'Other'] as const;

interface Props {
  orders: Order[];
  token: string;
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  onSaveShipment: (id: string, courierPartner: string, trackingNumber: string) => Promise<void>;
  onDeleteShipment: (id: string) => Promise<void>;
  onSeedDemo: () => Promise<void>;
  seeding: boolean;
}

const TIMELINE_STEPS: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIdx = TIMELINE_STEPS.indexOf(status);
  const isCancelled = ['cancelled','returned','refunded'].includes(status);
  return (
    <div style={{ padding: '16px 0', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 640, padding: '0 8px' }}>
        {TIMELINE_STEPS.map((step, i) => {
          const sm = STATUS_META[step];
          const done = !isCancelled && currentIdx >= i;
          const active = !isCancelled && currentIdx === i;
          return (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: i === TIMELINE_STEPS.length - 1 ? 0 : 1 }}>
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: done ? (active ? '#2d6a4f' : '#52b788') : 'rgba(139,94,60,0.12)', border: active ? '3px solid #1a3a2a' : done ? '2px solid #52b788' : '2px solid rgba(139,94,60,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? '0 0 0 4px rgba(45,106,79,0.2)' : 'none', flexShrink: 0 }}>
                  {done ? <Check size={12} color="#fff" strokeWidth={3} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(139,94,60,0.3)' }} />}
                </motion.div>
                <span style={{ fontSize: 9, fontWeight: done ? 700 : 400, color: done ? '#2d6a4f' : '#6b7c5a', textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 60 }}>
                  {sm.label}
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: done && currentIdx > i ? '#52b788' : 'rgba(139,94,60,0.12)', margin: '0 2px', marginTop: -22 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

async function printInvoice(order: Order) {
  const trackUrl = orderTrackUrl(order.id);
  const qrDataUrl = await QRCodeLib.toDataURL(trackUrl, {
    width: 120, margin: 1,
    color: { dark: '#0f2318', light: '#ffffff' },
  });
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head><title>Invoice - ${order.id}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a0f; background: #fff; padding: 40px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #2d6a4f; }
      .brand { display: flex; align-items: center; gap: 14px; }
      .logo { width: 52px; height: 52px; background: linear-gradient(135deg, #52b788, #2d6a4f); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
      .brand-text h1 { font-size: 20px; font-weight: 800; color: #0f2318; }
      .brand-text p { font-size: 11px; color: #6b7c5a; margin-top: 3px; }
      .invoice-meta { text-align: right; }
      .invoice-meta h2 { font-size: 26px; font-weight: 900; color: #2d6a4f; letter-spacing: -0.03em; }
      .invoice-meta p { font-size: 12px; color: #6b7c5a; margin-top: 4px; }
      .invoice-meta .id { font-size: 14px; font-weight: 700; color: #0f2318; font-family: monospace; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
      .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7c5a; margin-bottom: 10px; }
      .info-block { background: #f8faf5; border-radius: 12px; padding: 16px; border: 1px solid #d1fae5; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
      .info-row:last-child { margin-bottom: 0; }
      .info-label { font-size: 12px; color: #6b7c5a; }
      .info-value { font-size: 12px; font-weight: 600; color: #1a1a0f; text-align: right; max-width: 220px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      thead tr { background: #f0faf5; }
      th { padding: 12px 14px; text-align: left; font-size: 10px; font-weight: 700; color: #6b7c5a; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #d1fae5; }
      td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
      .total-row td { background: #f0faf5; font-weight: 800; font-size: 15px; color: #2d6a4f; border-top: 2px solid #d1fae5; border-bottom: none; }
      .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #d1fae5; color: #2d6a4f; }
      .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; }
      .footer p { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
      .thankyou { font-size: 14px; font-weight: 700; color: #2d6a4f; margin-bottom: 6px; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <div class="header">
      <div class="brand">
        <div class="logo">🥒</div>
        <div class="brand-text">
          <h1>Konjoondu Oorgai</h1>
          <p>Cuddalore, Tamil Nadu - 607001</p>
          <p>konjoonduoorgai@gmail.com · +91 98765 43210</p>
          <p>GSTIN: 33AABCK1234A1Z5</p>
        </div>
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <p class="id">${order.id}</p>
        <p>Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        <p style="margin-top:8px"><span class="status-badge">${STATUS_META[order.status]?.label || order.status}</span></p>
      </div>
    </div>
    <div class="grid-2">
      <div class="info-block">
        <p class="section-label">Bill To</p>
        <div class="info-row"><span class="info-label">Name</span><span class="info-value">${order.customer.name}</span></div>
        <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${order.customer.phone}</span></div>
        ${order.customer.email ? `<div class="info-row"><span class="info-label">Email</span><span class="info-value">${order.customer.email}</span></div>` : ''}
        <div class="info-row"><span class="info-label">Address</span><span class="info-value">${order.customer.address}</span></div>
      </div>
      <div class="info-block">
        <p class="section-label">Payment Details</p>
        <div class="info-row"><span class="info-label">Method</span><span class="info-value" style="color:${order.paymentId ? '#2d6a4f' : '#d97706'}">${order.paymentId ? 'Online (Razorpay)' : 'Cash on Delivery'}</span></div>
        ${order.paymentId ? `<div class="info-row"><span class="info-label">Payment ID</span><span class="info-value" style="font-family:monospace;font-size:11px">${order.paymentId}</span></div>` : ''}
        <div class="info-row"><span class="info-label">Invoice Date</span><span class="info-value">${new Date(order.createdAt).toLocaleDateString('en-IN')}</span></div>
        <div class="info-row" style="margin-top:8px;padding-top:8px;border-top:1px solid #d1fae5"><span class="info-label" style="font-weight:700;font-size:13px">Total Payable</span><span class="info-value" style="font-size:18px;font-weight:800;color:#0f2318">₹${order.totalAmount.toLocaleString('en-IN')}</span></div>
      </div>
    </div>
    <p class="section-label">Ordered Items</p>
    <table>
      <thead><tr><th>#</th><th>Product</th><th>Size</th><th>Unit Price</th><th>Qty</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>
        ${order.items.map((item, i) => { const p = Number(item.price ?? 0); const q = Number(item.quantity ?? 0); return `<tr><td style="color:#9ca3af">${i + 1}</td><td style="font-weight:600">${item.productName ?? '—'}</td><td>${item.size ?? '—'}</td><td>₹${p.toLocaleString('en-IN')}</td><td>×${q}</td><td style="text-align:right;font-weight:700">₹${(p * q).toLocaleString('en-IN')}</td></tr>`; }).join('')}
        <tr class="total-row"><td colspan="5" style="text-align:right">Grand Total</td><td style="text-align:right">₹${order.totalAmount.toLocaleString('en-IN')}</td></tr>
      </tbody>
    </table>
    <div style="margin-bottom:28px;padding:16px;background:#f8faf5;border-radius:12px;border:1px solid #d1fae5;display:flex;align-items:center;gap:20px">
      <div style="flex-shrink:0">
        <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7c5a;margin-bottom:8px">Scan to Track Order</p>
        <img src="${qrDataUrl}" alt="Track QR Code" style="width:100px;height:100px;border-radius:8px;border:1px solid #d1fae5;display:block" />
      </div>
      <div style="flex:1">
        <p style="font-size:11px;color:#6b7c5a;margin-bottom:4px">Track your order online by scanning the QR code or visiting:</p>
        <p style="font-size:11px;font-family:monospace;color:#2d6a4f;word-break:break-all">${trackUrl}</p>
      </div>
    </div>
    <div class="footer">
      <p class="thankyou">Thank you for your order! 🙏</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
      <p>For support: support@konjoonduoorgai.com · +91 98765 43210</p>
      <p style="margin-top:8px">Konjoondu Oorgai · Cuddalore, Tamil Nadu</p>
    </div>
    <script>window.onload = () => window.print();</script>
    </body></html>
  `);
  win.document.close();
}

async function printShippingLabel(order: Order) {
  const trackUrl  = orderTrackUrl(order.id);
  const qrDataUrl = await QRCodeLib.toDataURL(trackUrl, {
    width: 110, margin: 1,
    color: { dark: '#0f2318', light: '#ffffff' },
  });
  const win = window.open('', '_blank', 'width=600,height=750');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head><title>Shipping Label - ${order.id}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
      .label { width: 420px; border: 3px solid #1a1a0f; border-radius: 16px; overflow: hidden; }
      .label-header { background: #0f2318; color: #f0faf5; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
      .label-header h2 { font-size: 16px; font-weight: 900; letter-spacing: 0.05em; }
      .label-header p { font-size: 11px; opacity: 0.7; margin-top: 2px; }
      .label-body { padding: 20px; }
      .section { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px dashed #d1d5db; }
      .section:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
      .label-sm { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7c5a; margin-bottom: 6px; }
      .label-val { font-size: 14px; font-weight: 700; color: #1a1a0f; line-height: 1.4; }
      .label-val.large { font-size: 18px; font-weight: 900; }
      .badge { display: inline-block; padding: 4px 12px; background: ${order.paymentId ? '#d1fae5' : '#fef3c7'}; color: ${order.paymentId ? '#2d6a4f' : '#d97706'}; font-size: 11px; font-weight: 800; border-radius: 20px; margin-top: 4px; }
      .order-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
      .order-key { font-size: 11px; color: #6b7c5a; }
      .order-val { font-size: 11px; font-weight: 700; color: #1a1a0f; font-family: monospace; }
      .qr-section { display: flex; align-items: flex-start; gap: 16px; }
      .items-list { font-size: 11px; color: #4a5568; margin-top: 4px; line-height: 1.7; }
      @media print { body { padding: 0; } .label { width: 100%; border-radius: 0; border: 2px solid #000; } }
    </style></head><body>
    <div class="label">
      <div class="label-header">
        <div>
          <h2>🥒 Konjoondu Oorgai</h2>
          <p>Cuddalore, Tamil Nadu - 607001</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:10px;opacity:0.5">SHIPPING LABEL</p>
          <p style="font-size:13px;font-weight:800;font-family:monospace">${order.id}</p>
        </div>
      </div>
      <div class="label-body">
        <div class="section">
          <p class="label-sm">Ship To</p>
          <p class="label-val large">${order.customer.name}</p>
          <p class="label-val" style="font-size:13px;font-weight:500;margin-top:4px">${order.customer.address}</p>
          <p class="label-val" style="font-size:12px;color:#6b7c5a;margin-top:4px">📞 ${order.customer.phone}${order.customer.email ? `  ·  ✉ ${order.customer.email}` : ''}</p>
        </div>
        <div class="section">
          <div class="qr-section">
            <div style="flex-shrink:0;text-align:center">
              <p class="label-sm">Scan to Track</p>
              <img src="${qrDataUrl}" alt="Track QR" style="width:100px;height:100px;border-radius:8px;border:1px solid #e5e7eb;display:block" />
              <p style="font-size:7px;color:#9ca3af;margin-top:4px;word-break:break-all;max-width:100px">scan to view status</p>
            </div>
            <div style="flex:1">
              <div class="order-row"><span class="order-key">Order ID</span><span class="order-val">${order.id}</span></div>
              <div class="order-row"><span class="order-key">Date</span><span class="order-val">${new Date(order.createdAt).toLocaleDateString('en-IN')}</span></div>
              <div class="order-row"><span class="order-key">Items</span><span class="order-val">${order.items.length} item${order.items.length > 1 ? 's' : ''}</span></div>
              <div class="order-row"><span class="order-key">Amount</span><span class="order-val" style="font-size:14px;color:#0f2318">₹${order.totalAmount.toLocaleString('en-IN')}</span></div>
              <div><span class="badge">${order.paymentId ? 'PREPAID' : 'COD — COLLECT ₹' + order.totalAmount.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>
        <div class="section">
          <p class="label-sm">Contents</p>
          <div class="items-list">
            ${order.items.map(i => `• ${i.productName} (${i.size}) × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('<br>')}
          </div>
        </div>
        <div style="text-align:center;margin-top:4px">
          <p style="font-size:9px;color:#9ca3af">Handle with care · Keep dry · This side up</p>
        </div>
      </div>
    </div>
    <script>window.onload = () => window.print();</script>
    </body></html>
  `);
  win.document.close();
}

export default function Orders({ orders, token, loading, onRefresh, onUpdateStatus, onSaveShipment, onDeleteShipment, onSeedDemo, seeding }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingShipmentId, setSavingShipmentId] = useState<string | null>(null);
  const [deletingShipmentId, setDeletingShipmentId] = useState<string | null>(null);
  const [editingShipmentIds, setEditingShipmentIds] = useState<Set<string>>(new Set());
  const [shipmentForms, setShipmentForms] = useState<Record<string, { courierPartner: string; trackingNumber: string }>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);

  async function handleUpdate(id: string, status: OrderStatus) {
    setUpdatingId(id);
    await onUpdateStatus(id, status);
    setUpdatingId(null);
  }

  function getShipmentForm(orderId: string, order: Order) {
    return shipmentForms[orderId] ?? {
      courierPartner: order.courierPartner || '',
      trackingNumber: order.trackingNumber || '',
    };
  }

  async function handleSaveShipment(orderId: string) {
    const form = shipmentForms[orderId];
    if (!form?.courierPartner || !form?.trackingNumber) return;
    setSavingShipmentId(orderId);
    await onSaveShipment(orderId, form.courierPartner, form.trackingNumber);
    setSavingShipmentId(null);
  }

  async function handleDeleteShipment(orderId: string) {
    setDeletingShipmentId(orderId);
    await onDeleteShipment(orderId);
    setDeletingShipmentId(null);
    setEditingShipmentIds(prev => { const s = new Set(prev); s.delete(orderId); return s; });
  }

  function toggleEditShipment(orderId: string) {
    setEditingShipmentIds(prev => {
      const s = new Set(prev);
      if (s.has(orderId)) s.delete(orderId);
      else s.add(orderId);
      return s;
    });
  }

  const statusFilters = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q) || (o.paymentId || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const qrOrder = orders.find(o => o.id === qrOrderId);

  return (
    <div>
      {/* QR Modal */}
      <AnimatePresence>
        {qrOrderId && qrOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setQrOrderId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 32, maxWidth: 380, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', textAlign: 'center' }}>
              <button onClick={() => setQrOrderId(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}>
                <X size={16} />
              </button>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <QrCode size={22} color="#fff" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Order QR Code</p>
              <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginBottom: 20 }}>Scan to view order tracking details</p>
              <div style={{ background: '#fff', padding: 16, borderRadius: 16, display: 'inline-block', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
                <QRCodeSVG value={orderTrackUrl(qrOrder.id)} size={180} bgColor="#ffffff" fgColor="#0f2318" level="H" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--adm-text)', marginTop: 14, fontFamily: 'monospace' }}>{qrOrder.id}</p>
              <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginTop: 4 }}>{qrOrder.customer.name}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#2d6a4f', marginTop: 4 }}>₹{qrOrder.totalAmount.toLocaleString('en-IN')} · {qrOrder.items.length} item{qrOrder.items.length !== 1 ? 's' : ''}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Orders</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>{orders.length} total orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onSeedDemo} disabled={seeding}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1.5px solid rgba(124,58,237,0.2)', cursor: seeding ? 'not-allowed' : 'pointer', background: 'rgba(124,58,237,0.06)', color: '#7c3aed', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', opacity: seeding ? 0.6 : 1 }}>
            <FlaskConical size={13} />
            {seeding ? 'Seeding…' : 'Load Demo'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onRefresh}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, order ID…"
            style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: `1.5px solid var(--adm-border2)`, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {statusFilters.map(s => {
            const sm = s !== 'all' ? STATUS_META[s as OrderStatus] : null;
            const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <motion.button key={s} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setFilterStatus(s)}
                style={{ padding: '7px 13px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', background: filterStatus === s ? (sm?.bg || '#d1fae5') : 'var(--adm-card)', color: filterStatus === s ? (sm?.color || '#2d6a4f') : 'var(--adm-text2)', border: `1.5px solid ${filterStatus === s ? (sm?.border || '#a7f3d0') : 'var(--adm-border)'}` }}>
                {s === 'all' ? 'All' : STATUS_META[s as OrderStatus]?.label || s} ({count})
              </motion.button>
            );
          })}
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--adm-text2)', marginBottom: 12 }}>Showing {filtered.length} of {orders.length} orders</p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--adm-card)', borderRadius: 18, border: `1px solid var(--adm-border)` }}>
          <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--adm-text)', marginBottom: 6 }}>
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>
            {orders.length === 0 ? 'Load demo orders to get started.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((order, idx) => {
            const sm = STATUS_META[order.status] || STATUS_META.pending;
            const isExpanded = expandedId === order.id;
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                style={{ borderRadius: 18, overflow: 'hidden', background: 'var(--adm-card)', border: `1.5px solid ${isExpanded ? sm.border : 'var(--adm-border)'}`, boxShadow: isExpanded ? `0 4px 20px ${sm.color}18` : '0 1px 6px var(--adm-shadow)', transition: 'border-color 0.2s, box-shadow 0.2s' }}>

                {/* Row */}
                <div onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 110 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#2d6a4f', marginBottom: 2, fontFamily: 'monospace' }}>{order.id.slice(0, 12)}</p>
                    <p style={{ fontSize: 10, color: 'var(--adm-text2)' }}><Calendar size={9} style={{ display: 'inline', marginRight: 3 }} />{fmt(order.createdAt)}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-text)', margin: 0 }}>{order.customer.name}</p>
                      {order.isGift && (
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20, background: 'rgba(232,182,74,0.15)', color: '#c9922e', border: '1px solid rgba(232,182,74,0.3)', letterSpacing: '0.04em' }}>🎁 GIFT</span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--adm-text2)', margin: 0 }}>{order.customer.phone}{order.customer.email && ` · ${order.customer.email}`}</p>
                  </div>
                  <div style={{ minWidth: 80, textAlign: 'center' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--adm-text)' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div style={{ minWidth: 90, textAlign: 'right' }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--adm-text)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    <p style={{ fontSize: 9, color: order.paymentId ? '#2d6a4f' : '#d97706', fontWeight: 600 }}>{order.paymentId ? 'PAID' : 'COD'}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`, whiteSpace: 'nowrap' }}>{sm.label}</span>
                  <a href={`/track/${order.id}`} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 20, border: '1.5px solid var(--adm-border)', background: 'var(--adm-card)', color: 'var(--adm-text2)', fontSize: 10, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <ExternalLink size={10} /> Track
                  </a>
                  <div style={{ color: 'var(--adm-text2)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                    <ChevronDown size={16} />
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
                      <div style={{ borderTop: `1.5px solid ${sm.border}`, padding: '20px 24px', background: `${sm.bg}33` }}>

                        {/* Timeline */}
                        <div style={{ marginBottom: 24 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Order Timeline</p>
                          <OrderTimeline status={order.status} />
                        </div>

                        {/* Gift Details */}
                        {order.isGift && (
                          <div style={{ background: 'rgba(232,182,74,0.06)', borderRadius: 12, padding: 16, border: '1.5px solid rgba(232,182,74,0.3)', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                              <span style={{ fontSize: 16 }}>🎁</span>
                              <p style={{ fontSize: 11, fontWeight: 700, color: '#c9922e', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Gift Order Details</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                              {order.giftSenderName && (
                                <div style={{ background: 'rgba(255,249,240,0.8)', borderRadius: 10, padding: 12, border: '1px solid rgba(232,182,74,0.2)' }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: '#c9922e', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>From (Sender)</p>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={11} color="#c9922e" /><span style={{ fontSize: 12, fontWeight: 600, color: '#1a0800' }}>{order.giftSenderName}</span></div>
                                    {order.giftSenderPhone && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={11} color="#c9922e" /><span style={{ fontSize: 12, color: '#6b4c38' }}>{order.giftSenderPhone}</span></div>}
                                    {order.giftSenderEmail && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={11} color="#c9922e" /><span style={{ fontSize: 11, color: '#6b4c38' }}>{order.giftSenderEmail}</span></div>}
                                  </div>
                                </div>
                              )}
                              {order.giftMessage && (
                                <div style={{ background: 'rgba(255,249,240,0.8)', borderRadius: 10, padding: 12, border: '1px solid rgba(232,182,74,0.2)' }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: '#c9922e', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>💌 Gift Message</p>
                                  <p style={{ fontSize: 12, color: '#3d2b1f', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{order.giftMessage}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
                          {/* Customer / Recipient */}
                          <div style={{ background: 'var(--adm-card)', borderRadius: 12, padding: 16, border: `1px solid var(--adm-border)` }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                              {order.isGift ? '📦 Recipient (Ship To)' : 'Customer Details'}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={13} color="var(--adm-text2)" /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text)' }}>{order.customer.name}</span></div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={13} color="var(--adm-text2)" /><span style={{ fontSize: 13, color: 'var(--adm-text3)' }}>{order.customer.phone}</span></div>
                              {order.customer.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={13} color="var(--adm-text2)" /><span style={{ fontSize: 12, color: 'var(--adm-text3)' }}>{order.customer.email}</span></div>}
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><MapPin size={13} color="var(--adm-text2)" style={{ flexShrink: 0, marginTop: 2 }} /><span style={{ fontSize: 12, color: 'var(--adm-text3)', lineHeight: 1.4 }}>{order.customer.address}</span></div>
                            </div>
                          </div>

                          {/* Payment */}
                          <div style={{ background: 'var(--adm-card)', borderRadius: 12, padding: 16, border: `1px solid var(--adm-border)` }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Payment & Shipping</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: 'var(--adm-text2)' }}>Method</span><span style={{ fontSize: 12, fontWeight: 700, color: order.paymentId ? '#2d6a4f' : '#d97706' }}>{order.paymentId ? 'Online (Razorpay)' : 'Cash on Delivery'}</span></div>
                              {order.paymentId && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: 'var(--adm-text2)' }}>Payment ID</span><span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--adm-text3)' }}>{order.paymentId.slice(0, 18)}…</span></div>}
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: 'var(--adm-text2)' }}>Total Amount</span><span style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: 'var(--adm-text2)' }}>Order Date</span><span style={{ fontSize: 12, color: 'var(--adm-text3)' }}>{fmt(order.createdAt)}</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Items table */}
                        <div style={{ background: 'var(--adm-card)', borderRadius: 12, padding: 16, border: `1px solid var(--adm-border)`, marginBottom: 20 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Ordered Items</p>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                              <tr>
                                {['Product', 'Size', 'Price', 'Qty', 'Subtotal'].map(h => (
                                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--adm-text2)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid var(--adm-border)` }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, i) => {
                                const price = Number(item.price ?? 0);
                                const qty = Number(item.quantity ?? 0);
                                return (
                                <tr key={i} style={{ borderBottom: `1px solid var(--adm-border)` }}>
                                  <td style={{ padding: '10px 10px', color: 'var(--adm-text)', fontWeight: 600 }}>{item.productName ?? '—'}</td>
                                  <td style={{ padding: '10px 10px', color: 'var(--adm-text2)' }}>{item.size ?? '—'}</td>
                                  <td style={{ padding: '10px 10px', color: 'var(--adm-text3)' }}>₹{price.toLocaleString('en-IN')}</td>
                                  <td style={{ padding: '10px 10px', color: 'var(--adm-text3)' }}>×{qty}</td>
                                  <td style={{ padding: '10px 10px', color: 'var(--adm-text)', fontWeight: 700 }}>₹{(price * qty).toLocaleString('en-IN')}</td>
                                </tr>
                                );
                              })}
                              <tr>
                                <td colSpan={4} style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--adm-text2)', fontSize: 11 }}>Total</td>
                                <td style={{ padding: '10px 10px', fontWeight: 800, color: '#2d6a4f', fontSize: 15 }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Shipment Management */}
                        <div style={{ background: order.trackingAvailable ? 'rgba(99,102,241,0.04)' : 'var(--adm-card)', borderRadius: 12, padding: 16, border: `1.5px solid ${order.trackingAvailable ? 'rgba(99,102,241,0.3)' : 'var(--adm-border)'}`, marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <Truck size={14} color="#6366f1" />
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shipment Management</p>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                              {order.trackingAvailable && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>✓ Active</span>
                              )}
                              {order.trackingAvailable && (
                                <>
                                  <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                                    onClick={() => toggleEditShipment(order.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: '1.5px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)', color: '#6366f1', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    ✏ {editingShipmentIds.has(order.id) ? 'Cancel' : 'Edit'}
                                  </motion.button>
                                  <motion.button whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                                    onClick={() => handleDeleteShipment(order.id)}
                                    disabled={deletingShipmentId === order.id}
                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: deletingShipmentId === order.id ? 0.6 : 1 }}>
                                    {deletingShipmentId === order.id ? '…' : '🗑 Delete'}
                                  </motion.button>
                                </>
                              )}
                            </div>
                          </div>
                          {order.trackingAvailable && !editingShipmentIds.has(order.id) && order.courierPartner && order.trackingNumber && (
                            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', fontSize: 12, color: '#6366f1', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                              <span>🚚 <strong>{order.courierPartner}</strong></span>
                              <span>·</span>
                              <span style={{ fontFamily: 'monospace' }}>{order.trackingNumber}</span>
                            </div>
                          )}
                          {(!order.trackingAvailable || editingShipmentIds.has(order.id)) && (
                            <>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Courier Partner</label>
                                  <select value={getShipmentForm(order.id, order).courierPartner}
                                    onChange={e => setShipmentForms(prev => ({ ...prev, [order.id]: { ...getShipmentForm(order.id, order), courierPartner: e.target.value } }))}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid var(--adm-border2)`, fontSize: 12, fontFamily: 'inherit', outline: 'none', background: 'var(--adm-input-bg)', color: 'var(--adm-text)', cursor: 'pointer' }}>
                                    <option value="">Select courier…</option>
                                    {COURIER_PARTNERS.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tracking Number</label>
                                  <input type="text" placeholder="e.g. 123456789012"
                                    value={getShipmentForm(order.id, order).trackingNumber}
                                    onChange={e => setShipmentForms(prev => ({ ...prev, [order.id]: { ...getShipmentForm(order.id, order), trackingNumber: e.target.value } }))}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid var(--adm-border2)`, fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
                                </div>
                              </div>
                              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                                onClick={() => handleSaveShipment(order.id)}
                                disabled={savingShipmentId === order.id || !getShipmentForm(order.id, order).courierPartner || !getShipmentForm(order.id, order).trackingNumber}
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', opacity: (savingShipmentId === order.id || !getShipmentForm(order.id, order).courierPartner || !getShipmentForm(order.id, order).trackingNumber) ? 0.5 : 1 }}>
                                {savingShipmentId === order.id
                                  ? <><RefreshCw size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                                  : <><Save size={12} /> Save Shipment Details</>}
                              </motion.button>
                            </>
                          )}
                        </div>

                        {/* Bottom row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div style={{ background: 'var(--adm-card)', borderRadius: 12, padding: 16, border: `1px solid var(--adm-border)` }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Admin Notes</p>
                            <textarea
                              value={adminNotes[order.id] || ''}
                              onChange={e => setAdminNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                              placeholder="Add packing notes, special instructions…"
                              rows={3}
                              style={{ width: '100%', borderRadius: 8, border: `1.5px solid var(--adm-border2)`, fontSize: 12, padding: '8px 10px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => printInvoice(order)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(139,94,60,0.1)', color: '#8b5e3c', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                                <Printer size={12} /> Print Invoice
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => printShippingLabel(order)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                                <FileText size={12} /> Shipping Label
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => setQrOrderId(order.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(45,106,79,0.1)', color: '#2d6a4f', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                                <QrCode size={12} /> Show QR
                              </motion.button>
                            </div>
                          </div>

                          <div style={{ background: 'var(--adm-card)', borderRadius: 12, padding: 16, border: `1px solid var(--adm-border)` }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Update Status</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {(['packed', 'shipped', 'delivered'] as OrderStatus[]).map(s => {
                                const ssm = STATUS_META[s];
                                const isCurrent = order.status === s;
                                return (
                                  <motion.button key={s} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => !isCurrent && handleUpdate(order.id, s)}
                                    disabled={isCurrent || updatingId === order.id}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${isCurrent ? ssm.border : 'var(--adm-border)'}`, cursor: isCurrent ? 'default' : 'pointer', background: isCurrent ? ssm.bg : 'transparent', fontFamily: 'inherit', fontSize: 12, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? ssm.color : 'var(--adm-text3)', transition: 'all 0.15s' }}>
                                    {isCurrent && <Check size={11} strokeWidth={3} />}
                                    <span>{ssm.label}</span>
                                    {updatingId === order.id && !isCurrent && <RefreshCw size={10} style={{ marginLeft: 'auto', animation: 'spin 0.7s linear infinite' }} />}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
