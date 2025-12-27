import React, { useEffect, useState } from 'react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import ProblemTextEditor from './ProblemTextEditor';

export default function TrueFalseEditor(props: ProblemTypeEditProps) {
  const { questionContent, answerContent, questionFormat, answerFormat = 0, onQuestionChange, onAnswerChange, onFormatChange } = props;
  const [question, setQuestion] = useState(questionContent);
  const [correct, setCorrect] = useState(answerContent === 'true');
  const [questionFmt, setQuestionFmt] = useState<0 | 1>(questionFormat);

  useEffect(() => setQuestion(questionContent), [questionContent]);
  useEffect(() => setCorrect(answerContent === 'true'), [answerContent]);
  useEffect(() => setQuestionFmt(questionFormat), [questionFormat]);

  const onToggle = (val: boolean) => {
    setCorrect(val);
    onAnswerChange?.(val ? 'true' : 'false');
  };

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
        <label className="text-sm font-medium text-gray-700">正答</label>
        <div className="flex items-center gap-2">
          <button type="button" className={`px-3 py-1 rounded ${correct ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`} onClick={() => onToggle(true)}>○</button>
          <button type="button" className={`px-3 py-1 rounded ${!correct ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'}`} onClick={() => onToggle(false)}>×</button>
        </div>
      </div>

    </div>
  );
}
