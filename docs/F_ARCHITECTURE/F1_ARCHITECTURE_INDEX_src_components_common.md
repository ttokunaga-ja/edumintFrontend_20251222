---
name: "src/components/common"
path: "src/components/common"
layer: "src/components"
type: "dir"
description: "Common UI components reused across multiple pages (Header, Footer, Buttons, etc.)"
primary_owner: "frontend-team"
tags: ["components","common","ui"]
entry_points:
  - "src/components/common/TopMenuBar.tsx"
  - "src/components/common/FooterActionBar.tsx"
status: "pure-new"
file_count: 17
size_hint: "medium"
last_updated: "2025-12-30"
---

## 概要
`src/components/common` は複数ページで再利用される共通 UI コンポーネントを格納します。トップメニューや共通ボタン、EmptyState などが含まれます。

## 主要ファイル
| Path | Type | Purpose | Note |
|---|---:|---|---|
| `src/components/common/TopMenuBar.tsx` | component | アプリ上部のナビゲーション | グローバルで使用 |
| `src/components/common/FooterActionBar.tsx` | component | 下部のアクションバー | ページ固有で表示制御あり |

## 検索 / 参照方法
- 全ファイル一覧: `find src/components/common -type f`
- Storybook: `yarn storybook` を参照（該当コンポーネントがある場合）

## 状態
- 現状: 新アーキテクチャに移行済み（`F_ARCHITECTURE.md` 参照）

## 更新履歴
- 2025-12-27: 初期作成
