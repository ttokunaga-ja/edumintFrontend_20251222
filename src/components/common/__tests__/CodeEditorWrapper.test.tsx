import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeEditorWrapper from '../CodeEditorWrapper';
import { describe, it, expect, vi } from 'vitest';

describe('CodeEditorWrapper', () => {
  it('renders and notifies on change', () => {
    const onChange = vi.fn();
    render(<CodeEditorWrapper value="const x = 1;" onChange={onChange} ariaLabel="解答 / メモ" />);

    const ta = screen.getByLabelText(/解答.*入力/) as HTMLTextAreaElement;
    expect(ta).toBeInTheDocument();
    fireEvent.change(ta, { target: { value: 'const y = 2;' } });
    expect(onChange).toHaveBeenCalledWith('const y = 2;');
  });
});
