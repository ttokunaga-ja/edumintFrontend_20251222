import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Divider,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '@/contexts/NotificationContext';
import { useProblemDetail, useUpdateProblem } from '@/features/content/hooks/useContent';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

/**
 * 問題詳細表示・編集ページ
 * 問題IDからデータを取得し、ViewモードとEditモードを切り替える
 */
export default function ProblemViewEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // API呼び出し
  const { data: problem, isLoading, error } = useProblemDetail(id || '');
  const updateMutation = useUpdateProblem(id || '');

  // UI状態
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 編集用フォームデータ
  const [editData, setEditData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  });

  // problemが取得されたら編集フォームを初期化
  useEffect(() => {
    if (problem) {
      setEditData({
        title: problem.title || '',
        content: problem.content || '',
        tags: problem.tags ? [...problem.tags] : [],
      });
      setRating(problem.rating || 0);
    }
  }, [problem]);

  const handleSaveEdit = async () => {
    if (!id) return;

    updateMutation.mutate(
      {
        id,
        ...editData,
      },
      {
        onSuccess: () => {
          setIsEditMode(false);
          addNotification('問題を更新しました', 'success', 3000);
        },
        onError: (err) => {
          console.error('Update failed:', err);
          addNotification('更新に失敗しました', 'error', 5000);
        },
      }
    );
  };

  const handleDeleteConfirm = async () => {
    // 削除API呼び出し（後で実装）
    console.log('Deleting problem:', id);
    setDeleteDialogOpen(false);
    addNotification('問題を削除しました', 'success', 3000);
    // 削除後はホームへ
    navigate('/');
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !problem) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 3 }}
          >
            戻る
          </Button>
          <Alert severity="error">
            {error
              ? 'データの取得に失敗しました'
              : '問題が見つかりません'}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* ヘッダー */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            variant="text"
          >
            戻る
          </Button>
          <Typography variant="h3" sx={{ flexGrow: 1 }}>
            {isEditMode ? '問題を編集' : '問題詳細'}
          </Typography>
        </Box>

        {/* メインカード */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {isEditMode ? (
              // 編集モード
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="タイトル"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />

                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="問題内容"
                  value={editData.content}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                />

                <Divider />

                <Box>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                    タグ
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {editData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => {
                          setEditData((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((t) => t !== tag),
                          }));
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* アクションボタン */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditMode(false)}
                    disabled={updateMutation.isPending}
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={
                      updateMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? '保存中...' : '保存'}
                  </Button>
                </Box>
              </Stack>
            ) : (
              // 表示モード
              <Stack spacing={3}>
                {/* タイトル & アクション */}
                <Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {problem.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {problem.examName && (
                          <Chip label={`試験: ${problem.examName}`} size="small" />
                        )}
                        {problem.subjectName && (
                          <Chip label={problem.subjectName} size="small" />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="large"
                        onClick={() => setIsFavorite(!isFavorite)}
                        color={isFavorite ? 'error' : 'default'}
                      >
                        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditMode(true)}
                      >
                        編集
                      </Button>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                {/* メタデータ */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                  {problem.rating && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        評価
                      </Typography>
                      <Rating value={rating} readOnly size="small" />
                    </Box>
                  )}
                  {problem.views && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        閲覧数
                      </Typography>
                      <Typography variant="body1">
                        {problem.views.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  {problem.likes && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        いいね
                      </Typography>
                      <Typography variant="body1">
                        {problem.likes.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  {problem.comments && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        コメント
                      </Typography>
                      <Typography variant="body1">
                        {problem.comments.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Divider />

                {/* 問題内容 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    問題内容
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                    }}
                  >
                    {problem.content}
                  </Typography>
                </Box>

                {/* タグ */}
                {problem.tags && problem.tags.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      タグ
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {problem.tags.map((tag) => (
                        <Chip key={tag} label={tag} variant="outlined" size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* 削除ボタン */}
                <Box sx={{ pt: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    削除
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>問題を削除しますか？</DialogTitle>
        <DialogContent>
          <Typography>
            「{problem.title}」を削除します。この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
