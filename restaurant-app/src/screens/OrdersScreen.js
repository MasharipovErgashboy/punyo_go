import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Partner, money } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { fireNewOrderAlert, getPushToken } from '../notifications';
import { colors } from '../theme/colors';

const STATUS_META = {
  pending: { label: 'Yangi', color: colors.yellow },
  active: { label: 'Qabul qilindi', color: colors.green },
  ready: { label: 'Tayyor', color: colors.blue },
  delivering: { label: "Yo'lda", color: colors.blue },
  completed: { label: 'Yakunlandi', color: colors.textMuted },
  canceled: { label: 'Rad etildi', color: colors.red },
};

const FILTERS = [
  { key: 'new', label: 'Yangi' },
  { key: 'open', label: 'Faol' },
  { key: 'all', label: 'Hammasi' },
];

const POLL_MS = 10000;

export default function OrdersScreen({ navigation }) {
  const { auth, logout } = useAuth();
  const [filter, setFilter] = useState('new');
  const [orders, setOrders] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const prevNewCount = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: auth?.restaurants?.[0]?.name || 'Buyurtmalar',
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Chiqish', 'Tizimdan chiqmoqchimisiz?', [
              { text: 'Yoʻq', style: 'cancel' },
              { text: 'Ha', style: 'destructive', onPress: logout },
            ])
          }
          style={{ paddingHorizontal: 6 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Chiqish</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, auth, logout]);

  // Register push token once (best-effort; polling is the primary signal).
  useEffect(() => {
    (async () => {
      const token = await getPushToken();
      if (token && auth?.restaurants?.[0]?.id) {
        try {
          await Partner.registerPushToken(token, auth.restaurants[0].id, 'Restoran qurilmasi');
        } catch (e) {}
      }
    })();
  }, [auth]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await Partner.orders(filter);
      setOrders(data.orders || []);
      const nc = data.new_count || 0;
      setNewCount(nc);
      if (prevNewCount.current !== null && nc > prevNewCount.current) {
        fireNewOrderAlert(nc - prevNewCount.current);
      }
      prevNewCount.current = nc;
    } catch (e) {
      if (e?.response?.status === 401) {
        Alert.alert('Sessiya tugadi', 'Qaytadan kiring', [{ text: 'OK', onPress: logout }]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, logout]);

  // Reload when filter changes.
  useEffect(() => { load(); }, [filter]);

  // Poll while the screen is focused.
  useFocusEffect(
    useCallback(() => {
      load(true);
      const id = setInterval(() => load(true), POLL_MS);
      return () => clearInterval(id);
    }, [load])
  );

  const onRefresh = () => { setRefreshing(true); load(true); };

  const renderItem = ({ item }) => {
    const meta = STATUS_META[item.status] || { label: item.status, color: colors.textMuted };
    const itemCount = (item.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
    const time = new Date(item.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return (
      <TouchableOpacity
        style={[styles.card, item.status === 'pending' && styles.cardNew]}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
      >
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <View style={[styles.badge, { backgroundColor: meta.color }]}>
            <Text style={styles.badgeText}>{meta.label}</Text>
          </View>
        </View>
        <Text style={styles.cust}>{item.user_name || 'Mijoz'} · {item.phone_number}</Text>
        <Text style={styles.addr} numberOfLines={1}>📍 {item.delivery_address || 'Manzil yoʻq'}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.items}>{itemCount} ta mahsulot</Text>
          <Text style={styles.total}>{money(item.total_amount)}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
              {f.key === 'new' && newCount > 0 ? ` (${newCount})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 48 }}>🍽️</Text>
              <Text style={styles.empty}>Buyurtma yoʻq</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  empty: { color: colors.textMuted, fontSize: 16, marginTop: 10, fontWeight: '600' },
  filters: {
    flexDirection: 'row', padding: 10, gap: 8, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20,
    backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontWeight: '700', color: colors.textMuted },
  filterTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  cardNew: { borderColor: colors.yellow, borderWidth: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 20, fontWeight: '900', color: colors.text },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  cust: { marginTop: 10, fontSize: 15, fontWeight: '700', color: colors.text },
  addr: { marginTop: 4, color: colors.textMuted, fontSize: 14 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  items: { color: colors.textMuted, fontWeight: '600' },
  total: { fontSize: 18, fontWeight: '900', color: colors.primary },
  time: { position: 'absolute', top: 14, right: 110, color: colors.textMuted, fontSize: 12, display: 'none' },
});
