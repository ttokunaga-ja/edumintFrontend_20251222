// @ts-nocheck
import { useState } from 'react';
import { FileCode, FileText, Edit, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

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
  onDelete,
  className = '',
}: SubQuestionBlockProps) {
  const [currentQuestionFormat, setCurrentQuestionFormat] = useState<0 | 1>(questionFormat);
  const [currentAnswerFormat, setCurrentAnswerFormat] = useState<0 | 1>(answerFormat);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editQuestionContent, setEditQuestionContent] = useState(questionContent);
  const [editAnswerContent, setEditAnswerContent] = useState(answerContent || '');
  const [newKeyword, setNewKeyword] = useState('');
  const [answerExpanded, setAnswerExpanded] = useState(showAnswer);

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

  const handleKeywordAdd = () => {
    if (newKeyword.trim() && onKeywordAdd) {
      onKeywordAdd(newKeyword.trim());
      setNewKeyword('');
    }
  };

  return (
    <div className={`border-b border-gray-100 last:border-b-0 ${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
              ({subQuestionNumber})
            </div>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
              {questionTypeLabels[questionTypeId] || '記述式'}
            </span>
          </div>

          {/* 編集/削除ボタン */}
          {canEdit && (
            <div className="flex gap-2">
              {!isEditingQuestion && (
                <button
                  onClick={() => setIsEditingQuestion(true)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 問題文 */}
        <div className="mb-4">
          {isEditingQuestion ? (
            <div className="space-y-3">
              <textarea
                value={editQuestionContent}
                onChange={(e) => setEditQuestionContent(e.target.value)}
                className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={currentQuestionFormat === 0 ? 'Markdown形式で入力...' : 'LaTeX形式で入力...'}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleQuestionSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setEditQuestionContent(questionContent);
                    setIsEditingQuestion(false);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {canSwitchFormat && (
                <button
                  onClick={handleQuestionFormatToggle}
                  className="absolute top-0 right-0 flex items-center gap-2 px-2 py-1 bg-white hover:bg-gray-50 rounded text-xs text-gray-700 transition-colors z-10 border border-gray-200"
                >
                  {currentQuestionFormat === 0 ? (
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

              <div className={canSwitchFormat ? 'pt-8' : ''}>
                {currentQuestionFormat === 0 ? (
                  <MarkdownBlock content={questionContent} className="text-sm" />
                ) : (
                  <LatexBlock content={questionContent} displayMode={false} className="text-sm" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 選択肢（選択式の場合） */}
        {questionTypeId === 2 && options.length > 0 && (
          <div className="mb-4 space-y-2">
            {options.map((option, index) => (
              <div
                key={option.id}
                className={`p-3 rounded-lg border ${option.isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white'
                  }`}
              >
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xs">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm text-gray-900">{option.content}</span>
                  {option.isCorrect && (
                    <span className="ml-auto px-2 py-0.5 bg-green-600 text-white rounded text-xs">
                      正解
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* キーワード */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((keyword) => (
              <span
                key={keyword.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
              >
                {keyword.keyword}
                {canEdit && onKeywordRemove && (
                  <button
                    onClick={() => onKeywordRemove(keyword.id)}
                    className="hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* キーワード追加 */}
        {canEdit && onKeywordAdd && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()}
              placeholder="キーワードを追加..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleKeywordAdd}
              className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 解答セクション */}
        {answerContent && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <button
              onClick={() => setAnswerExpanded(!answerExpanded)}
              className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors mb-3"
            >
              {answerExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>解答を{answerExpanded ? '隠す' : '表示'}</span>
            </button>

            {answerExpanded && (
              <div className="bg-blue-50 rounded-lg p-4">
                {isEditingAnswer ? (
                  <div className="space-y-3">
                    <textarea
                      value={editAnswerContent}
                      onChange={(e) => setEditAnswerContent(e.target.value)}
                      className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={currentAnswerFormat === 0 ? 'Markdown形式で入力...' : 'LaTeX形式で入力...'}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnswerSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
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
                  <>
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
                    {currentAnswerFormat === 0 ? (
                      <MarkdownBlock content={answerContent} className="text-sm" />
                    ) : (
                      <LatexBlock content={answerContent} displayMode={false} className="text-sm" />
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
