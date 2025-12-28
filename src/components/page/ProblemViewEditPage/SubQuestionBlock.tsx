// @ts-nocheck
import { useState } from 'react';
import { FileCode, FileText, Edit, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';
import ProblemTypeRegistry from '@/components/problemTypes/ProblemTypeRegistry';
import MultipleChoiceView from '@/components/problemTypes/MultipleChoiceView';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { SubQuestionMetaEdit } from './common/SubQuestionMetaEdit';
import { SubQuestionMetaView } from './common/SubQuestionMetaView';

export type SubQuestionBlockProps = {
  subQuestionNumber: number;
  questionTypeId: number;
  questionContent: string;
  questionFormat: 0 | 1; // 0: markdown, 1: latex
  answerContent?: string;
  answerFormat?: 0 | 1;
  keywords?: Array<{ id: string; keyword: string }>;
  options?: Array<{ id: string; content: string; isCorrect: boolean }>;
  canEdit?: boolean;
  canSwitchFormat?: boolean;
  showAnswer?: boolean;
  onQuestionChange?: (content: string) => void;
  onAnswerChange?: (content: string) => void;
  onFormatChange?: (type: 'question' | 'answer', format: 0 | 1) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  onTypeChange?: (typeId: number) => void;
  onDelete?: () => void;
  className?: string;
};

const questionTypeLabels: Record<number, string> = {
  1: '記述式',
  2: '選択式',
  3: '穴埋め',
  4: '論述式',
  5: '証明問題',
  6: '数値計算式',
};

export function SubQuestionBlock({
  subQuestionNumber,
  questionTypeId,
  questionContent,
  questionFormat,
  answerContent,
  answerFormat = 0,
  keywords = [],
  options = [],
  canEdit = false,
  canSwitchFormat = false,
  showAnswer = false,
  onQuestionChange,
  onAnswerChange,
  onFormatChange,
  onKeywordAdd,
  onKeywordRemove,
  onTypeChange,
  onDelete,
  className = '',
}: SubQuestionBlockProps) {
  const [currentQuestionFormat, setCurrentQuestionFormat] = useState<0 | 1>(questionFormat);
  const [currentAnswerFormat, setCurrentAnswerFormat] = useState<0 | 1>(answerFormat);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editQuestionContent, setEditQuestionContent] = useState(questionContent);
  const [editAnswerContent, setEditAnswerContent] = useState(answerContent || '');
  const [answerExpanded, setAnswerExpanded] = useState(showAnswer);
  // ensure registry is ready for view components
  ProblemTypeRegistry.registerDefaults();

  const handleQuestionFormatToggle = () => {
    const newFormat = currentQuestionFormat === 0 ? 1 : 0;
    setCurrentQuestionFormat(newFormat);
    onFormatChange?.('question', newFormat);
  };

  const handleAnswerFormatToggle = () => {
    const newFormat = currentAnswerFormat === 0 ? 1 : 0;
    setCurrentAnswerFormat(newFormat);
    onFormatChange?.('answer', newFormat);
  };

  const handleQuestionSave = () => {
    onQuestionChange?.(editQuestionContent);
    setIsEditingQuestion(false);
  };

  const handleAnswerSave = () => {
    onAnswerChange?.(editAnswerContent);
    setIsEditingAnswer(false);
  };

  return (
    <div >
      <div >
        <div style={{
      display: "flex",
      gap: "0.75rem"
    }>
          <div style={{
      display: "flex",
      gap: "0.75rem"
    }>
            <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }>
              ({subQuestionNumber})
            </div>
            <div >
              <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
                <span >小問{subQuestionNumber}</span>
                <span >
                  {questionTypeLabels[questionTypeId] || '記述式'}
                </span>
              </div>
              {/* タイプセレクト + キーワード（共通コンポーネント / 表示専用分岐） */}
              {canEdit ? (
                <SubQuestionMetaEdit
                  questionTypeId={questionTypeId}
                  questionTypeOptions={Object.entries(questionTypeLabels).map(([id, label]) => ({
                    value: Number(id),
                    label,
                  }))}
                  keywords={keywords}
                  onTypeChange={onTypeChange}
                  onKeywordAdd={onKeywordAdd}
                  onKeywordRemove={onKeywordRemove}
                />
              ) : (
                <SubQuestionMetaView
                  questionTypeLabel={questionTypeLabels[questionTypeId] || '記述式'}
                  keywords={keywords}
                />
              )}
            </div>
          </div>

          {/* 編集/削除ボタン */}
          {canEdit && (
            <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
              {!isEditingQuestion && (
                <button
                  onClick={() => setIsEditingQuestion(true)}
                  
                  title="編集"
                >
                  <Edit  />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  
                  title="削除"
                >
                  <Trash2  />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 問題文 */}
        <div >
          {isEditingQuestion ? (
            <div >
              <textarea
                value={editQuestionContent}
                onChange={(e) => setEditQuestionContent(e.target.value)}
                
                placeholder={currentQuestionFormat === 0 ? 'Markdown形式で入力...' : 'LaTeX形式で入力...'}
              />
              <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                <button
                  onClick={handleQuestionSave}
                  style={{
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setEditQuestionContent(questionContent);
                    setIsEditingQuestion(false);
                  }}
                  style={{
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div >
              {canSwitchFormat && (
                <button
                  onClick={handleQuestionFormatToggle}
                  style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }}
                >
                  {currentQuestionFormat === 0 ? (
                    <>
                      <FileText  />
                      <span >MD</span>
                    </>
                  ) : (
                    <>
                      <FileCode  />
                      <span >LaTeX</span>
                    </>
                  )}
                </button>
              )}

              <div className={canSwitchFormat ? 'pt-8' : ''}>
                {/* Delegate rendering to the problem type view component */}
                {(() => {
                  const viewProps: ProblemTypeViewProps = {
                    subQuestionNumber,
                    questionContent,
                    questionFormat: currentQuestionFormat,
                    answerContent,
                    answerFormat: currentAnswerFormat,
                    options,
                    keywords,
                    showAnswer: answerExpanded && showAnswer,
                  };

                  const Comp = ProblemTypeRegistry.getProblemTypeView
                    ? ProblemTypeRegistry.getProblemTypeView(questionTypeId)
                    : null;

                  if (Comp) {
                    return <Comp {...viewProps} />;
                  }

                  // fallback: multiple choice explicit
                  if (questionTypeId === 2) {
                    return <MultipleChoiceView {...viewProps} />;
                  }

                  return currentQuestionFormat === 0
                    ? <MarkdownBlock content={questionContent}  />
                    : <LatexBlock content={questionContent} displayMode={false}  />;
                })()}
              </div>
            </div>
          )}
        </div>

        {/* 選択肢（選択式の場合） */}
        {/* 解答セクション */}
        {answerContent && (
          <div >
            <button
              onClick={() => setAnswerExpanded(!answerExpanded)}
              style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }}
            >
              {answerExpanded ? (
                <ChevronUp  />
              ) : (
                <ChevronDown  />
              )}
              <span>解答を{answerExpanded ? '隠す' : '表示'}</span>
            </button>

            {answerExpanded && (
              <div >
                {isEditingAnswer ? (
                  <div >
                    <textarea
                      value={editAnswerContent}
                      onChange={(e) => setEditAnswerContent(e.target.value)}
                      
                      placeholder={currentAnswerFormat === 0 ? 'Markdown形式で入力...' : 'LaTeX形式で入力...'}
                    />
                    <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                      <button
                        onClick={handleAnswerSave}
                        style={{
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditAnswerContent(answerContent);
                          setIsEditingAnswer(false);
                        }}
                        style={{
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
      display: "flex",
      alignItems: "center"
    }>
                      <span >解答</span>
                      <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                        {canSwitchFormat && (
                          <button
                            onClick={handleAnswerFormatToggle}
                            style={{
      display: "flex",
      alignItems: "center",
      gap: "0.25rem"
    }}
                          >
                            {currentAnswerFormat === 0 ? (
                              <>
                                <FileText  />
                                <span >MD</span>
                              </>
                            ) : (
                              <>
                                <FileCode  />
                                <span >LaTeX</span>
                              </>
                            )}
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => setIsEditingAnswer(true)}
                            
                            title="編集"
                          >
                            <Edit  />
                          </button>
                        )}
                      </div>
                    </div>
                    {showAnswer && (
                      currentAnswerFormat === 0 ? (
                        <MarkdownBlock content={answerContent}  />
                      ) : (
                        <LatexBlock content={answerContent} displayMode={false}  />
                      )
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
