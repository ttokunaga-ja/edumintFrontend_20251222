import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Box, Button, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { LaTeXPreview } from './LaTeXPreview';
import { FormEditor } from './FormEditor';

/**
 * EditorPreviewPanel
 *
 * 「上：フォーム / 下：プレビュー」構成のコンポーネント
 * - リサイズ可能な境界線（エディタ拡大時はコンポーネント全体が拡大）
 * - LaTeX自動認識（$と$$）
 * - シンタックスハイライト
 * - プレビューは最小高さを保ちつつ、コンテンツに応じて自動拡張
 */

interface EditorPreviewPanelProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minEditorHeight?: number; // px
  minPreviewHeight?: number; // px
  previewDisabled?: boolean;
  disableFolding?: boolean;
  mode?: 'preview' | 'edit'; // Preview: プレビューのみ表示 | Edit: エディタ+プレビュー
  id?: string;
  name?: string;
}

export const EditorPreviewPanel: FC<EditorPreviewPanelProps> = ({
  value,
  onChange,
  minEditorHeight = 120,
  minPreviewHeight = 120,
  previewDisabled = false,
  disableFolding = false,
  mode = 'preview',
  id,
  name,
}) => {
  const theme = useTheme();
  const [isPreviewHidden, setIsPreviewHidden] = useState(false);
  const [editorHeight, setEditorHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);

  // シンタックスハイライト用に LaTeX デリミタを検出
  const hasLatex = useMemo(() => /[\$]{1,2}/.test(value), [value]);

  // マウスダウンイベント（リサイズ開始）
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (previewDisabled || isPreviewHidden) return;

    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartHeightRef.current = editorHeight;

    // ユーザー選択を防止
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
  }, [editorHeight, previewDisabled, isPreviewHidden]);

  // マウスムーブイベント（ドラッグ中のリサイズ）
  // エディタの高さを変更するが、プレビューは縮小しない（コンポーネント全体が拡大する）
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartYRef.current;
      const newHeight = Math.max(minEditorHeight, dragStartHeightRef.current + deltaY);
      setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minEditorHeight]);

  // ダブルクリック（プレビューの折りたたみ）
  const handleDividerDoubleClick = useCallback(() => {
    if (!disableFolding && !previewDisabled) {
      setIsPreviewHidden(!isPreviewHidden);
    }
  }, [disableFolding, previewDisabled, isPreviewHidden]);

  // プレビューを閉じるボタン
  const handleClosePreview = useCallback(() => {
    setIsPreviewHidden(true);
  }, []);

  // プレビューを開くボタン
  const handleOpenPreview = useCallback(() => {
    setIsPreviewHidden(false);
  }, []);

  // Preview モード: プレビューのみを表示
  if (mode === 'preview') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
          minHeight: minPreviewHeight,
        }}
      >
        <Box
          ref={previewRef}
          sx={{
            minHeight: minPreviewHeight,
            padding: '16px',
            backgroundColor: theme.palette.background.default,
            overflow: 'auto',
          }}
        >
          <LaTeXPreview content={value} />
        </Box>
      </Box>
    );
  }

  // Edit モード: エディタ + プレビュー
  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* エディタエリア */}
      <Box
        sx={{
          height: editorHeight,
          minHeight: minEditorHeight,
          overflow: 'auto',
          borderBottom: !previewDisabled && !isPreviewHidden ? `1px solid ${theme.palette.divider}` : 'none',
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.02)'
            : '#fafafa',
        }}
      >
        <FormEditor
          value={value}
          onChange={onChange}
          hasLatex={hasLatex}
          id={id}
          name={name}
        />
      </Box>

      {/* 境界線（リサイズ可能） */}
      {!previewDisabled && !isPreviewHidden && (
        <Box
          onMouseDown={handleDragStart}
          onDoubleClick={handleDividerDoubleClick}
          sx={{
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            cursor: 'row-resize',
            userSelect: 'none',
            gap: 1,
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(77, 208, 225, 0.1)'
                : 'rgba(0, 188, 212, 0.1)',
            },
          }}
        >
          <DragIndicatorIcon
            sx={{
              fontSize: 16,
              color: theme.palette.text.secondary,
            }}
          />
          <Box
            sx={{
              fontSize: '0.7rem',
              color: theme.palette.text.secondary,
              userSelect: 'none',
            }}
          >
            ↕ ドラッグでリサイズ
          </Box>
          {!disableFolding && (
            <Button
              variant="text"
              size="small"
              onClick={handleClosePreview}
              startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
              sx={{
                ml: 'auto',
                fontSize: '0.7rem',
                color: theme.palette.text.secondary,
                minWidth: 'auto',
                padding: '2px 8px',
                '&:hover': {
                  color: theme.palette.text.primary,
                },
              }}
            >
              閉じる
            </Button>
          )}
        </Box>
      )}

      {/* プレビューエリア（コンテンツに応じて自動拡張、最小高さあり） */}
      {!previewDisabled && !isPreviewHidden && (
        <Box
          ref={previewRef}
          sx={{
            minHeight: minPreviewHeight,
            padding: '16px',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <LaTeXPreview content={value} />
        </Box>
      )}

      {/* プレビュー非表示時の表示 */}
      {isPreviewHidden && !previewDisabled && (
        <Box
          sx={{
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.default,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpenPreview}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
            }}
          >
            プレビューを表示
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EditorPreviewPanel;
