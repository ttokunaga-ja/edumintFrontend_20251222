import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { FormatRegistry } from '@/features/exam/components/formats/FormatRegistry';
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

describe('FormatRegistry - Dynamic Editor Selection', () => {
  it('should render SelectionEditor for question type 1', () => {
    render(
      <TestWrapper>
        <FormatRegistry
          questionTypeId="1"
          basePath="questions.0.subQuestions.0"
          isEditMode={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('選択肢を編集')).toBeInTheDocument();
  });

  it('should render SelectionEditor for question type 2', () => {
    render(
      <TestWrapper>
        <FormatRegistry
          questionTypeId="2"
          basePath="questions.0.subQuestions.0"
          isEditMode={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('選択肢を編集')).toBeInTheDocument();
  });

  it('should render SelectionEditor for question type 3', () => {
    render(
      <TestWrapper>
        <FormatRegistry
          questionTypeId="3"
          basePath="questions.0.subQuestions.0"
          isEditMode={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('選択肢を編集')).toBeInTheDocument();
  });

  it('should render MatchingEditor for question type 4', () => {
    render(
      <TestWrapper>
        <FormatRegistry
          questionTypeId="4"
          basePath="questions.0.subQuestions.0"
          isEditMode={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('マッチングペアを編集')).toBeInTheDocument();
  });

  it('should render OrderingEditor for question type 5', () => {
    render(
      <TestWrapper>
        <FormatRegistry
          questionTypeId="5"
          basePath="questions.0.subQuestions.0"
          isEditMode={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('並び替えアイテムを編集')).toBeInTheDocument();
  });

  it('should render nothing for essay types (10-14)', () => {
    render(
      <TestWrapper>
        <FormatRegistry
          questionTypeId="10"
          basePath="questions.0.subQuestions.0"
          isEditMode={true}
        />
      </TestWrapper>
    );

    // Should render empty container - just check that no specific editors are rendered
    expect(screen.queryByText('選択肢を編集')).not.toBeInTheDocument();
    expect(screen.queryByText('ペアを編集')).not.toBeInTheDocument();
    expect(screen.queryByText('並び替えアイテムを編集')).not.toBeInTheDocument();
  });
});