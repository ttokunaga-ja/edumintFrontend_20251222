// @ts-nocheck
import { useState } from 'react';
import { FileCode, FileText, Edit, Trash2, Plus } from 'lucide-react';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

export type QuestionBlockProps = {
  questionNumber: number;
  content: string;
  format: 0 | 1; // 0: markdown, 1: latex
  difficulty?: number; // 1: 基礎, 2: 応用, 3: 発展
  keywords?: Array<{ id: string; keyword: string }>;
  canEdit?: boolean;
  canSwitchFormat?: boolean;
  onContentChange?: (content: string) => void;
  onFormatChange?: (format: 0 | 1) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  onDelete?: () => void;
  className?: string;
};

const difficultyLabels = {
  1: { label: '基礎', color: 'bg-green-100 text-green-700' },
  2: { label: '応用', color: 'bg-yellow-100 text-yellow-700' },
  3: { label: '発展', color: 'bg-red-100 text-red-700' },
};

export function QuestionBlock({
  questionNumber,
  content,
  format,
  difficulty,
  keywords = [],
  canEdit = false,
  canSwitchFormat = false,
  onContentChange,
  onFormatChange,
  onKeywordAdd,
  onKeywordRemove,
  onDelete,
  className = '',
}: QuestionBlockProps) {
  const [currentFormat, setCurrentFormat] = useState<0 | 1>(format);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [newKeyword, setNewKeyword] = useState('');

  const handleFormatToggle = () => {
    const newFormat = currentFormat === 0 ? 1 : 0;
    setCurrentFormat(newFormat);
    onFormatChange?.(newFormat);
  };

  const handleSave = () => {
    onContentChange?.(editContent);
    setIsEditing(false);
  };

  const handleKeywordAdd = () => {
    if (newKeyword.trim() && onKeywordAdd) {
      onKeywordAdd(newKeyword.trim());
      setNewKeyword('');
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* ヘッダー */}
      <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            {/* 問題番号 */}
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
              {questionNumber}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-gray-900">大問{questionNumber}</h3>
                {difficulty && (
                  <span className={`px-2 py-0.5 rounded text-xs ${difficultyLabels[difficulty as keyof typeof difficultyLabels].color}`}>
                    {difficultyLabels[difficulty as keyof typeof difficultyLabels].label}
                  </span>
                )}
              </div>

              {/* コンテンツ */}
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={currentFormat === 0 ? 'Markdown形式で入力...' : 'LaTeX形式で入力...'}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditContent(content);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {canSwitchFormat && (
                    <button
                      onClick={handleFormatToggle}
                      className="absolute top-0 right-0 flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors z-10 border border-gray-200"
                    >
                      {currentFormat === 0 ? (
                        <>
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">Markdown</span>
                        </>
                      ) : (
                        <>
                          <FileCode className="w-4 h-4" />
                          <span className="hidden sm:inline">LaTeX</span>
                        </>
                      )}
                    </button>
                  )}

                  <div className={canSwitchFormat ? 'pt-10' : ''}>
                    {currentFormat === 0 ? (
                      <MarkdownBlock content={content} />
                    ) : (
                      <LatexBlock content={content} displayMode={true} />
                    )}
                  </div>
                </div>
              )}

              {/* キーワード */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
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
                <div className="flex gap-2 mt-3">
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
            </div>
          </div>

          {/* 編集/削除ボタン */}
          {canEdit && (
            <div className="flex gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
