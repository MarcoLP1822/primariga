# Performance Optimization Guide

This document outlines the performance optimizations implemented in Primariga to ensure a fast and responsive mobile experience.

## Table of Contents

1. [React Query Caching](#react-query-caching)
2. [Performance Utilities](#performance-utilities)
3. [Image Optimization](#image-optimization)
4. [Infinite Scroll](#infinite-scroll)
5. [Best Practices](#best-practices)
6. [Monitoring](#monitoring)

---

## React Query Caching

### Configuration

React Query is configured with aggressive caching to minimize network requests:

```typescript
// src/infrastructure/config/queryClient.ts
{
  staleTime: 5 * 60 * 1000,        // 5 minutes
  gcTime: 30 * 60 * 1000,          // 30 minutes (up from 10min)
  retry: 3,                         // 3 retry attempts
  refetchOnWindowFocus: false,
  refetchOnMount: false,            // Don't refetch on component mount
  refetchOnReconnect: true,
  networkMode: 'online',
}
```

### Centralized Query Keys

All query keys are centralized for consistency and cache management:

```typescript
const queryKeys = {
  books: {
    all: ['books'] as const,
    random: () => [...queryKeys.books.all, 'random'] as const,
    byId: (id: string) => [...queryKeys.books.all, id] as const,
    line: (bookId: string, lineNumber: number) => 
      [...queryKeys.books.all, bookId, 'line', lineNumber] as const,
  },
  // ... more keys
};
```

### Usage

```typescript
// Use centralized keys
const { data } = useQuery({
  queryKey: queryKeys.books.byId(bookId),
  queryFn: () => fetchBook(bookId),
});

// Invalidate specific cache
queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
```

---

## Performance Utilities

### Debouncing

Use `useDebouncedCallback` to limit expensive operations:

```typescript
import { useDebouncedCallback } from '@/infrastructure/utils';

const handleSearch = useDebouncedCallback(
  (text: string) => {
    // Expensive search operation
    searchBooks(text);
  },
  300 // 300ms delay
);

<TextInput onChangeText={handleSearch} />
```

### Throttling

Use `useThrottledCallback` to limit rapid updates:

```typescript
import { useThrottledCallback } from '@/infrastructure/utils';

const handleScroll = useThrottledCallback(
  (event) => {
    // Track scroll position
    trackScrollPosition(event.nativeEvent.contentOffset.y);
  },
  100, // 100ms interval
  { maxWait: 1000 } // Max 1s wait
);

<ScrollView onScroll={handleScroll} />
```

### Memoization

Use `arePropsEqual` for deep comparison in `React.memo`:

```typescript
import { arePropsEqual } from '@/infrastructure/utils';

const BookCard = React.memo(
  ({ book, onPress }) => (
    <Card onPress={onPress}>
      <Text>{book.title}</Text>
    </Card>
  ),
  arePropsEqual // Deep comparison
);
```

### Previous Values

Track previous values to avoid unnecessary updates:

```typescript
import { usePrevious } from '@/infrastructure/utils';

const prevBookId = usePrevious(bookId);

useEffect(() => {
  if (bookId !== prevBookId) {
    // Only fetch if bookId changed
    fetchBook(bookId);
  }
}, [bookId, prevBookId]);
```

### Mounted State

Prevent state updates on unmounted components:

```typescript
import { useIsMounted } from '@/infrastructure/utils';

const isMounted = useIsMounted();

async function fetchData() {
  const data = await api.fetch();
  if (isMounted()) {
    setState(data);
  }
}
```

---

## Image Optimization

### OptimizedImage Component

Use `OptimizedImage` for automatic optimization:

```typescript
import { OptimizedImage } from '@/presentation/components';

<OptimizedImage
  source={book.coverImageUrl}
  preset="bookCover"
  responsive={{ width: 400, quality: 80 }}
  style={{ width: 200, height: 300 }}
  showLoading
/>
```

### Presets

Available image presets:

- **bookCover**: High quality, cover aspect ratio
  - Priority: high
  - Cache: memory + disk
  - Transition: 300ms

- **thumbnail**: Low quality, small size
  - Priority: normal
  - Cache: memory only
  - Transition: 200ms

- **avatar**: Circular, small
  - Priority: normal
  - Cache: memory + disk
  - Transition: 200ms

- **background**: Contain, low priority
  - Priority: low
  - Cache: disk only
  - Transition: 500ms

### Responsive Images

Generate responsive image URLs for Supabase Storage:

```typescript
import { getResponsiveImageUrl } from '@/infrastructure/utils';

const imageUrl = getResponsiveImageUrl(originalUrl, {
  width: 400,
  quality: 80,
  format: 'webp',
});
```

### Preloading

Preload images for better UX:

```typescript
import { preloadImages } from '@/infrastructure/utils';

// Preload book covers before showing list
await preloadImages(books.map(b => b.coverImageUrl));
```

### Cache Management

Clear image cache when needed:

```typescript
import { clearImageCache } from '@/infrastructure/utils';

// On logout or low memory
await clearImageCache();
```

---

## Infinite Scroll

### useInfiniteBooks

Infinite scroll for book lists:

```typescript
import { useInfiniteBooks } from '@/infrastructure/utils';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch,
} = useInfiniteBooks();

<FlatList
  data={data}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
  ListFooterComponent={
    isFetchingNextPage ? <LoadingSpinner /> : null
  }
/>
```

### useInfiniteReadingHistory

Infinite scroll for reading history:

```typescript
import { useInfiniteReadingHistory } from '@/infrastructure/utils';

const { data, fetchNextPage, hasNextPage } = 
  useInfiniteReadingHistory(userId);
```

### Configuration

Pagination configuration:

```typescript
const PAGINATION_CONFIG = {
  pageSize: 20,       // Items per page
  maxPages: 10,       // Max pages in memory (memory efficient)
};
```

### Pull-to-Refresh

Add pull-to-refresh gesture:

```typescript
import { usePullToRefresh } from '@/infrastructure/utils';

const { refreshing, onRefresh } = usePullToRefresh(refetch);

<FlatList
  refreshing={refreshing}
  onRefresh={onRefresh}
/>
```

---

## Best Practices

### Component Optimization

1. **Use React.memo for pure components**:
   ```typescript
   const BookCard = React.memo(BookCardComponent, arePropsEqual);
   ```

2. **Memoize expensive computations**:
   ```typescript
   const sortedBooks = useMemo(
     () => books.sort((a, b) => a.title.localeCompare(b.title)),
     [books]
   );
   ```

3. **Memoize callbacks**:
   ```typescript
   const handlePress = useCallback(() => {
     navigation.navigate('Book', { id: bookId });
   }, [bookId, navigation]);
   ```

### List Optimization

1. **Use getItemLayout for FlatList**:
   ```typescript
   <FlatList
     data={items}
     getItemLayout={(data, index) => ({
       length: ITEM_HEIGHT,
       offset: ITEM_HEIGHT * index,
       index,
     })}
   />
   ```

2. **Set keyExtractor**:
   ```typescript
   <FlatList
     keyExtractor={(item) => item.id}
   />
   ```

3. **Use initialNumToRender**:
   ```typescript
   <FlatList
     initialNumToRender={10}
     maxToRenderPerBatch={10}
     windowSize={5}
   />
   ```

### Navigation Optimization

1. **Preload screens**:
   ```typescript
   useFocusEffect(
     useCallback(() => {
       // Preload next probable screen
       navigation.preload('BookDetail');
     }, [])
   );
   ```

2. **Use lazy loading for heavy screens**:
   ```typescript
   const BookDetailScreen = lazy(() => import('./BookDetail'));
   ```

### State Management

1. **Colocate state**: Keep state as close to where it's used as possible

2. **Use Zustand for client state**:
   ```typescript
   const useStore = create((set) => ({
     theme: 'light',
     setTheme: (theme) => set({ theme }),
   }));
   ```

3. **Use React Query for server state**: Already configured globally

---

## Monitoring

### Performance Metrics

Track key metrics with Sentry:

```typescript
import * as Sentry from '@sentry/react-native';

// Track component render time
Sentry.startSpan(
  { 
    name: 'BookList',
    op: 'ui.render' 
  },
  async (span) => {
    // ... render logic
    span.end();
  }
);
```

### React DevTools Profiler

Use React DevTools Profiler to identify bottlenecks:

1. Open React DevTools
2. Go to Profiler tab
3. Record interaction
4. Analyze flamegraph for slow components

### Flipper

Use Flipper for React Native performance profiling:

```bash
# Install Flipper
npx react-native doctor

# Use Flipper plugins:
# - Layout Inspector
# - Network Inspector
# - Redux DevTools
# - React DevTools
```

### Bundle Analysis

Analyze bundle size:

```bash
# Generate bundle stats
npx expo export --dump-sourcemap

# Analyze with source-map-explorer
npx source-map-explorer dist/**/*.js
```

---

## Performance Checklist

- [ ] React Query caching configured (5min stale, 30min GC)
- [ ] Images optimized with `OptimizedImage` component
- [ ] Lists use `FlatList` with `getItemLayout`
- [ ] Heavy computations memoized with `useMemo`
- [ ] Callbacks memoized with `useCallback`
- [ ] Pure components wrapped with `React.memo`
- [ ] Infinite scroll implemented for long lists
- [ ] Pull-to-refresh available for data refresh
- [ ] Image preloading for critical assets
- [ ] Performance monitoring with Sentry
- [ ] Bundle size analyzed and optimized

---

## Troubleshooting

### Issue: List scrolling is janky

**Solutions**:
1. Use `getItemLayout` for fixed-height items
2. Reduce `initialNumToRender`
3. Memoize list items with `React.memo`
4. Remove expensive operations from render

### Issue: Images loading slowly

**Solutions**:
1. Use `OptimizedImage` with responsive sizing
2. Preload critical images
3. Use appropriate quality settings (80 for covers)
4. Enable disk caching for frequently accessed images

### Issue: App feels slow on navigation

**Solutions**:
1. Preload next screen data
2. Use lazy loading for heavy components
3. Optimize animations (use native driver)
4. Profile with Flipper to find bottlenecks

### Issue: High memory usage

**Solutions**:
1. Clear image cache periodically
2. Limit infinite scroll to max 10 pages
3. Remove unused query cache data
4. Use `windowSize` on FlatList

---

## Resources

- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo Image Optimization](https://docs.expo.dev/versions/latest/sdk/image/)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/react-native/performance/)
