import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { Restaurants, Catalog, imgOf } from '../api/client';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

function Banner({ ads }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!ads.length) return;
    const t = setInterval(() => {
      const next = (idx + 1) % ads.length;
      setIdx(next);
      ref.current?.scrollTo({ x: next * (width - 32), animated: true });
    }, 4000);
    return () => clearInterval(t);
  }, [idx, ads.length]);
  if (!ads.length) return null;
  return (
    <View style={{ marginTop: 12 }}>
      <ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / (width - 32)))}>
        {ads.map((a) => (
          <Image key={a.id} source={{ uri: imgOf(a) }} style={styles.banner} resizeMode="cover" />
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {ads.map((_, i) => <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />)}
      </View>
    </View>
  );
}

function RestaurantCard({ item, onPress }) {
  const wh = item.working_hours;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: imgOf(item) }} style={styles.cardImg} resizeMode="cover" />
      <View style={{ padding: 12 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
          <Text style={styles.meta}>📍 {item.location}</Text>
          {wh && <Text style={[styles.meta, { marginLeft: 10 }]}>🕒 {wh.start_time}–{wh.end_time}</Text>}
        </View>
        {item.delivery_price != null && (
          <Text style={[styles.meta, { marginTop: 4 }]}>🛵 Yetkazish: {Number(item.delivery_price).toLocaleString()} so'm</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [rs, ad] = await Promise.all([Restaurants.list(), Catalog.ads().catch(() => [])]);
      setRestaurants(rs.filter((r) => r.is_active !== false));
      setAds(ad);
    } catch (e) {
      console.warn('load error', e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      ListHeaderComponent={<>
        <Banner ads={ads} />
        <Text style={styles.section}>Restoranlar</Text>
      </>}
      data={restaurants}
      keyExtractor={(i) => String(i.id)}
      renderItem={({ item }) => <RestaurantCard item={item} onPress={() => navigation.navigate('Restaurant', { restaurant: item })} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
      ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 40 }}>Restoran topilmadi</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  banner: { width: width - 32, height: (width - 32) * 0.5, borderRadius: 16, backgroundColor: colors.border },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border, marginHorizontal: 3 },
  dotActive: { backgroundColor: colors.primary, width: 18 },
  section: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: colors.card, borderRadius: 16, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  cardImg: { width: '100%', height: 150, backgroundColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
});
