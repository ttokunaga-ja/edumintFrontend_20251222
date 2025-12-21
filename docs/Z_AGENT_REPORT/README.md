# FIGMAAi(CloudCode) 出力置き場

このフォルダ配下に、FIGMAAi(CloudCode) / AICodexAgent の出力（報告書、提案書、現状整理）を集約する。  
散逸防止のため、AI出力は原則ここ以外に置かない。

## フォルダ構成
- `cloudcode/reports/`: 実装内容の報告書（`V_IMPLEMENT_REPORT_FMT.md` 準拠）
- `cloudcode/proposals/`: 今後の実装の提案書（改善案/追加機能/リファクタ候補）
- `cloudcode/status/`: 現状の実装サマリ（導線/画面対応状況/未実装一覧）

## ファイル命名（例）
- reports: `YYYYMMDD_feature-xxx_report.md`
- proposals: `YYYYMMDD_feature-xxx_proposal.md`
- status: `STATUS.md` / `IMPLEMENTATION_COVERAGE.md`

## 推奨テンプレ（例）
- 実装レポート: `V_IMPLEMENT_REPORT_FMT.md`
- 実ファイルテンプレ: `cloudcode/reports/REPORT_TEMPLATE.md`
- 提案書（例）:
  - 背景 / 問題
  - 提案（何を/なぜ/どうやって）
  - 影響範囲（画面/API/データ）
  - リスクと段階導入（Feature Flag）
  - 工数見積（任意）
- 実ファイルテンプレ: `cloudcode/proposals/PROPOSAL_TEMPLATE.md`
- 現状サマリ（例）:
  - 実装済み画面/未実装画面
  - 既知のTODO/技術的負債
  - 直近の次アクション
- 実ファイル例: `cloudcode/status/STATUS.md` / `cloudcode/status/IMPLEMENTATION_COVERAGE.md`
