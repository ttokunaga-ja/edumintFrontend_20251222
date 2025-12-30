---
name: "src/pages"
path: "src/pages"
layer: "src/pages"
type: "dir"
description: "Page entry points (one-file-per-page)"
primary_owner: "frontend-team"
tags: ["pages","routes"]
entry_points:
  - "src/pages/HomePage.tsx"
  - "src/pages/ProblemViewEditPage.tsx"
status: "mixed"
file_count: 7
size_hint: "small"
last_updated: "2025-12-30"
---

## 概要
`src/pages` にはルーティング単位の Page ファイルを配置します。各ページは原則 1 ファイルで構成され、下位に UI コンポーネントを委譲します。いくつかのページは Legacy コンポーネントをラップする状態です（ProblemCreatePage, MyPage, LoginRegisterPage）。

## 主要ファイル
| Path | Type | Purpose | Note |
|---|---:|---|---|
| `src/pages/HomePage.tsx` | page | Home page エントリポイント | Pure New |
| `src/pages/ProblemViewEditPage.tsx` | page | 問題閲覧/編集のエントリ | Pure New |
| `src/pages/ProblemCreatePage.tsx` | page | 問題生成ページ（Wrapper around Legacy） | 置換予定 |

## 検索 / 参照方法
- 全ページ一覧: `ls src/pages`
- Page 固有のコンポーネントは `src/components/page/<PageName>` を参照

## 更新履歴
- 2025-12-27: 初期作成
