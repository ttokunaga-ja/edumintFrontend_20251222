# D_1 Home/Search Component REQUIREMENTS

## スコープ
- SearchSection, SearchBar（TopMenuBar連動）, AdvancedSearchPanel, SearchResultCard, Pagination, EmptyState。

## 機能要件
- フィルター（例: HomePage 実装ガイド準拠）
  - `keyword`（キーワード）
  - `universities[]`, `faculties[]`, `subjects[]`
  - `fieldType`（science/humanities）
  - `level`（basic/standard/advanced/difficult）
  - `formats[]`
  - `duration`（分）
  - `period`（today/week/month/year）
  - `sortBy`（latest/popular/views）
- AdvancedSearchPanel は折りたたみ（既定: 閉じる）。フィルター指定時は自動展開。
- API
  - 検索: `GET /search/exams`
  - 読みサジェスト: `GET /search/readings`（多言語/表記ゆれ対策）
  - 実装規約: UI コンポーネントは `services/api/*` を直接 import しない。`features/search/*`（hook/repository）経由で呼ぶ。
- Health
  - `GET /health/search` が `outage|maintenance` の場合は入力/CTA disable + Alert A/B
  - `degraded` の場合は警告表示（入力/CTA は原則有効）
- SearchSection は Alert A/B を表示し、TopMenuBar の検索クエリと同期。
- モック（暫定）: 現状 `src/src/services/api/gateway.ts` では `VITE_API_BASE_URL` が localhost の場合にモックへ分岐。

## 非機能要件
- レンダー p95 < 200ms（フィルター開閉含む）。
- i18n 辞書化。アクセシビリティ: focus/aria-label。

## ファイル構成（提案）
- page:
  - `src/src/pages/HomePage.tsx`（推奨。現状 `HomePage.tsx` の場合は rename 対象）
- components:
  - `src/src/components/page/HomePage/HeroSection.tsx`
  - `src/src/components/page/HomePage/SearchSection.tsx`
  - `src/src/components/page/HomePage/AdvancedSearchPanel.tsx`
  - `src/src/components/page/HomePage/SearchFiltersForm.tsx`
  - `src/src/components/page/HomePage/SortTabs.tsx`
  - `src/src/components/page/HomePage/SearchResultsGrid.tsx`
  - `src/src/components/page/HomePage/SearchResultCard.tsx`
- common:
  - `src/src/components/common/MultilingualAutocomplete.tsx`

## Sources
- `../implementation/pages/home-page.md`
- `../overview/current_implementation.md`, `../overview/requirements.md`
- `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`
