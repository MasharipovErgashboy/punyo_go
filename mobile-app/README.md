# Punyo Go — Mobil ilova (Expo / React Native)

Punyo Go ovqat yetkazib berish mobil ilovasi. Backend: `https://punyogo.uz/api` (allaqachon jonli).

## Imkoniyatlar (v1)
- Bosh sahifa: reklama banneri + restoranlar ro'yxati
- Restoran taomlari, savatga qo'shish (bitta restoran cheklovi)
- Savatcha: miqdor, jami
- Buyurtma berish: **xaritadan joylashuv** (GPS) + telefon → restoran raqami chiqadi (qo'ng'iroq qilib tasdiqlash)
- Buyurtmalar: tarix + holat kuzatuvi (bosqichli)

> Login hozircha yo'q — har qurilma uchun vaqtinchalik ID ishlatiladi. Keyinroq Telegram/SMS login qo'shiladi.

## Ishga tushirish
```bash
cd mobile-app
npm install
npx expo install --fix     # native paketlar versiyasini Expo'ga moslaydi
npx expo start             # QR kodni Expo Go (telefon) bilan skanerlang
```
Android emulyator: `npx expo start --android` | iOS: `npx expo start --ios`

## Xarita (Google Maps)
`app.json` → `expo.android.config.googleMaps.apiKey` ga Google Maps API kalitingizni qo'ying
(web ilovadagi kalit yaraydi — Android uchun cheklovsiz yoki package nomi bilan).
iOS'да Apple Maps ishlatiladi (kalit shart emas).

## Keyingi bosqichlar
- Login (Telegram bot yoki SMS)
- Online to'lov (Payme/Click)
- Push bildirishnomalar, chat
