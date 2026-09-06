import React, { useState } from 'react';
import { api } from '../api';
import './Cart.css';

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout, onBack, language }) => {
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [promoMessage, setPromoMessage] = useState('');
    const [promoError, setPromoError] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const uniqueRestaurants = {};
    cart.forEach(item => {
        if (item.restaurant_id) {
            uniqueRestaurants[item.restaurant_id] = Number(item.delivery_price || 0);
        }
    });
    const deliveryTotal = Object.values(uniqueRestaurants).reduce((sum, fee) => sum + fee, 0);
    const subTotal = cartTotal + deliveryTotal;
    const discountAmount = subTotal * (discountPercent / 100);
    const grandTotal = subTotal - discountAmount;

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;
        setIsApplyingPromo(true);
        setPromoError('');
        setPromoMessage('');
        try {
            const data = await api.validatePromoCode(promoInput.trim());
            setAppliedPromo(promoInput.trim());
            setDiscountPercent(data.discount_percent);
            setPromoMessage(data.message || (language === 'ru' ? 'Скидка применена!' : 'Chegirma berildi!'));
        } catch (err) {
            setPromoError(err.message || 'Xatolik');
            setAppliedPromo(null);
            setDiscountPercent(0);
        } finally {
            setIsApplyingPromo(false);
        }
    };

    return (
        <div className="cart-view">
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
                        <div className="promo-code-section" style={{marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <input 
                                    type="text" 
                                    placeholder={language === 'ru' ? 'Промокод' : 'Promokod'}
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                    style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-main)'}}
                                    disabled={!!appliedPromo || isApplyingPromo}
                                />
                                <button 
                                    onClick={handleApplyPromo}
                                    disabled={!promoInput.trim() || !!appliedPromo || isApplyingPromo}
                                    style={{padding: '10px 16px', borderRadius: '8px', background: appliedPromo ? 'var(--success-color, #4CAF50)' : 'var(--accent-color)', color: '#000', border: 'none', fontWeight: 'bold'}}
                                >
                                    {isApplyingPromo ? '...' : (appliedPromo ? '✓' : (language === 'ru' ? 'Применить' : 'Tasdiqlash'))}
                                </button>
                            </div>
                            {promoError && <span style={{color: 'var(--error-color, #f44336)', fontSize: '12px'}}>{promoError}</span>}
                            {promoMessage && <span style={{color: 'var(--success-color, #4CAF50)', fontSize: '12px'}}>{promoMessage}</span>}
                        </div>

                        <div className="cart-total-details" style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px'}}>
                            <div className="cart-total-row" style={{fontSize: '14px', color: 'var(--text-muted)'}}>
                                <span>{language === 'ru' ? 'Сумма товаров:' : 'Mahsulotlar summasi:'}</span>
                                <span>{cartTotal.toLocaleString()} UZS</span>
                            </div>
                            <div className="cart-total-row" style={{fontSize: '14px', color: 'var(--text-muted)'}}>
                                <span>{language === 'ru' ? 'Доставка:' : 'Yetkazib berish:'}</span>
                                <span>{deliveryTotal.toLocaleString()} UZS</span>
                            </div>
                            {discountPercent > 0 && (
                                <div className="cart-total-row" style={{fontSize: '14px', color: 'var(--success-color, #4CAF50)'}}>
                                    <span>{language === 'ru' ? 'Скидка' : 'Chegirma'} ({discountPercent}%):</span>
                                    <span>-{discountAmount.toLocaleString()} UZS</span>
                                </div>
                            )}
                        </div>
                        <div className="cart-total-row" style={{borderTop: '1px solid var(--border-color)', paddingTop: '12px'}}>
                            <span>{language === 'ru' ? 'Общая сумма:' : 'Jami summa:'}</span>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                                {discountPercent > 0 && (
                                    <span style={{textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '14px'}}>
                                        {subTotal.toLocaleString()} UZS
                                    </span>
                                )}
                                <span className="cart-total-amount">{grandTotal.toLocaleString()} UZS</span>
                            </div>
                        </div>
                        <button className="cart-checkout-btn" onClick={() => onCheckout(appliedPromo)}>
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
