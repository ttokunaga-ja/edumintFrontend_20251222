import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import {
    Box,
    Stack,
    Chip,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    useTheme,
    Typography,
    Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import KeywordManager from '@/components/common/inputs/KeywordManager';

export interface ExamQuestionMetaProps {
    number: number;
    level: 'major' | 'minor';
    metaType: 'difficulty' | 'questionType';
    metaValue: number | string;
    metaOptions: Array<{ value: number | string; label: string }>;
    keywords: Array<{ id: string; keyword: string }>;
    isEditMode: boolean;
    onMetaChange: (value: string | number) => void;
    onKeywordAdd: (keyword: string) => void;
    onKeywordRemove: (id: string) => void;

    // Controls
    onDelete?: () => void;
    canDelete?: boolean;
    onMoveUp?: () => void;
    canMoveUp?: boolean;
    onMoveDown?: () => void;
    canMoveDown?: boolean;
}

export const ExamQuestionMeta: FC<ExamQuestionMetaProps> = ({
    number,
    level,
    metaType,
    metaValue,
    metaOptions,
    keywords,
    isEditMode,
    onMetaChange,
    onKeywordAdd,
    onKeywordRemove,
    onDelete,
    canDelete = false,
    onMoveUp,
    canMoveUp = false,
    onMoveDown,
    canMoveDown = false,
}) => {
    const theme = useTheme();
    const isMajor = level === 'major';

    // 図形スタイル
    const shapeStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        backgroundColor: isMajor ? theme.palette.primary.main : theme.palette.secondary.main,
        color: '#fff',
        borderRadius: isMajor ? 1 : '50%', // 四角(major) or 丸(minor)
        fontWeight: 'bold',
        fontSize: '1rem',
        flexShrink: 0,
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2}>
                {/* --- Left Column --- */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                        {/* Row 1: Number & Dropdown */}
                        <Stack direction="row" spacing={2} alignItems="center">
                            {/* Number Icon */}
                            <Box sx={shapeStyle}>
                                {number}
                            </Box>

                            {/* Dropdown (Difficulty or QuestionType) */}
                            <Box sx={{ minWidth: 120, flex: 1 }}>
                                {isEditMode ? (
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>{metaType === 'difficulty' ? '難易度' : '問題形式'}</InputLabel>
                                        <Select
                                            value={metaValue}
                                            label={metaType === 'difficulty' ? '難易度' : '問題形式'}
                                            onChange={(e) => onMetaChange(e.target.value)}
                                            size="small"
                                        >
                                            {metaOptions.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Chip
                                        label={metaOptions.find(o => String(o.value) === String(metaValue))?.label || '未設定'}
                                        size="medium"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        </Stack>

                        {/* Row 2: Controls (Edit Mode Only) */}
                        {isEditMode && (
                            <Stack direction="row" spacing={1} sx={{ pl: 6 }}>
                                {isMajor && (
                                    <Stack direction="row" spacing={0}>
                                        <IconButton
                                            size="small"
                                            onClick={onMoveUp}
                                            disabled={!canMoveUp}
                                            title="上へ移動"
                                        >
                                            <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={onMoveDown}
                                            disabled={!canMoveDown}
                                            title="下へ移動"
                                        >
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )}
                                <IconButton
                                    size="small"
                                    onClick={onDelete}
                                    disabled={!canDelete}
                                    color="error"
                                    title="削除"
                                    data-testid="delete-button"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        )}
                    </Stack>
                </Grid>

                {/* --- Right Column --- */}
                <Grid item xs={12} md={8}>
                    <Stack spacing={1}>
                        {/* Row 1: Keyword Input (Edit Mode Only) */}
                        {isEditMode && (
                            <Box sx={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
                                <KeywordManager
                                    keywords={[]} // Input only
                                    onAdd={onKeywordAdd}
                                    label="キーワードを追加"
                                    showHelperText={false}
                                />
                            </Box>
                        )}

                        {/* Row 2 (or 1 in View Mode): Keyword Chips */}
                        {keywords.length > 0 && (
                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                                sx={{
                                    minHeight: isEditMode ? 'auto' : 40,
                                    alignItems: 'center',
                                }}
                            >
                                {keywords.map((kw) => (
                                    <Chip
                                        key={kw.id}
                                        label={kw.keyword}
                                        size="small"
                                        onDelete={isEditMode ? () => onKeywordRemove(kw.id) : undefined}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
