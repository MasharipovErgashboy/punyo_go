import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ onClose, language, restaurantPhone }) => {
    const handleCall = () => {
        window.location.href = `tel:${restaurantPhone}`;
    };

    return (
        <div className="success-modal-overlay">
            <div className="success-modal">
                <div className="success-animation">
                    {restaurantPhone ? '📞' : '✓'}
                </div>
                <h2>
                    {restaurantPhone 
                        ? (language === 'ru' ? 'Остался один шаг!' : 'Yana bir qadam!') 
                        : (language === 'ru' ? 'Заказ принят!' : 'Qabul qilindi!')}
                </h2>
                <p>
                    {restaurantPhone 
                        ? (language === 'ru' 
                            ? 'Для подтверждения заказа, пожалуйста, позвоните нам.' 
                            : 'Zakaz qabul qilinishi uchun telefon qiling.')
                        : (language === 'ru'
                            ? 'Ваш заказ успешно оформлен. Вы можете отслеживать его в разделе Мои заказы.'
                            : 'Buyurtmangiz muvaffaqiyatli qabul qilindi. Uni Buyurtmalarim bo\'limida kuzatishingiz mumkin.')}
                </p>

                {restaurantPhone && (
                    <div className="phone-number-display">
                        {restaurantPhone}
                    </div>
                )}
                
                {restaurantPhone ? (
                    <div className="modal-actions">
                        <button className="call-btn" onClick={handleCall}>
                            {language === 'ru' ? 'Позвонить' : 'Zakaz berish'}
                        </button>
                        <button className="close-btn" onClick={onClose}>
                            {language === 'ru' ? 'Закрыть' : 'Yopish'}
                        </button>
                    </div>
                ) : (
                    <button className="ok-btn" onClick={onClose}>OK</button>
                )}
            </div>
        </div>
    );
};

export default SuccessModal;
