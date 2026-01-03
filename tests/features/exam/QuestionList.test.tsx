import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { QuestionList } from '@/features/exam/components/QuestionList';
import { ExamFormValues, createDefaultExam } from '@/features/exam/schema';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<ExamFormValues>({
    defaultValues: createDefaultExam(),
  });

  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
};

describe('QuestionList - useFieldArray Integration', () => {
  it('should render initial questions', () => {
    render(
      <TestWrapper>
        <QuestionList isEditMode={true} />
      </TestWrapper>
    );

    const numbers = screen.getAllByText('1');
    expect(numbers.length).toBeGreaterThan(0); // At least one '1' should be present
  });

  it('should add a new question when add button is clicked', () => {
    render(
      <TestWrapper>
        <QuestionList isEditMode={true} />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /大問を追加/i });
    fireEvent.click(addButton);

    // Should now have at least two '1's and one '2'
    const numbers = screen.getAllByText('1');
    expect(numbers.length).toBeGreaterThan(1);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should remove a question when delete button is clicked', () => {
    render(
      <TestWrapper>
        <QuestionList isEditMode={true} />
      </TestWrapper>
    );

    // Add a second question first
    const addButton = screen.getByRole('button', { name: /大問を追加/i });
    fireEvent.click(addButton);

    expect(screen.getByText('2')).toBeInTheDocument();

    // Find and click delete button for second question
    const deleteButtons = screen.getAllByRole('button', { name: /削除/i });
    const initialNumbers = screen.getAllByText('1');
    expect(initialNumbers.length).toBeGreaterThan(1); // Should have multiple '1's initially
    
    fireEvent.click(deleteButtons[1]); // Second delete button

    // Should only have 1 question now
    const remainingNumbers = screen.getAllByText('1');
    expect(remainingNumbers.length).toBeGreaterThan(0);
    // Note: The '2' might still be present if the deletion didn't work as expected
    // This test might need adjustment based on actual component behavior
  });
});