import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DIFFICULTY_OPTIONS, COUNT_OPTIONS, PROBLEM_FORMAT_OPTIONS } from '@/features/ui/selectionOptions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import { useGenerationStore, GenerationMode, UploadedFile } from '@/features/generation/stores/generationStore';

/**
 * 生成開始フェーズ (Generation Start)
 * - モード選択（演習問題から生成 / 資料から生成）
 * - ファイルアップロード/テキスト入力（複数ファイル対応）
 * - 生成元別のオプション設定
 * - クライアント側バリデーション（ファイルサイズ、拡張子、テキスト長）
 */
export function StartPhase() {
  const { mode, setMode, files, setFiles, addFiles, removeFile, inputText, setInputText, options, setOptions, setPhase } =
    useGenerationStore();
  const { t } = useTranslation();

  const [error, setError] = useState<string>('');
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  // バリデーション定数
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB total
  const MAX_TEXT_LENGTH = 5000;
  const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.docx', '.doc'];

  // ファイル合計サイズ計算
  const totalFileSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalFileSizeInMB = (totalFileSize / (1024 * 1024)).toFixed(2);

  // react-dropzone hook
  const onDrop = (acceptedFiles: File[]) => {
    setError('');
    setFileErrors([]);
    const newErrors: string[] = [];
    const validFiles: UploadedFile[] = [];

    // 個別ファイルのバリデーション
    for (const file of acceptedFiles) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        newErrors.push(`${file.name}: 無効なファイル形式です (PDF, TXT, DOCX のみ)`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 個別ファイルは10MB以下
        newErrors.push(`${file.name}: ファイルサイズが大きすぎます (最大 10MB)`);
        continue;
      }

      validFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    }

    // 合計サイズチェック
    const newTotalSize = totalFileSize + validFiles.reduce((sum, f) => sum + f.size, 0);
    if (newTotalSize > MAX_FILE_SIZE) {
      newErrors.push(`ファイル合計サイズが大きすぎます (最大 20MB、現在: ${(newTotalSize / (1024 * 1024)).toFixed(2)}MB)`);
    }

    if (newErrors.length > 0) {
      setFileErrors(newErrors);
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_TEXT_LENGTH) {
      setInputText(text);
      setError('');
    } else {
      setError(`テキストは${MAX_TEXT_LENGTH}字以内である必要があります`);
    }
  };

  const handleStart = () => {
    setError('');

    // どちらも空の場合のみエラー
    if (files.length === 0 && !inputText.trim()) {
      setError('ファイルまたはテキストを入力してください');
      return;
    }

    if (totalFileSize > MAX_FILE_SIZE) {
      setError(`ファイル合計サイズが大きすぎます (最大 20MB)`);
      return;
    }

    if (inputText && inputText.length > MAX_TEXT_LENGTH) {
      setError(`テキストは${MAX_TEXT_LENGTH}字以内である必要があります`);
      return;
    }

    // バリデーション成功時は次フェーズへ（実際にはここでAPI呼び出しが必要だが、フェーズ遷移をトリガーとする）
    setPhase('analyzing');

    // Mock: Simulate generation process
    // In a real implementation, this would be handled by a saga or effect reacting to the phase change
    setTimeout(() => {
      setPhase('structure_confirmed');
    }, 2000);
  };

  return (
    <Stack spacing={3}>
      {/* エラー表示 */}
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {fileErrors.length > 0 && (
        <Alert severity="warning" onClose={() => setFileErrors([])}>
          <Box>
            {fileErrors.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </Box>
        </Alert>
      )}

      {/* モード選択 */}
      <Card>
        <CardContent>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, newMode: GenerationMode) => {
              if (newMode) setMode(newMode);
            }}
            fullWidth
          >
            <ToggleButton value="exercise">{t('problemCreate.startPhase.mode.exercise')}</ToggleButton>
            <ToggleButton value="document">{t('problemCreate.startPhase.mode.document')}</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {/* ファイルアップロード & テキスト入力 */}
      <Card>
        <CardContent>
          {/* ドラッグ＆ドロップエリア */}
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              borderRadius: 2,
              padding: 3,
              textAlign: 'center',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.3s',
              mb: 2,
            }}
          >
            <input {...getInputProps({ id: 'generation-file-input', name: 'generationFiles' })} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              {isDragActive ? t('problemCreate.startPhase.drop_here') : t('problemCreate.startPhase.drag_drop_or_click')}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
              {t('problemCreate.startPhase.accepted_formats')}
            </Typography>
            <Button variant="outlined" size="small">
              {t('problemCreate.startPhase.select_files')}
            </Button>
          </Box>

          {/* アップロード済みファイル一覧 */}
          {files.length > 0 && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                アップロード済みファイル ({files.length}個 / 合計 {totalFileSizeInMB}MB)
              </Typography>
              <Stack spacing={1}>
                {files.map((file) => (
                  <Box
                    key={file.name}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      backgroundColor: 'background.paper',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2">{file.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => removeFile(file.name)}
                    >
                      {t('common.delete')}
                    </Button>
                  </Box>
                ))}
              </Stack>

              {totalFileSize > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">ファイルサイズ容量</Typography>
                    <Typography variant="caption">
                      {totalFileSizeInMB}MB / 20MB
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(totalFileSize / MAX_FILE_SIZE) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      backgroundColor: 'action.hover',
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* テキスト直接入力 */}
          <Box>
            <TextField
              id="generation-input-text"
              fullWidth
              multiline
              rows={5}
              label="またはテキストで直接入力"
              placeholder="講義資料のテキストを貼り付けてください"
              value={inputText}
              onChange={handleTextChange}
              // ファイルが存在しても入力可能に変更
              helperText={`${inputText.length} / ${MAX_TEXT_LENGTH}字`}
              sx={{
                '& .MuiOutlinedInput-root.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* 生成元別オプション */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {t('problemCreate.startPhase.settings')}
          </Typography>

          <Stack spacing={2}>
            {/* 共通オプション */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeCharts ?? true}
                  onChange={(e) => setOptions({ includeCharts: e.target.checked })}
                />
              }
              label={t('problemCreate.startPhase.options.includeCharts')}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={options.checkStructure ?? false}
                  onChange={(e) => setOptions({ checkStructure: e.target.checked })}
                />
              }
              label={t('problem.confirm_structure')}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={options.isPublic ?? true}
                  onChange={(e) => setOptions({ isPublic: e.target.checked })}
                />
              }
              label={t('problemCreate.startPhase.options.autoPublish')}
            />

            {/* 難易度選択（共通） */}
            <FormControl fullWidth>
              <InputLabel>{t('problemCreate.startPhase.labels.difficulty')}</InputLabel>
              <Select
                label={t('problemCreate.startPhase.labels.difficulty')}
                value={options.difficulty || 'auto'}
                onChange={(e) => setOptions({ difficulty: e.target.value as any })}
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 資料から生成時のみ */}
            {mode === 'document' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>{t('problemCreate.startPhase.labels.count')}</InputLabel>
                  <Select
                    label={t('problemCreate.startPhase.labels.count')}
                    value={options.count || 10}
                    onChange={(e) => setOptions({ count: parseInt(e.target.value as string) })}
                  >
                    {COUNT_OPTIONS.map((num) => (
                      <MenuItem key={num} value={num}>
                        {t('common.question_count', { count: num })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 問題形式設定 */}
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={options.autoFormat ?? true}
                        onChange={(e) => setOptions({ autoFormat: e.target.checked })}
                      />
                    }
                    label={t('problemCreate.startPhase.options.autoFormat')}
                  />

                  {!(options.autoFormat ?? true) && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{t('problemCreate.startPhase.options.customizeFormats')}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
{PROBLEM_FORMAT_OPTIONS.map((fmt) => (
                            <FormControlLabel
                              key={fmt.id}
                              control={
                                <Checkbox
                                  checked={options.formats?.includes(fmt.value) ?? false}
                                  onChange={(e) => {
                                    const newFormats = e.target.checked
                                      ? [...(options.formats || []), fmt.value]
                                      : (options.formats || []).filter((f) => f !== fmt.value);
                                    setOptions({ formats: newFormats });
                                  }}
                                />
                              }
                              label={t(fmt.labelKey)}
                            />
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <Stack direction="row" spacing={2}>
        <Button variant="contained" size="large" fullWidth onClick={handleStart}>
          {t('problemCreate.startPhase.start')}
        </Button>
      </Stack>
    </Stack>
  );
}
