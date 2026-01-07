import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem, FoodCategory } from '../types/menu';
import axios from 'axios';

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

// Mock API - შეცვალე რეალური API endpoint-ებით
const API_BASE_URL = 'https://localhost:51263/api';

// Async thunks
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchItems',
  async () => {
    const response = await axios.get<MenuItem[]>( `${API_BASE_URL}/Menu/getAllMenuItems`,{
        headers: {
          // ეს ხაზი გამოტოვებს ngrok-ის გაფრთხილების გვერდს
          // 'ngrok-skip-browser-warning': '69420', 
          // ან გამოიყენე ნებისმიერი მნიშვნელობა:
          'ngrok-skip-browser-warning': 'true'
        }
      });
    return response.data;
  }
);

export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async () => {
    const response = await axios.get<FoodCategory[]>(`${API_BASE_URL}/categories`);
    return response.data;
  }
);

export const addMenuItem = createAsyncThunk(
  'menu/addItem',
  async (item: Omit<MenuItem, 'id'>) => {
    const response = await axios.post<MenuItem>(`${API_BASE_URL}/menu`, item);
    return response.data;
  }
);

export const updateMenuItem = createAsyncThunk(
  'menu/updateItem',
  async (item: MenuItem) => {
    const response = await axios.put<MenuItem>(`${API_BASE_URL}/menu/${item.id}`, item);
    return response.data;
  }
);

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteItem',
  async (id: string) => {
    await axios.delete(`${API_BASE_URL}/menu/${id}`);
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
