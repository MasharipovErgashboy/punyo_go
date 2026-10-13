import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { imgOf } from '../api/client';
import colors from '../theme/colors';

export default function CartScreen({ navigation }) {
  const { items, setQty, total, restaurant } = useCart();

  if (!items.length)
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 44 }}>🛒</Text>
        <Text style={{ color: colors.textMuted, marginTop: 10 }}>Savat bo'sh</Text>
      </View>
    );

  const delivery = Number(restaurant?.delivery_price || 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={<Text style={styles.rest}>{restaurant?.name}</Text>}
        data={items}
        keyExtractor={(i) => String(i.product.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: imgOf(item.product) }} style={styles.img} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.price}>{Number(item.product.price).toLocaleString()} so'm</Text>
            </View>
            <View style={styles.qty}>
              <TouchableOpacity onPress={() => setQty(item.product.id, -1)} style={styles.qtyBtn}><Text style={styles.qtyTxt}>−</Text></TouchableOpacity>
              <Text style={styles.qtyNum}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => setQty(item.product.id, 1)} style={styles.qtyBtn}><Text style={styles.qtyTxt}>+</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.sumRow}><Text style={styles.sumLbl}>Mahsulotlar</Text><Text style={styles.sumVal}>{total.toLocaleString()} so'm</Text></View>
        {delivery > 0 && <View style={styles.sumRow}><Text style={styles.sumLbl}>Yetkazib berish</Text><Text style={styles.sumVal}>{delivery.toLocaleString()} so'm</Text></View>}
        <View style={styles.sumRow}><Text style={[styles.sumLbl, { fontWeight: '800', color: colors.text }]}>Jami</Text><Text style={[styles.sumVal, { fontWeight: '800', color: colors.primary }]}>{(total + delivery).toLocaleString()} so'm</Text></View>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.btnTxt}>Buyurtma berish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  rest: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  img: { width: 60, height: 60, borderRadius: 10, backgroundColor: colors.border },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  price: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 4 },
  qty: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  qtyTxt: { fontSize: 18, fontWeight: '700', color: colors.text },
  qtyNum: { marginHorizontal: 12, fontSize: 16, fontWeight: '700', color: colors.text },
  footer: { backgroundColor: colors.card, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLbl: { color: colors.textMuted, fontSize: 14 },
  sumVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
  btn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
