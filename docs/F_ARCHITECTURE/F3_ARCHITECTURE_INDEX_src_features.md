---
name: "src/features"
path: "src/features"
layer: "src/features"
type: "dir"
description: "Domain-specific logic and hooks (auth, content, search, user, ... )"
primary_owner: "frontend-team"
tags: ["features","hooks","domain"]
entry_points:
  - "src/features/auth"
  - "src/features/content"
status: "mixed"
file_count: 38
size_hint: "small"
last_updated: "2025-12-30"
---

## 概要
`src/features` はドメインに閉じた再利用可能なロジックや Hook を配置します。UI コンポーネントは原則配置しません。

## ドメイン一覧（例）
- `auth/` — 認証関連の hooks とユーティリティ
- `content/` — コンテンツ取得/生成に関するロジック
- `search/` — 検索ロジック
- `user/` — ユーザ関連

## 参照 / 検索
`find src/features -maxdepth 2 -type f`

## 更新履歴
- 2025-12-27: 初期作成
