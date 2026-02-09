export enum ReservationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface ReservationItemResponse {
  id: string;
  dishId: string;
  dishNameKa: string;
  dishNameEn: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions: string | null;
}

export interface ReservationItemRequest {
  dishId: string;
  quantity: number;
  specialInstructions?: string | null;
}

export interface ReservationResponse {
  id: string;
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  tableNumber: number;
  notes: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: ReservationItemResponse[];
}

export interface CreateReservationRequest {
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  tableNumber: number;
  notes?: string | null;
  items: ReservationItemRequest[];
}

export interface UpdateReservationStatusRequest {
  status: string;
}
