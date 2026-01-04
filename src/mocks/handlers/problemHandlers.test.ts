import { describe, it, expect } from 'vitest';
import { __test_problems } from './problemHandlers';

describe('problemHandlers mock data', () => {
  it('includes the three new exams', () => {
    const ids = __test_problems.map(p => p.id);
    expect(ids).toEqual(expect.arrayContaining([
      'v7N2jK8mP4wL9XRz',
      'G9b5HqR1sT3cV6mN',
      'X4yZ7kM2pA8wL1qE'
    ]));
  });
});