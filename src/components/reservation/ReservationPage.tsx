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
  descriptionEn: string;
  price: number;
  dishCategoryId: string;
  preparationTimeMinutes: number;
  calories: number;
  spicyLevel: number;
  ingredients: string;
  ingredientsEn: string;
  volume: string;
  alcoholContent: string;
  isVeganDish: boolean;
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
  comment: string;
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
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [modalComment, setModalComment] = useState('');
  const [modalQuantity, setModalQuantity] = useState(1);

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

  const getTotalQtyForDish = (dishId: string): number => {
    return preOrderItems
      .filter(p => p.dish.id === dishId)
      .reduce((sum, p) => sum + p.quantity, 0);
  };

  const handleDishClick = (dish: MenuItem) => {
    setSelectedDish(dish);
    setEditingItemIndex(null);
    setModalComment('');
    setModalQuantity(1);
  };

  const handleEditItem = (index: number) => {
    const item = preOrderItems[index];
    setSelectedDish(item.dish);
    setEditingItemIndex(index);
    setModalComment(item.comment);
    setModalQuantity(item.quantity);
  };

  const handleRemoveItem = (index: number) => {
    setPreOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleModalClose = () => {
    setSelectedDish(null);
    setEditingItemIndex(null);
    setModalComment('');
    setModalQuantity(1);
  };

  const handleModalAdd = () => {
    if (!selectedDish) return;
    if (editingItemIndex !== null) {
      setPreOrderItems(prev => prev.map((p, i) =>
        i === editingItemIndex
          ? { ...p, quantity: modalQuantity, comment: modalComment }
          : p
      ));
    } else {
      setPreOrderItems(prev => [...prev, { dish: selectedDish, quantity: modalQuantity, comment: modalComment }]);
    }
    handleModalClose();
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
                        {category ? `${category.nameKa} • ${category.nameEn}` : 'სხვა'}
                      </h3>
                      <div className="preorder-items-list">
                        {items.map(dish => {
                          const totalQty = getTotalQtyForDish(dish.id);
                          return (
                            <div
                              key={dish.id}
                              className={`preorder-dish-card ${totalQty > 0 ? 'selected' : ''}`}
                              onClick={() => handleDishClick(dish)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="preorder-dish-grid">
                                <div className="preorder-dish-image-container">
                                  <img
                                    src={dish.imageUrl}
                                    alt={dish.nameKa}
                                    className="preorder-dish-image"
                                  />
                                  {dish.spicyLevel > 0 && (
                                    <div className="preorder-spicy-badge">
                                      {'🌶️'.repeat(dish.spicyLevel)}
                                    </div>
                                  )}
                                  {totalQty > 0 && (
                                    <div className="preorder-qty-badge">{totalQty}</div>
                                  )}
                                </div>
                                <div className="preorder-dish-content">
                                  <h4>{dish.nameKa} • {dish.nameEn}</h4>
                                  <p className="preorder-dish-description">{dish.descriptionKa}</p>
                                  <div className="preorder-dish-info">
                                    <span>⏱️ {dish.preparationTimeMinutes} წუთი</span>
                                    <span>🔥 {dish.calories} kcal</span>
                                    <span className="preorder-dish-price">₾{dish.price}</span>
                                  </div>
                                  <div className="preorder-dish-actions">
                                    <button
                                      type="button"
                                      className="preorder-add-btn"
                                      onClick={(e) => { e.stopPropagation(); handleDishClick(dish); }}
                                    >
                                      ➕ დამატება
                                    </button>
                                  </div>
                                </div>
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
                    {preOrderItems.map((p, index) => (
                      <div key={`${p.dish.id}-${index}`} className="preorder-cart-item">
                        <div className="preorder-cart-item-info">
                          <span>{p.dish.nameKa} x{p.quantity}</span>
                          {p.comment && <div className="preorder-cart-comment">💬 {p.comment}</div>}
                        </div>
                        <div className="preorder-cart-item-right">
                          <span>&#8382;{(p.dish.price * p.quantity).toFixed(2)}</span>
                          <div className="preorder-cart-item-actions">
                            <button
                              type="button"
                              className="preorder-cart-edit-btn"
                              onClick={() => handleEditItem(index)}
                            >✎</button>
                            <button
                              type="button"
                              className="preorder-cart-remove-btn"
                              onClick={() => handleRemoveItem(index)}
                            >✕</button>
                          </div>
                        </div>
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

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div className="res-modal-overlay" onClick={handleModalClose}>
          <div className="res-modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={handleModalClose} className="res-modal-close">✕</button>

            <img
              src={selectedDish.imageUrl}
              alt={selectedDish.nameKa}
              className="res-modal-image"
            />

            <div className="res-modal-body">
              <h2>{selectedDish.nameKa} • {selectedDish.nameEn}</h2>
              <p className="res-modal-description">{selectedDish.descriptionKa}</p>

              <div className="res-modal-ingredients">
                <h3>📋 ინგრედიენტები:</h3>
                <div className="res-modal-ingredients-list">
                  {selectedDish.ingredients.split(',').map((ing, idx) => (
                    <span key={idx} className="res-ingredient-tag">{ing.trim()}</span>
                  ))}
                </div>
              </div>

              <div className="res-modal-info-grid">
                <div><strong>⏱️ მომზადების დრო:</strong> {selectedDish.preparationTimeMinutes} წუთი</div>
                <div><strong>🔥 კალორია:</strong> {selectedDish.calories} kcal</div>
                {selectedDish.volume && <div><strong>🍷 მოცულობა:</strong> {selectedDish.volume}</div>}
                {selectedDish.alcoholContent === 'true' && <div><strong>🍾 ალკოჰოლი:</strong> კი</div>}
              </div>

              <div className="res-modal-comment-section">
                <h3>💬 კომენტარი:</h3>
                <textarea
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  placeholder="დაწერეთ თქვენი კომენტარი..."
                  className="res-modal-textarea"
                />
              </div>

              <div className="res-modal-quantity-section">
                <h3>რაოდენობა:</h3>
                <div className="res-modal-quantity-controls">
                  <button
                    type="button"
                    className="res-modal-qty-btn"
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  >-</button>
                  <input
                    type="number"
                    className="res-modal-qty-input"
                    value={modalQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) setModalQuantity(val);
                    }}
                    min="1"
                  />
                  <button
                    type="button"
                    className="res-modal-qty-btn"
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                  >+</button>
                </div>
              </div>

              <div className="res-modal-footer">
                <span className="res-modal-price">₾{(selectedDish.price * modalQuantity).toFixed(2)}</span>
                <button type="button" onClick={handleModalAdd} className="res-modal-add-button">
                  {editingItemIndex !== null ? 'ცვლილების შეტანა' : `➕ დამატება (${modalQuantity})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
};

export default ReservationPage;
