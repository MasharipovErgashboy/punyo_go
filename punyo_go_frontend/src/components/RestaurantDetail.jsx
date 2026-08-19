import React, { useState, useEffect } from 'react';
import { api } from '../api';
import ProductGrid from './ProductGrid';
import './RestaurantDetail.css';

const RestaurantDetail = ({ restaurant, language, onBack, onProductClick }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!restaurant) return;
            try {
                const data = await api.getRestaurantProducts(restaurant.id);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching restaurant products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [restaurant]);

    if (!restaurant) return null;

    // Generate pseudo info to match the card look
    const idStr = String(restaurant.id);
    const rating = (4.0 + (idStr.charCodeAt(0) % 10) / 10).toFixed(1);
    const timeMin = 15 + (idStr.charCodeAt(0) % 20);
    const timeMax = timeMin + 10;

    return (
        <div className="restaurant-detail-view">
            <div className="restaurant-detail-header">
                <div className="restaurant-cover">
                    <img src={api.getImageUrl(restaurant.image)} alt={restaurant.name} />
                    <div className="cover-overlay"></div>
                    <button className="back-btn-overlay" onClick={onBack}>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                </div>
                <div className="restaurant-info-card">
                    <h2>{restaurant.name}</h2>
                    <div className="restaurant-stats">
                        <div className="stat-item">
                            <span className="star">⭐</span>
                            <span className="stat-value">{rating}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span className="stat-value">{timeMin}-{timeMax} {language === 'ru' ? 'мин' : 'daqiqa'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="restaurant-products-section">
                <div className="section-title">
                    {language === 'ru' ? 'Меню' : 'Menyu'}
                </div>
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : products.length > 0 ? (
                    <ProductGrid 
                        products={products} 
                        onProductClick={onProductClick} 
                        language={language}
                    />
                ) : (
                    <div className="empty-products">
                        {language === 'ru' ? 'Нет доступных товаров' : 'Mahsulotlar mavjud emas'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetail;
