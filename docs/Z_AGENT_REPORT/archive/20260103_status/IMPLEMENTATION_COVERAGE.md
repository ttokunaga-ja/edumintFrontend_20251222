# 実装カバレッジ（例）

## 目的
- 要件（`docs/requirements`）と実装（`src/`）の対応を追跡し、漏れ/重複を防ぐ。

## カバレッジ表（例）
| 要件 | Page | 主なComponent | 実装状況 | PR |
| --- | --- | --- | --- | --- |
| `docs/requirements/C_1_HomeSearchPage_REQUIREMENTS.md` | `src/pages/HomeSearch/HomeSearchPage.tsx` | `src/components/page/HomeSearch/*` | TODO | - |
| `docs/requirements/C_2_ProblemSubmitPage_REQUIREMENTS.md` | `src/pages/ProblemSubmit/ProblemSubmitPage.tsx` | `src/components/page/ProblemSubmit/*` | TODO | - |
| `docs/requirements/C_3_ProblemViewEditPage_REQUIREMENTS.md` | `src/pages/ProblemViewEdit/ProblemViewEditPage.tsx` | `src/components/page/ProblemViewEdit/*` | TODO | - |

## 運用ルール（例）
- PR を作るたびに、この表を更新する（最低でも対象行）
- 未確定（API/仕様）は TODO として残し、`cloudcode/reports/` に質問として記録する
