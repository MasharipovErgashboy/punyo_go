import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CategoryList from './CategoryList';
import ProductGrid from './ProductGrid';
import SearchBar from './SearchBar';
import CategorySection from './CategorySection';
import PromoBanner from './PromoBanner';
import RestaurantList from './RestaurantList';
import RestaurantDetail from './RestaurantDetail';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import AuthDrawer from './AuthDrawer';
import MyOrders from './MyOrders';
import Notifications from './Notifications';
import AboutUs from './AboutUs';
import ProfileEdit from './ProfileEdit';
import ProductDetail from './ProductDetail';
import LocationPicker from './LocationPicker';
import MapPicker from './MapPicker';
import SuccessModal from './SuccessModal';
import Pagination from './Pagination';
import ChatSupport from './ChatSupport';
import Cart from './Cart';
import { api } from '../api';
import './CategorySection.css';
import './ProfileEdit.css';
import './SearchBar.css';
import './ProductDetail.css'; // Also for shared components
import '../index.css';

const Shop = ({ language, theme, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // For search in all products
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryRestaurants, setCategoryRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(() => {
        const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
        if (path.includes('/orders')) return 'my_orders';
        if (path.includes('/chat')) return 'chat';
        return 'home';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('punyo_user');
        if (saved) {
            const data = JSON.parse(saved);
            // CRITICAL: Purge any legacy fallback IDs (9,000,000,000+)
            if (data?.telegram_user_id && parseInt(data.telegram_user_id) >= 9000000000) {
                console.warn('DEBUG: Purged legacy fallback identity from storage');
                localStorage.removeItem('punyo_user');
                return null;
            }
            return data;
        }
        return null;
    });
    
    const [useGlobalData, setUseGlobalData] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('tid')) {
            localStorage.removeItem('punyo_use_global_data');
            return false;
        }
        return localStorage.getItem('punyo_use_global_data') === 'true';
    });
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('punyo_favorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [cart, setCart] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(() => {
        const saved = localStorage.getItem('punyo_location');
        return saved ? JSON.parse(saved) : null;
    });
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [showCartSuccess, setShowCartSuccess] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pendingProduct, setPendingProduct] = useState(null);
    const [favoritesPage, setFavoritesPage] = useState(1);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [aboutData, setAboutData] = useState(null);

    // Unread orders state
    const [unreadOrderCounts, setUnreadOrderCounts] = useState({ active: 0, confirmed: 0, canceled: 0 });
    const [totalUnreadOrders, setTotalUnreadOrders] = useState(0);
    const [allUserOrders, setAllUserOrders] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchOrderUpdates = async () => {
            try {
                const userId = currentUser.telegram_user_id || currentUser.id;
                const data = await api.getOrders(userId);
                if (data && data.orders) {
                    setAllUserOrders(data.orders);
                    const savedStr = localStorage.getItem('punyo_last_seen_orders') || '{}';
                    const lastSeenStatuses = JSON.parse(savedStr);
                    
                    let counts = { active: 0, confirmed: 0, canceled: 0 };
                    let totalUnread = 0;
                    
                    data.orders.forEach(order => {
                        const lastStatus = lastSeenStatuses[order.id];
                        if (lastStatus !== order.status) {
                            if (order.status === 'pending') counts.active++;
                            else if (order.status === 'canceled') counts.canceled++;
                            else counts.confirmed++; // active, ready, delivering
                            
                            totalUnread++;
                        }
                    });
                    
                    setUnreadOrderCounts(counts);
                    setTotalUnreadOrders(totalUnread);
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        };
        
        fetchOrderUpdates();
        const intervalId = setInterval(fetchOrderUpdates, 10000);
        return () => clearInterval(intervalId);
    }, [currentUser, view]);

    const handleMarkOrdersAsRead = (tabName) => {
        // Clear UI badge immediately for responsiveness
        setUnreadOrderCounts(prev => {
            const newCounts = { ...prev, [tabName]: 0 };
            setTotalUnreadOrders(newCounts.active + newCounts.confirmed + newCounts.canceled);
            return newCounts;
        });

        if (!allUserOrders || allUserOrders.length === 0) {
            // Force clear ghost notifications if user actually has no orders
            localStorage.removeItem('punyo_last_seen_orders');
            return;
        }
        
        const savedStr = localStorage.getItem('punyo_last_seen_orders') || '{}';
        const lastSeenStatuses = JSON.parse(savedStr);
        let changed = false;
        
        allUserOrders.forEach(order => {
            let matchesTab = false;
            if (tabName === 'active' && order.status === 'pending') matchesTab = true;
            else if (tabName === 'confirmed' && ['active', 'ready', 'delivering'].includes(order.status)) matchesTab = true;
            else if (tabName === 'canceled' && order.status === 'canceled') matchesTab = true;

            const id = String(order.id);
            if (matchesTab && lastSeenStatuses[id] !== order.status) {
                lastSeenStatuses[id] = order.status;
                changed = true;
            }
        });
        
        if (changed) {
            localStorage.setItem('punyo_last_seen_orders', JSON.stringify(lastSeenStatuses));
        }
    };

    useEffect(() => {
        loadAboutData();
    }, []);

    // Sync view with URL path
    useEffect(() => {
        const path = location.pathname.toLowerCase().replace(/\/$/, '');
        if (path.includes('/orders')) {
            setView('my_orders');
        } else if (path.includes('/chat')) {
            setView('chat');
        } else if (path === '' || path === '/') {
            setView('home');
        }
    }, [location.pathname]);

    const loadAboutData = async () => {
        try {
            const data = await api.getAbout();
            if (data) {
                setAboutData(data);
            } else {
                throw new Error('Empty response');
            }
        } catch (error) {
            console.error('Failed to load about data:', error);
            // Fallback default data to stop infinite loading if API fails
            setAboutData({
                phone_number: '+998XXXXXXXXX',
                email: 'shop@example.com',
                address: 'Do\'stlik, Jizzax'
            });
        }
    };
    const [categoryPage, setCategoryPage] = useState(1);

    const updateCurrentUser = (user, source = 'local') => {
        if (user) {
            // CRITICAL: Block any 9bn+ IDs from being saved
            const tid = user.telegram_user_id || (user.id && user.id < 9000000000 ? user.id : null);
            if (tid && parseInt(tid) >= 9000000000) {
                console.error('DEBUG: BLOCKING save of legacy fallback ID:', tid);
                localStorage.removeItem('punyo_user');
                setCurrentUser(null);
                return;
            }

            const saved = localStorage.getItem('punyo_user');
            const current = saved ? JSON.parse(saved) : {};

            // Clean data: if phone_number is "-" or null, treat as empty string
            if (user.phone_number === '-' || user.phone_number === null) {
                user.phone_number = '';
            }

            const merged = source === 'backend'
                ? { ...user }
                : { ...current, ...user };

            console.log(`DEBUG updateCurrentUser (source: ${source}):`, merged);
            localStorage.setItem('punyo_user', JSON.stringify(merged));
            setCurrentUser(merged);
        } else {
            localStorage.removeItem('punyo_user');
            setCurrentUser(null);
        }
    };

    useEffect(() => {
        loadCategories();
        loadAllProducts();
        checkAuth();
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadNotifications();
        }
    }, [currentUser?.telegram_user_id]);

    const loadNotifications = async () => {
        if (!currentUser?.telegram_user_id) return;
        try {
            const data = await api.getNotifications(currentUser.telegram_user_id);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        if (!currentUser?.telegram_user_id) return;
        try {
            await api.markNotificationRead(currentUser.telegram_user_id, notificationId);
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const checkAuth = async () => {
        let retries = 0;
        const maxRetries = 5; // Increased retries

        const attemptAuth = async () => {
            try {
                const telegram = window.Telegram?.WebApp;

                // Priority 0: URL Query Parameter 'tid' (Foolproof fallback from Bot)
                const urlParams = new URLSearchParams(window.location.search);
                const tidParam = urlParams.get('tid');
                let tgUser = tidParam && parseInt(tidParam) > 0 ? { id: parseInt(tidParam) } : telegram?.initDataUnsafe?.user;

                // Priority 2: Manual parse of initData from URL hash (most robust fallback)
                if (!tgUser || !tgUser.id) {
                    try {
                        const hash = window.location.hash.slice(1);
                        const hashParams = new URLSearchParams(hash);
                        const tgWebAppData = hashParams.get('tgWebAppData');
                        const source = tgWebAppData ? new URLSearchParams(tgWebAppData) : hashParams;

                        const userRaw = source.get('user');
                        if (userRaw) tgUser = JSON.parse(userRaw);

                        // Also check for 'tid' in hash just in case of weird routing
                        const tidHash = source.get('tid');
                        if (tidHash && parseInt(tidHash) > 0) tgUser = { id: parseInt(tidHash) };
                    } catch (e) { }
                }

                // Aggressive backup: parse from initData string (useful for some clients/reload scenarios)
                if (!tgUser && telegram?.initData) {
                    try {
                        const params = new URLSearchParams(telegram.initData);
                        const userRaw = params.get('user');
                        if (userRaw) tgUser = JSON.parse(userRaw);
                    } catch (e) {
                        console.warn('DEBUG: Failed to parse initData string', e);
                    }
                }

                console.log(`DEBUG: checkAuth attempt ${retries + 1}, tgUser:`, tgUser);

                if (tgUser && tgUser.id && parseInt(tgUser.id) < 9000000000) {
                    try {
                        const userData = await api.getUserInfo(tgUser.id);
                        if (userData) {
                            if (userData.is_registered === false) {
                                console.log('DEBUG: User exists as guest only. Clearing local auth.');
                                updateCurrentUser(null);
                                return false;
                            }
                            if (userData.language && userData.language !== language) {
                                window.dispatchEvent(new CustomEvent('langChange', { detail: userData.language }));
                            }
                            updateCurrentUser(userData, 'backend');
                            return true;
                        }
                    } catch (e) {
                        console.warn('Backend check failed, using provisional local identity');
                    }

                    // Fallback to local/tg identity if backend is slow/offline but we HAVE tgUser
                    updateCurrentUser({
                        telegram_user_id: tgUser.id,
                        first_name: tgUser.first_name,
                        last_name: tgUser.last_name,
                        username: tgUser.username
                    }, 'telegram');
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Auth check error:', error);
                return false;
            }
        };

        let success = await attemptAuth();
        while (!success && retries < maxRetries) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, 500));
            success = await attemptAuth();
        }
    };

    const loadCategoryRestaurants = async (categoryId) => {
        try {
            const userId = getTelegramUserId();
            const data = await api.getRestaurants(userId, categoryId);
            setCategoryRestaurants(data);
        } catch (error) {
            console.error('Error loading category restaurants:', error);
        }
    };

    useEffect(() => {
        if (selectedCategory) {
            setView('category_restaurants');
            setCategoryPage(1); // Reset to first page if pagination exists
            loadCategoryRestaurants(selectedCategory.id);
        } else if (view === 'category_restaurants' || view === 'category_restaurant_products' || view === 'category_products' || view === 'all_categories') {
            setView('home');
        }
    }, [selectedCategory]);

    const toggleFavorite = (productId) => {
        const newFavorites = favorites.includes(productId)
            ? favorites.filter(id => id !== productId)
            : [...favorites, productId];

        setFavorites(newFavorites);
        localStorage.setItem('punyo_favorites', JSON.stringify(newFavorites));
    };

    const handleAddToCart = (product, quantity, addons = []) => {
        const addonsPrice = addons.reduce((sum, a) => sum + Number(a.price), 0);
        const itemUniqueId = `${product.id}-${addons.map(a => a.id).sort().join('-')}`;
        
        const newItem = {
            product_id: product.id,
            unique_id: itemUniqueId,
            name: product.name,
            name_ru: product.name_ru,
            price: Number(product.price) + addonsPrice,
            base_price: product.price,
            image: product.image,
            quantity: quantity,
            addons: addons,
            restaurant_id: product.restaurant,
            delivery_price: product.delivery_price || 0,
            working_hours: product.working_hours || null
        };

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.unique_id === itemUniqueId || (item.product_id === product.id && !item.unique_id && addons.length === 0));
            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += quantity;
                return newCart;
            }
            return [...prevCart, newItem];
        });

        setSelectedProduct(null);
        setView('cart');
        setShowCartSuccess(true);
        setTimeout(() => setShowCartSuccess(false), 3000);
    };

    const updateCartQuantity = (uniqueId, productId, delta) => {
        setCart(prevCart => prevCart.map(item => {
            const itemKey = item.unique_id || item.product_id;
            const targetKey = uniqueId || productId;
            if (itemKey === targetKey) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeCartItem = (uniqueId, productId) => {
        setCart(prevCart => prevCart.filter(item => {
            const itemKey = item.unique_id || item.product_id;
            const targetKey = uniqueId || productId;
            return itemKey !== targetKey;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleAutoLocation = () => {
        const telegram = window.Telegram?.WebApp;
        if (telegram && telegram.requestLocation) {
            telegram.requestLocation((data) => {
                if (data && data.location) {
                    const loc = {
                        latitude: data.location.latitude,
                        longitude: data.location.longitude,
                        address: 'Telegram Geolocation'
                    };
                    setSelectedLocation(loc);
                    localStorage.setItem('punyo_location', JSON.stringify(loc));
                    setShowLocationPicker(false);
                    if (isCheckingOut) {
                        setIsCheckingOut(false);
                        submitFullOrder(loc);
                    }
                }
            }, (err) => {
                console.error('Geolocation error:', err);
                alert(language === 'ru' ? 'Не удалось получить ваше местоположение' : 'Joylashuvingizni aniqlab bo\'lmadi');
            });
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const loc = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    address: 'Browser Geolocation'
                };
                setSelectedLocation(loc);
                localStorage.setItem('punyo_location', JSON.stringify(loc));
                setShowLocationPicker(false);
                if (isCheckingOut) {
                    setIsCheckingOut(false);
                    submitFullOrder(loc);
                }
            }, () => {
                alert(language === 'ru' ? 'Не удалось получить доступ к геопозиции' : 'Joylashuvni aniqliy olmadi');
            });
        }
    };

    const handleManualLocation = (data) => {
        const normalizedLocation = {
            latitude: data.lat,
            longitude: data.lng,
            address: data.address
        };
        setSelectedLocation(normalizedLocation);
        localStorage.setItem('punyo_location', JSON.stringify(normalizedLocation));
        setShowMapPicker(false);
        if (isCheckingOut) {
            setIsCheckingOut(false);
            submitFullOrder(normalizedLocation);
        }
    };

    const [pendingPromoCode, setPendingPromoCode] = useState(null);

    const submitFullOrder = async (providedLocation = null, promoCode = null) => {
        // 1. Check for Phone Number first
        // We consider it missing if it's null, empty, or just a dash "-"
        const hasPhone = currentUser?.phone_number && currentUser.phone_number !== '-';

        if (promoCode !== null) {
            setPendingPromoCode(promoCode);
        }

        if (!hasPhone) {
            console.log('DEBUG: No valid phone number, opening AuthDrawer');
            setIsCheckingOut(true);
            setIsAuthDrawerOpen(true);
            return;
        }

        // 2. FORCE Location selection every time (per user request)
        if (!providedLocation || !providedLocation.latitude) {
            console.log('DEBUG: Forcing fresh location selection');
            setIsCheckingOut(true);
            setShowLocationPicker(true);
            return;
        }

        const locationToUse = providedLocation;
        const actualPromoCode = promoCode !== null ? promoCode : pendingPromoCode;

        if (cart.length === 0) return;

        setIsSubmittingOrder(true);
        try {
            const orderData = {
                telegram_user_id: currentUser?.telegram_user_id,
                items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
                latitude: locationToUse.latitude,
                longitude: locationToUse.longitude,
                delivery_address: locationToUse.address,
                phone_number: currentUser?.phone_number,
                promo_code: actualPromoCode
            };

            const response = await api.createOrder(orderData);
            if (response.id) {
                setShowSuccessModal(true);
                setCart([]);
            }
        } catch (error) {
            console.error('Order submit error:', error);
            alert(language === 'ru' ? 'Произошла ошибка' : 'Xatolik yuz berdi');
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const handleSidebarItemClick = async (id) => {
        const query = location.search;
        if (id === 'profile') {
            const hasPhone = currentUser?.phone_number && currentUser.phone_number !== '' && currentUser.phone_number !== '-';
            if (hasPhone) {
                navigate('/' + query); // Profile is part of home view but needs to trigger effect or state
                setView('profile');
            } else {
                setIsAuthDrawerOpen(true);
            }
        } else if (id === 'orders') {
            const hasPhone = currentUser?.phone_number && currentUser.phone_number !== '' && currentUser.phone_number !== '-';
            if (hasPhone) {
                setView('my_orders');
                navigate('/orders' + query);
            } else {
                setIsAuthDrawerOpen(true);
            }
        } else if (id === 'favorites') {
            setFavoritesPage(1);
            setView('favorites');
            navigate('/' + query);
        } else if (id === 'notifications') {
            setView('notifications');
            loadNotifications();
            navigate('/' + query);
        } else if (id === 'about') {
            setView('about');
            loadAboutData();
            navigate('/' + query);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await api.getCategories(getTelegramUserId());
            setCategories(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading categories:', error);
            setLoading(false);
        }
    };

    const getTelegramUserId = () => {
        if (useGlobalData) return null;
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const urlParams = new URLSearchParams(window.location.search);
        return tgUser?.id || urlParams.get('tid');
    };

    const loadAllProducts = async () => {
        try {
            const data = await api.getAllProducts(getTelegramUserId());
            setAllProducts(data);
        } catch (error) {
            console.error('Error loading all products:', error);
        }
    };

    const loadCategoryProducts = async (categoryId) => {
        try {
            const data = await api.getCategoryProducts(categoryId, getTelegramUserId());
            // Also update allProducts pool if needed, or just set filtered view
            // For now, we use allProducts as the source for search and favorites
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const filteredProducts = allProducts.filter(product => {
        const name = language === 'ru' ? (product.name_ru || product.name) : product.name;
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

        if (view === 'category_products' && selectedCategory) {
            return matchesSearch && product.category === selectedCategory.id;
        }
        return matchesSearch;
    });

    const filteredCategories = categories.filter(category => {
        const name = language === 'ru' ? (category.name_ru || category.name) : category.name;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return <div className="loading">{language === 'ru' ? 'Загрузка...' : 'Yuklanmoqda...'}</div>;
    }

    const renderContent = () => {
        if (selectedProduct) {
            return (
                <ProductDetail
                    product={selectedProduct}
                    language={language}
                    onBack={() => setSelectedProduct(null)}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                    selectedLocation={selectedLocation}
                    onShowLocationPicker={() => setShowLocationPicker(true)}
                />
            );
        }

        if (view === 'all_categories') {
            return (
                <div className="all-categories-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setView('home')}>←</span>
                        {language === 'ru' ? 'ВСE КАТЕГОРИИ' : 'BARCHA KATEGORIYALAR'}
                    </div>
                    <div className="categories-grid">
                        {categories.map(cat => (
                            <div key={cat.id} className="category-item-large" onClick={() => setSelectedCategory(cat)}>
                                <div className="category-image-container">
                                    {cat.image_base64 || cat.image ? (
                                        <img src={cat.image_base64 || api.getImageUrl(cat.image)} alt={cat.name} />
                                    ) : (
                                        <span className="category-icon">📦</span>
                                    )}
                                </div>
                                <span>{language === 'ru' ? (cat.name_ru || cat.name) : cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (view === 'all_restaurants') {
            return (
                <RestaurantList 
                    language={language} 
                    isFullView={true} 
                    onBack={() => setView('home')} 
                    onSelectRestaurant={(rest) => {
                        setSelectedRestaurant(rest);
                        setView('restaurant_detail');
                    }}
                />
            );
        }

        if (view === 'restaurant_detail' && selectedRestaurant) {
            return (
                <RestaurantDetail
                    restaurant={selectedRestaurant}
                    categories={categories}
                    language={language}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onBack={() => {
                        setSelectedRestaurant(null);
                        setView('home');
                    }}
                    onProductClick={(p) => {
                        if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                            setPendingProduct(p);
                            setIsAuthDrawerOpen(true);
                        } else {
                            setSelectedProduct(p);
                        }
                    }}
                />
            );
        }

        if (view === 'category_restaurants' && selectedCategory) {
            return (
                <div style={{ paddingBottom: '80px' }}>
                    <RestaurantList
                        language={language}
                        isFullView={true}
                        customRestaurants={categoryRestaurants}
                        categoryTitle={language === 'ru'
                            ? (selectedCategory?.name_ru || selectedCategory?.name)?.toUpperCase()
                            : selectedCategory?.name?.toUpperCase()}
                        onBack={() => setSelectedCategory(null)}
                        onSelectRestaurant={(rest) => {
                            setSelectedRestaurant(rest);
                            setView('category_restaurant_products');
                        }}
                    />
                </div>
            );
        }

        if (view === 'category_restaurant_products' && selectedCategory && selectedRestaurant) {
            const restProducts = allProducts.filter(p => p.restaurant === selectedRestaurant.id && p.category === selectedCategory.id);
            const filteredRestProducts = restProducts.filter(product => {
                const name = language === 'ru' ? (product.name_ru || product.name) : product.name;
                return name.toLowerCase().includes(searchQuery.toLowerCase());
            });

            return (
                <div className="detail-view" style={{ paddingBottom: '80px' }}>
                    <div className="category-title">
                        <span className="back-btn" onClick={() => {
                            setSelectedRestaurant(null);
                            setView('category_restaurants');
                        }}>←</span>
                        {selectedRestaurant.name.toUpperCase()} - {language === 'ru'
                            ? (selectedCategory?.name_ru || selectedCategory?.name)?.toUpperCase()
                            : selectedCategory?.name?.toUpperCase()}
                    </div>
                    {filteredRestProducts.length > 0 ? (
                        <ProductGrid
                            products={filteredRestProducts}
                            language={language}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            onProductClick={(p) => {
                                if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                    setPendingProduct(p);
                                    setIsAuthDrawerOpen(true);
                                } else {
                                    setSelectedProduct(p);
                                }
                            }}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
                            <svg style={{ marginBottom: '16px', opacity: 0.5 }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <p style={{ fontSize: '16px' }}>{language === 'ru' ? 'В этом заведении пока нет блюд этой категории' : 'Ushbu restoranda bu kategoriyaga oid mahsulotlar hozircha yo\'q'}</p>
                        </div>
                    )}
                </div>
            );
        }

        if (view === 'category_products' && selectedCategory) {
            return (
                <div className="detail-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setSelectedCategory(null)}>←</span>
                        {language === 'ru'
                            ? (selectedCategory?.name_ru || selectedCategory?.name)?.toUpperCase()
                            : selectedCategory?.name?.toUpperCase()}
                    </div>
                    <ProductGrid
                        products={filteredProducts}
                        language={language}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        onProductClick={(p) => {
                            if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                setPendingProduct(p);
                                setIsAuthDrawerOpen(true);
                            } else {
                                setSelectedProduct(p);
                            }
                        }}
                    />
                </div>
            );
        }

        if (view === 'cart') {
            return (
                <Cart 
                    cart={cart}
                    language={language}
                    onUpdateQuantity={updateCartQuantity}
                    onRemoveItem={removeCartItem}
                    onCheckout={(promo) => submitFullOrder(null, promo)}
                    onBack={() => setView('home')}
                />
            );
        }

        if (view === 'profile' && currentUser) {
            return (
                <ProfileEdit
                    user={currentUser}
                    language={language}
                    onBack={() => setView('home')}
                    onSave={(updated) => {
                        if (updated === null) {
                            updateCurrentUser(null);
                        } else {
                            updateCurrentUser(updated);
                        }
                        setView('home');
                    }}
                />
            );
        }

        if (view === 'chat') {
            if (currentUser) {
                return <ChatSupport user={currentUser} language={language} onBack={() => setView('home')} />;
            }
            return <div className="loading">{language === 'ru' ? 'Загрузка чата...' : 'Chat yuklanmoqda...'}</div>;
        }

        if (view === 'my_orders') {
            if (currentUser) {
                return (
                    <MyOrders 
                        user={currentUser} 
                        language={language} 
                        onBack={() => setView('home')}
                        unreadCounts={unreadOrderCounts}
                        onMarkAsRead={handleMarkOrdersAsRead}
                        cachedOrders={allUserOrders}
                    />
                );
            }
            return <div className="loading">{language === 'ru' ? 'Загрузка заказов...' : 'Buyurtmalar yuklanmoqda...'}</div>;
        }

        if (view === 'notifications') {
            return (
                <Notifications
                    notifications={notifications}
                    language={language}
                    onMarkRead={handleMarkAsRead}
                    onBack={() => setView('home')}
                />
            );
        }

        if (view === 'about') {
            return <AboutUs about={aboutData} language={language} onBack={() => setView('home')} />;
        }

        if (view === 'favorites') {
            const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

            return (
                <div className="favorites-view">
                    <div className="category-title">
                        <span className="back-btn" onClick={() => setView('home')}>←</span>
                        {language === 'ru' ? 'ИЗБРАННОЕ' : 'SEVIMLILAR'}
                    </div>
                    {favoriteProducts.length > 0 ? (
                        <>
                            <ProductGrid
                                products={favoriteProducts}
                                language={language}
                                favorites={favorites}
                                onToggleFavorite={toggleFavorite}
                                onProductClick={(p) => {
                                    if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                        setPendingProduct(p);
                                        setIsAuthDrawerOpen(true);
                                    } else {
                                        setSelectedProduct(p);
                                    }
                                }}
                            />
                        </>
                    ) : (
                            <div className="empty-favorites">
                            <div className="empty-favorites-icon">❤️</div>
                            <h3>{language === 'ru' ? 'Здесь пока пусто...' : 'Bu yer hozircha bo\'sh...'}</h3>
                            <p>{language === 'ru' ? 'У вас пока нет избранных товаров. Добавьте то, что вам понравилось!' : 'Sizda hozircha sevimlilar yo\'q. O\'zingizga yoqqan mahsulotlarni qo\'shing!'}</p>
                            <button className="go-shopping-btn" onClick={() => setView('home')}>
                                {language === 'ru' ? 'Перейти к покупкам' : 'Xarid qilishni boshlash'}
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        // Default: Home View
        return (
            <div className="home-content">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} language={language} />
                
                {searchQuery ? (
                    <div className="search-results">
                        <div className="category-title" style={{ marginBottom: '20px' }}>
                            <span className="back-btn" onClick={() => setSearchQuery('')}>←</span>
                            {language === 'ru' ? 'РЕЗУЛЬТАТЫ ПОИСКА' : 'QIDIRUV NATIJALARI'}
                        </div>
                        
                        {filteredCategories.length > 0 && (
                            <div className="search-section" style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: '0 20px 15px', fontSize: '18px', color: '#fff', fontWeight: '600' }}>
                                    {language === 'ru' ? 'Категории' : 'Kategoriyalar'}
                                </h3>
                                <div className="category-grid">
                                    {filteredCategories.map(cat => (
                                        <div key={cat.id} className="category-item" onClick={() => {
                                            setSelectedCategory(cat);
                                            setSearchQuery('');
                                        }}>
                                            <div className="category-image-container">
                                                {cat.image_base64 || cat.image ? (
                                                    <img src={cat.image_base64 || api.getImageUrl(cat.image)} alt={cat.name} />
                                                ) : (
                                                    <div className="placeholder-image"></div>
                                                )}
                                            </div>
                                            <span className="category-name">{language === 'ru' ? (cat.name_ru || cat.name) : cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredProducts.length > 0 && (
                            <div className="search-section">
                                <h3 style={{ margin: '0 20px 15px', fontSize: '18px', color: '#fff', fontWeight: '600' }}>
                                    {language === 'ru' ? 'Продукты' : 'Mahsulotlar'}
                                </h3>
                                <ProductGrid
                                    products={filteredProducts}
                                    language={language}
                                    favorites={favorites}
                                    onToggleFavorite={toggleFavorite}
                                    onProductClick={(p) => {
                                        if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                            setPendingProduct(p);
                                            setIsAuthDrawerOpen(true);
                                        } else {
                                            setSelectedProduct(p);
                                        }
                                    }}
                                />
                            </div>
                        )}
                        
                        {filteredCategories.length === 0 && filteredProducts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
                                <svg style={{ marginBottom: '16px', opacity: 0.5 }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <p style={{ fontSize: '16px' }}>{language === 'ru' ? 'Ничего не найдено' : 'Hech narsa topilmadi'}</p>
                                <p style={{ fontSize: '14px', marginTop: '8px' }}>{language === 'ru' ? 'Попробуйте изменить запрос' : 'Boshqa so\'z kiritib ko\'ring'}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <PromoBanner language={language} />
                        <CategoryList
                            categories={categories}
                            selectedCategory={null}
                            onSelectCategory={setSelectedCategory}
                            onShowAllCategories={() => setView('all_categories')}
                            language={language}
                        />
                        
                        <RestaurantList 
                            language={language}
                            useGlobalData={useGlobalData}
                            onEnableGlobalData={() => {
                                setUseGlobalData(true);
                                localStorage.setItem('punyo_use_global_data', 'true');
                                // Reload products
                                loadAllProducts();
                                loadCategories();
                            }}
                            onShowAll={() => setView('all_restaurants')} 
                            onSelectRestaurant={(rest) => {
                                setSelectedRestaurant(rest);
                                setView('restaurant_detail');
                            }}
                        />
                        
                        <div className="featured-sections">
                            {categories.map(category => (
                                <CategorySection
                                    key={category.id}
                                    category={category}
                                    language={language}
                                    useGlobalData={useGlobalData}
                                    favorites={favorites}
                                    onToggleFavorite={toggleFavorite}
                                    onProductClick={(p) => {
                                        if (!currentUser || !currentUser.phone_number || currentUser.phone_number === '-') {
                                            setPendingProduct(p);
                                            setIsAuthDrawerOpen(true);
                                        } else {
                                            setSelectedProduct(p);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const getRestaurantWorkingHours = () => {
        if (cart.length === 0) return null;
        const product = allProducts.find(p => p.id === cart[0].product_id);
        if (product && product.working_hours) {
            return product.working_hours;
        }
        return cart[0].working_hours || null;
    };

    return (
        <div className="shop-view">
            <AuthDrawer
                isOpen={isAuthDrawerOpen}
                onClose={() => {
                    setIsAuthDrawerOpen(false);
                    setIsCheckingOut(false);
                    // Clear secondary flags
                    window._pendingLocationAfterAuth = false;
                }}
                language={language}
                user={currentUser}
                onAuthenticated={(user) => {
                    updateCurrentUser(user);
                    setIsAuthDrawerOpen(false); // Always close drawer first

                    if (isCheckingOut || window._pendingLocationAfterAuth) {
                        // Phone registered, now move to location step
                        setShowLocationPicker(true);
                        window._pendingLocationAfterAuth = false;
                    } else if (pendingProduct) {
                        setSelectedProduct(pendingProduct);
                        setPendingProduct(null);
                    } else {
                        setView('profile');
                    }
                }}
            />

            {/* New App Header matching Screenshot */}
            <header className="app-header">
                <div className="header-brand">
                    <span className="brand-punyo">PUNYO</span>
                    <span className="brand-go">GO</span>
                </div>
                <div className="header-actions">
                    <button className="notification-btn" onClick={() => handleSidebarItemClick('notifications')}>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {unreadCount > 0 && <span className="notification-badge"></span>}
                    </button>
                </div>
            </header>
            {/* Location Display beneath header */}
            {view === 'home' && (
                <div className="location-selector">
                    <span className="location-pin">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="#FFCC00" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </span>
                    <span className="location-text">
                        {currentUser?.district || (language === 'ru' ? 'Район не выбран' : 'Tuman tanlanmagan')}
                    </span>
                </div>
            )}

            <main className="main-content pb-20">
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <BottomNav 
                currentView={view} 
                onViewChange={(newView) => {
                    if (['orders', 'profile'].includes(newView)) {
                        handleSidebarItemClick(newView);
                    } else {
                        setView(newView);
                    }
                }} 
                language={language} 
                unreadOrdersCount={totalUnreadOrders}
            />

            {showCartSuccess && (
                <div className="cart-success-toast">
                    <div className="toast-content">
                        <span className="check-icon">✅</span>
                        <span>{language === 'ru' ? 'Товар добавлен в корзину!' : 'Mahsulot savatga qo\'shildi!'}</span>
                    </div>
                </div>
            )}

            {showLocationPicker && (
                <LocationPicker
                    language={language}
                    restaurantWorkingHours={getRestaurantWorkingHours()}
                    onCancel={() => setShowLocationPicker(false)}
                    onAutoLocation={handleAutoLocation}
                    onManualLocation={() => {
                        setShowLocationPicker(false);
                        setShowMapPicker(true);
                    }}
                />
            )}

            {showMapPicker && (
                <MapPicker
                    language={language}
                    onCancel={() => setShowMapPicker(false)}
                    onConfirm={handleManualLocation}
                />
            )}

            {showSuccessModal && (
                <SuccessModal
                    language={language}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
        </div>
    );
};

export default Shop;
