import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

export default function MultipleChoiceView(props: ProblemTypeViewProps) {
  const { questionContent, questionFormat, options = [], showAnswer = false } = props;

  const renderOptionContent = (text: string) => {
    const looksLikeLatex = /\\\\|\\sum|\\frac|\\binom|\\int|\\lim/.test(text);
    if (looksLikeLatex) {
      return <LatexBlock content={text} displayMode={false}  />;
    }
    return <MarkdownBlock content={text}  />;
  };

  return (
    <div>
      {questionFormat === 0 ? (
        <MarkdownBlock content={questionContent} />
      ) : (
        <LatexBlock content={questionContent} displayMode={false} />
      )}

      <div >
        {options.map((opt, idx) => (
          <div
            key={opt.id}
            
          >
            <div style={{
      display: "flex",
      gap: "0.75rem"
    }>
              <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }>
                {String.fromCharCode(65 + idx)}
              </div>
              <div >
                {renderOptionContent(opt.content)}
              </div>
              {showAnswer && opt.isCorrect && (
                <div >正解</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
