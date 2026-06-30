# App Store Submission Guide — Call Me Now

This project is configured for **EAS Build** and **EAS Submit**. Follow these steps in order.

## Prerequisites

| Requirement | Link / cost |
|-------------|-------------|
| Apple Developer Program | [developer.apple.com](https://developer.apple.com) — $99/year |
| Expo account | [expo.dev](https://expo.dev) — free tier works |
| Hosted website | Deploy the `website/` folder so these URLs are live: |
| | `https://callmenowapp.com/privacy.html` |
| | `https://callmenowapp.com/terms.html` |

## 1. Install EAS CLI and log in

```bash
npm install -g eas-cli
eas login
eas whoami
```

> **Important:** Run all commands from the project root `Call-Me-Sim/`, **not** from the `call-me-now/` subfolder. That subfolder is a separate Expo template and does not contain the Call Me Now app.

## 2. Link this project to Expo

✅ **Already linked** to `@aeliayousaf/call-me-now` (project ID in `app.json`).

If you need to re-link on another machine:

```bash
eas build:configure
```

## 3. Update `eas.json` submit credentials

After creating your app in App Store Connect, edit `eas.json`:

```json
"ios": {
  "appleTeamId": "YOUR_10_CHAR_TEAM_ID",
  "ascAppId": "YOUR_NUMERIC_APP_STORE_CONNECT_APP_ID"
}
```

**Find `ascAppId`:** App Store Connect → Apps → Call Me Now → App Information → Apple ID.

**Find `appleTeamId`:** [developer.apple.com/account](https://developer.apple.com/account) → Membership → Team ID.

Or run `eas submit --platform ios` once and EAS will prompt you to save credentials.

## 4. Create the app in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps → + → New App**
3. Use these values:
   - **Name:** Call Me Now
   - **Bundle ID:** `com.callmenow.app` (must match `app.json`)
   - **SKU:** `call-me-now` (any unique string)
   - **Primary language:** English (U.S.)

## 5. Build for production

```bash
npm run build:ios
```

Or build and submit in one step:

```bash
npm run build:submit:ios
```

EAS will guide you through Apple signing credentials on first run. Choose **Let EAS handle credentials** unless you already have your own.

Monitor the build at [expo.dev](https://expo.dev) → your project → Builds.

## 6. Submit to TestFlight / App Store

If you did not use `--auto-submit`:

```bash
npm run submit:ios
```

Select the production build when prompted.

## 7. Complete App Store Connect listing

### Required assets

- **App icon:** `assets/icon.png` (1024×1024, no transparency)
- **Screenshots:** iPhone 6.7" and 6.5" at minimum (capture from iOS Simulator)
- **Description:** Clearly state calls are **simulated only**
- **Support URL:** `https://callmenowapp.com` or your support page
- **Privacy Policy URL:** `https://callmenowapp.com/privacy.html`
- **Marketing URL (optional):** `https://callmenowapp.com`

### Pricing ($9.99 one-time)

This app has **no in-app purchase code**. The simplest approach:

1. In App Store Connect → **Pricing and Availability**
2. Set **Price** to **$9.99** (Tier 10)
3. The app is sold as a **paid download** upfront

If you later want a free app with a paid unlock, you will need to add StoreKit / IAP before listing.

### App Privacy questionnaire

Declare **no data collected** — consistent with `website/privacy.html`.

### Age rating

Answer honestly. The app simulates phone calls; expect questions about realistic behavior.

### App Review notes (paste into Review Notes)

```
Call Me Now simulates an incoming call UI only within the app. It does not place,
receive, or intercept real telephone calls.

Contacts permission is used locally on-device to display a selected contact name
and photo on the simulated incoming call screen. Contact data is never uploaded
or transmitted.

Optional "Practice Mode" banner can be enabled in Settings to display a
simulation disclaimer on screen.
```

### Before submitting for review

- [ ] Test on a real device via **TestFlight**
- [ ] Enable **Practice Mode** in Settings during review (recommended)
- [ ] Confirm contacts permission prompt text is accurate
- [ ] Confirm website privacy/terms URLs are live

## 8. Submit for review

In App Store Connect:

1. Open your app version (e.g. 1.0.0)
2. Attach the build from TestFlight
3. Complete all required metadata fields
4. Click **Add for Review** → **Submit to App Review**

Review typically takes 24–48 hours.

---

## Google Play (optional)

```bash
npm run build:android
npm run submit:android
```

1. Create a [Google Play Console](https://play.google.com/console) account ($25 one-time)
2. Create a service account JSON key and save as `google-play-service-account.json` (gitignored)
3. Update `eas.json` → `submit.production.android.serviceAccountKeyPath`

---

## Useful commands

| Command | Purpose |
|---------|---------|
| `npm run build:ios` | Production iOS build |
| `npm run build:android` | Production Android build |
| `npm run submit:ios` | Upload build to App Store Connect |
| `npm run build:submit:ios` | Build + submit in one step |
| `eas build:list` | View recent builds |
| `eas credentials` | Manage signing credentials |

## Project identifiers

| Field | Value |
|-------|-------|
| App name | Call Me Now |
| Bundle ID (iOS) | `com.callmenow.app` |
| Package (Android) | `com.callmenow.app` |
| Version | `1.0.0` |
| Support email | `support@callmenowapp.com` |

## Docs

- [EAS Build setup](https://docs.expo.dev/build/setup/)
- [Submit to Apple App Store](https://docs.expo.dev/submit/ios/)
- [Submit to Google Play](https://docs.expo.dev/submit/android/)
