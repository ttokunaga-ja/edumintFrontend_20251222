import { useState, useId } from 'react';
import { Box, Stack, Typography, Button, IconButton, Collapse, Paper, TextField, Divider, Tooltip } from '@mui/material';
import { Edit, KeyboardArrowDown, KeyboardArrowUp, Lock, Description, Code } from '@mui/icons-material';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';
import ProblemTypeRegistry from '@/components/problemTypes/ProblemTypeRegistry';

export type AnswerBlockProps = {
    subQuestionNumber: number;
    answerContent: string;
    answerFormat: 0 | 1; // 0: markdown, 1: latex
    explanation?: string;
    explanationFormat?: 0 | 1;
    isLocked?: boolean; // 広告視聴前などでロックされているか
    canEdit?: boolean;
    canSwitchFormat?: boolean;
    defaultExpanded?: boolean;
    onAnswerChange?: (content: string) => void;
    onExplanationChange?: (content: string) => void;
    onFormatChange?: (type: 'answer' | 'explanation', format: 0 | 1) => void;
    onUnlock?: () => void;
    // For visual answer display
    questionTypeId?: number;
    options?: any[];
    pairs?: any[];
    items?: any[];
    answers?: any[];
};

export function AnswerBlock({
    subQuestionNumber,
    answerContent,
    answerFormat,
    explanation,
    explanationFormat = 0,
    isLocked = false,
    canEdit = false,
    canSwitchFormat = false,
    defaultExpanded = false,
    onAnswerChange,
    onExplanationChange,
    onFormatChange,
    onUnlock,
    questionTypeId,
    options,
    pairs,
    items,
    answers,
}: AnswerBlockProps) {
    const [currentAnswerFormat, setCurrentAnswerFormat] = useState<0 | 1>(answerFormat);
    const [currentExplanationFormat, setCurrentExplanationFormat] = useState<0 | 1>(explanationFormat);
    const [isEditingAnswer, setIsEditingAnswer] = useState(false);
    const [isEditingExplanation, setIsEditingExplanation] = useState(false);
    const [editAnswerContent, setEditAnswerContent] = useState(answerContent);
    const [editExplanationContent, setEditExplanationContent] = useState(explanation || '');
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const baseId = useId();
    const answerInputId = `${baseId}-answer-input`;
    const explanationInputId = `${baseId}-explanation-input`;

    const handleAnswerFormatToggle = () => {
        const newFormat = currentAnswerFormat === 0 ? 1 : 0;
        setCurrentAnswerFormat(newFormat);
        onFormatChange?.('answer', newFormat);
    };

    const handleExplanationFormatToggle = () => {
        const newFormat = currentExplanationFormat === 0 ? 1 : 0;
        setCurrentExplanationFormat(newFormat);
        onFormatChange?.('explanation', newFormat);
    };

    const handleAnswerSave = () => {
        onAnswerChange?.(editAnswerContent);
        setIsEditingAnswer(false);
    };

    const handleExplanationSave = () => {
        onExplanationChange?.(editExplanationContent);
        setIsEditingExplanation(false);
    };

    if (isLocked) {
        return (
            <Paper variant="outlined" sx={{ p: 4, bgcolor: 'grey.50' }}>
                <Stack alignItems="center" spacing={2}>
                    <Box sx={{ p: 2, bgcolor: 'grey.200', borderRadius: '50%' }}>
                        <Lock sx={{ color: 'grey.500', fontSize: 32 }} />
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold" gutterBottom>解答を見るには</Typography>
                        <Typography variant="body2" color="text.secondary">
                            30秒の動画広告を視聴してください
                        </Typography>
                    </Box>
                    {onUnlock && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onUnlock}
                            sx={{ borderRadius: 20, px: 4 }}
                        >
                            広告を見て解答を表示
                        </Button>
                    )}
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            {/* ヘッダー */}
            <Button
                onClick={() => setIsExpanded(!isExpanded)}
                fullWidth
                sx={{
                    justifyContent: 'space-between',
                    p: 2,
                    color: 'text.primary',
                    bgcolor: 'background.default',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    {isExpanded ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                    <Typography variant="subtitle1" fontWeight="medium">
                        ({subQuestionNumber}) の解答を{isExpanded ? '隠す' : '表示'}
                    </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    {isExpanded ? '▲' : '▼'}
                </Typography>
            </Button>

            {/* 解答コンテンツ */}
            <Collapse in={isExpanded}>
                <Box sx={{ p: 2 }}>
                    <Stack spacing={3}>
                        {/* Visual Answer for specific Types (1-5) */}
                        {questionTypeId && questionTypeId >= 1 && questionTypeId <= 5 && (
                            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 1, border: '1px solid #bbf7d0' }}>
                                <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 'bold', mb: 1 }}>
                                    正解
                                </Typography>
                                {(() => {
                                    const ViewComponent = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);
                                    if (!ViewComponent) return null;
                                    return (
                                        <div style={{ pointerEvents: 'none', opacity: 1 }}>
                                            <ViewComponent
                                                subQuestionNumber={subQuestionNumber}
                                                questionContent="" // Hide question text if possible
                                                options={options}
                                                pairs={pairs}
                                                items={items}
                                                answers={answers}
                                                showAnswer={true}
                                                canEdit={false}
                                            />
                                        </div>
                                    );
                                })()}
                            </Box>
                        )}
                        {/* 解答 (Text) */}
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">解答</Typography>
                                <Stack direction="row" spacing={1}>
                                    {canSwitchFormat && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleAnswerFormatToggle}
                                            startIcon={currentAnswerFormat === 0 ? <Description /> : <Code />}
                                            sx={{ textTransform: 'none', px: 1, minWidth: 0 }}
                                        >
                                            {currentAnswerFormat === 0 ? 'MD' : 'LaTeX'}
                                        </Button>
                                    )}
                                    {canEdit && (
                                        <Tooltip title="編集">
                                            <IconButton size="small" onClick={() => setIsEditingAnswer(true)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Stack>
                            </Stack>

                            {isEditingAnswer ? (
                                <Stack spacing={2}>
                                    <Box sx={{ position: 'relative' }}>
                                        <label htmlFor={answerInputId} style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
                                            解答を入力
                                        </label>
                                        <TextField
                                            id={answerInputId}
                                            name="answerContent"
                                            value={editAnswerContent}
                                            onChange={(e) => setEditAnswerContent(e.target.value)}
                                            multiline
                                            minRows={4}
                                            fullWidth
                                            placeholder={currentAnswerFormat === 0 ? 'Markdown形式で入力...' : 'LaTeX形式で入力...'}
                                            sx={{ fontFamily: 'monospace' }}
                                        />
                                    </Box>
                                    <Stack direction="row" justification="flex-end" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                setEditAnswerContent(answerContent);
                                                setIsEditingAnswer(false);
                                            }}
                                        >
                                            キャンセル
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleAnswerSave}
                                        >
                                            保存
                                        </Button>
                                    </Stack>
                                </Stack>
                            ) : (
                                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, minHeight: 50 }}>
                                    {currentAnswerFormat === 0 ? (
                                        <MarkdownBlock content={answerContent} />
                                    ) : (
                                        <LatexBlock content={answerContent} displayMode={false} />
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* 解説 */}
                        {explanation && (
                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">解説</Typography>
                                    <Stack direction="row" spacing={1}>
                                        {canSwitchFormat && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={handleExplanationFormatToggle}
                                                startIcon={currentExplanationFormat === 0 ? <Description /> : <Code />}
                                                sx={{ textTransform: 'none', px: 1, minWidth: 0 }}
                                            >
                                                {currentExplanationFormat === 0 ? 'MD' : 'LaTeX'}
                                            </Button>
                                        )}
                                        {canEdit && (
                                            <Tooltip title="編集">
                                                <IconButton size="small" onClick={() => setIsEditingExplanation(true)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </Stack>

                                {isEditingExplanation ? (
                                    <Stack spacing={2}>
                                        <Box sx={{ position: 'relative' }}>
                                            <label htmlFor={explanationInputId} style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
                                                解説を入力
                                            </label>
                                            <TextField
                                                id={explanationInputId}
                                                name="explanationContent"
                                                value={editExplanationContent}
                                                onChange={(e) => setEditExplanationContent(e.target.value)}
                                                multiline
                                                minRows={4}
                                                fullWidth
                                                placeholder={currentExplanationFormat === 0 ? 'Markdown形式で入力...' : 'LaTeX形式で入力...'}
                                                sx={{ fontFamily: 'monospace' }}
                                            />
                                        </Box>
                                        <Stack direction="row" justification="flex-end" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setEditExplanationContent(explanation);
                                                    setIsEditingExplanation(false);
                                                }}
                                            >
                                                キャンセル
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={handleExplanationSave}
                                            >
                                                保存
                                            </Button>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, minHeight: 50 }}>
                                        {currentExplanationFormat === 0 ? (
                                            <MarkdownBlock content={explanation} />
                                        ) : (
                                            <LatexBlock content={explanation} displayMode={false} />
                                        )}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Collapse>
        </Paper>
    );
}
