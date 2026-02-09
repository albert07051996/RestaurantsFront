import type { OrderResponse } from './order';

export enum TableSessionStatus {
  Active = 'Active',
  Closed = 'Closed',
}

export interface TableSessionResponse {
  id: string;
  sessionNumber: string;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orders: OrderResponse[];
}
