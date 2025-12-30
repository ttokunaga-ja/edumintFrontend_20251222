# テスト作成計画 (Test Creation Plan)

## 1. 目的
本プロジェクトで最近実施された機能修正（メニューバー、問題作成フローのエディタ分離、遷移ロジック）が、設計通りに動作することをプログラムおよびブラウザ実機操作で確認・担保する。

## 2. 対象となる修正項目
*   **TopMenuBar**: 背景の透過防止(`bg-white`)と重なり順(`z-[150]`)。
*   **StructureAnalysisEditor**: 構造確認フェーズにおいて、問題本文・解答欄が非表示であること。
*   **GenerationResultEditor**: 生成完了後に全ての編集フィールドが表示され、編集可能であること。
*   **遷移ロジック**: 生成完了後の「公開」ボタン押下により、正しい問題詳細ページに遷移すること。

## 3. テストカテゴリ別の実施内容

### A. ユニットテスト (`tests/unit`)
- **対象**: `src/pages/ProblemCreatePage/hooks/useProblemCreateController.ts`
- **内容**: 
    - 各フェーズ（`analyzing`, `generating`, `complete`）への遷移ロジックの検証。
    - 生成完了時に自動遷移が停止し、IDが正しく保持されることの検証。

### B. コンポーネントテスト (`tests/component`)
- **対象**: 
    - `src/components/page/ProblemEditor/StructureAnalysisEditor.tsx`
    - `src/components/page/ProblemEditor/GenerationResultEditor.tsx`
    - `src/components/common/TopMenuBar.tsx`
- **内容**:
    - `StructureAnalysisEditor`: 入力フィールド（Difficulty, Keywords等）の存在確認と、Editorフィールドの不在確認。
    - `GenerationResultEditor`: 本文・解答入力欄の存在確認。
    - `TopMenuBar`: 適用されているCSSクラス(bg-white, sticky)の検証。

### C. E2Eテスト (`tests/e2e`)
- **ツール**: Playwright
- **シナリオ**:
    1.  作成ページからファイルをアップロード。
    2.  構造解析中/静止画面で、本文が見えないことを確認。
    3.  生成完了を待ち、エディタが出現することを確認。
    4.  「公開して保存」をクリックし、詳細URL (`/problems/[id]`) へリダイレクトされることを確認。

## 4. 実行・確認スケジュール
1.  **環境整備**: Playwrightのセットアップ。
2.  **プログラム作成**: 各ディレクトリ（unit, component, e2e）にテストコードを実装。
3.  **ブラウザ確認**: `browser_subagent` を起動し、実装したテスト内容を実際のブラウザ操作でミラーリング確認する。
4.  **最終報告**: 全テストのパスと実機キャプチャの確認。

---
この計画に基づき、テストプログラムの作成を開始します。
