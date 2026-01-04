import React, { useCallback } from 'react';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Option {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface OptionListEditorProps {
  options: Option[];
  onChange?: (options: Option[]) => void;
}

/**
 * 選択肢管理用共通コンポーネント
 * 
 * 選択肢の追加・削除・正解設定
 */
export const OptionListEditor: FC<OptionListEditorProps> = ({
  options,
  onChange,
}) => {
  const newOptionId = useCallback(() => `opt-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, []);

  const updateOptions = (next: Option[]) => {
    onChange?.(next);
  };

  const handleOptionChange = (index: number, patch: Partial<Option>) => {
    const next = options.map((opt, idx) => (idx === index ? { ...opt, ...patch } : opt));
    updateOptions(next);
  };

  const handleAddOption = () => {
    const created = { id: newOptionId(), content: '', isCorrect: false };
    updateOptions([...options, created]);
  };

  const handleRemoveOption = (index: number) => {
    const next = options.filter((_, idx) => idx !== index);
    updateOptions(next);
  };

  return (
    <Stack spacing={2}>
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Typography variant='subtitle2' sx={{ fontWeight: 'bold' }}>
          選択肢
        </Typography>
        <Button
          size='small'
          startIcon={<AddIcon />}
          onClick={handleAddOption}
        >
          追加
        </Button>
      </Stack>

      {options.length === 0 ? (
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            まだ選択肢がありません。追加してください。
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {options.map((opt, idx) => (
            <Stack
              key={opt.id || idx}
              direction='row'
              spacing={1}
              alignItems='center'
            >
              {/* Correct/Incorrect Toggle */}
              <Button
                size='small'
                variant={opt.isCorrect ? 'contained' : 'outlined'}
                onClick={() => handleOptionChange(idx, { isCorrect: !opt.isCorrect })}
                sx={{ minWidth: 40 }}
              >
                {opt.isCorrect ? '✔' : '□'}
              </Button>

              {/* Option Label */}
              <Typography sx={{ minWidth: 40 }}>
                {String.fromCharCode(65 + idx)}.
              </Typography>

              {/* Option Input */}
              <TextField
                fullWidth
                size='small'
                value={opt.content}
                onChange={(e) => handleOptionChange(idx, { content: e.target.value })}
                placeholder={`選択肢 ${String.fromCharCode(65 + idx)}`}
              />

              {/* Delete Button */}
              <IconButton
                size='small'
                onClick={() => handleRemoveOption(idx)}
                color='error'
              >
                <DeleteIcon fontSize='small' />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default OptionListEditor;
