import React, { useEffect, useState } from 'react';
import { api } from '../api';
import './RestaurantList.css';

const RestaurantList = ({ language }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await api.getRestaurants();
                // Django REST framework with pagination returns { count, next, previous, results: [...] }
                const results = data.results !== undefined ? data.results : (Array.isArray(data) ? data : []);
                setRestaurants(results);
            } catch (error) {
                console.error("Error fetching restaurants:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    if (loading) return null;
    if (restaurants.length === 0) return null;

    return (
        <div className="restaurant-section">
            <div className="section-header">
                <h2>{language === 'ru' ? 'Популярные места' : 'Mashhur joylar'} 🔥</h2>
                <span className="view-all">{language === 'ru' ? 'Все' : 'Barchasi'} &gt;</span>
            </div>
            
            <div className="restaurant-scroll">
                {restaurants.map((rest, idx) => {
                    // Generate pseudo random rating/reviews/distance for visual matching since DB doesn't have them yet
                    const idStr = String(rest.id);
                    const rating = (4.0 + (idStr.charCodeAt(0) % 10) / 10).toFixed(1);
                    const timeMin = 15 + (idStr.charCodeAt(0) % 20);
                    const timeMax = timeMin + 10;

                    return (
                        <div key={rest.id} className="restaurant-card">
                            <div className="restaurant-image-wrapper">
                                <img src={api.getImageUrl(rest.image)} alt={rest.name} className="restaurant-image" />
                                <button className="restaurant-fav-btn">
                                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className="restaurant-info">
                                <h3>{rest.name}</h3>
                                <div className="restaurant-rating">
                                    <span className="star">⭐</span> {rating}
                                </div>
                                <div className="restaurant-meta">
                                    {timeMin}-{timeMax} {language === 'ru' ? 'мин' : 'daqiqa'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RestaurantList;
