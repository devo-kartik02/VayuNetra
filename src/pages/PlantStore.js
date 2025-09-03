import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Star, Leaf, Truck, Shield, CreditCard, MapPin, Calendar, Phone, User, Mail, Home } from 'lucide-react';
import './PlantStore.css';

const PlantStore = () => {
  const [plants, setPlants] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Mock plant data
  useEffect(() => {
    const mockPlants = [
      {
        id: 1,
        name: 'Snake Plant',
        scientificName: 'Sansevieria trifasciata',
        price: 149.99,
        image: '/Images/snake.jpeg',
        category: 'indoor',
        rating: 4.8,
        reviews: 124,
        airPurifying: true,
        lowMaintenance: true,
        description: 'Perfect for beginners, removes formaldehyde and benzene from air',
        benefits: ['Releases oxygen at night', 'Low water requirements', 'Tolerates low light'],
        careLevel: 'Easy',
        lightRequirement: 'Low to bright indirect',
        waterFrequency: 'Every 2-3 weeks'
      },
      {
        id: 2,
        name: 'Peace Lily',
        scientificName: 'Spathiphyllum',
        price: 129.99,
        image: 'Images/peaceLily.jpeg',
        category: 'indoor',
        rating: 4.6,
        reviews: 89,
        airPurifying: true,
        lowMaintenance: false,
        description: 'Beautiful flowering plant that removes ammonia, benzene, and formaldehyde',
        benefits: ['Beautiful white flowers', 'Excellent air purifier', 'Indicates water needs'],
        careLevel: 'Moderate',
        lightRequirement: 'Medium to bright indirect',
        waterFrequency: 'Weekly'
      },
      {
        id: 3,
        name: 'Rubber Tree',
        scientificName: 'Ficus elastica',
        price: 189.99,
        image: '/Images/rubber.jpeg',
        category: 'indoor',
        rating: 4.7,
        reviews: 156,
        airPurifying: true,
        lowMaintenance: true,
        description: 'Large glossy leaves that effectively remove formaldehyde from indoor air',
        benefits: ['Fast-growing', 'Glossy attractive leaves', 'Easy propagation'],
        careLevel: 'Easy',
        lightRequirement: 'Bright indirect',
        waterFrequency: 'Weekly'
      },
      {
        id: 4,
        name: 'Lavender',
        scientificName: 'Lavandula angustifolia',
        price: 249.99,
        image: '/Images/lavender.jpeg',
        category: 'outdoor',
        rating: 4.9,
        reviews: 203,
        airPurifying: true,
        lowMaintenance: true,
        description: 'Aromatic herb that attracts pollinators and has calming properties',
        benefits: ['Attracts bees and butterflies', 'Natural fragrance', 'Drought tolerant'],
        careLevel: 'Easy',
        lightRequirement: 'Full sun',
        waterFrequency: 'Every 1-2 weeks'
      },
      {
        id: 5,
        name: 'Boston Fern',
        scientificName: 'Nephrolepis exaltata',
        price: 199.99,
        image: '/Images/fern.jpeg',
        category: 'indoor',
        rating: 4.4,
        reviews: 78,
        airPurifying: true,
        lowMaintenance: false,
        description: 'Lush fern that adds humidity and removes formaldehyde and xylene',
        benefits: ['Natural humidifier', 'Air purifying', 'Lush green foliage'],
        careLevel: 'Moderate',
        lightRequirement: 'Bright indirect',
        waterFrequency: '2-3 times per week'
      },
      {
        id: 6,
        name: 'Marigold',
        scientificName: 'Tagetes',
        price: 99.99,
        image: '/Images/marigold.jpeg',
        category: 'outdoor',
        rating: 4.5,
        reviews: 167,
        airPurifying: false,
        lowMaintenance: true,
        description: 'Colorful flowers that repel pests and attract beneficial insects',
        benefits: ['Pest deterrent', 'Bright colors', 'Long blooming period'],
        careLevel: 'Easy',
        lightRequirement: 'Full sun',
        waterFrequency: 'Daily during hot weather'
      }
    ];
    setPlants(mockPlants);
  }, []);

  const categories = [
    { id: 'all', name: 'All Plants', icon: Leaf },
    { id: 'indoor', name: 'Indoor Plants', icon: Home },
    { id: 'outdoor', name: 'Outdoor Plants', icon: MapPin }
  ];

  const filteredPlants = plants.filter(plant => {
    const matchesCategory = selectedCategory === 'all' || plant.category === selectedCategory;
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (plant) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === plant.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === plant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...plant, quantity: 1 }];
    });
  };

  const removeFromCart = (plantId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== plantId));
  };

  const updateQuantity = (plantId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(plantId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === plantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    // Simulate payment processing
    setTimeout(() => {
      setOrderPlaced(true);
      setCart([]);
      setShowCheckout(false);
    }, 2000);
  };

  return (
    <div className="plant-store-container">
      {/* Header */}
      <div className="store-header">
        <div className="header-content1">
          <h1>🌱 Plant Store & Plantation Services</h1>
          <p>Transform your space with air-purifying plants and contribute to a greener planet</p>
        </div>
        <div className="header-actions">
          <button 
            className="cart-btn"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart size={20} />
            Cart ({getTotalItems()})
            {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <category.icon size={18} />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredPlants.map(plant => (
          <div key={plant.id} className="plant-card">
            <div className="plant-image">
              <img src={plant.image} alt={plant.name} />
              <div className="plant-badges">
                {plant.airPurifying && <span className="badge air-purifying">Air Purifying</span>}
                {plant.lowMaintenance && <span className="badge low-maintenance">Low Maintenance</span>}
              </div>
            </div>
            <div className="plant-info">
              <h3 className="plant-name">{plant.name}</h3>
              <p className="plant-scientific">{plant.scientificName}</p>
              <div className="plant-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(plant.rating) ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
                <span className="rating-text">({plant.reviews} reviews)</span>
              </div>
              <p className="plant-description">{plant.description}</p>
              <div className="plant-details">
                <div className="detail-item">
                  <span className="detail-label">Care Level:</span>
                  <span className="detail-value">{plant.careLevel}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Light:</span>
                  <span className="detail-value">{plant.lightRequirement}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Water:</span>
                  <span className="detail-value">{plant.waterFrequency}</span>
                </div>
              </div>
              <div className="plant-benefits">
                {plant.benefits.slice(0, 2).map((benefit, index) => (
                  <span key={index} className="benefit-tag">✓ {benefit}</span>
                ))}
              </div>
            </div>
            <div className="plant-actions">
              <div className="price">Rs. {plant.price}</div>
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(plant)}
              >
                <Plus size={18} />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Shopping Cart</h2>
              <button onClick={() => setShowCart(false)}>×</button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={48} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Rs. {item.price}</p>
                    </div>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="item-total">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total: Rs. {getTotalPrice().toFixed(2)}</strong>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <div className="checkout-header">
              <h2>Checkout</h2>
              <button onClick={() => setShowCheckout(false)}>×</button>
            </div>
            <form onSubmit={handlePayment} className="checkout-form">
              <div className="form-section">
                <h3>Delivery Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" required placeholder="Full Name" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" required placeholder="xyz@example.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" required placeholder="+91 00000 00000" />
                  </div>
                  <div className="form-group full-width">
                    <label>Address</label>
                    <input type="text" required placeholder="Landmark" />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" required placeholder="Nagpur" />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input type="text" required placeholder="000000" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Delivery Options</h3>
                <div className="delivery-options">
                  <label className="delivery-option">
                    <input type="radio" name="delivery" value="standard" defaultChecked />
                    <div className="option-content">
                      <div className="option-header">
                        <Truck size={20} />
                        <span>Standard Delivery</span>
                        <span className="option-price">Free</span>
                      </div>
                      <p>5-7 business days</p>
                    </div>
                  </label>
                  <label className="delivery-option">
                    <input type="radio" name="delivery" value="express" />
                    <div className="option-content">
                      <div className="option-header">
                        <Truck size={20} />
                        <span>Express Delivery</span>
                        <span className="option-price">Rs. 39.99</span>
                      </div>
                      <p>2-3 business days</p>
                    </div>
                  </label>
                  <label className="delivery-option">
                    <input type="radio" name="delivery" value="plantation" />
                    <div className="option-content">
                      <div className="option-header">
                        <Calendar size={20} />
                        <span>Plantation Service</span>
                        <span className="option-price">Rs. 125.00</span>
                      </div>
                      <p>Professional planting service included</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Method</h3>
                <div className="payment-methods">
                  <label className="payment-method">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="card" 
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <CreditCard size={20} />
                      <span>Credit/Debit Card</span>
                    </div>
                  </label>
                  <label className="payment-method">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="paypal" 
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-content">
                      <Shield size={20} />
                      <span>Online</span>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="card-form">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input type="text" required placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input type="text" required placeholder="MM/YY" />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input type="text" required placeholder="***" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input type="text" required placeholder="Name on Card" />
                    </div>
                  </div>
                )}
              </div>

              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cart.map(item => (
                    <div key={item.id} className="summary-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <strong>Total: Rs. {getTotalPrice().toFixed(2)}</strong>
                </div>
              </div>

              <button type="submit" className="place-order-btn">
                <CreditCard size={20} />
                Place Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderPlaced && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your purchase. Your plants will help improve air quality!</p>
            <div className="success-details">
              <p><strong>Order ID:</strong> #ENV{Math.floor(Math.random() * 10000)}</p>
              <p><strong>Estimated Delivery:</strong> 5-7 business days</p>
            </div>
            <button 
              className="continue-shopping-btn"
              onClick={() => setOrderPlaced(false)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Services Section */}
      <div className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <Truck size={32} />
            </div>
            <h3>Free Delivery</h3>
            <p>Free standard delivery on all orders over Rs. 500</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <Calendar size={32} />
            </div>
            <h3>Plantation Service</h3>
            <p>Professional planting service for optimal plant health</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <Shield size={32} />
            </div>
            <h3>Plant Guarantee</h3>
            <p>30-day guarantee on all plants with care instructions</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <Phone size={32} />
            </div>
            <h3>Expert Support</h3>
            <p>24/7 plant care support from our horticulture experts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantStore;
