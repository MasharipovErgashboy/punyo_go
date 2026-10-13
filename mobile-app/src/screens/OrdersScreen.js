import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orders, getDeviceUserId } from '../api/client';
import colors from '../theme/colors';

const STATUS = {
  pending: { t: 'Kutilmoqda', c: '#FF9800' },
  active: { t: 'Qabul qilindi', c: '#2196F3' },
  ready: { t: 'Yetkazishga tayyor', c: '#9C27B0' },
  delivering: { t: 'Yetkazilmoqda', c: '#3F51B5' },
  completed: { t: 'Yakunlandi', c: colors.success },
  canceled: { t: 'Bekor qilindi', c: colors.danger },
};
const STEPS = ['pending', 'active', 'ready', 'delivering', 'completed'];

function Tracker({ status }) {
  if (status === 'canceled') return null;
  const idx = STEPS.indexOf(status);
  return (
    <View style={styles.track}>
      {STEPS.map((s, i) => (
        <View key={s} style={styles.step}>
          <View style={[styles.dot, i <= idx && { backgroundColor: colors.primary }]} />
          {i < STEPS.length - 1 && <View style={[styles.line, i < idx && { backgroundColor: colors.primary }]} />}
        </View>
      ))}
    </View>
  );
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const uid = await getDeviceUserId();
      const data = await Orders.all(uid);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) { console.warn(e?.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Text style={styles.header}>Buyurtmalar</Text>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={orders}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          const st = STATUS[item.status] || { t: item.status, c: colors.textMuted };
          return (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.oid}>Buyurtma #{item.id}</Text>
                <View style={[styles.badge, { backgroundColor: st.c + '22' }]}><Text style={[styles.badgeTxt, { color: st.c }]}>{st.t}</Text></View>
              </View>
              {(item.items || []).map((it) => (
                <Text key={it.id} style={styles.item}>{it.product_name} × {it.quantity}</Text>
              ))}
              <Text style={styles.total}>Jami: {Number(item.total_amount).toLocaleString()} so'm</Text>
              <Tracker status={item.status} />
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 40 }}>Hali buyurtma yo'q</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  header: { fontSize: 22, fontWeight: '800', color: colors.text, paddingHorizontal: 16, paddingTop: 10 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  oid: { fontSize: 16, fontWeight: '800', color: colors.text },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  item: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  total: { fontSize: 15, fontWeight: '800', color: colors.primary, marginTop: 8 },
  track: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  step: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.border },
  line: { flex: 1, height: 3, backgroundColor: colors.border, marginHorizontal: 2 },
});
