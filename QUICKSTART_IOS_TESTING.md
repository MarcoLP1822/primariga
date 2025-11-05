# 📱 Setup Testing iPhone - Quick Start

**Data**: 5 Novembre 2025  
**Focus**: Solo iOS (iPhone/iPad)

---

## 🚀 Setup Rapido (10 minuti)

### 1. Installa EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login su Expo

```bash
eas login
```

Se non hai account, crealo gratuitamente su [expo.dev](https://expo.dev)

### 3. Configura Progetto

```bash
eas build:configure
```

Rispondi:
- Generate new identifier? → **Yes**

---

## 📱 Opzioni per Testing iOS

### Opzione 1: Expo Go (VELOCISSIMA - 0 minuti build) ⚡

**Pro**: Istantaneo, zero setup  
**Contro**: Alcune feature native potrebbero non funzionare

```bash
# Avvia metro bundler
npm start

# Sul tuo iPhone:
# 1. Scarica "Expo Go" dall'App Store
# 2. Apri l'app
# 3. Scansiona il QR code che appare nel terminale
```

✅ **Usa questa opzione per testare rapidamente** UI, navigation, flow generale

---

### Opzione 2: Development Build (Completa - 20 minuti build) 🔧

**Pro**: Tutte le feature native funzionanti (Sentry, ecc.)  
**Contro**: Richiede build + provisioning profile

#### A. Con Apple Developer Account ($99/anno)

```bash
# Build development
npm run build:dev:ios

# Tempo: ~20 minuti
# Output: File .ipa + link download
```

Dopo il build:
1. Scarica `.ipa` dal link Expo
2. Apri **Xcode** → Window → Devices and Simulators
3. Connetti iPhone via USB
4. Trascina `.ipa` nella finestra → Installa

#### B. SENZA Apple Developer Account (GRATIS) 🆓

Usa **Simulatore iOS** invece:

```bash
# Avvia su simulatore
npm run ios

# Si apre automaticamente simulatore Xcode
```

⚠️ **Nota**: Simulatore è ottimo ma non identico a device reale (performance, gesture, ecc.)

---

### Opzione 3: TestFlight (Beta Testing Pubblico) ✈️

**Quando usarla**: Per beta test con più persone (max 10.000)  
**Requisito**: Apple Developer Account ($99/anno)

```bash
# 1. Build production
npm run build:prod:ios

# 2. Submit a TestFlight
npm run submit:ios

# 3. Su App Store Connect:
#    - Vai a TestFlight
#    - Aggiungi beta testers (interni o esterni)
#    - Inviano email → Installano TestFlight → Testano app
```

---

## 🎯 Raccomandazione per Te

**Se hai iPhone + Xcode**:

### Piano Consigliato

1. **Prima fase** - Test rapido UX/UI:
   ```bash
   npm start
   # Usa Expo Go su iPhone
   ```
   Testa: navigation, layout, flow generale

2. **Seconda fase** - Test completo con native features:
   ```bash
   # Se hai Apple Dev Account
   npm run build:dev:ios
   ```
   Testa: Sentry, performance reali, gesture native

3. **Terza fase** - Beta testing:
   ```bash
   npm run build:prod:ios
   npm run submit:ios
   # TestFlight con 3-5 beta testers
   ```

---

## ✅ Checklist Testing iPhone

Usa questa checklist durante testing (stampala o tienila a schermo):

### Quick Test (5 minuti)

- [ ] App si avvia in < 3 secondi
- [ ] Feed carica prime righe
- [ ] Scroll fluido (60fps)
- [ ] Tap ❤️ salva like
- [ ] Tap su card apre dettaglio
- [ ] Link Amazon si apre
- [ ] Tab navigation funziona

### Test Completo (20 minuti)

**Performance**:
- [ ] Scroll 50+ libri senza lag
- [ ] Immagini caricano progressivamente
- [ ] Memoria stabile dopo 15 min uso

**Gesture iOS Native**:
- [ ] Swipe back funziona
- [ ] Swipe down chiude modal
- [ ] Pull to refresh funziona
- [ ] Long press (se implementato)

**Screen Sizes** (testa su device che hai):
- [ ] iPhone SE (4.7") - schermo piccolo
- [ ] iPhone 15 Pro (6.1") - standard
- [ ] iPhone 15 Pro Max (6.7") - grande
- [ ] iPad (se disponibile)

**Network**:
- [ ] WiFi veloce → tutto carica
- [ ] 4G → carica correttamente
- [ ] Attiva modalità aereo → gestisce offline
- [ ] Riconnetti → sincronizza automaticamente

**iOS Specific**:
- [ ] Dark mode → colori si adattano
- [ ] Rotazione landscape (se supportata)
- [ ] Notch/Dynamic Island non copre contenuto
- [ ] Safe area rispettata (no elementi sotto status bar)
- [ ] Keyboard appearance corretto
- [ ] Haptic feedback (se implementato)

---

## 🐛 Bug Tracking

Quando trovi un bug:

### Template Bug Report

```markdown
**iPhone Model**: iPhone 15 Pro
**iOS Version**: 17.1
**Build**: 1.0.0 (development)

**Bug**: [Descrizione breve]

**Steps**:
1. Apri app
2. Vai a [schermata]
3. Tap su [elemento]
4. [Comportamento errato]

**Expected**: [Cosa dovrebbe succedere]
**Actual**: [Cosa succede invece]

**Screenshot**: [Allega se possibile]

**Priority**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
```

Apri GitHub Issue per ogni bug trovato.

---

## 📊 Metriche da Raccogliere

Durante testing, annota:

**Performance**:
- Cold start time: _____ secondi
- Warm start time: _____ secondi
- Feed scroll FPS: _____ fps (usa Xcode Instruments)
- Memory usage: _____ MB

**UX**:
- Quante prime righe hai letto? _____
- Quanti libri hai messo like? _____
- Hai aperto link acquisto? _____ volte
- Hai trovato libri interessanti? Sì / No / Quanti: _____

**Rating**:
- Performance: ⭐⭐⭐⭐⭐
- UI/UX: ⭐⭐⭐⭐⭐
- Funzionalità: ⭐⭐⭐⭐⭐
- Overall: ⭐⭐⭐⭐⭐

---

## 🔧 Troubleshooting

### "Provisioning profile error"

Serve Apple Developer account. Usa Expo Go o simulatore invece.

### "Build failed"

```bash
# Pulisci cache
npm cache clean --force
rm -rf node_modules
npm install

# Riprova build
eas build --clear-cache --profile development --platform ios
```

### "App crasha su avvio"

1. Controlla `.env` sia configurato correttamente
2. Verifica Supabase URL e Anon Key siano corretti
3. Controlla logs in Xcode Devices window

### "Expo Go non si connette"

1. Assicurati iPhone e computer siano sulla **stessa rete WiFi**
2. Prova a riavviare Metro Bundler:
   ```bash
   npm start -- --clear
   ```

---

## 📱 Device Registrazione (Per development build)

Se usi Apple Developer account, devi registrare il device UDID:

```bash
# EAS lo fa automaticamente durante il primo build
# Oppure manualmente:

# 1. Ottieni UDID
# iPhone connesso → Finder → Clicca su iPhone → Vedi UDID
# O in Xcode → Window → Devices → Seleziona iPhone → Identifier

# 2. Registra device su Expo
eas device:create
```

---

## 🎯 Cosa Testare Prioritariamente

### Must Test (Critici)

1. **Core Flow**: Home → Like → Dettaglio → Link Amazon
2. **Navigation**: Tutte le tab funzionano
3. **Performance**: Scroll fluido, no crash
4. **Network**: Gestione offline e riconnessione

### Nice to Test (Importanti)

5. **Dark Mode**: Se implementato
6. **Diverse dimensioni**: SE, Pro, Pro Max, iPad
7. **Gesture native**: Swipe back, pull to refresh
8. **Edge cases**: Libro senza cover, link rotto

---

## 📞 Risorse

- **Expo Go**: [apps.apple.com/app/expo-go](https://apps.apple.com/us/app/expo-go/id982107779)
- **EAS Build iOS**: [docs.expo.dev/build/setup](https://docs.expo.dev/build/setup/)
- **TestFlight**: [developer.apple.com/testflight](https://developer.apple.com/testflight/)
- **Xcode**: [developer.apple.com/xcode](https://developer.apple.com/xcode/)

---

## 🚀 Quick Commands

```bash
# Development con Expo Go (velocissimo)
npm start

# Build development (20 min)
npm run build:dev:ios

# Build preview (pre-production)
npm run build:preview:ios

# Build production (per TestFlight)
npm run build:prod:ios

# Submit a TestFlight
npm run submit:ios

# Simulatore iOS
npm run ios

# Check build status
eas build:list
```

---

**Inizia con**: `npm start` + **Expo Go** per test veloce! 🚀

Poi, se tutto funziona, passa a development build per test completo.

**Buon Testing! 📱✨**
