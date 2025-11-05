# Sentry Integration Guide

## 📋 Overview

Primariga utilizza **Sentry** per error tracking, crash reporting e performance monitoring in production.

## 🎯 Features Implementate

### 1. Error Tracking

- ✅ Automatic crash reporting (iOS, Android, Web)
- ✅ Unhandled promise rejections
- ✅ React Error Boundaries integration
- ✅ Custom error types tracking (AppError)
- ✅ Error context e breadcrumbs

### 2. Performance Monitoring

- ✅ Transaction tracking (20% sample rate in production)
- ✅ API calls monitoring
- ✅ Navigation tracking
- ✅ Profiling (10% sample rate in production)

### 3. Breadcrumbs

- ✅ User actions (likes, reads, navigation)
- ✅ API calls (endpoint, method, status, duration)
- ✅ Book interactions
- ✅ Reading sessions
- ✅ Error recovery events

### 4. Context & Tags

- ✅ User context (userId, email, username)
- ✅ Platform tags (iOS, Android, Web)
- ✅ App version tracking
- ✅ Custom context per event

## 🚀 Setup

### Step 1: Ottenere Sentry DSN

1. Vai su [sentry.io](https://sentry.io) e crea un account
2. Crea un nuovo progetto "React Native"
3. Copia il **DSN** fornito
4. Aggiungi al file `.env`:

```bash
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Step 2: Configurazione già completata

Il progetto ha già:

- ✅ `@sentry/react-native` installato
- ✅ `src/infrastructure/monitoring/sentry.ts` configurato
- ✅ `src/infrastructure/monitoring/breadcrumbs.ts` helper functions
- ✅ Integration con `ErrorHandler.ts`
- ✅ `ErrorBoundary` component con Sentry
- ✅ Initialization in `app/_layout.tsx`

### Step 3: Test Sentry (Opzionale)

```typescript
import * as Sentry from './src/infrastructure/monitoring/sentry';

// Test error
Sentry.captureException(new Error('Test Sentry integration'));

// Test message
Sentry.captureMessage('Sentry is working!', 'info');
```

## 📖 Usage

### Automatic Error Tracking

Gli errori vengono catturati automaticamente:

```typescript
// Error Boundary cattura errori React
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// ErrorHandler.logError invia a Sentry in production
import { logError } from './core/errors/ErrorHandler';

logError(error, { context: 'user-login' });
```

### Manual Error Tracking

```typescript
import { captureException, captureMessage } from './infrastructure/monitoring/sentry';

// Capture exception con context
try {
  // ... codice che può fallire
} catch (error) {
  captureException(error as Error, {
    action: 'fetch-books',
    userId: user.id,
  });
}

// Capture message
captureMessage('User completed onboarding', 'info', {
  userId: user.id,
  completedAt: new Date().toISOString(),
});
```

### User Context

```typescript
import { setSentryUser, clearSentryUser } from './infrastructure/monitoring/sentry';

// Dopo login
setSentryUser(user.id, user.email, user.username);

// Dopo logout
clearSentryUser();
```

### Breadcrumbs

```typescript
import {
  trackNavigation,
  trackAction,
  trackBookInteraction,
  trackReadingSession,
} from './infrastructure/monitoring/breadcrumbs';

// Navigation
trackNavigation('BookDetails', { bookId: '123' });

// User action
trackAction('User liked book', { bookId: '123' });

// Book interaction
trackBookInteraction('like', '123');

// Reading session
trackReadingSession('start');
// ... dopo 5 minuti
trackReadingSession('end', 300);
```

### Performance Monitoring

```typescript
import { startSpan } from './infrastructure/monitoring/sentry';

// Track performance span
const span = startSpan('fetch-books', 'http');

try {
  const response = await fetch('/api/books');
  span.setStatus('ok');
} catch (error) {
  span.setStatus('error');
  throw error;
} finally {
  span.end();
}
```

### Custom Context & Tags

```typescript
import { setContext, setTag } from './infrastructure/monitoring/sentry';

// Set context (strutturato)
setContext('user_preferences', {
  theme: 'dark',
  language: 'it',
  notifications: true,
});

// Set tag (searchable)
setTag('subscription_tier', 'premium');
setTag('feature_flag_new_ui', 'enabled');
```

## 🔧 Configuration

### `src/infrastructure/monitoring/sentry.ts`

```typescript
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',

  // Sample rates
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% in prod
  profilesSampleRate: __DEV__ ? 1.0 : 0.1, // 10% in prod

  // Features
  enableAutoSessionTracking: true,
  enableNative: true,
  enableNativeCrashHandling: true,

  // Hooks
  beforeSend(event, hint) {
    // Sanitize sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
    }
    return event;
  },

  beforeBreadcrumb(breadcrumb, hint) {
    // Filter console logs in production
    if (!__DEV__ && breadcrumb.category === 'console') {
      return null;
    }
    return breadcrumb;
  },
});
```

### Environment Variables

```bash
# .env
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# .env.production
EXPO_PUBLIC_SENTRY_DSN=https://prod-dsn@sentry.io/project-id

# .env.development (optional)
# EXPO_PUBLIC_SENTRY_DSN=  # Leave empty to disable in dev
```

## 📊 Sentry Dashboard

### Issues Tab

- Visualizza errori raggruppati
- Stack traces completi
- Breadcrumbs timeline
- User impact (quanti utenti affected)
- Release tracking

### Performance Tab

- Transaction overview
- Slow transactions
- Most time-consuming operations
- Apdex score

### Releases Tab

- Deploy tracking
- Crash-free users %
- New issues per release
- Adoption rate

## 🎯 Best Practices

### 1. Meaningful Error Messages

```typescript
// ❌ Bad
throw new Error('Error');

// ✅ Good
throw new ValidationError('Invalid email format', {
  field: 'email',
  value: email,
  reason: 'missing_at_symbol',
});
```

### 2. Add Context

```typescript
// ❌ Bad
logError(error);

// ✅ Good
logError(error, {
  userId: user.id,
  bookId: book.id,
  action: 'like-book',
  timestamp: new Date().toISOString(),
});
```

### 3. Use Breadcrumbs

```typescript
// Track user journey
trackNavigation('Home');
trackAction('Tapped "Random Book"');
trackBookInteraction('view', bookId);
trackBookInteraction('like', bookId);
trackNavigation('BookDetails', { bookId });
```

### 4. Sanitize Sensitive Data

```typescript
beforeSend(event) {
  // Remove passwords
  if (event.request?.data?.password) {
    event.request.data.password = '[Filtered]';
  }

  // Remove tokens
  if (event.request?.headers?.['Authorization']) {
    delete event.request.headers['Authorization'];
  }

  return event;
}
```

### 5. Set User Context After Login

```typescript
// In login flow
const handleLogin = async (email: string, password: string) => {
  const user = await login(email, password);

  // Set Sentry user context
  setSentryUser(user.id, user.email, user.username);
};
```

### 6. Clear User Context After Logout

```typescript
const handleLogout = async () => {
  await logout();

  // Clear Sentry user context
  clearSentryUser();
};
```

## 🔍 Debugging

### Local Testing

```typescript
// Enable debug mode in sentry.ts
Sentry.init({
  debug: true, // Logs all Sentry events to console
  // ...
});
```

### Check if Sentry is Initialized

```typescript
import Sentry from './infrastructure/monitoring/sentry';

console.log('Sentry initialized:', Sentry.getCurrentHub().getClient() !== undefined);
```

### Test Error Capture

```typescript
// Add a test button
<Button
  onPress={() => {
    Sentry.captureException(new Error('Test error from app'));
  }}
>
  Test Sentry
</Button>
```

## 📈 Monitoring Checklist

- [ ] Sentry DSN configurato in `.env`
- [ ] `initSentry()` chiamato in `app/_layout.tsx`
- [ ] `ErrorBoundary` wrappa l'app
- [ ] `logError()` integrato con Sentry
- [ ] User context impostato dopo login
- [ ] User context cleared dopo logout
- [ ] Breadcrumbs aggiunti per azioni chiave
- [ ] Sensitive data sanitizzati in `beforeSend`
- [ ] Test error capture funzionante
- [ ] Release tracking configurato

## 🚨 Alerts & Notifications

### Setup Alerts su Sentry

1. Vai su **Settings → Alerts**
2. Crea regola: "New Issue Alert"
   - Trigger: Issue is first seen
   - Action: Send email/Slack notification
3. Crea regola: "High Error Rate"
   - Trigger: Error count > 100 in 5 minutes
   - Action: Send email/PagerDuty

### Slack Integration

1. **Settings → Integrations → Slack**
2. Authorize workspace
3. Configure channel (#alerts-production)
4. Test notification

## 📚 Resources

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/react-native/performance/)
- [Sentry Error Handling](https://docs.sentry.io/platforms/react-native/usage/)
- [Sentry Breadcrumbs](https://docs.sentry.io/platforms/react-native/enriching-events/breadcrumbs/)
- [Sentry User Feedback](https://docs.sentry.io/platforms/react-native/user-feedback/)

## 🎉 Status

**Sentry Integration:** ✅ Completa e pronta per production

- ✅ SDK installato e configurato
- ✅ Error tracking automatico
- ✅ Performance monitoring
- ✅ Breadcrumbs system
- ✅ User context tracking
- ✅ ErrorHandler integration
- ✅ ErrorBoundary integration
- ✅ Documentation completa

**Next Steps:**

1. Configurare Sentry DSN in `.env`
2. Test error capture in staging
3. Setup alerts e notifications
4. Monitor per 1 settimana
5. Ottimizzare sample rates based su volume

---

**Ultima modifica:** 2025-11-05
