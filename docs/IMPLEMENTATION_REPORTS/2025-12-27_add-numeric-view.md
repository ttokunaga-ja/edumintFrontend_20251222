---
title: "Add NumericView (View) with story & snapshot tests"
date: "2025-12-27"
phase: "phase-2-view-numeric"
branch: "refactor/problem-types/numeric-view"
pr_url: "TBD"
owner: "GitHub Copilot"
status: "Completed"
affected_paths:
  - "src/components/problemTypes/NumericView.stories.tsx"
  - "src/components/problemTypes/__tests__/NumericView.test.tsx"
index_updates:
  updated: false
file_count_delta: 2
time_spent_hours: 0.6
---

## 概要
Numeric の表示コンポーネントに Storybook ストーリーと snapshot テストを追加しました。

## 変更点
- `NumericView.stories.tsx` を追加
- `__tests__/NumericView.test.tsx` を追加（snapshot テスト 2 件）

## テスト / 検証
- `pnpm run test` : ローカルでテストを実行してスナップショットを生成、主要テスト通過

## 次のアクション
- TrueFalse / Programming / CodeReading の View を順次追加します
