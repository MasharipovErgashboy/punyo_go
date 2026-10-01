import React from 'react';
import './SuccessModal.css';

const SuccessModal = ({ onClose, language, restaurantPhone }) => {
    const handleCall = () => {
        if (restaurantPhone) {
            window.location.href = `tel:${restaurantPhone}`;
        }
    };

    return (
        <div className="success-modal-overlay">
            <div className="success-modal">
                <div className="success-animation">
                    📞
                </div>
                <h2>
                    {language === 'ru' ? 'Остался один шаг!' : 'Yana bir qadam!'}
                </h2>
                <p>
                    {language === 'ru' 
                        ? 'Для подтверждения заказа, пожалуйста, позвоните нам.' 
                        : 'Buyurtma qabul qilinishi uchun telefon qiling.'}
                </p>

                {restaurantPhone && (
                    <div className="phone-number-display">
                        {restaurantPhone}
                    </div>
                )}
                
                <div className="modal-actions">
                    <button className="call-btn" onClick={handleCall}>
                        {language === 'ru' ? 'Позвонить' : 'Zakaz berish'}
                    </button>
                    <button className="close-btn" onClick={onClose}>
                        {language === 'ru' ? 'Закрыть' : 'Yopish'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
