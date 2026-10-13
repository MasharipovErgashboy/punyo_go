import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Restaurants, imgOf } from '../api/client';
import { useCart } from '../context/CartContext';
import colors from '../theme/colors';

export default function RestaurantScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, replaceWith, count } = useCart();

  useLayoutEffect(() => { navigation.setOptions({ title: restaurant.name }); }, [navigation]);

  useEffect(() => {
    Restaurants.products(restaurant.id)
      .then((p) => setProducts(p.filter((x) => x.is_active !== false)))
      .catch((e) => console.warn(e?.message))
      .finally(() => setLoading(false));
  }, []);

  const onAdd = (product) => {
    addItem(product, restaurant, () => {
      Alert.alert(
        'Boshqa restoran',
        'Savatda boshqa restoran taomlari bor. Savatni tozalab, shu restorandan boshlaysizmi?',
        [
          { text: 'Yo‘q', style: 'cancel' },
          { text: 'Ha', onPress: () => replaceWith(product, restaurant) },
        ]
      );
    });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        data={products}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: imgOf(item) }} style={styles.img} resizeMode="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              {!!item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
              <Text style={styles.price}>{Number(item.price).toLocaleString()} so'm</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(item)}>
              <Text style={styles.addTxt}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 40 }}>Mahsulot yo'q</Text>}
      />
      {count > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => navigation.getParent()?.navigate('Savatcha')}>
          <Text style={styles.cartBarTxt}>Savatcha ({count}) ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  img: { width: 72, height: 72, borderRadius: 10, backgroundColor: colors.border },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  desc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '800', color: colors.primary, marginTop: 6 },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addTxt: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: -2 },
  cartBar: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  cartBarTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
