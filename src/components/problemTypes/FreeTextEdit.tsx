import React, { useEffect, useState } from 'react';
import { ProblemTypeEditProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

export default function FreeTextEdit(props: ProblemTypeEditProps) {
  const { questionContent, answerContent, questionFormat, answerFormat = 0, onQuestionChange, onAnswerChange, onFormatChange } =
    props;
  const [question, setQuestion] = useState(questionContent);
  const [answer, setAnswer] = useState(answerContent ?? '');
  const [questionFmt, setQuestionFmt] = useState<0 | 1>(questionFormat);
  const [answerFmt, setAnswerFmt] = useState<0 | 1>(answerFormat);

  useEffect(() => {
    setQuestion(questionContent);
  }, [questionContent]);

  useEffect(() => {
    setAnswer(answerContent ?? '');
  }, [answerContent]);

  useEffect(() => {
    setQuestionFmt(questionFormat);
  }, [questionFormat]);

  useEffect(() => {
    setAnswerFmt(answerFormat);
  }, [answerFormat]);

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
    }>
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
        <div >
          <div >プレビュー</div>
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
    }>
          <label >解答 / メモ</label>
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
        <div >
          <div >プレビュー</div>
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
