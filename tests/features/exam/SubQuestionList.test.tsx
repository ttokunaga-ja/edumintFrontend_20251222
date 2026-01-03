import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { SubQuestionList } from '@/features/exam/components/SubQuestionList';
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

describe('SubQuestionList - Nested useFieldArray', () => {
  it('should render initial subquestions', () => {
    render(
      <TestWrapper>
        <SubQuestionList questionIndex={0} isEditMode={true} />
      </TestWrapper>
    );

    const numbers = screen.getAllByText('1');
    expect(numbers.length).toBeGreaterThan(0);
  });

  it('should add a new subquestion when add button is clicked', () => {
    render(
      <TestWrapper>
        <SubQuestionList questionIndex={0} isEditMode={true} />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /小問を追加/i });
    fireEvent.click(addButton);

    // Should now have '1' and '2' displayed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should remove a subquestion when delete button is clicked', async () => {
    render(
      <TestWrapper>
        <SubQuestionList questionIndex={0} isEditMode={true} />
      </TestWrapper>
    );

    // Add a second subquestion first
    const addButton = screen.getByRole('button', { name: /小問を追加/i });
    fireEvent.click(addButton);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Find the second subquestion item
    const secondSubQuestion = screen.getByTestId('subquestion-item-1');

    // Find delete button within the second subquestion
    const deleteButton = within(secondSubQuestion).getByTestId('delete-button');
    act(() => {
      fireEvent.click(deleteButton);
    });

    // Wait for the second subquestion to be removed
    await waitFor(() => {
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    // Should only have 1 subquestion now
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });
});