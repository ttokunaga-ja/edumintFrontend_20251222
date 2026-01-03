/**
 * EditorPreviewPanel コンポーネント - 使用ガイド
 * 
 * このドキュメントは、ProblemViewEditPage内のすべてのフォームで使用される
 * 「上：フォーム / 下：プレビュー」構成コンポーネントの使用方法を記載しています。
 */

// ============================================
// 1. 基本的な使用方法
// ============================================

import { useState } from 'react';
import { EditorPreviewPanel } from '@/components/common/EditorPreviewPanel';

function BasicExample() {
  const [content, setContent] = useState('');

  return (
    <EditorPreviewPanel
      value={content}
      onChange={setContent}
      placeholder="問題文を入力してください..."
      minEditorHeight={150}
      minPreviewHeight={150}
    />
  );
}

// ============================================
// 2. 高度な機能を持つバージョン（推奨）
// ============================================

import { AdvancedEditorPreviewPanel } from '@/components/common/AdvancedEditorPreviewPanel';

async function handleSave(content: string) {
  // API呼び出しなど
  console.log('Saving:', content);
  await new Promise(resolve => setTimeout(resolve, 1000));
}

function AdvancedExample() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  return (
    <AdvancedEditorPreviewPanel
      value={content}
      onChange={setContent}
      onSave={async (value) => {
        setIsSaving(true);
        try {
          await handleSave(value);
        } finally {
          setIsSaving(false);
        }
      }}
      isSaving={isSaving}
      placeholder="テキストを入力してください..."
      minEditorHeight={200}
      minPreviewHeight={200}
      autoSaveDelay={3000} // 3秒後に自動保存
    />
  );
}

// ============================================
// 3. ProblemViewEditPage での使用例
// ============================================

import { Container, Box, TextField, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface QuestionFormData {
  questionText: string;
  explanationText: string;
}

function ProblemViewEditPageExample() {
  const { control, watch, setValue } = useForm<QuestionFormData>({
    defaultValues: {
      questionText: '',
      explanationText: '',
    },
  });

  const handleSaveQuestion = async (text: string) => {
    // API: 問題文を保存
    console.log('Saving question:', text);
  };

  const handleSaveExplanation = async (text: string) => {
    // API: 解説文を保存
    console.log('Saving explanation:', text);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* 問題文セクション */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          問題文
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <Controller
            name="questionText"
            control={control}
            render={({ field }) => (
              <AdvancedEditorPreviewPanel
                value={field.value}
                onChange={field.onChange}
                onSave={handleSaveQuestion}
                placeholder="問題文を入力してください..."
                minEditorHeight={200}
                minPreviewHeight={150}
              />
            )}
          />
        </Box>

        {/* 解説セクション */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          解説
        </Typography>
        <Box sx={{ height: 400 }}>
          <Controller
            name="explanationText"
            control={control}
            render={({ field }) => (
              <AdvancedEditorPreviewPanel
                value={field.value}
                onChange={field.onChange}
                onSave={handleSaveExplanation}
                placeholder="解説を入力してください..."
                minEditorHeight={200}
                minPreviewHeight={150}
              />
            )}
          />
        </Box>
      </Box>
    </Container>
  );
}

// ============================================
// 4. Props インターフェース
// ============================================

/**
 * EditorPreviewPanel Props
 */
interface EditorPreviewPanelProps {
  // 入力値
  value: string;
  
  // 値変更ハンドラ
  onChange: (value: string) => void;
  
  // プレースホルダーテキスト
  placeholder?: string;
  
  // エディタ最小高さ（px）
  minEditorHeight?: number;
  
  // プレビュー最小高さ（px）
  minPreviewHeight?: number;
  
  // プレビュー無効化フラグ
  previewDisabled?: boolean;
  
  // 折りたたみ機能無効化フラグ
  disableFolding?: boolean;
}

/**
 * AdvancedEditorPreviewPanel Props
 */
interface AdvancedEditorPreviewPanelProps extends Omit<EditorPreviewPanelProps, 'onChange'> {
  // 値変更ハンドラ
  onChange: (value: string) => void;
  
  // 保存コールバック
  onSave?: (value: string) => Promise<void>;
  
  // 保存中フラグ
  isSaving?: boolean;
  
  // Undo/Redo無効化フラグ
  disableUndo?: boolean;
  
  // 自動保存遅延（ms）
  autoSaveDelay?: number;
}

// ============================================
// 5. LaTeX マークアップ仕様
// ============================================

/**
 * インライン数式（$で囲む）
 * 
 * 例: 「エネルギーの公式は $E=mc^2$ です。」
 * 
 * レンダリング結果:
 * エネルギーの公式は E=mc² です。
 */

/**
 * ブロック数式（$$で囲む）
 * 
 * 例:
 * $$
 * R_{\mu\nu} - \frac{1}{2}Rg_{\mu\nu} = 8\pi G T_{\mu\nu}
 * $$
 * 
 * レンダリング結果:
 *           1
 * Rμν - --- Rgμν = 8πGTμν
 *           2
 */

/**
 * エスケープ処理（\$で記述）
 * 
 * 例: 「価格は \$100 です。」
 * 
 * レンダリング結果:
 * 価格は $100 です。
 * （ドル記号として扱われます）
 */

// ============================================
// 6. キーボードショートカット
// ============================================

/**
 * 使用可能なショートカット（AdvancedEditorPreviewPanelのみ）
 * 
 * Ctrl+S / Cmd+S : 保存
 * Ctrl+Z / Cmd+Z : 戻す（Undo）
 * Ctrl+Y / Cmd+Y : やり直す（Redo）
 */

// ============================================
// 7. 自動機能
// ============================================

/**
 * 自動ペアリング
 * 
 * テキスト入力時に以下のペアが自動挿入されます：
 * - $ ... $  （インライン数式）
 * - { ... }  （ブロック）
 * - [ ... ]  （ブラケット）
 * - ( ... )  （括弧）
 * - " ... "  （引用符）
 */

/**
 * シンタックスハイライト
 * 
 * LaTeX デリミタ（$ 或いは $$）で囲まれた範囲が
 * わずかに異なる背景色で表示されます。
 * 未閉じのデリミタは警告色で表示されます。
 */

/**
 * 同期スクロール
 * 
 * エディタエリアをスクロールすると、
 * プレビューエリアも自動的に同期してスクロールします。
 */

// ============================================
// 8. エラーハンドリング
// ============================================

/**
 * 不完全な LaTeX 数式
 * 
 * 例: $\frac{1}{（閉じられていない）
 * 
 * 表示: [数式入力中...] というプレースホルダーが表示されます
 * 動作: 直前の正しい状態を維持し、エラーメッセージを表示
 */

/**
 * 無効な LaTeX コマンド
 * 
 * 例: $\undefinedcommand$
 * 
 * 表示: ⚠ 数式のエラー というメッセージが表示されます
 * リンク: KaTeX対応コマンド一覧へのリンク表示
 */

// ============================================
// 9. ベストプラクティス
// ============================================

/**
 * 1. 常に AdvancedEditorPreviewPanel を使用する
 *    - Undo/Redo機能が提供される
 *    - 自動保存機能がある
 *    - キーボードショートカットが使える
 * 
 * 2. onSave コールバックを実装する
 *    - 値の確定は API 呼び出し後
 *    - エラーハンドリングを含める
 * 
 * 3. 適切な height を設定する
 *    - minEditorHeight: 150-200px
 *    - minPreviewHeight: 100-150px
 * 
 * 4. placeholder を設定する
 *    - 入力欄の目的を明示
 * 
 * 5. disabled フラグを活用する
 *    - 閲覧モード時は previewDisabled={true}
 */

// ============================================
// 10. デバウンス設定
// ============================================

/**
 * autoSaveDelay (AdvancedEditorPreviewPanelのみ)
 * 
 * デフォルト: 3000ms (3秒)
 * 
 * 連続入力中は保存を遅延させることで、
 * サーバー負荷を軽減します。
 * 
 * 推奨設定:
 * - 短い텍스트 (< 500文字): 1000ms
 * - 通常のテキスト: 3000ms
 * - 長い文書: 5000ms
 */

export {
  BasicExample,
  AdvancedExample,
  ProblemViewEditPageExample,
};
