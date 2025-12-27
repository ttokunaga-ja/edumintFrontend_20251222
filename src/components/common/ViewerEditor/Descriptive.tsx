import React, { useEffect, useState } from 'react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import ProblemTextEditor from './ProblemTextEditor';

export default function DescriptiveEditor(props: ProblemTypeEditProps) {
  const { questionContent, answerContent, questionFormat, answerFormat = 0, onQuestionChange, onAnswerChange, onFormatChange } = props;
  const [question, setQuestion] = useState(questionContent);
  const [answer, setAnswer] = useState(answerContent ?? '');
  const [questionFmt, setQuestionFmt] = useState<0 | 1>(questionFormat);
  const [answerFmt, setAnswerFmt] = useState<0 | 1>(answerFormat);

  useEffect(() => setQuestion(questionContent), [questionContent]);
  useEffect(() => setAnswer(answerContent ?? ''), [answerContent]);
  useEffect(() => setQuestionFmt(questionFormat), [questionFormat]);
  useEffect(() => setAnswerFmt(answerFormat), [answerFormat]);

  return (
    <div className="space-y-4">
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

      <ProblemTextEditor
        value={answer}
        format={answerFmt}
        onChange={(v) => {
          setAnswer(v);
          onAnswerChange?.(v);
        }}
        onFormatChange={(f) => {
          setAnswerFmt(f);
          onFormatChange?.('answer', f);
        }}
        ariaLabel="解答 / メモ"
        placeholder={answerFmt === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'}
        showPreview={true}
      />
    </div>
  );
}
