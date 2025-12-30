// @ts-nocheck
import { useState } from 'react';
import { FileCode, FileText, Edit, Trash2 } from 'lucide-react';
import QuestionForm from '@/components/common/QuestionForm';
import { QuestionMetaView } from './common/QuestionMetaView';
import { QuestionMetaEdit } from './common/QuestionMetaEdit'; export type QuestionBlockProps = { questionNumber?: number; content?: string; format?: 0 | 1; // 0: markdown, 1: latex difficulty?: number; // 1: 基礎, 2: 応用, 3: 発展 keywords?: Array<{ id: string; keyword: string }>; canEdit?: boolean; canSwitchFormat?: boolean; onContentChange?: (content: string) => void; onFormatChange?: (format: 0 | 1) => void; onKeywordAdd?: (keyword: string) => void; onKeywordRemove?: (keywordId: string) => void; onDelete?: () => void; difficultyOptions?: Array<{ value: number; label: string }>; onDifficultyChange?: (value: number) => void; question?: any; // optional shorthand input
};

const difficultyLabels = {
  0: { label: '未設定', color: 'gray' },
  1: { label: '基礎', color: 'green' },
  2: { label: '応用', color: 'orange' },
  3: { label: '発展', color: 'red' },
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
  difficultyOptions = [
    { value: 0, label: '未設定' },
    { value: 1, label: '基礎' },
    { value: 2, label: '応用' },
    { value: 3, label: '発展' },
  ],
  onDifficultyChange,
  viewMode = 'full',
  question,
}: QuestionBlockProps & { viewMode?: 'full' | 'structure' }) { const derivedContent = content ?? question?.question_content ?? question?.questionContent ?? ''; const derivedNumber = questionNumber ?? question?.question_number ?? question?.questionNumber ?? 1; const derivedFormat = (format ?? question?.question_format ?? question?.questionFormat ?? 0) as 0 | 1; const derivedDifficulty = difficulty ?? question?.difficulty ?? 0; const derivedKeywords = keywords.length ? keywords : question?.keywords ?? []; const [currentFormat, setCurrentFormat] = useState<0 | 1>(derivedFormat);
  // Start not editing by default to avoid unnecessary immediate state transitions in tests
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(derivedContent);

  const handleFormatToggle = () => {
    const newFormat = currentFormat === 0 ? 1 : 0;
    setCurrentFormat(newFormat);
    onFormatChange?.(newFormat);
  };

  const handleSave = () => {
    onContentChange?.(editContent);
    setIsEditing(false);
  };

  return (
    <div>
      {/* ヘッダー */}
      <div>
        <div style={{ gap: '0.75rem' }}>
          <div style={{ gap: '0.75rem' }}>
            {/* 問題番号 */}
            <div style={{ alignItems: 'center', justifyContent: 'center' }}>
              {derivedNumber}
            </div>

            <div>
              <div style={{ alignItems: 'center', gap: '0.5rem' }}>
                <h3>大問{derivedNumber}</h3>
              </div>

              {/* 難易度セレクト + キーワード(共通コンポーネント / 表示専用） */}
              {canEdit ? (
                <QuestionMetaEdit
                  difficulty={derivedDifficulty}
                  difficultyOptions={difficultyOptions}
                  keywords={derivedKeywords}
                  onDifficultyChange={onDifficultyChange}
                  onKeywordAdd={onKeywordAdd}
                  onKeywordRemove={onKeywordRemove}
                />
              ) : (
                <QuestionMetaView difficulty={derivedDifficulty} difficultyLabels={difficultyLabels as any} keywords={derivedKeywords} />
              )}

              {/* コンテンツ */}
              {viewMode === 'full' && (
                <QuestionForm
                  value={isEditing ? editContent : derivedContent}
                  format={currentFormat}
                  onChange={(v) => {
                    setEditContent(v);
                    onContentChange?.(v);
                  }}
                  onFormatChange={(f) => {
                    setCurrentFormat(f);
                    onFormatChange?.(f);
                  }}
                  readOnly={!canEdit}
                  textareaLabel="問題文"
                  previewLabel="プレビュー"
                />
              )}
            </div>
          </div>

          {/* 編集/削除ボタン */}
          {canEdit && (
            <div style={{ gap: '0.5rem' }}>
              {onDelete && (
                <button onClick={onDelete} title="削除">
                  <Trash2 />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
