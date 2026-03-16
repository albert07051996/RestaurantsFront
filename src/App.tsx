import React from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import kaGE from 'antd/locale/ka_GE';
import { store } from './store/store';
import RestaurantMenu from './components/RestaurantMenu';
import { BrowserRouter, Routes, Route } from "react-router";
import MenuList from './components/MenuList';
import AddCategoryForm from './components/AddCategoryForm';
import AddDishForm from './components/AddDishForm';
import OrderManagement from './components/orders/OrderManagement';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OrderTracking from './components/orders/OrderTracking';
import TableSessionManagement from './components/orders/TableSessionManagement';
import WaiterTableView from './components/orders/WaiterTableView';
import ReservationPage from './components/reservation/ReservationPage';
import ReservationManagement from './components/reservation/ReservationManagement';
import Header from './components/Header';
import './App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ConfigProvider locale={kaGE}>
          <Header />
          <Routes>
            {/* საჯარო გვერდები */}
            <Route path="/" element={<RestaurantMenu />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/reserve" element={<ReservationPage />} />

            {/* ადმინ გვერდები — დაცულია ავტორიზაციით */}
            <Route path="/menu" element={<ProtectedRoute><MenuList /></ProtectedRoute>} />
            <Route path="/add-category" element={<ProtectedRoute><AddCategoryForm /></ProtectedRoute>} />
            <Route path="/add-dish" element={<ProtectedRoute><AddDishForm /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><TableSessionManagement /></ProtectedRoute>} />
            <Route path="/tables" element={<ProtectedRoute><WaiterTableView /></ProtectedRoute>} />
            <Route path="/reservations" element={<ProtectedRoute><ReservationManagement /></ProtectedRoute>} />
          </Routes>
        </ConfigProvider>
      </Provider>
    </BrowserRouter>
  );
};

export default App;
