import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import './MapPicker.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const libraries = ['places'];

const MapPicker = ({ onConfirm, onCancel, language }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyA_2u9dzAl05PmQ48ZGoq-V4rqYt3-BUVI',
        libraries,
        language: language === 'ru' ? 'ru' : 'uz'
    });

    const [map, setMap] = useState(null);
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 40.5288, lng: 68.0315 }); // Default: Do'stlik, Jizzax
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const updateAddress = async (lat, lng) => {
        setLoading(true);
        try {
            if (window.google) {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        setAddress(results[0].formatted_address);
                    } else {
                        // Fallback to nominatim if google geocoding fails or is not enabled
                        fallbackGeocode(lat, lng);
                    }
                    setLoading(false);
                });
            } else {
                fallbackGeocode(lat, lng);
            }
        } catch (e) {
            console.error('Reverse geocoding error:', e);
            fallbackGeocode(lat, lng);
        }
    };

    const fallbackGeocode = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language === 'ru' ? 'ru' : 'uz'}`);
            const data = await res.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
            } else {
                setAddress('Manzil aniqlanmadi');
            }
        } catch (e) {
            setAddress('Manzil aniqlanmadi');
        } finally {
            setLoading(false);
        }
    };

    // Initial Geocode when map loads
    useEffect(() => {
        if (isLoaded) {
            updateAddress(coordinates.lat, coordinates.lng);
        }
    }, [isLoaded]);

    const handleSearch = async (e) => {
        if (e.key === 'Enter' && searchQuery) {
            setLoading(true);
            try {
                // Try Google Places/Geocoding first
                if (window.google) {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ address: searchQuery }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            const newCoords = {
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng()
                            };
                            setCoordinates(newCoords);
                            setAddress(results[0].formatted_address);
                            if (map) {
                                map.panTo(newCoords);
                                map.setZoom(16);
                            }
                        } else {
                            fallbackSearch();
                        }
                        setLoading(false);
                    });
                } else {
                    fallbackSearch();
                }
            } catch (err) {
                fallbackSearch();
            }
        }
    };

    const fallbackSearch = async () => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=${language === 'ru' ? 'ru' : 'uz'}`);
            const data = await res.json();
            if (data && data[0]) {
                const { lat, lon, display_name } = data[0];
                const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setCoordinates(newCoords);
                setAddress(display_name);
                if (map) {
                    map.panTo(newCoords);
                    map.setZoom(16);
                }
            }
        } catch (e) {
            console.error('Search error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleMyLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setCoordinates(newCoords);
                if (map) {
                    map.panTo(newCoords);
                    map.setZoom(16);
                }
                updateAddress(newCoords.lat, newCoords.lng);
            });
        }
    };

    const onMarkerDragEnd = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setCoordinates({ lat, lng });
        updateAddress(lat, lng);
    };

    const onMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setCoordinates({ lat, lng });
        updateAddress(lat, lng);
    };

    const zoomIn = () => {
        if (map) map.setZoom(map.getZoom() + 1);
    };
    const zoomOut = () => {
        if (map) map.setZoom(map.getZoom() - 1);
    };

    return (
        <div className="map-picker-overlay">
            <div className="map-header">
                <button className="map-back-btn" onClick={onCancel}>
                    <span className="close-x">✕</span>
                </button>
                <div className="map-search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={language === 'ru' ? 'Поиск адреса' : 'Manzilni qidirish'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <div className="map-container">
                {loadError && <div>{language === 'ru' ? 'Ошибка загрузки карты' : 'Xaritani yuklashda xatolik'}</div>}
                {!isLoaded && !loadError && <div>{language === 'ru' ? 'Загрузка карты...' : 'Xarita yuklanmoqda...'}</div>}
                
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={coordinates}
                        zoom={15}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onClick={onMapClick}
                        options={{
                            disableDefaultUI: true,
                            zoomControl: false,
                        }}
                    >
                        <Marker
                            position={coordinates}
                            draggable={true}
                            onDragEnd={onMarkerDragEnd}
                        />
                    </GoogleMap>
                )}

                <div className="map-controls">
                    <div className="zoom-controls">
                        <button onClick={zoomIn}>+</button>
                        <button onClick={zoomOut}>−</button>
                    </div>
                    <button className="my-location-btn" onClick={handleMyLocation}>
                        <span className="gps-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>

            <div className="map-footer">
                <div className="address-container">
                    <p className="address-text">{loading ? (language === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...') : address}</p>
                </div>
                <button
                    className="confirm-location-btn"
                    onClick={() => onConfirm({ ...coordinates, address })}
                    disabled={loading || !address}
                >
                    {language === 'ru' ? 'Подтвердить' : 'Tasdiqlash'}
                </button>
            </div>
        </div>
    );
};

export default MapPicker;
