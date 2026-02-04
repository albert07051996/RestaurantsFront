import React, { useEffect, useState } from 'react';
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDish, setSelectedDish] = useState<MenuItem | CartItem | null>(null);
  const [comment, setComment] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<DishCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'https://localhost:61015/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE}/Dish`),
          fetch(`${API_BASE}/DishCategory`)
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

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? `${category.nameKa} • ${category.nameEn}` : 'სხვა';
  };

  const addToCart = (item: MenuItem, itemComment: string = '') => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id && cartItem.cartComment === itemComment);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id && cartItem.cartComment === itemComment
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, cartComment: itemComment }]);
    }
  };

  const updateCartItem = (item: CartItem, newComment: string) => {
    setCart(cart.map(cartItem =>
      cartItem.id === item.id && cartItem.cartComment === item.cartComment
        ? { ...cartItem, cartComment: newComment }
        : cartItem
    ));
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
  };

  const handleModalClose = () => {
    setSelectedDish(null);
    setComment('');
  };

  const handleAddOrUpdate = () => {
    if (selectedDish && 'cartComment' in selectedDish) {
      updateCartItem(selectedDish, comment);
    } else if (selectedDish) {
      addToCart(selectedDish, comment);
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
        </nav>
      </header>

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

              <div className="modal-footer">
                <span className="modal-price">₾{selectedDish.price}</span>

                <button
                  onClick={handleAddOrUpdate}
                  className="modal-add-button"
                >
                  {'cartComment' in selectedDish ? 'ცვლილების შეტანა' : '➕ დამატება შეკვეთაში'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
};

export default RestaurantMenu;
