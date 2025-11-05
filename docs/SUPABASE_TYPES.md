# Supabase Type Generation

Questo script genera automaticamente i types TypeScript dal database Supabase.

## Prerequisiti

Installa Supabase CLI globalmente:

```bash
npm install -g supabase
```

## Generazione Types

### Opzione 1: Usando Project Reference (Consigliato)

```bash
# Usa il project ID dal tuo progetto Supabase
npx supabase gen types typescript --project-id your-project-id > src/data/supabase/types.generated.ts
```

### Opzione 2: Usando Database URL diretta

```bash
# Genera types dalla connessione diretta al database
npx supabase gen types typescript --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" > src/data/supabase/types.generated.ts
```

### Opzione 3: Usando Supabase Local Development

```bash
# Se usi Supabase localmente
npx supabase gen types typescript --local > src/data/supabase/types.generated.ts
```

## Script NPM

Aggiungi al `package.json`:

```json
{
  "scripts": {
    "types:generate": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/data/supabase/types.generated.ts",
    "types:watch": "nodemon --watch supabase/migrations --exec npm run types:generate"
  }
}
```

## Configurazione

1. Crea file `.env.local` con le credenziali:

```env
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_DB_PASSWORD=your-db-password
```

2. Aggiungi al `.gitignore`:

```
.env.local
src/data/supabase/types.generated.ts
```

## Utilizzo

Dopo aver generato i types, importali nel client Supabase:

```typescript
import { Database } from './supabase/types.generated';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// Ora hai autocompletion e type safety completo!
const { data, error } = await supabase
  .from('books') // ✅ Autocomplete!
  .select('*'); // ✅ Type-safe!
```

## Rigenera Types Dopo Migrations

Ogni volta che crei una nuova migration:

```bash
npm run types:generate
```

## Automazione CI/CD

Nel workflow GitHub Actions, aggiungi:

```yaml
- name: Generate Supabase Types
  run: npm run types:generate
  env:
    SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

## Troubleshooting

### "Cannot find project"

- Verifica che il Project ID sia corretto
- Esegui `supabase login` se richiesto

### "Permission denied"

- Verifica le credenziali del database
- Controlla che il firewall permetta la connessione

### "Module not found"

- Assicurati che `src/data/supabase/` esista
- Verifica che il path nel comando sia corretto
