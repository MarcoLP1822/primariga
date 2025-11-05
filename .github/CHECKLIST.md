# 🚀 GitHub Actions Checklist

## Pre-Push Checklist (Locale)

Prima di fare push, verifica sempre:

- [ ] `npm run lint` - Nessun errore ESLint
- [ ] `npm run type-check` - Nessun errore TypeScript
- [ ] `npm test` - Tutti i test passano
- [ ] `npm run format:check` - Codice formattato correttamente

**Quick check completo:**

```bash
npm run lint && npm run type-check && npm test && npm run format:check
```

---

## PR Checklist

Quando apri una Pull Request:

- [ ] Titolo PR segue convention: `feat:`, `fix:`, `chore:`, `docs:`
- [ ] Descrizione PR spiega le modifiche
- [ ] Tutti i CI checks sono verdi ✅
- [ ] Coverage non è diminuita (se possibile, aumentata)
- [ ] Test aggiunti per nuove feature
- [ ] Documentazione aggiornata se necessario
- [ ] Nessun console.log/debugger lasciato nel codice
- [ ] Breaking changes documentati

---

## Release Checklist

Prima di fare una release production:

- [ ] Tutti i test passano su `develop`
- [ ] Changelog aggiornato
- [ ] Version bump eseguito (`npm version patch|minor|major`)
- [ ] Tag creato e pushato
- [ ] Release notes preparate
- [ ] EAS build testato su preview
- [ ] Database migrations applicate (se presenti)
- [ ] Secrets/ENV vars configurati per production

---

## CI/CD Setup Checklist

Setup iniziale repository:

### GitHub Repository Settings

- [ ] Branch protection su `main` abilitata
- [ ] Required checks configurati (lint, typecheck, test, build)
- [ ] Workflow permissions: Read and write
- [ ] Actions abilitato

### Secrets Configuration

- [ ] `SUPABASE_URL` configurato (opzionale per ora)
- [ ] `SUPABASE_ANON_KEY` configurato (opzionale per ora)
- [ ] `EXPO_TOKEN` per EAS builds (futuro)
- [ ] `CODECOV_TOKEN` per coverage (futuro)

### Workflow Files

- [ ] `.github/workflows/ci.yml` presente
- [ ] `.github/workflows/pr-checks.yml` presente
- [ ] `.github/workflows/deploy-preview.yml` presente
- [ ] `.github/workflows/release.yml` presente

---

## Troubleshooting Checklist

### CI Checks Failed ❌

- [ ] Controlla tab "Checks" su GitHub PR
- [ ] Leggi i logs del job fallito
- [ ] Riproduci l'errore localmente
- [ ] Fix + commit + push → checks ripartono

### Tests Failed

- [ ] `npm test` localmente per riprodurre
- [ ] Controlla mock configurazioni in `jest.setup.js`
- [ ] Verifica import paths (usa relative, non `@/`)
- [ ] Controlla che tutti i mock siano aggiornati

### Lint Failed

- [ ] `npm run lint` per vedere errori
- [ ] `npm run lint:fix` per auto-fix
- [ ] Verifica `.eslintrc.js` rules
- [ ] Controlla che file non siano in `.eslintignore`

### Type Check Failed

- [ ] `npm run type-check` localmente
- [ ] Verifica import types: `import type { ... }`
- [ ] Controlla `tsconfig.json` strict mode
- [ ] Verifica Supabase types siano aggiornati

### Build Failed

- [ ] `npm run type-check` per compilazione
- [ ] Verifica tutte le dependencies in `package.json`
- [ ] Controlla che `node_modules` sia pulito
- [ ] Prova `rm -rf node_modules && npm install`

---

## Coverage Improvement Checklist

Per aumentare il coverage:

- [ ] Identifica file con bassa coverage: `npm run test:coverage`
- [ ] Scrivi test per funzioni non coperte
- [ ] Testa branch condizionali (if/else)
- [ ] Testa error paths (try/catch)
- [ ] Testa edge cases
- [ ] Testa component user interactions
- [ ] Mock external dependencies

**Priorità testing:**

1. Domain logic (use-cases, entities) - 80%+
2. Data layer (repositories) - 70%+
3. Validation (validators) - 90%+
4. Components (presentation) - 60%+

---

## Security Audit Checklist

- [ ] `npm audit` - nessuna vulnerabilità critica
- [ ] `.env` in `.gitignore`
- [ ] Nessun secret hardcoded nel codice
- [ ] Dependencies aggiornate (`npm outdated`)
- [ ] Supabase RLS policies attive
- [ ] Input validation con Zod ovunque
- [ ] Error messages non espongono dettagli interni

---

## Performance Checklist

- [ ] Bundle size monitorato
- [ ] Immagini ottimizzate (uso `expo-image`)
- [ ] Lazy loading per routes pesanti
- [ ] React Query caching configurato
- [ ] Infinite scroll implementato (non caricare tutto insieme)
- [ ] Memoization per componenti pesanti (`React.memo`)
- [ ] Evitare re-render inutili

---

## Code Review Checklist (Reviewer)

### Codice

- [ ] Logica chiara e comprensibile
- [ ] Naming conventions rispettate
- [ ] Nessuna duplicazione di codice
- [ ] Error handling adeguato
- [ ] Type safety garantito

### Test

- [ ] Test significativi, non triviali
- [ ] Coverage aumentato (non diminuito)
- [ ] Test testano comportamento, non implementazione

### Documentazione

- [ ] Commenti JSDoc per funzioni pubbliche
- [ ] README aggiornato se necessario
- [ ] CHANGELOG aggiornato

### Performance

- [ ] Nessun bottleneck evidente
- [ ] Query ottimizzate
- [ ] Caching appropriato

### Security

- [ ] Input validato
- [ ] Nessun secret esposto
- [ ] Error messages safe

---

**Tip:** Copia queste checklist in ogni PR come commento per tracciare il progresso! 📋
