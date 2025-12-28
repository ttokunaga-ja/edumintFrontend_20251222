import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NativeSelect from './native-select'; describe('NativeSelect', () => { it('renders placeholder and calls onChange when selecting an item (fallback flow)', async () => { const items = [ { value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }, ]; const onChange = vi.fn(); render(<NativeSelect items={items} onChange={onChange} />); // Trigger button exists const trigger = screen.getByRole('button'); expect(trigger).toBeTruthy(); // Open (Radix fallback renders content via portal); click trigger fireEvent.click(trigger); // Find option and click const option = await screen.findByText('Option B'); expect(option).toBeTruthy(); fireEvent.click(option); expect(onChange).toHaveBeenCalledWith('b'); });
});
