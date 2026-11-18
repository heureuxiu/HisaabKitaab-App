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
npm start          # needs MONGODB_URI and CLERK_SECRET_KEY in backend/.env (see .env.example)
npm test           # in-memory store, no database needed
```
Accounts are handled by Clerk (email + code, password reset, Google). The server only checks the Clerk session token.
Guest mode keeps the ledger on the phone and moves it to the server when the guest creates an account.
Details are in `backend/README.md`.

## App
```
cd app
npm install
npx expo start -c
```
Needs `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (see `app/.env.example`). Packages: `npx expo install @clerk/expo expo-secure-store expo-web-browser`.
Clerk's native parts need an EAS build, not Expo Go: `eas build -p android --profile preview`.

The app name is Ledgero. Internal ids (Android package, storage keys, database name) still say `hisaab`, so existing installs and data keep working.
