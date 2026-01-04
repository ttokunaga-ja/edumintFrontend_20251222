import type { FC } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { QuestionEditorPreview } from '@/components/common/editors';
import { ProblemTypeViewProps } from '@/types/problemTypes';

/**
 * SQ4_Matching
 * ID 4: マッチング（組み合わせ問題）
 * 
 * 機能:
 * - ペアを左右で表示（問題文はSubQuestionBlockContentで表示済み）
 * - QuestionEditorPreviewで両側のテキスト描画
 * - showAnswer時にペアをハイライト
 * 
 * Moodleの実装を参考にした簡潔な設計
 */
export const SQ4_Matching: FC<ProblemTypeViewProps & {
  pairs?: Array<{ id: string; question: string; answer: string }>;
  mode?: 'preview' | 'edit';
}> = ({
  pairs = [],
  showAnswer = false,
  mode = 'preview',
}) => {
  return (
    <Box>
      {pairs.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {pairs.map((pair) => (
            <Card 
              key={pair.id} 
              variant="outlined" 
              sx={{ 
                bgcolor: showAnswer ? 'success.light' : 'background.paper',
                borderColor: showAnswer ? 'success.main' : 'divider',
                borderWidth: showAnswer ? 2 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Grid container spacing={2} alignItems="flex-start">
                  {/* 左側（問題） */}
                  <Grid item xs={12} sm={5}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        問
                      </Typography>
                      <QuestionEditorPreview
                        value={pair.question}
                        onChange={() => {}}
                        previewDisabled={false}
                        mode="preview"
                        minEditorHeight={40}
                        minPreviewHeight={40}
                      />
                    </Box>
                  </Grid>

                  {/* 接続部 */}
                  <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 40 }}>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      ↔
                    </Typography>
                  </Grid>

                  {/* 右側（答え） */}
                  <Grid item xs={12} sm={5}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        答
                      </Typography>
                      <QuestionEditorPreview
                        value={pair.answer}
                        onChange={() => {}}
                        previewDisabled={false}
                        mode="preview"
                        minEditorHeight={40}
                        minPreviewHeight={40}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {showAnswer && (
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold', mt: 1, display: 'block' }}>
                    ✓ 正解
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SQ4_Matching;
