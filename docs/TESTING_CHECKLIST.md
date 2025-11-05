# ✅ Testing Checklist - Dispositivi Reali

**Quick Reference** per sessioni di testing su iPhone e Android

---

## 🎯 Test Rapido (10 minuti)

**Happy Path - Flusso Principale**:

- [ ] Avvia app → Feed carica in < 3 sec
- [ ] Scorri 5 prime righe → Scroll fluido 60fps
- [ ] Tap ❤️ su 1 libro → Like salvato
- [ ] Tap su card libro → Dettaglio si apre
- [ ] Tap su link Amazon → Browser si apre
- [ ] Back → Torna al feed
- [ ] Vai a tab Favorites → Libro piaciuto c'è
- [ ] Pull to refresh → Lista aggiorna

**Risultato atteso**: ✅ Tutto funziona senza crash/lag

---

## 📱 Test Completo per Device (30 minuti)

### 📋 Setup Iniziale

- [ ] Device: _________________ (es. iPhone 15 Pro)
- [ ] OS: _________________ (es. iOS 17.1)
- [ ] Build: _________________ (es. 1.0.0)
- [ ] Tester: _________________ (nome)
- [ ] Data: _________________ (5 Nov 2025)

---

### 1️⃣ PERFORMANCE (5 min)

**Scroll Performance**:

- [ ] Scroll feed veloce → ✅ Fluido / ❌ Lag
- [ ] Scroll 50+ libri → ✅ No slowdown / ❌ Rallenta
- [ ] Immagini caricano → ✅ Progressive / ❌ Blocca UI

**Load Times**:

- [ ] Cold start → _______ sec (target < 3s)
- [ ] Warm start → _______ sec (target < 1s)
- [ ] Open dettaglio libro → _______ ms (target < 500ms)

**Memory**:

- [ ] Usa app 15 min continui → ✅ Stabile / ❌ Crash/Slow

**Notes**: ____________________________________________

---

### 2️⃣ FUNZIONALITÀ (10 min)

**Home Feed**:

- [ ] Prima riga leggibile e ben formattata
- [ ] Titolo/autore nascosti (blind mode)
- [ ] Cover image carica (se presente)
- [ ] Like button risponde
- [ ] Next button carica prossimo libro
- [ ] Dettaglio si apre con tap

**Dettaglio Libro**:

- [ ] Mostra: titolo, autore, descrizione, anno, generi
- [ ] Cover ad alta qualità
- [ ] Link Amazon funziona
- [ ] Close button (X) chiude modal
- [ ] Swipe down chiude (iOS) / Back button (Android)

**Favorites**:

- [ ] Mostra tutti i libri piaciuti
- [ ] Tap apre dettaglio
- [ ] Unlike rimuove da lista
- [ ] Empty state se nessun favorite

**Profile**:

- [ ] User info mostra correttamente
- [ ] Stats accurate (se presenti)

**Notes**: ____________________________________________

---

### 3️⃣ NETWORK (5 min)

**WiFi Veloce**:

- [ ] Feed carica in < 2 sec
- [ ] Like sync istantaneo

**Connessione Lenta** (attiva 3G/throttling):

- [ ] Loading indicators mostrano
- [ ] Timeout gestito con retry
- [ ] App non crasha

**Offline** (modalità aereo):

- [ ] Cached data mostra libri visti
- [ ] Error message "Nessuna connessione"
- [ ] Riconnessione → Auto-sync

**Notes**: ____________________________________________

---

### 4️⃣ UI/UX (5 min)

**Layout**:

- [ ] Testo leggibile su questo device
- [ ] Buttons facilmente tappabili (min 44pt)
- [ ] Immagini non distorte
- [ ] No elementi tagliati/sovrapposti

**Navigazione**:

- [ ] Tab switch istantaneo
- [ ] Back navigation funziona (Android)
- [ ] Gesture navigation funziona (iOS)

**Animazioni**:

- [ ] Transizioni smooth
- [ ] Modal apre/chiude fluidamente
- [ ] No jank o freeze

**Notes**: ____________________________________________

---

### 5️⃣ ERROR HANDLING (3 min)

Testa questi scenari:

- [ ] **Force quit app** → Riapri → Stato recuperato
- [ ] **Tap link rotto** → Error message appropriato
- [ ] **Backend timeout** → Retry button funziona

**Notes**: ____________________________________________

---

### 6️⃣ EDGE CASES (2 min)

- [ ] **Libro senza cover** → Placeholder mostra
- [ ] **Autore nome lungo** → Truncate corretto
- [ ] **Descrizione vuota** → Placeholder text

**Notes**: ____________________________________________

---

## 🐛 BUG TROVATI

Usa questo formato per ogni bug:

### Bug #1

- **Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
- **Descrizione**: _______________________________________
- **Steps to Reproduce**:
  1. _______________________________________
  2. _______________________________________
- **Expected**: _______________________________________
- **Actual**: _______________________________________
- **Screenshot**: [Allega se possibile]

### Bug #2

- **Severity**: _______
- **Descrizione**: _______________________________________
- **Steps**: _______________________________________

---

## 💡 FEEDBACK & SUGGERIMENTI

**Cosa ti è piaciuto**:

- _______________________________________
- _______________________________________

**Cosa miglioreresti**:

- _______________________________________
- _______________________________________

**Feature richieste**:

- _______________________________________
- _______________________________________

---

## ⭐ RATING FINALE

**Performance**: ⭐⭐⭐⭐⭐ (1-5)  
**Stabilità**: ⭐⭐⭐⭐⭐ (1-5)  
**UI/UX**: ⭐⭐⭐⭐⭐ (1-5)  
**Funzionalità**: ⭐⭐⭐⭐⭐ (1-5)

**Overall**: ⭐⭐⭐⭐⭐ (1-5)

**Consiglieresti l'app?** ✅ Sì / ❌ No / 🤔 Forse

**Compresti libri scoperti?** ✅ Sì / ❌ No / 🤔 Forse

---

## 📤 SUBMIT

Dopo completato testing:

1. Salva questo file come `test-report-[device]-[date].md`
2. Apri issue GitHub per ogni bug trovato
3. Condividi feedback con team

**Grazie! 🙏**
