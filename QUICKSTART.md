# 🚀 Primariga - Quick Start Guide

## ✅ Setup Completato

L'applicazione MVP è ora completamente configurata con:

- ✅ Expo Router con navigazione a tab
- ✅ React Query per data fetching
- ✅ Zustand per state management
- ✅ Supabase configurato
- ✅ 3 screen principali: Home, Favorites, Profile
- ✅ Screen dettaglio libro con modal
- ✅ Sistema di like/unlike
- ✅ Componenti UI completi

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

### Autenticazione Temporanea

Attualmente l'app usa un sistema di autenticazione temporaneo (ID generato client-side).

Per produzione, implementare:

- Supabase Auth con OAuth providers
- Email/Password authentication
- User profiles persistenti

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

### Priority 1 - Dati Reali

- [ ] Popolare database con catalogo libri reali
- [ ] Implementare scraping/API per ottenere prime righe

### Priority 2 - Autenticazione

- [ ] Implementare Supabase Auth
- [ ] User profiles persistenti
- [ ] Social login (Google, Apple)

### Priority 3 - Features

- [ ] Filtri per genere/lingua
- [ ] Ricerca libri
- [ ] Condivisione social
- [ ] Notifiche push

### Priority 4 - Production Ready

- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog/Mixpanel)
- [ ] Testing (Jest + Detox)
- [ ] CI/CD pipeline
- [ ] App Store deployment

## 📚 Documentazione

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Query](https://tanstack.com/query/latest)
- [Supabase](https://supabase.com/docs)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## 🎉 Buon Sviluppo!

L'app è pronta per essere testata e iterata. Inizia popolando il database Supabase e poi testa tutte le funzionalità.
