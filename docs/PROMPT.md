### 1. 目的 (Goal / Objective)
- FIGMA 準拠 UI への移行と ServiceHealth/FeatureFlag 連動を完了し、バックエンドの段階リリースに備える。

### 2. 制約条件 (Constraints)
- 言語/ツール: TS5, React18, Vite5, Tailwind4。
- 依存方向（レイヤ）: `pages -> components -> features -> services/api -> shared/utils, types`。直接 fetch 禁止、Gateway 経由のみ。
- env: `VITE_API_BASE_URL` 必須。`VITE_ENABLE_<FEATURE>` で未提供機能は Coming Soon + disable。
- UX: ヘルス outage でリクエストを送らない。i18n は辞書必須。

### 3. タスク (Tasks)
1. App.tsx を FIGMA ページに切替、旧ページ停止。
2. Gateway レスポンスに Zod/TS バリデーションを追加、モックフォールバック廃止。
3. ServiceHealth/FeatureFlag で CTA 制御を統一、Coming Soon 文言を実装。
4. FileUpload/Generating の失敗ハンドリングとポーリング停止を追加。
5. Storybook/テストを更新（submit/search/health disable のカバレッジ）。

### 4. 完了条件 (Completion Criteria)
- 旧 UI 非使用、FIGMA UI が描画。ヘルス outage 時に CTA が無効化され理由を表示。
- `npm test`/`npm run build` 通過。主要フローのテストが追加。
- `IMPLEMENT_REPORT_FMT.md` 準拠レポートを `reports/phase_X_report.md` へ出力。

### 5. 品質チェック・出力フォーマット (Quality & Output Format)
- 構造: 新アーキ準拠、ロジックと表示を分離。
- テスト: 正常/異常（health/timeout）を分離。
- JSON 例は `Q_PROMPT.md` と同一。

### 6. 実装報告とドキュメント更新 (Report & Document Update)
- 変更したページ/サービス/テスト/フラグをレポートに反映し、必要な env を列挙。

### 7. 次フェーズのドキュメント修正 (Next Phase Prep)
- Repository 実装で必要な追加要件やスキーマ前提をメモ
- 未解決の TODO/リスクを列挙

### 8. メモリ / コンテキスト管理 (Memory / Context)
- 定義した Repository IF 名称
- ドメインルール上の制約（例: バリデーション条件）
- 今後必要になる環境変数の検討事項

### 9. 反復ループ (Plan → Execute → Evaluate → Revise)
- タスクごとにテストを実行し、失敗時は原因と修正案を箇条書きで残す
- 失敗が解消しない場合は 3 回まで修正を試み、それでも不可なら BLOCKED でレポート

### 10. 停止条件 (Stop Conditions)
- すべてのタスク完了かつ完了条件達成
- 重大な依存不足や仕様不明点で進行不能になった場合（BLOCKED としてレポート）
