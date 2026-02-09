// Order Status enum - ბექენდის OrderStatus-ის შესაბამისი
export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Preparing = 'Preparing',
  Ready = 'Ready',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

// Order Type enum - ბექენდის OrderType-ის შესაბამისი
export enum OrderType {
  DineIn = 'DineIn',
  TakeAway = 'TakeAway',
  Delivery = 'Delivery',
}

// OrderItem - რესფონსის მოდელი
export interface OrderItemResponse {
  id: string;
  dishId: string;
  dishNameKa: string;
  dishNameEn: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions: string | null;
}

// OrderItem - რექვესტის მოდელი (შეკვეთის შექმნისას)
export interface OrderItemRequest {
  dishId: string;
  quantity: number;
  specialInstructions?: string | null;
}

// Order - რესფონსის მოდელი
export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  orderType: string;
  status: string;
  tableNumber: number | null;
  notes: string | null;
  totalAmount: number;
  tableSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
}

// შეკვეთის შექმნის რექვესტი - POST /api/orders
export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  orderType: string;
  tableNumber?: number | null;
  notes?: string | null;
  tableSessionId?: string | null;
  items: OrderItemRequest[];
}

// სტატუსის განახლების რექვესტი - PUT /api/orders/{id}/status
export interface UpdateOrderStatusRequest {
  status: string;
}
