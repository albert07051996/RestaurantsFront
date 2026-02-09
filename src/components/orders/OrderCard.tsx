import React from 'react';
import type { OrderResponse } from '../../types/order';
import { OrderStatus, OrderType } from '../../types/order';

interface OrderCardProps {
  order: OrderResponse;
  onViewDetails: (order: OrderResponse) => void;
  onNextStatus: (order: OrderResponse) => void;
  onCancel: (order: OrderResponse) => void;
}

const statusColors: Record<string, string> = {
  [OrderStatus.Pending]: '#f0a500',
  [OrderStatus.Confirmed]: '#1890ff',
  [OrderStatus.Preparing]: '#fa8c16',
  [OrderStatus.Ready]: '#52c41a',
  [OrderStatus.Delivered]: '#d4af37',
  [OrderStatus.Cancelled]: '#e74c3c',
};

const statusLabels: Record<string, string> = {
  [OrderStatus.Pending]: 'მოლოდინში',
  [OrderStatus.Confirmed]: 'დადასტურებული',
  [OrderStatus.Preparing]: 'მზადდება',
  [OrderStatus.Ready]: 'მზადაა',
  [OrderStatus.Delivered]: 'მიტანილი',
  [OrderStatus.Cancelled]: 'გაუქმებული',
};

const orderTypeLabels: Record<string, string> = {
  [OrderType.DineIn]: 'ადგილზე',
  [OrderType.TakeAway]: 'წასაღები',
  [OrderType.Delivery]: 'მიტანა',
};

const nextStatusMap: Record<string, string | null> = {
  [OrderStatus.Pending]: OrderStatus.Confirmed,
  [OrderStatus.Confirmed]: OrderStatus.Preparing,
  [OrderStatus.Preparing]: OrderStatus.Ready,
  [OrderStatus.Ready]: OrderStatus.Delivered,
  [OrderStatus.Delivered]: null,
  [OrderStatus.Cancelled]: null,
};

const nextStatusLabels: Record<string, string> = {
  [OrderStatus.Pending]: 'დადასტურება',
  [OrderStatus.Confirmed]: 'მომზადების დაწყება',
  [OrderStatus.Preparing]: 'მზადაა',
  [OrderStatus.Ready]: 'მიტანილი',
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails, onNextStatus, onCancel }) => {
  const statusColor = statusColors[order.status] || '#888';
  const nextStatus = nextStatusMap[order.status];

  return (
    <div className="order-card">
      {/* Header */}
      <div className="order-card-header">
        <span className="order-number">#{order.orderNumber}</span>
        <span
          className="order-status-badge"
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
      <div className="order-card-customer">
        <p className="customer-name">{order.customerName}</p>
        <p className="customer-phone">{order.customerPhone}</p>
        {order.customerAddress && (
          <p className="customer-address">{order.customerAddress}</p>
        )}
      </div>

      {/* Order Type */}
      <div className="order-card-type">
        <span className="order-type-label">
          {orderTypeLabels[order.orderType] || order.orderType}
        </span>
        {order.orderType === OrderType.DineIn && order.tableNumber && (
          <span className="table-number">
            {' '}| მაგიდა #{order.tableNumber}
          </span>
        )}
      </div>

      {/* Items Preview */}
      <div className="order-card-items">
        {order.items.slice(0, 3).map((item) => (
          <div key={item.id} className="order-card-item-row">
            <span>{item.dishNameKa} x{item.quantity}</span>
            <span>&#8382;{item.totalPrice.toFixed(2)}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="items-more">+{order.items.length - 3} სხვა</p>
        )}
      </div>

      {/* Total */}
      <div className="order-card-total">
        <span>სულ:</span>
        <span>&#8382;{order.totalAmount.toFixed(2)}</span>
      </div>

      {/* Actions */}
      <div className="order-card-actions">
        <button className="btn-details" onClick={() => onViewDetails(order)}>
          დეტალები
        </button>
        {nextStatus && (
          <button className="btn-next-status" onClick={() => onNextStatus(order)}>
            {nextStatusLabels[order.status] || 'შემდეგი'}
          </button>
        )}
        {order.status !== OrderStatus.Cancelled && order.status !== OrderStatus.Delivered && (
          <button className="btn-cancel" onClick={() => onCancel(order)}>
            გაუქმება
          </button>
        )}
      </div>
    </div>
  );
};

export { statusColors, statusLabels, orderTypeLabels, nextStatusMap, nextStatusLabels };
export default OrderCard;
