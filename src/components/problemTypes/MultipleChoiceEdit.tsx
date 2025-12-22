import React, { useCallback, useEffect, useState } from 'react';
import { CheckSquare, Plus, Square, Trash2 } from 'lucide-react';
import { ProblemTypeEditProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

type Option = { id: string; content: string; isCorrect: boolean };

export default function MultipleChoiceEdit(props: ProblemTypeEditProps) {
  const {
    questionContent,
    answerContent,
    questionFormat,
    answerFormat = 0,
    options = [],
    onQuestionChange,
    onAnswerChange,
    onOptionsChange,
    onFormatChange,
  } = props;
  const [question, setQuestion] = useState(questionContent);
  const [answer, setAnswer] = useState(answerContent ?? '');
  const [localOptions, setLocalOptions] = useState<Option[]>(options);
  const [questionFmt, setQuestionFmt] = useState<0 | 1>(questionFormat);
  const [answerFmt, setAnswerFmt] = useState<0 | 1>(answerFormat);

  useEffect(() => setQuestion(questionContent), [questionContent]);
  useEffect(() => setAnswer(answerContent ?? ''), [answerContent]);
  useEffect(() => setLocalOptions(options), [options]);
  useEffect(() => setQuestionFmt(questionFormat), [questionFormat]);
  useEffect(() => setAnswerFmt(answerFormat), [answerFormat]);

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

  const toggleQuestionFormat = () => {
    const next = questionFmt === 0 ? 1 : 0;
    setQuestionFmt(next);
    onFormatChange?.('question', next);
  };

  const toggleAnswerFormat = () => {
    const next = answerFmt === 0 ? 1 : 0;
    setAnswerFmt(next);
    onFormatChange?.('answer', next);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">問題文</label>
          <button
            type="button"
            onClick={toggleQuestionFormat}
            aria-label="問題文フォーマット切替"
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            {questionFmt === 0 ? 'MD' : 'LaTeX'}
          </button>
        </div>
        <textarea
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            onQuestionChange?.(e.target.value);
          }}
          aria-label="問題文入力"
          className="w-full min-h-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder={questionFmt === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'}
        />
      </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">選択肢</label>
          <button
            type="button"
            onClick={handleAddOption}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <Plus className="h-3.5 w-3.5" />
            追加
          </button>
        </div>

        <div className="space-y-2">
          {localOptions.map((opt, idx) => (
            <div key={opt.id || idx} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3">
              <button
                type="button"
                onClick={() => handleOptionChange(idx, { isCorrect: !opt.isCorrect })}
                className="mt-0.5 text-indigo-600"
                aria-label={opt.isCorrect ? '正解に設定済み' : '正解としてマーク'}
              >
                {opt.isCorrect ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </button>
              <input
                value={opt.content}
                onChange={(e) => handleOptionChange(idx, { content: e.target.value })}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder={`選択肢 ${String.fromCharCode(65 + idx)}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveOption(idx)}
                className="text-red-500 hover:text-red-600"
                aria-label="選択肢を削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {localOptions.length === 0 && (
            <div className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500">
              まだ選択肢がありません。追加してください。
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
          <div className="mb-2 text-xs font-semibold text-gray-600">問題文プレビュー</div>
          {questionFmt === 0 ? (
            <MarkdownBlock content={question} className="prose prose-sm max-w-none" />
          ) : (
            <LatexBlock content={question} displayMode={false} className="text-gray-900" />
          )}
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">解説 / 答え</label>
          <button
            type="button"
            onClick={toggleAnswerFormat}
            aria-label="解答フォーマット切替"
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
          >
            {answerFmt === 0 ? 'MD' : 'LaTeX'}
          </button>
        </div>
        <textarea
          value={answer}
          onChange={(e) => {
            const next = e.target.value;
            setAnswer(next);
            onAnswerChange?.(next);
          }}
          aria-label="解答入力"
          className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder={answerFmt === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'}
        />

        <div className="mt-3 rounded-lg border border-gray-100 bg-blue-50 p-3 text-sm">
          <div className="mb-2 text-xs font-semibold text-gray-700">解説プレビュー</div>
          {answerFmt === 0 ? (
            <MarkdownBlock content={answer} className="prose prose-sm max-w-none" />
          ) : (
            <LatexBlock content={answer} displayMode={false} className="text-gray-900" />
          )}
        </div>
      </div>
    </div>
  );
}
