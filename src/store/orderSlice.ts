import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../config/api';
import type {
  OrderResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from '../types/order';

// ====== State ======

interface OrderState {
  orders: OrderResponse[];
  selectedOrder: OrderResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

// ====== Async Thunks ======

// GET /api/orders - ყველა შეკვეთის წამოღება
export const fetchAllOrders = createAsyncThunk(
  'order/fetchAll',
  async () => {
    const response = await apiClient.get<OrderResponse[]>('/order');
    return response.data;
  }
);

// GET /api/orders/{id} - კონკრეტული შეკვეთის წამოღება
export const fetchOrderById = createAsyncThunk(
  'order/fetchById',
  async (id: string) => {
    const response = await apiClient.get<OrderResponse>(`/order/${id}`);
    return response.data;
  }
);

// GET /api/orders/status/{status} - შეკვეთების ფილტრაცია სტატუსით
export const fetchOrdersByStatus = createAsyncThunk(
  'order/fetchByStatus',
  async (status: string) => {
    const response = await apiClient.get<OrderResponse[]>(`/order/status/${status}`);
    return response.data;
  }
);

// POST /api/orders - ახალი შეკვეთის შექმნა
export const createOrder = createAsyncThunk(
  'order/create',
  async (order: CreateOrderRequest) => {
    const response = await apiClient.post<OrderResponse>('/order', order);
    return response.data;
  }
);

// PUT /api/orders/{id}/status - შეკვეთის სტატუსის განახლება
export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async ({ id, request }: { id: string; request: UpdateOrderStatusRequest }) => {
    const response = await apiClient.put<OrderResponse>(
      `/order/${id}/status`,
      request
    );
    return response.data;
  }
);

// DELETE /api/orders/{id} - შეკვეთის გაუქმება
export const cancelOrder = createAsyncThunk(
  'order/cancel',
  async (id: string) => {
    await apiClient.delete(`/order/${id}`);
    return id;
  }
);

// ====== Slice ======

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    setSelectedOrder: (state, action: PayloadAction<OrderResponse | null>) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა';
      })

      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'შეკვეთის ჩატვირთვა ვერ მოხერხდა';
      })

      // Fetch orders by status
      .addCase(fetchOrdersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'შეკვეთების ფილტრაცია ვერ მოხერხდა';
      })

      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'შეკვეთის შექმნა ვერ მოხერხდა';
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'სტატუსის განახლება ვერ მოხერხდა';
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(o => o.id === action.payload);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], status: 'Cancelled' };
        }
        if (state.selectedOrder?.id === action.payload) {
          state.selectedOrder = { ...state.selectedOrder, status: 'Cancelled' };
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'შეკვეთის გაუქმება ვერ მოხერხდა';
      });
  },
});

export const { clearOrderError, clearSelectedOrder, setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
