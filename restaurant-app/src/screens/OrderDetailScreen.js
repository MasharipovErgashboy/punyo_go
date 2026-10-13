import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { Partner, money } from '../api/client';
import { colors } from '../theme/colors';

const STATUS_LABEL = {
  pending: 'Yangi', active: 'Qabul qilindi', ready: 'Tayyor',
  delivering: "Yo'lda", completed: 'Yakunlandi', canceled: 'Rad etildi',
};

export default function OrderDetailScreen({ route, navigation }) {
  const initial = route.params?.order || {};
  const [order, setOrder] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const call = () => {
    if (order.phone_number) Linking.openURL(`tel:${order.phone_number}`);
  };

  const openMap = () => {
    if (order.latitude && order.longitude) {
      Linking.openURL(`https://maps.google.com/?q=${order.latitude},${order.longitude}`);
    } else if (order.delivery_address) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(order.delivery_address)}`);
    }
  };

  const doAction = async (fn, successMsg) => {
    setBusy(true);
    try {
      const res = await fn();
      if (res?.order) setOrder(res.order);
      Alert.alert('✅', successMsg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Xatolik', e?.response?.data?.error || 'Amal bajarilmadi');
    } finally {
      setBusy(false);
    }
  };

  const accept = () => doAction(() => Partner.accept(order.id), 'Buyurtma qabul qilindi');
  const complete = () => doAction(() => Partner.complete(order.id), 'Yetkazildi deb belgilandi');
  const submitReject = () => {
    setRejectOpen(false);
    doAction(() => Partner.reject(order.id, reason.trim()), 'Buyurtma rad etildi');
  };

  const items = order.items || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        <View style={styles.headRow}>
          <Text style={styles.orderId}>#{order.id}</Text>
          <Text style={styles.status}>{STATUS_LABEL[order.status] || order.status}</Text>
        </View>

        {/* Customer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mijoz</Text>
          <Text style={styles.name}>{order.user_name || 'Mijoz'}</Text>
          <TouchableOpacity style={styles.callBtn} onPress={call}>
            <Text style={styles.callText}>📞 {order.phone_number || '—'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapRow} onPress={openMap}>
            <Text style={styles.addr}>📍 {order.delivery_address || 'Manzil koʻrsatilmagan'}</Text>
            {(order.latitude || order.delivery_address) ? (
              <Text style={styles.mapLink}>Xaritada ochish →</Text>
            ) : null}
          </TouchableOpacity>
          {order.notes ? <Text style={styles.notes}>💬 {order.notes}</Text> : null}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mahsulotlar</Text>
          {items.map((it, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{it.product_name || 'Mahsulot'}</Text>
              <Text style={styles.itemQty}>x{it.quantity}</Text>
              <Text style={styles.itemPrice}>{money(it.price * it.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Jami</Text>
            <Text style={styles.totalVal}>{money(order.total_amount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action bar */}
      <View style={styles.actions}>
        {busy ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : order.status === 'pending' ? (
          <>
            <TouchableOpacity style={[styles.actBtn, styles.reject]} onPress={() => setRejectOpen(true)}>
              <Text style={styles.actText}>❌ Rad etish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actBtn, styles.accept]} onPress={accept}>
              <Text style={styles.actText}>✅ Qabul qilish</Text>
            </TouchableOpacity>
          </>
        ) : ['active', 'ready', 'delivering'].includes(order.status) ? (
          <TouchableOpacity style={[styles.actBtn, styles.done]} onPress={complete}>
            <Text style={styles.actText}>📦 Yetkazildi</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.closedText}>Buyurtma yakunlangan</Text>
        )}
      </View>

      {/* Reject reason modal */}
      <Modal visible={rejectOpen} transparent animationType="fade" onRequestClose={() => setRejectOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rad etish sababi</Text>
            <TextInput
              style={styles.modalInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Masalan: mahsulot tugadi"
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.bg }]} onPress={() => setRejectOpen(false)}>
                <Text style={{ fontWeight: '700', color: colors.text }}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.red }]} onPress={submitReject}>
                <Text style={{ fontWeight: '800', color: '#fff' }}>Rad etish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 28, fontWeight: '900', color: colors.text },
  status: { fontSize: 15, fontWeight: '800', color: colors.primary },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 13, fontWeight: '800', color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase' },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  callBtn: { backgroundColor: colors.green, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  callText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  mapRow: { marginTop: 12 },
  addr: { fontSize: 15, color: colors.text },
  mapLink: { color: colors.blue, fontWeight: '700', marginTop: 4 },
  notes: { marginTop: 12, color: colors.text, fontStyle: 'italic' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  itemQty: { width: 44, textAlign: 'center', fontWeight: '800', color: colors.textMuted },
  itemPrice: { width: 110, textAlign: 'right', fontWeight: '700', color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  totalVal: { fontSize: 20, fontWeight: '900', color: colors.primary },
  actions: {
    flexDirection: 'row', gap: 10, padding: 14, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  actBtn: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  accept: { backgroundColor: colors.green },
  reject: { backgroundColor: colors.red },
  done: { backgroundColor: colors.primary },
  actText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  closedText: { flex: 1, textAlign: 'center', color: colors.textMuted, fontWeight: '600', paddingVertical: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 12 },
  modalInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, padding: 12,
    fontSize: 15, color: colors.text, minHeight: 70, textAlignVertical: 'top',
  },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
});
