# Call Me Now

A React Native (Expo) app that simulates incoming phone calls for practice purposes. **This app does not place real phone calls** and does not integrate with your phone system.

## Features

- Pick a caller from your contacts (or use sample contacts if permission is denied)
- Schedule a fake incoming call: immediately, 10s, 30s, 1 minute, or custom delay
- Realistic in-app incoming call screen with ringtone and vibration
- Accept/decline flow with a fake active call screen and timer
- Local settings: default caller, delay, ringtone, vibration, dark mode, practice mode label

## Platform Notes

- **No CallKit (iOS)**: The app uses an in-app full-screen UI instead of system call integration, since this is not real VoIP.
- **No full-screen intents (Android)**: Incoming calls are shown inside the app only — no spoofing of the native phone UI.
- **Practice Mode**: An optional banner clarifies that calls are simulated for App Store compliance.

## Tech Stack

- React Native + Expo (SDK 56)
- TypeScript
- React Navigation
- AsyncStorage for settings
- expo-contacts, expo-av, expo-haptics

## Getting Started

```bash
npm install
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

### Run on device

```bash
npm run ios
npm run android
```

## Project Structure

```
src/
  screens/       Home, ContactPicker, DelaySelection, IncomingCall, ActiveCall, Settings
  components/    Button, ContactAvatar, CallControls, RingtoneHandler, etc.
  services/      storage, contacts, ringtone, vibration, call timing
  hooks/         useCallTimer, useIncomingCallEffects
  types/         Shared TypeScript types
  assets/        Ringtone audio files
  navigation/    Stack navigator
  context/       Settings provider
```

## Permissions

| Permission | Purpose |
|------------|---------|
| Contacts | Select caller name, number, and photo |
| Vibration (Android) | Incoming call vibration pattern |

## Disclaimer

Call Me Now is intended for practice, demos, and entertainment. It simulates call UI within the app only and must not be used to deceive others into believing a real call is occurring.
