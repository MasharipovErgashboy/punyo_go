import React, { useState } from 'react';
import { getImageUrl } from '../api';
import './ProductDetail.css';

const ProductDetail = ({ product, language, onBack, favorites = [], onToggleFavorite, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState([]);

    const isFavorite = favorites.includes(product.id);

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handleToggleAddon = (addon) => {
        setSelectedAddons(prev => {
            const exists = prev.find(a => a.id === addon.id);
            if (exists) {
                return prev.filter(a => a.id !== addon.id);
            } else {
                return [...prev, addon];
            }
        });
    };

    const handleAddToCartClick = () => {
        onAddToCart(product, quantity, selectedAddons);
    };

    return (
        <div className="product-detail-view">
            <div className="detail-header">
                <div className="detail-image-container">
                    <button className="detail-back-btn" onClick={onBack}>
                        <span className="arrow">←</span>
                    </button>
                    <button
                        className={`detail-favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={() => onToggleFavorite(product.id)}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                    {product.image_base64 || product.image ? (
                        <img src={product.image_base64 || getImageUrl(product.image)} alt={product.name} loading="lazy" />
                    ) : (
                        <div className="placeholder-image">🖼️</div>
                    )}
                </div>
            </div>

            <div className="detail-info">
                <h1 className="detail-name">
                    {language === 'ru' ? (product.name_ru || product.name) : product.name}
                </h1>
                
                {product.restaurant_name && (
                    <div className="detail-restaurant">
                        <span className="restaurant-icon">🏪</span> {product.restaurant_name}
                    </div>
                )}
                
                {product.description && (
                    <p className="detail-description">
                        {language === 'ru' ? (product.description_ru || product.description) : product.description}
                    </p>
                )}

                <div className="detail-price-section">
                    <span className="detail-price">{Number(product.price).toLocaleString()} {language === 'ru' ? 'сум' : 'so\'m'}</span>
                </div>

                {product.addons && product.addons.length > 0 && (
                    <div className="detail-addons">
                        <div className="addons-header">
                            {language === 'ru' ? 'Добавки' : 'Qo\'shimchalar'}
                        </div>
                        <div className="addons-list">
                            {product.addons.map(addon => {
                                const isSelected = selectedAddons.some(a => a.id === addon.id);
                                return (
                                    <div 
                                        key={addon.id} 
                                        className="addon-item"
                                        onClick={() => handleToggleAddon(addon)}
                                    >
                                        <div className={`addon-checkbox ${isSelected ? 'checked' : ''}`}>
                                            {isSelected && (
                                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            )}
                                        </div>
                                        <span className="addon-name">{addon.name}</span>
                                        <span className="addon-price">+{Number(addon.price).toLocaleString()} {language === 'ru' ? 'сум' : 'so\'m'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="detail-actions-fixed">
                <div className="quantity-selector">
                    <button className="qty-btn minus" onClick={handleDecrement}>−</button>
                    <span className="qty-value">{quantity}</span>
                    <button className="qty-btn plus" onClick={handleIncrement}>+</button>
                </div>
                <button
                    className="add-to-cart-btn"
                    onClick={handleAddToCartClick}
                >
                    <span className="cart-icon">🛒</span>
                    {language === 'ru' ? 'В корзину' : 'Savatga'}
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;
