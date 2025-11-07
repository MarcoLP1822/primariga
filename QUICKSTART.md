# 🚀 Primariga - Quick Start Guide

## ✅ Setup Completato

L'applicazione MVP è ora completamente configurata con:

- ✅ Expo Router con navigazione a tab
- ✅ React Query per data fetching
- ✅ Zustand per state management
- ✅ Supabase configurato con Auth
- ✅ Optional Auth pattern (app utilizzabile senza account)
- ✅ 3 screen principali: Home, Favorites, Profile
- ✅ Screen dettaglio libro con modal
- ✅ Sistema di like/unlike
- ✅ Componenti UI completi
- ✅ Testing infrastructure (74 tests)
- ✅ CI/CD pipeline completa
- ✅ Sentry error tracking
- ✅ PostHog analytics tracking (20+ eventi)
- ✅ Admin system (ruoli e permessi)
- ✅ Security features enterprise-grade

## 🎯 Come Avviare l'App

### 1. Installa le dipendenze (se non già fatto)

```bash
npm install
```

### 2. Verifica le credenziali Supabase

Assicurati che il file `.env` contenga le tue credenziali Supabase reali:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Avvia l'app

**Per iOS Simulator:**

```bash
npm run ios
```

**Per Android Emulator:**

```bash
npm run android
```

**Per Web Browser:**

```bash
npm run web
```

**Per vedere tutte le opzioni:**

```bash
npm start
```

Poi scansiona il QR code con l'app Expo Go sul tuo telefono.

## 📱 Struttura dell'App

```
📱 Primariga
├── 🏠 Scopri (Home)
│   └── Feed con libri casuali, like button, link acquisto
├── ❤️ Preferiti
│   └── Lista dei libri piaciuti
├── 👤 Profilo
│   └── Statistiche utente e informazioni app
└── 📖 Dettaglio Libro (Modal)
    └── Informazioni complete e link di acquisto
```

## ⚠️ Note Importanti

### Database Supabase

Prima di testare l'app, assicurati che il database Supabase contenga dati:

1. Vai su Supabase Dashboard > SQL Editor
2. Esegui il file di migration: `supabase/migrations/20251105000000_initial_schema.sql`
3. Popola la tabella `books` con dati di esempio

**Query SQL per inserire un libro di test:**

```sql
INSERT INTO books (title, author, genres, language, amazon_link)
VALUES
  ('Il nome della rosa', 'Umberto Eco', ARRAY['Giallo', 'Storico'], 'it', 'https://amazon.it/...'),
  ('1984', 'George Orwell', ARRAY['Distopico', 'Fantascienza'], 'it', 'https://amazon.it/...');

-- Inserisci anche le prime righe dei libri
INSERT INTO book_lines (book_id, line_text, line_number)
SELECT id, 'Naturalmente un manoscritto.', 1 FROM books WHERE title = 'Il nome della rosa';
```

### Autenticazione

L'app implementa **Optional Auth pattern**:
- ✅ Completamente utilizzabile senza account
- ✅ Autenticazione richiesta solo per salvare preferiti
- ✅ Supabase Auth con email/password e OAuth (Google, Apple)

**Guide rapide**:
- [docs/SUPABASE_AUTH_IMPLEMENTATION.md](./docs/SUPABASE_AUTH_IMPLEMENTATION.md) - Setup auth completo
- [docs/OPTIONAL_AUTH_IMPLEMENTATION.md](./docs/OPTIONAL_AUTH_IMPLEMENTATION.md) - Pattern reference

**Flusso utente**:
1. User apre app → accesso immediato
2. User esplora libri → nessun login richiesto
3. User tenta like → soft prompt per signup
4. User può continuare senza account o registrarsi

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

Verifica che il file `.env` sia presente e contenga le variabili corrette.

### "No books available"

Il database Supabase è vuoto. Popola la tabella `books` con dati di esempio.

### Expo Router non funziona

Cancella cache e riavvia:

```bash
npx expo start -c
```

### TypeScript errors

Rigenera i tipi:

```bash
npm run type-check
```

## 🎨 Personalizzazione

### Cambiare colori tema

Modifica `src/presentation/theme/colors.ts`

### Aggiungere nuove screen

1. Crea file in `app/` directory
2. Expo Router rileverà automaticamente la route

### Modificare tab bar

Modifica `app/(tabs)/_layout.tsx`

## 📦 Prossimi Step Consigliati

### Priority 1 - Database Population

- [ ] Espandere database con 100+ libri reali
- [ ] Implementare script di scraping/API per prime righe
- [ ] Vedere: `scripts/seed-database.ts`

### Priority 2 - Device Testing

- [ ] Build per dispositivi reali (iOS + Android)
- [ ] Test su diversi device e OS versions
- [ ] Raccogliere feedback da beta tester
- [ ] Vedere: [docs/DEVICE_TESTING.md](./docs/DEVICE_TESTING.md)

### Priority 3 - Features Enhancement

- [ ] Filtri per genere/lingua
- [ ] Ricerca libri
- [ ] Condivisione social
- [ ] Notifiche push (opzionale)

### Priority 4 - Production Release

- [x] Analytics tracking (PostHog implemented)
- [ ] Increase test coverage (target: 80%+)
- [ ] Privacy policy + Terms of Service
- [ ] App Store + Play Store submission

## 📊 Analytics

PostHog è configurato per tracciare:
- User behavior (screen views, book interactions, purchases)
- Conversion funnels (signup, purchase)
- Retention metrics (DAU, WAU, MAU)
- Custom events e user properties

**Setup**: Vedi [docs/POSTHOG_SETUP.md](./docs/POSTHOG_SETUP.md) per configurazione completa.

## 📚 Documentazione

## � Analytics

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Query](https://tanstack.com/query/latest)
- [Supabase](https://supabase.com/docs)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## 🎉 Buon Sviluppo!

L'app è pronta per essere testata e iterata. Inizia popolando il database Supabase e poi testa tutte le funzionalità.
