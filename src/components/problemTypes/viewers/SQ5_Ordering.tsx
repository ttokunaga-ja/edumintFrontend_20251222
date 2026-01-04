import type { FC } from 'react';
import { Box, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { QuestionEditorPreview } from '@/components/common/editors';
import { ProblemTypeViewProps } from '@/types/problemTypes';

/**
 * SQ5_Ordering
 * ID 5: 順序並べ替え（シーケンス問題）
 * 
 * 機能:
 * - 正しい順序のアイテムを表示（問題文はSubQuestionBlockContentで表示済み）
 * - 順序番号をChipで表示
 * - QuestionEditorPreviewで各アイテムの描画
 * - showAnswer時に正しい順序をハイライト
 * 
 * Moodleの実装を参考にした簡潔な設計
 */
export const SQ5_Ordering: FC<ProblemTypeViewProps & {
  items?: Array<{ id: string; text: string; correctOrder: number }>;
  mode?: 'preview' | 'edit';
}> = ({
  items = [],
  showAnswer = false,
  mode = 'preview',
}) => {
  // 正しい順序でソート
  const sortedItems = [...items].sort((a, b) => a.correctOrder - b.correctOrder);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {sortedItems.length > 0 && sortedItems.map((item) => (
        <Card 
          key={item.id} 
          variant="outlined" 
          sx={{ 
            bgcolor: showAnswer ? 'success.light' : 'background.paper',
            borderColor: showAnswer ? 'success.main' : 'divider',
            borderWidth: showAnswer ? 2 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {/* 順序番号 */}
              <Chip
                label={`${item.correctOrder}`}
                color={showAnswer ? 'success' : 'default'}
                variant="filled"
                sx={{ 
                  fontWeight: 'bold',
                  minWidth: '40px',
                  justifyContent: 'center',
                  mt: 0.25,
                  fontSize: '1rem',
                }}
              />

              {/* テキスト内容 */}
              <Box sx={{ flex: 1 }}>
                <QuestionEditorPreview
                  value={item.text}
                  onChange={() => {}}
                  previewDisabled={false}
                  mode="preview"
                  minEditorHeight={40}
                  minPreviewHeight={40}
                />
              </Box>

              {/* 正解表示 */}
              {showAnswer && (
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold', mt: 0.5 }}>
                  ✓
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default SQ5_Ordering;
