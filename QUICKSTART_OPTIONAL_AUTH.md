# 🚀 Optional Auth Quick Reference

Guida rapida per utilizzare il pattern Optional Auth in Primariga.

## 🎯 Filosofia

L'app è **completamente utilizzabile senza account**. L'auth viene richiesta solo per azioni che necessitano persistenza (come salvare preferiti).

## 📝 Quick Usage

### 1. Controllare se Utente è Anonimo

```typescript
import { useAppStore } from '@/infrastructure/store/store';

const requiresAuth = useAppStore((state) => state.requiresAuth);
const isAnonymous = useAppStore((state) => state.isAnonymous);

// In component logic
if (requiresAuth()) {
  // User is anonymous, show auth prompt
  setShowAuthPrompt(true);
  return;
}
```

### 2. Mostrare AuthPrompt

```typescript
import { AuthPrompt } from '@/presentation/components';
import { useState } from 'react';

const [showAuthPrompt, setShowAuthPrompt] = useState(false);

return (
  <>
    <AuthPrompt
      visible={showAuthPrompt}
      onDismiss={() => setShowAuthPrompt(false)}
      action="salvare questo libro tra i preferiti"
      title="Accedi per continuare"
    />
  </>
);
```

### 3. Pattern Completo per Azione Protetta

```typescript
const handleProtectedAction = () => {
  // 1. Check if auth required
  if (requiresAuth()) {
    setShowAuthPrompt(true);
    return;
  }
  
  // 2. User is authenticated, proceed
  performAction();
};
```

## 🎨 AuthPrompt Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `visible` | `boolean` | ✅ Yes | - | Se il modal è visibile |
| `onDismiss` | `() => void` | ✅ Yes | - | Callback quando chiuso |
| `action` | `string` | ❌ No | `"salvare i tuoi preferiti"` | Azione che richiede auth |
| `title` | `string` | ❌ No | `"Accedi per continuare"` | Titolo del modal |
| `message` | `string` | ❌ No | Auto-generated | Messaggio personalizzato |

## 🔄 User States

### Anonymous User (Default)
```typescript
{
  userId: null,
  session: null,
  isAnonymous: true
}
```

- ✅ Può navigare e vedere tutti i libri
- ✅ Vede statistiche base (libri esplorati)
- ❌ Non può salvare preferiti
- ❌ Non vede lista preferiti

### Authenticated User
```typescript
{
  userId: "uuid-123",
  session: { user: {...}, ... },
  isAnonymous: false
}
```

- ✅ Può fare tutto ciò che fa l'anonimo
- ✅ Può salvare preferiti
- ✅ Vede lista preferiti
- ✅ Statistiche complete

## 📱 Screen Behaviors

### Home Screen
```typescript
// Before like
if (requiresAuth()) {
  setShowAuthPrompt(true); // ✅ Soft prompt
  return;
}
toggleLike.mutate(...);
```

### Book Detail Screen
```typescript
// Same pattern as Home
const handleToggleLike = () => {
  if (requiresAuth()) {
    setShowAuthPrompt(true);
    return;
  }
  toggleLike.mutate(...);
};
```

### Profile Screen
```typescript
// Conditional rendering
if (isAnonymous) {
  return <AnonymousProfileView />; // Mostra invito a registrarsi
}
return <AuthenticatedProfileView />; // Mostra preferiti
```

### Favorites Tab
```typescript
// Query automatically returns [] if no userId
const { data: likedBooks } = useLikedBooks();
// enabled: !!userId (in hook implementation)
```

## 🎭 User Flows

### Flow 1: Browse → Like → Signup
```
1. User apre app (isAnonymous: true)
2. User naviga Home Screen
3. User tappa "Salva" su libro
4. AuthPrompt appare
5. User tappa "Crea Account"
6. User completa signup
7. Session salvata (isAnonymous: false)
8. User torna indietro
9. Like ora funziona
```

### Flow 2: Open Profile → Signup
```
1. User apre tab Profile
2. Vede view anonimo con invito
3. User tappa "Crea Account"
4. Completa signup
5. Profile si aggiorna automaticamente
6. User vede preferiti (se ne ha)
```

### Flow 3: Returning User
```
1. App apre
2. initialize() recupera session da AsyncStorage
3. isAnonymous = false
4. User vede tutto immediately
```

## ⚠️ Important Notes

### DO ✅
- Usa `requiresAuth()` per controllare stato
- Mostra AuthPrompt per azioni protette
- Permetti dismissione del prompt
- Spiega benefici chiaramente

### DON'T ❌
- **NON** fare redirect automatici a login
- **NON** mostrare prompt all'avvio app
- **NON** bloccare navigazione
- **NON** forzare signup per browsing

## 🧪 Testing

### Test che Utente Anonimo può:
- ✅ Aprire app
- ✅ Navigare tutte le schermate
- ✅ Vedere tutti i libri
- ✅ Aprire dettagli libro
- ✅ Accedere a Profile tab
- ✅ Vedere statistiche base

### Test che Utente Anonimo NON può (mostra prompt):
- ❌ Salvare preferito
- ❌ Vedere lista preferiti

### Test che Utente Autenticato può:
- ✅ Tutto ciò che fa l'anonimo
- ✅ Salvare preferiti
- ✅ Vedere lista preferiti
- ✅ Vedere statistiche complete

## 🐛 Troubleshooting

### "User can't save likes even after login"
**Check**: `isAnonymous` flag in store
```typescript
console.log(useAppStore.getState().isAnonymous); // should be false
```

### "AuthPrompt not appearing"
**Check**: State management
```typescript
const [showAuthPrompt, setShowAuthPrompt] = useState(false);
// Ensure setShowAuthPrompt(true) is called
```

### "App redirects to login automatically"
**Check**: No forced redirects in _layout.tsx
```typescript
// ❌ BAD
if (!session) router.replace('/login');

// ✅ GOOD
initialize(); // Silent check only
```

## 📚 Related Docs

- [OPTIONAL_AUTH_IMPLEMENTATION.md](./docs/OPTIONAL_AUTH_IMPLEMENTATION.md) - Complete pattern documentation
- [SUPABASE_AUTH_IMPLEMENTATION.md](./docs/SUPABASE_AUTH_IMPLEMENTATION.md) - Auth infrastructure
- [QUICKSTART_AUTH.md](./QUICKSTART_AUTH.md) - Auth functions reference

## 🎯 Summary

```typescript
// The entire pattern in 10 lines:
const requiresAuth = useAppStore((state) => state.requiresAuth);
const [showAuthPrompt, setShowAuthPrompt] = useState(false);

const handleProtectedAction = () => {
  if (requiresAuth()) {
    setShowAuthPrompt(true);
    return;
  }
  performAction();
};

<AuthPrompt visible={showAuthPrompt} onDismiss={() => setShowAuthPrompt(false)} />
```

**That's it!** 🎉
