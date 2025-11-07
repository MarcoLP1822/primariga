# ✅ Testing Checklist - Mobile Devices

**Device**: _____________ (es. iPhone 15 Pro, Samsung Galaxy S23)  
**OS**: _____________ (es. iOS 17.1, Android 14)  
**Tester**: _____________  
**Data**: _____________

---

## ⚡ Test Veloce (5 minuti)

**Happy Path - Core Flow**:

- [ ] ✅ App si avvia in < 3 secondi
- [ ] ✅ Feed mostra prime righe di libri
- [ ] ✅ Scroll è fluido (60fps, no lag)
- [ ] ✅ Tap ❤️ (like) → Like salvato
- [ ] ✅ Tap su card → Dettaglio libro si apre
- [ ] ✅ Tap link Amazon → Browser si apre
- [ ] ✅ Tab Favorites → Libro piaciuto appare
- [ ] ✅ Pull to refresh → Lista si aggiorna

**Risultato**: ✅ Tutto OK / ⚠️ Problemi minori / ❌ Bug critici

**Note**: ____________________________________________

---

## 📱 Test Completo (20 minuti)

### 1. PERFORMANCE (5 min)

**Scroll & Fluidità**:
- [ ] Scroll feed veloce → 60fps costanti
- [ ] Scroll 50+ libri → No slowdown
- [ ] Immagini caricano → Progressivamente, no blocchi UI

**Load Times** (cronometra):
- [ ] Cold start → _____ sec (target: < 3s)
- [ ] Warm start → _____ sec (target: < 1s)
- [ ] Apri dettaglio libro → _____ ms (target: < 500ms)

**Memoria & Stabilità**:
- [ ] Usa app 15 minuti continui → No crash, no rallentamenti
- [ ] Apri/chiudi app 5 volte → Sempre veloce

**Note**: ____________________________________________

---

### 2. FUNZIONALITÀ (5 min)

**Home Feed**:
- [ ] Prima riga è leggibile e ben formattata
- [ ] Titolo e autore NASCOSTI (blind mode)
- [ ] Cover image carica (se presente)
- [ ] ❤️ Like button risponde al tap
- [ ] Next/Skip carica prossima riga
- [ ] Tap su card apre dettaglio

**Dettaglio Libro (Modal)**:
- [ ] Mostra: titolo, autore, descrizione, anno, pagine, generi
- [ ] Cover image alta qualità
- [ ] Link Amazon funziona → Apre Safari/Amazon app
- [ ] Close button (X) chiude modal
- [ ] Swipe down chiude modal (gesture iOS)
- [ ] Animazione apertura/chiusura fluida

**Tab Navigation**:
- [ ] Home tab (🏠) → Feed libri
- [ ] Favorites tab (❤️) → Libri piaciuti
- [ ] Profile tab (👤) → Profilo utente
- [ ] Switch tra tab istantaneo
- [ ] Stato preservato tornando a tab

**Favorites**:
- [ ] Mostra tutti i libri con like
- [ ] Tap su libro → Apre dettaglio
- [ ] Unlike (tap ❤️ di nuovo) → Rimuove da lista
- [ ] Empty state se nessun favorite

**Note**: ____________________________________________

---

### 3. iOS NATIVE FEATURES (3 min)

**Gesture Native**:
- [ ] Swipe da sinistra → Back navigation
- [ ] Swipe down su modal → Chiude modal
- [ ] Pull to refresh → Aggiorna feed
- [ ] Long press → [Se implementato]

**Safe Area**:
- [ ] Status bar non copre contenuto
- [ ] Notch/Dynamic Island lascia spazio al contenuto
- [ ] Home indicator (barra bassa) non copre buttons

**Dark Mode** (Settings → Display → Dark):
- [ ] Attiva Dark Mode → App adatta colori
- [ ] Testo leggibile su sfondo scuro
- [ ] Contrasto adeguato

**Keyboard**:
- [ ] Keyboard appare correttamente (se ci sono input)
- [ ] Layout non si rompe con keyboard visibile
- [ ] Return key ha label corretto

**Note**: ____________________________________________

---

### 4. NETWORK (3 min)

**WiFi Veloce**:
- [ ] Feed carica in < 2 secondi
- [ ] Like sincronizza istantaneamente

**4G/5G**:
- [ ] Feed carica correttamente
- [ ] Immagini caricano (più lente ma ok)

**Modalità Aereo** (Attivala):
- [ ] App mostra cached data (libri già visti)
- [ ] Error message "Nessuna connessione"
- [ ] App NON crasha

**Riconnessione** (Disattiva modalità aereo):
- [ ] App rileva connessione tornata
- [ ] Like offline vengono sincronizzati
- [ ] Feed si aggiorna automaticamente

**Note**: ____________________________________________

---

### 5. UI/UX (2 min)

**Layout su QUESTO device**:
- [ ] Testo leggibile (dimensione adeguata)
- [ ] Buttons facilmente tappabili (min 44pt)
- [ ] Immagini non distorte
- [ ] No elementi tagliati o sovrapposti
- [ ] Spaziature corrette

**Animazioni**:
- [ ] Transizioni fluide tra schermate
- [ ] Modal apre/chiude smooth
- [ ] No freeze o jank

**Feedback Visivo**:
- [ ] Tap su bottoni → Visual feedback (colore/animazione)
- [ ] Loading indicators mostrano durante caricamenti
- [ ] Error states hanno messaggi chiari

**Note**: ____________________________________________

---

### 6. EDGE CASES (2 min)

- [ ] Libro senza cover → Placeholder mostra
- [ ] Libro senza link acquisto → Button disabilitato o nascosto
- [ ] Nome autore lunghissimo → Text truncate (...)
- [ ] Descrizione vuota → Placeholder o nascosta
- [ ] Force quit app → Riapri → Stato recuperato

**Note**: ____________________________________________

---

## 🐛 BUG TROVATI

### Bug #1
- **🔴 Priority**: Critical / High / Medium / Low
- **Descrizione**: ____________________________________
- **Steps to Reproduce**:
  1. ____________________________________
  2. ____________________________________
- **Expected**: ____________________________________
- **Actual**: ____________________________________
- **Screenshot**: [Allega]

### Bug #2
- **Priority**: _______
- **Descrizione**: ____________________________________

### Bug #3
- **Priority**: _______
- **Descrizione**: ____________________________________

---

## 💡 FEEDBACK

**Cosa ti è piaciuto**:
- ____________________________________________
- ____________________________________________
- ____________________________________________

**Cosa miglioreresti**:
- ____________________________________________
- ____________________________________________
- ____________________________________________

**Feature che vorresti**:
- ____________________________________________
- ____________________________________________

**Compresti libri scoperti su Primariga?**  
☐ Sì, sicuramente  
☐ Probabilmente sì  
☐ Forse  
☐ Probabilmente no  
☐ No

---

## ⭐ RATING FINALE

**Performance** (velocità, fluidità): ⭐⭐⭐⭐⭐ (1-5)

**Stabilità** (crash, bug): ⭐⭐⭐⭐⭐ (1-5)

**UI/UX** (design, usabilità): ⭐⭐⭐⭐⭐ (1-5)

**Funzionalità** (tutto funziona): ⭐⭐⭐⭐⭐ (1-5)

**Overall** (impressione generale): ⭐⭐⭐⭐⭐ (1-5)

**Consiglieresti l'app?**  
☐ Sì  
☐ Forse  
☐ No

---

## 📊 METRICHE

**Usage**:
- Prime righe lette: _____ (quante?)
- Libri con like: _____ (quanti?)
- Link Amazon aperti: _____ (volte)
- Tempo totale testing: _____ minuti

**Performance Misurate**:
- Cold start: _____ sec
- Scroll FPS: _____ fps (usa Xcode Instruments se disponibile)
- Memory usage: _____ MB

---

## 📝 NOTE AGGIUNTIVE

____________________________________________
____________________________________________
____________________________________________
____________________________________________

---

**Testing completato**: ☐ Sì ☐ No (parziale)

**Data completamento**: _____________

**Firma tester**: _____________

---

**Salva questo file come**: `test-report-iphone-[modello]-[data].md`

**Poi**:
1. Apri GitHub Issues per ogni bug 🔴/🟠
2. Condividi feedback con team
3. Se tutto OK → Passa a beta testing con più utenti

**Grazie! 🙏📱**
