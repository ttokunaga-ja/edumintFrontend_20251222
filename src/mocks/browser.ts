import { setupWorker } from 'msw/browser';
import { contentHandlers } from './handlers/contentHandlers';

export const worker = setupWorker(...contentHandlers);
