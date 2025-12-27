---
name: "src/components/problemTypes"
path: "src/components/problemTypes"
layer: "src/components/problemTypes"
type: "dir"
description: "Problem type views and registries (FreeText, MultipleChoice, Cloze etc.)"
primary_owner: "frontend-team"
tags: ["components","problemTypes","ui"]
entry_points:
  - "src/components/problemTypes/ProblemTypeRegistry.tsx"
status: "pure-new"
file_count: 18
size_hint: "medium"
last_updated: "2025-12-27"
---

## 概要
問題タイプ別の表示・編集コンポーネントを収めるフォルダです。拡張性のため registry を中心に実装が分かれています。

## 主要ファイル
| Path | Type | Purpose | Note |
|---|---:|---|---|
| `src/components/problemTypes/ProblemTypeRegistry.tsx` | component | タイプ登録機構 | 編集画面のタイプ切替に使用 |

## 参照 / 検索
`find src/components/problemTypes -type f`

## 更新履歴
- 2025-12-27: 初期作成
