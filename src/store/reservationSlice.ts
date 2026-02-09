import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../config/api';
import type {
  ReservationResponse,
  CreateReservationRequest,
  UpdateReservationStatusRequest,
} from '../types/reservation';

interface ReservationState {
  reservations: ReservationResponse[];
  selectedReservation: ReservationResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  selectedReservation: null,
  loading: false,
  error: null,
};

export const fetchAllReservations = createAsyncThunk(
  'reservation/fetchAll',
  async () => {
    const response = await apiClient.get<ReservationResponse[]>('/reservation');
    return response.data;
  }
);

export const fetchReservationById = createAsyncThunk(
  'reservation/fetchById',
  async (id: string) => {
    const response = await apiClient.get<ReservationResponse>(`/reservation/${id}`);
    return response.data;
  }
);

export const fetchReservationsByStatus = createAsyncThunk(
  'reservation/fetchByStatus',
  async (status: string) => {
    const response = await apiClient.get<ReservationResponse[]>(`/reservation/status/${status}`);
    return response.data;
  }
);

export const createReservation = createAsyncThunk(
  'reservation/create',
  async (reservation: CreateReservationRequest) => {
    const response = await apiClient.post<ReservationResponse>('/reservation', reservation);
    return response.data;
  }
);

export const updateReservationStatus = createAsyncThunk(
  'reservation/updateStatus',
  async ({ id, request }: { id: string; request: UpdateReservationStatusRequest }) => {
    const response = await apiClient.put<ReservationResponse>(
      `/reservation/${id}/status`,
      request
    );
    return response.data;
  }
);

export const cancelReservation = createAsyncThunk(
  'reservation/cancel',
  async (id: string) => {
    await apiClient.delete(`/reservation/${id}`);
    return id;
  }
);

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    clearReservationError: (state) => {
      state.error = null;
    },
    clearSelectedReservation: (state) => {
      state.selectedReservation = null;
    },
    setSelectedReservation: (state, action: PayloadAction<ReservationResponse | null>) => {
      state.selectedReservation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchAllReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'ჯავშნების ჩატვირთვა ვერ მოხერხდა';
      })

      .addCase(fetchReservationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedReservation = action.payload;
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'ჯავშნის ჩატვირთვა ვერ მოხერხდა';
      })

      .addCase(fetchReservationsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservationsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservationsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'ჯავშნების ფილტრაცია ვერ მოხერხდა';
      })

      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.unshift(action.payload);
        state.selectedReservation = action.payload;
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'ჯავშნის შექმნა ვერ მოხერხდა';
      })

      .addCase(updateReservationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reservations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
        if (state.selectedReservation?.id === action.payload.id) {
          state.selectedReservation = action.payload;
        }
      })
      .addCase(updateReservationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'სტატუსის განახლება ვერ მოხერხდა';
      })

      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reservations.findIndex(r => r.id === action.payload);
        if (index !== -1) {
          state.reservations[index] = { ...state.reservations[index], status: 'Cancelled' };
        }
        if (state.selectedReservation?.id === action.payload) {
          state.selectedReservation = { ...state.selectedReservation, status: 'Cancelled' };
        }
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'ჯავშნის გაუქმება ვერ მოხერხდა';
      });
  },
});

export const { clearReservationError, clearSelectedReservation, setSelectedReservation } = reservationSlice.actions;
export default reservationSlice.reducer;
