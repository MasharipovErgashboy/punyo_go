import React from 'react';
import './LocationPicker.css';

const LocationPicker = ({ onAutoLocation, onManualLocation, onCancel, language, restaurantWorkingHours }) => {
    
    const isOutsideWorkingHours = () => {
        if (!restaurantWorkingHours) return false;
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        
        const [startH, startM] = restaurantWorkingHours.start_time.split(':').map(Number);
        let endH = parseInt(restaurantWorkingHours.end_time.split(':')[0]);
        let endM = parseInt(restaurantWorkingHours.end_time.split(':')[1]);
        
        if (endH === 0 && endM === 0) {
            endH = 23;
            endM = 59;
        }
        
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        
        if (startTotal < endTotal) {
            return !(currentTotalMinutes >= startTotal && currentTotalMinutes <= endTotal);
        } else {
            return !(currentTotalMinutes >= startTotal || currentTotalMinutes <= endTotal);
        }
    };

    const isClosed = isOutsideWorkingHours();

    return (
        <div className="location-picker-overlay">
            <div className="location-picker-card">
                <button className="close-btn" onClick={onCancel}>×</button>
                <div className="location-icon-container">
                    <div className="location-pin">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                            <circle cx="12" cy="9" r="3" fill="white" />
                        </svg>
                    </div>
                    <div className="location-pulse"></div>
                </div>

                <h2 className="location-title">
                    {isClosed ? (
                        language === 'ru' ? 'Ресторан сейчас закрыт' : 'Restoran hozir yopiq'
                    ) : (
                        language === 'ru' ? 'Где вы находитесь?' : 'Sotib olgan mahsulotingizni qayerga yetkazib berish kerak? 🚚'
                    )}
                </h2>
                <p className="location-subtitle" style={isClosed ? { color: 'var(--brand-tezkor, #ff9800)' } : {}}>
                    {isClosed ? (
                        language === 'ru'
                            ? `Ресторан работает с ${restaurantWorkingHours.start_time} до ${restaurantWorkingHours.end_time}. Вы можете сделать заказ сейчас, и он будет доставлен сразу после открытия.`
                            : `Bizning restoranimizni ish vaqti ${restaurantWorkingHours.start_time} dan ${restaurantWorkingHours.end_time} gacha. Buyurtma berishingiz mumkin, faqat buyurtmangiz ish boshlanishi bilanoq yetkazib beriladi.`
                    ) : (
                        language === 'ru'
                            ? 'Отправьте свое местоположение, и мы быстро доставим ваш заказ!'
                            : 'Joylashuvigizni yuboring, biz eng yaqin do‘kon yoki omborni aniqlaymiz va buyurtmangizni tezkor yetkazib beramiz!'
                    )}
                </p>

                <div className="location-actions">
                    <button className="btn-primary" onClick={onManualLocation}>
                        {language === 'ru' ? 'Указать на карте' : 'Joylashuvni belgilash'}
                    </button>
                </div>

                <div className="location-footer">
                    @PUNYOGO
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
