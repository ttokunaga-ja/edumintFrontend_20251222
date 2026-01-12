# テスティングガイド

このドキュメントは、EduMint フロントエンドプロジェクトのテスト実行、デバッグ、CI/CD のセットアップに関する完全なガイドです。

## 目次

1. [セットアップ](#セットアップ)
2. [ユニットテスト (Vitest)](#ユニットテスト-vitest)
3. [E2E テスト (Playwright)](#e2e-テスト-playwright)
4. [CI/CD](#cicd)
5. [トラブルシューティング](#トラブルシューティング)

---

## セットアップ

### 前提条件

- Node.js >= 18.x
- npm >= 9.x

### 初期セットアップ

```bash
# 依存関係をインストール
npm ci

# Playwright ブラウザをインストール（E2E テスト実行前に必須）
npx playwright install --with-deps
```

> **注意**: `npx playwright install --with-deps` は E2E テスト実行前に必ず実行してください。ブラウザバイナリがないとテストは失敗します。

---

## ユニットテスト (Vitest)

### 基本的な実行

```bash
# すべてのユニットテストを実行
npm test

# または（明示的に test:unit を使用）
npm run test:unit
```

### ウォッチモードで実行

```bash
# ウォッチモードを有効にしてテスト
npx vitest
```

### 特定のテストファイルを実行

```bash
# 特定のテストファイルを実行
npx vitest tests/features/exam/ExamPage.test.tsx

# ファイル名パターンで実行
npx vitest --include="**/useAuth.test.ts"
```

### 特定のテストケースを実行

```bash
# テスト名でフィルタ
npx vitest -t "should render"

# 正規表現でフィルタ
npx vitest -t "login|logout"
```

### カバレッジレポート生成

```bash
# カバレッジレポートを生成
npx vitest run --coverage
```

---

## E2E テスト (Playwright)

### セットアップ（初回のみ）

```bash
# Playwright ブラウザをインストール
npx playwright install --with-deps
```

### 基本的な実行

```bash
# すべての E2E テストを実行
npm run test:e2e

# または
npx playwright test
```

テストは自動的に開発サーバー (`npm run dev`) を起動します（`playwright.config.ts` の `webServer` 設定）。

### ブラウザ指定で実行

```bash
# Chromium のみで実行
npx playwright test --project=chromium

# Firefox のみで実行
npx playwright test --project=firefox

# WebKit のみで実行
npx playwright test --project=webkit
```

### UI モードで実行（推奨: デバッグ）

```bash
# 対話的な UI モードを開く
npm run test:e2e:ui

# または
npx playwright test --ui
```

UI モードでは、テストの実行をステップバイステップで確認し、スクリーンショットやトレースを詳細に調査できます。

### デバッグモードで実行

```bash
# デバッガーを開いて実行
npm run test:e2e:debug

# または
npx playwright test --debug
```

デバッグモードでは、Chrome DevTools が自動的に開き、テスト実行中にステップバイステップでコードを追跡できます。

### ヘッドレスモードを無効にして実行

```bash
# ブラウザ画面を表示して実行（ブラウザが非表示にならない）
npm run test:e2e:headed

# または
npx playwright test --headed
```

### 特定のテストファイルを実行

```bash
# 特定のテストファイルを実行
npx playwright test tests/e2e/auth.spec.ts

# または複数ファイルを指定
npx playwright test tests/e2e/auth.spec.ts tests/e2e/scenario.spec.ts
```

### 特定のテストケースを実行

```bash
# テスト名でマッチするテストを実行
npx playwright test -g "ログイン"

# 複数のパターンで実行
npx playwright test -g "ログイン|登録"
```

### 失敗したテストのみ実行

```bash
# 前回実行時に失敗したテストのみを再実行
npx playwright test --last-failed
```

### 特定のブラウザで特定のテストを実行（推奨: トラブルシューティング）

```bash
# 例: Chromium で auth.spec.ts の「ログイン」テストのみを実行
npx playwright test tests/e2e/auth.spec.ts -g "ログイン" --project=chromium --headed --debug

# または
npx playwright test tests/e2e/auth.spec.ts -g "ログイン" --project=chromium --headed --ui
```

### レポート確認

```bash
# HTML レポートを開く（前回実行のレポート）
npx playwright show-report
```

テスト失敗時は `test-results/` フォルダにスクリーンショットと error-context.md が自動的に保存されます。

---

## デバッグテクニック

### 1. スクリーンショット・トレース確認

失敗したテストのスクリーンショットと error-context を確認：

```bash
# test-results/ ディレクトリを確認
ls test-results/
cat test-results/auth-認証フロー-*/error-context.md
```

### 2. ローカル開発サーバーでテスト実行

E2E テスト実行時に開発サーバーが自動起動しますが、手動で制御する場合：

```bash
# ターミナル 1: 開発サーバーを起動
npm run dev

# ターミナル 2: テストを実行（webServer なしで実行）
SKIP_WEB_SERVER=true npx playwright test
```

### 3. ブラウザ DevTools を活用

```bash
# デバッグモードで実行し、ブラウザ DevTools を使用
npm run test:e2e:debug

# または UI モードで実行
npm run test:e2e:ui
```

### 4. ページのスクリーンショットを手動取得

テスト実行中にスクリーンショットを取得する場合、テスト内に以下を追加：

```typescript
// テスト内で任意のタイミングでスクリーンショットを取得
await page.screenshot({ path: 'screenshot.png' });

// または Playwright Inspector で確認
await page.pause();
```

### 5. ネットワークリクエスト確認

```typescript
// リクエスト・レスポンスをログ出力
page.on('request', request => console.log('>>', request.method(), request.url()));
page.on('response', response => console.log('<<', response.status(), response.url()));
```

---

## よくある E2E テスト失敗とその対処法

### 1. タイムアウト: 要素が見つからない

**原因**: ページロードが遅い、または要素がレンダリングされていない

**対処法**:
```typescript
// デフォルトで10000msのタイムアウトを設定
await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });

// または waitForLoadState を使用
await page.waitForLoadState('networkidle');
```

### 2. フローティング要素がクリックできない

**原因**: 他の要素に隠れている可能性

**対処法**:
```typescript
// スクロール して要素を表示
await element.scrollIntoViewIfNeeded();

// クリック
await element.click();
```

### 3. 認証ページでログインできない

**原因**: ログインフォームが `/` になく `/login` にある

**対処法**:
```typescript
// 明示的に /login ページに移動
await page.goto('/login');
await page.waitForLoadState('networkidle');

// ログインフォームが表示されるまで待機
await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
```

### 4. ネットワークリクエストが完了していない

**原因**: テストがネットワークリクエスト完了を待たずに進む

**対処法**:
```typescript
// ネットワーク待機
await page.waitForLoadState('networkidle');

// または特定のリクエストを待機
await page.waitForResponse(response => response.url().includes('/api/login'));
```

### 5. Playwright ブラウザが見つからない

**原因**: `npx playwright install` を実行していない

**対処法**:
```bash
# ブラウザをインストール
npx playwright install --with-deps
```

---

## CI/CD

### GitHub Actions での自動実行

CI は `.github/workflows/test.yml` で定義されており、以下のタイミングで自動実行されます：

- `main` または `develop` ブランチへのプッシュ
- Pull Request 作成時

### CI でのセットアップステップ

1. Node.js をインストール
2. `npm ci` で依存関係をインストール
3. `npx playwright install --with-deps` でブラウザをインストール
4. ユニットテスト実行: `npm test`
5. E2E テスト実行: `npm run test:e2e`
6. テスト結果・レポートを artifact として保存

### ローカルで CI 環境をシミュレート

```bash
# CI フラグを有効にしてテスト実行（重試行有効）
CI=true npm test
CI=true npm run test:e2e
```

---

## テスト環境変数

### E2E テスト用の環境変数

テスト実行時に以下の環境変数をサポートしています：

| 変数名 | デフォルト | 説明 |
|--------|-----------|------|
| `E2E_BASE_URL` | `http://localhost:5173/` | E2E テストのベース URL |
| `CI` | (なし) | CI 環境フラグ（設定時は重試行有効） |

```bash
# 例: カスタムベース URL で実行
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

---

## ベストプラクティス

### テスト作成時のチェックリスト

- [ ] `await page.waitForLoadState('networkidle')` でページロード完了を待機
- [ ] `await expect(locator).toBeVisible({ timeout: 10000 })` で要素表示を明示的に待機
- [ ] ログイン関連テストは `/login` ページに明示的に移動
- [ ] 要素が見つからない場合は、スクリーンショットで UI を確認
- [ ] テスト失敗時は `test-results/` 内のスクリーンショット・error-context を確認

### テスト実行時のチェックリスト

- [ ] `npm ci` で依存関係をインストール
- [ ] `npx playwright install --with-deps` でブラウザをインストール
- [ ] 開発サーバーが起動しているか確認（または `webServer` 設定を利用）
- [ ] E2E テスト失敗時は `--ui` または `--headed` で手動確認
- [ ] デバッグが必要な場合は `--debug` で Playwright Inspector を使用

---

## 参考リンク

- [Playwright 公式ドキュメント](https://playwright.dev)
- [Vitest 公式ドキュメント](https://vitest.dev)
- [プロジェクト README](../README.md)

---

## サポート

テストに関する質問や問題がある場合は、以下の手順でお問い合わせください：

1. `test-results/` フォルダ内のスクリーンショット・error-context を確認
2. CI ログ（GitHub Actions）を確認
3. ローカルで `npm run test:e2e:ui` で手動確認
4. 問題が解決しない場合は、開発チームに報告してください

