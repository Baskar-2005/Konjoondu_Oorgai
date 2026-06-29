import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CartItem {
  productId: number;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  tag: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Adds item to cart. qty defaults to 1; pass a higher value to add multiple at once. */
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems(prev => {
      const sameKey = (i: CartItem) =>
        i.productId === newItem.productId && i.size === newItem.size;
      const exists = prev.find(sameKey);
      if (exists) {
        return prev.map(i => sameKey(i) ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...newItem, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: number, size: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback((productId: number, size: string, quantity: number) => {
    if (quantity < 1) {
      setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.productId === productId && i.size === size ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, totalItems, totalAmount,
      isOpen, openCart, closeCart,
      addItem, removeItem, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
