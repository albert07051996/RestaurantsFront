import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { apiClient } from '../../config/api';
import type { OrderResponse } from '../../types/order';
import './OrderTracking.css';

const STATUS_STEPS = [
  { key: 'Pending', label: 'მოლოდინში' },
  { key: 'Confirmed', label: 'დადასტურებული' },
  { key: 'Preparing', label: 'მზადდება' },
  { key: 'Ready', label: 'მზადაა' },
  { key: 'Delivered', label: 'მიტანილი' },
];

const OrderTracking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await apiClient.get<OrderResponse>(`/order/by-number/${num.trim()}`);
      setOrder(response.data);
    } catch {
      try {
        const response = await apiClient.get<OrderResponse>(`/order/${num.trim()}`);
        setOrder(response.data);
      } catch {
        setError('შეკვეთა ვერ მოიძებნა. გთხოვთ შეამოწმოთ ნომერი.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setOrderNumber(orderParam);
      fetchOrder(orderParam);
    }
  }, [searchParams, fetchOrder]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!order) return;
    const num = order.orderNumber || order.id;
    const interval = setInterval(() => fetchOrder(num), 15000);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchParams({ order: orderNumber.trim() });
      fetchOrder(orderNumber.trim());
    }
  };

  const getStepStatus = (stepKey: string): 'completed' | 'current' | 'pending' => {
    if (!order) return 'pending';
    if (order.status === 'Cancelled') {
      return 'pending';
    }
    const currentIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h1>შეკვეთის თრექინგი</h1>
        <p>ORDER TRACKING</p>
      </div>

      <form className="tracking-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="შეკვეთის ნომერი"
        />
        <button type="submit">ძებნა</button>
      </form>

      {loading && <p className="tracking-loading">იტვირთება...</p>}

      {error && <div className="tracking-error">{error}</div>}

      {order && (
        <div className="tracking-card">
          <h2>შეკვეთა #{order.orderNumber || order.id}</h2>

          {order.status === 'Cancelled' ? (
            <p style={{ textAlign: 'center', color: '#e74c3c', fontSize: '1.3rem', fontFamily: "'Cormorant Garamond', serif" }}>
              შეკვეთა გაუქმებულია
            </p>
          ) : (
            <div className="tracking-timeline">
              {STATUS_STEPS.map((step) => {
                const status = getStepStatus(step.key);
                return (
                  <div key={step.key} className={`timeline-step ${status}`}>
                    <div className="timeline-dot">
                      {status === 'completed' && <span style={{ color: 'white', fontSize: '0.7rem' }}>&#10003;</span>}
                      {status === 'current' && <span style={{ color: '#1a1a1a', fontSize: '0.6rem' }}>&#9679;</span>}
                    </div>
                    <span className="timeline-label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="tracking-details">
            <h3>პროდუქტები</h3>
            {order.items.map((item) => (
              <div key={item.id} className="tracking-item">
                <span className="tracking-item-name">
                  {item.dishNameKa} x{item.quantity}
                </span>
                <span className="tracking-item-price">
                  &#8382;{item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}

            <div className="tracking-total">
              <span>სულ:</span>
              <span>&#8382;{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="tracking-meta">
            შეკვეთის დრო: {new Date(order.createdAt).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}

      <a href="/" className="tracking-home-link">
        მთავარ გვერდზე დაბრუნება
      </a>

      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default OrderTracking;
