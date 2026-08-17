import React from 'react';
import './BottomNav.css';

const BottomNav = ({ currentView, onViewChange, language }) => {
    return (
        <div className="bottom-nav">
            <div 
                className={`nav-item ${currentView === 'home' || currentView === 'category_products' ? 'active' : ''}`}
                onClick={() => onViewChange('home')}
            >
                <div className="nav-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </div>
                <span>{language === 'ru' ? 'Главная' : 'Bosh sahifa'}</span>
            </div>
            
            <div 
                className={`nav-item ${currentView === 'my_orders' ? 'active' : ''}`}
                onClick={() => onViewChange('orders')}
            >
                <div className="nav-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <span>{language === 'ru' ? 'Заказы' : 'Buyurtmalar'}</span>
            </div>
            
            <div 
                className={`nav-item ${currentView === 'cart' ? 'active' : ''}`}
                onClick={() => onViewChange('cart')}
            >
                <div className="nav-icon cart-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {/* Badge could be added here if needed */}
                </div>
                <span>{language === 'ru' ? 'Корзина' : 'Savatcha'}</span>
            </div>
            
            <div 
                className={`nav-item ${currentView === 'favorites' ? 'active' : ''}`}
                onClick={() => onViewChange('favorites')}
            >
                <div className="nav-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </div>
                <span>{language === 'ru' ? 'Избранное' : 'Sevimlilar'}</span>
            </div>
            
            <div 
                className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
                onClick={() => onViewChange('profile')}
            >
                <div className="nav-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <span>{language === 'ru' ? 'Профиль' : 'Profil'}</span>
            </div>
        </div>
    );
};

export default BottomNav;
