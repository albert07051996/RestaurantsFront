import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOrderStatus, cancelOrder } from '../../store/orderSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { OrderResponse } from '../../types/order';
import { OrderStatus, OrderType } from '../../types/order';
import { statusColors, statusLabels, orderTypeLabels, nextStatusMap, nextStatusLabels } from './OrderCard';

interface OrderDetailModalProps {
  order: OrderResponse | null;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.order);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!order) return null;

  const statusColor = statusColors[order.status] || '#888';
  const nextStatus = nextStatusMap[order.status];

  const handleNextStatus = async () => {
    if (!nextStatus) return;
    await dispatch(updateOrderStatus({ id: order.id, request: { status: nextStatus } }));
    onClose();
  };

  const handleCancel = async () => {
    await dispatch(cancelOrder(order.id));
    setShowCancelConfirm(false);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ka-GE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div
        className="order-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="checkout-close-btn" onClick={onClose}>&#10005;</button>

        {/* Header */}
        <div className="detail-header">
          <h2>შეკვეთა #{order.orderNumber}</h2>
          <span
            className="order-status-badge detail-status-badge"
            style={{
              backgroundColor: `${statusColor}22`,
              color: statusColor,
              borderColor: statusColor,
            }}
          >
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        {/* Customer Info */}
        <div className="detail-section">
          <h3>მომხმარებელი</h3>
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span className="detail-info-label">სახელი:</span>
              <span>{order.customerName}</span>
            </div>
            <div className="detail-info-item">
              <span className="detail-info-label">ტელეფონი:</span>
              <span>{order.customerPhone}</span>
            </div>
            <div className="detail-info-item">
              <span className="detail-info-label">ტიპი:</span>
              <span>{orderTypeLabels[order.orderType] || order.orderType}</span>
            </div>
            {order.orderType === OrderType.DineIn && order.tableNumber && (
              <div className="detail-info-item">
                <span className="detail-info-label">მაგიდა:</span>
                <span>#{order.tableNumber}</span>
              </div>
            )}
            {order.customerAddress && (
              <div className="detail-info-item">
                <span className="detail-info-label">მისამართი:</span>
                <span>{order.customerAddress}</span>
              </div>
            )}
            {order.notes && (
              <div className="detail-info-item detail-info-full">
                <span className="detail-info-label">შენიშვნა:</span>
                <span>{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="detail-section">
          <h3>პროდუქტები</h3>
          <div className="detail-items-list">
            {order.items.map((item) => (
              <div key={item.id} className="detail-item-row">
                <div className="detail-item-info">
                  <span className="detail-item-name">{item.dishNameKa}</span>
                  {item.dishNameEn && (
                    <span className="detail-item-name-en">{item.dishNameEn}</span>
                  )}
                  {item.specialInstructions && (
                    <span className="detail-item-instructions">{item.specialInstructions}</span>
                  )}
                </div>
                <div className="detail-item-qty">x{item.quantity}</div>
                <div className="detail-item-unit">&#8382;{item.unitPrice.toFixed(2)}</div>
                <div className="detail-item-total">&#8382;{item.totalPrice.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="detail-total-row">
            <span>სულ:</span>
            <span>&#8382;{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="detail-section">
          <div className="detail-dates">
            <span>შექმნილი: {formatDate(order.createdAt)}</span>
            <span>განახლებული: {formatDate(order.updatedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="detail-actions">
          {nextStatus && (
            <button
              className="btn-next-status detail-btn"
              onClick={handleNextStatus}
              disabled={loading}
            >
              {loading ? 'იცვლება...' : nextStatusLabels[order.status] || 'შემდეგი ეტაპი'}
            </button>
          )}
          {order.status !== OrderStatus.Cancelled && order.status !== OrderStatus.Delivered && (
            <>
              {!showCancelConfirm ? (
                <button
                  className="btn-cancel detail-btn"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  გაუქმება
                </button>
              ) : (
                <div className="cancel-confirm">
                  <span>დარწმუნებული ხართ?</span>
                  <button className="btn-cancel-yes" onClick={handleCancel} disabled={loading}>
                    {loading ? '...' : 'დიახ'}
                  </button>
                  <button className="btn-cancel-no" onClick={() => setShowCancelConfirm(false)}>
                    არა
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
