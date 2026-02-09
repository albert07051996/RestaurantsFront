import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReservations, updateReservationStatus, cancelReservation } from '../../store/reservationSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { ReservationResponse } from '../../types/reservation';
import { ReservationStatus } from '../../types/reservation';
import './ReservationManagement.css';

const statusLabels: Record<string, string> = {
  Pending: 'მოლოდინში',
  Confirmed: 'დადასტურებული',
  Completed: 'დასრულებული',
  Cancelled: 'გაუქმებული',
};

const statusColors: Record<string, string> = {
  Pending: '#faad14',
  Confirmed: '#52c41a',
  Completed: '#1890ff',
  Cancelled: '#e74c3c',
};

const allFilters = [
  'all',
  ReservationStatus.Pending,
  ReservationStatus.Confirmed,
  ReservationStatus.Completed,
  ReservationStatus.Cancelled,
];

const filterLabels: Record<string, string> = {
  all: 'ყველა',
  ...statusLabels,
};

const ReservationManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reservations, loading, error } = useSelector((state: RootState) => state.reservation);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadReservations = useCallback(() => {
    dispatch(fetchAllReservations());
  }, [dispatch]);

  useEffect(() => {
    loadReservations();
    const interval = setInterval(loadReservations, 30000);
    return () => clearInterval(interval);
  }, [loadReservations]);

  const filteredReservations = activeFilter === 'all'
    ? reservations
    : reservations.filter((r) => r.status === activeFilter);

  const statusCounts = reservations.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const handleConfirm = async (reservation: ReservationResponse) => {
    await dispatch(updateReservationStatus({ id: reservation.id, request: { status: 'Confirmed' } }));
  };

  const handleComplete = async (reservation: ReservationResponse) => {
    await dispatch(updateReservationStatus({ id: reservation.id, request: { status: 'Completed' } }));
  };

  const handleCancel = async (reservation: ReservationResponse) => {
    if (window.confirm(`გსურთ ჯავშანი #${reservation.reservationNumber}-ის გაუქმება?`)) {
      await dispatch(cancelReservation(reservation.id));
    }
  };

  return (
    <div className="rm-container">
      <header className="rm-header">
        <h1>ჯავშნების მართვა</h1>
        <p>RESERVATION MANAGEMENT</p>
        <a
          href="/orders"
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
          შეკვეთები
        </a>
      </header>

      {/* Filter Tabs */}
      <div className="rm-filters">
        {allFilters.map((status) => {
          const count = status === 'all' ? reservations.length : (statusCounts[status] || 0);
          const color = status === 'all' ? '#d4af37' : (statusColors[status] || '#888');
          return (
            <button
              key={status}
              className={`rm-filter-tab ${activeFilter === status ? 'active' : ''}`}
              onClick={() => setActiveFilter(status)}
              style={activeFilter === status ? { borderColor: color, color: color } : {}}
            >
              {filterLabels[status] || status}
              <span className="rm-filter-count" style={{ backgroundColor: color }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rm-body">
        {/* Sidebar */}
        <aside className="rm-sidebar">
          <h3>სტატუსები</h3>
          {Object.values(ReservationStatus).map((status) => (
            <div
              key={status}
              className={`rm-sidebar-item ${activeFilter === status ? 'active' : ''}`}
              onClick={() => setActiveFilter(status)}
            >
              <span className="rm-sidebar-dot" style={{ backgroundColor: statusColors[status] }} />
              <span className="rm-sidebar-label">{statusLabels[status]}</span>
              <span className="rm-sidebar-count" style={{ backgroundColor: statusColors[status] }}>
                {statusCounts[status] || 0}
              </span>
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="rm-main">
          {loading && reservations.length === 0 && (
            <div className="rm-loading">იტვირთება...</div>
          )}

          {error && (
            <div className="rm-error">
              <p>{error}</p>
              <button onClick={loadReservations}>ხელახლა ცდა</button>
            </div>
          )}

          {!loading && filteredReservations.length === 0 && (
            <div className="rm-empty">
              <p>ჯავშნები არ მოიძებნა</p>
            </div>
          )}

          <div className="rm-grid">
            {filteredReservations.map((reservation) => {
              const color = statusColors[reservation.status] || '#888';
              return (
                <div key={reservation.id} className="res-card">
                  <div className="res-card-header">
                    <span className="res-number">{reservation.reservationNumber}</span>
                    <span
                      className="res-status-badge"
                      style={{ color, borderColor: color, backgroundColor: `${color}15` }}
                    >
                      {statusLabels[reservation.status] || reservation.status}
                    </span>
                  </div>

                  <div className="res-card-info">
                    <div className="res-info-row">
                      <span className="res-info-label">სახელი:</span>
                      <span className="res-info-value">{reservation.customerName}</span>
                    </div>
                    <div className="res-info-row">
                      <span className="res-info-label">ტელეფონი:</span>
                      <span className="res-info-value">{reservation.customerPhone}</span>
                    </div>
                    <div className="res-info-row">
                      <span className="res-info-label">სტუმრები:</span>
                      <span className="res-info-value">{reservation.guestCount}</span>
                    </div>
                    <div className="res-info-row">
                      <span className="res-info-label">მაგიდა:</span>
                      <span className="res-info-value">#{reservation.tableNumber}</span>
                    </div>
                  </div>

                  <div className="res-card-datetime">
                    <div className="res-datetime-item">
                      <span className="res-datetime-label">თარიღი:</span>
                      <span className="res-datetime-value">
                        {new Date(reservation.reservationDate).toLocaleDateString('ka-GE')}
                      </span>
                    </div>
                    <div className="res-datetime-item">
                      <span className="res-datetime-label">დრო:</span>
                      <span className="res-datetime-value">{reservation.reservationTime}</span>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="res-card-notes">
                      "{reservation.notes}"
                    </div>
                  )}

                  {reservation.items.length > 0 && (
                    <div className="res-card-items">
                      <h4>წინასწარი შეკვეთა:</h4>
                      {reservation.items.map((item) => (
                        <div key={item.id} className="res-card-item-row">
                          <span>{item.dishNameKa} x{item.quantity}</span>
                          <span>&#8382;{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {reservation.totalAmount > 0 && (
                    <div className="res-card-total">
                      <span>ჯამი:</span>
                      <span>&#8382;{reservation.totalAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="res-card-actions">
                    {reservation.status === 'Pending' && (
                      <button className="res-btn-confirm" onClick={() => handleConfirm(reservation)}>
                        დადასტურება
                      </button>
                    )}
                    {reservation.status === 'Confirmed' && (
                      <button className="res-btn-complete" onClick={() => handleComplete(reservation)}>
                        დასრულება
                      </button>
                    )}
                    {(reservation.status === 'Pending' || reservation.status === 'Confirmed') && (
                      <button className="res-btn-cancel" onClick={() => handleCancel(reservation)}>
                        გაუქმება
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default ReservationManagement;
