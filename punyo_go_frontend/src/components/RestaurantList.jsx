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
                setRestaurants(data);
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
                    const rating = (4.0 + (rest.id.charCodeAt(0) % 10) / 10).toFixed(1);
                    const reviews = 50 + (rest.id.charCodeAt(1) % 200);
                    const distance = (1.0 + (rest.id.charCodeAt(2) % 40) / 10).toFixed(1);
                    const timeMin = 15 + (rest.id.charCodeAt(0) % 20);
                    const timeMax = timeMin + 10;

                    return (
                        <div key={rest.id} className="restaurant-card">
                            <div className="restaurant-image-wrapper">
                                <img src={api.getImageUrl(rest.image)} alt={rest.name} className="restaurant-image" />
                                <button className="restaurant-fav-btn">♡</button>
                            </div>
                            <div className="restaurant-info">
                                <h3>{rest.name}</h3>
                                <div className="restaurant-rating">
                                    <span className="star">⭐</span> {rating} <span className="reviews">({reviews})</span>
                                </div>
                                <div className="restaurant-meta">
                                    {timeMin}-{timeMax} {language === 'ru' ? 'мин' : 'daqiqa'} • {distance} km
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
