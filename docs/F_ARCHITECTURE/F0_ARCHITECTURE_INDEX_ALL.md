---
name: "F0 Architecture Index (All)"
path: "docs/F_ARCHITECTURE"
layer: "docs"
type: "index"
description: "Top-level architecture index that links to per-directory indices for quick navigation by CodingAgent and developers."
primary_owner: "frontend-team"
tags: ["index","architecture","navigation"]
last_updated: "2025-12-30"
---

# F0: Architecture Index — All

このファイルは `docs/F_ARCHITECTURE` 配下に置かれた各ディレクトリ別インデックス（`F*_ARCHITECTURE_INDEX_*`）への目次です。CodingAgent はこのファイルを起点に目的のインデックスを探せます。

## 目次 (Per-directory Indexes)
- [Components — common](F1_ARCHITECTURE_INDEX_src_components_common.md) — 共通 UI コンポーネント（Header / Footer / Button）
- [Components — generation](F1_ARCHITECTURE_INDEX_src_components_generation.md) — 生成関連コンポーネント
- [Components — page](F1_ARCHITECTURE_INDEX_src_components_page.md) — Page 固有コンポーネントの一覧とサブディレクトリへのリンク
- [Components — primitives A-F](F1_ARCHITECTURE_INDEX_src_components_primitives_a-f.md) — プリミティブ UI（A-F）
- [Components — primitives G-N](F1_ARCHITECTURE_INDEX_src_components_primitives_g-n.md) — プリミティブ UI（G-N）
- [Components — primitives O-Z](F1_ARCHITECTURE_INDEX_src_components_primitives_o-z.md) — プリミティブ UI（O-Z）
- [Components — problemTypes](F1_ARCHITECTURE_INDEX_src_components_problemTypes.md) — 問題タイプ別ビュー
- [Pages](F2_ARCHITECTURE_INDEX_src_pages.md) — ページ単位のエントリポイント
- [Features](F3_ARCHITECTURE_INDEX_src_features.md) — ドメイン別ロジック（hooks）
- [Services / API](F4_ARCHITECTURE_INDEX_src_services_api.md) — gateway / httpClient
- [Shared / utils](F5_ARCHITECTURE_INDEX_src_shared_utils.md) — 汎用ユーティリティ

---

## 運用ガイドライン
- 新しいディレクトリを追加したら、`docs/F_ARCHITECTURE/F0_ARCHITECTURE_INDEX_ALL.md` にリンクを追加してください。
- 大きなディレクトリ（file_count ≥ 40）はサブインデックスに分割してください（例: primitives を A-F/G-N/O-Z に分割）。
- frontmatter の必須フィールド: `name`, `path`, `type`, `description`, `last_updated`. CI で検証するスクリプトは後ほど追加可能です。

## 自動生成スクリプト（提案）
- `scripts/generate-architecture-index.js` を追加して、`docs/F_ARCHITECTURE/index.json` と Markdown を再生成できるようにすることを推奨します。

---

*このファイルは自動的に生成・更新されることも想定しています。手動で更新する場合は `last_updated` を必ず更新してください。*
