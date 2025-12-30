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
} from '@mui/material';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useGenerationStore, GenerationMode, UploadedFile } from '@/features/generation/stores/generationStore';

/**
 * 生成開始フェーズ (Generation Start)
 * - モード選択（演習問題から生成 / 資料から生成）
 * - ファイルアップロード/テキスト入力
 * - 生成元別のオプション設定
 */
export function StartPhase() {
  const { mode, setMode, file, setFile, inputText, setInputText, options, setOptions, setPhase } =
    useGenerationStore();

  const [dragActive, setDragActive] = useState(false);

  // ファイルドラッグ・ドロップハンドラ
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile({
        name: droppedFile.name,
        size: droppedFile.size,
        type: droppedFile.type,
        file: droppedFile,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        file: selectedFile,
      });
    }
  };

  const handleStart = () => {
    if (!file && !inputText) {
      alert('ファイルまたはテキストを入力してください');
      return;
    }
    setPhase('analyzing');
  };

  return (
    <Stack spacing={3}>
      {/* モード選択 */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            生成元を選択
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, newMode: GenerationMode) => {
              if (newMode) setMode(newMode);
            }}
            fullWidth
          >
            <ToggleButton value="exercise">演習問題から生成</ToggleButton>
            <ToggleButton value="document">資料から生成</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {/* ファイルアップロード */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            ファイルをアップロード
          </Typography>

          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'divider',
              borderRadius: 2,
              padding: 3,
              textAlign: 'center',
              backgroundColor: dragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.3s',
              mb: 2,
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              ファイルをドラッグ＆ドロップ、またはクリックして選択
            </Typography>
            <input
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
              accept=".pdf,.txt,.docx"
            />
            <Button
              component="label"
              htmlFor="file-input"
              variant="outlined"
              size="small"
            >
              ファイルを選択
            </Button>
          </Box>

          {file && (
            <Box sx={{ p: 2, backgroundColor: 'success.light', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2">
                ✓ アップロード済み: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={() => setFile(null)}
                sx={{ mt: 1 }}
              >
                削除
              </Button>
            </Box>
          )}

          {/* テキスト直接入力 */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="またはテキストで直接入力"
            placeholder="講義資料のテキストを貼り付けてください"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!!file}
          />
        </CardContent>
      </Card>

      {/* 生成元別オプション */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            生成設定
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
              label="図表を使用する"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={options.checkStructure ?? false}
                  onChange={(e) => setOptions({ checkStructure: e.target.checked })}
                />
              }
              label="問題構造を確認（確認画面を表示）"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={options.isPublic ?? false}
                  onChange={(e) => setOptions({ isPublic: e.target.checked })}
                />
              }
              label="生成問題を公開する"
            />

            {/* 難易度選択（共通） */}
            <FormControl fullWidth>
              <InputLabel>難易度</InputLabel>
              <Select
                label="難易度"
                value={options.difficulty || 'auto'}
                onChange={(e) => setOptions({ difficulty: e.target.value as any })}
              >
                <MenuItem value="auto">自動判別</MenuItem>
                <MenuItem value="basic">基礎</MenuItem>
                <MenuItem value="standard">標準</MenuItem>
                <MenuItem value="advanced">応用</MenuItem>
                <MenuItem value="expert">難関</MenuItem>
              </Select>
            </FormControl>

            {/* 資料から生成時のみ */}
            {mode === 'document' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>問題数</InputLabel>
                  <Select
                    label="問題数"
                    value={options.count || 10}
                    onChange={(e) => setOptions({ count: parseInt(e.target.value as string) })}
                  >
                    {[5, 10, 15, 20].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}問
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
                    label="問題形式を自動設定"
                  />

                  {!(options.autoFormat ?? true) && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>問題形式を個別指定</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          {['記述式', '選択式', '穴埋め式', '正誤判定', '数値計算式', '証明問題'].map(
                            (format) => (
                              <FormControlLabel
                                key={format}
                                control={
                                  <Checkbox
                                    checked={options.formats?.includes(format) ?? false}
                                    onChange={(e) => {
                                      const newFormats = e.target.checked
                                        ? [...(options.formats || []), format]
                                        : (options.formats || []).filter((f) => f !== format);
                                      setOptions({ formats: newFormats });
                                    }}
                                  />
                                }
                                label={format}
                              />
                            )
                          )}
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
          生成開始
        </Button>
      </Stack>
    </Stack>
  );
}
