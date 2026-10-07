import React, { useState, useEffect } from 'react';
import { api } from '../api';
import ProductGrid from './ProductGrid';
import './RestaurantDetail.css';

const RestaurantDetail = ({ restaurant, categories = [], language, onBack, onProductClick, favorites, onToggleFavorite }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!restaurant) return;
            try {
                const data = await api.getRestaurantProducts(restaurant.id);
                setProducts(Array.isArray(data) ? data : (data.results || []));
            } catch (error) {
                console.error("Error fetching restaurant products:", error);
                setProducts([]);
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

    // Extract unique categories from products using Shop.jsx categories for images
    const uniqueCategories = [];
    const categoryIds = new Set();
    products.forEach(p => {
        if (!categoryIds.has(p.category)) {
            categoryIds.add(p.category);
            const fullCategory = categories.find(c => c.id === p.category) || {};
            uniqueCategories.push({
                id: p.category,
                name: p.category_name,
                name_ru: p.category_name_ru,
                image: fullCategory.image,
                image_base64: fullCategory.image_base64
            });
        }
    });

    return (
        <div className="restaurant-detail-view">
            <div className="restaurant-detail-header">
                <div className="restaurant-cover">
                    <img src={api.getImageUrl(restaurant.image)} alt={restaurant.name} loading="lazy" />
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
                    <div className="restaurant-contacts">
                        {restaurant.location && (
                            <div className="contact-row">
                                <div className="contact-text">
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <span>{restaurant.location}</span>
                                </div>
                                <a href={`https://yandex.com/maps/?text=${encodeURIComponent(restaurant.location)}`} target="_blank" rel="noopener noreferrer" className="btn-view-map">
                                    {language === 'ru' ? 'Смотреть' : 'Ko\'rish'}
                                </a>
                            </div>
                        )}
                        {restaurant.phone && (
                            <div className="contact-row">
                                <div className="contact-text">
                                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                    <span>{restaurant.phone}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="restaurant-products-section">
                {uniqueCategories.length > 0 && (
                    <div className="category-section restaurant-categories-grid">
                        <div className="section-header">
                            <h2>{language === 'ru' ? 'Категории' : 'Kategoriyalar'}</h2>
                        </div>
                        <div className="category-grid">
                            {uniqueCategories.map(category => (
                                <div key={category.id} className="category-item">
                                    <div className="category-image-container">
                                        {category.image_base64 || category.image ? (
                                            <img src={category.image_base64 || api.getImageUrl(category.image)} alt={category.name} loading="lazy" />
                                        ) : (
                                            <span className="category-icon">📦</span>
                                        )}
                                    </div>
                                    <span className="category-name">
                                        {language === 'ru' ? (category.name_ru || category.name) : category.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="section-title menu-title">
                    {language === 'ru' ? 'Меню' : 'Menyu'}
                </div>
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : products.length > 0 ? (
                    <ProductGrid 
                        products={products} 
                        onProductClick={onProductClick} 
                        language={language}
                        favorites={favorites}
                        onToggleFavorite={onToggleFavorite}
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
