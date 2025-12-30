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
        <Typography variant="h6">生成された演習問題</Typography>
        <Typography variant="body2" color="text.secondary">
          合計 {generatedProblems?.length || 0} 問の演習問題が生成されました。
          必要に応じて編集してから公開してください。
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
                      label={problem.difficulty}
                      size="small"
                      color={
                        problem.difficulty === '応用' || problem.difficulty === '難関'
                          ? 'error'
                          : problem.difficulty === '標準'
                            ? 'warning'
                            : 'default'
                      }
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
                      削除
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
          戻る
        </Button>
        <Button variant="contained" endIcon={<PublishIcon />} onClick={handlePublish}>
          公開する
        </Button>
      </Stack>

      {/* 編集ダイアログ */}
      <Dialog open={editingId !== null} onClose={() => setEditingId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>問題を編集</DialogTitle>
        <DialogContent sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="タイトル"
            fullWidth
            value={editData.title || ''}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          />
          <TextField
            label="問題文"
            fullWidth
            multiline
            rows={4}
            value={editData.content || ''}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
          />
          <TextField
            label="解答"
            fullWidth
            multiline
            rows={2}
            value={editData.answer || ''}
            onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
          />
          <TextField
            label="解説"
            fullWidth
            multiline
            rows={3}
            value={editData.explanation || ''}
            onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingId(null)}>キャンセル</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEdit}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
