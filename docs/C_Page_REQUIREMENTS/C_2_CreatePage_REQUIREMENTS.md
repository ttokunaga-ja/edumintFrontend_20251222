# C_2 ProblemCreate Page REQUIREMENTS

## 機能要件
- 生成フローの単一ページ化
  - ページ遷移なしで以下の3つのフェーズを切り替える。
    1. 生成開始 (Generation Start)
    2. 構造確定 (Structure Confirmed)
    3. 生成完了 (Generation Completed)
- プログレスバー（進捗表示）
  - 画面上部に常時進捗を表示。
- トグルによる生成元の切り替え
  - Toggle Label: `[ 演習問題から生成 | 資料から生成 ]`
  - トグルに応じて、アップロード後の設定オプション内容が完全に切り替わる。
- フェーズごとのUI構成とコンポーネント分割
  1. **生成開始フェーズ**
     - プログレスバー
     - トグルスイッチ: `[ 演習問題から生成 | 資料から生成 ]`
     - アップロードエリア（FileUploadBlock）
     - 生成元別オプションエリア（ExerciseOptions / DocumentOptions）
       - ※このオプション部分は生成元によってロジックが異なるため、別コンポーネントとしてファイルを分けること。
       - **共通項目**:
         - 図表を使用 (Checkbox, Default: ON)
         - 問題構造を確認 (Checkbox, Default: OFF)
         - 生成問題を公開 (Checkbox, Default: OFF)
       - **演習問題から生成 限定項目**:
         - 難易度 (Select: 自動判別[Default], 基礎, 標準, 応用, 難関)
       - **資料から生成 限定項目**:
         - 難易度 (Select: 自動判別[Default], 基礎, 標準, 応用, 難関)
         - 問題数 (Input/Slider: Default 10, Range 5-20)
         - 問題形式 (Checkbox Group):
           - 「自動設定」チェックボックス (Default: ON)
           - OFF時にアコーディオン展開: 個別指定（記述式、選択式、穴埋め式、正誤判定、数値計算式、証明問題、プログラミング、コード読解）の複数選択
  2. **構造解析フェーズ**
     - `ProblemViewEditPage` のコンポーネントを再利用し、メタデータ・構造・キーワードを編集。
  3. **生成完了かフェーズ**
     - `ProblemViewEditPage` の機能をフルに使用し、問題本文や解答まで含めて編集。

## 画面レイアウト（図形式）

### 1. 生成開始 (Generation Start)
```text
┌──────────────────────────────────────────────────────────────┐
│ TopMenuBar (Provided by App.tsx)                             │
├──────────────────────────────────────────────────────────────┤
│ Progress Bar: [生成開始] ── 構造解析 ── 生成完了                 │
├──────────────────────────────────────────────────────────────┤
│ Toggle: [ 演習問題から生成 | 資料から生成 ]                      │
├──────────────────────────────────────────────────────────────┤
│ File Upload Block                                            │
│ (Drag & Drop area)                                           │
├──────────────────────────────────────────────────────────────┤
│ Type-specific Options Block (Dynamic component)              │
│ (DocumentOptions.tsx or ExerciseOptions.tsx)                 │
└──────────────────────────────────────────────────────────────┘
```


### 1.5. 問題構造を解析中 (Problem Structure Parsing)
```text
┌──────────────────────────────────────────────────────────────┐
│ TopMenuBar (Provided by App.tsx)                             │
├──────────────────────────────────────────────────────────────┤
│ Progress Bar: 生成開始 [──] 構造解析 ── 生成完了                 │
├──────────────────────────────────────────────────────────────┤
│ 問題構造を解析中                                              │
└──────────────────────────────────────────────────────────────┘
```




### 2. 構造確定 (Structure Confirmed)
```text
┌──────────────────────────────────────────────────────────────┐
│ TopMenuBar (Provided by App.tsx)                             │
├──────────────────────────────────────────────────────────────┤
│ Progress Bar: 生成開始 ── [構造解析] ── 生成完了                 │
├──────────────────────────────────────────────────────────────┤
```
## 構造イメージ（閲覧モード）
```
[問題情報 Metadata]
  - タイトル / 科目・年度 / 大学 /
[大問ブロック #1]
  ├─ Header: 大問番号 / 難易度 / 大問キーワード（チップ複数）
  └─ 小問ブロック群
       [小問 #1]
         - Header: 小問番号 / 問題形式 / 小問キーワード（チップ複数）
       [小問 #2] ...（同上）

[大問ブロック #2] ... （以降繰り返し）
```


## 構造イメージ（編集モード）

```
[問題情報 Metadata エディタ]
  - タイトル、科目、年度、大学
  - アクションバー: プレビュー切替 / 保存 / 取消

[大問ブロック エディタ #1]
  ├─ Headerフォーム: 大問番号（必須） / 難易度 / 大問キーワード（チップ追加・削除）
  └─ 小問ブロックエディタ群
       [小問エディタ #1]
         - Headerフォーム: 小問番号 / 問題形式 / キーワード（チップ追加・削除）
       [小問エディタ #2] ...（同上）

[大問ブロック追加/削除]
  - 大問の追加 / 移動 / 削除
  - 小問の追加 / 移動 / 削除
```



### 2.5 演習問題を生成中 (Generating Exercise)
```text
┌──────────────────────────────────────────────────────────────┐
│ TopMenuBar (Provided by App.tsx)                             │
├──────────────────────────────────────────────────────────────┤
│ Progress Bar: 生成開始 ── 構造解析 [──] 生成完了                 │
├──────────────────────────────────────────────────────────────┤
│ 演習問題を生成中 (Generating Exercise)                         │
└──────────────────────────────────────────────────────────────┘
```


### 3. 生成完了 (Generation Completed)
```text
┌──────────────────────────────────────────────────────────────┐
│ TopMenuBar (Provided by App.tsx)                             │
├──────────────────────────────────────────────────────────────┤
│ Progress Bar: 生成開始 ── 構造解析 ── [生成完了]                 │
├──────────────────────────────────────────────────────────────┤
## 構造イメージ（閲覧モード）
[問題情報 Metadata]
  - タイトル / 科目・年度 / 大学 /

[大問ブロック #1]
  ├─ Header: 大問番号 / 難易度 / 大問キーワード（チップ複数）
  ├─ 大問の問題文（Markdown+LaTeX）
  └─ 小問ブロック群
       [小問 #1]
         - Header: 小問番号 / 問題形式 / 小問キーワード（チップ複数）
         - 小問の問題文
         - 解答・解説（折りたたみ可能）
       [小問 #2] ...（同上）

[大問ブロック #2] ... （以降繰り返し）

```

## 構造イメージ（編集モード）
```
[問題情報 Metadata エディタ]
  - タイトル、科目、年度、大学、作成者などのフォーム
  - 公開設定 / ステータス / 閲覧数系は表示のみ（編集不可）
  - アクションバー: プレビュー切替 / 保存 / 取消

[大問ブロック エディタ #1]
  ├─ Headerフォーム: 大問番号（必須） / 難易度 / 大問キーワード（チップ追加・削除）
  ├─ 大問問題文エディタ（Markdown対応テキストエリア）
  └─ 小問ブロックエディタ群
       [小問エディタ #1]
         - Headerフォーム: 小問番号 / 問題形式 / キーワード（チップ追加・削除）
         - 小問問題文エディタ
         - 解答・解説エディタ
         - 解答折りたたみ設定・表示切替
       [小問エディタ #2] ...（同上）

[大問ブロック追加/削除]
  - 大問の追加 / 移動 / 削除
  - 小問の追加 / 移動 / 削除
```



## 実装上の注意
- **モジュール化の徹底**: `CreatePage.tsx` にコンポーネントや重いロジックを直接記述しない。
  - サブコンポーネントは `src/components/page/CreatePage/` フォルダへ配置。
  - フックやロジックは `src/pages/CreatePage/hooks/` 等へ配置。
- **無駄なレンダリングの抑制**: プログレスバーなどの「不変ブロック」は再レンダリングを避け、変更が必要なコンテンツエリアのみを更新する。
- **コンポーネントの再利用**: `ProblemViewEditPage` 由来のコンポーネント（Meta/Question/Answer等）を積極的に再利用し、一貫したエディタ体験を提供すること。
- **状態管理**: Zustand を使用してジョブステータスを管理。フェーズは命名規則（Structure_/Generation_）に従う。
- **リアルタイム通信**: WebSocket を優先、接続不可時はポーリング（5秒間隔）にフォールバック。JWT認証必須。
- **オプション機能**: 構造確認スキップ（自動確定）、自動公開をサポート。チェックボックスで制御。
- **エラー処理**: WebSocket切断時は再接続、タイムアウト時はポーリング。エラー時はリトライボタン表示。
- **テスト**: ユニット（Jest）でフック/ストア、E2Eでフルフロー（モックWebSocket）。

## 状態遷移・API (Structure_x / Generation_x / Publication_x の三段管理)
- 命名規則: フェーズごとにIDを割り振り、厳密に管理する。
  - **Structure Phase (0-9)**
    - 0: `structure_uploading` (ファイルアップロード中)
    - 1: `structure_queued` (解析待ちキューイング)
    - 2: `structure_analysing` (AIによる構造解析中)
    - 3: `structure_confirmed` (構造解析完了、ユーザー確認待ち)
    - 4: `structure_completed` (構造確定完了)
    - 8: `structure_failed` (解析失敗)
    - 9: `structure_retry` (再解析リクエスト)
  - **Generation Phase (10-19)**
    - 10: `generation_preparing` (生成準備中)
    - 11: `generation_queued` (生成待ちキューイング)
    - 12: `generation_creating` (AIによる問題生成中)
    - 13: `generation_confirmed` (生成完了、ユーザー確認待ち)
    - 14: `generation_completed` (生成確定完了)
    - 18: `generation_failed` (生成失敗)
    - 19: `generation_retry` (再生成リクエスト)
  - **Publication Phase (20-29)**
    - 20: `publication_saving` (DB保存中)
    - 21: `publication_publishing` (公開処理中)

- フロー分割と一方向遷移
  1. Structure 系: 0 → 1 → 2 → 3 → 4 (例外: 3 → 9 → 1 で再解析)
  2. Generation 系: 4 → 10 → 11 → 12 → 13 → 14 (例外: 13 → 19 → 11 で再生成)
  3. Publication 系: 14 → 20 → 21

- 遷移トリガとAPI
  - WebSocket/SSE を優先通信方式とし、リアルタイムでステータスID更新。
  - `structure_confirmed` (3) への遷移: WebSocket で ID:3 受信時。構造確認OFFの場合、自動で 4 へ遷移。
  - `generation_confirmed` (13) への遷移: WebSocket で ID:13 受信時。自動公開の場合、自動で 20 へ遷移。
- UIコンポーネント分割
  - 前半を管理するコンポーネント: Structure_* の状態表示と操作（再解析ボタンなど）。
  - 後半を管理するコンポーネント: Generation_* の状態表示と操作（リトライ/キャンセルなど）。

## レイヤー規格（z-indexと重なり順の統一ルール）
- 目的: トップバーより前面に通常コンテンツがかぶる等の不具合を防ぎ、全ページで一貫した重なり順を維持する。
- スケール定義:
  - 900台: グローバルオーバーレイ層（999: モーダル最前面、950: ドロワー/全画面メニュー、930: Toast/ポップアップ）
  - 800台: ナビ層（899: TopMenuBar、850: サブナビ/固定タブ）
  - 700台: ページ上位コンテナ（750: ページ固有ヘッダー/ステップバー）
  - 600台: 固定補助（650: 固定サイド/追従カード）
  - 500台: 通常コンテンツ（カード/フォーム。原則 z-index 指定なし）
  - 400台: 背景演出（装飾用のみ）
- 運用ルール:
  - z-index は必要最小限。レイヤー種別に合わせ固定値を使い、props で自由な値を受け取らない。
  - ドロップダウン/ツールチップ/ポップオーバーはポータルルートで z-930 に統一。
  - モーダル/ドロワーは Overlay z-950、Content z-999 の固定パターンを採用。
  - TopMenuBar は常に z-899、ページ固有ヘッダー/進捗バーは z-750 以内、通常カードは z 指定なし。
  - transform/filter/backdrop-filter による不要なスタッキングコンテキスト生成を避ける。
  - 新規コンポーネントが z-index を要する場合、上記スケールから選び、レビュー時に種別を明記する。

## 状態遷移図とバックエンド連携

**目的**: フロントで表示するフェーズとバックエンドのジョブ状態を一義に対応させ、状態の逆行やスキップが起きないようにする。

- **設計方針**: 構造確定（Structure_confirmed）のみユーザー操作での戻り（再解析など）を許容し、その他の状態は原則一方向遷移とする。各状態はバックエンドの `status` で表現する。通信は WebSocket を優先、フォールバックでポーリング。

### 状態一覧（フロント表示 ⇄ バックエンド）
- `structure_uploading` (0)
  - 条件: ファイルアップロード中。
  - UI: 進捗バー、失敗ファイルのみ再送可。
- `structure_queued` (1)
  - 条件: 解析待ちキューイング。
  - UI: 「解析待ち...」
- `structure_analysing` (2)
  - 条件: AIによる構造解析中。
  - UI: 「構造を解析中...」、キャンセル可。
- `structure_confirmed` (3)
  - 条件: 構造解析完了、ユーザー確認待ち。
  - UI: 編集/保存/スキップ。確定すると `structure_completed` (4) へ。
- `structure_failed` (8)
  - 条件: 解析失敗。
  - UI: エラー表示 + リトライ (`structure_retry` (9) へ)。
- `generation_preparing` (10)
  - 条件: 生成準備中（構造データの保存など）。
  - UI: 「生成準備中...」
- `generation_queued` (11)
  - 条件: 生成待ちキューイング。
  - UI: 「生成待ち...」
- `generation_creating` (12)
  - 条件: AIによる問題生成中。
  - UI: 進捗表示、キャンセル可。
- `generation_confirmed` (13)
  - 条件: 生成完了、ユーザー確認待ち。
  - UI: 生成結果プレビュー。確定すると `generation_completed` (14) へ。
- `generation_completed` (14)
  - 条件: 生成確定完了。
  - UI: 完了画面、公開設定へ。
- `generation_failed` (18)
  - 条件: 生成失敗。
  - UI: エラー表示 + リトライ (`generation_retry` (19) へ)。
- `publication_saving` (20)
  - 条件: DB保存中。
  - UI: 「保存中...」
- `publication_publishing` (21)
  - 条件: 公開処理中。
  - UI: 「公開中...」

### 遷移ルール（厳格）
- 基本線: 0 → 1 → 2 → 3 → 4 → 10 → 11 → 12 → 13 → 14 → 20 → 21
- 逆方向遷移の禁止: 上記列挙以外の逆方向遷移や“スキップ”は禁止。
- 例外（再試行）:
  - `structure_confirmed` (3) → `structure_retry` (9) → `structure_queued` (1)
  - `generation_confirmed` (13) → `generation_retry` (19) → `generation_queued` (11)
- 障害: 任意の処理中に致命的エラーが発生した場合は `*_failed` (8, 18) に遷移し、ユーザー操作でリトライ。

### イベント / API 連携（例）
- フロントは WebSocket イベントで `status` を受け取り、上記の一方向遷移制約に従って UI を更新する。フォールバックでポーリング。
- WebSocket メッセージ例 (JSON):

```json
{
  "type": "status_update",
  "status": "Structure_parsing",
  "message": "構造を解析中...",
  "progress": 50,
  "data": {...}
}
```

- `status` はフロントで表示する状態、`progress` はプログレスバーに利用、`data` は構造データや生成結果。

### 実装注意（フロント）
- 状態遷移はバックエンドの `status` を起点に判定し、フロント側で勝手に遷移を進めない。
- 状態遷移のバリデーションをフロントで実装し、受信した `status` が現在の許容次状態でない場合は警告ログを出す（ロールバックや自動補正はしない）。
- `structure_review` の編集で差戻し（再解析）を要求する API を明示し、ユーザー操作による戻りのみ許可する。

必要なら、この遷移定義を mermaid 形式での図に変換してドキュメントに埋め込みます。希望があれば指示してください。

### `nextAllowed` フラグと「構造確認 OFF」時の挙動提案

#### 概要
- 各状態に対してサーバから `nextAllowed: boolean` を返すことで、フロントは「次へ進めるか」を明示的に制御できます。これは UI のボタン活性制御とバリデーションに用います。
- `nextAllowed` はバックエンドがそのジョブの内部条件・リソース状況（例: 必須検証済み、生成スロット確保など）を満たしたときに true になります。

#### API 拡張例
```json
{
  "jobId": "abc-123",
  "status": "structure_detecting",
  "currentStep": "structure_detecting",
  "progress": 0.65,
  "nextAllowed": false,
  "canRetry": true,
  "message": "Detecting structure",
  "errorCode": null
}
```

#### フロント実装案
- ボタン/アクションは `nextAllowed` を参照して有効化する（例: `構造確認へ進む` ボタンは `nextAllowed === true` のときのみ活性化）。
- サーバが `nextAllowed: false` を返す場合、フロントはその理由を `message` でユーザーに表示する（例: "OCR完了待ち"）。
- 受信ステータスが現在状態から許容される遷移先に含まれていない場合は UI を遷移させず、デバッグログを残す。自動補正は行わない。

#### 構造確認を OFF にした場合の処理オプション（推奨）
1. 自動確定（推奨デフォルト）
  - フラグ名: `auto_confirm_structure: true`
  - 挙動: `structure_detecting` 終了後、バックエンドが自動的に検出構造を確定し `structure_review` をスキップして `generation_waiting` へ遷移する。
  - メリット: ユーザー介入を排して高速に生成に移行できる。UI は簡易プレビューを表示するが編集不可。
  - 注意: 一方向遷移ルールに則り、構造の差戻し（再解析）は不可となる。

2. 非表示（ソフトスキップ）
  - フラグ名: `structure_skipped: true`
  - 挙動: `structure_review` フェーズは実行しないが、サーバは内部的に `structure_detecting` の結果を保持して `structure_review` 相当の自動検証を行い、問題が重大な不整合を起こしていないかチェックしたのち `generation_waiting` へ遷移する。
  - メリット: 自動確定より安全だが、処理時間が僅かに増える可能性あり。
  - 注意: この場合もユーザーによる差戻しは不可とする（要望があれば別 API で再解析をリクエスト可能にする）。

3. 強制確認（非推奨）
  - フラグ名: `force_review: true`
  - 挙動: ユーザーが OFF にしても `structure_review` を必ず挟む（実務では OFF の意図に反するため非推奨）。

#### UI 表示案（構造確認 OFF の場合）
- プレビュー: 構造を読み取り専用で簡易表示（編集不可）
- バッジ/注記: "構造確認はスキップされています (自動確定)"
- 取り消し: スキップ後にユーザーが構造を再解析したい場合は、別 API (`/jobs/{id}/request-structure-reanalysis`) を用意し、これはバックエンドで新規ジョブまたは再解析パスを走らせる（ただしこの再解析は新たな一方向の流れとして扱う）

#### セキュリティ/一貫性に関する注意
- 自動確定で誤抽出が起こった場合の対処設計（ログ、差分レポート、ユーザーによる再解析リクエスト経路）を用意すること。
- `nextAllowed` を信頼するのはフロントのみでなく、サーバ側でも状態遷移の正当性チェックを必ず行うこと。

この追記により、フロントは受信 `status` と `nextAllowed` を見て厳密に UI を制御でき、構造確認 OFF の場合も挙動が明確になります。

## フロントエンド実装担当者への指示

以下の指示は、問題生成プロセス（UC-10/UC-11）のフロントエンド状態管理を実装するためのものです。上記の会話履歴を基に、React + TypeScript を前提とした設計をまとめています。`Archetecture.md` のマイクロサービスアーキテクチャ（イベント駆動、ゲートウェイ経由の通信）を遵守し、リアルタイム更新を優先。実装は Zustand（状態管理）、WebSocket（リアルタイム通信）、ポーリング（フォールバック）を用います。

#### 1. 全体概要と目的
- **目的**: ユーザーがファイルをアップロード後、AIによる問題生成を非同期で監視・制御。構造確認（オプション）と自動公開（オプション）をサポートし、リアルタイムで進捗を表示。バックエンド（`eduanimaAiWorker`、`eduanimaContent` など）からステータス通知を受け、UIを更新。
- **プロセスフロー**:
  1. アップロード → 構造解析 → 構造確定（確認/修正） → 生成 → 完了（公開）。
  2. スクリプト分割: フェーズ1（Structure: アップロード〜構造確定）、フェーズ2（Generation: 構造確定〜完了）。
- **技術スタック**: React/TypeScript, Zustand (状態管理), WebSocket/SSE (リアルタイム), Axios (API呼び出し), React Progress Bar (UI)。
- **前提**: `eduanimaGateway` が WebSocket エンドポイントを提供（例: `ws://gateway.edu/jobs/{jobId}`）。JWT認証必須。エラー時はリトライ可能。
- **納期/優先度**: MVPフェーズ1に必須。テストはユニット + E2E（Cypress）。

#### 2. 状態管理の実装
- **ストア (Zustand)**: `stores/jobStore.ts` を作成。ジョブID、フェーズ、データ、エラーを管理。
  ```typescript
  interface JobState {
    jobId: string | null;
    phase: 'idle' | 'Structure_uploading' | 'Structure_parsing' | 'Structure_confirmed' | 'Generation_creating' | 'Generation_completed' | 'Structure_failed' | 'Generation_failed';
    data: any; // 構造データや生成結果
    error: string | null;
    setJob: (jobId: string) => void;
    updatePhase: (phase: string, data?: any) => void;
    setError: (error: string) => void;
  }
  ```
  - フェーズは命名規則（Structure_/Generation_）に従う。`updatePhase` でUIをトリガー。

- **WebSocketフック**: `hooks/useWebSocket.ts` を作成。接続管理とメッセージハンドリング。
  ```typescript
  export const useWebSocket = (jobId: string | null) => {
    const { updatePhase, setError } = useJobStore();
    useEffect(() => {
      if (!jobId) return;
      const ws = new WebSocket(`ws://gateway.edu/jobs/${jobId}?token=${localStorage.getItem('jwt')}`);
      ws.onmessage = (event) => {
        const { status, message, progress, data, error } = JSON.parse(event.data);
        if (error) setError(error);
        else updatePhase(status, data);
      };
      ws.onerror = () => setError('WebSocket error');
      return () => ws.close();
    }, [jobId]);
  };
  ```
  - フォールバック: WebSocket 失敗時はポーリング（setInterval で `/api/jobs/{jobId}/status` GET）。

#### 3. コンポーネントの実装
- **メインコンポーネント**: `components/ProblemGenerator.tsx`。アップロード、進捗表示、確認フォーム、結果表示を統合。
  - **UI要素**:
    - ファイルアップロード: `<input type="file" />` + アップロードボタン。
    - オプション: チェックボックス（構造確認スキップ、自動公開）。
    - 進捗バー: `react-progress-bar` で `progress` を表示。
    - メッセージ: ステータスに応じたテキスト（例: "構造を解析中..."）。
    - 確認フォーム: `Structure_confirmed` で構造JSONを表示、修正可能。
    - 結果表示: `Generation_completed` で生成問題を表示、公開ボタン（自動時はスキップ）。
  - **ロジック**:
    - アップロード: `fetch('/api/upload', { method: 'POST', body: formData })` → `setJob(jobId)`。
    - 確認: `fetch('/api/jobs/{jobId}/confirm', { method: 'POST' })`。
    - 公開: `fetch('/api/jobs/{jobId}/publish', { method: 'POST' })`。
    - エラー: リトライボタンで再アップロード。

- **スクリプト分割**:
  - **フェーズ1スクリプト (Structureフェーズ管理)**: `hooks/useStructurePhase.ts`。アップロード〜構造確定を担当。WebSocket で `Structure_*` ステータスを監視、確認フォームを表示。
  - **フェーズ2スクリプト (Generationフェーズ管理)**: `hooks/useGenerationPhase.ts`。構造確定〜完了を担当。`Generation_*` ステータス監視、生成結果表示。

#### 4. ステータスフィードバックの統合
- バックエンドから受信するステータスをフロントエンドにマッピング（WebSocketメッセージ例: `{status: 'Structure_parsing', message: '構造を解析中...', progress: 50}`）。
- 各ステータスのUI対応:
  - `Structure_uploading`: アップロード中表示。
  - `Structure_parsing`: 解析中 + 進捗バー。
  - `Structure_confirmed`: 確認フォーム表示（スキップ時は自動遷移）。
  - `Generation_creating`: 生成中 + 進捗バー。
  - `Generation_completed`: 結果表示 + 公開（自動時は即実行）。
  - `*_failed`: エラーメッセージ + リトライボタン。
- 命名規則: Structure_/Generation_ を厳守。ストアの `phase` で条件分岐。

#### 5. 注意点とベストプラクティス
- **セキュリティ**: JWTトークンでWebSocket認証。PIIはマスキング。
- **エラー処理**: WebSocket切断時はポーリングに切り替え。タイムアウト（30秒）でエラー表示。
- **パフォーマンス**: ストア更新で不要なリレンダーを避ける（React.memo）。
- **テスト**: ユニット（Jest）でフック/ストア、E2Eでフルフロー（モックWebSocket）。
- **拡張性**: 将来の複数ジョブ対応のため、ストアを配列化可能。
- **依存関係**: `npm install zustand react-progress-bar`。ゲートウェイAPI仕様を確認。

この指示に従い、実装を開始してください。質問があれば随時対応。
