import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem, FoodCategory } from '../types/menu';
import { apiClient } from '../config/api';

interface MenuState {
  items: MenuItem[];
  categories: FoodCategory[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  selectedLanguage: 'ka' | 'en';
}

const initialState: MenuState = {
  items: [],
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,
  selectedLanguage: 'ka',
};

// Async thunks
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchItems',
  async () => {
    const response = await apiClient.get<MenuItem[]>('/Menu/getAllMenuItems');
    return response.data;
  }
);

export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async () => {
    const response = await apiClient.get<FoodCategory[]>('/categories');
    return response.data;
  }
);

export const addMenuItem = createAsyncThunk(
  'menu/addItem',
  async (item: Omit<MenuItem, 'id'>) => {
    const response = await apiClient.post<MenuItem>('/menu', item);
    return response.data;
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateItem',
  async (item: MenuItem) => {
    const response = await apiClient.put<MenuItem>(`/menu/${item.id}`, item);
    return response.data;
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteItem',
  async (id: string) => {
    await apiClient.delete(`/menu/${id}`);
    return id;
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'ka' | 'en'>) => {
      state.selectedLanguage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch menu items';
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Add item
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update item
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete item
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { setSelectedCategory, setLanguage, clearError } = menuSlice.actions;
export default menuSlice.reducer;
