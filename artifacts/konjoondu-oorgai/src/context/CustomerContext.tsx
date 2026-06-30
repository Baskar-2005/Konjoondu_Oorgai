import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_BASE = '/ko-api';

export interface CustomerAddress {
  id: number;
  customerId: string;
  label: string;
  type: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CustomerData {
  id: string;
  phone: string;
  email: string;
  name: string;
  dob: string;
  gender: string;
  profilePicture: string;
  rewardPoints: number;
  isFirstLogin: boolean;
  communicationPrefs: { email: boolean; sms: boolean; whatsapp: boolean };
  createdAt: string;
}

interface CustomerContextValue {
  customer: CustomerData | null;
  token: string | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (token: string, customer: CustomerData) => void;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  updateCustomer: (data: Partial<CustomerData>) => void;
  apiBase: string;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem('ko_customer_token'); } catch { return null; }
  });
  const [loading, setLoading] = useState(!!localStorage.getItem('ko_customer_token'));

  const refreshCustomer = useCallback(async () => {
    const t = localStorage.getItem('ko_customer_token');
    if (!t) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE}/customer/me`, {
        headers: { 'x-customer-token': t },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setCustomer(data.customer);
        else { localStorage.removeItem('ko_customer_token'); setToken(null); setCustomer(null); }
      } else {
        localStorage.removeItem('ko_customer_token'); setToken(null); setCustomer(null);
      }
    } catch { /* network error, keep existing state */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshCustomer(); }, [refreshCustomer]);

  const login = useCallback((tok: string, cust: CustomerData) => {
    localStorage.setItem('ko_customer_token', tok);
    setToken(tok);
    setCustomer(cust);
  }, []);

  const logout = useCallback(async () => {
    const t = localStorage.getItem('ko_customer_token');
    if (t) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'x-customer-token': t },
        });
      } catch { /* ignore */ }
    }
    localStorage.removeItem('ko_customer_token');
    setToken(null);
    setCustomer(null);
  }, []);

  const updateCustomer = useCallback((data: Partial<CustomerData>) => {
    setCustomer(prev => prev ? { ...prev, ...data } : null);
  }, []);

  return (
    <CustomerContext.Provider value={{
      customer, token, loading,
      isLoggedIn: !!customer,
      login, logout, refreshCustomer, updateCustomer,
      apiBase: API_BASE,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used inside CustomerProvider');
  return ctx;
}
