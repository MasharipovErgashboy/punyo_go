import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://punyogo.uz/api';

const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

let authToken = null;

export function setAuthToken(t) {
  authToken = t;
}

client.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Token ${authToken}`;
  return config;
});

// Persisted auth helpers ----------------------------------------------------
const AUTH_KEY = 'partner_auth';

export async function saveAuth(auth) {
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch (e) {}
  setAuthToken(auth?.token || null);
}

export async function loadAuth() {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw);
    setAuthToken(auth?.token || null);
    return auth;
  } catch (e) {
    return null;
  }
}

export async function clearAuth() {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
  } catch (e) {}
  setAuthToken(null);
}

// API -----------------------------------------------------------------------
export const Partner = {
  async login(username, password) {
    const { data } = await client.post('/restaurants/partner/login/', { username, password });
    return data; // { token, name, restaurants: [{id, name}] }
  },
  async orders(status = 'open') {
    const { data } = await client.get('/restaurants/partner/orders/', { params: { status } });
    return data; // { orders: [...], new_count }
  },
  async accept(id) {
    const { data } = await client.post(`/restaurants/partner/orders/${id}/accept/`);
    return data;
  },
  async reject(id, reason) {
    const { data } = await client.post(`/restaurants/partner/orders/${id}/reject/`, { reason });
    return data;
  },
  async complete(id) {
    const { data } = await client.post(`/restaurants/partner/orders/${id}/complete/`);
    return data;
  },
  async registerPushToken(token, restaurant_id, device_name) {
    const { data } = await client.post('/restaurants/partner/push-token/', {
      token, restaurant_id, device_name,
    });
    return data;
  },
};

export function money(n) {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";
}
