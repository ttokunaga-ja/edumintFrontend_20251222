import React, { useCallback, useEffect, useState } from 'react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import ProblemTextEditor from './ProblemTextEditor';
import { Plus, Trash2 } from 'lucide-react';

type Option = { id: string; content: string; isCorrect: boolean };

export default function SelectionEditor(props: ProblemTypeEditProps) {
  const { questionContent, answerContent, questionFormat, answerFormat = 0, options = [], onQuestionChange, onAnswerChange, onOptionsChange, onFormatChange } = props;
  const [question, setQuestion] = useState(questionContent);
  const [answer, setAnswer] = useState(answerContent ?? '');
  const [questionFmt, setQuestionFmt] = useState<0 | 1>(questionFormat);
  const [answerFmt, setAnswerFmt] = useState<0 | 1>(answerFormat);
  const [localOptions, setLocalOptions] = useState<Option[]>(options as Option[]);

  useEffect(() => setQuestion(questionContent), [questionContent]);
  useEffect(() => setAnswer(answerContent ?? ''), [answerContent]);
  useEffect(() => setQuestionFmt(questionFormat), [questionFormat]);
  useEffect(() => setAnswerFmt(answerFormat), [answerFormat]);
  useEffect(() => setLocalOptions(options as Option[]), [options]);

  const newOptionId = useCallback(() => `opt-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, []);

  const updateOptions = (next: Option[]) => {
    setLocalOptions(next);
    onOptionsChange?.(next);
  };

  const handleOptionChange = (index: number, patch: Partial<Option>) => {
    const next = localOptions.map((opt, idx) => (idx === index ? { ...opt, ...patch } : opt));
    updateOptions(next);
  };

  const handleAddOption = () => {
    const created = { id: newOptionId(), content: '', isCorrect: false };
    updateOptions([...localOptions, created]);
  };

  const handleRemoveOption = (index: number) => {
    const next = localOptions.filter((_, idx) => idx !== index);
    updateOptions(next);
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">選択肢</label>
          <button type="button" onClick={handleAddOption} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
            <Plus className="h-3.5 w-3.5" />
            追加
          </button>
        </div>

        <div className="space-y-2">
          {localOptions.map((opt, idx) => (
            <div key={opt.id || idx} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3">
              <button type="button" onClick={() => handleOptionChange(idx, { isCorrect: !opt.isCorrect })} className="mt-0.5 text-indigo-600 font-semibold text-sm" aria-label={opt.isCorrect ? '正解に設定済み' : '正解としてマーク'}>
                {opt.isCorrect ? '✔' : '□'}
              </button>
              <input value={opt.content} onChange={(e) => handleOptionChange(idx, { content: e.target.value })} className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" placeholder={`選択肢 ${String.fromCharCode(65 + idx)}`} />
              <button type="button" onClick={() => handleRemoveOption(idx)} className="text-red-500 hover:text-red-600" aria-label="選択肢を削除">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {localOptions.length === 0 && (
            <div className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500">まだ選択肢がありません。追加してください。</div>
          )}
        </div>

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
          ariaLabel="解説 / 答え"
          placeholder={answerFmt === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'}
          showPreview={true}
        />
      </div>
    </div>
  );
}
