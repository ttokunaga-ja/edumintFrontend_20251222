import React, { useState } from 'react';
import { Box, TextField, Chip, Stack, Typography, Autocomplete } from '@mui/material';

export interface KeywordInputProps {
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
  /** チップのみを表示するか（入力フォームを非表示） */
  showChipsOnly?: boolean;
  /** キーワードチップを非表示にする（入力フォームのみ表示） */
  hideChips?: boolean;
}

/**
 * キーワード入力コンポーネント
 * 
 * - 1行目: オートコンプリート付きキーワード入力フォーム
 * - 2行目: 既存キーワードをChipで表示（削除可能）
 * 
 * hideChips={true} を渡すと入力フォームのみを表示します
 * 親コンポーネント側でキーワードチップを別途管理する場合に使用します
 */
export const KeywordInput: React.FC<KeywordInputProps> = ({
  keywords = [],
  onAdd,
  onRemove,
  label = 'キーワード',
  readOnly = false,
  disabled = false,
  inputId,
  showHelperText = false,
  showChipsOnly = false,
  hideChips = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const generatedId = React.useId();
  const actualId = inputId || `keyword-input-${generatedId}`;

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* 入力フォーム（チップのみモードでない場合） */}
      {!showChipsOnly && !readOnly && (
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
              placeholder="キーワードを入力..."
              size="small"
              variant="outlined"
              onKeyPress={handleKeyPress}
            />
          )}
        />
      )}

      {/* キーワードチップ表示（hideChips={true}の場合は非表示） */}
      {keywords.length > 0 && !hideChips && (
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
      {keywords.length === 0 && !showChipsOnly && !readOnly && (
        <Typography variant="caption" color="textSecondary">
          キーワードはまだ追加されていません
        </Typography>
      )}
    </Box>
  );
};

export default KeywordInput;
