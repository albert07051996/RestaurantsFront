import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import type { RootState, AppDispatch } from '../../store/store';
import type { TableSessionResponse } from '../../types/session';
import { fetchActiveSessions, closeSession } from '../../store/sessionSlice';
import { message } from 'antd';
import './WaiterTableView.css';

const TOTAL_TABLES = 20;

const WaiterTableView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeSessions, loading } = useSelector((state: RootState) => state.session);
  const [selectedSession, setSelectedSession] = useState<TableSessionResponse | null>(null);

  const loadSessions = useCallback(() => {
    dispatch(fetchActiveSessions());
  }, [dispatch]);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 15000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  const sessionByTable = new Map<number, TableSessionResponse>();
  activeSessions.forEach((s) => {
    if (s.status === 'Active') {
      sessionByTable.set(s.tableNumber, s);
    }
  });

  const handleTableClick = (tableNumber: number) => {
    const session = sessionByTable.get(tableNumber);
    if (session) {
      setSelectedSession(session);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;
    try {
      await dispatch(closeSession(selectedSession.id)).unwrap();
      message.success(`მაგიდა #${selectedSession.tableNumber} დაიხურა`);
      setSelectedSession(null);
      loadSessions();
    } catch {
      message.error('სესიის დახურვა ვერ მოხერხდა');
    }
  };

  const tables = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1);

  return (
    <div className="waiter-tables-page">
      <Link to="/orders" className="back-link">← შეკვეთები</Link>
      <div className="waiter-tables-header">
        <h1>მაგიდების მართვა</h1>
        <p>სულ {sessionByTable.size} დაკავებული მაგიდა {TOTAL_TABLES}-დან</p>
      </div>

      <div className="tables-grid">
        {tables.map((num) => {
          const session = sessionByTable.get(num);
          const isOccupied = !!session;
          return (
            <div
              key={num}
              className={`table-card ${isOccupied ? 'occupied' : 'free'}`}
              onClick={() => handleTableClick(num)}
            >
              <div className="table-number">#{num}</div>
              <div className="table-status-badge">
                {isOccupied ? 'დაკავებული' : 'თავისუფალი'}
              </div>
              {session && (
                <div className="table-info">
                  <div className="customer-name">{session.customerName}</div>
                  <div className="order-count">
                    {session.orders.length} შეკვეთა
                  </div>
                  <div className="total-amount">
                    {session.totalAmount.toFixed(2)} ₾
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSession && (
        <div className="table-modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="table-modal" onClick={(e) => e.stopPropagation()}>
            <div className="table-modal-header">
              <h2>მაგიდა #{selectedSession.tableNumber}</h2>
              <button className="modal-close-btn" onClick={() => setSelectedSession(null)}>
                ✕
              </button>
            </div>

            <div className="session-info">
              <p><strong>მომხმარებელი:</strong> {selectedSession.customerName}</p>
              <p><strong>ტელეფონი:</strong> {selectedSession.customerPhone}</p>
              <p><strong>სესია:</strong> {selectedSession.sessionNumber}</p>
              <p><strong>შეკვეთები:</strong> {selectedSession.orders.length}</p>
              <p className="session-total">ჯამი: {selectedSession.totalAmount.toFixed(2)} ₾</p>
            </div>

            {selectedSession.orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <h4>#{order.orderNumber}</h4>
                  <span className="order-status-badge">{order.status}</span>
                </div>
                <ul className="order-items-list">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span className="order-item-name">{item.dishNameKa}</span>
                      <span className="order-item-qty">x{item.quantity}</span>
                      <span className="order-item-price">{item.totalPrice.toFixed(2)} ₾</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <button
              className="close-session-btn"
              onClick={handleCloseSession}
              disabled={loading}
            >
              {loading ? 'იხურება...' : 'გადახდა / დახურვა'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaiterTableView;
