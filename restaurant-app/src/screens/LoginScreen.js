import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Xatolik', 'Login va parolni kiriting');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (e) {
      const msg = e?.response?.data?.error || 'Login yoki parol xato';
      Alert.alert('Kirish xatosi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Punyo Go</Text>
          <Text style={styles.subtitle}>Restoran ilovasi</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Login</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="masalan: oqsaroy"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={[styles.label, { marginTop: 16 }]}>Parol</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secureTextEntry
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Kirish</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Login/parolni Punyo Go administratori beradi.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.9, marginTop: 4, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 22 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 24,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  hint: { color: '#fff', opacity: 0.85, textAlign: 'center', marginTop: 20, fontSize: 13 },
});
