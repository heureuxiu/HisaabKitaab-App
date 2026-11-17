# Ledgero

Personal finance tracker for your own phone: income, savings and expenses, per-user accounts, data in MongoDB Atlas.

```
HisaabKitaab/
  app/            Expo (React Native) app
  backend/        Node + Express API, MongoDB
  (logo SVG files live in app/assets/logo/)
```

## Backend
```
cd backend
npm install
npm start          # needs MONGODB_URI and JWT_SECRET in backend/.env (see .env.example)
npm test           # 22 tests, in-memory store, no database needed
```
Accounts: sign up, log in, guest, forgot/reset password (6-digit code by email, needs `RESEND_API_KEY`), Google sign-in,
guest -> real account (`POST /auth/upgrade`) and account deletion (`DELETE /auth/me`).
Details are in `backend/README.md`.

## App
```
cd app
npm install
npx expo start -c
```
Optional for Google sign-in: `npx expo install expo-auth-session expo-web-browser expo-crypto` and set the `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` values.

The app name is Ledgero. Internal ids (Android package, storage keys, database name) still say `hisaab`, so existing installs and data keep working.
