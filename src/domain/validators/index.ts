/**
 * Domain Validators
 *
 * Export tutti i validators per facilitare l'import
 */

export * from './BookValidator';
export * from './BookLineValidator';
export * from './UserInteractionValidator';
export * from './UserProfileValidator';
export * from './ReadingHistoryValidator';

// Re-export Zod per convenienza
export { z, ZodError } from 'zod';
