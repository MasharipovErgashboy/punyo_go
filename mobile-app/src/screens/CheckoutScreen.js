import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking, Modal, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useCart } from '../context/CartContext';
import { Orders, getDeviceUserId } from '../api/client';
import colors from '../theme/colors';

const DEFAULT = { latitude: 40.1158, longitude: 67.8422 }; // Jizzax

export default function CheckoutScreen({ navigation }) {
  const { items, total, restaurant, clear } = useCart();
  const [phone, setPhone] = useState('+998');
  const [coord, setCoord] = useState(DEFAULT);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // {phone}

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setCoord({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch (e) {}
    })();
  }, []);

  const delivery = Number(restaurant?.delivery_price || 0);
  const grand = total + delivery;

  const submit = async () => {
    if (phone.replace(/\D/g, '').length < 9) return Alert.alert('Telefon', 'Telefon raqamingizni to‘g‘ri kiriting.');
    if (!items.length) return;
    setSubmitting(true);
    try {
      const uid = await getDeviceUserId();
      const resp = await Orders.create({
        telegram_user_id: uid,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        phone_number: phone,
        latitude: coord.latitude,
        longitude: coord.longitude,
        delivery_address: address || '📍 Xaritada belgilangan',
      });
      if (resp && resp.id) {
        const rphone = resp.restaurant_phone || restaurant?.phone;
        clear();
        setDone({ phone: rphone });
      } else {
        Alert.alert('Xatolik', resp?.error || 'Buyurtma yuborilmadi.');
      }
    } catch (e) {
      Alert.alert('Xatolik', e?.response?.data?.error || e?.message || 'Buyurtma yuborilmadi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.map}>
        <MapView
          style={{ flex: 1 }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={{ ...coord, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          onPress={(e) => setCoord(e.nativeEvent.coordinate)}
        >
          <Marker coordinate={coord} draggable onDragEnd={(e) => setCoord(e.nativeEvent.coordinate)} />
        </MapView>
        <Text style={styles.mapHint}>Joyni belgilash uchun xaritaga bosing yoki belgini suring</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={styles.label}>Telefon raqam</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+998 __ ___ __ __" />
        <Text style={styles.label}>Manzil (ixtiyoriy)</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Uy, ko'cha, mo'ljal" />

        <View style={styles.sumRow}><Text style={styles.sumLbl}>Jami</Text><Text style={styles.sumVal}>{grand.toLocaleString()} so'm</Text></View>

        <TouchableOpacity style={[styles.btn, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>Tasdiqlash va buyurtma berish</Text>}
        </TouchableOpacity>
      </View>

      <Modal visible={!!done} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={{ fontSize: 44 }}>📞</Text>
            <Text style={styles.modalTitle}>Yana bir qadam!</Text>
            <Text style={styles.modalText}>
              Buyurtmangiz restoranga yuborildi. Iltimos, quyidagi raqamga qo'ng'iroq qilib:
              «Punyo Go orqali buyurtma berdim, buyurtmamni tasdiqlab oling», deng.
            </Text>
            {!!done?.phone && <Text style={styles.modalPhone}>{done.phone}</Text>}
            <TouchableOpacity style={styles.btn} onPress={() => done?.phone && Linking.openURL(`tel:${done.phone}`)}>
              <Text style={styles.btnTxt}>📞 Qo'ng'iroq qilish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => { setDone(null); navigation.getParent()?.navigate('BoshSahifa'); }}>
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Yopish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { height: 260 },
  mapHint: { position: 'absolute', bottom: 8, left: 8, right: 8, textAlign: 'center', color: '#fff', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: 6, fontSize: 12 },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  sumLbl: { color: colors.text, fontSize: 16, fontWeight: '800' },
  sumVal: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  btn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: colors.card, borderRadius: 20, padding: 24, alignItems: 'center', width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 8 },
  modalText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  modalPhone: { fontSize: 22, fontWeight: '800', color: colors.primary, marginTop: 16, letterSpacing: 1 },
});
