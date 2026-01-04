import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGenerationStore } from '@/features/generation/stores/generationStore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';

interface GeneratedProblem {
  id: string;
  title: string;
  content: string;
  answer: string;
  explanation: string;
  difficulty: string;
  subject: string;
}

export function ResultEditor() {
  const { setPhase, options, generatedProblems, reset } = useGenerationStore();
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<GeneratedProblem>>({});

  const handleEdit = (problem: GeneratedProblem) => {
    setEditingId(problem.id);
    setEditData(problem);
  };

  const handleSaveEdit = () => {
    // TODO: Save edited problem to store
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    // TODO: Remove problem from store
  };

  const handlePublish = async () => {
    // TODO: Call API to save generated problems
    console.log('Publishing problems...', generatedProblems);
    reset();
    setPhase('start');
  };

  return (
    <Stack spacing={3}>
      {/* ヘッダー */}
      <Box>
        <Typography variant="h6">{t('problemCreate.resultEditor.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('problemCreate.resultEditor.summary', { count: generatedProblems?.length || 0 })}
        </Typography>
      </Box>

      {/* 問題リスト */}
      <Stack spacing={2}>
        {generatedProblems && generatedProblems.length > 0 ? (
          generatedProblems.map((problem: GeneratedProblem, index: number) => (
            <Card key={problem.id || index}>
              <CardHeader
                title={`問題 ${index + 1}: ${problem.title}`}
                subheader={
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label={problem.subject} size="small" />
                    <Chip
                      label={(() => {
                        const raw = problem.difficulty;
                        const keys = ['auto','basic','standard','advanced','expert'];
                        let key = keys.find(k => k === raw);
                        if (!key) {
                          key = keys.find(k => t(`enum.difficulty.${k}`) === raw);
                        }
                        return key ? t(`enum.difficulty.${key}`) : raw || '';
                      })()}
                      size="small"
                      color={(() => {
                        const raw = problem.difficulty;
                        const keys = ['auto','basic','standard','advanced','expert'];
                        const key = keys.find(k => k === raw) || keys.find(k => t(`enum.difficulty.${k}`) === raw);
                        if (key === 'advanced' || key === 'expert') return 'error';
                        if (key === 'standard') return 'warning';
                        return 'default';
                      })()}
                    />
                  </Stack>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      問題文
                    </Typography>
                    <Typography variant="body2">{problem.content}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      解答
                    </Typography>
                    <Typography variant="body2">{problem.answer}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      解説
                    </Typography>
                    <Typography variant="body2">{problem.explanation}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(problem)}
                    >
                      編集
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(problem.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            生成される問題はまだありません。
          </Typography>
        )}
      </Stack>

      {/* アクションボタン */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => setPhase('start')}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" endIcon={<PublishIcon />} onClick={handlePublish}>
          {t('problemCreate.resultEditor.publish')}
        </Button>
      </Stack>

      {/* 編集ダイアログ */}
      <Dialog open={editingId !== null} onClose={() => setEditingId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>問題を編集</DialogTitle>
        <DialogContent sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="edit-title-input"
            label={t('problemCreate.resultEditor.dialog.title')}
            fullWidth
            value={editData.title || ''}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          />
          <TextField
            id="edit-content-input"
            label={t('problemCreate.resultEditor.dialog.content')}
            fullWidth
            multiline
            rows={4}
            value={editData.content || ''}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
          />
          <TextField
            id="edit-answer-input"
            label={t('problemCreate.resultEditor.dialog.answer')}
            fullWidth
            multiline
            rows={2}
            value={editData.answer || ''}
            onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
          />
          <TextField
            id="edit-explanation-input"
            label={t('problemCreate.resultEditor.dialog.explanation')}
            fullWidth
            multiline
            rows={3}
            value={editData.explanation || ''}
            onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingId(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEdit}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
