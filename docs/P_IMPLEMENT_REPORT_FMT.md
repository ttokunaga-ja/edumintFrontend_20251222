# Implementation Report Template（Frontend）

各フェーズ完了時に `reports/phase_<n>_report.md` をこのフォーマットで生成すること。特に JSON ブロックは機械読み取り前提のため構文エラー禁止。

````markdown
# Phase [X] Implementation Report

## 1. Overview
- **Status**: [COMPLETED / INCOMPLETE / BLOCKED]
- **Date**: YYYY-MM-DD
- **Target Tasks**: 実施したタスク ID を列挙 (例: 1-1, 1-2)

## 2. Implemented Changes
- 主要なコンポーネント/ページ/サービスクライアントと設計意図を箇条書きで記載
- 例: `src/src/pages/HomePage.tsx`: FIGMA 版へ切替、SearchFilters/ServiceHealth 連動を統一。
- 例: `src/src/services/api/gateway.ts`: ベースURL必須化、Zod バリデーション追加。

## 3. Test Results
- **Unit Tests**: Pass: [N], Fail: [N]
- **Coverage**: [N]%
- **Storybook/VR**: 実行有無と結果
- **E2E**: submit/search/health CTA の有無と結果
- **Known Issues**: 失敗やスキップしたテストがあれば記述

## 4. Deviations from Requirements
- 要件や設計と異なる実装をした場合、その理由を明記。なければ "None"。

## 5. Next Phase Preparation

## Sources（参考）
- `../delivery/README.md`, `../delivery/master-plan.md`
- `../archive/P0_COMPLETION_REPORT.md`
- 次フェーズで必要な情報 (追加 env, Feature Flag の切替条件、バックエンド依存) を列挙

---
<!-- MACHINE READABLE SECTION: DO NOT EDIT STRUCTURE -->
```json
{
  "phase": "1",
  "status": "COMPLETED",
  "tasksCompleted": ["1-1", "1-2"],
  "tasksPending": ["1-3"],
  "errors": [
    {"msg": "Integration test failed on DB timeout", "impact": "retry", "action": "increase timeout"}
  ],
  "nextActions": ["rerun integration after increasing timeout"],
  "artifacts": [
    "src/src/pages/HomePage.tsx",
    "src/src/services/api/gateway.ts"
  ],
  "dependencies_added": [
    "@tanstack/query-core"
  ],
  "env_vars_required": [
    "VITE_API_BASE_URL",
    "VITE_ENABLE_WALLET"
  ],
  "todo_list": [
    "Add Storybook VR for ProblemView alerts"
  ],
  "context_memory": {
    "health_poll_ms": "60000",
    "feature_flags": ["VITE_ENABLE_WALLET", "VITE_ENABLE_SOCIAL"]
  }
}
```
---
````
