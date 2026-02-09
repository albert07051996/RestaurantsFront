import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReservation, clearReservationError, clearSelectedReservation } from '../../store/reservationSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { ReservationItemRequest } from '../../types/reservation';
import { API_BASE_URL } from '../../config/api';
import './ReservationPage.css';

interface MenuItem {
  id: string;
  nameKa: string;
  nameEn: string;
  descriptionKa: string;
  price: number;
  dishCategoryId: string;
  imageUrl: string;
}

interface DishCategory {
  id: string;
  nameKa: string;
  nameEn: string;
}

interface PreOrderItem {
  dish: MenuItem;
  quantity: number;
}

const ReservationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, selectedReservation } = useSelector((state: RootState) => state.reservation);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [tableNumber, setTableNumber] = useState(1);
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(clearReservationError());
    dispatch(clearSelectedReservation());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Dish`),
          fetch(`${API_BASE_URL}/DishCategory`)
        ]);
        if (dishesRes.ok) setMenuItems(await dishesRes.json());
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setMenuLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const uniqueCategoryIds = useMemo(() =>
    [...new Set(menuItems.map(item => item.dishCategoryId))],
    [menuItems]
  );

  const getPreOrderQty = (dishId: string): number => {
    return preOrderItems.find(p => p.dish.id === dishId)?.quantity || 0;
  };

  const updatePreOrder = (dish: MenuItem, delta: number) => {
    setPreOrderItems(prev => {
      const existing = prev.find(p => p.dish.id === dish.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(p => p.dish.id !== dish.id);
        return prev.map(p => p.dish.id === dish.id ? { ...p, quantity: newQty } : p);
      }
      if (delta > 0) return [...prev, { dish, quantity: delta }];
      return prev;
    });
  };

  const preOrderTotal = useMemo(() =>
    preOrderItems.reduce((sum, p) => sum + p.dish.price * p.quantity, 0),
    [preOrderItems]
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) errors.customerName = 'სახელი აუცილებელია';
    if (!customerPhone.trim()) {
      errors.customerPhone = 'ტელეფონი აუცილებელია';
    } else if (!/^(\+995)?5\d{8}$/.test(customerPhone.trim())) {
      errors.customerPhone = 'არასწორი ტელეფონის ფორმატი (მაგ: 5XXXXXXXX)';
    }
    if (!reservationDate) errors.reservationDate = 'თარიღი აუცილებელია';
    if (!reservationTime) errors.reservationTime = 'დრო აუცილებელია';
    if (guestCount < 1) errors.guestCount = 'სტუმრების რაოდენობა მინიმუმ 1';
    if (tableNumber < 1) errors.tableNumber = 'მაგიდის ნომერი მინიმუმ 1';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const items: ReservationItemRequest[] = preOrderItems.map(p => ({
      dishId: p.dish.id,
      quantity: p.quantity,
    }));

    const result = await dispatch(createReservation({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      reservationDate,
      reservationTime,
      guestCount,
      tableNumber,
      notes: notes.trim() || null,
      items,
    }));

    if (createReservation.fulfilled.match(result)) {
      setSubmitted(true);
    }
  };

  const handleNewReservation = () => {
    setSubmitted(false);
    setCustomerName('');
    setCustomerPhone('');
    setReservationDate('');
    setReservationTime('');
    setGuestCount(2);
    setTableNumber(1);
    setNotes('');
    setPreOrderItems([]);
    setFormErrors({});
    dispatch(clearSelectedReservation());
    dispatch(clearReservationError());
  };

  if (submitted && selectedReservation) {
    return (
      <div className="reservation-container">
        <header className="reservation-header">
          <h1>მაგიდის დაჯავშნა</h1>
          <p>TABLE RESERVATION</p>
          <div className="reservation-header-nav">
            <a href="/" className="reservation-header-link">მენიუ</a>
          </div>
        </header>
        <div className="reservation-body">
          <div className="reservation-success">
            <h2>ჯავშანი წარმატებით შეიქმნა!</h2>
            <div className="res-number">{selectedReservation.reservationNumber}</div>
            <p>თქვენი ჯავშანი მიღებულია. გთხოვთ შეინახოთ ჯავშნის ნომერი.</p>

            <div className="reservation-success-details">
              <div className="detail-row">
                <span className="label">სახელი:</span>
                <span className="value">{selectedReservation.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="label">ტელეფონი:</span>
                <span className="value">{selectedReservation.customerPhone}</span>
              </div>
              <div className="detail-row">
                <span className="label">თარიღი:</span>
                <span className="value">{new Date(selectedReservation.reservationDate).toLocaleDateString('ka-GE')}</span>
              </div>
              <div className="detail-row">
                <span className="label">დრო:</span>
                <span className="value">{selectedReservation.reservationTime}</span>
              </div>
              <div className="detail-row">
                <span className="label">სტუმრები:</span>
                <span className="value">{selectedReservation.guestCount}</span>
              </div>
              <div className="detail-row">
                <span className="label">მაგიდა:</span>
                <span className="value">#{selectedReservation.tableNumber}</span>
              </div>
              {selectedReservation.items.length > 0 && (
                <div className="detail-row">
                  <span className="label">წინასწარი შეკვეთა:</span>
                  <span className="value">&#8382;{selectedReservation.totalAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button className="reservation-new-btn" onClick={handleNewReservation}>
              ახალი ჯავშანი
            </button>
          </div>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet" />
      </div>
    );
  }

  return (
    <div className="reservation-container">
      <header className="reservation-header">
        <h1>მაგიდის დაჯავშნა</h1>
        <p>TABLE RESERVATION</p>
        <div className="reservation-header-nav">
          <a href="/" className="reservation-header-link">მენიუ</a>
        </div>
      </header>

      <div className="reservation-body">
        {error && <div className="reservation-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Reservation Details */}
          <div className="reservation-form-section">
            <h2>ჯავშნის დეტალები</h2>
            <div className="reservation-form-grid">
              <div className="reservation-form-group">
                <label>სახელი *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="თქვენი სახელი"
                  maxLength={100}
                />
                {formErrors.customerName && <span className="form-error">{formErrors.customerName}</span>}
              </div>

              <div className="reservation-form-group">
                <label>ტელეფონი *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="5XXXXXXXX"
                  maxLength={20}
                />
                {formErrors.customerPhone && <span className="form-error">{formErrors.customerPhone}</span>}
              </div>

              <div className="reservation-form-group">
                <label>თარიღი *</label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  min={todayStr}
                />
                {formErrors.reservationDate && <span className="form-error">{formErrors.reservationDate}</span>}
              </div>

              <div className="reservation-form-group">
                <label>დრო *</label>
                <input
                  type="time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                />
                {formErrors.reservationTime && <span className="form-error">{formErrors.reservationTime}</span>}
              </div>

              <div className="reservation-form-group">
                <label>სტუმრების რაოდენობა *</label>
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  min={1}
                  max={50}
                />
                {formErrors.guestCount && <span className="form-error">{formErrors.guestCount}</span>}
              </div>

              <div className="reservation-form-group">
                <label>მაგიდის ნომერი *</label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                  min={1}
                />
                {formErrors.tableNumber && <span className="form-error">{formErrors.tableNumber}</span>}
              </div>

              <div className="reservation-form-group full-width">
                <label>შენიშვნა</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="დამატებითი მოთხოვნები ან შენიშვნა..."
                  maxLength={1000}
                />
              </div>
            </div>
          </div>

          {/* Pre-order Section */}
          <div className="preorder-section">
            <h2>წინასწარი შეკვეთა</h2>
            <p className="preorder-subtitle">სურვილის შემთხვევაში, წინასწარ შეუკვეთეთ კერძები</p>

            {menuLoading ? (
              <p style={{ color: '#888', textAlign: 'center' }}>მენიუ იტვირთება...</p>
            ) : (
              <>
                {uniqueCategoryIds.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId);
                  const items = menuItems.filter(m => m.dishCategoryId === categoryId);
                  if (items.length === 0) return null;

                  return (
                    <div key={categoryId}>
                      <h3 className="preorder-category-title">
                        {category ? `${category.nameKa} / ${category.nameEn}` : 'სხვა'}
                      </h3>
                      <div className="preorder-items-grid">
                        {items.map(dish => {
                          const qty = getPreOrderQty(dish.id);
                          return (
                            <div key={dish.id} className={`preorder-item-card ${qty > 0 ? 'selected' : ''}`}>
                              <div className="preorder-item-name">{dish.nameKa}</div>
                              <div className="preorder-item-name-en">{dish.nameEn}</div>
                              <div className="preorder-item-price">&#8382;{dish.price}</div>
                              <div className="preorder-item-controls">
                                <button
                                  type="button"
                                  className="preorder-qty-btn"
                                  onClick={() => updatePreOrder(dish, -1)}
                                  disabled={qty === 0}
                                >-</button>
                                <span className="preorder-qty-display">{qty}</span>
                                <button
                                  type="button"
                                  className="preorder-qty-btn"
                                  onClick={() => updatePreOrder(dish, 1)}
                                >+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {preOrderItems.length > 0 && (
                  <div className="preorder-cart-summary">
                    <h3>წინასწარი შეკვეთა</h3>
                    {preOrderItems.map(p => (
                      <div key={p.dish.id} className="preorder-cart-item">
                        <span>{p.dish.nameKa} x{p.quantity}</span>
                        <span>&#8382;{(p.dish.price * p.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="preorder-cart-total">
                      <span>ჯამი:</span>
                      <span>&#8382;{preOrderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            type="submit"
            className="reservation-submit-btn"
            disabled={loading}
          >
            {loading ? 'იგზავნება...' : 'ჯავშნის გაგზავნა'}
          </button>
        </form>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
};

export default ReservationPage;
