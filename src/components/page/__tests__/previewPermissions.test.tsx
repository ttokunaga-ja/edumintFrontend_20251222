import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QuestionForm from '@/components/common/QuestionForm';
import { PreviewEditToggle } from '@/components/page/ProblemViewEditPage/PreviewEditToggle';
import { ProblemEditor } from '@/components/page/ProblemViewEditPage/ProblemEditor'; const sampleExam = { id: undefined, examName: 'preview', questions: [ { id: 'q1', question_number: 1, question_content: '表示専用', question_format: 0, sub_questions: [ { id: 'sq1', sub_question_number: 1, question_type_id: 1, question_content: '小問', question_format: 0, answer_content: '', answer_format: 0, }, ], }, ],
}; describe('preview permissions', () => { it('QuestionForm readOnly renders only preview (no textarea)', () => { render(<QuestionForm value="read only" format={0} readOnly />); expect(screen.queryByLabelText('問題文入力')).toBeNull(); expect(screen.getByLabelText('問題文プレビュー')).toBeInTheDocument(); }); it('PreviewEditToggle disables edit when permission missing', () => { render(<PreviewEditToggle isEditMode={false} setIsEditMode={() => {}} disabled />); const editBtn = screen.getByText('編集モード').closest('button'); expect(editBtn).toBeDisabled(); }); it('ProblemEditor renders no edit controls when canEdit is false', () => { render(<ProblemEditor exam={sampleExam} onChange={() => {}} canEdit={false} />); expect(screen.queryByText('大問を追加')).toBeNull(); expect(screen.queryByLabelText('小問タイプ')).toBeNull(); });
});
