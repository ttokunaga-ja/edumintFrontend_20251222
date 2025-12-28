import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
    <div >
      <div>
        <div style={{
      display: "flex",
      alignItems: "center"
    }}>
          <label >問題文</label>
          <button
            type="button"
            onClick={toggleQuestionFormat}
            aria-label="問題文フォーマット切替"
            
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
          style={{
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
          placeholder={questionFmt === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'} />
        />
      </div>

        <div >
          <div style={{
      display: "flex",
      alignItems: "center"
    }}>
            <label >選択肢</label>
          <button
            type="button"
            onClick={handleAddOption}
            style={{
      alignItems: "center",
      gap: "0.25rem",
      borderRadius: "0.375rem"
    }}
          >
            <Plus  />
            追加
          </button>
        </div>

        <div >
          {localOptions.map((opt, idx) => (
            <div key={opt.id || idx} style={{
      display: "flex",
      gap: "0.5rem"
    }}>
              <button
                type="button"
                onClick={() => handleOptionChange(idx, { isCorrect: !opt.isCorrect })}
                
                aria-label={opt.isCorrect ? '正解に設定済み' : '正解としてマーク'}
              >
                {opt.isCorrect ? '✔' : '□'}
              </button>
              <input
                value={opt.content}
                onChange={(e) => handleOptionChange(idx, { content: e.target.value })}
                style={{
      borderRadius: "0.375rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
                placeholder={`選択肢 ${String.fromCharCode(65 + idx)}`} />
              />
              <button
                type="button"
                onClick={() => handleRemoveOption(idx)}
                
                aria-label="選択肢を削除"
              >
                <Trash2  />
              </button>
            </div>
          ))}

          {localOptions.length === 0 && (
            <div style={{
      borderRadius: "0.375rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}>
              まだ選択肢がありません。追加してください。
            </div>
          )}
        </div>

        <div >
          <div >問題文プレビュー</div>
          {questionFmt === 0 ? (
            <MarkdownBlock content={question}  />
          ) : (
            <LatexBlock content={question} displayMode={false}  />
          )}
        </div>
      </div>

      <div>
        <div style={{
      display: "flex",
      alignItems: "center"
    }}>
          <label >解説 / 答え</label>
          <button
            type="button"
            onClick={toggleAnswerFormat}
            aria-label="解答フォーマット切替"
            
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
          style={{
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
          placeholder={answerFmt === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'} />
        />

        <div >
          <div >解説プレビュー</div>
          {answerFmt === 0 ? (
            <MarkdownBlock content={answer}  />
          ) : (
            <LatexBlock content={answer} displayMode={false}  />
          )}
        </div>
      </div>
    </div>
  );
}
