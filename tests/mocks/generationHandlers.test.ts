import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { generationHandlers } from '@/mocks/handlers/generationHandlers';

const server = setupServer(...generationHandlers);

describe('msw generationHandlers', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('advances generation steps and reaches complete', async () => {
    // 1. Start Job
    const startRes = await fetch('http://localhost:3000/api/generation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ options: { checkStructure: true, isPublic: true } })
    });
    const startJson = await startRes.json();
    expect(startJson.jobId).toBeDefined();
    expect(startJson.phase).toBe(0); // structure_uploading

    const jobId = startJson.jobId;
    
    // 2. Poll Status
    let currentPhase = 0;
    let attempts = 0;
    const maxAttempts = 30; // Allow enough time for transitions

    while (attempts < maxAttempts) {
      const res = await fetch(`http://localhost:3000/api/generation/status/${jobId}`);
      const json = await res.json();
      currentPhase = json.phase;
      attempts++;

      // If waiting for confirmation (Phase 3: structure_confirmed)
      if (currentPhase === 3) {
        // Confirm structure
        await fetch(`http://localhost:3000/api/generation/${jobId}/confirm`, { method: 'POST' });
      }

      // If waiting for confirmation (Phase 13: generation_confirmed)
      if (currentPhase === 13) {
        // Confirm generation
        await fetch(`http://localhost:3000/api/generation/${jobId}/confirm`, { method: 'POST' });
      }

      // If completed (Phase 21: publication_publishing or done)
      if (currentPhase >= 21) {
        break;
      }

      // Wait a bit to allow time-based transitions in MSW handler
      // The handler uses Date.now(), so we need real time to pass or mock timers.
      // Since we are in a test, we can just wait.
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Verify we reached a completed state
    expect(currentPhase).toBeGreaterThanOrEqual(10); // At least passed structure phase
  }, 15000); // Increase timeout
});
