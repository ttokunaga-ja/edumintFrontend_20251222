---
name: "src/components/page"
path: "src/components/page"
layer: "src/components"
type: "dir"
description: "Page-specific components grouped by page (HomePage, ProblemViewEditPage, etc.)"
primary_owner: "frontend-team"
tags: ["components","page","ui"]
entry_points:
  - "src/components/page/HomePage/AdvancedSearchPanel.tsx"
  - "src/components/page/ProblemViewEditPage/ProblemEditor.tsx"
status: "pure-new"
file_count: 22
size_hint: "large"
last_updated: "2025-12-30"
---

## 概要
`src/components/page` は Page 単位で分割された UI コンポーネントを格納します。各サブフォルダはその Page に固有の UI を含みます。

## サブディレクトリ（短い一覧）
- `HomePage/` — `AdvancedSearchPanel` など
- `ProblemViewEditPage/` — `ProblemEditor`, `QuestionBlock`, `AnswerBlock` など
- `ProblemCreatePage/` — 生成オプション関連
- `ProblemEditor/` — 編集ユーティリティ
- `LoginRegisterPage/`, `MyPage/`

## 重要ファイル
| Path | Type | Purpose | Note |
|---|---:|---|---|
| `src/components/page/ProblemViewEditPage/ProblemEditor.tsx` | component | 問題編集の主要エディタ |
| `src/components/page/HomePage/AdvancedSearchPanel.tsx` | component | 高度検索パネル |

## 分割方針
- 大きな Page サブディレクトリは個別の Index を作成する（必要時）。
- 詳細なファイル一覧: `find src/components/page -maxdepth 2 -type f`

## 更新履歴
- 2025-12-27: 初期作成
