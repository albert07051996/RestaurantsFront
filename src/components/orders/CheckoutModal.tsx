import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../../store/orderSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { OrderItemRequest } from '../../types/order';
import { OrderType } from '../../types/order';
import './CheckoutModal.css';

interface CartItem {
  id: string;
  nameKa: string;
  nameEn: string;
  price: number;
  quantity: number;
  cartComment: string;
}

interface CheckoutModalProps {
  visible: boolean;
  cart: CartItem[];
  qrTableNumber?: number | null;
  onClose: () => void;
  onSuccess: (tableSessionId?: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ visible, cart, qrTableNumber, onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.order);

  const isQrMode = !!qrTableNumber;
  const [customerName, setCustomerName] = useState(localStorage.getItem('tableSessionCustomer') || '');
  const [customerPhone, setCustomerPhone] = useState(localStorage.getItem('tableSessionPhone') || '');
  const [orderType, setOrderType] = useState<OrderType>(isQrMode ? OrderType.DineIn : OrderType.DineIn);
  const [tableNumber, setTableNumber] = useState(qrTableNumber ? String(qrTableNumber) : (localStorage.getItem('tableSessionTable') || ''));
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!visible) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const PHONE_REGEX = /^(\+995)?5\d{8}$/;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = 'სახელი სავალდებულოა';
    if (!customerPhone.trim()) {
      newErrors.customerPhone = 'ტელეფონი სავალდებულოა';
    } else {
      const cleanPhone = customerPhone.replace(/[\s\-()]/g, '');
      if (!PHONE_REGEX.test(cleanPhone)) {
        newErrors.customerPhone = 'გთხოვთ შეიყვანოთ სწორი ქართული ნომერი';
      }
    }
    if (orderType === OrderType.DineIn && !tableNumber.trim()) {
      newErrors.tableNumber = 'მაგიდის ნომერი სავალდებულოა';
    }
    if (orderType === OrderType.Delivery && !customerAddress.trim()) {
      newErrors.customerAddress = 'მისამართი სავალდებულოა';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const items: OrderItemRequest[] = cart.map((item) => ({
      dishId: item.id,
      quantity: item.quantity,
      specialInstructions: item.cartComment || null,
    }));

    // Check for existing table session
    const existingSessionId = orderType === OrderType.DineIn
      ? localStorage.getItem('tableSessionId')
      : null;

    try {
      const result = await dispatch(
        createOrder({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: orderType === OrderType.Delivery ? customerAddress.trim() : null,
          orderType,
          tableNumber: orderType === OrderType.DineIn ? parseInt(tableNumber) : null,
          notes: notes.trim() || null,
          tableSessionId: existingSessionId || null,
          items,
        })
      ).unwrap();

      // Save session info for DineIn orders
      if (orderType === OrderType.DineIn && result.tableSessionId) {
        localStorage.setItem('tableSessionId', result.tableSessionId);
        localStorage.setItem('tableSessionCustomer', customerName.trim());
        localStorage.setItem('tableSessionPhone', customerPhone.trim());
        localStorage.setItem('tableSessionTable', tableNumber);
      }

      setSuccessOrderNumber(result.orderNumber || result.id);
      setSuccess(true);
    } catch {
      // error handled by redux
    }
  };

  const resetForm = () => {
    setCustomerName(localStorage.getItem('tableSessionCustomer') || '');
    setCustomerPhone(localStorage.getItem('tableSessionPhone') || '');
    setOrderType(isQrMode ? OrderType.DineIn : OrderType.DineIn);
    setTableNumber(qrTableNumber ? String(qrTableNumber) : (localStorage.getItem('tableSessionTable') || ''));
    setCustomerAddress('');
    setNotes('');
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const handleSuccessClose = () => {
    const sessionId = localStorage.getItem('tableSessionId') || undefined;
    setSuccess(false);
    setSuccessOrderNumber('');
    resetForm();
    onSuccess(sessionId);
    onClose();
  };

  if (success) {
    return (
      <div className="checkout-overlay" onClick={handleSuccessClose}>
        <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
          <div className="checkout-success">
            <div className="success-icon">&#10003;</div>
            <h2>შეკვეთა წარმატებით გაიგზავნა!</h2>
            <p>მადლობა თქვენი შეკვეთისთვის</p>
            {successOrderNumber && (
              <>
                <p style={{ color: '#d4af37', fontSize: '1.4rem', marginTop: '1rem', fontWeight: 'bold' }}>
                  შეკვეთის ნომერი: {successOrderNumber}
                </p>
                <a
                  href={`/track?order=${encodeURIComponent(successOrderNumber)}`}
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.8rem 2rem',
                    background: 'linear-gradient(135deg, #d4af37, #c19a6b)',
                    color: '#1a1a1a',
                    borderRadius: '30px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  თრექინგი
                </a>
              </>
            )}
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={handleSuccessClose}
                style={{
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#d4af37',
                  padding: '0.7rem 2rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                დახურვა
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-overlay" onClick={handleClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-close-btn" onClick={handleClose}>&#10005;</button>

        <h2 className="checkout-title">შეკვეთის გაფორმება</h2>

        {/* Order Type Selection */}
        {isQrMode ? (
          <div className="checkout-section">
            <div className="qr-mode-badge">
              მაგიდა #{qrTableNumber} — ადგილზე შეკვეთა
            </div>
          </div>
        ) : (
          <div className="checkout-section">
            <label className="checkout-label">შეკვეთის ტიპი</label>
            <div className="order-type-buttons">
              <button
                className={`order-type-btn ${orderType === OrderType.DineIn ? 'active' : ''}`}
                onClick={() => setOrderType(OrderType.DineIn)}
              >
                ადგილზე
              </button>
              <button
                className={`order-type-btn ${orderType === OrderType.TakeAway ? 'active' : ''}`}
                onClick={() => setOrderType(OrderType.TakeAway)}
              >
                წასაღები
              </button>
              <button
                className={`order-type-btn ${orderType === OrderType.Delivery ? 'active' : ''}`}
                onClick={() => setOrderType(OrderType.Delivery)}
              >
                მიტანა
              </button>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="checkout-section">
          <label className="checkout-label">სახელი *</label>
          <input
            type="text"
            className={`checkout-input ${errors.customerName ? 'input-error' : ''}`}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="თქვენი სახელი"
          />
          {errors.customerName && <span className="error-text">{errors.customerName}</span>}
        </div>

        <div className="checkout-section">
          <label className="checkout-label">ტელეფონი *</label>
          <input
            type="tel"
            className={`checkout-input ${errors.customerPhone ? 'input-error' : ''}`}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="5XX XXX XXX"
          />
          {errors.customerPhone && <span className="error-text">{errors.customerPhone}</span>}
        </div>

        {/* Conditional Fields */}
        {orderType === OrderType.DineIn && !isQrMode && (
          <div className="checkout-section">
            <label className="checkout-label">მაგიდის ნომერი *</label>
            <input
              type="number"
              className={`checkout-input ${errors.tableNumber ? 'input-error' : ''}`}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="მაგ. 5"
              min="1"
            />
            {errors.tableNumber && <span className="error-text">{errors.tableNumber}</span>}
          </div>
        )}

        {orderType === OrderType.Delivery && (
          <div className="checkout-section">
            <label className="checkout-label">მისამართი *</label>
            <input
              type="text"
              className={`checkout-input ${errors.customerAddress ? 'input-error' : ''}`}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="მიტანის მისამართი"
            />
            {errors.customerAddress && <span className="error-text">{errors.customerAddress}</span>}
          </div>
        )}

        <div className="checkout-section">
          <label className="checkout-label">შენიშვნა</label>
          <textarea
            className="checkout-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="დამატებითი ინფორმაცია..."
          />
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h3>შეკვეთის შეჯამება</h3>
          <div className="summary-items">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="summary-item">
                <span className="summary-item-name">
                  {item.nameKa} x{item.quantity}
                </span>
                <span className="summary-item-price">
                  &#8382;{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>სულ:</span>
            <span>&#8382;{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="checkout-submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'იგზავნება...' : 'შეკვეთის გაგზავნა'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;
