import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Expose MSW internals for E2E tests to override handlers at runtime
if (typeof window !== 'undefined') {
  (window as any).msw = { worker, http, HttpResponse };
}
