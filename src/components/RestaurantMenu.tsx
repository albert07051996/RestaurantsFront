import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { API_BASE_URL, apiClient } from '../config/api';
import CheckoutModal from './orders/CheckoutModal';
import type { TableSessionResponse } from '../types/session';
import './RestaurantMenu.css';

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
  comment: string;
  imageUrl: string;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  cartComment: string;
}

interface DishCategory {
  id: string;
  nameKa: string;
  nameEn: string;
}

const RestaurantMenu: React.FC = () => {
  const [searchParams] = useSearchParams();
  const qrTable = useMemo(() => {
    const t = searchParams.get('table');
    if (t && /^\d+$/.test(t) && parseInt(t) >= 1) return parseInt(t);
    // Also check localStorage for previously scanned table
    const stored = localStorage.getItem('tableSessionTable');
    if (stored && /^\d+$/.test(stored)) return parseInt(stored);
    return null;
  }, [searchParams]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDish, setSelectedDish] = useState<MenuItem | CartItem | null>(null);
  const [comment, setComment] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [activeSession, setActiveSession] = useState<TableSessionResponse | null>(null);
  const [showSessionOrders, setShowSessionOrders] = useState(!!qrTable);

  // Handle table change from URL — clear old session if table changed
  useEffect(() => {
    const urlTable = searchParams.get('table');
    if (urlTable && /^\d+$/.test(urlTable) && parseInt(urlTable) >= 1) {
      const storedTable = localStorage.getItem('tableSessionTable');
      // If table number changed, clear old session data
      if (storedTable && storedTable !== urlTable) {
        localStorage.removeItem('tableSessionId');
        localStorage.removeItem('tableSessionCustomer');
        localStorage.removeItem('tableSessionPhone');
        setActiveSession(null);
      }
      localStorage.setItem('tableSessionTable', urlTable);
    }
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const loadSession = useCallback(async () => {
    // First try by stored session ID — but only if it matches current table
    const sessionId = localStorage.getItem('tableSessionId');
    if (sessionId) {
      try {
        const res = await apiClient.get<TableSessionResponse>(`/TableSession/${sessionId}`);
        if (res.data.status === 'Closed') {
          localStorage.removeItem('tableSessionId');
          localStorage.removeItem('tableSessionCustomer');
          localStorage.removeItem('tableSessionPhone');
          localStorage.removeItem('tableSessionTable');
          setActiveSession(null);
          return;
        }
        // Verify session matches current table (if QR mode)
        if (qrTable && res.data.tableNumber !== qrTable) {
          // Session is for different table — clear and search for correct one
          localStorage.removeItem('tableSessionId');
          localStorage.removeItem('tableSessionCustomer');
          localStorage.removeItem('tableSessionPhone');
        } else {
          setActiveSession(res.data);
          return;
        }
      } catch {
        localStorage.removeItem('tableSessionId');
      }
    }

    // Try to find active session by table number (QR scan case)
    if (qrTable) {
      try {
        const res = await apiClient.get<TableSessionResponse>(`/TableSession/table/${qrTable}/active`);
        // Found active session for this table — link it
        localStorage.setItem('tableSessionId', res.data.id);
        localStorage.setItem('tableSessionCustomer', res.data.customerName);
        localStorage.setItem('tableSessionPhone', res.data.customerPhone);
        localStorage.setItem('tableSessionTable', String(res.data.tableNumber));
        setActiveSession(res.data);
        return;
      } catch {
        // No active session for this table yet — that's ok
      }
    }

    setActiveSession(null);
  }, [qrTable]);

  useEffect(() => {
    loadSession();
    const interval = setInterval(loadSession, 15000);
    return () => clearInterval(interval);
  }, [loadSession]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Dish`),
          fetch(`${API_BASE_URL}/DishCategory`)
        ]);

        if (dishesRes.ok) {
          const dishes = await dishesRes.json();
          setMenuItems(dishes);
        }

        if (categoriesRes.ok) {
          const cats = await categoriesRes.json();
          setCategories(cats);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = (item: MenuItem, itemComment: string = '', qty: number = 1) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id && cartItem.cartComment === itemComment);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id && cartItem.cartComment === itemComment
          ? { ...cartItem, quantity: cartItem.quantity + qty }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: qty, cartComment: itemComment }]);
    }
  };

  const removeFromCart = (itemId: string, itemComment: string) => {
    setCart(cart.filter(item => !(item.id === itemId && item.cartComment === itemComment)));
  };

  const updateQuantity = (itemId: string, itemComment: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId, itemComment);
    } else {
      setCart(cart.map(item =>
        item.id === itemId && item.cartComment === itemComment ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const uniqueCategoryIds = [...new Set(menuItems.map(item => item.dishCategoryId))];

  const handleDishClick = (dish: MenuItem | CartItem) => {
    setSelectedDish(dish);
    setComment('cartComment' in dish ? dish.cartComment : '');
    setModalQuantity('cartComment' in dish ? dish.quantity : 1);
  };

  const handleModalClose = () => {
    setSelectedDish(null);
    setComment('');
    setModalQuantity(1);
  };

  const handleAddOrUpdate = () => {
    if (selectedDish && 'cartComment' in selectedDish) {
      // Update existing cart item: comment + quantity
      setCart(cart.map(cartItem =>
        cartItem.id === selectedDish.id && cartItem.cartComment === selectedDish.cartComment
          ? { ...cartItem, cartComment: comment, quantity: modalQuantity }
          : cartItem
      ));
    } else if (selectedDish) {
      addToCart(selectedDish, comment, modalQuantity);
    }
    handleModalClose();
  };

  const scrollToCategory = (categoryId: string) => {
    document.getElementById(`category-${categoryId}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="menu-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#d4af37', fontSize: '1.5rem' }}>იტვირთება...</p>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Header */}
      <header className="header">
        <h1>სუფრა</h1>
        <p>GEORGIAN CULINARY EXPERIENCE</p>
        {qrTable && (
          <div className="qr-table-indicator">
            მაგიდა #{qrTable}
          </div>
        )}
        <nav className="header-nav">
          {categories.map((category) => (
            <button
              key={category.id}
              className="header-nav-button"
              onClick={() => scrollToCategory(category.id)}
            >
              {category.nameKa}
            </button>
          ))}
          <a
            href="/reserve"
            className="header-nav-button"
            style={{ textDecoration: 'none', color: '#d4af37', border: '1px solid #d4af37' }}
          >
            მაგიდის დაჯავშნა
          </a>
        </nav>
      </header>

      {/* Table Orders Section — always visible in QR mode */}
      {qrTable && (
        <div className="table-orders-section">
          <div className="table-orders-header">
            <div className="table-orders-title">
              <span className="table-orders-badge">მაგიდა #{qrTable}</span>
              {activeSession && (
                <>
                  <span className="table-orders-count">{activeSession.orders.length} შეკვეთა</span>
                  <span className="table-orders-total">&#8382;{activeSession.totalAmount.toFixed(2)}</span>
                </>
              )}
            </div>
            {activeSession && activeSession.orders.length > 0 && (
              <button
                className="table-orders-toggle"
                onClick={() => setShowSessionOrders(!showSessionOrders)}
              >
                {showSessionOrders ? 'შეკვეთების დამალვა' : 'შეკვეთების ჩვენება'}
              </button>
            )}
          </div>

          {(!activeSession || activeSession.orders.length === 0) && (
            <div className="table-orders-empty">
              შეკვეთები ჯერ არ გაკეთებულა
            </div>
          )}

          {activeSession && activeSession.orders.length > 0 && showSessionOrders && (
            <div className="table-orders-list">
              {activeSession.orders.map((order) => {
                const statusSteps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];
                const statusLabelsMap: Record<string, string> = {
                  Pending: 'მოლოდინში',
                  Confirmed: 'დადასტურებულია',
                  Preparing: 'მზადდება',
                  Ready: 'მზადაა',
                  Delivered: 'მიტანილია',
                };
                const isCancelled = order.status === 'Cancelled';
                const currentStepIndex = statusSteps.indexOf(order.status);

                return (
                  <div key={order.id} className="table-order-card">
                    <div className="table-order-top">
                      <span className="table-order-number">#{order.orderNumber}</span>
                      <span className="table-order-time">
                        {new Date(order.createdAt).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Status Progress */}
                    {isCancelled ? (
                      <div className="table-order-cancelled">გაუქმებულია</div>
                    ) : (
                      <div className="table-order-progress">
                        {statusSteps.map((step, idx) => {
                          const isDone = idx < currentStepIndex;
                          const isCurrent = idx === currentStepIndex;
                          return (
                            <div key={step} className="progress-step-wrapper">
                              <div className={`progress-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                                {isDone ? '\u2713' : idx + 1}
                              </div>
                              <span className={`progress-label ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}>
                                {statusLabelsMap[step]}
                              </span>
                              {idx < statusSteps.length - 1 && (
                                <div className={`progress-line ${isDone ? 'done' : ''}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Items */}
                    <div className="table-order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="table-order-item-row">
                          <span className="table-order-item-name">{item.dishNameKa}</span>
                          <span className="table-order-item-qty">x{item.quantity}</span>
                          <span className="table-order-item-price">&#8382;{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="table-order-subtotal">
                      <span>ჯამი:</span>
                      <span>&#8382;{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}

              <div className="table-orders-grand-total">
                <span>სულ ჯამი:</span>
                <span>&#8382;{activeSession.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Session Banner — non-QR mode (manual DineIn) */}
      {!qrTable && activeSession && (
        <div className="session-banner">
          <div className="session-banner-info">
            <span className="session-badge">
              მაგიდა #{activeSession.tableNumber}
            </span>
            <span className="session-customer">{activeSession.customerName}</span>
            <span className="session-orders-count">
              {activeSession.orders.length} შეკვეთა
            </span>
            <span className="session-total">
              &#8382;{activeSession.totalAmount.toFixed(2)}
            </span>
          </div>
          <button
            className="session-view-btn"
            onClick={() => setShowSessionOrders(!showSessionOrders)}
          >
            {showSessionOrders ? 'დამალვა' : 'ჩემი შეკვეთები'}
          </button>
        </div>
      )}

      <div className="grid-container">

        {/* Left Sidebar - Categories */}
        <aside className="sidebar">
          <h3>კატეგორიები</h3>
          {categories.map((category) => (
            <button
              key={category.id}
              className="category-button"
              onClick={() => scrollToCategory(category.id)}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(193, 154, 107, 0.2))';
                (e.target as HTMLElement).style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(193, 154, 107, 0.1))';
                (e.target as HTMLElement).style.transform = 'translateX(0)';
              }}
            >
              {category.nameKa} • {category.nameEn}
            </button>
          ))}
        </aside>

        {/* Main Content - Menu Items */}
        <main className="main">
          {uniqueCategoryIds.map((categoryId) => {
            const category = categories.find(c => c.id === categoryId);
            const categoryItems = menuItems.filter(item => item.dishCategoryId === categoryId);

            if (categoryItems.length === 0) return null;

            return (
              <section key={categoryId} id={`category-${categoryId}`}>
                <h2>{category ? `${category.nameKa} • ${category.nameEn}` : 'სხვა'}</h2>

                <div>
                  {categoryItems.map((item) => (
                      <article
                        key={item.id}
                        className="menu-item"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 15px 40px rgba(212, 175, 55, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
                        }}
                        onClick={() => handleDishClick(item)}
                      >
                        <div className="menu-item-grid">
                          {/* Image */}
                          <div className="menu-item-image-container">
                            <img
                              src={item.imageUrl}
                              alt={item.nameKa}
                              className="menu-item-image"
                            />
                            {item.spicyLevel > 0 && (
                              <div className="spicy-badge">
                                {'🌶️'.repeat(item.spicyLevel)}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="menu-item-content">
                            <h3>{item.nameKa} • {item.nameEn}</h3>

                            <p className="menu-item-description">{item.descriptionKa}</p>

                            {/* Info Grid */}
                            <div className="info-grid">
                              <div>
                                <strong>⏱️ დრო:</strong> {item.preparationTimeMinutes} წუთი
                              </div>
                              <div>
                                <strong>🔥 კალორია:</strong> {item.calories} kcal
                              </div>
                              <div>
                                <strong>💰 ფასი:</strong> <span style={{ color: '#d4af37', fontSize: '1.2rem', fontWeight: 'bold' }}>₾{item.price}</span>
                              </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(item);
                              }}
                              className="add-to-cart-button"
                              onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.transform = 'scale(1.05)';
                                (e.target as HTMLElement).style.boxShadow = '0 5px 20px rgba(212, 175, 55, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.transform = 'scale(1)';
                                (e.target as HTMLElement).style.boxShadow = 'none';
                              }}
                            >
                              ➕ დამატება შეკვეთაში
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            );
          })}
        </main>

        {/* Right Sidebar - Cart */}
        <aside className="cart-sidebar">
          <h3>🛒 თქვენი შეკვეთა</h3>

          {cart.length === 0 ? (
            <p className="empty-cart">შეკვეთა ცარიელია</p>
          ) : (
            <>
              <div>
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${item.cartComment}-${index}`}
                    className="cart-item"
                    onClick={() => handleDishClick(item)}
                  >
                    <div className="cart-item-header">
                      <h4>{item.nameEn}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id, item.cartComment);
                        }}
                        className="remove-button"
                      >✕</button>
                    </div>

                    {item.cartComment && (
                      <p style={{ fontSize: '0.9rem', color: '#c19a6b', margin: '0.5rem 0' }}>
                        💬 {item.cartComment}
                      </p>
                    )}

                    <div className="quantity-controls">
                      <div className="quantity-buttons">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.id, item.cartComment, item.quantity - 1);
                          }}
                          className="quantity-button"
                        >-</button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.id, item.cartComment, item.quantity + 1);
                          }}
                          className="quantity-button"
                        >+</button>
                      </div>
                      <span className="cart-item-price">₾{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="cart-total">
                <div className="total-row">
                  <span>სულ:</span>
                  <span>₾{getTotalPrice().toFixed(2)}</span>
                </div>

                <button
                  className="checkout-button"
                  onClick={() => setShowCheckout(true)}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = 'scale(1.05)';
                    (e.target as HTMLElement).style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = 'scale(1)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  🍽️ შეკვეთა
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Footer */}
      <footer className="footer">
        <nav className="footer-nav">
          {categories.map((category) => (
            <button
              key={category.id}
              className="footer-nav-button"
              onClick={() => scrollToCategory(category.id)}
            >
              {category.nameKa}
            </button>
          ))}
        </nav>
      </footer>

      {/* Detailed Dish Modal */}
      {selectedDish && (
        <div
          className="modal-overlay"
          onClick={handleModalClose}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleModalClose}
              className="modal-close"
            >✕</button>

            <img
              src={selectedDish.imageUrl}
              alt={selectedDish.nameKa}
              className="modal-image"
            />

            <div className="modal-body">
              <h2>{selectedDish.nameKa} • {selectedDish.nameEn}</h2>

              <p className="modal-description">{selectedDish.descriptionKa}</p>

              <div className="ingredients-section">
                <h3>📋 ინგრედიენტები:</h3>
                <div>
                  {selectedDish.ingredients.split(',').map((ing, idx) => (
                    <span
                      key={idx}
                      className="ingredient-tag"
                    >{ing.trim()}</span>
                  ))}
                </div>
              </div>

              <div className="modal-info-grid">
                <div><strong>⏱️ მომზადების დრო:</strong> {selectedDish.preparationTimeMinutes} წუთი</div>
                <div><strong>🔥 კალორია:</strong> {selectedDish.calories} kcal</div>
                {selectedDish.volume && <div><strong>🍷 მოცულობა:</strong> {selectedDish.volume}</div>}
                {selectedDish.alcoholContent === 'true' && <div><strong>🍾 ალკოჰოლი:</strong> კი</div>}
              </div>

              {/* Comment Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>💬 კომენტარი:</h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="დაწერეთ თქვენი კომენტარი..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#f5f5f5',
                    fontSize: '1rem',
                    fontFamily: "'Cormorant Garamond', serif",
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </div>

              {/* Quantity Selector */}
              <div className="modal-quantity-section">
                <h3 style={{ color: '#d4af37', marginBottom: '1rem' }}>რაოდენობა:</h3>
                <div className="modal-quantity-controls">
                  <button
                    className="modal-qty-btn"
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  >-</button>
                  <input
                    type="number"
                    className="modal-qty-input"
                    value={modalQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) setModalQuantity(val);
                    }}
                    min="1"
                  />
                  <button
                    className="modal-qty-btn"
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                  >+</button>
                </div>
              </div>

              <div className="modal-footer">
                <span className="modal-price">₾{(selectedDish.price * modalQuantity).toFixed(2)}</span>

                <button
                  onClick={handleAddOrUpdate}
                  className="modal-add-button"
                >
                  {'cartComment' in selectedDish ? 'ცვლილების შეტანა' : `➕ დამატება (${modalQuantity})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        visible={showCheckout}
        cart={cart}
        qrTableNumber={qrTable}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => {
          setCart([]);
          localStorage.removeItem('cart');
          loadSession();
        }}
      />

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
};

export default RestaurantMenu;
