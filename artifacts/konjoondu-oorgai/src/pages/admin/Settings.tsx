import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, FileText, Truck, CreditCard, Percent, Palette, Users, Save } from 'lucide-react';

const SECTIONS = [
  { id: 'business', label: 'Business Details', icon: Building2 },
  { id: 'gst', label: 'GST & Tax', icon: FileText },
  { id: 'delivery', label: 'Delivery Charges', icon: Truck },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'users', label: 'Users & Roles', icon: Users },
];

function Field({ label, value, type = 'text', hint }: { label: string; value: string; type?: string; hint?: string }) {
  const [v, setV] = useState(value);
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7c5a', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input type={type} value={v} onChange={e => setV(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', color: '#1a1a0f', transition: 'border-color 0.2s' }}
        onFocus={e => (e.target.style.borderColor = '#2d6a4f')}
        onBlur={e => (e.target.style.borderColor = 'rgba(139,94,60,0.14)')}
      />
      {hint && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('business');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Settings</h1>
          <p style={{ fontSize: 13, color: '#6b7c5a' }}>Manage your store configuration</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: saved ? '#dcfce7' : 'linear-gradient(135deg, #2d6a4f, #1a3a2a)', color: saved ? '#16a34a' : '#f0faf5', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', boxShadow: saved ? 'none' : '0 4px 12px rgba(45,106,79,0.25)', transition: 'all 0.3s' }}>
          <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Sidebar nav */}
        <div style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 12, boxShadow: '0 2px 8px rgba(139,94,60,0.06)', height: 'fit-content' }}>
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <motion.button key={s.id} onClick={() => setActiveSection(s.id)} whileHover={{ x: 2 }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, background: active ? '#d1fae5' : 'transparent', color: active ? '#2d6a4f' : '#6b7c5a', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 700 : 400, transition: 'all 0.15s', justifyContent: 'flex-start' }}>
                <s.icon size={15} />
                {s.label}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          style={{ borderRadius: 18, background: '#fff9f5', border: '1px solid rgba(139,94,60,0.08)', padding: 28, boxShadow: '0 2px 8px rgba(139,94,60,0.06)' }}>
          {activeSection === 'business' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Business Details</p>
              <p style={{ fontSize: 13, color: '#6b7c5a', marginBottom: 24 }}>Your store's basic information used on invoices and shipping labels</p>
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
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>GST & Tax Configuration</p>
              <p style={{ fontSize: 13, color: '#6b7c5a', marginBottom: 24 }}>Tax settings applied to invoices and billing</p>
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
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Delivery Charges</p>
              <p style={{ fontSize: 13, color: '#6b7c5a', marginBottom: 24 }}>Configure shipping rates by zone</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { zone: 'Local (Cuddalore)', base: '₹40', free: '₹500' },
                  { zone: 'Tamil Nadu (Standard)', base: '₹60', free: '₹800' },
                  { zone: 'Other States', base: '₹100', free: '₹1,200' },
                ].map(z => (
                  <div key={z.zone} style={{ padding: '18px 20px', background: 'rgba(45,106,79,0.04)', borderRadius: 14, border: '1px solid rgba(45,106,79,0.12)' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a0f', marginBottom: 14 }}>{z.zone}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Base Charge" value={z.base} />
                      <Field label="Free Shipping Above" value={z.free} hint="Set 0 to disable" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'payment' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Payment Methods</p>
              <p style={{ fontSize: 13, color: '#6b7c5a', marginBottom: 24 }}>Enable or disable payment options for customers</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { name: 'Razorpay (UPI / Card / NetBanking)', enabled: true },
                  { name: 'Cash on Delivery (COD)', enabled: true },
                  { name: 'PhonePe Direct', enabled: false },
                  { name: 'GPay Merchant', enabled: false },
                ].map(pm => (
                  <div key={pm.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(45,106,79,0.04)', borderRadius: 12, border: '1px solid rgba(45,106,79,0.1)' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a0f' }}>{pm.name}</span>
                    <div style={{ width: 42, height: 24, borderRadius: 12, background: pm.enabled ? '#2d6a4f' : '#d1d5db', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: pm.enabled ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f2318', marginBottom: 14 }}>Razorpay Keys</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="API Key" value="rzp_live_••••••••••••••" type="password" hint="Keep this secret" />
                  <Field label="Webhook Secret" value="••••••••••••••••••••" type="password" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'theme' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Theme & Branding</p>
              <p style={{ fontSize: 13, color: '#6b7c5a', marginBottom: 24 }}>Customize your store's look and feel</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Primary Color', value: '#2d6a4f' },
                  { label: 'Accent Color', value: '#8b5e3c' },
                  { label: 'Background Color', value: '#fff9f0' },
                  { label: 'Text Color', value: '#1a1a0f' },
                ].map(c => (
                  <div key={c.label}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7c5a', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" defaultValue={c.value} style={{ width: 44, height: 44, borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', cursor: 'pointer', padding: 2 }} />
                      <input type="text" defaultValue={c.value} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(139,94,60,0.14)', fontSize: 13, outline: 'none', fontFamily: 'monospace', background: '#fff', color: '#1a1a0f' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f2318', marginBottom: 4 }}>Users & Roles</p>
              <p style={{ fontSize: 13, color: '#6b7c5a', marginBottom: 24 }}>Manage admin access</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
                {[
                  { name: 'Super Admin', email: 'admin@konjoonduoorgai.com', role: 'Super Admin', active: true },
                  { name: 'Operations Staff', email: 'ops@konjoonduoorgai.com', role: 'Order Manager', active: true },
                ].map(u => (
                  <div key={u.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(45,106,79,0.04)', borderRadius: 14, border: '1px solid rgba(45,106,79,0.1)' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #52b788, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>{u.name[0]}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a0f', marginBottom: 2 }}>{u.name}</p>
                        <p style={{ fontSize: 11, color: '#6b7c5a' }}>{u.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#d1fae5', color: '#2d6a4f' }}>{u.role}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#dcfce7', color: '#16a34a' }}>Active</span>
                    </div>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: '1.5px dashed rgba(45,106,79,0.3)', cursor: 'pointer', background: 'rgba(45,106,79,0.04)', color: '#2d6a4f', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                <Users size={15} /> Invite Team Member
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
