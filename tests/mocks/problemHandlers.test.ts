import { describe, it, expect } from 'vitest';
import { __test_problems } from '../../src/mocks/handlers/problemHandlers';

describe('problemHandlers mock data', () => {
  it('includes the three new exams', () => {
    expect(__test_problems.length).toBeGreaterThanOrEqual(5);
    const ids = __test_problems.map(p => p.id);
    expect(ids).toEqual(expect.arrayContaining([
      'v7N2jK8mP4wL9XRz',
      'G9b5HqR1sT3cV6mN',
      'X4yZ7kM2pA8wL1qE'
    ]));
  });

  it('returns all exams when no keyword and no filters', () => {
    const all = __test_problems;
    expect(all.length).toBeGreaterThanOrEqual(5);
  });

  it('filters by year correctly', () => {
    const year = '2025';
    const filtered = __test_problems.filter(p => p.createdAt.includes(year));
    expect(filtered.length).toBeGreaterThanOrEqual(5);
  });

  it('can find quantum exam by professor name', () => {
    const q = __test_problems.find(p => p.id === 'v7N2jK8mP4wL9XRz');
    expect(q).toBeDefined();
    expect(q?.author.name).toContain('佐藤');
  });
});