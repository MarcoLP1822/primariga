# Security Hardening Guide

This document outlines the security measures implemented in Primariga to protect user data and prevent common security vulnerabilities.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Input Sanitization](#input-sanitization)
3. [Authentication & Authorization](#authentication--authorization)
4. [Rate Limiting](#rate-limiting)
5. [File Upload Security](#file-upload-security)
6. [XSS Prevention](#xss-prevention)
7. [SQL Injection Prevention](#sql-injection-prevention)
8. [Dependency Security](#dependency-security)
9. [Security Checklist](#security-checklist)
10. [Incident Response](#incident-response)

---

## Environment Variables

### Protection

✅ `.env` file is in `.gitignore` - secrets never committed to git

```gitignore
# .gitignore
.env
```

### Configuration

Use `.env.example` as template:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Sentry Configuration
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Best Practices

1. **Never commit** `.env` to version control
2. **Use `EXPO_PUBLIC_`** prefix only for client-safe variables
3. **Service role keys** should NEVER be exposed to client
4. **Rotate keys** regularly (quarterly minimum)
5. **Use different keys** for dev/staging/production

### Expo Secrets Management

For CI/CD and EAS builds:

```bash
# Set secrets in EAS
eas secret:create --scope project --name SUPABASE_URL --value "https://..."
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "eyJ..."
eas secret:create --scope project --name SENTRY_DSN --value "https://..."
```

---

## Input Sanitization

### Sanitize User Input

Always sanitize user input to prevent XSS:

```typescript
import { sanitizeInput } from '@/infrastructure/security';

const handleSubmit = (userInput: string) => {
  const safeInput = sanitizeInput(userInput);
  // Use safeInput
};
```

### Sanitize HTML

For content with basic formatting:

```typescript
import { sanitizeHTML } from '@/infrastructure/security';

const safeHTML = sanitizeHTML(userProvidedHTML);
// Only allows: b, i, u, em, strong, p, br
```

### Sanitize Email

```typescript
import { sanitizeEmail } from '@/infrastructure/security';

const email = sanitizeEmail(userEmail);
if (!email) {
  throw new Error('Invalid email format');
}
```

### Sanitize URL

```typescript
import { sanitizeURL } from '@/infrastructure/security';

const url = sanitizeURL(userProvidedURL);
if (!url) {
  throw new Error('Invalid or unsafe URL');
}
// Only allows http: and https: protocols
```

### Security Functions

All sanitization functions are in `src/infrastructure/security/security.ts`:

- `sanitizeInput(input)` - Remove all HTML tags and JS
- `sanitizeHTML(html)` - Allow only safe HTML tags
- `sanitizeEmail(email)` - Validate and normalize email
- `sanitizeURL(url)` - Validate and allow only http/https
- `escapeSQLLike(input)` - Escape special SQL LIKE characters

---

## Authentication & Authorization

### Supabase Auth

Primariga uses Supabase Auth for authentication:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: sanitizeEmail(email),
  password,
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: sanitizeEmail(email),
  password,
});

// Sign out
await supabase.auth.signOut();
```

### Row Level Security (RLS)

All Supabase tables use RLS policies:

```sql
-- User can only access their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- User can only update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### Password Requirements

Enforce strong passwords:

```typescript
import { validatePasswordStrength } from '@/infrastructure/security';

const { valid, score, feedback } = validatePasswordStrength(password);

if (!valid) {
  // Show feedback to user
  console.log(feedback);
  // e.g., ["Include at least one uppercase letter", "Include at least one number"]
}
```

Password requirements:
- Minimum 8 characters (12+ recommended)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common patterns (password, 123456, etc.)

### Token Management

Supabase handles token refresh automatically:

```typescript
// Tokens are automatically refreshed
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});
```

---

## Rate Limiting

### Client-Side Rate Limiting

Implement rate limiting for API calls:

```typescript
import { rateLimiter } from '@/infrastructure/security';

async function makeAPICall(userId: string) {
  // Allow 10 requests per minute
  const allowed = rateLimiter.check(userId, 10, 60 * 1000);

  if (!allowed) {
    throw new Error('Rate limit exceeded. Please wait.');
  }

  // Make API call
}
```

### Configuration

Default rate limits:
- **API calls**: 100 requests/minute per user
- **Auth attempts**: 5 attempts/5 minutes per IP
- **File uploads**: 10 uploads/hour per user

### Server-Side Rate Limiting

Supabase implements server-side rate limiting:
- Configured in Supabase Dashboard > Settings > Rate Limits
- Default: 1000 requests/hour per IP

---

## File Upload Security

### Validate File Uploads

```typescript
import { validateFileUpload } from '@/infrastructure/security';

const file = {
  name: 'image.jpg',
  size: 1024 * 1024, // 1MB
  type: 'image/jpeg',
};

const { valid, error } = validateFileUpload(file);

if (!valid) {
  throw new Error(error);
}
```

### File Upload Rules

- **Max size**: 10MB
- **Allowed types**: JPEG, PNG, WebP, GIF
- **Allowed extensions**: .jpg, .jpeg, .png, .webp, .gif
- **Validation**: Both MIME type and extension checked

### Supabase Storage Security

Configure bucket policies:

```sql
-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'covers');

-- Users can only access public files
CREATE POLICY "Anyone can view covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');
```

---

## XSS Prevention

### React Native Protection

React Native automatically escapes text content:

```tsx
// Safe - React Native escapes by default
<Text>{userInput}</Text>
```

### Dangerous Patterns to Avoid

```tsx
// ❌ NEVER DO THIS
<WebView source={{ html: userProvidedHTML }} />

// ✅ DO THIS
import { sanitizeHTML } from '@/infrastructure/security';
<WebView source={{ html: sanitizeHTML(userProvidedHTML) }} />
```

### Content Security Policy

For WebView components:

```typescript
<WebView
  source={{ uri: url }}
  injectedJavaScriptBeforeContentLoaded={`
    // Disable eval
    window.eval = undefined;
    
    // Disable inline scripts
    document.addEventListener('DOMContentLoaded', () => {
      const scripts = document.querySelectorAll('script');
      scripts.forEach(s => {
        if (!s.src) s.remove();
      });
    });
  `}
/>
```

---

## SQL Injection Prevention

### Supabase Prepared Statements

Supabase automatically uses prepared statements:

```typescript
// ✅ Safe - Uses prepared statements
const { data } = await supabase
  .from('books')
  .select('*')
  .eq('title', userInput);

// ✅ Safe - Uses prepared statements
const { data } = await supabase
  .from('books')
  .select('*')
  .ilike('title', `%${userInput}%`);
```

### LIKE Query Safety

For SQL LIKE queries, escape special characters:

```typescript
import { escapeSQLLike } from '@/infrastructure/security';

const searchTerm = escapeSQLLike(userInput);
const { data } = await supabase
  .from('books')
  .select('*')
  .ilike('title', `%${searchTerm}%`);
```

---

## Dependency Security

### NPM Audit

✅ **Current status**: 0 vulnerabilities

Run regular security audits:

```bash
# Check for vulnerabilities
npm audit

# Auto-fix vulnerabilities
npm audit fix

# Check with JSON output
npm audit --json
```

### Dependency Updates

Keep dependencies up to date:

```bash
# Check outdated packages
npm outdated

# Update to latest versions
npm update

# Update major versions (carefully!)
npx npm-check-updates -u
npm install
```

### Automated Dependency Updates

Use Dependabot (GitHub):

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### Security-Critical Dependencies

Monitor these dependencies closely:
- `@supabase/supabase-js` - Database & Auth
- `@sentry/react-native` - Error monitoring
- `expo` - App framework
- `react-native` - Core framework

---

## Security Checklist

### Development

- [ ] `.env` file is in `.gitignore`
- [ ] All user input is sanitized before use
- [ ] Password strength validation implemented
- [ ] Rate limiting on sensitive operations
- [ ] File upload validation in place
- [ ] XSS prevention measures active
- [ ] SQL injection protection via Supabase
- [ ] Dependencies have 0 known vulnerabilities

### Supabase Configuration

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies tested and verified
- [ ] Service role key NOT exposed to client
- [ ] Anonymous key properly scoped
- [ ] Auth email verification enabled
- [ ] Password reset flow configured
- [ ] Storage bucket policies configured
- [ ] API rate limits configured

### Production Deployment

- [ ] Environment variables configured in EAS
- [ ] Sentry DSN configured for error tracking
- [ ] SSL/TLS certificates valid
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Logging sanitizes sensitive data
- [ ] Incident response plan documented
- [ ] Security contact published

### Monitoring

- [ ] Sentry monitoring active
- [ ] Failed auth attempts logged
- [ ] Unusual API patterns monitored
- [ ] File upload failures tracked
- [ ] Rate limit violations logged
- [ ] Regular security audits scheduled

---

## Incident Response

### Security Incident Plan

1. **Detection**
   - Monitor Sentry for unusual errors
   - Check Supabase logs for suspicious activity
   - Review failed auth attempts

2. **Containment**
   - Rotate compromised API keys immediately
   - Disable affected user accounts
   - Block malicious IPs via Supabase dashboard

3. **Investigation**
   - Review Sentry breadcrumbs
   - Check database audit logs
   - Identify attack vector

4. **Recovery**
   - Deploy security patch
   - Notify affected users
   - Update security measures

5. **Post-Incident**
   - Document incident details
   - Update security procedures
   - Conduct security review

### Emergency Contacts

- **Security Team**: [your-security@email.com]
- **Supabase Support**: support@supabase.io
- **Sentry Support**: support@sentry.io

### Key Rotation Procedure

When keys are compromised:

```bash
# 1. Generate new keys in Supabase Dashboard
# 2. Update .env with new keys
# 3. Update EAS secrets
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "new_key" --force

# 4. Deploy new build
eas build --platform all

# 5. Revoke old keys in Supabase Dashboard
```

---

## Sensitive Data Handling

### Masking for Logs

Never log sensitive data in plain text:

```typescript
import { maskSensitiveData } from '@/infrastructure/security';

// ❌ DON'T
console.log('API Key:', apiKey);

// ✅ DO
console.log('API Key:', maskSensitiveData(apiKey, 4));
// Output: "API Key: ******************Ab3k"
```

### Data to Mask

Always mask these in logs:
- API keys
- Passwords
- Email addresses (partially)
- Phone numbers
- Credit card numbers
- Session tokens

### Sentry Data Scrubbing

Sentry automatically scrubs sensitive data:

```typescript
// src/infrastructure/monitoring/sentry.ts
beforeSend(event, hint) {
  // Remove sensitive headers
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['cookie'];
  }
  
  // Remove sensitive URL params
  if (event.request?.url) {
    event.request.url = event.request.url
      .replace(/token=[^&]+/g, 'token=***')
      .replace(/apiKey=[^&]+/g, 'apiKey=***');
  }
  
  return event;
}
```

---

## Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [React Native Security](https://reactnative.dev/docs/security)
- [NPM Security](https://docs.npmjs.com/packages-and-modules/securing-your-code)

---

## Security Updates

Last security audit: **2025-01-05**  
Next scheduled audit: **2025-04-05**  
Current vulnerability count: **0**

For security concerns, contact: [your-security@email.com]
