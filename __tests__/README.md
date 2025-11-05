# 🧪 Testing Documentation

## Struttura dei Test

Il progetto utilizza una strategia di testing completa su più livelli:

```
__tests__/
├── unit/                     # Unit tests (funzioni isolate)
│   ├── domain/
│   │   ├── entities/        # Test per entità di dominio
│   │   └── use-cases/       # Test per use cases
│   ├── data/
│   │   └── repositories/    # Test per repository interfaces
│   └── presentation/
│       └── components/      # Test per componenti UI
├── integration/             # Integration tests (flussi completi)
│   └── repositories/        # Test repository con mock Supabase
└── e2e/                     # End-to-end tests (TODO: Detox)
```

## Comandi Disponibili

```bash
# Esegui tutti i test
npm test

# Esegui test in watch mode (sviluppo)
npm run test:watch

# Genera coverage report
npm run test:coverage

# Esegui solo test di unità
npm test -- __tests__/unit

# Esegui solo test di integrazione
npm test -- __tests__/integration
```

## Coverage Targets

Il progetto mira a mantenere almeno **60% di coverage** su:

- **Branches**: 60%
- **Functions**: 60%
- **Lines**: 60%
- **Statements**: 60%

Target finale per production: **80%+**

## Esempi di Test

### Unit Test per Use Case

```typescript
describe('GetRandomBook Use Case', () => {
  it('should return a random book successfully', async () => {
    // Arrange
    const mockRepository = createMockRepository();
    const useCase = new GetRandomBook(mockRepository);

    // Act
    const result = await useCase.execute([]);

    // Assert
    expect(result).toBeDefined();
    expect(mockRepository.getRandomBook).toHaveBeenCalled();
  });
});
```

### Component Test

```typescript
describe('ErrorMessage Component', () => {
  it('should call onRetry when button is pressed', () => {
    // Arrange
    const mockRetry = jest.fn();
    render(<ErrorMessage message="Error" onRetry={mockRetry} />);

    // Act
    fireEvent.press(screen.getByText('Riprova'));

    // Assert
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test per Repository

```typescript
describe('SupabaseBookRepository', () => {
  it('should fetch book from Supabase', async () => {
    // Arrange
    mockSupabase.from().select().eq().single().mockResolvedValue({ data: mockBook, error: null });

    // Act
    const result = await repository.getBookById('123');

    // Assert
    expect(result).toEqual(mockBook);
  });
});
```

## Best Practices

### ✅ DO

- Usa pattern AAA (Arrange-Act-Assert)
- Testa un comportamento per test
- Mock dipendenze esterne (Supabase, API)
- Testa casi edge e errori
- Mantieni test leggibili e manutenibili

### ❌ DON'T

- Non testare implementazione interna
- Non fare test dipendenti dall'ordine
- Non condividere stato tra test
- Non ignorare console.error nei test
- Non testare librerie esterne

## Configurazione Jest

- **Preset**: `react-native`
- **Setup**: `jest.setup.js` per mock globali
- **Transform**: Include React Native, Expo, Supabase
- **Coverage**: Raccolta automatica da `src/**` e `app/**`

## Mock Disponibili

### Supabase Client

```typescript
jest.mock('./src/data/supabaseClient');
```

### AsyncStorage

```typescript
jest.mock('@react-native-async-storage/async-storage');
```

### Expo Modules

```typescript
jest.mock('expo-linking');
jest.mock('expo-constants');
```

## Prossimi Passi

- [ ] Aumentare coverage a 80%+
- [ ] Aggiungere snapshot tests per UI
- [ ] Implementare E2E tests con Detox
- [ ] Aggiungere performance tests
- [ ] CI/CD integration per automated testing

## Risorse

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
