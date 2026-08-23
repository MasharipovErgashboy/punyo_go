import React from 'react';
import { api } from '../api';
import './Cart.css';

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout, onBack, language }) => {
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const uniqueRestaurants = {};
    cart.forEach(item => {
        if (item.restaurant_id) {
            uniqueRestaurants[item.restaurant_id] = Number(item.delivery_price || 0);
        }
    });
    const deliveryTotal = Object.values(uniqueRestaurants).reduce((sum, fee) => sum + fee, 0);
    const grandTotal = cartTotal + deliveryTotal;

    return (
        <div className="cart-view animate-fade-in">
            <div className="category-title cart-header">
                <span className="back-btn" onClick={onBack}>←</span>
                {language === 'ru' ? 'КОРЗИНА' : 'SAVATCHA'}
            </div>

            {cart.length === 0 ? (
                <div className="empty-cart-container">
                    <div className="empty-cart-icon">🛒</div>
                    <h3>{language === 'ru' ? 'Ваша корзина пуста' : 'Savatchangiz bo\'sh'}</h3>
                    <p>{language === 'ru' ? 'Добавьте товары из меню, чтобы сделать заказ.' : 'Buyurtma berish uchun menyudan mahsulot qo\'shing.'}</p>
                    <button className="go-shopping-btn" onClick={onBack}>
                        {language === 'ru' ? 'Перейти к меню' : 'Menyuga qaytish'}
                    </button>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items-list">
                        {cart.map((item, index) => {
                            // unique_id is the primary identifier, fallback to index if missing
                            const itemKey = item.unique_id || `${item.product_id}-${index}`;
                            
                            return (
                                <div key={itemKey} className="cart-item-card">
                                    <div className="cart-item-image-wrapper">
                                        <img src={api.getImageUrl(item.image)} alt={language === 'ru' ? (item.name_ru || item.name) : item.name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <h4>{language === 'ru' ? (item.name_ru || item.name) : item.name}</h4>
                                        
                                        {item.addons && item.addons.length > 0 && (
                                            <div className="cart-item-addons">
                                                {item.addons.map((a, i) => (
                                                    <span key={i} className="addon-badge">
                                                        +{language === 'ru' ? (a.name_ru || a.name) : a.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="cart-item-price-row">
                                            <span className="cart-item-price">{(item.price * item.quantity).toLocaleString()} UZS</span>
                                        </div>
                                        
                                        <div className="cart-item-actions">
                                            <div className="quantity-controls">
                                                <button 
                                                    className="qty-btn" 
                                                    onClick={() => onUpdateQuantity(item.unique_id, item.product_id, -1)}
                                                >-</button>
                                                <span className="qty-value">{item.quantity}</span>
                                                <button 
                                                    className="qty-btn" 
                                                    onClick={() => onUpdateQuantity(item.unique_id, item.product_id, 1)}
                                                >+</button>
                                            </div>
                                            <button 
                                                className="remove-item-btn" 
                                                onClick={() => onRemoveItem(item.unique_id, item.product_id)}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="cart-checkout-section">
                        <div className="cart-total-details" style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px'}}>
                            <div className="cart-total-row" style={{fontSize: '14px', color: 'var(--text-muted)'}}>
                                <span>{language === 'ru' ? 'Сумма товаров:' : 'Mahsulotlar summasi:'}</span>
                                <span>{cartTotal.toLocaleString()} UZS</span>
                            </div>
                            <div className="cart-total-row" style={{fontSize: '14px', color: 'var(--text-muted)'}}>
                                <span>{language === 'ru' ? 'Доставка:' : 'Yetkazib berish:'}</span>
                                <span>{deliveryTotal.toLocaleString()} UZS</span>
                            </div>
                        </div>
                        <div className="cart-total-row" style={{borderTop: '1px solid var(--border-color)', paddingTop: '12px'}}>
                            <span>{language === 'ru' ? 'Общая сумма:' : 'Jami summa:'}</span>
                            <span className="cart-total-amount">{grandTotal.toLocaleString()} UZS</span>
                        </div>
                        <button className="cart-checkout-btn" onClick={onCheckout}>
                            {language === 'ru' ? 'Оформить заказ' : 'Buyurtma berish'}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
