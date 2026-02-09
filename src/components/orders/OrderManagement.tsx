import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus, cancelOrder } from '../../store/orderSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { OrderResponse } from '../../types/order';
import { OrderStatus } from '../../types/order';
import OrderCard, { statusLabels, statusColors, nextStatusMap } from './OrderCard';
import OrderDetailModal from './OrderDetailModal';
import './OrderManagement.css';

const activeStatuses = [OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Preparing, OrderStatus.Ready];

const allStatuses = [
  'all',
  'active',
  OrderStatus.Pending,
  OrderStatus.Confirmed,
  OrderStatus.Preparing,
  OrderStatus.Ready,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
];

const filterLabels: Record<string, string> = {
  all: 'ყველა',
  active: 'მიმდინარე',
  ...statusLabels,
};

const OrderManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.order);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const loadOrders = useCallback(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const filteredOrders = activeFilter === 'all'
    ? orders
    : activeFilter === 'active'
      ? orders.filter((o) => activeStatuses.includes(o.status as OrderStatus))
      : orders.filter((o) => o.status === activeFilter);

  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const activeCount = orders.filter((o) => activeStatuses.includes(o.status as OrderStatus)).length;

  const handleViewDetails = (order: OrderResponse) => {
    setSelectedOrder(order);
  };

  const handleNextStatus = async (order: OrderResponse) => {
    const nextStatus = nextStatusMap[order.status];
    if (nextStatus) {
      await dispatch(updateOrderStatus({ id: order.id, request: { status: nextStatus } }));
    }
  };

  const handleCancel = async (order: OrderResponse) => {
    if (window.confirm(`გსურთ შეკვეთა #${order.orderNumber}-ის გაუქმება?`)) {
      await dispatch(cancelOrder(order.id));
    }
  };

  return (
    <div className="om-container">
      {/* Header */}
      <header className="om-header">
        <h1>შეკვეთების მართვა</h1>
        <p>ORDER MANAGEMENT</p>
        <a
          href="/sessions"
          style={{
            display: 'inline-block',
            marginTop: '0.8rem',
            padding: '0.5rem 1.5rem',
            background: 'rgba(212, 175, 55, 0.2)',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            color: '#d4af37',
            borderRadius: '25px',
            textDecoration: 'none',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
        >
          მაგიდების სესიები
        </a>
      </header>

      {/* Status Filter Tabs */}
      <div className="om-filters">
        {allStatuses.map((status) => {
          const count = status === 'all' ? orders.length : status === 'active' ? activeCount : (statusCounts[status] || 0);
          const color = status === 'all' ? '#d4af37' : status === 'active' ? '#52c41a' : (statusColors[status] || '#888');
          return (
            <button
              key={status}
              className={`om-filter-tab ${activeFilter === status ? 'active' : ''}`}
              onClick={() => setActiveFilter(status)}
              style={activeFilter === status ? { borderColor: color, color: color } : {}}
            >
              {filterLabels[status] || status}
              <span className="om-filter-count" style={{ backgroundColor: color }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="om-body">
        {/* Sidebar */}
        <aside className="om-sidebar">
          <h3>სტატუსები</h3>
          {Object.values(OrderStatus).map((status) => (
            <div
              key={status}
              className={`om-sidebar-item ${activeFilter === status ? 'active' : ''}`}
              onClick={() => setActiveFilter(status)}
            >
              <span
                className="om-sidebar-dot"
                style={{ backgroundColor: statusColors[status] }}
              />
              <span className="om-sidebar-label">{statusLabels[status]}</span>
              <span
                className="om-sidebar-count"
                style={{ backgroundColor: statusColors[status] }}
              >
                {statusCounts[status] || 0}
              </span>
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="om-main">
          {loading && orders.length === 0 && (
            <div className="om-loading">იტვირთება...</div>
          )}

          {error && (
            <div className="om-error">
              <p>{error}</p>
              <button onClick={loadOrders}>ხელახლა ცდა</button>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="om-empty">
              <p>შეკვეთები არ მოიძებნა</p>
            </div>
          )}

          <div className="om-grid">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                onNextStatus={handleNextStatus}
                onCancel={handleCancel}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => {
          setSelectedOrder(null);
          loadOrders();
        }}
      />

      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default OrderManagement;
