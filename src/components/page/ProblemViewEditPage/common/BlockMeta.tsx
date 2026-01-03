import React from 'react';
import { Box, Stack, Chip, IconButton, SelectChangeEvent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeywordManager from '@/components/common/inputs/KeywordManager';

export interface BlockMetaProps {
  level: 'major' | 'minor'; // 大門 or 小門
  metaType: 'difficulty' | 'questionType'; // メタデータタイプ
  metaValue: number; // 難易度ID or 問題形式ID
  metaOptions: Array<{ value: number; label: string }>; // プルダウンオプション（必須）
  metaLabel?: string; // メタラベル（preview時に表示）
  metaLabels?: Record<number, { label: string; color: string }>; // カラー定義（preview時に使用）
  keywords: Array<{ id: string; keyword: string }>;
  mode?: 'preview' | 'edit'; // 'preview' = view, 'edit' = edit
  canEdit?: boolean; // 削除ボタンの表示制御
  onMetaChange?: (event: SelectChangeEvent<unknown>) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  onDelete?: () => void; // 削除ボタンコールバック
  id?: string;
}

/**
 * BlockMeta
 * 
 * 2セクション分割レイアウト（左固定幅 | 右可変幅）
 * ※ 図形内番号は親コンポーネント（BlockHeader）で表示済み、BlockMetaはその直後に配置
 * 
 * 左セクション（幅150px固定）：
 *   Row 1: [難易度/問題形式]（Editモード:プルダウン、Viewモード:チップ）
 *   Row 2: [削除ボタン]（Editモードのみ表示）
 * 
 * 右セクション（可変幅）：
 *   Row 1: [キーワード入力フォーム]（Editモードのみ表示）
 *   Row 2: [キーワードチップ]（Editモード時は×で削除可能）
 */
export const BlockMeta: React.FC<BlockMetaProps> = ({
  level,
  metaType,
  metaValue,
  metaLabel,
  metaOptions,
  metaLabels = {},
  keywords = [],
  mode = 'preview',
  canEdit = false,
  onMetaChange,
  onKeywordAdd,
  onKeywordRemove,
  onDelete,
  id,
}) => {
  const isEditMode = mode === 'edit';
  const isMajor = level === 'major';
  
  // Preview モード時のメタラベルを取得
  const metaMeta = isMajor ? metaLabels[metaValue] : undefined;

  // Select 要素の ID とラベルID を生成
  const generatedId = React.useId();
  const selectId = id ? `${id}-meta` : `meta-select-${generatedId}`;
  const labelId = `${selectId}-label`;

  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      {/* ====== 左セクション（固定幅150px） ====== */}
      <Box sx={{ width: '150px', flexShrink: 0 }}>
        <Stack spacing={1}>
          {/* 左セクション Row 1: プルダウン or チップ */}
          <Box>
            {isEditMode ? (
              // Edit: Show dropdown
              <FormControl size="small" fullWidth>
                <InputLabel id={labelId}>
                  {metaType === 'difficulty' ? '難易度' : '問題形式'}
                </InputLabel>
                <Select
                  labelId={labelId}
                  id={selectId}
                  name={selectId}
                  value={metaValue}
                  onChange={onMetaChange}
                  label={metaType === 'difficulty' ? '難易度' : '問題形式'}
                  size="small"
                >
                  {metaOptions.map(({ value, label: labelText }) => (
                    <MenuItem key={value} value={value}>
                      {labelText}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              // Preview: Show chip
              isMajor && metaMeta ? (
                <Chip
                  label={metaMeta.label}
                  color={(metaMeta.color as any) || 'default'}
                  size="small"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label={metaLabel || '未設定'}
                  color="default"
                  size="small"
                  variant="outlined"
                />
              )
            )}
          </Box>

          {/* 左セクション Row 2: 削除ボタン（Editモードのみ） */}
          {isEditMode && canEdit && onDelete && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <IconButton
                size="small"
                color="error"
                onClick={onDelete}
                title={`この${level === 'major' ? '大' : '小'}問を削除します`}
                sx={{ padding: '4px' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Stack>
      </Box>

      {/* ====== 右セクション（可変幅） ====== */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack spacing={1}>
          {/* 右セクション Row 1: キーワード入力フォーム（Editモードのみ） */}
          {isEditMode && (
            <Box>
              <KeywordManager
                keywords={[]} // 入力フォームのみ（チップは下で表示）
                onAdd={onKeywordAdd}
                disabled={false}
                inputId={id ? `${id}-keywords` : undefined}
                showHelperText={false}
              />
            </Box>
          )}

          {/* 右セクション Row 2: キーワードチップ（Editモード時は×で削除可能） */}
          {keywords.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {keywords.map((kw) => (
                <Chip
                  key={kw.id}
                  label={kw.keyword}
                  size="small"
                  variant="outlined"
                  onDelete={isEditMode ? () => onKeywordRemove?.(kw.id) : undefined}
                />
              ))}
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default BlockMeta;
