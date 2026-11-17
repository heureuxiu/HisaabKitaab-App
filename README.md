# Hisaab Kitaab

Personal finance tracker for two phones: income, savings, expenses and what is left.
`remaining = income − savings − expenses`

```
HisaabKitaab/
  backend/     Node.js + Express + SQLite API (runs on your computer)
  app-src/     React Native (Expo) source: screens, charts, API client
  setup-app.sh creates ./app (the Expo project) from app-src
```

## 1. Start the backend

Needs Node 22.13 or newer (it uses the built-in `node:sqlite`, so there is no native build step).

```bash
cd backend
npm install
cp .env.example .env        # optional: change PORT
npm start
```

The server prints a line like `Phone URL: http://192.168.1.10:4000`. You do not need to type it anywhere.
Your data lives in `backend/data/hisaab.db`. Copy that file now and then as a backup.

Run the API tests with `npm test`.

## 2. Create the app

```bash
cd ..            # back to the Hisaab Kitaab folder
bash setup-app.sh
cd app
npx expo start
```

`setup-app.sh` creates a fresh Expo project and installs library versions that match each other,
then copies the Hisaab Kitaab screens in.

## 3. Run on your phones

**While developing:** install **Expo Go** on each phone, scan the QR code from `npx expo start`.
Phone and computer must be on the same Wi-Fi.

**Android, as a real app (APK):**
```bash
cd app
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
Open the link it prints on each phone and install the APK. Allow "install unknown apps" if asked.

**iPhone:** a standalone install needs a paid Apple Developer account, or Xcode with a free
Apple ID on a Mac (the app then expires after a few days and must be reinstalled).
Expo Go works without either.

## 4. Connecting

There is nothing to enter. When you open the app through Expo, it finds the backend on the same computer (port 4000) by itself, so both phones show the same data.

## Using the app

- The look follows the design boards exactly: Inter Tight font, blue gradient heroes, glass bubbles on Reports and the floating pill tab bar (v2 design).
- Tap any entry to edit or delete it. Pull down on a screen to refresh.
- **Edit** on the Budgets screen lets you tap a category to change its limit. **Change** next to the savings target sets the target.

## Notes

- The backend must be running (and your computer awake) for the phones to read and save data.
  The app keeps the last loaded month so you can still look at it offline, but adding or editing needs the server.
- There is no password: anyone on the same Wi-Fi who knows the address can read and change your data. That is fine at home.
  To reach it from outside, put the backend behind HTTPS and some access control (for example a private network such as Tailscale).
- On a Mac, if the phone cannot connect, allow Node through the firewall (System Settings → Network → Firewall).
- The app expects the backend on port 4000 of the computer running Expo. For a built APK (no Expo), set `EXPO_PUBLIC_API_URL=http://<computer-ip>:4000` when building. If you change the backend port, change `PORT` in `app/src/lib/api.js` too.
