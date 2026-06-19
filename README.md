<div align="center">
<img width="1200" height="475" alt="Tasami Al-Wataniah" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Tasami Al-Wataniah | تسامي الوطنية

RTL-first PWA for home services booking — React 18, Vite, Tailwind CSS, Firebase.

## Features

- Multilingual (Arabic, English, Urdu, Tagalog)
- Full booking flow with OpenStreetMap pin-drop (Leaflet)
- Firestore persistence + anonymous auth
- Real-time Admin Console
- PWA install support

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` → `.env.local` and configure Firebase keys
3. Enable **Anonymous Auth** in Firebase Console
4. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
5. Start dev server:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

## Admin Access

Admin access is **not** configured via `.env` or hardcoded UIDs. Use Firebase Console:

1. Sign in at `/login` with **Google** or **Phone** (anonymous users are blocked).
2. Visit `/admin` — copy your UID from the access-denied screen if needed.
3. In [Firebase Console](https://console.firebase.google.com) → **Firestore Database** → **Start collection** (or open) `admins`:
   - **Document ID:** your UID (e.g. `Loeyivasx8YGMPfN8NUAFcZVSAJ3`)
   - **Field:** `role` (string) = `admin`
4. Reload `/admin` — you should see the Admin Console.

> Firestore rules block client-side writes to `admins/*`; only Console or Admin SDK can seed the first admin.
