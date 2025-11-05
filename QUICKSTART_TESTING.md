# 📱 Quick Start: Testing su Dispositivi Reali

## 🚀 Setup in 5 Minuti

### 1. Installa EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login su Expo

```bash
eas login
```

Crea account gratuito su [expo.dev](https://expo.dev) se non ce l'hai.

### 3. Configura Progetto

```bash
# Configura EAS per questo progetto
eas build:configure

# Rispondi:
# - Genera nuovi identifier? → Yes
```

---

## 📱 Build per Testing

### Opzione A: Development Build (Consigliata per debug)

**iOS** (iPhone connesso via USB):

```bash
npm run build:dev:ios
```

**Android** (più veloce, installa direttamente):

```bash
npm run build:dev:android
```

⏱️ **Tempo build**: 15-20 minuti  
📦 **Output**: Link download `.ipa` (iOS) o `.apk` (Android)

### Opzione B: Preview Build (Come produzione ma senza publish)

**iOS**:

```bash
npm run build:preview:ios
```

**Android**:

```bash
npm run build:preview:android
```

⏱️ **Tempo build**: 10-15 minuti

---

## 📲 Installazione su Device

### iPhone

1. **Scarica `.ipa`** dal link ricevuto via email/dashboard
2. **Apri Xcode** → Window → Devices and Simulators
3. **Connetti iPhone** via USB
4. **Trascina `.ipa`** nella finestra Devices
5. **App si installa** automaticamente

**Alternativa senza Xcode**: Usa [diawi.com](https://www.diawi.com/) per creare link installazione OTA

### Android

1. **Scarica `.apk`** dal link ricevuto
2. **Trasferisci su telefono** (email, USB, cloud)
3. **Apri file** → Abilita "Installa app sconosciute"
4. **Installa app**

---

## ✅ Checklist Testing Veloce

Dopo installazione:

1. **Avvia app** → Feed carica in < 3 sec? ✅
2. **Scorri feed** → Fluido 60fps? ✅
3. **Tap like** → Salva correttamente? ✅
4. **Apri dettaglio** → Modal si apre? ✅
5. **Tap link Amazon** → Browser apre? ✅
6. **Vai a Favorites** → Libro piaciuto c'è? ✅

**Tutto ✅?** Ottimo! Procedi con testing completo in `TESTING_CHECKLIST.md`

---

## 🐛 Problemi Comuni

### Build fallisce

```bash
# Pulisci cache e riprova
npm cache clean --force
rm -rf node_modules
npm install
eas build --clear-cache --profile development --platform android
```

### "Provisioning profile error" (iOS)

Serve **Apple Developer account** ($99/anno).

**Soluzione gratuita**: Usa simulatore iOS invece:

```bash
npm run ios
```

### APK non installa su Android

1. Settings → Security → Enable "Unknown sources"
2. Settings → Apps → Special access → Install unknown apps → [File Manager] → Allow

---

## 📚 Documentazione Completa

- **Setup dettagliato**: `docs/DEVICE_TESTING.md`
- **Checklist completa**: `docs/TESTING_CHECKLIST.md`
- **EAS Docs**: [docs.expo.dev/build](https://docs.expo.dev/build/introduction/)

---

## 🆘 Aiuto?

- **EAS Build troubleshooting**: [docs.expo.dev/build-reference/troubleshooting/](https://docs.expo.dev/build-reference/troubleshooting/)
- **Expo Discord**: [discord.gg/expo](https://discord.gg/expo)
- **Apri issue**: [GitHub Issues](https://github.com/MarcoLP1822/primariga/issues)

---

**Buon Testing! 🚀**
