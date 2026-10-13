import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://punyogo.uz/api';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

// Until real auth lands, each install gets a stable pseudo telegram_user_id so
// orders/history work. Replace with real login later.
let cachedUserId = null;
export async function getDeviceUserId() {
  if (cachedUserId) return cachedUserId;
  let id = await AsyncStorage.getItem('pg_device_uid');
  if (!id) {
    id = String(9000000000 + Math.floor(Math.random() * 899999999));
    await AsyncStorage.setItem('pg_device_uid', id);
  }
  cachedUserId = id;
  return id;
}

// Images: products/categories/restaurants ship optimized base64; fall back to URL.
export const imgOf = (obj) =>
  obj?.image_base64 || (obj?.image ? (obj.image.startsWith('http') ? obj.image : `https://punyogo.uz${obj.image}`) : null);

export const Restaurants = {
  list: () => api.get('/restaurants/').then((r) => r.data.results || r.data),
  products: (restaurantId) =>
    api.get(`/products/restaurant/${restaurantId}/products/`).then((r) => r.data.results || r.data),
};
export const Catalog = {
  categories: () => api.get('/products/categories/').then((r) => r.data.results || r.data),
  allProducts: () => api.get('/products/all/').then((r) => r.data.results || r.data),
  ads: () => api.get('/users/advertisements/').then((r) => r.data.results || r.data),
};
export const Orders = {
  create: (payload) => api.post('/orders/create/', payload).then((r) => r.data),
  all: (uid) => api.get(`/orders/all/?telegram_user_id=${uid}`).then((r) => r.data.orders || r.data),
  validatePromo: (code) => api.post('/orders/validate-promo/', { code }).then((r) => r.data),
};

export default api;
