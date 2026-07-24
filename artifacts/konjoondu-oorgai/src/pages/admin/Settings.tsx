import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, FileText, Truck, CreditCard, Palette, Users, Save, Plus, Trash2, Edit2, X, Check, Shield, Eye, EyeOff } from 'lucide-react';

const SECTIONS = [
  { id: 'business', label: 'Business Details', icon: Building2 },
  { id: 'gst', label: 'GST & Tax', icon: FileText },
  { id: 'delivery', label: 'Delivery Charges', icon: Truck },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'users', label: 'Users & Roles', icon: Users },
];

const ROLES = [
  { id: 'super_admin', label: 'Super Admin', description: 'Full access to all features', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'order_manager', label: 'Order Manager', description: 'Manage orders, deliveries, and customers', color: '#2d6a4f', bg: '#d1fae5' },
  { id: 'inventory_staff', label: 'Inventory Staff', description: 'View and update stock levels', color: '#0891b2', bg: '#cffafe' },
  { id: 'viewer', label: 'Viewer', description: 'Read-only access to dashboard and reports', color: '#6b7280', bg: '#f3f4f6' },
];

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLogin: string;
  avatar: string;
}

function Field({ label, value, type = 'text', hint }: { label: string; value: string; type?: string; hint?: string }) {
  const [v, setV] = useState(value);
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={isPassword && !show ? 'password' : 'text'} value={v} onChange={e => setV(e.target.value)}
          style={{ width: '100%', padding: isPassword ? '10px 36px 10px 14px' : '10px 14px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: isPassword ? 'monospace' : 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)', transition: 'border-color 0.2s' }}
          onFocus={e => (e.target.style.borderColor = '#2d6a4f')}
          onBlur={e => (e.target.style.borderColor = 'var(--adm-border2)')} />
        {isPassword && (
          <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adm-text2)' }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {hint && <p style={{ fontSize: 11, color: 'var(--adm-text3)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

interface UserModalProps {
  initial?: User;
  onSave: (u: Omit<User, 'id'>) => void;
  onClose: () => void;
}
function UserModal({ initial, onSave, onClose }: UserModalProps) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    role: initial?.role || 'viewer',
    active: initial?.active ?? true,
    lastLogin: initial?.lastLogin || 'Never',
    avatar: initial?.avatar || '',
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--adm-card)', borderRadius: 24, padding: 28, maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)' }}>{initial ? 'Edit User' : 'Invite Team Member'}</p>
          <button onClick={onClose} style={{ background: 'var(--adm-thead)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--adm-text2)' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Karthik Rajan"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="e.g. karthik@konjoonduoorgai.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLES.map(role => (
                <button key={role.id} onClick={() => setForm(p => ({ ...p, role: role.id }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${form.role === role.id ? role.color : 'var(--adm-border)'}`, background: form.role === role.id ? role.bg : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${form.role === role.id ? role.color : 'var(--adm-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {form.role === role.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color }} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: form.role === role.id ? role.color : 'var(--adm-text)', marginBottom: 2 }}>{role.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--adm-text2)' }}>{role.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setForm(p => ({ ...p, active: !p.active }))}
              style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: form.active ? '#2d6a4f' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.active ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--adm-text)' }}>{form.active ? 'Active account' : 'Inactive (suspended)'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '1.5px solid var(--adm-border)', background: 'transparent', color: 'var(--adm-text2)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { if (form.name && form.email) { onSave(form); onClose(); } }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
            <Save size={14} /> {initial ? 'Save Changes' : 'Send Invite'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('business');
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Super Admin', email: 'admin@konjoonduoorgai.com', role: 'super_admin', active: true, lastLogin: 'Just now', avatar: 'A' },
    { id: 2, name: 'Operations Staff', email: 'ops@konjoonduoorgai.com', role: 'order_manager', active: true, lastLogin: '2 hr ago', avatar: 'O' },
    { id: 3, name: 'Warehouse Incharge', email: 'warehouse@konjoonduoorgai.com', role: 'inventory_staff', active: true, lastLogin: 'Yesterday', avatar: 'W' },
  ]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [paymentToggles, setPaymentToggles] = useState({ razorpay: true, cod: true, phonepe: false, gpay: false });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addUser = (data: Omit<User, 'id'>) => setUsers(prev => [...prev, { ...data, id: Date.now() }]);
  const updateUser = (data: Omit<User, 'id'>) => {
    if (!editUser) return;
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...data } : u));
  };
  const deleteUser = (id: number) => setUsers(prev => prev.filter(u => u.id !== id));
  const toggleUserActive = (id: number) => setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));

  return (
    <div>
      <AnimatePresence>
        {showUserModal && <UserModal onSave={addUser} onClose={() => setShowUserModal(false)} />}
        {editUser && <UserModal initial={editUser} onSave={updateUser} onClose={() => setEditUser(null)} />}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Settings</h1>
          <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>Manage your store configuration</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: saved ? '#dcfce7' : 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: saved ? '#16a34a' : '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: saved ? 'none' : '0 4px 12px rgba(45,106,79,0.25)', transition: 'all 0.3s' }}>
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 20 }}>
        {/* Sidebar */}
        <div style={{ borderRadius: 18, background: 'var(--adm-card)', border: `1px solid var(--adm-border)`, padding: 12, boxShadow: '0 2px 8px var(--adm-shadow)', height: 'fit-content' }}>
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <motion.button key={s.id} onClick={() => setActiveSection(s.id)} whileHover={{ x: 2 }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, background: active ? '#d1fae5' : 'transparent', color: active ? '#2d6a4f' : 'var(--adm-text2)', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: active ? 700 : 400, transition: 'all 0.15s', justifyContent: 'flex-start' }}>
                <s.icon size={15} />
                {s.label}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          style={{ borderRadius: 18, background: 'var(--adm-card)', border: `1px solid var(--adm-border)`, padding: 28, boxShadow: '0 2px 8px var(--adm-shadow)' }}>

          {activeSection === 'business' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Business Details</p>
              <p style={{ fontSize: 13, color: 'var(--adm-text2)', marginBottom: 24 }}>Used on invoices and shipping labels</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <Field label="Business Name" value="Konjoondu Oorgai" />
                <Field label="Owner Name" value="Admin" />
                <Field label="Email" value="konjoonduoorgai@gmail.com" type="email" />
                <Field label="Phone" value="+91 98765 43210" type="tel" />
                <div style={{ gridColumn: '1 / -1' }}><Field label="Address" value="Cuddalore, Tamil Nadu - 607001" /></div>
                <Field label="City" value="Cuddalore" />
                <Field label="State" value="Tamil Nadu" />
                <Field label="PIN Code" value="607001" />
                <Field label="Website" value="https://konjoonduoorgai.com" hint="Used on invoices and labels" />
                <Field label="Support Email" value="support@konjoonduoorgai.com" />
              </div>
            </div>
          )}

          {activeSection === 'gst' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>GST & Tax Configuration</p>
              <p style={{ fontSize: 13, color: 'var(--adm-text2)', marginBottom: 24 }}>Tax settings applied to invoices and billing</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <Field label="GSTIN" value="33AABCK1234A1Z5" hint="15-digit GST registration number" />
                <Field label="PAN Number" value="AABCK1234A" />
                <Field label="Tax Rate (%)" value="5" type="number" hint="Food items typically 5% GST" />
                <Field label="HSN Code" value="2001" hint="Pickles and preserved foods" />
              </div>
              <div style={{ marginTop: 24, padding: '14px 18px', background: '#fef3c7', borderRadius: 12 }}>
                <p style={{ fontSize: 13, color: '#92400e' }}>⚠️ Tax changes apply to all future invoices. Consult your CA before changes.</p>
              </div>
            </div>
          )}

          {activeSection === 'delivery' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Delivery Charges</p>
              <p style={{ fontSize: 13, color: 'var(--adm-text2)', marginBottom: 24 }}>Configure shipping rates by zone</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { zone: 'Local (Cuddalore)', base: '40', free: '500' },
                  { zone: 'Tamil Nadu (Standard)', base: '60', free: '800' },
                  { zone: 'Other States', base: '100', free: '1200' },
                ].map(z => (
                  <div key={z.zone} style={{ padding: '18px 20px', background: 'var(--adm-card-alt)', borderRadius: 14, border: `1px solid var(--adm-border)` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 14 }}>{z.zone}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Base Charge (₹)" value={z.base} type="number" />
                      <Field label="Free Shipping Above (₹)" value={z.free} type="number" hint="Set 0 to disable" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'payment' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Payment Methods</p>
              <p style={{ fontSize: 13, color: 'var(--adm-text2)', marginBottom: 24 }}>Enable or disable payment options</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {([
                  { key: 'razorpay', name: 'Razorpay (UPI / Card / NetBanking)' },
                  { key: 'cod', name: 'Cash on Delivery (COD)' },
                  { key: 'phonepe', name: 'PhonePe Direct' },
                  { key: 'gpay', name: 'GPay Merchant' },
                ] as { key: keyof typeof paymentToggles; name: string }[]).map(pm => (
                  <div key={pm.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--adm-card-alt)', borderRadius: 12, border: `1px solid var(--adm-border)` }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-text)' }}>{pm.name}</span>
                    <button onClick={() => setPaymentToggles(p => ({ ...p, [pm.key]: !p[pm.key] }))}
                      style={{ width: 42, height: 24, borderRadius: 12, background: paymentToggles[pm.key] ? '#2d6a4f' : '#d1d5db', position: 'relative', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: paymentToggles[pm.key] ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 14 }}>Razorpay API Keys</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="API Key" value="rzp_live_••••••••••••••" type="password" hint="Keep this secret" />
                <Field label="Webhook Secret" value="••••••••••••••••••••" type="password" />
              </div>
            </div>
          )}

          {activeSection === 'theme' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Theme & Branding</p>
              <p style={{ fontSize: 13, color: 'var(--adm-text2)', marginBottom: 24 }}>Customize your store's look and feel</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Primary Color', value: '#2d6a4f' },
                  { label: 'Accent Color', value: '#8b5e3c' },
                  { label: 'Background Color', value: '#fff9f0' },
                  { label: 'Text Color', value: '#1a1a0f' },
                ].map(c => (
                  <div key={c.label}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-text2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" defaultValue={c.value} style={{ width: 44, height: 44, borderRadius: 10, border: '1.5px solid var(--adm-border2)', cursor: 'pointer', padding: 2 }} />
                      <input type="text" defaultValue={c.value} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--adm-border2)', fontSize: 13, outline: 'none', fontFamily: 'monospace', background: 'var(--adm-input-bg)', color: 'var(--adm-text)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--adm-text)', marginBottom: 4 }}>Users & Roles</p>
                  <p style={{ fontSize: 13, color: 'var(--adm-text2)' }}>Manage team access · {users.filter(u => u.active).length} active</p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowUserModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: '#f0faf5', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(45,106,79,0.25)' }}>
                  <Plus size={14} /> Invite Member
                </motion.button>
              </div>

              {/* Role legend */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 22 }}>
                {ROLES.map(r => (
                  <div key={r.id} style={{ padding: '12px 14px', borderRadius: 12, background: r.bg, border: `1px solid ${r.color}22` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Shield size={12} color={r.color} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.label}</p>
                    </div>
                    <p style={{ fontSize: 10, color: r.color, opacity: 0.8, lineHeight: 1.4 }}>{r.description}</p>
                  </div>
                ))}
              </div>

              {/* User list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence>
                  {users.map((u, i) => {
                    const role = ROLES.find(r => r.id === u.role) || ROLES[3];
                    return (
                      <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'var(--adm-card-alt)', borderRadius: 14, border: `1px solid var(--adm-border)`, opacity: u.active ? 1 : 0.6, transition: 'opacity 0.2s' }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: u.active ? 'linear-gradient(135deg, #52b788, #2d6a4f)' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff' }}>
                            {u.name[0]}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--adm-text)', marginBottom: 2 }}>{u.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--adm-text2)', marginBottom: 3 }}>{u.email}</p>
                            <p style={{ fontSize: 10, color: 'var(--adm-text3)' }}>Last login: {u.lastLogin}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: role.bg, color: role.color }}>{role.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: u.active ? '#dcfce7' : '#f3f4f6', color: u.active ? '#16a34a' : '#6b7280' }}>{u.active ? 'Active' : 'Inactive'}</span>
                          {/* Toggle active */}
                          <button onClick={() => toggleUserActive(u.id)}
                            title={u.active ? 'Suspend' : 'Activate'}
                            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)', background: 'var(--adm-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.active ? '#d97706' : '#2d6a4f' }}>
                            {u.active ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          {/* Edit */}
                          <button onClick={() => setEditUser(u)}
                            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid var(--adm-border)', background: 'var(--adm-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                            <Edit2 size={13} />
                          </button>
                          {/* Delete (not self) */}
                          {u.id !== 1 && (
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => deleteUser(u.id)}
                              style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                              <Trash2 size={13} />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
