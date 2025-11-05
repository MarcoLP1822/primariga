# 🛡️ Input Validation con Zod

## Panoramica

Il progetto utilizza [Zod](https://zod.dev/) per la validazione runtime dei dati. Tutti i validators sono centralizzati in `src/domain/validators/`.

## Validators Disponibili

- `BookValidator` - Validazione libri
- `BookLineValidator` - Validazione prime righe
- `UserInteractionValidator` - Validazione interazioni utente
- `UserProfileValidator` - Validazione profili utente
- `ReadingHistoryValidator` - Validazione storico letture

## Utilizzo Base

### Validazione Strict (throw su errore)

```typescript
import { validateBook, validateCreateBook } from '@/domain/validators';

try {
  const book = validateBook(data);
  // book è tipizzato e validato ✅
} catch (error) {
  // Errore di validazione
  console.error('Validation failed:', error);
}
```

### Validazione Safe (return result)

```typescript
import { safeValidateBook } from '@/domain/validators';

const result = safeValidateBook(data);

if (result.success) {
  // Data valida
  console.log('Book:', result.data);
} else {
  // Errore di validazione
  console.error('Errors:', result.error.issues);
}
```

## Esempi Pratici

### 1. Validazione Form Input

```typescript
import { CreateBookSchema } from '@/domain/validators';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function BookForm() {
  const form = useForm({
    resolver: zodResolver(CreateBookSchema),
  });

  const onSubmit = (data) => {
    // data è già validato! ✅
    saveBook(data);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

### 2. Validazione API Response

```typescript
import { validateBook } from '@/domain/validators';

async function fetchBook(id: string) {
  const response = await fetch(`/api/books/${id}`);
  const data = await response.json();

  // Valida i dati ricevuti dall'API
  return validateBook(data);
}
```

### 3. Validazione in Repository

```typescript
import { safeValidateBook } from '@/domain/validators';

class BookRepository {
  async getBook(id: string): Promise<Book | null> {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();

    if (error) return null;

    // Validazione safe
    const result = safeValidateBook(data);
    return result.success ? result.data : null;
  }
}
```

### 4. Validazione User Input

```typescript
import { InteractionTypeEnum, validateCreateUserInteraction } from '@/domain/validators';

function handleLike(userId: string, bookId: string) {
  const interaction = validateCreateUserInteraction({
    userId,
    bookId,
    interactionType: 'like',
    metadata: { source: 'mobile' },
  });

  // interaction è validato e type-safe ✅
  await saveInteraction(interaction);
}
```

## Regole di Validazione

### Book

- **title**: 1-500 caratteri, obbligatorio
- **author**: 1-200 caratteri, obbligatorio
- **isbn**: Formato ISBN valido (opzionale)
- **publicationYear**: 1000 - anno corrente+1
- **language**: Codice ISO 2 caratteri (es. "it", "en")
- **genres**: Array di stringhe
- **URLs**: Devono essere URL validi

### UserProfile

- **username**: 3-30 caratteri, solo alfanumerici e underscore
- **email**: Email valida
- **bio**: Max 500 caratteri
- **preferredLanguages**: Array di codici lingua ISO 2 caratteri

### UserInteraction

- **interactionType**: Deve essere uno di:
  - `like` - L'utente ha messo like
  - `dislike` - L'utente ha messo dislike
  - `skip` - L'utente ha saltato
  - `purchase` - L'utente ha acquistato
  - `share` - L'utente ha condiviso
- **metadata**: Oggetto JSON generico (opzionale)

## Gestione Errori

### Struttura Errore Zod

```typescript
import { ZodError } from 'zod';

try {
  validateBook(data);
} catch (error) {
  if (error instanceof ZodError) {
    // Accedi agli errori specifici
    error.issues.forEach((issue) => {
      console.log(`Campo: ${issue.path.join('.')}`);
      console.log(`Errore: ${issue.message}`);
    });

    // Formatta per UI
    const errors = error.flatten();
    console.log(errors.fieldErrors);
  }
}
```

### Custom Error Messages

I validators hanno già messaggi in italiano. Esempio:

```typescript
title: z.string().min(1, 'Titolo obbligatorio').max(500, 'Titolo troppo lungo');
```

## Best Practices

### ✅ DO

- **Valida sempre input utente** prima di salvare
- **Usa safeValidate** in contesti dove errori sono previsti
- **Valida response API** per garantire type safety
- **Combina con React Hook Form** per validazione form
- **Usa type inference** di Zod per type safety

```typescript
// Type inference automatico ✅
const result = safeValidateBook(data);
if (result.success) {
  result.data; // Type: BookInput
}
```

### ❌ DON'T

- **Non ignorare errori** di validazione
- **Non validare dati già validati** (performance)
- **Non modificare validators** senza aggiornare test
- **Non usare any** - Zod fornisce types completi

## Testing

Ogni validator ha test completi in `__tests__/unit/domain/validators/`:

```bash
# Run validator tests
npm test -- validators

# Watch mode
npm test -- --watch validators
```

## Performance

Zod è molto performante, ma considera:

- **Cache schema** parsati se riutilizzati molte volte
- **Usa .partial()** per update parziali invece di rivalidare tutto
- **Valida una volta** nei boundary layer (API, Forms)

## Estensione

Per aggiungere un nuovo validator:

1. Crea `src/domain/validators/NewValidator.ts`
2. Definisci schema con Zod
3. Crea helper functions (validate, safeValidate)
4. Scrivi test in `__tests__/unit/domain/validators/`
5. Esporta da `src/domain/validators/index.ts`

## Risorse

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
