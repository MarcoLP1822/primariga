# CI/CD Pipeline Configuration

## 📋 Overview

Primariga utilizza **GitHub Actions** per automatizzare quality checks, testing e deployment.

## 🔄 Workflows Disponibili

### 1. CI - Quality Checks (`.github/workflows/ci.yml`)

**Trigger:** Push su `main`/`develop`, Pull Requests

**Jobs:**

- **🔍 Lint Code**: ESLint + Prettier format check
- **🔷 Type Check**: TypeScript compilation (`tsc --noEmit`)
- **🧪 Run Tests**: Jest con coverage (target 60%)
- **🏗️ Build Check**: Verifica che il progetto compili correttamente
- **🔒 Security Audit**: `npm audit` per vulnerabilità dipendenze
- **✅ All Checks**: Quality gate finale (tutti i job devono passare)

**Quality Gate:** Tutti i job devono passare per merge.

### 2. PR - Quality Gate (`.github/workflows/pr-checks.yml`)

**Trigger:** Apertura/aggiornamento Pull Request

**Features:**

- Analisi completa PR con diff detection
- Test coverage report
- Commento automatico con risultati su PR
- Quality gate per approvazione PR

**Permissions:**

- `contents: read` - Lettura codice
- `pull-requests: write` - Commenti su PR
- `checks: write` - Stato checks

### 3. Deploy - Preview (`.github/workflows/deploy-preview.yml`)

**Trigger:** PR verso `main`

**Features:**

- Build preview per testing pre-produzione
- Commento automatico con istruzioni testing
- Comandi EAS build per Android/iOS preview

**Output:** Istruzioni per creare preview build con EAS.

### 4. Release - Production (`.github/workflows/release.yml`)

**Trigger:**

- Push su `main` (versioning)
- Tags `v*` (deploy production)

**Jobs:**

- **📦 Version Bump**: Gestione versioning automatico
- **🚀 Deploy Production**: Build e preparazione release
- **📢 Notify**: Creazione GitHub Release con note

**Production Deploy:** Solo su tag `v*.*.*`.

## 🚀 Setup Iniziale

### 1. Repository Setup

```bash
# Assicurati di essere su una branch
git checkout -b setup/ci-cd

# Aggiungi i workflow
git add .github/workflows/

# Commit e push
git commit -m "chore: setup CI/CD pipeline with GitHub Actions"
git push origin setup/ci-cd
```

### 2. GitHub Repository Settings

#### Secrets Necessari (per future integrazioni)

Vai su **Settings → Secrets and variables → Actions**:

- `SUPABASE_URL` - URL del progetto Supabase
- `SUPABASE_ANON_KEY` - Anon key pubblica
- `EXPO_TOKEN` - Token per EAS builds (opzionale, per automation)
- `CODECOV_TOKEN` - Token Codecov (opzionale, per coverage)

#### Branch Protection Rules

Vai su **Settings → Branches → Add rule**:

**Per `main`:**

- ✅ Require pull request before merging
- ✅ Require status checks to pass before merging
  - `lint` ✅
  - `typecheck` ✅
  - `test` ✅
  - `build` ✅
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

**Per `develop`:**

- ✅ Require pull request before merging
- ✅ Require status checks to pass

### 3. Workflow Permissions

Vai su **Settings → Actions → General → Workflow permissions**:

- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

## 📊 npm Scripts Utilizzati

```json
{
  "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
  "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
  "type-check": "tsc --noEmit",
  "test": "jest",
  "test:coverage": "jest --coverage",
  "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
  "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\""
}
```

## 🔄 Workflow di Sviluppo

### Feature Development

```bash
# 1. Crea feature branch da develop
git checkout -b feature/my-feature develop

# 2. Sviluppa e testa localmente
npm test
npm run lint
npm run type-check

# 3. Commit e push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 4. Apri PR verso develop
# → CI checks si avviano automaticamente
# → Review + merge quando checks passano
```

### Release Process

```bash
# 1. PR da develop a main
git checkout main
git merge develop

# 2. Bump version
npm version patch|minor|major

# 3. Tag release
git tag v1.0.0
git push origin main --tags

# 4. Production workflow si avvia
# → Release notes automatiche
# → Istruzioni EAS build
```

## 🛡️ Quality Gates

### Mandatory Checks

Ogni PR deve passare:

- ✅ **Lint**: Codice formattato correttamente
- ✅ **Type Check**: Nessun errore TypeScript
- ✅ **Tests**: Tutti i test passano
- ✅ **Coverage**: Coverage > soglie minime (60% target)
- ✅ **Build**: Progetto compila senza errori

### Optional Checks

- ⚠️ **Security Audit**: Vulnerabilità dipendenze (warning, non blocca)

## 📈 Coverage Reports

### Locale

```bash
npm run test:coverage
# Apri: coverage/lcov-report/index.html
```

### CI

Il coverage è caricato automaticamente su **Codecov** (se configurato).

Badge da aggiungere a `README.md`:

```markdown
[![codecov](https://codecov.io/gh/username/primariga/branch/main/graph/badge.svg)](https://codecov.io/gh/username/primariga)
```

## 🚨 Troubleshooting

### "Checks failed" su PR

1. Vai alla tab **Checks** della PR
2. Clicca sul job fallito per vedere logs
3. Risolvi localmente:
   ```bash
   npm run lint:fix
   npm run type-check
   npm test
   ```
4. Commit + push fix → checks ripartono automaticamente

### "npm audit" warnings

```bash
# Rivedi vulnerabilità
npm audit

# Fix automatico (se disponibile)
npm audit fix

# Fix anche breaking changes (attenzione!)
npm audit fix --force
```

### Workflow non si avvia

1. Verifica YAML syntax: https://www.yamllint.com/
2. Controlla **Actions** tab su GitHub
3. Verifica permissions in **Settings → Actions**

## 🔧 Customizzazione

### Aggiungere un check custom

Modifica `.github/workflows/ci.yml`:

```yaml
custom-check:
  name: 🔧 Custom Check
  runs-on: ubuntu-latest

  steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4

    - name: 📦 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'

    - name: 📥 Install dependencies
      run: npm ci

    - name: 🔧 Run custom check
      run: npm run my-custom-script
```

Poi aggiungi il job a `all-checks`:

```yaml
all-checks:
  needs: [lint, typecheck, test, build, security, custom-check]
```

### Modificare coverage thresholds

Modifica `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,    // da 60
    functions: 70,   // da 60
    lines: 70,       // da 60
    statements: 70   // da 60
  }
}
```

## 📚 Risorse

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Jest Coverage](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [ESLint](https://eslint.org/docs/latest/)
- [Prettier](https://prettier.io/docs/en/)

## 🎯 Prossimi Step

1. ✅ Configurare branch protection su GitHub
2. ✅ Testare workflow con una PR di esempio
3. ⏳ Integrare Codecov per coverage visualization
4. ⏳ Aggiungere EAS Build automation per preview
5. ⏳ Implementare automatic versioning (semantic-release)

---

**Status:** ✅ Pipeline configurata e pronta all'uso
**Ultima modifica:** 2025-01-28
