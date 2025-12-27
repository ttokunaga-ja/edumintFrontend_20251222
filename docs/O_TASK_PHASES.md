# MUI 移行 — フェーズ分解とタスク一覧 🗂️

このドキュメントは移行プロジェクトを段階的に分解し、各フェーズの成果物と担当チェックリストを示します。

---

## フェーズ 0: 準備（1週）
- ゴール: PoC の準備と CI/Storybook が移行を受け入れられる状態にする。
- タスク:
  - Package の選定・導入案作成（@mui/material, @mui/icons-material, @emotion/react, @emotion/styled）
  - コンフリクト確認（Tailwind と Emotion の共存影響調査）
  - Feature flag（`VITE_ENABLE_MUI_MIGRATION`）を追加
  - Storybook のスタイル統合（必要であれば Emotion サポートを追加）
- 成果物: PoC リポジトリブランチ、CI/Storybook のビルドが通ること

---

## フェーズ 0.5: Tailwind 廃止（2–4 週）
- ゴール: Tailwind をコードベースから除去し、MUI テーマ / Design Tokens に移行する。
- タスク:
  - Tailwind クラスの全利用箇所をスキャンして優先度リストを作成
  - `cn` / `tailwind-merge` の依存箇所を特定し置換方針を決定（clsx + MUI sx 等へ移行）
  - 低リスク箇所は codemod で自動変換、高リスクは手動で移行
  - Tailwind config / PostCSS / global import (`src/index.css`) の除去
  - Storybook / Unit / E2E で見た目・動作を検証
- 成果物: Tailwind 除去 PR、影響範囲レポート

---

## フェーズ 1: PoC（2週）
- ゴール: `Button` と `Input` をラップして置換する PoC を実装／検証する。
- タスク:
  - `src/components/primitives/button` の内部を MUI に差し替える（薄いラッパー）
  - Theme の初期設計（色、フォント、主要コンポーネントの高さ/余白）
  - Storybook に PoC を追加して visual snapshot を作成
  - Unit tests & A11y checks を追加
- 成果物: PoC マージ可否判断、テーマ仕様書（初版）

---

## フェーズ 2: Core primitives 置換（4–6 週）
- ゴール: 優先度の高い primitives を MUI ベースで置換し、互換ラッパーを維持する。
- 優先コンポーネント: Button, Input, Select, Checkbox, Radio, Switch, Dialog, Tooltip, Badge, Avatar
- タスク（反復）:
  - コンポーネントごとに PR を出す（1 PR = 1–2 コンポーネント推奨）
  - Storybook と Unit test を必須条件にマージ
  - 既存の UI 使用箇所を E2E で回帰テスト
  - デザイントークンの差分をまとめる
- 成果物: primitives 一式の MUI 実装、Storybook 更新、テスト緑

---

## フェーズ 3: ページ単位の移行（6–10 週）
- ゴール: 画面を段階的に置換して全体リグレッションを回避する。
- タスク:
  - 重要度/トラフィック順にページリストを作成（例: 問題作成、編集、ダッシュボード）
  - 各ページで UI を差し替え、E2E を実行
  - 見た目の微調整（Theme 更新）
  - パフォーマンス計測（Lighthouse / Web Vitals）
- 成果物: ページ移行ごとのリリースノート、E2E 結果、パフォーマンスレポート

---

## フェーズ 4: フォーム・バリデーション統合（2–3 週）
- ゴール: `react-hook-form` 等と MUI コンポーネントの組合せで使いやすさを確保する。
- タスク:
  - 既存フォームのサンプル変換とユーティリティ更新
  - バリデーションエラーハンドリングの共通化（Zod と連携）
  - テスト（入力/バリデーション）

---

## フェーズ 5: 品質・最終調整（2–4 週）
- ゴール: アクセシビリティ・ビジュアル・パフォーマンスを満たしプロダクションにロールアウトする。
- タスク:
  - A11y の自動/手動チェック完了
  - Storybook とデザインレビューで視覚差分を合意
  - バンドルサイズ最適化（不要アイコン除去、dynamic import の検討）
  - Rollout plan に従って feature flag を段階解除

---

## フェーズ 6: ドキュメント・トレーニング（1–2 週）
- ゴール: 開発者向けドキュメントと移行ガイドを公開し、チーム内トレーニングを実施する。
- タスク:
  - `primitives` の使用方法（旧 API との相違）を記載
  - Theme の使い方 / カスタマイズガイドを作成
  - チーム向けデモ・Q&A を開催

---

## エスカレーション
- 本プロダクトはプレリリースのため、厳密なロールバック運用や feature flag による段階リリースは必須としない。  
- 重大な問題が発生した場合は素早く hotfix（修正 PR）を出し対応する運用とし、事後に振り返りを行う。  
- 重大な A11y・UX 問題については緊急対応基準を設け、必要に応じて個別対応を行う。
---

## 所要見積（ラフ）
- 合計: 5–8 ヶ月（Tailwind 廃止作業を含むため増加）
- リソース例: 2 フロントエンドエンジニア（1.0 FTE + 0.5 FTE）、QA エンジニア（部分的）

---

## 補足（タスク管理の推奨）
- 各 PR に必ず `migration:mui` ラベルを付け、レビュー時は UI スクリーンショットと Storybook URL を添付する。
