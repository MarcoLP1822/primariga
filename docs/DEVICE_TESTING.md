# 📱 Guida Completa: Testing su Dispositivi Reali

**Data**: 5 Novembre 2025  
**Obiettivo**: Testare Primariga su iPhone e Android fisici per validare UX, performance e funzionalità

---

## 📋 Indice

1. [Setup Iniziale](#setup-iniziale)
2. [Build Development per Testing](#build-development-per-testing)
3. [Installazione su Dispositivi](#installazione-su-dispositivi)
4. [Checklist Testing Completa](#checklist-testing-completa)
5. [Performance Testing](#performance-testing)
6. [Bug Tracking](#bug-tracking)
7. [Beta Testing](#beta-testing)

---

## 🚀 Setup Iniziale

### Prerequisiti

#### Per sviluppatore principale:

```bash
# 1. Installa EAS CLI globalmente
npm install -g eas-cli

# 2. Login su Expo account (crea account gratuito se non ce l'hai)
eas login

# 3. Configura progetto EAS
eas build:configure
```

#### Per iOS Testing:

- **Account Apple Developer** (99$/anno per TestFlight)
  - **Alternativa gratuita**: Development build con provisioning profile manuale
- **Device UDID** registrato su Apple Developer Portal
- **iPhone con iOS 14+** (consigliato iOS 16+)

#### Per Android Testing:

- **Nessun account necessario** per testing interno
- **Android 10+** (API Level 29+, consigliato Android 13+)
- **Abilita "Installa app sconosciute"** nelle impostazioni

---

## 🏗️ Build Development per Testing

### Opzione 1: Development Build con Expo Go (Più veloce)

**Pro**: Rapido, no build necessario  
**Contro**: Limiti su native modules

```bash
# Avvia Metro Bundler
npm start

# Scansiona QR code con:
# - iPhone: Camera app
# - Android: Expo Go app
```

### Opzione 2: Development Build Nativa (Consigliato)

**Pro**: Tutte le feature native funzionanti  
**Contro**: Richiede build (~15-20 min)

#### iOS Development Build

```bash
# Build development per iOS
eas build --profile development --platform ios

# Output: File .ipa da installare con Xcode
# Riceverai link download al termine build
```

**Installazione su iPhone**:

1. Scarica `.ipa` dal link
2. Apri Xcode → Window → Devices and Simulators
3. Seleziona il tuo iPhone connesso via USB
4. Trascina `.ipa` nella finestra Devices
5. App si installa automaticamente

#### Android Development Build

```bash
# Build development per Android (APK)
eas build --profile development --platform android

# Output: File .apk da installare direttamente
```

**Installazione su Android**:

1. Scarica `.apk` dal link
2. Trasferisci su telefono via USB/email/cloud
3. Apri file → Abilita "Installa app sconosciute" se richiesto
4. Installa app

### Opzione 3: Preview Build (Pre-Production)

Per test più realistici senza development tools:

```bash
# iOS Preview
eas build --profile preview --platform ios

# Android Preview
eas build --profile preview --platform android
```

---

## 📱 Installazione su Dispositivi

### iOS - Metodo TestFlight (Consigliato per beta testing)

```bash
# 1. Build production signed
eas build --profile production --platform ios

# 2. Submit a TestFlight
eas submit --platform ios

# 3. Invita beta testers da App Store Connect
# - Max 10.000 external testers
# - Max 100 internal testers (team)
```

**Tester installano app**:

1. Ricevono invito via email
2. Scaricano TestFlight da App Store
3. Aprono link invito → App si installa in TestFlight

### Android - Distribuzione Interna

```bash
# Build APK interno
eas build --profile preview --platform android

# Condividi link download APK con testers
```

**Tester installano app**:

1. Scaricano APK da link
2. Abilitano installazione da fonti sconosciute
3. Installano APK

### Android - Google Play Internal Testing (Alternativa)

```bash
# Build AAB
eas build --profile production --platform android

# Submit a Google Play Internal Testing
eas submit --platform android
```

---

## ✅ Checklist Testing Completa

### 📖 Test Funzionali di Base

#### Home Screen - Feed Libri

- [ ] **Feed carica correttamente** al primo avvio
- [ ] **Prima riga libro** è leggibile e ben formattata
- [ ] **Cover image** carica correttamente (se presente)
- [ ] **Titolo e autore** sono nascosti (blind discovery)
- [ ] **Like button** (❤️) risponde al tap
- [ ] **Next button** (→) carica prossima prima riga
- [ ] **Swipe gesture** funziona per navigare (se implementato)
- [ ] **Dettaglio libro** si apre con tap su card
- [ ] **Animazioni** sono fluide (60fps)

#### Dettaglio Libro (Modal)

- [ ] **Modal si apre** con animazione smooth
- [ ] **Tutti i dettagli** sono visibili (titolo, autore, descrizione, anno, pagine, generi)
- [ ] **Cover image** è ad alta qualità
- [ ] **Link acquisto** funziona:
  - [ ] **Amazon link** apre browser/app Amazon
  - [ ] **Altri link** aprono correttamente
- [ ] **Close button** (X) chiude modal
- [ ] **Swipe down** chiude modal (iOS gesture)
- [ ] **Back button** chiude modal (Android)

#### Tab Navigation

- [ ] **Home tab** (🏠) mostra feed
- [ ] **Favorites tab** (❤️) mostra libri piaciuti
- [ ] **Profile tab** (👤) mostra profilo utente
- [ ] **Tab switch** è istantaneo (no lag)
- [ ] **Stato preservato** tornando a tab già visitato

#### Favorites Screen

- [ ] **Lista favorites** mostra tutti i libri piaciuti
- [ ] **Tap su libro** apre dettaglio
- [ ] **Unlike button** rimuove da favorites
- [ ] **Empty state** mostra messaggio se nessun favorite
- [ ] **Pull-to-refresh** aggiorna lista

#### Profile Screen

- [ ] **User info** mostra correttamente
- [ ] **Stats** sono accurate (libri piaciuti, letti, ecc.)
- [ ] **Settings** sono accessibili
- [ ] **Logout** funziona (se implementato)

---

### 🚀 Performance Testing

#### Scroll Performance

- [ ] **Scroll feed** è fluido a 60fps
- [ ] **No jank** durante scroll veloce
- [ ] **Immagini** caricano senza bloccare UI
- [ ] **Infinite scroll** carica più libri senza lag

#### Load Times

- [ ] **Cold start** < 3 secondi
- [ ] **Warm start** < 1 secondo
- [ ] **Navigazione tra screen** < 500ms
- [ ] **Dettaglio libro** si apre istantaneamente

#### Gestione Memoria

- [ ] **App non crasha** dopo 30 min di uso continuo
- [ ] **Scroll 100+ libri** senza rallentamenti
- [ ] **Immagini** vengono rilasciate dalla memoria correttamente

---

### 🌐 Network Testing

#### Connessione Normale (WiFi/4G)

- [ ] **Feed carica** in < 2 secondi
- [ ] **Immagini** caricano progressivamente
- [ ] **Like sync** con backend è istantaneo

#### Connessione Lenta (2G simulato)

**iOS**: Settings → Developer → Network Link Conditioner → Very Bad Network  
**Android**: Chrome DevTools → Network throttling

- [ ] **Loading indicators** mostrano correttamente
- [ ] **Timeout errors** gestiti con retry button
- [ ] **App non crasha** su errori network

#### Offline Mode

**Test**: Abilita modalità aereo

- [ ] **Cached data** mostra libri già visti
- [ ] **Error message** informa utente "Nessuna connessione"
- [ ] **Reconnect** sincronizza automaticamente quando torna online
- [ ] **Like offline** vengono salvati localmente e sincronizzati dopo

---

### 📐 UI/UX Testing

#### Responsive Design

**Test su diverse dimensioni**:

- [ ] **iPhone SE** (4.7", 375x667) - schermo piccolo
- [ ] **iPhone 15 Pro** (6.1", 393x852) - standard
- [ ] **iPhone 15 Pro Max** (6.7", 430x932) - grande
- [ ] **Android compatto** (5", 360x640)
- [ ] **Android standard** (6", 360x800)
- [ ] **Android tablet** (10", 800x1280)
- [ ] **iPad** (10.2", 810x1080)

**Verifiche**:

- [ ] **Testo** è leggibile su tutti gli schermi
- [ ] **Buttons** hanno size minima 44x44pt (iOS HIG)
- [ ] **Layout** si adatta correttamente
- [ ] **Immagini** non sono distorte

#### Dark Mode (se implementato)

- [ ] **Attiva Dark Mode** nelle impostazioni sistema
- [ ] **App adatta colori** automaticamente
- [ ] **Contrasto** rimane leggibile
- [ ] **Immagini** hanno buona visibilità

#### Orientamento Schermo

- [ ] **Rotazione landscape** funziona (se supportato)
- [ ] **Layout** si adatta correttamente
- [ ] **Modal/Keyboard** non oscurano contenuto

---

### ⌨️ Keyboard & Input Testing

#### Text Input (se presente)

- [ ] **Keyboard** appare correttamente
- [ ] **Auto-correct** funziona
- [ ] **Return key** ha label corretta (Search, Done, etc.)
- [ ] **Keyboard dismiss** con tap fuori input
- [ ] **Layout non rotto** quando keyboard appare
- [ ] **Scroll to input** quando keyboard copre campo

---

### 🔔 Notifications & Permissions (se implementate)

#### Permission Requests

- [ ] **Location** (se usata) - prompt iOS/Android
- [ ] **Camera** (se usata) - prompt corretto
- [ ] **Photos** (per upload cover) - funziona
- [ ] **Notifications** (se implementate) - opt-in corretto

#### Push Notifications

- [ ] **Notifica arriva** quando app in background
- [ ] **Tap notifica** apre schermata corretta
- [ ] **Deep link** funziona (es. tap → libro specifico)

---

### 🐛 Error Handling Testing

#### Scenari Errore da Testare

**Errori Backend**:

- [ ] **Supabase down** → Error screen con retry
- [ ] **API timeout** → Loading → Error → Retry funziona
- [ ] **Invalid data** → Fallback graceful

**Errori App**:

- [ ] **Crash app** → Sentry cattura errore
- [ ] **Error Boundary** cattura errori React
- [ ] **Tap "Reload"** riprende correttamente

**Edge Cases**:

- [ ] **Libro senza cover** → Placeholder image
- [ ] **Libro senza link acquisto** → Disable button
- [ ] **Nome autore lunghissimo** → Text truncate
- [ ] **Descrizione vuota** → Placeholder text

---

### 🔐 Security Testing

- [ ] **API keys** non sono visibili in app bundle
- [ ] **.env file** non è nel bundle
- [ ] **Network traffic** usa HTTPS
- [ ] **Sensitive data** non in logs (check Xcode/Logcat)

---

## 📊 Raccolta Feedback Beta Tester

### Setup Google Form per Feedback

**Crea form con queste domande**:

1. **Device usato** (iPhone/Android, modello, OS version)
2. **Rating complessivo** (1-5 stelle)
3. **Performance** - Scroll è fluido? (Sì/No/Commenti)
4. **Bug riscontrati** (Descrizione + screenshot)
5. **Feature preferita**
6. **Cosa miglioreresti**
7. **Compresti libri scoperti su Primariga?** (Sì/No/Forse)
8. **Feedback libero**

### Invita Beta Testers

**Profili consigliati**:

- 2-3 **heavy readers** (target primario)
- 1-2 **tech-savvy users** (trovano bug tecnici)
- 1-2 **non-tech users** (UX intuitiva?)
- 1 **iOS user**, 1 **Android user** (min)

**Istruzioni per testers**:

```markdown
# 🧪 Benvenuto nel Beta Testing di Primariga!

Grazie per aiutarci a testare Primariga! 📚

## Cosa fare:

1. **Installa l'app** (link: ___)
2. **Usa l'app per 15-20 minuti** come se fosse già pubblicata
3. **Annota** tutto ciò che ti sembra strano/rotto
4. **Compila il form feedback** (link: ___)

## Cosa testare:

- Scorri il feed e leggi 10+ prime righe
- Metti like ad almeno 3 libri
- Apri i dettagli di 2-3 libri
- Vai ai Favorites
- Prova a aprire un link acquisto
- Usa l'app con connessione lenta (es. 3G)

## Cosa cerchiamo:

- 🐛 Bug (crash, errori, comportamenti strani)
- 🚀 Performance (lag, scroll non fluido)
- 🎨 UI/UX (confusione, layout rotti)
- 💡 Idee per migliorare l'app

Grazie! 🙏
```

---

## 🐛 Bug Tracking Template

### GitHub Issues Template

Crea `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Segnala un bug trovato durante testing
---

**📱 Device & OS**

- Device: [es. iPhone 15 Pro, Samsung Galaxy S23]
- OS: [es. iOS 17.1, Android 14]
- App Version: [es. 1.0.0 build 42]

**🐛 Descrizione Bug**

[Descrizione chiara del problema]

**🔄 Steps to Reproduce**

1. Apri app
2. Vai a '...'
3. Tap su '...'
4. Vedi errore

**✅ Expected Behavior**

[Cosa dovrebbe succedere]

**❌ Actual Behavior**

[Cosa succede invece]

**📸 Screenshots**

[Allega screenshot/video se possibile]

**📊 Priority**

- [ ] 🔴 Critical (app crasha)
- [ ] 🟠 High (feature non funziona)
- [ ] 🟡 Medium (workaround disponibile)
- [ ] 🟢 Low (miglioramento estetico)
```

---

## 📈 Performance Monitoring

### iOS - Xcode Instruments

```bash
# Build per profiling
eas build --profile preview --platform ios --local

# Apri .ipa in Xcode → Product → Profile
# Strumenti utili:
# - Time Profiler (CPU usage)
# - Allocations (Memory leaks)
# - Leaks (Memory leaks detection)
```

### Android - Android Studio Profiler

```bash
# Build debug
eas build --profile development --platform android --local

# Installa APK
# Apri Android Studio → Profiler → Select process "com.primariga.app"
# Monitor:
# - CPU usage
# - Memory allocation
# - Network activity
```

---

## 🚀 Pre-Launch Checklist

Prima del lancio pubblico:

### Testing Completato

- [ ] **10+ testers** hanno provato l'app
- [ ] **Bug critici** (crash) risolti al 100%
- [ ] **Bug high priority** risolti al 90%+
- [ ] **Performance** validata su device più vecchi (iOS 14, Android 10)
- [ ] **Tutti i link** acquisto funzionano

### Device Coverage

- [ ] Testato su **3+ iPhone** (varie dimensioni)
- [ ] Testato su **3+ Android** (varie marche: Samsung, Google Pixel, Xiaomi)
- [ ] Testato su **tablet** (iPad, Android tablet)

### Network Conditions

- [ ] WiFi veloce ✅
- [ ] 4G/5G ✅
- [ ] 3G lento ✅
- [ ] Offline mode ✅

### OS Versions

- [ ] iOS 14 (min supported)
- [ ] iOS 15
- [ ] iOS 16
- [ ] iOS 17 (latest)
- [ ] Android 10 (API 29, min supported)
- [ ] Android 11-12
- [ ] Android 13
- [ ] Android 14 (latest)

---

## 🎯 Prossimi Step

Dopo completato testing su dispositivi reali:

1. ✅ **Fix tutti bug critici**
2. ✅ **Deploy production build** su TestFlight + Google Play Internal Testing
3. ✅ **Beta test pubblico** con 50-100 utenti
4. ✅ **Iterare** basandosi su feedback
5. 🚀 **Launch pubblico** su App Store + Google Play

---

## 📞 Support

**Problemi con EAS Build?**

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Troubleshooting](https://docs.expo.dev/build-reference/troubleshooting/)
- [Expo Discord](https://discord.gg/expo)

**Problemi con testing?**

- Consulta `docs/TESTING.md`
- Apri issue su GitHub
- Contatta il team dev

---

**Buon Testing! 🚀📱**
