import { Platform, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Show the notification (with sound) even when the app is in the foreground —
// the restaurant tablet is always open, so this is the main "dring".
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    // High-importance channel so new orders make noise + heads-up popup.
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Yangi buyurtmalar',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 400, 200, 400],
      lightColor: '#FF6B2C',
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  } catch (e) {}
}

// Local alert fired when polling detects a new order. Loud + vibrate.
export async function fireNewOrderAlert(count = 1) {
  try {
    Vibration.vibrate([0, 500, 250, 500, 250, 500]);
  } catch (e) {}
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Yangi buyurtma!',
        body: count > 1 ? `${count} ta yangi buyurtma keldi` : 'Yangi buyurtma keldi — ko\'rib chiqing',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        ...(Platform.OS === 'android' ? { channelId: 'orders' } : {}),
      },
      trigger: null, // immediately
    });
  } catch (e) {}
}

// Try to obtain an Expo push token (works once an EAS projectId is configured).
// Safe no-op otherwise — polling covers the always-on device case.
export async function getPushToken() {
  try {
    if (!Device.isDevice) return null;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;
    const projectId =
      (require('expo-constants').default?.expoConfig?.extra?.eas?.projectId) || undefined;
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenResp?.data || null;
  } catch (e) {
    return null;
  }
}
