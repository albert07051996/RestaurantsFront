import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveSessions, closeSession } from '../../store/sessionSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { TableSessionResponse } from '../../types/session';
import './TableSessionManagement.css';

const statusLabels: Record<string, string> = {
  Pending: 'მოლოდინში',
  Confirmed: 'დადასტურებული',
  Preparing: 'მზადდება',
  Ready: 'მზადაა',
  Delivered: 'მიტანილია',
  Cancelled: 'გაუქმებული',
};

const statusColors: Record<string, string> = {
  Pending: '#f0a500',
  Confirmed: '#1890ff',
  Preparing: '#fa8c16',
  Ready: '#52c41a',
  Delivered: '#d4af37',
  Cancelled: '#e74c3c',
};

const TableSessionManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeSessions, loading } = useSelector((state: RootState) => state.session);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const loadSessions = useCallback(() => {
    dispatch(fetchActiveSessions());
  }, [dispatch]);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 15000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  const handleClose = async (session: TableSessionResponse) => {
    if (window.confirm(`გსურთ მაგიდა #${session.tableNumber}-ის სესიის დახურვა (${session.customerName})?\nჯამი: ₾${session.totalAmount.toFixed(2)}`)) {
      await dispatch(closeSession(session.id));
      loadSessions();
    }
  };

  return (
    <div className="tsm-container">
      <header className="tsm-header">
        <h1>მაგიდების სესიები</h1>
        <p>TABLE SESSIONS</p>
      </header>

      <div className="tsm-stats">
        <div className="tsm-stat">
          <span className="tsm-stat-value">{activeSessions.length}</span>
          <span className="tsm-stat-label">აქტიური მაგიდა</span>
        </div>
        <div className="tsm-stat">
          <span className="tsm-stat-value">
            {activeSessions.reduce((sum, s) => sum + s.orders.length, 0)}
          </span>
          <span className="tsm-stat-label">სულ შეკვეთა</span>
        </div>
        <div className="tsm-stat">
          <span className="tsm-stat-value">
            &#8382;{activeSessions.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
          </span>
          <span className="tsm-stat-label">სულ თანხა</span>
        </div>
      </div>

      <main className="tsm-main">
        {loading && activeSessions.length === 0 && (
          <div className="tsm-loading">იტვირთება...</div>
        )}

        {!loading && activeSessions.length === 0 && (
          <div className="tsm-empty">აქტიური სესიები არ არის</div>
        )}

        <div className="tsm-grid">
          {activeSessions.map((session) => (
            <div key={session.id} className="tsm-card">
              <div className="tsm-card-header">
                <div className="tsm-table-badge">
                  მაგიდა #{session.tableNumber}
                </div>
                <span className="tsm-session-status">აქტიური</span>
              </div>

              <div className="tsm-card-customer">
                <p className="tsm-customer-name">{session.customerName}</p>
                <p className="tsm-customer-phone">{session.customerPhone}</p>
              </div>

              <div className="tsm-card-summary">
                <span>{session.orders.length} შეკვეთა</span>
                <span className="tsm-card-total">&#8382;{session.totalAmount.toFixed(2)}</span>
              </div>

              {/* Orders Toggle */}
              <button
                className="tsm-toggle-orders"
                onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
              >
                {expandedSession === session.id ? 'შეკვეთების დამალვა' : 'შეკვეთების ჩვენება'}
              </button>

              {expandedSession === session.id && (
                <div className="tsm-orders-list">
                  {session.orders.map((order) => (
                    <div key={order.id} className="tsm-order-item">
                      <div className="tsm-order-head">
                        <span className="tsm-order-num">#{order.orderNumber}</span>
                        <span style={{ color: statusColors[order.status] || '#888' }}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      {order.items.map((item) => (
                        <div key={item.id} className="tsm-order-dish">
                          <span>{item.dishNameKa} x{item.quantity}</span>
                          <span>&#8382;{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="tsm-order-subtotal">
                        <span>ჯამი:</span>
                        <span>&#8382;{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="tsm-card-actions">
                <button className="tsm-close-btn" onClick={() => handleClose(session)}>
                  გადახდა / დახურვა
                </button>
              </div>

              <div className="tsm-card-time">
                გახსნილია: {new Date(session.createdAt).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default TableSessionManagement;
