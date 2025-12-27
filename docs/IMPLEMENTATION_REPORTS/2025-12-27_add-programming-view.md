---
title: "Add ProgrammingView (View) with story & snapshot tests"
date: "2025-12-27"
phase: "phase-2-view-programming"
branch: "refactor/problem-types/programming-view"
pr_url: "TBD"
owner: "GitHub Copilot"
status: "Completed"
affected_paths:
  - "src/components/problemTypes/ProgrammingView.stories.tsx"
  - "src/components/problemTypes/__tests__/ProgrammingView.test.tsx"
index_updates:
  updated: false
file_count_delta: 2
time_spent_hours: 0.7
---

## 概要
プログラミング問題の表示コンポーネントに Storybook ストーリーと snapshot テストを追加しました。

## 変更点
- `ProgrammingView.stories.tsx` を追加
- `__tests__/ProgrammingView.test.tsx` を追加（snapshot テスト 2 件）

## テスト / 検証
- `pnpm run test` : ローカルでスナップショット生成とテストの実行を確認

## 次のアクション
- CodeReading の View を追加します
