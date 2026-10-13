import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CartProvider, useCart } from './src/context/CartContext';
import colors from './src/theme/colors';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantScreen from './src/screens/RestaurantScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrdersScreen from './src/screens/OrdersScreen';

const HomeStack = createNativeStackNavigator();
function HomeNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerTintColor: colors.text, headerStyle: { backgroundColor: colors.card } }}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Punyo Go' }} />
      <HomeStack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: '' }} />
      <HomeStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Buyurtma berish' }} />
    </HomeStack.Navigator>
  );
}
const CartStack = createNativeStackNavigator();
function CartNav() {
  return (
    <CartStack.Navigator screenOptions={{ headerTintColor: colors.text, headerStyle: { backgroundColor: colors.card } }}>
      <CartStack.Screen name="Cart" component={CartScreen} options={{ title: 'Savatcha' }} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Buyurtma berish' }} />
    </CartStack.Navigator>
  );
}

const Tabs = createBottomTabNavigator();
function TabIcon({ label, focused }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{label}</Text>;
}
function CartTabIcon({ focused }) {
  const { count } = useCart();
  return (
    <View>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>🛒</Text>
      {count > 0 && (
        <View style={{ position: 'absolute', right: -10, top: -6, backgroundColor: colors.primary, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function RootTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted }}
    >
      <Tabs.Screen name="BoshSahifa" component={HomeNav} options={{ title: 'Bosh sahifa', tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} /> }} />
      <Tabs.Screen name="Buyurtmalar" component={OrdersScreen} options={{ title: 'Buyurtmalar', tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} /> }} />
      <Tabs.Screen name="Savatcha" component={CartNav} options={{ title: 'Savatcha', tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} /> }} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CartProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootTabs />
          </NavigationContainer>
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
