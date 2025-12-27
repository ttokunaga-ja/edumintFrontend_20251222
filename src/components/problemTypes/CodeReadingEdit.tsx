import React, { useEffect, useState } from 'react';
import { ProblemTypeEditProps } from '@/types/problemTypes';
import ProblemTextEditor from '@/components/common/ProblemTextEditor';
import CodeEditorWrapper from '@/components/common/CodeEditorWrapper';

export default function CodeReadingEdit(props: ProblemTypeEditProps) {
  const { questionContent, answerContent, questionFormat, answerFormat = 0, onQuestionChange, onAnswerChange, onFormatChange } = props;
  const [question, setQuestion] = useState(questionContent);
  const [questionFmt, setQuestionFmt] = useState<0 | 1>(questionFormat);
  const [answer, setAnswer] = useState(answerContent ?? '');

  useEffect(() => setQuestion(questionContent), [questionContent]);
  useEffect(() => setQuestionFmt(questionFormat), [questionFormat]);
  useEffect(() => setAnswer(answerContent ?? ''), [answerContent]);

  return (
    <div className="space-y-4">
      <div>
        <ProblemTextEditor
          value={question}
          format={questionFmt}
          onChange={(v) => {
            setQuestion(v);
            onQuestionChange?.(v);
          }}
          onFormatChange={(f) => {
            setQuestionFmt(f);
            onFormatChange?.('question', f);
          }}
          ariaLabel="問題文"
          placeholder={questionFmt === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'}
          showPreview={true}
        />
      </div>

      <div>
        <CodeEditorWrapper
          value={answer}
          onChange={(v) => {
            setAnswer(v);
            onAnswerChange?.(v);
          }}
          ariaLabel="解答 / メモ"
          placeholder="コードを入力..."
        />
      </div>
    </div>
  );
}
