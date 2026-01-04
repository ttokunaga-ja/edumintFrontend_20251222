import { useState, useCallback, useEffect } from 'react';
import { Box, useTheme, CircularProgress } from '@mui/material';
import { useUndo, useDebouncedCallback, useKeyboardShortcut } from '@/hooks/useEditorHooks';
import { EditorPreviewPanel } from './EditorPreviewPanel';

/**
 * QuestionEditorPreview
 *
 * EditorPreviewPanel の拡張版
 * - キーボードショートカット（Ctrl+S）
 * - 保存ステータス表示
 * - デバウンス付き自動保存
 * - Preview/Edit モード切り替え
 */

interface QuestionEditorPreviewProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
  isSaving?: boolean;
  placeholder?: string;
  minEditorHeight?: number;
  minPreviewHeight?: number;
  previewDisabled?: boolean;
  disableFolding?: boolean;
  disableUndo?: boolean;
  autoSaveDelay?: number; // ms
  mode?: 'preview' | 'edit'; // Preview表示のみ vs Edit（エディタ+プレビュー）
  /**
   * 未保存内容の状態が変わった時に呼び出される
   * @param hasUnsaved - 未保存内容がある場合true
   */
  onUnsavedChange?: (hasUnsaved: boolean) => void;
  inputId?: string;
  name?: string;
}

export const QuestionEditorPreview: FC<QuestionEditorPreviewProps> = ({
  value,
  onChange,
  onSave,
  isSaving = false,
  minEditorHeight = 120,
  minPreviewHeight = 80,
  previewDisabled = false,
  disableFolding = false,
  disableUndo = false,
  autoSaveDelay = 3000,
  mode = 'preview',
  onUnsavedChange,
  inputId,
  name,
}) => {
  const theme = useTheme();
  // undefined の場合は空文字列にする
  const safeValue = value || '';
  const { present, past, future, setState, undo, redo } = useUndo(safeValue);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // 外部からの値（valueプロパティ）が変更された場合に、内部状態を同期する
  // これにより、データロード後やフォームリセット後にプレビューが更新される
  useEffect(() => {
    if (safeValue !== present) {
      setState(safeValue);
    }
  }, [safeValue, setState]); // present を依存に入れると変更時にループするので注意

  // 初期値を記録（未保存判定用）
  const [initialValue, setInitialValue] = useState(safeValue);
  useEffect(() => {
    setInitialValue(safeValue);
  }, [safeValue]);

  // 未保存内容があるかどうかを判定し、コールバックを呼ぶ
  useEffect(() => {
    const hasUnsaved = present !== initialValue;
    onUnsavedChange?.(hasUnsaved);
  }, [present, initialValue, onUnsavedChange]);

  // 値の変更を管理
  const handleChange = useCallback(
    (newValue: string) => {
      setState(newValue);
      onChange(newValue);

      // 未保存状態を通知
      const hasUnsaved = newValue !== initialValue;
      onUnsavedChange?.(hasUnsaved);
    },
    [setState, onChange, initialValue, onUnsavedChange]
  );

  // デバウンス付き自動保存
  const performAutoSave = useDebouncedCallback(
    async (saveValue: string) => {
      if (!onSave) return;

      setIsAutoSaving(true);
      try {
        await onSave(saveValue);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    },
    autoSaveDelay
  );

  // 値が変わったときに自動保存をトリガー
  const handleChangeWithAutoSave = useCallback(
    (newValue: string) => {
      handleChange(newValue);
      performAutoSave(newValue);
    },
    [handleChange, performAutoSave]
  );

  // 手動保存
  const handleManualSave = useCallback(async () => {
    if (!onSave) return;

    setIsAutoSaving(true);
    try {
      await onSave(present);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [onSave, present]);

  // キーボードショートカット
  useKeyboardShortcut({
    save: (e) => {
      e.preventDefault();
      handleManualSave();
    },
    undo: (e) => {
      if (!disableUndo) {
        e.preventDefault();
        undo();
      }
    },
    redo: (e) => {
      if (!disableUndo) {
        e.preventDefault();
        redo();
      }
    },
  });

  // Previewモード時は簡潔に（プレビューのみ）
  if (mode === 'preview') {
    return (
      <Box sx={{ width: '100%' }}>
        <EditorPreviewPanel
          value={present}
          onChange={() => { }}
          minEditorHeight={minPreviewHeight}
          minPreviewHeight={minPreviewHeight}
          previewDisabled={false}
          disableFolding={true}
          mode="preview"
          id={inputId}
          name={name}
        />
      </Box>
    );
  }

  // Editモード
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: minEditorHeight + minPreviewHeight,
        position: 'relative',
      }}
    >
      {/* 保存ステータス（右上に表示） */}
      {(isSaving || isAutoSaving) && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.75rem',
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.background.paper,
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: 10,
          }}
        >
          <CircularProgress size={12} />
          保存中...
        </Box>
      )}

      {/* エディタ・プレビューパネル */}
      <EditorPreviewPanel
        value={present}
        onChange={handleChangeWithAutoSave}
        minEditorHeight={minEditorHeight}
        minPreviewHeight={minPreviewHeight}
        previewDisabled={previewDisabled}
        disableFolding={disableFolding}
        mode="edit"
        id={inputId}
        name={name}
      />
    </Box>
  );
};

export default QuestionEditorPreview;
