import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { api } from '../api';
import 'swiper/css';
import 'swiper/css/pagination';
import './PromoBanner.css';

const PromoBanner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await api.getAdvertisements();
                if (data && Array.isArray(data)) {
                    setBanners(data);
                }
            } catch (err) {
                console.error("Failed to fetch banners", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    if (loading || banners.length === 0) {
        return null;
    }

    return (
        <div className="promo-banner-container custom-swiper-container">
            <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true, el: '.promo-pagination' }}
                loop={banners.length > 1}
                className="promo-swiper"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <div className="promo-slide" style={{ backgroundImage: `url(${banner.image})` }}>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="promo-pagination swiper-pagination-custom"></div>
        </div>
    );
};

export default PromoBanner;
