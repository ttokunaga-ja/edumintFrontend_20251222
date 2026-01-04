import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedSearchPanel, SearchFilters } from '@/components/page/HomePage/AdvancedSearchPanel';
import i18next from '@/lib/i18n';
import { PROBLEM_FORMAT_OPTIONS } from '@/features/ui/selectionOptions';

describe('AdvancedSearchPanel - Formats filter', () => {
  it('renders problem formats and applies selection', () => {
    const onFiltersChange = vi.fn();
    const filters: SearchFilters = {};

    render(
      <AdvancedSearchPanel
        filters={filters}
        onFiltersChange={onFiltersChange}
        isOpen={true}
      />
    );

    // Ensure the formats section is present
    expect(screen.getByText(i18next.t('filters.formats'))).toBeInTheDocument();

    // Toggle the first format checkbox (localized label)
    const firstFormat = screen.getByLabelText(i18next.t(PROBLEM_FORMAT_OPTIONS[0].labelKey));
    fireEvent.click(firstFormat);

    // Click the search/apply button (use positional lookup to avoid i18n issues)
    const buttons = screen.getAllByRole('button');
    // The apply and reset buttons are rendered last in the panel; pick the apply one
    const applyButton = buttons[buttons.length - 2];
    fireEvent.click(applyButton);

    // onFiltersChange should be called with formats including the value for the first format option
    expect(onFiltersChange).toHaveBeenCalled();
    const calledWith = onFiltersChange.mock.calls[0][0];
    expect(calledWith.formats).toBeDefined();
    expect(Array.isArray(calledWith.formats)).toBe(true);
    expect(calledWith.formats).toContain(PROBLEM_FORMAT_OPTIONS[0].value);
  });
});
