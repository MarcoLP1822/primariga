# Analytics Implementation - Primariga

## 📊 Stato Attuale

### ✅ Implementato

#### 1. **Analytics Infrastructure Base**
- ✅ Database analytics (views/clicks tracking)
- ✅ Supabase RPC functions per contatori
- ✅ Integration nel `SupabaseBookRepository`
- ✅ Script di migration (`run-analytics-migration.ts`)

#### 2. **Metriche Traciate**
- **Book Views**: Conteggio visualizzazioni dettaglio libro
- **Purchase Link Clicks**: Conteggio click su link Amazon

#### 3. **Struttura Database**
```sql
-- Colonne aggiunte alla tabella books:
ALTER TABLE books
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_count integer DEFAULT 0;

-- RPC Functions disponibili:
- increment_book_view(book_id uuid)
- increment_book_click(book_id uuid)
```

#### 4. **Monitoring Esistente**
- ✅ **Sentry** configurato per error tracking
- ✅ Performance monitoring (Sentry tracing)
- ✅ Session tracking automatico
- ✅ Crash reporting nativo (iOS + Android)

---

## ❌ Non Implementato

### 1. **Product Analytics Suite**

**Manca**: Piattaforma dedicata per analytics comportamentali e business metrics.

**Soluzioni suggerite**:
- **PostHog** (open-source, self-hosted o cloud)
- **Mixpanel** (focus su user behavior)
- **Amplitude** (enterprise-grade)
- **Segment** (data pipeline + routing)

### 2. **Eventi Utente Non Tracciati**

Eventi business-critical che andrebbero implementati:

#### User Engagement
- [ ] App opened
- [ ] Screen viewed (Home, Favorites, Profile, Book Detail)
- [ ] Book swiped (left/right)
- [ ] Search performed
- [ ] Filter applied

#### Book Interactions
- [ ] Book viewed (dettaglio)
- [ ] Book liked/unliked
- [ ] Purchase link clicked (con tracking referrer)
- [ ] Book shared
- [ ] Reading started/completed

#### User Journey
- [ ] Signup started/completed
- [ ] Login successful/failed
- [ ] Profile updated
- [ ] Preferences changed

#### Retention & Engagement
- [ ] Session duration
- [ ] Daily Active Users (DAU)
- [ ] Weekly Active Users (WAU)
- [ ] Retention rates (Day 1, 7, 30)
- [ ] Churn prediction signals

### 3. **Funnel Analytics**

**Mancano** funnel critici per ottimizzare conversioni:

```
User Acquisition Funnel:
App Install → First Open → Book View → Like/Save → Purchase Click

Auth Funnel:
Anonymous → Signup Started → Email Verified → Profile Completed

Engagement Funnel:
Home View → Book Detail → Like → Return Visit → Purchase
```

### 4. **Cohort Analysis**

- [ ] Retention per cohort (settimana di registrazione)
- [ ] LTV (Lifetime Value) analysis
- [ ] Feature adoption rate per cohort

### 5. **A/B Testing Infrastructure**

- [ ] Feature flags system
- [ ] Experiment tracking
- [ ] Variant assignment
- [ ] Statistical significance testing

### 6. **Custom Dashboards**

- [ ] Real-time metrics dashboard
- [ ] Business KPI dashboard
- [ ] Product health dashboard

---

## 🎯 Raccomandazioni Implementazione

### Phase 1: Setup Analytics Provider (Priority: HIGH)

**Scelta Consigliata**: **PostHog**

**Perché PostHog?**
- ✅ Open-source (può essere self-hosted)
- ✅ Completo: Events, Funnels, Cohorts, Session Replay, A/B testing
- ✅ Privacy-friendly (GDPR compliant)
- ✅ Free tier generoso (1M events/mese)
- ✅ React Native SDK ufficiale

**Alternative**:
- **Mixpanel**: Ottimo per user behavior, ma costoso
- **Amplitude**: Enterprise-grade, ma overkill per MVP

#### Implementazione PostHog

**1. Setup Account**
```bash
# Opzione 1: Cloud (più semplice)
Visit: https://app.posthog.com/signup

# Opzione 2: Self-hosted (più privacy)
docker-compose up -d
```

**2. Installazione**
```bash
npm install posthog-react-native
npm install @react-native-async-storage/async-storage
npx expo install expo-file-system expo-application expo-device expo-localization
```

**3. Configurazione**
```typescript
// src/infrastructure/analytics/posthog.ts
import PostHog from 'posthog-react-native';

export const initPostHog = async () => {
  const posthog = await PostHog.initAsync(
    process.env.EXPO_PUBLIC_POSTHOG_API_KEY!,
    {
      host: 'https://app.posthog.com', // or your self-hosted URL
      captureApplicationLifecycleEvents: true,
      captureDeepLinks: true,
      enableSessionReplay: true, // powerful feature!
    }
  );
  return posthog;
};
```

**4. Tracking Events**
```typescript
// src/infrastructure/analytics/events.ts
export enum AnalyticsEvent {
  // App Lifecycle
  APP_OPENED = 'app_opened',
  
  // Screens
  SCREEN_VIEWED = 'screen_viewed',
  
  // Book Interactions
  BOOK_VIEWED = 'book_viewed',
  BOOK_LIKED = 'book_liked',
  BOOK_UNLIKED = 'book_unliked',
  PURCHASE_LINK_CLICKED = 'purchase_link_clicked',
  
  // User Actions
  SIGNUP_STARTED = 'signup_started',
  SIGNUP_COMPLETED = 'signup_completed',
  LOGIN_COMPLETED = 'login_completed',
  
  // Search & Discovery
  SEARCH_PERFORMED = 'search_performed',
  FILTER_APPLIED = 'filter_applied',
}

// Analytics service wrapper
import { posthog } from './posthog';

export const analytics = {
  track: (event: AnalyticsEvent, properties?: Record<string, any>) => {
    posthog?.capture(event, properties);
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    posthog?.identify(userId, traits);
  },
  
  screen: (screenName: string, properties?: Record<string, any>) => {
    posthog?.screen(screenName, properties);
  },
  
  reset: () => {
    posthog?.reset();
  },
};
```

**5. Integrazione nelle Screen**
```typescript
// esempio: app/(tabs)/index.tsx
import { useEffect } from 'react';
import { analytics, AnalyticsEvent } from '@/infrastructure/analytics';

export default function HomeScreen() {
  useEffect(() => {
    analytics.screen('Home');
  }, []);
  
  const handleBookLike = (bookId: string) => {
    analytics.track(AnalyticsEvent.BOOK_LIKED, {
      book_id: bookId,
      screen: 'Home',
    });
    // ... existing logic
  };
  
  return (/* ... */);
}
```

---

### Phase 2: Essential Events Implementation (Priority: HIGH)

**Checklist implementazione**:

```typescript
// 1. App Lifecycle
- [ ] App opened (auto-tracked by PostHog)
- [ ] App backgrounded
- [ ] App foregrounded

// 2. Screen Tracking
- [ ] Screen viewed (auto-track con navigation listener)

// 3. Book Interactions
- [ ] Book card viewed (impression tracking)
- [ ] Book detail opened
- [ ] Book liked
- [ ] Book unliked
- [ ] Purchase link clicked
- [ ] Book shared

// 4. User Auth
- [ ] Signup started
- [ ] Signup completed
- [ ] Login attempted
- [ ] Login successful
- [ ] Logout

// 5. Error Tracking
- [ ] Error occurred (integrate con Sentry)
```

**Auto-tracking Navigation**:
```typescript
// App.tsx
import { useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { analytics } from '@/infrastructure/analytics';

export default function RootLayout() {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (!navigationRef) return;

    const unsubscribe = navigationRef.addListener('state', () => {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute) {
        analytics.screen(currentRoute.name, currentRoute.params);
      }
    });

    return unsubscribe;
  }, [navigationRef]);

  return (/* ... */);
}
```

---

### Phase 3: Advanced Analytics (Priority: MEDIUM)

#### 1. Funnel Analysis Setup

**Purchase Funnel**:
```typescript
// PostHog Funnels configuration
const purchaseFunnel = {
  name: 'Book Purchase Funnel',
  steps: [
    { event: 'screen_viewed', properties: { screen_name: 'Home' } },
    { event: 'book_viewed' },
    { event: 'book_liked' },
    { event: 'purchase_link_clicked' },
  ],
};
```

**Auth Funnel**:
```typescript
const authFunnel = {
  name: 'User Signup Funnel',
  steps: [
    { event: 'signup_started' },
    { event: 'signup_completed' },
    { event: 'book_liked' }, // first engagement action
  ],
};
```

#### 2. Cohort Analysis

```typescript
// Define cohorts in PostHog dashboard:
- Users who signed up in week X
- Users who liked 5+ books
- Users who clicked purchase links
- Power users (DAU > 4 days/week)
```

#### 3. User Properties Enrichment

```typescript
// Identify users con proprietà aggiuntive
analytics.identify(userId, {
  email: user.email,
  signup_date: user.created_at,
  plan: 'free',
  total_likes: userProfile.total_likes,
  favorite_genres: userProfile.favorite_genres,
  language_preference: userProfile.language,
});
```

---

### Phase 4: A/B Testing (Priority: LOW)

PostHog include A/B testing nativo:

```typescript
// Esempio: Test diversi CTA per signup
import { useFeatureFlag } from 'posthog-react-native';

function SignupPrompt() {
  const ctaVariant = useFeatureFlag('signup_cta_test');
  
  const ctaText = ctaVariant === 'variant-a' 
    ? 'Salva i tuoi preferiti' 
    : 'Crea il tuo account';
    
  return <Button title={ctaText} />;
}
```

---

## 📈 KPI Dashboard Consigliati

### 1. **Product Health Dashboard**

Metriche chiave da monitorare:

```
Daily Active Users (DAU)
Weekly Active Users (WAU)
Monthly Active Users (MAU)
DAU/MAU Ratio (stickiness)
Retention Rate (D1, D7, D30)
Churn Rate
Session Duration (avg)
Sessions per User (avg)
```

### 2. **Engagement Dashboard**

```
Books Viewed per Session
Like Rate (likes / views)
Purchase Click Rate (clicks / views)
Top Liked Books
Top Clicked Books
Genre Distribution
```

### 3. **Conversion Dashboard**

```
Anonymous → Registered Conversion Rate
Signup Funnel Drop-off
Purchase Funnel Completion
Time to First Like
Time to First Purchase Click
```

### 4. **Technical Dashboard**

```
Crash Rate
Error Rate (by type)
API Response Times
App Launch Time
Screen Load Times
```

---

## 🔒 Privacy & Compliance

### GDPR Considerations

```typescript
// 1. Consent Management
const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

useEffect(() => {
  if (!hasAnalyticsConsent) {
    posthog?.optOut(); // disable tracking
  } else {
    posthog?.optIn();
  }
}, [hasAnalyticsConsent]);

// 2. Data Retention
// Configure in PostHog dashboard:
// - Event data retention: 7 years (or less)
// - Session recordings: 30 days
// - Delete user data on request

// 3. PII Handling
// Never track:
- Email addresses in event properties
- Passwords
- Payment information
- Phone numbers
```

### Required Disclosures

- [ ] Update Privacy Policy con analytics tracking
- [ ] Aggiungere opt-out nel profile screen
- [ ] Cookie/tracking consent prompt (se web)

---

## 💰 Costi Stimati

### PostHog Cloud (raccomandato per MVP)

```
Free Tier:
- 1M events/month
- 15k session recordings/month
- Unlimited team members
- All features included

Paid Tier (se superi free tier):
- $0.00031 per event
- $0.005 per recording
- Circa $450/month per 1.5M events
```

### Alternative Costs

```
Mixpanel:
- Free: 100k events/month
- Growth: $25/month (starts at 10M events/year)

Amplitude:
- Free: 10M events/month (ma feature limitate)
- Growth: $61/month

Segment:
- Free: 1k MTU (Monthly Tracked Users)
- Team: $120/month (starts at 10k MTU)
```

---

## 🚀 Roadmap Implementazione

### Week 1-2: Foundation
- [ ] Scegliere analytics provider (PostHog)
- [ ] Setup account + configurazione
- [ ] Installare SDK
- [ ] Implementare analytics service wrapper
- [ ] Testing in development

### Week 3-4: Core Events
- [ ] Screen tracking automatico
- [ ] Book interaction events
- [ ] User auth events
- [ ] Deploy to production
- [ ] Verificare dati su dashboard

### Week 5-6: Advanced Features
- [ ] Setup funnels
- [ ] Configure cohorts
- [ ] User properties enrichment
- [ ] Error tracking integration

### Week 7-8: Optimization
- [ ] Analyze initial data
- [ ] Identify bottlenecks
- [ ] Setup alerts for critical metrics
- [ ] Create custom dashboards

---

## 📚 Risorse

### PostHog
- [Docs](https://posthog.com/docs)
- [React Native SDK](https://posthog.com/docs/libraries/react-native)
- [Event Tracking Best Practices](https://posthog.com/docs/data/events)

### Analytics Best Practices
- [Segment's Analytics Academy](https://segment.com/academy/)
- [Amplitude's Playbooks](https://amplitude.com/blog/category/playbooks)

### Privacy
- [GDPR Compliance Guide](https://gdpr.eu/)
- [PostHog Privacy Features](https://posthog.com/docs/privacy)

---

## ✅ Checklist Finale

Prima di considerare analytics "implementato":

- [ ] Analytics provider configurato
- [ ] SDK installato e testato
- [ ] Almeno 10 eventi core implementati
- [ ] Screen tracking automatico funzionante
- [ ] User identification al login
- [ ] Privacy policy aggiornata
- [ ] Opt-out mechanism disponibile
- [ ] Dashboard base configurate
- [ ] Team training completato
- [ ] Alerting configurato per metriche critiche

---

## 🎯 Conclusione

**Stato attuale**: Analytics infrastructure esistente è **basica** (solo view/click counters).

**Prossimo step critico**: Implementare **product analytics suite** (PostHog) per tracciare user behavior e business metrics.

**Timeline consigliata**: 4-6 settimane per implementazione completa.

**Priorità**: **ALTA** - Analytics è fondamentale per:
- Product-market fit validation
- User retention optimization
- Feature prioritization data-driven
- Growth loop identification
