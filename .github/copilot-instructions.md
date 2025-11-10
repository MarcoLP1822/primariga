# Primariga - AI Coding Agent Instructions

## Project Overview
**Primariga** is a multi-platform (iOS/Android/Web) React Native app using Expo that lets users discover books by reading only the first line. Built with Clean Architecture, TypeScript strict mode, and enterprise-grade security.

## Architecture

### Clean Architecture Layers
```
src/
├── domain/          # Business logic (use-cases, entities, validators)
├── data/           # Data sources (repositories, Supabase client)
├── infrastructure/ # External services (auth, analytics, monitoring)
└── presentation/   # UI (components, hooks, screens)
```

**Critical Rule**: Dependencies flow inward only. Domain never imports from data/infrastructure/presentation.

### File-Based Routing (Expo Router)
```
app/
├── _layout.tsx           # Root layout with providers
├── (auth)/              # Auth group (login, signup, forgot-password)
├── (tabs)/              # Main app tabs (index, favorites, profile)
└── book/[id].tsx        # Dynamic route for book details
```
Navigation uses `expo-router` file-based routing. Use `useRouter()` for navigation, not React Navigation directly.

## Core Patterns

### Result Pattern (Error Handling)
**Always** use Result pattern for operations that can fail. Never throw errors in business logic.

```typescript
import { Result, success, failure, tryCatch } from '@/core/errors';

// Sync operations
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) return failure(new Error('Division by zero'));
  return success(a / b);
}

// Async operations
async function fetchBook(id: string): Promise<Result<Book, AppError>> {
  return tryCatch(async () => {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
    if (error) throw new DatabaseError(error.message);
    if (!data) throw new NotFoundError('Book', id);
    return data;
  });
}
```

See `src/core/errors/` for custom error types hierarchy.

### Optional Authentication Pattern
**Critical**: App supports anonymous browsing. Auth is only required for:
- Saving likes/favorites
- Editing user profile
- Viewing reading history

Check auth before protected actions:
```typescript
const requiresAuth = useAppStore((state) => state.requiresAuth);

const handleLike = () => {
  if (requiresAuth()) {
    setShowAuthPrompt(true); // Show auth modal, don't block
    return;
  }
  // Proceed with action
};
```

Never redirect to login automatically. See `docs/OPTIONAL_AUTH_IMPLEMENTATION.md` for details.

### Validation with Zod
All domain entities have Zod schemas in `src/domain/validators/`. Always validate external data:

```typescript
import { BookSchema } from '@/domain/validators/BookValidator';

const result = BookSchema.safeParse(data);
if (!result.success) {
  return failure(new ValidationError('Invalid book data', result.error.flatten().fieldErrors));
}
```

### State Management
- **Zustand** for global state (`src/infrastructure/store/store.ts`)
- **React Query** for server state (`@tanstack/react-query`)
- Query keys centralized in `src/infrastructure/config/queryClient.ts`

```typescript
// Always use centralized query keys
import { queryKeys } from '@/infrastructure/config/queryClient';

const { data } = useQuery({
  queryKey: queryKeys.books.byId(bookId),
  queryFn: () => fetchBook(bookId),
});
```

## Development Workflow

### Commands
```bash
npm start              # Start Expo dev server
npm test              # Run Jest tests
npm run test:coverage # Coverage report
npm run lint:fix      # Auto-fix linting issues
npm run types:generate # Generate Supabase types from DB schema
```

### Testing Strategy
- **74 tests, 60%+ coverage target**
- Unit tests in `__tests__/unit/` (isolated, mocked dependencies)
- Integration tests in `__tests__/integration/` (real Supabase)
- Test file pattern: `ComponentName.test.tsx` or `functionName.test.ts`

When writing tests:
1. Mock external dependencies (Supabase, analytics)
2. Use React Native Testing Library for components
3. Test Result pattern both success and failure paths

See `docs/TESTING.md` for comprehensive guide.

### Database Migrations
Supabase migrations in `supabase/migrations/`. Key migrations:
- `20251105000000_initial_schema.sql` - Core tables
- `20251106120000_auto_create_profile.sql` - Auto-create user profile on signup
- `20251107000000_add_admin_roles.sql` - Admin system

Generate TypeScript types after schema changes: `npm run types:generate`

## Critical Integrations

### Supabase Client
Configured in `src/data/supabaseClient.ts` with AsyncStorage for session persistence. All types auto-generated in `src/data/supabase/types.generated.ts`.

### Analytics (PostHog)
20+ events tracked. Use centralized analytics service:
```typescript
import { analytics, AnalyticsEvent } from '@/infrastructure/analytics';

analytics.track(AnalyticsEvent.BookCardViewed, {
  book_id: book.id,
  title: book.title,
});
```

### Error Monitoring (Sentry)
Initialized in `app/_layout.tsx`. Errors automatically captured via Error Boundaries.

## Common Gotchas

1. **Import Paths**: Use TypeScript path aliases (`@/core`, `@/domain`, etc.) not relative paths
2. **Supabase RLS**: Profiles table allows anonymous reads for public discovery. See `supabase/migrations/` for policies
3. **Environment Variables**: Prefix with `EXPO_PUBLIC_` for client-side access
4. **Metro Bundler**: Restart with `npm start --clear` if changes aren't reflected
5. **Session Timeout**: Auto-logout after 30 minutes inactivity (see `src/infrastructure/auth/SessionManager.ts`)

## Security Checklist

- ✅ Strong password policy (8+ chars, mixed case, numbers, symbols)
- ✅ Rate limiting on auth endpoints (5 attempts, 5 min lockout)
- ✅ Error sanitization (no user enumeration)
- ✅ RLS policies on all Supabase tables
- ✅ Input validation with Zod schemas

See `docs/SECURITY.md` for full security guidelines.

## Documentation Reference

- `docs/ERROR_HANDLING.md` - Result pattern and custom errors
- `docs/OPTIONAL_AUTH_IMPLEMENTATION.md` - Anonymous browsing pattern
- `docs/SUPABASE_AUTH_IMPLEMENTATION.md` - Auth architecture
- `docs/TESTING.md` - Testing strategy and examples
- `docs/POSTHOG_IMPLEMENTATION_SUMMARY.md` - Analytics events
- `QUICKSTART.md` - Setup guide for new developers
