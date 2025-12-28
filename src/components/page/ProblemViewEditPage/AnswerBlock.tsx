// @ts-nocheck
import { useState } from 'react';
import { FileCode, FileText, Edit, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

export type AnswerBlockProps = {
  subQuestionNumber: number;
  answerContent: string;
  answerFormat: 0 | 1; // 0: markdown, 1: latex
  explanation?: string;
  explanationFormat?: 0 | 1;
  isLocked?: boolean; // 広告視聴前などでロックされているか
  canEdit?: boolean;
  canSwitchFormat?: boolean;
  defaultExpanded?: boolean;
  onAnswerChange?: (content: string) => void;
  onExplanationChange?: (content: string) => void;
  onFormatChange?: (type: 'answer' | 'explanation', format: 0 | 1) => void;
  onUnlock?: () => void;
  className?: string;
};

export function AnswerBlock({
  subQuestionNumber,
  answerContent,
  answerFormat,
  explanation,
  explanationFormat = 0,
  isLocked = false,
  canEdit = false,
  canSwitchFormat = false,
  defaultExpanded = false,
  onAnswerChange,
  onExplanationChange,
  onFormatChange,
  onUnlock,
  className = '',
}: AnswerBlockProps) {
  const [currentAnswerFormat, setCurrentAnswerFormat] = useState<0 | 1>(answerFormat);
  const [currentExplanationFormat, setCurrentExplanationFormat] = useState<0 | 1>(explanationFormat);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [isEditingExplanation, setIsEditingExplanation] = useState(false);
  const [editAnswerContent, setEditAnswerContent] = useState(answerContent);
  const [editExplanationContent, setEditExplanationContent] = useState(explanation || '');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleAnswerFormatToggle = () => {
    const newFormat = currentAnswerFormat === 0 ? 1 : 0;
    setCurrentAnswerFormat(newFormat);
    onFormatChange?.('answer', newFormat);
  };

  const handleExplanationFormatToggle = () => {
    const newFormat = currentExplanationFormat === 0 ? 1 : 0;
    setCurrentExplanationFormat(newFormat);
    onFormatChange?.('explanation', newFormat);
  };

  const handleAnswerSave = () => {
    onAnswerChange?.(editAnswerContent);
    setIsEditingAnswer(false);
  };

  const handleExplanationSave = () => {
    onExplanationChange?.(editExplanationContent);
    setIsEditingExplanation(false);
  };

  if (isLocked) {
    return (
      <div className={`bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200 ${className}`}>
        <div style={{
      display: "flex",
      alignItems: "center"
    }>
          <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }>
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium text-amber-900 mb-1">解答を見るには</h4>
            <p className="text-sm text-amber-700">
              30秒の動画広告を視聴してください
            </p>
          </div>
          {onUnlock && (
            <button
              onClick={onUnlock}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              広告を見て解答を表示
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 rounded-lg border border-blue-200 overflow-hidden ${className}`}>
      {/* ヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
      display: "flex",
      alignItems: "center",
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }}
      >
        <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-blue-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-700" />
          )}
          <span className="font-medium text-blue-900">
            ({subQuestionNumber}) の解答を{isExpanded ? '隠す' : '表示'}
          </span>
        </div>
        <span className="text-xs text-blue-600">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* 解答コンテンツ */}
      {isExpanded && (
        <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
          {/* 解答 */}
          <div>
            <div style={{
      display: "flex",
      alignItems: "center"
    }>
              <span className="text-sm font-medium text-blue-900">解答</span>
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
                        <FileText className="w-3 h-3" />
                        <span className="hidden sm:inline">MD</span>
                      </>
                    ) : (
                      <>
                        <FileCode className="w-3 h-3" />
                        <span className="hidden sm:inline">LaTeX</span>
                      </>
                    )}
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => setIsEditingAnswer(true)}
                    className="p-1 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                    title="編集"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {isEditingAnswer ? (
              <div className="space-y-3">
                <textarea
                  value={editAnswerContent}
                  onChange={(e) => setEditAnswerContent(e.target.value)}
                  className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="bg-white rounded-lg p-3">
                {currentAnswerFormat === 0 ? (
                  <MarkdownBlock content={answerContent} className="text-sm" />
                ) : (
                  <LatexBlock content={answerContent} displayMode={false} className="text-sm" />
                )}
              </div>
            )}
          </div>

          {/* 解説 */}
          {explanation && (
            <div>
              <div style={{
      display: "flex",
      alignItems: "center"
    }>
                <span className="text-sm font-medium text-blue-900">解説</span>
                <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                  {canSwitchFormat && (
                    <button
                      onClick={handleExplanationFormatToggle}
                      style={{
      display: "flex",
      alignItems: "center",
      gap: "0.25rem"
    }}
                    >
                      {currentExplanationFormat === 0 ? (
                        <>
                          <FileText className="w-3 h-3" />
                          <span className="hidden sm:inline">MD</span>
                        </>
                      ) : (
                        <>
                          <FileCode className="w-3 h-3" />
                          <span className="hidden sm:inline">LaTeX</span>
                        </>
                      )}
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => setIsEditingExplanation(true)}
                      className="p-1 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                      title="編集"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {isEditingExplanation ? (
                <div className="space-y-3">
                  <textarea
                    value={editExplanationContent}
                    onChange={(e) => setEditExplanationContent(e.target.value)}
                    className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={currentExplanationFormat === 0 ? 'Markdown形式で入力...' : 'LaTeX形式で入力...'}
                  />
                  <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                    <button
                      onClick={handleExplanationSave}
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
                        setEditExplanationContent(explanation);
                        setIsEditingExplanation(false);
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
                <div className="bg-white rounded-lg p-3">
                  {currentExplanationFormat === 0 ? (
                    <MarkdownBlock content={explanation} className="text-sm" />
                  ) : (
                    <LatexBlock content={explanation} displayMode={false} className="text-sm" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
