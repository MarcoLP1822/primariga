# Admin System Implementation Guide

## ✅ Implementazione Completata

Il sistema di amministrazione è stato implementato con successo. Ecco cosa è stato fatto:

### 1. **Database Schema** ✅
- Colonna `role` aggiunta alla tabella `profiles` (user, admin, super_admin)
- RLS policies aggiornate per permettere agli admin di gestire libri
- Tabella `admin_audit_log` per tracciare azioni amministrative
- Vista `admin_stats` per dashboard statistiche

**File**: `supabase/migrations/20251107000000_add_admin_roles.sql`

### 2. **TypeScript Types** ✅
- Tipo `UserRole` aggiunto
- Interface `UserProfile` aggiornata con campo `role`
- Helper functions `isAdmin()` e `isSuperAdmin()`

**File**: `src/domain/entities/UserProfile.ts`

### 3. **Admin Guard** ✅
Utility class per verificare permessi admin:
- `AdminGuard.isAdmin(userId)` - Verifica se utente è admin
- `AdminGuard.isSuperAdmin(userId)` - Verifica se utente è super admin
- `AdminGuard.getCurrentUserRole()` - Ottiene ruolo corrente
- `AdminGuard.requireAdmin()` - Richiede privilegi admin (throws se non admin)
- `AdminGuard.logAdminAction()` - Logga azioni amministrative

**File**: `src/infrastructure/auth/AdminGuard.ts`

### 4. **React Hooks** ✅
- `useAdmin()` - Hook per verificare se utente è admin
- `useRequireAdmin()` - Hook per proteggere route admin (redirect se non admin)

**File**: `src/presentation/hooks/useAdmin.ts`

### 5. **Zustand Store** ✅
- Campo `isAdmin` aggiunto allo store
- Aggiornato automaticamente quando profile viene caricato

**File**: `src/infrastructure/store/store.ts`

---

## 🚀 Come Usare

### Step 1: Esegui la Migration

Nel dashboard di Supabase, vai su **SQL Editor** e esegui:

```bash
# Nel tuo progetto
cd c:\Users\Youcanprint1\Desktop\AI\primariga

# La migration è in:
supabase/migrations/20251107000000_add_admin_roles.sql
```

Copia il contenuto del file e incollalo nel SQL Editor di Supabase, poi clicca "Run".

### Step 2: Promuovi il Primo Admin

Dopo aver eseguito la migration, promuovi il tuo utente a super_admin:

```sql
-- Trova il tuo user ID
SELECT id, email FROM auth.users WHERE email = 'tua-email@example.com';

-- Promuovi a super_admin
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE id = 'IL_TUO_USER_ID';
```

### Step 3: Verifica

Nell'app, dopo il login, controlla:

```typescript
// Nel codice
const { isAdmin, isSuperAdmin, userRole } = useAdmin();
console.log({ isAdmin, isSuperAdmin, userRole });

// Nello store
const isAdmin = useAppStore(state => state.isAdmin);
console.log('Is admin:', isAdmin);
```

---

## 📝 Esempi di Utilizzo

### Proteggere una Route Admin

```tsx
// app/(admin)/_layout.tsx
import { useRequireAdmin } from '@/src/presentation/hooks/useAdmin';

export default function AdminLayout() {
  const { loading } = useRequireAdmin();
  
  if (loading) {
    return <ActivityIndicator />;
  }
  
  // A questo punto l'utente è sicuramente admin
  return <Stack />;
}
```

### Mostrare UI Condizionale

```tsx
// In qualsiasi componente
import { useAdmin } from '@/src/presentation/hooks/useAdmin';

function BookCard({ book }) {
  const { isAdmin } = useAdmin();
  
  return (
    <View>
      <Text>{book.title}</Text>
      
      {isAdmin && (
        <Button title="Edit Book" onPress={() => editBook(book.id)} />
      )}
    </View>
  );
}
```

### Verificare Permessi nel Backend

```typescript
// In un use case o repository
import { AdminGuard } from '@/src/infrastructure/auth';

async function deleteBook(bookId: string) {
  // Verifica che l'utente sia super admin
  const result = await AdminGuard.requireSuperAdmin();
  
  if (result.isFailure()) {
    throw result.error; // AuthorizationError
  }
  
  // Logga l'azione
  await AdminGuard.logAdminAction({
    action: 'DELETE_BOOK',
    resourceType: 'book',
    resourceId: bookId,
  });
  
  // Procedi con la cancellazione
  await supabase.from('books').delete().eq('id', bookId);
}
```

### Ottenere Statistiche Admin

```typescript
// Dashboard admin
async function loadAdminStats() {
  const { data } = await supabase
    .from('admin_stats')
    .select('*')
    .single();
  
  return data;
  // {
  //   total_books: 150,
  //   books_last_week: 10,
  //   total_users: 500,
  //   users_last_week: 25,
  //   admin_count: 2,
  //   ...
  // }
}
```

---

## 🔐 Permessi per Ruolo

### User (default)
- ✅ Visualizzare libri
- ✅ Like/dislike libri
- ✅ Visualizzare il proprio profilo
- ❌ Modificare libri
- ❌ Vedere profili altri utenti

### Admin
- ✅ Tutto quello che può fare User
- ✅ Inserire nuovi libri
- ✅ Modificare libri esistenti
- ✅ Vedere tutti i profili utenti
- ✅ Vedere statistiche admin
- ✅ Vedere audit log
- ❌ Eliminare libri
- ❌ Modificare ruoli utenti

### Super Admin
- ✅ Tutto quello che può fare Admin
- ✅ Eliminare libri
- ✅ Modificare ruoli di altri utenti
- ✅ Accesso completo al sistema

---

## 📊 Monitoraggio

### Visualizzare Audit Log

```sql
-- Ultimi 50 azioni admin
SELECT 
  al.*,
  p.username as admin_username
FROM admin_audit_log al
JOIN profiles p ON al.admin_id = p.id
ORDER BY al.created_at DESC
LIMIT 50;

-- Azioni di uno specifico admin
SELECT * FROM admin_audit_log
WHERE admin_id = 'USER_ID'
ORDER BY created_at DESC;
```

---

## 🔄 Prossimi Passi (Opzionali)

1. **Creare UI Admin Dashboard**
   - Pagina per visualizzare statistiche
   - Interfaccia per gestire libri
   - Visualizzazione audit log

2. **Admin API Routes**
   - Endpoint protetti per operazioni admin
   - Batch operations per libri

3. **Notifiche Admin**
   - Alert per nuove registrazioni
   - Report settimanali via email

4. **Gestione Utenti**
   - Pannello per promuovere/retrocedere utenti
   - Ban/Unban utenti

---

## 🐛 Troubleshooting

### "Property 'role' does not exist"
Rigenera i types di Supabase:
```bash
npm run types:generate
```

### L'utente non risulta admin dopo promozione
1. Fai logout e re-login nell'app
2. Oppure chiama `refreshProfile()` dallo store:
```typescript
const refreshProfile = useAppStore(state => state.refreshProfile);
await refreshProfile();
```

### RLS Policy blocca operazioni admin
Verifica che la policy sia stata creata correttamente:
```sql
SELECT * FROM pg_policies WHERE tablename = 'books';
```

---

## 📚 File Creati/Modificati

### Nuovi File
- `supabase/migrations/20251107000000_add_admin_roles.sql`
- `src/infrastructure/auth/AdminGuard.ts`
- `src/presentation/hooks/useAdmin.ts`
- `docs/ADMIN_SYSTEM.md` (questo file)

### File Modificati
- `src/domain/entities/UserProfile.ts` - Aggiunto UserRole
- `src/data/supabase/types.generated.ts` - Aggiunto role a profiles
- `src/infrastructure/store/store.ts` - Aggiunto isAdmin field
- `src/infrastructure/auth/index.ts` - Export AdminGuard

---

Hai domande o serve aiuto per l'implementazione? Fammi sapere!
