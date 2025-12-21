# CodexAgent 用 ドキュメント索引 (作成順)

個別に分割したテンプレート/方針ドキュメントへのリンク集。各ファイルは接頭辞で作成順を示す。A_ は索引（本ファイル）。

## A-Z (edumintFrontendDocs) 一覧
- A: 索引 `A_DOC_INDEX.md`（本ファイル）
- B: サービス憲章 `B_SERVICE_CHARTER.md`（責務/非責務とSLO）
- C: 要件定義（FR/NFR）`C_REQUIREMENTS.md`
  - C_1: Home/Search 画面 `C_1_HomePage_REQUIREMENTS.md`
  - C_2: Problem Create 画面（Submit+StructureConfirm+Generating 統合）`C_2_ProblemCreate_REQUIREMENTS.md`
  - C_3: Problem View/Edit 画面 `C_3_ProblemViewEditPage_REQUIREMENTS.md`
  - C_4: MyPage 画面 `C_4_MyPage_REQUIREMENTS.md`
  - C_5: Login/Register 画面 `C_5_LoginRegisterPage_REQUIREMENTS.md`
  - C_6: Admin/Moderation 画面（提案）`C_6_AdminModerationPage_REQUIREMENTS.md`
  - C_7: Generating UI（ProblemCreate 統合ステップ）`C_7_GeneratingPage_REQUIREMENTS.md`
- D: インターフェース仕様（API/Event）`D_INTERFACE_SPEC.md`
  - D_0: 共通コンポーネント `D_0_CommonComponent_REQUIREMENTS.md`
  - D_1: Home/Search コンポーネント `D_1_HomeSearchComponent_REQUIREMENTS.md`
  - D_2: Problem Create コンポーネント `D_2_ProblemSubmitComponent_REQUIREMENTS.md`
  - D_3: Problem View/Edit コンポーネント `D_3_ProblemViewEditComponent_REQUIREMENTS.md`
  - D_4: MyPage コンポーネント `D_4_MyPageComponent_REQUIREMENTS.md`
  - D_5: Login/Register コンポーネント `D_5_LoginRegisterComponent_REQUIREMENTS.md`
  - D_6: Admin/Moderation コンポーネント `D_6_AdminModerationComponent_REQUIREMENTS.md`
- E: データモデル `E_DATA_MODEL.md`
- F: ディレクトリ構造・アーキ原則 `F_ARCHITECTURE.md`
- G: 技術スタック制約 `G_TECH_STACK_CONSTRAINTS.md`
- H: テスト戦略 `H_TEST_STRATEGY.md`
- I: エラー/ログ標準 `I_ERROR_LOG_STANDARD.md`
- J: 環境変数レジストリ `J_ENV_VARS_REGISTRY.md`
- K: Dockerfile方針 `K_DOCKERFILE_POLICY.md`
- L: CI/CD仕様 `L_CICD_SPEC.md`
- M: Feature Flag方針 `M_FEATURE_FLAG_POLICY.md`
- N: 運用・デプロイ概要 `N_OPS_DEPLOY_OVERVIEW.md`
- O: フェーズ別タスクブレークダウン `O_TASK_PHASES.md`
- P: 実装レポートフォーマット `P_IMPLEMENT_REPORT_FMT.md`
- Q: プロンプト雛形（汎用/フェーズ）`PROMPT.md`, `Q_PROMPT.md`
- R: ユースケース定義書 `R_USE_CASES.md`
- S: UI/Visual/Figma 実装ガイド `S_UI_DESIGN_GUIDE.md`
- T: MSW 運用ガイド（通信レイヤのモック）`T_MSW_GUIDE.md`
- Y: Refactor v2（ディレクトリ再編・旧UI→新UI移行）`Y_REFACTOR2_REQUIREMENTS.md`
- Z: MVPリリース向け最小改修 `Z_REFACTOR_REQUIREMENTS.md`

## 集約元（edumintFrontendDocs 外の情報源）
このフォルダ以外に散在していた情報を、上記 A-Z のフォーマットへ整理して参照しやすくするためのソース一覧（元ファイル自体は保持）。

- Overview（要件/現状/優先度/ユースケース）
  - `../overview/requirements.md`, `../overview/ideal-requirements.md`, `../overview/current_implementation.md`
  - `../overview/use-cases.md`, `../overview/refactor-priorities.md`
- Architecture（全体アーキ/DB）
  - `../architecture/edumint_architecture.md`, `../architecture/database.md`
- Implementation（画面/機能/ヘルス/デザイン）
  - `../implementation/pages/home-page.md`, `../implementation/pages/topbar.md`
  - `../implementation/features/file-upload.md`, `../implementation/features/hamburger-menu.md`
  - `../implementation/service-health/README.md`, `../implementation/visual/layout-guide.md`, `../implementation/figma/README.md`
- Migration / Delivery / Archive / QA
  - `../migration/legacy-to-new.md`, `../delivery/README.md`, `../delivery/master-plan.md`
  - `../archive/P0_COMPLETION_REPORT.md`
  - `../qa/README.md`
- Services（バックエンド個別仕様）
  - `../services/search-service/*`（Frontend は Gateway 経由で利用。詳細理解の参照）

### 集約先マップ（トレーサビリティ）
| ソース | 集約先（edumintFrontendDocs） |
| --- | --- |
| `../README.md` | `A_DOC_INDEX.md`（ソース一覧として保持） |
| `../overview/requirements.md` | `C_REQUIREMENTS.md`, `C_1_...`, `C_2_...`, `C_3_...`, `C_4_...`, `C_5_...`, `D_INTERFACE_SPEC.md`, `E_DATA_MODEL.md` |
| `../overview/ideal-requirements.md` | `C_REQUIREMENTS.md`（理想要件の参照） |
| `../overview/current_implementation.md` | `F_ARCHITECTURE.md`, `D_INTERFACE_SPEC.md`, `Z_REFACTOR_REQUIREMENTS.md` |
| `../overview/use-cases.md` | `R_USE_CASES.md`, `C_2_...`, `C_3_...`, `C_6_...`, `C_7_...` |
| `../overview/refactor-priorities.md` | `Z_REFACTOR_REQUIREMENTS.md`, `O_TASK_PHASES.md` |
| `../architecture/edumint_architecture.md` | `B_SERVICE_CHARTER.md`, `F_ARCHITECTURE.md`, `D_INTERFACE_SPEC.md` |
| `../architecture/database.md` | `E_DATA_MODEL.md`（画面データのトレーサビリティ） |
| `../implementation/pages/home-page.md` | `C_1_...`, `D_1_...`, `S_UI_DESIGN_GUIDE.md` |
| `../implementation/pages/topbar.md` | `D_0_...`, `S_UI_DESIGN_GUIDE.md` |
| `../implementation/features/file-upload.md` | `C_2_...`, `D_2_...`, `D_INTERFACE_SPEC.md` |
| `../implementation/features/hamburger-menu.md` | `D_0_...`, `S_UI_DESIGN_GUIDE.md` |
| `../implementation/service-health/README.md` | `D_0_...`, `D_INTERFACE_SPEC.md`, `H_TEST_STRATEGY.md`, `I_ERROR_LOG_STANDARD.md` |
| `../implementation/visual/layout-guide.md` | `S_UI_DESIGN_GUIDE.md`, `G_TECH_STACK_CONSTRAINTS.md` |
| `../implementation/figma/README.md` | `S_UI_DESIGN_GUIDE.md`, `F_ARCHITECTURE.md`, `G_TECH_STACK_CONSTRAINTS.md` |
| `../migration/legacy-to-new.md` | `F_ARCHITECTURE.md`, `O_TASK_PHASES.md`, `Z_REFACTOR_REQUIREMENTS.md` |
| `../delivery/README.md` / `../delivery/master-plan.md` | `O_TASK_PHASES.md`, `P_IMPLEMENT_REPORT_FMT.md` |
| `../archive/P0_COMPLETION_REPORT.md` | `P_IMPLEMENT_REPORT_FMT.md`, `Z_REFACTOR_REQUIREMENTS.md`（参考） |
| `../qa/README.md` | `H_TEST_STRATEGY.md`, `I_ERROR_LOG_STANDARD.md` |
| `../services/search-service/*` | `D_INTERFACE_SPEC.md`（searchService の参考） |
