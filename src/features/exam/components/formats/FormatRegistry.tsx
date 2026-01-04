import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { Box } from '@mui/material';
import { SelectionEditor } from './SelectionEditor';
import { MatchingEditor } from './MatchingEditor';
import { OrderingEditor } from './OrderingEditor';

interface FormatRegistryProps {
  questionTypeId: string;
  basePath: string;
  isEditMode: boolean;
}

/**
 * FormatRegistry
 * 
 * 問題形式（questionTypeId）に基づいて、
 * 対応する形式別エディタを動的に選択・レンダリングします。
 * 
 * ID 1, 2, 3: SelectionEditor (単一選択, 複数選択, 正誤判定)
 * ID 4: MatchingEditor (マッチング)
 * ID 5: OrderingEditor (順序並べ替え)
 * ID 10-14: 基本フォーム（SubQuestionItem で問題文・答案・解説で完全対応）
 */
export const FormatRegistry: FC<FormatRegistryProps> = ({
  questionTypeId,
  basePath,
  isEditMode,
}) => {
  // ID 1, 2, 3
  if (['1', '2', '3'].includes(questionTypeId)) {
    return (
      <SelectionEditor
        questionTypeId={questionTypeId}
        basePath={basePath}
        isEditMode={isEditMode}
      />
    );
  }

  // ID 4
  if (questionTypeId === '4') {
    return (
      <MatchingEditor
        basePath={basePath}
        isEditMode={isEditMode}
      />
    );
  }

  // ID 5
  if (questionTypeId === '5') {
    return (
      <OrderingEditor
        basePath={basePath}
        isEditMode={isEditMode}
      />
    );
  }

  // ID 10-14: 基本フォームで完全対応（何も表示しない）
  return <Box />;
};

export default FormatRegistry;
