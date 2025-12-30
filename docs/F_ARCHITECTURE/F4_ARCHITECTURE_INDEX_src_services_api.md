---
name: "src/services/api"
path: "src/services/api"
layer: "src/services/api"
type: "dir"
description: "Gateway and HTTP client abstraction for external services"
primary_owner: "frontend-team"
tags: ["api","gateway","http-client"]
entry_points:
  - "src/services/api/httpClient.ts"
  - "src/services/api/gateway.ts"
status: "needs-refactor"
file_count: 3
size_hint: "small"
last_updated: "2025-12-30"
---

## 概要
このフォルダは外部通信を集中させるレイヤです。現状 `gateway.ts` が肥大化しているため、`httpClient.ts` と各ドメインの client (`gateway/*.ts`) に分割する方針です。

## 主要ファイル
| Path | Type | Purpose | Note |
|---|---:|---|---|
| `src/services/api/httpClient.ts` | module | 共通 HTTP 設定 / ApiError / retry | Base client |
| `src/services/api/gateway.ts` | module | 旧 gateway（分割予定） | 分割推奨 |

## 参照 / 検索
`find src/services/api -type f`

## 更新履歴
- 2025-12-27: 初期作成
