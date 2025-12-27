import React, { useEffect, useState } from 'react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import ProblemTextEditor from './ProblemTextEditor';

export default function MathCalculationEditor(props: ProblemTypeEditProps) {
  const { questionContent, answerContent, questionFormat, answerFormat = 0, onQuestionChange, onAnswerChange, onFormatChange } = props;
  const [question, setQuestion] = useState(questionContent);
  const [answer, setAnswer] = useState(answerContent ?? '');
  const [questionFmt, setQuestionFmt] = useState<0 | 1>(questionFormat);
  const [tolerance, setTolerance] = useState('0.01');

  useEffect(() => setQuestion(questionContent), [questionContent]);
  useEffect(() => setAnswer(answerContent ?? ''), [answerContent]);
  useEffect(() => setQuestionFmt(questionFormat), [questionFormat]);

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

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">正答（数値）</label>
          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={answer} onChange={(e) => { setAnswer(e.target.value); onAnswerChange?.(e.target.value); }} />
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700">許容誤差</label>
          <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" value={tolerance} onChange={(e) => setTolerance(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
