import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './menuSlice';
import orderReducer from './orderSlice';
import authReducer from './authSlice';
import sessionReducer from './sessionSlice';
import reservationReducer from './reservationSlice';

export const store = configureStore({
  reducer: {
    menu: menuReducer,
    order: orderReducer,
    auth: authReducer,
    session: sessionReducer,
    reservation: reservationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
