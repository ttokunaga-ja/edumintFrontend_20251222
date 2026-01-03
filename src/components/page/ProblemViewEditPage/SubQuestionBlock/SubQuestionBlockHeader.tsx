import React from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface SubQuestionBlockHeaderProps {
  subQuestionNumber: number;
  questionTypeLabel: string;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * SubQuestionBlock のヘッダーコンポーネント
 * 
 * 小問番号 + タイプ表示 + アクションボタン
 */
export const SubQuestionBlockHeader: React.FC<SubQuestionBlockHeaderProps> = ({
  subQuestionNumber,
  questionTypeLabel,
  canEdit = false,
  onEdit,
  onDelete,
}) => {
  return (
    <Stack direction='row' alignItems='flex-start' spacing={2}>
      {/* Sub Question Number Circle */}
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.875rem',
        }}
      >
        {subQuestionNumber}
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='subtitle2'>小問{subQuestionNumber}</Typography>
          <Typography variant='caption' sx={{ bgcolor: 'action.selected', px: 1, borderRadius: 1 }}>
            {questionTypeLabel}
          </Typography>
        </Stack>
      </Box>

      {canEdit && (
        <Stack direction='row' spacing={1}>
          {onEdit && (
            <IconButton id={`edit-sub-q-${subQuestionNumber}`} onClick={onEdit} size='small' aria-label={`Edit sub-question ${subQuestionNumber}`}>
              <EditIcon fontSize='small' />
            </IconButton>
          )}
          {onDelete && (
            <IconButton id={`delete-sub-q-${subQuestionNumber}`} onClick={onDelete} size='small' color='error' aria-label={`Delete sub-question ${subQuestionNumber}`}>
              <DeleteIcon fontSize='small' />
            </IconButton>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default SubQuestionBlockHeader;
