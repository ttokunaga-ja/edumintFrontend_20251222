import { setupServer } from 'msw/node';
import { handlers } from './handlers/index'; // Centralized MSW server for tests (Vitest) covering all domains

/**
 * MSW Server for Node.js environment (Vitest)
 * Handles all API mocking across all domains
 */
export const server = setupServer(...handlers);
