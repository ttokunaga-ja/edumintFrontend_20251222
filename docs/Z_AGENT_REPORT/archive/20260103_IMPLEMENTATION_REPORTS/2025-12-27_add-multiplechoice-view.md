---
title: "Add MultipleChoiceView (View) with story & snapshot tests"
date: "2025-12-27"
phase: "phase-2-view-multiplechoice"
branch: "refactor/problem-types/multiplechoice-view"
pr_url: "TBD"
owner: "GitHub Copilot"
status: "Completed"
affected_paths:
  - "src/components/problemTypes/MultipleChoiceView.stories.tsx"
  - "src/components/problemTypes/__tests__/MultipleChoiceView.test.tsx"
index_updates:
  updated: false
file_count_delta: 3
time_spent_hours: 1
---

## 概要
MultipleChoice の表示コンポーネントに対して Storybook ストーリーと snapshot テストを追加しました。選択肢表示と、解答表示（showAnswer）の両ケースを確認します。

## 変更点
- `MultipleChoiceView.stories.tsx` を追加
- `__tests__/MultipleChoiceView.test.tsx` を追加（snapshot テスト 2 件）

## テスト / 検証
- `pnpm run test` : 全テストが通過

## 次のアクション
- MultipleChoiceEdit の統合テストを追加、または次のタイプ（Cloze）へ進める
