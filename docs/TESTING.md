# Testing Guide

## 📋 Overview

Primariga utilizza una strategia di testing completa che copre tutti i layer dell'architettura Clean Architecture, garantendo code quality e prevenendo regressioni.

## 🧪 Test Stack

| Livello            | Tecnologia                      | Scopo                                |
| ------------------ | ------------------------------- | ------------------------------------ |
| Test Runner        | Jest 29+                        | Framework di test principale         |
| Component Testing  | React Native Testing Library    | Test componenti React Native         |
| E2E Testing        | Detox (future)                  | Test end-to-end automatizzati        |
| Mocking            | Jest mock functions             | Mock di dependencies                 |
| Coverage           | Jest Coverage                   | Report di copertura codice           |
| CI Integration     | GitHub Actions                  | Test automatici su ogni PR           |

---

## 🎯 Test Strategy

### Test Pyramid

```
       /\
      /  \  E2E Tests (Planned)
     /____\  
    /      \  Integration Tests
   /________\
  /          \  Unit Tests
 /____________\ 
```

**Proporzione target**:
- **70%** Unit tests (veloce, isolato)
- **20%** Integration tests (repository + database)
- **10%** E2E tests (user flows completi)

### Coverage Targets

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 60,
    functions: 60,
    lines: 60,
    statements: 60,
  },
}
```

**Status attuale**: 74 test passano, coverage ~7-8%  
**Target produzione**: >80% coverage su critical paths

---

## 📁 Test Structure

```
__tests__/
├── unit/                           # Unit tests (isolati)
│   ├── core/
│   │   └── errors/
│   │       ├── Result.test.ts
│   │       └── AppError.test.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Book.test.ts
│   │   │   ├── BookLine.test.ts
│   │   │   ├── UserProfile.test.ts
│   │   │   └── UserInteraction.test.ts
│   │   ├── use-cases/
│   │   │   ├── GetRandomBook.test.ts
│   │   │   ├── SaveUserInteraction.test.ts
│   │   │   ├── GetOrCreateUserProfile.test.ts
│   │   │   └── TrackReading.test.ts
│   │   └── validators/
│   │       ├── BookValidator.test.ts
│   │       ├── UserInteractionValidator.test.ts
│   │       ├── UserProfileValidator.test.ts
│   │       └── ReadingHistoryValidator.test.ts
│   ├── data/
│   │   └── repositories/
│   │       └── SupabaseBookRepository.test.ts (integration)
│   └── presentation/
│       ├── components/
│       │   ├── BookLineCard.test.tsx
│       │   ├── ErrorBoundary.test.tsx
│       │   └── OptimizedImage.test.tsx
│       └── hooks/
│           ├── useBooks.test.ts
│           ├── useLikes.test.ts
│           └── useAsyncError.test.ts
├── integration/                    # Integration tests
│   ├── SupabaseBookRepository.test.ts
│   ├── SupabaseUserProfileRepository.test.ts
│   └── SupabaseReadingHistoryRepository.test.ts
└── e2e/                            # E2E tests (future)
    ├── home-flow.e2e.ts
    ├── favorites-flow.e2e.ts
    └── profile-flow.e2e.ts
```

---

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- Book.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should validate book"

# Run tests in specific folder
npm test -- __tests__/unit/domain/

# Update snapshots
npm test -- -u

# Verbose output
npm test -- --verbose

# Silent mode (errors only)
npm test -- --silent
```

### Test Database

```bash
# Test Supabase connection
npm run test:db
```

---

## 📝 Writing Tests

### 1. Unit Tests - Domain Entities

```typescript
// __tests__/unit/domain/entities/Book.test.ts
import { Book } from '@/domain/entities';

describe('Book Entity', () => {
  describe('Constructor', () => {
    it('should create a valid Book instance', () => {
      const book = new Book({
        id: '123',
        title: 'Test Book',
        author: 'Test Author',
        genres: ['Fiction'],
        language: 'it',
        amazonLink: 'https://amazon.com/...',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(book.id).toBe('123');
      expect(book.title).toBe('Test Book');
      expect(book.genres).toEqual(['Fiction']);
    });

    it('should throw error for invalid data', () => {
      expect(() => {
        new Book({
          id: '',
          title: '',
          // missing required fields
        });
      }).toThrow();
    });
  });
});
```

### 2. Unit Tests - Use Cases

```typescript
// __tests__/unit/domain/use-cases/GetRandomBook.test.ts
import { GetRandomBookUseCase } from '@/domain/use-cases';
import { IBookRepository } from '@/domain/repositories';
import { Book } from '@/domain/entities';

describe('GetRandomBookUseCase', () => {
  let mockBookRepository: jest.Mocked<IBookRepository>;
  let useCase: GetRandomBookUseCase;

  beforeEach(() => {
    // Mock repository
    mockBookRepository = {
      getRandomBook: jest.fn(),
    } as any;

    useCase = new GetRandomBookUseCase(mockBookRepository);
  });

  it('should return a random book successfully', async () => {
    const mockBook = new Book({
      id: '123',
      title: 'Test Book',
      // ... other fields
    });

    mockBookRepository.getRandomBook.mockResolvedValue(
      success(mockBook)
    );

    const result = await useCase.execute();

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual(mockBook);
    expect(mockBookRepository.getRandomBook).toHaveBeenCalledTimes(1);
  });

  it('should handle repository errors', async () => {
    const error = new NotFoundError('Book', 'any');
    mockBookRepository.getRandomBook.mockResolvedValue(
      failure(error)
    );

    const result = await useCase.execute();

    expect(result.isFailure()).toBe(true);
    expect(result.error).toEqual(error);
  });
});
```

### 3. Unit Tests - Validators

```typescript
// __tests__/unit/domain/validators/BookValidator.test.ts
import { validateBook, safeValidateBook } from '@/domain/validators';

describe('BookValidator', () => {
  const validBook = {
    id: '123',
    title: 'Valid Book',
    author: 'Valid Author',
    genres: ['Fiction'],
    language: 'it',
    amazonLink: 'https://amazon.com/test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('validateBook', () => {
    it('should validate correct book data', () => {
      expect(() => validateBook(validBook)).not.toThrow();
    });

    it('should throw on invalid title', () => {
      expect(() => {
        validateBook({ ...validBook, title: '' });
      }).toThrow();
    });

    it('should throw on invalid language', () => {
      expect(() => {
        validateBook({ ...validBook, language: 'invalid' });
      }).toThrow();
    });
  });

  describe('safeValidateBook', () => {
    it('should return success for valid data', () => {
      const result = safeValidateBook(validBook);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Valid Book');
      }
    });

    it('should return error for invalid data', () => {
      const result = safeValidateBook({ ...validBook, title: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
```

### 4. Integration Tests - Repository

```typescript
// __tests__/integration/SupabaseBookRepository.test.ts
import { SupabaseBookRepository } from '@/data/repositories';
import { supabase } from '@/data/supabaseClient';

describe('SupabaseBookRepository Integration', () => {
  let repository: SupabaseBookRepository;

  beforeAll(() => {
    repository = new SupabaseBookRepository();
  });

  describe('getRandomBook', () => {
    it('should fetch a random book from database', async () => {
      const result = await repository.getRandomBook();

      if (result.isSuccess()) {
        expect(result.value).toBeDefined();
        expect(result.value.id).toBeDefined();
        expect(result.value.title).toBeDefined();
      } else {
        // Acceptable if database is empty
        expect(result.error).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe('getBookById', () => {
    it('should return NotFoundError for non-existent book', async () => {
      const result = await repository.getBookById('non-existent-id');

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(NotFoundError);
    });
  });
});
```

### 5. Component Tests

```typescript
// __tests__/unit/presentation/components/BookLineCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookLineCard } from '@/presentation/components';

describe('BookLineCard', () => {
  const mockBook = {
    id: '123',
    title: 'Test Book',
    author: 'Test Author',
    firstLine: 'This is the first line',
    amazonLink: 'https://amazon.com/test',
  };

  it('should render book information', () => {
    const { getByText } = render(
      <BookLineCard book={mockBook} />
    );

    expect(getByText('This is the first line')).toBeDefined();
  });

  it('should call onLike when like button pressed', () => {
    const onLike = jest.fn();
    const { getByTestId } = render(
      <BookLineCard book={mockBook} onLike={onLike} />
    );

    fireEvent.press(getByTestId('like-button'));
    expect(onLike).toHaveBeenCalledWith(mockBook.id);
  });

  it('should show liked state', () => {
    const { getByTestId } = render(
      <BookLineCard book={mockBook} isLiked={true} />
    );

    const likeButton = getByTestId('like-button');
    expect(likeButton.props.accessibilityLabel).toContain('Remove');
  });
});
```

### 6. Hook Tests

```typescript
// __tests__/unit/presentation/hooks/useBooks.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRandomBook } from '@/presentation/hooks/useBooks';

describe('useRandomBook', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch random book', async () => {
    const { result } = renderHook(() => useRandomBook(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

---

## 🔧 Test Configuration

### jest.config.js

```javascript
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/data/supabase/types.generated.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
  ],
};
```

### jest.setup.js

```javascript
import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    version: '1.0.0',
  },
}));

jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
```

---

## 🎯 Testing Best Practices

### ✅ DO

- **Test behavior, not implementation**
  ```typescript
  // ✅ Good - tests user-visible behavior
  expect(getByText('Book Title')).toBeDefined();
  
  // ❌ Bad - tests implementation details
  expect(component.state.title).toBe('Book Title');
  ```

- **Use descriptive test names**
  ```typescript
  // ✅ Good
  it('should display error message when book fetch fails', () => {});
  
  // ❌ Bad
  it('test error', () => {});
  ```

- **Follow AAA pattern** (Arrange, Act, Assert)
  ```typescript
  it('should save user interaction', async () => {
    // Arrange
    const interaction = { userId: '1', bookId: '2', type: 'like' };
    
    // Act
    const result = await saveInteraction(interaction);
    
    // Assert
    expect(result.isSuccess()).toBe(true);
  });
  ```

- **Mock external dependencies**
  ```typescript
  // Mock Supabase
  jest.mock('@/data/supabaseClient', () => ({
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
  }));
  ```

- **Test edge cases and errors**
  ```typescript
  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new NetworkError());
    const result = await fetchBooks();
    expect(result.isFailure()).toBe(true);
  });
  ```

- **Use data-testid for complex selectors**
  ```tsx
  <Button testID="submit-button">Submit</Button>
  
  // In test
  fireEvent.press(getByTestId('submit-button'));
  ```

### ❌ DON'T

- **Don't test third-party libraries**
- **Don't use snapshot tests for everything**
- **Don't test private methods**
- **Don't write brittle tests that break on minor UI changes**
- **Don't skip cleanup**
  ```typescript
  afterEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });
  ```

---

## 📊 Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

### View HTML Report

```bash
# Open in browser
open coverage/lcov-report/index.html
```

### Coverage Output

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   75.23 |    68.45 |   79.12 |   76.89 |
 domain/entities      |   92.45 |    85.23 |   95.67 |   93.12 |
 domain/use-cases     |   88.34 |    79.56 |   90.12 |   89.45 |
 data/repositories    |   65.78 |    58.23 |   70.45 |   67.89 |
 presentation/hooks   |   70.12 |    62.34 |   75.67 |   71.23 |
----------------------|---------|----------|---------|---------|
```

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npm test
    - run: npm run test:coverage
    
    # Upload coverage to Codecov
    - uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
```

---

## 🐛 Debugging Tests

### Debug Single Test

```bash
# Run single test with verbose output
npm test -- Book.test.ts --verbose

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand Book.test.ts
```

### VS Code Debug Config

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test Coverage Best Practices](https://martinfowler.com/bliki/TestCoverage.html)

---

## 🎯 Testing Roadmap

### Phase 1 (Current) ✅
- [x] Jest configuration
- [x] Basic unit tests (74 tests)
- [x] Test utilities and mocks
- [x] CI/CD integration

### Phase 2 (Next) 📋
- [ ] Increase coverage to 80%+
- [ ] Add component tests for all UI components
- [ ] Integration tests for all repositories
- [ ] E2E test setup with Detox

### Phase 3 (Future) 🚀
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility testing automation
- [ ] Test data factories
- [ ] Mutation testing

---

## ✅ Definition of Done (Testing)

A feature is "test complete" when:

- [ ] Unit tests written for all use cases
- [ ] Integration tests for repository layer
- [ ] Component tests for new UI components
- [ ] Coverage maintains or improves thresholds
- [ ] All tests pass in CI/CD
- [ ] Edge cases and error scenarios covered
- [ ] Tests are maintainable and readable
- [ ] Test documentation updated
