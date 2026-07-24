import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit2, Trash2, Check, Home, Briefcase, MoreHorizontal, X } from 'lucide-react';
import { useCustomer, CustomerAddress } from '@/context/CustomerContext';

const PRIMARY = 'hsl(4,60%,44%)';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  home: <Home size={16} />, work: <Briefcase size={16} />, other: <MoreHorizontal size={16} />,
};
const TYPE_COLORS: Record<string, string> = { home: '#3b82f6', work: '#8b5cf6', other: '#f59e0b' };

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

const EMPTY_FORM = { label: 'Home', type: 'home', recipientName: '', phone: '', line1: '', line2: '', city: '', state: 'Tamil Nadu', pincode: '', country: 'India', isDefault: false };

function AddressForm({ initial, onSave, onCancel, saving }: {
  initial: typeof EMPTY_FORM;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const f = (key: string) => (v: string) => setForm(p => ({ ...p, [key]: v }));
  const inputStyle = (v?: string): React.CSSProperties => ({
    width: '100%', padding: '10px 13px', borderRadius: 10, fontSize: 13, fontFamily: 'Poppins,sans-serif',
    border: `1.5px solid ${v === '' ? 'rgba(220,38,38,0.4)' : 'rgba(139,94,60,0.2)'}`,
    outline: 'none', boxSizing: 'border-box', color: '#1a0f08', background: '#faf8f5',
  });

  const valid = form.recipientName.trim() && form.phone.trim() && form.line1.trim() && form.city.trim() && form.state.trim() && form.pincode.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Type selector */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b6344', display: 'block', marginBottom: 8 }}>Address Type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ v: 'home', l: '🏠 Home' }, { v: 'work', l: '💼 Work' }, { v: 'other', l: '📍 Other' }].map(t => (
            <button key={t.v} onClick={() => setForm(p => ({ ...p, type: t.v, label: t.l.split(' ')[1] }))}
              style={{ flex: 1, padding: '9px', borderRadius: 10, border: `1.5px solid ${form.type === t.v ? PRIMARY : 'rgba(139,94,60,0.2)'}`, background: form.type === t.v ? `${PRIMARY}10` : 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: 12, color: form.type === t.v ? PRIMARY : '#8b6344', fontFamily: 'Poppins,sans-serif', transition: 'all 0.15s' }}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 6 }}>Recipient Name *</label>
          <input value={form.recipientName} onChange={e => f('recipientName')(e.target.value)} placeholder="Full name" style={inputStyle()} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 6 }}>Phone *</label>
          <input value={form.phone} onChange={e => f('phone')(e.target.value)} placeholder="+91 XXXXX XXXXX" style={inputStyle()} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 6 }}>Address Line 1 *</label>
        <input value={form.line1} onChange={e => f('line1')(e.target.value)} placeholder="Flat no., Building, Street" style={inputStyle()} />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 6 }}>Address Line 2</label>
        <input value={form.line2} onChange={e => f('line2')(e.target.value)} placeholder="Area, Landmark (optional)" style={inputStyle()} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 6 }}>City *</label>
          <input value={form.city} onChange={e => f('city')(e.target.value)} placeholder="City" style={inputStyle()} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 6 }}>Pincode *</label>
          <input value={form.pincode} onChange={e => f('pincode')(e.target.value)} placeholder="6-digit pincode" style={inputStyle()} maxLength={6} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#8b6344', display: 'block', marginBottom: 6 }}>State *</label>
        <select value={form.state} onChange={e => f('state')(e.target.value)}
          style={{ ...inputStyle(), appearance: 'none', cursor: 'pointer' }}>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
          style={{ width: 16, height: 16, accentColor: PRIMARY, cursor: 'pointer' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4a3728' }}>Set as default address</span>
      </label>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button onClick={onCancel}
          style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid rgba(139,94,60,0.2)', background: 'transparent', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, color: '#8b6344' }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={!valid || saving}
          style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: !valid ? 'rgba(181,58,46,0.3)' : PRIMARY, color: '#fff9f0', cursor: !valid ? 'not-allowed' : 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 14, boxShadow: valid ? '0 4px 14px rgba(181,58,46,0.3)' : 'none' }}>
          {saving ? 'Saving…' : 'Save Address'}
        </button>
      </div>
    </div>
  );
}

export default function Addresses() {
  const { apiBase, token } = useCustomer();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<typeof EMPTY_FORM | null>(null);

  async function load() {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/customer/addresses`, { headers: { 'x-customer-token': token } });
      const d = await res.json();
      if (d.success) setAddresses(d.addresses);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [token]);

  async function addAddress(form: typeof EMPTY_FORM) {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/customer/addresses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify(form),
      });
      if ((await res.json()).success) { setShowForm(false); await load(); }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  async function updateAddress(id: number, form: typeof EMPTY_FORM) {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/customer/addresses/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-customer-token': token },
        body: JSON.stringify(form),
      });
      if ((await res.json()).success) { setEditId(null); setEditForm(null); await load(); }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  async function deleteAddress(id: number) {
    if (!token || !window.confirm('Delete this address?')) return;
    await fetch(`${apiBase}/customer/addresses/${id}`, { method: 'DELETE', headers: { 'x-customer-token': token } });
    await load();
  }

  async function setDefault(id: number) {
    if (!token) return;
    await fetch(`${apiBase}/customer/addresses/${id}/default`, { method: 'PATCH', headers: { 'x-customer-token': token } });
    await load();
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#8b6344' }}>{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setShowForm(true); setEditId(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 12, border: 'none', background: PRIMARY, color: '#fff9f0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 4px 14px rgba(181,58,46,0.3)' }}>
          <Plus size={16} /> Add Address
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 16, background: '#fff', borderRadius: 20, padding: '22px', border: `1.5px solid ${PRIMARY}40`, boxShadow: '0 4px 24px rgba(181,58,46,0.12)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a0f08' }}>New Address</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
            </div>
            <AddressForm initial={{ ...EMPTY_FORM }} onSave={addAddress} onCancel={() => setShowForm(false)} saving={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => <div key={i} style={{ height: 100, borderRadius: 18, background: 'rgba(139,94,60,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : addresses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px solid rgba(139,94,60,0.1)' }}>
          <MapPin size={40} color="rgba(139,94,60,0.25)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>No addresses saved</h3>
          <p style={{ fontSize: 13, color: '#8b6344' }}>Add your first delivery address</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {addresses.map(addr => (
            <motion.div key={addr.id} layout
              style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: `1.5px solid ${addr.isDefault ? PRIMARY + '40' : 'rgba(139,94,60,0.1)'}`, boxShadow: addr.isDefault ? '0 4px 20px rgba(181,58,46,0.1)' : '0 2px 8px rgba(139,94,60,0.06)' }}>
              {editId === addr.id && editForm ? (
                <AddressForm initial={editForm} onSave={(f) => updateAddress(addr.id, f)} onCancel={() => { setEditId(null); setEditForm(null); }} saving={saving} />
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${TYPE_COLORS[addr.type] || '#8b6344'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TYPE_COLORS[addr.type] || '#8b6344' }}>
                        {TYPE_ICONS[addr.type] || <MapPin size={16} />}
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#1a0f08' }}>{addr.label}</span>
                        {addr.isDefault && <span style={{ marginLeft: 8, fontSize: 10, background: PRIMARY, color: '#fff', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>DEFAULT</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditId(addr.id); setEditForm({ label: addr.label, type: addr.type, recipientName: addr.recipientName, phone: addr.phone, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, pincode: addr.pincode, country: addr.country, isDefault: addr.isDefault }); setShowForm(false); }}
                        style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(139,94,60,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b6344' }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => deleteAddress(addr.id)}
                        style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 13, color: '#4a3728', lineHeight: 1.6 }}>
                    <strong>{addr.recipientName}</strong> · {addr.phone}<br />
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </div>
                  {!addr.isDefault && (
                    <button onClick={() => setDefault(addr.id)}
                      style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(139,94,60,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#8b6344', fontFamily: 'Poppins,sans-serif' }}>
                      <Check size={12} /> Set as Default
                    </button>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
