import React, { useEffect, useState } from 'react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import ProblemTextEditor from './ProblemTextEditor';
import CodeEditorWrapper from './CodeEditorWrapper';

export default function CodeReadingEditor(props: ProblemTypeEditProps) {
  const { questionContent, answerContent, questionFormat, answerFormat = 0, onQuestionChange, onAnswerChange, onFormatChange } = props;
  const [question, setQuestion] = useState(questionContent);
  const [questionFmt, setQuestionFmt] = useState<0 | 1>(questionFormat);
  const [snippet, setSnippet] = useState(answerContent ?? '');

  useEffect(() => setQuestion(questionContent), [questionContent]);
  useEffect(() => setSnippet(answerContent ?? ''), [answerContent]);
  useEffect(() => setQuestionFmt(questionFormat), [questionFormat]);

  return (
    <div className="space-y-4">
      <ProblemTextEditor
        value={question}
        format={questionFmt}
        onChange={(v) => { setQuestion(v); onQuestionChange?.(v); }}
        onFormatChange={(f) => { setQuestionFmt(f); onFormatChange?.('question', f); }}
        ariaLabel="問題文"
        placeholder={questionFmt === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'}
        showPreview={true}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">読解対象コード</label>
        <CodeEditorWrapper value={snippet} onChange={(v) => { setSnippet(v); onAnswerChange?.(v); }} ariaLabel="読解対象コード" placeholder="対象コードを入力..." />
      </div>
    </div>
  );
}
