import {
  Result,
  success,
  failure,
  tryCatch,
  tryCatchSync,
  combine,
} from '../../../../src/core/errors/Result';

describe('Result Pattern', () => {
  describe('Success', () => {
    it('should create a success result', () => {
      const result = success(42);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
      expect(result.error).toBeNull();
    });

    it('should identify as success', () => {
      const result = success('test');
      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
    });

    it('should map value', () => {
      const result = success(5).map((n) => n * 2);
      expect(result.isSuccess()).toBe(true);
      expect(result.value).toBe(10);
    });

    it('should flatMap to another result', () => {
      const result = success(5).flatMap((n) => success(n * 3));
      expect(result.isSuccess()).toBe(true);
      expect(result.value).toBe(15);
    });

    it('should getOrThrow the value', () => {
      const result = success('hello');
      expect(result.getOrThrow()).toBe('hello');
    });

    it('should getOrElse the value', () => {
      const result = success('hello');
      expect(result.getOrElse('default')).toBe('hello');
    });
  });

  describe('Failure', () => {
    it('should create a failure result', () => {
      const error = new Error('Something went wrong');
      const result = failure(error);
      expect(result.ok).toBe(false);
      expect(result.value).toBeNull();
      expect(result.error).toBe(error);
    });

    it('should identify as failure', () => {
      const result = failure(new Error('error'));
      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
    });

    it('should not map', () => {
      const result = failure(new Error('error')).map((n: any) => n * 2);
      expect(result.isFailure()).toBe(true);
    });

    it('should throw on getOrThrow', () => {
      const error = new Error('test error');
      const result = failure(error);
      expect(() => result.getOrThrow()).toThrow(error);
    });

    it('should getOrElse default value', () => {
      const result = failure(new Error('error'));
      expect(result.getOrElse('default')).toBe('default');
    });
  });

  describe('tryCatch', () => {
    it('should return success for successful async operation', async () => {
      const result = await tryCatch(async () => 'success');
      expect(result.isSuccess()).toBe(true);
      expect(result.value).toBe('success');
    });

    it('should return failure for failed async operation', async () => {
      const result = await tryCatch(async () => {
        throw new Error('failed');
      });
      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toBe('failed');
    });

    it('should handle non-Error throws', async () => {
      const result = await tryCatch(async () => {
        throw 'string error';
      });
      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toBe('string error');
    });
  });

  describe('tryCatchSync', () => {
    it('should return success for successful sync operation', () => {
      const result = tryCatchSync(() => 42);
      expect(result.isSuccess()).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should return failure for failed sync operation', () => {
      const result = tryCatchSync(() => {
        throw new Error('sync error');
      });
      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toBe('sync error');
    });
  });

  describe('combine', () => {
    it('should combine multiple success results', () => {
      const results = [success(1), success(2), success(3)] as const;
      const combined = combine(results);
      expect(combined.isSuccess()).toBe(true);
      expect(combined.value).toEqual([1, 2, 3]);
    });

    it('should return first failure', () => {
      const error = new Error('error');
      const results = [success(1), failure(error), success(3)] as const;
      const combined = combine(results);
      expect(combined.isFailure()).toBe(true);
      expect(combined.error).toBe(error);
    });

    it('should handle empty array', () => {
      const results = [] as const;
      const combined = combine(results);
      expect(combined.isSuccess()).toBe(true);
      expect(combined.value).toEqual([]);
    });
  });
});
