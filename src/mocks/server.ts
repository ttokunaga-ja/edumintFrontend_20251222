import { setupServer } from 'msw/node';
import { handlers } from './handlers'; // Centralized MSW server for tests (Vitest) covering all domains
export const server = setupServer(...handlers);
