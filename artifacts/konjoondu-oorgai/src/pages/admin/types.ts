export interface OrderItem {
  productId: number;
  productName: string;
  size: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: { name: string; phone: string; email: string; address: string };
  items: OrderItem[];
  totalAmount: number;
  paymentId?: string;
  status: OrderStatus;
  createdAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'packed'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending','confirmed','preparing','packed',
  'ready_for_pickup','picked_up','shipped','in_transit',
  'out_for_delivery','delivered','cancelled','returned','refunded',
];

export const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:          { label: 'Pending',           color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  confirmed:        { label: 'Confirmed',         color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  preparing:        { label: 'Preparing',         color: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe' },
  packed:           { label: 'Packed',            color: '#0891b2', bg: '#cffafe', border: '#a5f3fc' },
  ready_for_pickup: { label: 'Ready for Pickup',  color: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  picked_up:        { label: 'Picked Up',         color: '#10b981', bg: '#d1fae5', border: '#6ee7b7' },
  shipped:          { label: 'Shipped',           color: '#6366f1', bg: '#e0e7ff', border: '#c7d2fe' },
  in_transit:       { label: 'In Transit',        color: '#8b5cf6', bg: '#ede9fe', border: '#c4b5fd' },
  out_for_delivery: { label: 'Out for Delivery',  color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d' },
  delivered:        { label: 'Delivered',         color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  cancelled:        { label: 'Cancelled',         color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  returned:         { label: 'Returned',          color: '#ea580c', bg: '#ffedd5', border: '#fed7aa' },
  refunded:         { label: 'Refunded',          color: '#be123c', bg: '#ffe4e6', border: '#fda4af' },
};

export type AdminPage =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'coupons'
  | 'analytics'
  | 'reviews'
  | 'delivery'
  | 'notifications'
  | 'settings';
