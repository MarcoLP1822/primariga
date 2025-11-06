# PostHog Analytics - Quick Setup Guide

## 📊 Overview

Primariga utilizza **PostHog** per analytics comportamentali e tracking utenti. PostHog permette di:

- Tracciare eventi utente (likes, purchases, screen views)
- Analizzare funnel di conversione
- Segmentare utenti in cohort
- Eseguire A/B test
- Session replay (opzionale)

## 🚀 Setup Iniziale

### 1. Crea Account PostHog

**Opzione A: Cloud (Raccomandato per iniziare)**
1. Vai su [https://app.posthog.com/signup](https://app.posthog.com/signup)
2. Crea account gratuito (1M events/mese inclusi)
3. Crea un nuovo progetto per Primariga

**Opzione B: Self-Hosted (Per privacy completa)**
```bash
git clone https://github.com/PostHog/posthog
cd posthog
docker-compose up -d
```

### 2. Ottieni API Key

1. Vai su Project Settings
2. Copia "Project API Key" (inizia con `phc_...`)
3. Copia "Host" (es. `https://app.posthog.com` o URL self-hosted)

### 3. Configura Environment Variables

Aggiungi al tuo file `.env`:

```bash
# PostHog Analytics Configuration
EXPO_PUBLIC_POSTHOG_API_KEY=phc_your_actual_api_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

> **Nota**: Se lasci vuoto `EXPO_PUBLIC_POSTHOG_API_KEY`, l'analytics sarà disabilitato (utile per development locale).

### 4. Verifica Installazione

L'app inizializza automaticamente PostHog all'avvio. Per verificare:

1. Avvia l'app: `npm run ios` o `npm run android`
2. Controlla console per: `[PostHog] Initialized successfully`
3. Vai su PostHog Dashboard > Live Events
4. Dovresti vedere eventi in real-time

## 📱 Eventi Tracciati

### App Lifecycle
- `app_opened` - App avviata (auto-tracked)
- `app_backgrounded` - App in background (auto-tracked)
- `app_foregrounded` - App in foreground (auto-tracked)

### Screen Views
- `screen_viewed` - Ogni cambio schermata (auto-tracked)
  - Properties: `screen_name`

### Book Interactions
- `book_card_viewed` - Libro mostrato in feed
- `book_detail_opened` - Dettaglio libro aperto
- `book_liked` - Libro aggiunto ai preferiti
- `book_unliked` - Libro rimosso dai preferiti
- `purchase_link_clicked` - Click su link acquisto
  - Properties: `book_id`, `book_title`, `book_author`, `screen`

### User Authentication
- `signup_started` - Inizio registrazione
- `signup_completed` - Registrazione completata
- `login_started` - Tentativo login
- `login_completed` - Login riuscito
- `login_failed` - Login fallito
- `logout` - Logout effettuato

### Errors
- `error_occurred` - Errore generico
- `api_error` - Errore API

## 🔍 Funnel Principali

### 1. Purchase Funnel

Analizza il percorso dall'esplorazione all'acquisto:

```
screen_viewed (Home)
  ↓
book_card_viewed
  ↓
book_detail_opened
  ↓
purchase_link_clicked
```

**Come creare in PostHog**:
1. Vai su Insights > New Funnel
2. Aggiungi step: `screen_viewed` (filter: `screen_name = Home`)
3. Aggiungi step: `book_card_viewed`
4. Aggiungi step: `book_detail_opened`
5. Aggiungi step: `purchase_link_clicked`
6. Salva come "Book Purchase Funnel"

### 2. Auth Funnel

Analizza conversione signup:

```
signup_started
  ↓
signup_completed
  ↓
book_liked (first engagement)
```

## 👥 User Identification

### Automatic Identification

L'app identifica automaticamente gli utenti al login:

```typescript
// Eseguito automaticamente in store.ts
analytics.identify(userId, {
  email: user.email,
  username: user.username,
  full_name: user.fullName,
  auth_method: 'email'
});
```

### User Properties

Proprietà automaticamente associate a ogni evento:
- `user_id` - ID utente
- `email` - Email utente
- `username` - Username
- `is_authenticated` - Se autenticato
- `auth_method` - Metodo auth (`email`, `google`, `apple`)

## 📊 Dashboard Consigliati

### 1. Product Health Dashboard

Crea un dashboard con:

```
- DAU (Daily Active Users) - Trend
- WAU (Weekly Active Users) - Trend
- MAU (Monthly Active Users) - Trend
- DAU/MAU Ratio (Stickiness) - Percentage
- Session Duration - Average
- Sessions per User - Average
```

### 2. Engagement Dashboard

```
- Books Viewed per Session - Average
- Like Rate (book_liked / book_card_viewed) - Percentage
- Purchase Click Rate (purchase_link_clicked / book_detail_opened) - Percentage
- Top 10 Liked Books - Table
- Top 10 Clicked Books - Table
```

### 3. Conversion Dashboard

```
- Anonymous → Registered - Funnel
- Signup Funnel - Funnel (started → completed)
- Time to First Like - Average
- Time to First Purchase Click - Average
```

## 🔧 Utilizzo Avanzato

### Track Custom Event

```typescript
import { analytics, AnalyticsEvent } from '@/infrastructure/analytics';

// Track event
analytics.track(AnalyticsEvent.BOOK_SHARED, {
  book_id: '123',
  book_title: 'Il nome della rosa',
  share_method: 'whatsapp',
  screen: 'Book Detail'
});
```

### Register Super Properties

Proprietà inviate con ogni evento:

```typescript
// Register once at app startup
analytics.register({
  app_version: '1.0.0',
  environment: 'production',
  platform: Platform.OS,
});
```

### Track Screen Manually

```typescript
import { useScreenTracking } from '@/presentation/hooks/useScreenTracking';

function MyScreen() {
  useScreenTracking('My Screen', {
    custom_property: 'value'
  });
  
  return <View>...</View>;
}
```

## 🔒 Privacy & GDPR

### Opt-Out

Non ancora implementato ma pianificato:

```typescript
// TODO: Implement in profile screen
const handleOptOut = () => {
  posthog?.optOut();
  // Save preference in AsyncStorage
};
```

### Data Retention

Configurare in PostHog Dashboard:
- Settings > Data Management > Data Retention
- Raccomandato: 7 anni per eventi, 30 giorni per session recordings

### PII (Personally Identifiable Information)

**MAI tracciare**:
- Password
- Informazioni di pagamento
- Numeri di telefono (non usati in Primariga)

**OK tracciare** (con consenso):
- Email (hashed in produzione se richiesto)
- Username
- User ID

## 📈 Metriche Chiave da Monitorare

### Weekly Review

- **DAU trend**: crescita/decrescita utenti attivi
- **Retention D1, D7, D30**: quanti utenti ritornano
- **Top 5 eventi**: cosa fanno gli utenti
- **Purchase click rate**: quanto convertono i libri

### Monthly Review

- **MAU trend**: crescita utente base
- **Cohort retention**: quanto sticky è l'app
- **Feature adoption**: nuove feature adottate?
- **Funnel drop-off**: dove perdere utenti

## 🐛 Troubleshooting

### Eventi non appaiono in PostHog

1. Verifica API key in `.env`
2. Controlla console per errori PostHog
3. Verifica network: eventi inviati a PostHog endpoint?
4. PostHog buffering: eventi potrebbero arrivare con delay (<30s)

### "PostHog not initialized"

Causa: API key mancante o errato
Fix: Verifica `.env` e riavvia app

### Troppi eventi / costo elevato

1. Rimuovi eventi poco utili
2. Sample eventi (implementa sampling rate)
3. Considera self-hosting PostHog

## 📚 Risorse

- [PostHog Docs](https://posthog.com/docs)
- [React Native SDK](https://posthog.com/docs/libraries/react-native)
- [Event Tracking Best Practices](https://posthog.com/docs/data/events)
- [Funnel Analysis](https://posthog.com/docs/user-guides/funnels)
- [Cohort Analysis](https://posthog.com/docs/user-guides/cohorts)

## ✅ Checklist Post-Setup

- [ ] API key configurata e funzionante
- [ ] Eventi live visibili su PostHog dashboard
- [ ] Purchase funnel creato
- [ ] Auth funnel creato
- [ ] Product Health dashboard creato
- [ ] Alert configurati per metriche critiche
- [ ] Privacy policy aggiornata con analytics disclosure
- [ ] Team training completato

---

**Prossimi Step**: Analizza dati per 2-4 settimane, poi ottimizza funnel con maggior drop-off.
