---
name: "src/components/generation"
path: "src/components/generation"
layer: "src/components"
type: "dir"
description: "Generation related components (panels, status timeline)"
primary_owner: "frontend-team"
tags: ["components","generation","ui"]
entry_points:
  - "src/components/generation/GenerationPanel.tsx"
status: "pure-new"
file_count: 2
size_hint: "small"
last_updated: "2025-12-30"
---

## 概要
`src/components/generation` は問題生成に関わる専用 UI コンポーネントを格納します。例: Jenkins的なステータス表示や生成オプションパネル。

## 主要ファイル
| Path | Type | Purpose | Note |
|---|---:|---|---|
| `src/components/generation/GenerationPanel.tsx` | component | 生成の進行状況表示 | ProblemCreatePage 等で利用 |

## 検索 / 参照方法
- 全ファイル一覧: `find src/components/generation -type f`

## 更新履歴
- 2025-12-27: 初期作成
