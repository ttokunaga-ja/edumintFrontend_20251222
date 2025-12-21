import { setupServer } from 'msw/node';
import { contentHandlers } from './handlers/contentHandlers';

export const server = setupServer(...contentHandlers);
