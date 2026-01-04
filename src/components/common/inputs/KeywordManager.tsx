import React, { useState } from 'react';
import { Box, TextField, Chip, Stack, Typography, Autocomplete } from '@mui/material';

export interface KeywordManagerProps {
  /** 既存のキーワード */
  keywords?: Array<{ id: string; keyword: string }>;
  /** キーワード追加時のコールバック */
  onAdd?: (keyword: string) => void;
  /** キーワード削除時のコールバック */
  onRemove?: (keywordId: string) => void;
  /** ラベル */
  label?: string;
  /** 読み取り専用モード */
  readOnly?: boolean;
  disabled?: boolean;
  /** 入力フィールドの一意な ID */
  inputId?: string;
  /** ヘルパーテキストを表示するか */
  showHelperText?: boolean;
}

/**
 * KeywordManager
 * 
 * キーワードの統合管理コンポーネント
 * 入力フォーム、オートコンプリート、チップ表示、削除機能をすべて管理
 * 
 * レイアウト:
 * Row 1: [オートコンプリート付きキーワード入力フォーム]
 * Row 2: [既存キーワードをChipで表示（削除可能）]
 * 
 * 機能:
 * - オートコンプリート付き入力フォーム（既存キーワードをサジェスト）
 * - Enter キーでキーワードを追加
 * - Chip のX ボタンでキーワードを削除
 * - 読み取り専用・無効化モード対応
 */
export const KeywordManager: FC<KeywordManagerProps> = ({
  keywords = [],
  onAdd,
  onRemove,
  label = 'キーワード',
  readOnly = false,
  disabled = false,
  inputId,
  showHelperText = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const generatedId = React.useId();
  const actualId = inputId || `keyword-manager-${generatedId}`;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !readOnly && !disabled) {
      e.preventDefault();
      onAdd?.(inputValue.trim());
      setInputValue('');
    }
  };

  const handleDelete = (keywordId: string) => {
    onRemove?.(keywordId);
  };

  // 既存キーワードのリスト（オートコンプリート用）
  const existingKeywords = keywords.map(kw => kw.keyword);

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {/* Row 1: オートコンプリート付きキーワード入力フォーム */}
      {!readOnly && (
        <Autocomplete
          freeSolo
          options={existingKeywords}
          inputValue={inputValue}
          onInputChange={(event, value) => setInputValue(value)}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              id={actualId}
              name={actualId}
              label={label}
              placeholder="キーワードを入力... (Enter で追加)"
              size="small"
              variant="outlined"
              onKeyPress={handleKeyPress}
            />
          )}
        />
      )}

      {/* Row 2: キーワードチップ表示 + 削除機能 */}
      {keywords.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {keywords.map((kw) => (
            <Chip
              key={kw.id}
              label={kw.keyword}
              onDelete={readOnly || disabled ? undefined : () => handleDelete(kw.id)}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      )}

      {/* 空状態メッセージ */}
      {keywords.length === 0 && !readOnly && showHelperText && (
        <Typography variant="caption" color="textSecondary">
          キーワードはまだ追加されていません
        </Typography>
      )}
    </Stack>
  );
};

export default KeywordManager;
