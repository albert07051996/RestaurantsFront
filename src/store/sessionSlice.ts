import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../config/api';
import type { TableSessionResponse } from '../types/session';

interface SessionState {
  currentSession: TableSessionResponse | null;
  activeSessions: TableSessionResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  currentSession: null,
  activeSessions: [],
  loading: false,
  error: null,
};

export const fetchSessionById = createAsyncThunk(
  'session/fetchById',
  async (id: string) => {
    const response = await apiClient.get<TableSessionResponse>(`/TableSession/${id}`);
    return response.data;
  }
);

export const fetchActiveSessions = createAsyncThunk(
  'session/fetchActive',
  async () => {
    const response = await apiClient.get<TableSessionResponse[]>('/TableSession/active');
    return response.data;
  }
);

export const fetchAllSessions = createAsyncThunk(
  'session/fetchAll',
  async () => {
    const response = await apiClient.get<TableSessionResponse[]>('/TableSession');
    return response.data;
  }
);

export const fetchActiveSessionForTable = createAsyncThunk(
  'session/fetchForTable',
  async (tableNumber: number) => {
    const response = await apiClient.get<TableSessionResponse>(`/TableSession/table/${tableNumber}/active`);
    return response.data;
  }
);

export const closeSession = createAsyncThunk(
  'session/close',
  async (id: string) => {
    const response = await apiClient.put<TableSessionResponse>(`/TableSession/${id}/close`);
    return response.data;
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<TableSessionResponse | null>) => {
      state.currentSession = action.payload;
    },
    clearSessionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'სესიის ჩატვირთვა ვერ მოხერხდა';
      })

      .addCase(fetchActiveSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSessions = action.payload;
      })
      .addCase(fetchActiveSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'სესიების ჩატვირთვა ვერ მოხერხდა';
      })

      .addCase(fetchAllSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSessions = action.payload;
      })
      .addCase(fetchAllSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'სესიების ჩატვირთვა ვერ მოხერხდა';
      })

      .addCase(fetchActiveSessionForTable.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })

      .addCase(closeSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(closeSession.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.activeSessions.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) {
          state.activeSessions[idx] = action.payload;
        }
        if (state.currentSession?.id === action.payload.id) {
          state.currentSession = action.payload;
        }
      })
      .addCase(closeSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'სესიის დახურვა ვერ მოხერხდა';
      });
  },
});

export const { setCurrentSession, clearSessionError } = sessionSlice.actions;
export default sessionSlice.reducer;
