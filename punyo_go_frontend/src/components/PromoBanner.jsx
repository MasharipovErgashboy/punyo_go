import React from 'react';
import './PromoBanner.css';

const PromoBanner = ({ language }) => {
    return (
        <div className="promo-banner-container">
            <div className="promo-banner">
                <div className="promo-content">
                    <h3>{language === 'ru' ? 'БЕСПЛАТНАЯ ДОСТАВКА' : 'BEPUL YETKAZIB BERISH'}</h3>
                    <p>{language === 'ru' ? 'На заказы свыше 30 000 сум' : '30 000 so\'mdan yuqori buyurtmalarga'}</p>
                </div>
                <div className="promo-image">
                    {/* Placeholder for scooter image, using emoji for now, or you can use a real image */}
                    <span className="scooter-icon">🛵</span>
                </div>
                <button className="promo-close">×</button>
            </div>
            <div className="promo-pagination">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>
        </div>
    );
};

export default PromoBanner;
