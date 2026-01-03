import React from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export interface QuestionBlockHeaderProps {
  questionNumber: number;
  canEdit?: boolean;
  onDelete?: () => void;
}

/**
 * QuestionBlock のヘッダーコンポーネント
 * 
 * 質問番号と削除ボタンを表示
 */
export const QuestionBlockHeader: React.FC<QuestionBlockHeaderProps> = ({
  questionNumber,
  canEdit = false,
  onDelete,
}) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '4px',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
        }}
      >
        {questionNumber}
      </Box>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        大問{questionNumber}
      </Typography>

      {/* Delete Button */}
      {canEdit && onDelete && (
        <IconButton id={`delete-question-${questionNumber}`} onClick={onDelete} color="error" size="small" aria-label={`Delete question ${questionNumber}`}>
          <DeleteIcon />
        </IconButton>
      )}
    </Stack>
  );
};

export default QuestionBlockHeader;
