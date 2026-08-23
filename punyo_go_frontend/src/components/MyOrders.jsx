import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './MyOrders.css';

const MyOrders = ({ user, language, onBack }) => {
    const [activeTab, setActiveTab] = useState('active'); // 'active' (Faol), 'confirmed' (Tasdiqlangan), or 'canceled' (Rad etilgan)
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userId = user.telegram_user_id || user.id;
            let data;
            if (activeTab === 'active') {
                data = await api.getActiveOrders(userId);
            } else if (activeTab === 'confirmed') {
                data = await api.getConfirmedOrders(userId);
            } else if (activeTab === 'canceled') {
                data = await api.getCanceledOrders(userId);
            }
            setOrders(data?.orders || []);
        } catch (e) {
            console.error('Failed to fetch orders:', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    return (
        <div className="my-orders-view">
            <div className="orders-header">
                <button className="orders-back-btn" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <h2>{language === 'ru' ? 'Мои заказы' : 'Buyurtmalarim'}</h2>
            </div>

            <div className="orders-tabs">
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    {language === 'ru' ? 'Активные' : 'Faol'}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('confirmed')}
                >
                    {language === 'ru' ? 'Подтвержденные' : 'Tasdiqlangan'}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'canceled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('canceled')}
                >
                    {language === 'ru' ? 'Отмененные' : 'Rad etilgan'}
                </button>
            </div>

            <div className="orders-content">
                {loading ? (
                    <div className="loading-state">...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        {language === 'ru' ? 'У вас нет заказов' : 'Buyurtmalaringiz mavjud emas'}
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-card-header">
                                    <span className="order-id">#{order.id}</span>
                                    <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="order-items">
                                    {order.items.map(item => (
                                        <div key={item.id} className="order-item-row">
                                            <span>{language === 'ru' ? (item.product_name_ru || item.product_name) : item.product_name}</span>
                                            <span>x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="order-total">
                                    <span>{language === 'ru' ? 'Итого:' : 'Jami:'}</span>
                                    <span>{parseFloat(order.total_amount).toLocaleString()} UZS</span>
                                </div>
                                
                                <div className="order-card-footer">
                                    <div className={`status-badge ${order.status}`}>
                                        {order.status === 'pending' 
                                            ? (language === 'ru' ? 'Ожидание' : 'Kutilmoqda') 
                                            : order.status === 'active' || order.status === 'ready'
                                                ? (language === 'ru' ? 'Подтвержден' : 'Tasdiqlangan')
                                                : order.status === 'delivering'
                                                    ? (language === 'ru' ? 'Доставляется' : 'Yetkazilmoqda')
                                                    : (language === 'ru' ? 'Отменен' : 'Rad etilgan')}
                                    </div>
                                    
                                    {activeTab === 'confirmed' && (
                                        <button className="view-order-btn" onClick={() => toggleOrder(order.id)}>
                                            {language === 'ru' ? 'Смотреть' : 'Ko\'rish'}
                                            <svg className={expandedOrder === order.id ? 'rotated' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </button>
                                    )}
                                </div>

                                {expandedOrder === order.id && activeTab === 'confirmed' && (
                                    <div className="order-tracking-container animate-fade-in">
                                        <div className="tracking-step">
                                            <div className={`step-icon ${(order.status === 'active' || order.status === 'ready') ? 'glowing-active' : (order.status === 'delivering' ? 'completed' : '')}`}>
                                                🍳
                                            </div>
                                            <div className="step-text">
                                                {language === 'ru' ? 'Готовится' : 'Tayyorlanmoqda'}
                                            </div>
                                        </div>
                                        <div className="tracking-line"></div>
                                        <div className="tracking-step">
                                            <div className={`step-icon ${order.status === 'delivering' ? 'glowing-active' : 'inactive'}`}>
                                                🛵
                                            </div>
                                            <div className="step-text">
                                                {language === 'ru' ? 'В пути' : 'Yetkazib berilmoqda'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
