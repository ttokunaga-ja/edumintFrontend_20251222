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
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
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
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
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
        <div className="px-4 pb-4 space-y-4">
          {/* 解答 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">解答</span>
              <div className="flex gap-2">
                {canSwitchFormat && (
                  <button
                    onClick={handleAnswerFormatToggle}
                    className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-50 rounded text-xs text-gray-700 transition-colors border border-gray-200"
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
                <div className="flex gap-2">
                  <button
                    onClick={handleAnswerSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditAnswerContent(answerContent);
                      setIsEditingAnswer(false);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">解説</span>
                <div className="flex gap-2">
                  {canSwitchFormat && (
                    <button
                      onClick={handleExplanationFormatToggle}
                      className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-50 rounded text-xs text-gray-700 transition-colors border border-gray-200"
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
                  <div className="flex gap-2">
                    <button
                      onClick={handleExplanationSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditExplanationContent(explanation);
                        setIsEditingExplanation(false);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
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
