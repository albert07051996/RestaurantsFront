import React, { useState } from 'react';
import './RestaurantMenu.css';

interface MenuItem {
  id: number;
  category: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: string;
  video: string;
  ingredients: string[];
  allergens: string[];
  preparationTime: string;
  spicyLevel: number;
  calories: number;
  volume?: string;
  alcoholContent?: string;
  temperature?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const RestaurantMenu: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  // const menuItems: MenuItem[] = [
  //   // ... (menuItems array remains the same)
  // ];
  
  const menuItems = [
    {
      id: 1,
      category: 'ცხელი კერძები • Hot Dishes',
      name: 'ხინკალი • Khinkali',
      nameEn: 'Khinkali',
      description: 'ტრადიციული ქართული ხინკალი, ხორცითა და არომატული სანელებლებით სავსე. ჩვენი ხინკალი მზადდება ხელით, ყოველდღიურად ახალი ცომით. შიგნით ხორცი, ხახვი, ნიორი და სხვა სანელებლები ქმნის უნიკალურ გემოს.',
      descriptionEn: 'Traditional Georgian dumplings filled with spiced meat and herbs. Our khinkali are handmade daily with fresh dough. Inside, the meat, onions, garlic and spices create a unique flavor that bursts in your mouth.',
      price: 15,
      image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800',
      video: 'https://player.vimeo.com/video/placeholder',
      ingredients: ['ხორცი', 'ხახვი', 'ნიორი', 'კინზა', 'წიწაკა'],
      allergens: ['გლუტენი'],
      preparationTime: '20 წუთი',
      spicyLevel: 2,
      calories: 280
    },
    {
      id: 2,
      category: 'ცხელი კერძები • Hot Dishes',
      name: 'ხაჭაპური აჭარული • Khachapuri Adjaruli',
      nameEn: 'Khachapuri Adjaruli',
      description: 'აჭარული ხაჭაპური - ნავის ფორმის პური, სავსე გამდნარი ყველით, კვერცხით და კარაქით. დამზადებულია ხელით, გამოცხობილია ტრადიციული ქართული ღუმელში. ცხელი ყველი და მოთელილი კვერცხი ქმნის შესანიშნავ შერწყმას.',
      descriptionEn: 'Adjarian khachapuri - boat-shaped bread filled with melted cheese, egg and butter. Handmade and baked in a traditional Georgian oven. The hot cheese and soft egg create a wonderful combination.',
      price: 18,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
      video: '',
      ingredients: ['პური', 'სულგუნის ყველი', 'იმერული ყველი', 'კვერცხი', 'კარაქი'],
      allergens: ['გლუტენი', 'რძის პროდუქტები', 'კვერცხი'],
      preparationTime: '25 წუთი',
      spicyLevel: 0,
      calories: 520
    },
    {
      id: 3,
      category: 'ცხელი კერძები • Hot Dishes',
      name: 'ოჯახური • Ojakhuri',
      nameEn: 'Ojakhuri',
      description: 'ტრადიციული ქართული კერძი - შემწვარი ღორის ხორცი კარტოფილთან და ხახვთან ერთად. მოხარშული სპეციალურ ტაფაში, ქართული სანელებლებითა და მწვანილით. იდეალურია ქართული ღვინის ან ლუდის თანხლებით.',
      descriptionEn: 'Traditional Georgian dish - pan-fried pork with potatoes and onions. Cooked in a special pan with Georgian spices and herbs. Perfect with Georgian wine or beer.',
      price: 25,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      video: '',
      ingredients: ['ღორის ხორცი', 'კარტოფილი', 'ხახვი', 'წიწაკა', 'სანელებლები'],
      allergens: [],
      preparationTime: '30 წუთი',
      spicyLevel: 1,
      calories: 680
    },
    {
      id: 4,
      category: 'ცხელი კერძები • Hot Dishes',
      name: 'მწვადი • Mtsvadi',
      nameEn: 'Mtsvadi',
      description: 'ქართული მწვადი - ღორის ან საქონლის ხორცი, მარინირებული ბროწეულის წვენში, ღვინოსა და სანელებლებში. შემწვარი ღია ცეცხლზე, ტრადიციული ხერხით. მოწოდებულია ახალი ხახვით და ნარშარაბით.',
      descriptionEn: 'Georgian kebab - pork or beef marinated in pomegranate juice, wine and spices. Grilled over open fire in traditional style. Served with fresh onions and pomegranate sauce.',
      price: 28,
      image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800',
      video: '',
      ingredients: ['ხორცი', 'ბროწეული', 'ღვინო', 'ხახვი', 'სანელებლები'],
      allergens: [],
      preparationTime: '35 წუთი',
      spicyLevel: 2,
      calories: 450
    },
    {
      id: 5,
      category: 'სალათები • Salads',
      name: 'ქართული სალათი • Georgian Salad',
      nameEn: 'Georgian Salad',
      description: 'ახალი ბოსტნეული სალათი - პომიდორი, კიტრი, ხახვი, უნგრა და მწვანილი. დაფრქვეული გაუხეშებელი მცენარეული ზეთით და ზოგიერთი ნიგვზით. მარტივი მაგრამ არომატული და ჯანსაღი არჩევანი.',
      descriptionEn: 'Fresh vegetable salad - tomatoes, cucumbers, onions, walnuts and herbs. Dressed with unrefined vegetable oil. Simple but aromatic and healthy choice.',
      price: 12,
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
      video: '',
      ingredients: ['პომიდორი', 'კიტრი', 'ხახვი', 'უნგრა', 'ზეთი', 'კინზა'],
      allergens: ['უნგრა'],
      preparationTime: '10 წუთი',
      spicyLevel: 0,
      calories: 180
    },
    {
      id: 6,
      category: 'სალათები • Salads',
      name: 'ლობიო • Lobio',
      nameEn: 'Lobio',
      description: 'ტრადიციული ქართული ლობიო - წითელი ლობიო მოხარშული ხახვთან, ნიორთან, კინზასთან და გაუხეშებელ უნგრასთან. მოწოდებულია თბილად, მჭადის პურთან ერთად. მდიდარი ცილების წყარო და უგემრიელესი კერძი.',
      descriptionEn: 'Traditional Georgian lobio - red kidney beans cooked with onions, garlic, coriander and ground walnuts. Served warm with cornbread. Rich source of protein and delicious dish.',
      price: 14,
      image: 'https://images.unsplash.com/photo-1596097635667-1f36c4be241d?w=800',
      video: '',
      ingredients: ['ლობიო', 'ხახვი', 'ნიორი', 'უნგრა', 'კინზა'],
      allergens: ['უნგრა'],
      preparationTime: '40 წუთი',
      spicyLevel: 1,
      calories: 320
    },
    {
      id: 7,
      category: 'დესერტები • Desserts',
      name: 'ჩურჩხელა • Churchkhela',
      nameEn: 'Churchkhela',
      description: 'ტრადიციული ქართული სამკურნალო - უნგრა შეჭედილი ყურძნის ან ბროწეულის წვენში. ბუნებრივი და ჯანსაღი სიტკბო, დამზადებული ხელით. მდიდარია ვიტამინებითა და ენერგიით.',
      descriptionEn: 'Traditional Georgian candy - walnuts threaded on string and dipped in grape or pomegranate juice. Natural and healthy sweetness, handmade. Rich in vitamins and energy.',
      price: 8,
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800',
      video: '',
      ingredients: ['უნგრა', 'ყურძნის წვენი', 'ფქვილი'],
      allergens: ['უნგრა'],
      preparationTime: 'მზა პროდუქტი',
      spicyLevel: 0,
      calories: 250
    },
    {
      id: 8,
      category: 'სასმელები • Beverages',
      name: 'საფერავი • Saperavi Wine',
      nameEn: 'Saperavi Red Wine',
      description: 'ქართული წითელი ღვინო საფერავის ჯიშისგან. მოყვანილია კახეთის რეგიონში, ქართული ტრადიციული მეთოდით. ინტენსიური წითელი ფერი, მდიდარი გემო და არომატი.',
      descriptionEn: 'Georgian red wine from Saperavi grape. Produced in Kakheti region using traditional Georgian method. Intense red color, rich taste and aroma.',
      price: 12,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
      video: '',
      ingredients: ['ყურძენი საფერავი'],
      allergens: ['სულფიტები'],
      preparationTime: 'მზა პროდუქტი',
      spicyLevel: 0,
      calories: 180,
      volume: '150მლ',
      alcoholContent: '12-14%',
      temperature: '16-18°C'
    }
  ];


  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="menu-container">
      {/* Header */}
      <header className="header">
        <h1>სუფრა</h1>
        <p>GEORGIAN CULINARY EXPERIENCE</p>
      </header>

      <div className="grid-container">
        
        {/* Left Sidebar - Categories */}
        <aside className="sidebar">
          <h3>კატეგორიები</h3>
          {categories.map((category, idx) => (
            <button
              key={idx}
              className="category-button"
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(193, 154, 107, 0.2))';
                (e.target as HTMLElement).style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(193, 154, 107, 0.1))';
                (e.target as HTMLElement).style.transform = 'translateX(0)';
              }}
            >
              {category}
            </button>
          ))}
        </aside>

        {/* Main Content - Menu Items */}
        <main className="main">
          {categories.map((category) => (
            <section key={category}>
              <h2>{category}</h2>
              
              <div>
                {menuItems
                  .filter(item => item.category === category)
                  .map((item) => (
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
                      onClick={() => setSelectedDish(item)}
                    >
                      <div className="menu-item-grid">
                        {/* Image */}
                        <div className="menu-item-image-container">
                          <img
                            src={item.image}
                            alt={item.name}
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
                          <h3>{item.name}</h3>

                          <p className="menu-item-description">{item.description}</p>

                          {/* Info Grid */}
                          <div className="info-grid">
                            <div>
                              <strong>⏱️ დრო:</strong> {item.preparationTime}
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
          ))}
        </main>

        {/* Right Sidebar - Cart */}
        <aside className="cart-sidebar">
          <h3>🛒 თქვენი შეკვეთა</h3>

          {cart.length === 0 ? (
            <p className="empty-cart">შეკვეთა ცარიელია</p>
          ) : (
            <>
              <div>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="cart-item"
                  >
                    <div className="cart-item-header">
                      <h4>{item.nameEn}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-button"
                      >✕</button>
                    </div>

                    <div className="quantity-controls">
                      <div className="quantity-buttons">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="quantity-button"
                        >-</button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
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

      {/* Detailed Dish Modal */}
      {selectedDish && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDish(null)}
              className="modal-close"
            >✕</button>

            <img
              src={selectedDish.image}
              alt={selectedDish.name}
              className="modal-image"
            />

            <div className="modal-body">
              <h2>{selectedDish.name}</h2>

              <p className="modal-description">{selectedDish.description}</p>

              <div className="ingredients-section">
                <h3>📋 ინგრედიენტები:</h3>
                <div>
                  {selectedDish.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="ingredient-tag"
                    >{ing}</span>
                  ))}
                </div>
              </div>

              {selectedDish.allergens.length > 0 && (
                <div className="allergens-warning">
                  <strong>⚠️ ალერგენები:</strong> {selectedDish.allergens.join(', ')}
                </div>
              )}

              <div className="modal-info-grid">
                <div><strong>⏱️ მომზადების დრო:</strong> {selectedDish.preparationTime}</div>
                <div><strong>🔥 კალორია:</strong> {selectedDish.calories} kcal</div>
                {selectedDish.volume && <div><strong>🍷 მოცულობა:</strong> {selectedDish.volume}</div>}
                {selectedDish.alcoholContent && <div><strong>🍾 ალკოჰოლი:</strong> {selectedDish.alcoholContent}</div>}
              </div>

              <div className="modal-footer">
                <span className="modal-price">₾{selectedDish.price}</span>
                
                <button
                  onClick={() => {
                    addToCart(selectedDish);
                    setSelectedDish(null);
                  }}
                  className="modal-add-button"
                >
                  ➕ დამატება შეკვეთაში
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