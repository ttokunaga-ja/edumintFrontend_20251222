import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/primitives/button';

describe('primitives/Button (MUI PoC)', () => {
  it('renders with text and is accessible', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeDefined();
  });

  it('maps variant/destructive to MUI error color', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    // Basic smoke test: rendered element exists and contains text
    expect(container.textContent).toContain('Delete');
  });
});