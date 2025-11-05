# 🛡️ Error Handling Guide

## Panoramica

Il progetto implementa un sistema completo di error handling con:

- **Result Pattern** per gestione funzionale errori
- **Custom Error Types** gerarchici
- **Error Boundaries** React per UI resiliente
- **Structured Logging** per debugging

## Architettura Errori

```
src/core/errors/
├── Result.ts           # Result<T, E> pattern (Rust-inspired)
├── AppError.ts         # Gerarchia custom errors
├── ErrorHandler.ts     # Utilities per gestione errori
└── index.ts           # Barrel export

src/presentation/components/
├── ErrorBoundary.tsx        # Global error boundary
└── RouteErrorBoundary.tsx   # Per singole route
```

## Result Pattern

### Utilizzo Base

```typescript
import { success, failure, Result } from '@/core/errors';

function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return failure(new Error('Division by zero'));
  }
  return success(a / b);
}

// Uso
const result = divide(10, 2);
if (result.isSuccess()) {
  console.log('Result:', result.value); // 5
} else {
  console.error('Error:', result.error);
}
```

### Con Async Operations

```typescript
import { tryCatch } from '@/core/errors';

async function fetchBook(id: string): Promise<Result<Book, AppError>> {
  return tryCatch(async () => {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();

    if (error) throw new DatabaseError(error.message);
    if (!data) throw new NotFoundError('Book', id);

    return data;
  });
}

// Uso
const result = await fetchBook('123');
if (result.isSuccess()) {
  // result.value è type-safe!
  displayBook(result.value);
} else {
  showError(result.error);
}
```

### Chaining Operations

```typescript
const result = success(5)
  .map((n) => n * 2) // 10
  .flatMap((n) => divide(n, 2)) // 5
  .map((n) => n + 1); // 6

console.log(result.value); // 6
```

### Combine Multiple Results

```typescript
import { combine } from '@/core/errors';

const results = await Promise.all([fetchBook('1'), fetchBook('2'), fetchBook('3')]);

const combined = combine(results);
if (combined.isSuccess()) {
  const [book1, book2, book3] = combined.value;
  // Tutti i libri caricati con successo
}
```

## Custom Error Types

### Gerarchia Errori

```
AppError (abstract)
├── ValidationError (400)
├── NotFoundError (404)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── DatabaseError (500)
├── NetworkError (503)
├── BusinessLogicError (422)
├── RateLimitError (429)
├── ConfigurationError (500)
└── ExternalServiceError (502)
```

### Esempi di Utilizzo

```typescript
import { ValidationError, NotFoundError, DatabaseError } from '@/core/errors';

// Validation Error
throw new ValidationError('Dati non validi', {
  email: ['Email non valida'],
  password: ['Password troppo corta'],
});

// Not Found Error
throw new NotFoundError('Book', '123');

// Database Error
const dbError = new Error('Connection timeout');
throw new DatabaseError('Query failed', dbError);

// Network Error
throw new NetworkError('Failed to fetch', 'https://api.example.com');
```

### Type Guards

```typescript
import { isAppError, isValidationError, isNotFoundError } from '@/core/errors';

try {
  await someOperation();
} catch (error) {
  if (isValidationError(error)) {
    // error è type-safe come ValidationError
    displayFieldErrors(error.fields);
  } else if (isNotFoundError(error)) {
    // error è NotFoundError
    redirectToHome();
  } else if (isAppError(error)) {
    // Generic AppError
    showError(error.message);
  }
}
```

## Error Boundaries

### Global Error Boundary

```typescript
import { ErrorBoundary } from '@/presentation/components';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to monitoring service
        logToSentry(error, errorInfo);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Route-Specific Error Boundary

```typescript
import { RouteErrorBoundary } from '@/presentation/components';

function BookScreen() {
  return (
    <RouteErrorBoundary>
      <BookContent />
    </RouteErrorBoundary>
  );
}
```

### Custom Fallback UI

```typescript
<ErrorBoundary
  fallback={(error, reset) => (
    <View>
      <Text>Oops! {error.message}</Text>
      <Button onPress={reset}>Riprova</Button>
    </View>
  )}
>
  <MyComponent />
</ErrorBoundary>
```

## React Hooks

### useAsyncError Hook

```typescript
import { useAsyncError } from '@/presentation/hooks/useAsyncError';

function BookDetail({ bookId }: Props) {
  const { execute, data, error, isLoading } = useAsyncError<Book>();

  const loadBook = async () => {
    await execute(async () => {
      const book = await fetchBook(bookId);
      return book;
    });
  };

  useEffect(() => {
    loadBook();
  }, [bookId]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={loadBook} />;
  if (!data) return null;

  return <BookView book={data} />;
}
```

## Repository Pattern

### Con Result Pattern

```typescript
class BookRepository implements IBookRepository {
  async getBook(id: string): Promise<Result<Book, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase.from('books').select('*').eq('id', id).single();

      if (error) {
        throw new DatabaseError('Failed to fetch book', error);
      }

      if (!data) {
        throw new NotFoundError('Book', id);
      }

      return data;
    });
  }
}
```

### Use Case con Result

```typescript
class GetBookUseCase {
  constructor(private bookRepo: IBookRepository) {}

  async execute(bookId: string): Promise<Result<Book, AppError>> {
    const result = await this.bookRepo.getBook(bookId);

    if (result.isFailure()) {
      logError(result.error, { useCase: 'GetBook', bookId });
      return result;
    }

    return result;
  }
}
```

## Best Practices

### ✅ DO

- **Use Result pattern** per operazioni che possono fallire
- **Throw AppError** nei boundary layer (API, Repository)
- **Normalize errors** sempre con `normalizeError()`
- **Log errors** con context appropriato
- **Use type guards** per type-safe error handling
- **Provide user-friendly messages** con `getUserMessage()`

### ❌ DON'T

- **Don't throw strings** - usa sempre Error objects
- **Don't swallow errors** - logga sempre
- **Don't expose stack traces** in production
- **Don't use generic Error** - usa AppError hierarchy
- **Don't log sensitive data** in error metadata

## Error Logging

```typescript
import { logError, normalizeError } from '@/core/errors';

try {
  await riskyOperation();
} catch (error) {
  const appError = normalizeError(error);
  logError(appError, {
    userId: currentUser.id,
    action: 'riskyOperation',
    timestamp: Date.now(),
  });
}
```

## Testing

```typescript
import { success, failure, ValidationError } from '@/core/errors';

describe('MyService', () => {
  it('should return success result', async () => {
    const result = await service.doSomething();
    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(expectedValue);
  });

  it('should return validation error', async () => {
    const result = await service.validateInput(invalidData);
    expect(result.isFailure()).toBe(true);
    expect(result.error).toBeInstanceOf(ValidationError);
  });
});
```

## Integrazione con Sentry

```typescript
// Verrà implementato nel prossimo task
import * as Sentry from '@sentry/react-native';

function logError(error: AppError, context?: Record<string, any>) {
  if (shouldReportError(error)) {
    Sentry.captureException(error, {
      tags: {
        errorCode: error.code,
        statusCode: error.statusCode,
      },
      contexts: {
        app: context,
      },
    });
  }
}
```

## Risorse

- [Result Pattern in TypeScript](https://imhoff.blog/posts/using-results-in-typescript)
- [Error Handling Best Practices](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
