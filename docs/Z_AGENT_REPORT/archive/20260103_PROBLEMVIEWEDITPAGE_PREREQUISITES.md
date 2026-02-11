# ProblemViewEditPage 実装前提条件・非機能要件ガイド

**対象**: ProblemViewEditPage のリファクタリングを実装する開発者向けドキュメント

**関連ドキュメント**:
- [PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md](./PROBLEMVIEWEDITPAGE_REFACTOR_DESIGN.md) - アーキテクチャ設計
- [PROBLEMVIEWEDITPAGE_DB_API_SPEC.md](./PROBLEMVIEWEDITPAGE_DB_API_SPEC.md) - DB & API 仕様
- [F_ARCHITECTURE.md](./F_ARCHITECTURE.md) - アーキテクチャ規約

---

## 1. 実装前提条件

### 1.1 環境・依存ライブラリ

以下のライブラリがプロジェクトに導入済みであることを確認してください。未導入の場合は事前にインストール。

| ライブラリ | バージョン | 用途 | 確認方法 |
|----------|-----------|------|---------|
| **React** | 19.x | UI フレームワーク | `package.json` |
| **React Hook Form** | 7.x+ | フォーム状態管理 | npm ls react-hook-form |
| **Zod** | 3.x+ | スキーマ検証 | npm ls zod |
| **@hookform/resolvers** | 3.x+ | Zod との連携 | npm ls @hookform/resolvers |
| **TanStack Query** | 5.x+ | サーバー状態管理 | npm ls @tanstack/react-query |
| **MUI v6** | 6.x+ | UI コンポーネント | npm ls @mui/material |
| **Emotion** | 11.x+ | CSS-in-JS | npm ls @emotion/react |
| **React Markdown** | 9.x+ | Markdown 表示 | npm ls react-markdown |
| **remark-math** | 6.x+ | LaTeX 数式対応 | npm ls remark-math |
| **TypeScript** | 5.x+ | 言語 | tsc --version |

**確認スクリプト**:
```bash
# package.json の dependencies を確認
npm ls --depth=0 | grep -E "react|zod|react-hook-form|@tanstack|@mui"
```

### 1.2 アーキテクチャ理解度チェック

実装前に、以下の概念を理解していることを確認：

- [ ] **FormProvider & useFormContext**: React Hook Form の context-based 状態管理
  - リソース: https://react-hook-form.com/form-context
- [ ] **useFieldArray**: 動的な配列フィールド管理（ネスト対応）
  - リソース: https://react-hook-form.com/api/usefieldarray
- [ ] **Zod Schema**: 型安全なスキーマ検証と型推論
  - リソース: https://zod.dev
- [ ] **TanStack Query (React Query)**: サーバー状態管理、キャッシング
  - リソース: https://tanstack.com/query/latest/docs
- [ ] **MUI sx prop**: Emotion ベースのインラインスタイリング
  - リソース: https://mui.com/system/the-sx-prop/

### 1.3 既存コンポーネント・状態

以下の既存コンポーネント・状態は参考用（互換性保持は不要）：

| ファイル | 役割 | 新設計での扱い |
|---------|------|-------------|
| `src/pages/ProblemViewEditPage.tsx` | ページエントリー | リプレイス対象 |
| `src/components/page/ProblemViewEditPage/*` | 詳細コンポーネント | 廃止予定 |
| `AppBarActionContext` | 外部操作（保存ボタン等）の委譲 | 互換性維持（useEffect で値を通知） |
| `useExamDetail`, `useExamEditor` | データ取得・保存 Hook | リプレイス対象 |
| `SubQuestionRepository` | API 通信層 | 互換性保持（useExamQuery で利用） |

### 1.4 開発環境セットアップ

```bash
# リポジトリクローン
git clone <repo>
cd eduanimaFrontend_20251222

# 依存関係インストール
pnpm install

# TypeScript チェック
pnpm typecheck

# 開発サーバー起動
pnpm dev

# テストサーバー起動（MSW mock）
# 自動で起動されます
```

---

## 2. 非機能要件（NFR）

### 2.1 パフォーマンス

| 要件 | 目標値 | 測定方法 |
|------|--------|---------|
| 初期ロード | <= 3秒 | Lighthouse (Performance) |
| 大問追加 | <= 100ms | React DevTools Profiler |
| 小問編集時キー入力反応 | <= 16ms | フレームレート (60fps) |
| 保存処理 | <= 2秒 | Network タブ |
| フォームリセット | <= 50ms | DevTools Profiler |

**最適化戦略**:
- useWatch は必要な部分のみ購読（全フォーム監視は避ける）
- useMemo で計算結果をキャッシュ
- useCallback で不必要な再作成を避ける
- TanStack Query のキャッシング設定を調整

### 2.2 スケーラビリティ

| シナリオ | 対応範囲 | 考慮事項 |
|---------|---------|---------|
| 大問数 | 100+ | ページング・仮想化は不要（通常は < 10） |
| 小問数 | 1000+ | Windowing (react-window) 検討 |
| 選択肢数 | 100+ | useFieldArray のパフォーマンス確認 |
| キーワード数 | 1000+ | 検索フィルタリング実装 |

**実装時注意**:
```typescript
// ❌ 避けるべき: 全フォーム監視
const allValues = useWatch({ control }); // 再レンダリング多発

// ✅ 推奨: 必要な部分のみ監視
const format = useWatch({ control, name: `${basePath}.format` });
```

### 2.3 アクセシビリティ

WCAG 2.1 Level AA 準拠を目標：

| 項目 | 要件 | 実装方法 |
|------|------|---------|
| **キーボード操作** | Tab キーで全操作可能 | MUI コンポーネントはネイティブ対応 |
| **スクリーンリーダー対応** | 見出し、ラベル等が正しく認識 | `aria-label`, `htmlFor` の設定 |
| **色コントラスト** | 4.5:1 以上（通常テキスト） | MUI theme の色定義を準拠 |
| **フォーム検証メッセージ** | 視覚的 & テキスト | `helperText`, `error` の併用 |

**テスト方法**:
```bash
# axe DevTools で自動チェック
# NVDA (スクリーンリーダー) で実際の読み上げ確認
```

### 2.4 セキュリティ

| 対策 | 実装範囲 | 責任 |
|------|---------|------|
| **CSRF 保護** | axios インターセプター（XSRF-TOKEN） | インフラ層（lib/axios.ts） |
| **XSS 対策** | Markdown のサニタイズ | 外部ライブラリ（react-markdown + rehype-sanitize） |
| **認可チェック** | user.id === exam.userId | ページ層（useAuth 確認） & API層（アプリサーバー） |
| **Rate Limiting** | API 呼び出し制限 | アプリサーバー側実装 |
| **Input Validation** | Zod スキーマ検証 | フロント & バック二重検証 |

---

## 3. ディレクトリ作成チェックリスト

実装開始前に以下のディレクトリを新規作成（または既存の確認）：

```bash
# 1. Features ドメインロジック層
mkdir -p src/features/exam/components
mkdir -p src/features/exam/components/formats
mkdir -p src/features/exam/hooks

# 2. 既存削除対象の確認
ls -la src/components/page/ProblemViewEditPage/
ls -la src/features/exam/repositories/

# 3. テスト用ディレクトリ（推奨）
mkdir -p tests/unit/features/exam
mkdir -p tests/component/page/ExamPage
mkdir -p tests/e2e
```

---

## 4. 実装の進め方（フェーズ分割）

### Phase 1: 基盤整備（1-2日）

**成果物**:
- Zod Schema 完成
- useExamQuery, useExamMutation 完成
- テスト用スキーマ定義

**作業**:
```bash
# 1. schema.ts 作成
touch src/features/exam/schema.ts
# → QuestionFormat, Difficulty, ExamSchema 等を定義

# 2. Hooks 作成
touch src/features/exam/hooks/useExamQuery.ts
touch src/features/exam/hooks/useExamMutation.ts

# 3. ユニットテスト（schema バリデーション）
touch tests/unit/features/exam/schema.test.ts
```

### Phase 2: コンポーネント実装（2-3日）

**成果物**:
- ExamEditorLayout 完成
- QuestionList / QuestionItem 完成
- SubQuestionList / SubQuestionItem 完成
- CommonMetadata / QuestionContentField 完成

**実装順序**:
1. 親コンポーネント（ExamEditorLayout）
2. 大問リスト / アイテム（useFieldArray 基本形）
3. 小問リスト / アイテム（ネストされた useFieldArray）
4. 共通UI（メタデータ、Markdown フィールド）

### Phase 3: 形式別エディタ実装（2日）

**成果物**:
- SelectionEditor (ID 1/2/3)
- MatchingEditor (ID 4)
- OrderingEditor (ID 5)
- EssayEditor (ID 10-14)
- FormatRegistry

**実装順序**:
1. SelectionEditor（選択肢が最もシンプル）
2. MatchingEditor
3. OrderingEditor
4. EssayEditor（最も複雑）
5. FormatRegistry で統合

### Phase 4: ページ層・統合（1日）

**成果物**:
- ExamPage.tsx リプレイス版
- AppBarActionContext 連携確認

**実装**:
```bash
# ProblemViewEditPage.tsx をリプレイス
# → useAuth, useAppBarAction と連携
# → FormProvider でラップ
# → useExamQuery, useExamMutation を使用
```

### Phase 5: テスト・デバッグ（2日）

**ユニットテスト**:
```bash
pnpm test tests/unit/features/content/schema.test.ts
pnpm test tests/unit/features/content/hooks/
```

**統合テスト**:
```bash
pnpm test tests/component/page/ProblemViewEditPage/
```

**E2E テスト** (Playwright):
```bash
pnpm exec playwright test tests/e2e/examEdit.spec.ts
```

**ブラウザテスト**:
- http://localhost:5173/problem/exam-1
- 複数大問・小問の動作確認
- 保存フロー確認
- エラーハンドリング確認

---

## 5. コード記述ガイドライン

### 5.1 ファイル構成例

```typescript
// src/features/exam/components/QuestionItem.tsx

import { useFormContext, useWatch } from 'react-hook-form';
import { Paper, Box } from '@mui/material';
import { CommonMetadata } from './CommonMetadata';
import { SubQuestionList } from './SubQuestionList';
import type { ExamFormValues } from '../schema';

// ===== Props Type =====
interface Props {
  questionIndex: number;
  isEditMode: boolean;
  onDelete?: () => void;
}

// ===== Component =====
export const QuestionItem = ({ questionIndex, isEditMode, onDelete }: Props) => {
  const { control } = useFormContext<ExamFormValues>();
  const basePath = `questions.${questionIndex}`;

  // ===== Effect Hooks (useWatch) =====
  // 必要な部分のみ監視

  // ===== Handlers =====
  // イベントハンドラをここに記述

  // ===== Render =====
  return (
    <Paper>
      <CommonMetadata {...} />
      <SubQuestionList {...} />
    </Paper>
  );
};

// ===== Export =====
export default QuestionItem;
```

### 5.2 命名規則

| 対象 | ルール | 例 |
|------|--------|-----|
| **コンポーネント** | PascalCase | QuestionItem, SubQuestionList |
| **Hook** | camelCase, use プレフィックス | useExamQuery, useFormErrors |
| **Props Interface** | コンポーネント名 + Props | QuestionItemProps |
| **フォームパス** | snake_case で DB カラム対応 | questions.0.sub_questions.0.content |
| **イベントハンドラ** | handle + EventName | handleQuestionChange, handleDelete |

### 5.3 Type Safety

```typescript
// ✅ 推奨: Zod schema から型を推論
import type { ExamFormValues, SubQuestion } from '../schema';

// ❌ 避ける: 手書き型定義
type Question = {
  id: string;
  content: string;
  // ... 型の重複リスク
};
```

### 5.4 バリデーションメッセージ

```typescript
// ✅ 推奨: Zod に定義
const SubQuestionSchema = z.object({
  content: z.string().min(1, '問題文は必須です'),
});

// ❌ 避ける: コンポーネント内に記述
{errors.content && <p>問題文を入力してください</p>}
```

---

## 6. よくある実装エラー & 対策

### Error 1: useFieldArray の path 指定を間違える

**❌ 誤った例**:
```typescript
// parent index を使い忘れ
const { fields } = useFieldArray({
  control,
  name: 'questions.subQuestions', // エラー! parent index なし
});
```

**✅ 正しい例**:
```typescript
const { fields } = useFieldArray({
  control,
  name: `questions.${parentIndex}.subQuestions`, // 正しい
});
```

### Error 2: FormProvider でラップし忘れ

**❌ 誤った例**:
```typescript
// FormProvider がない → useFormContext で null エラー
return <form onSubmit={...}><QuestionList /></form>;
```

**✅ 正しい例**:
```typescript
return (
  <FormProvider {...methods}>
    <form onSubmit={...}><QuestionList /></form>
  </FormProvider>
);
```

### Error 3: useWatch で全フォーム監視

**❌ 誤った例**:
```typescript
// すべての値を監視 → 毎変更で全再レンダリング
const values = useWatch({ control });
```

**✅ 正しい例**:
```typescript
// 必要な部分のみ監視
const format = useWatch({ control, name: `${basePath}.format` });
```

### Error 4: TanStack Query キャッシュ戦略を無視

**❌ 誤った例**:
```typescript
// staleTime 指定なし → 毎回 API 呼び出し
const { data } = useQuery({ queryKey, queryFn });
```

**✅ 正しい例**:
```typescript
const { data } = useQuery({
  queryKey,
  queryFn,
  staleTime: 1000 * 60 * 5, // 5分キャッシュ
});
```

---

## 7. テストシナリオ

### 7.1 ユニットテスト

```typescript
// tests/unit/features/content/schema.test.ts

describe('ExamSchema', () => {
  it('should validate correct exam data', () => {
    const data = { /* 正常なデータ */ };
    expect(() => ExamSchema.parse(data)).not.toThrow();
  });

  it('should throw on empty examName', () => {
    const data = { ...validData, examName: '' };
    expect(() => ExamSchema.parse(data)).toThrow();
  });

  it('should validate nested questions', () => {
    const data = { /* 大問・小問ネスト */ };
    expect(() => ExamSchema.parse(data)).not.toThrow();
  });
});
```

### 7.2 統合テスト

```typescript
// tests/component/page/ProblemViewEditPage/QuestionList.test.tsx

describe('QuestionList', () => {
  it('should render questions from form context', () => {
    // mock data + FormProvider でラップ
    render(<FormProvider><QuestionList isEditMode={true} /></FormProvider>);
    // assertion
  });

  it('should append question on button click', () => {
    // user.click で追加ボタンをクリック
    // fields が増えたことを確認
  });

  it('should remove question on delete', () => {
    // remove() が呼ばれたことを確認
  });
});
```

### 7.3 E2E テスト

```typescript
// tests/e2e/examEdit.spec.ts

test('should edit exam and save successfully', async ({ page }) => {
  await page.goto('http://localhost:5173/problem/exam-1');
  
  // 編集モード有効化
  await page.click('button:has-text("編集")');
  
  // 大問を追加
  await page.click('button:has-text("大問を追加")');
  
  // テキスト入力
  await page.fill('[name="questions.0.content"]', 'New question');
  
  // 保存
  await page.click('button:has-text("保存")');
  
  // 保存完了を確認
  await page.waitForSelector('text=保存しました');
});
```

---

## 8. デバッグ・トラブルシューティング

### 8.1 開発時の便利なツール

```bash
# 1. React DevTools Profiler
# → Firefox/Chrome 拡張をインストール
# → Performance タブで再レンダリング確認

# 2. TypeScript Strict Mode
# → tsconfig.json で strict: true を確認
# → tsc --noEmit でエラーをチェック

# 3. ESLint & Prettier
pnpm lint
pnpm format
```

### 8.2 よくあるバグ

| バグ | 原因 | 解決策 |
|------|------|--------|
| "useFormContext は null" | FormProvider でラップ忘れ | FormProvider を追加 |
| "isDirty が更新されない" | reset() の defaultValues が古い | useEffect で監視 & reset |
| "保存ボタンが反応しない" | type="submit" 忘れ | form 内に type="submit" ボタンを配置 |
| "フォーム値が変わらない" | register忘れ or name 誤字 | register のパスを確認 |
| "useFieldArray で sync ずれ | control の指定を忘れ | control={control} を指定 |

### 8.3 デバッグコマンド

```typescript
// コンポーネント内で一時的にロギング
const { formState } = useFormContext();
console.log('isDirty:', formState.isDirty);
console.log('errors:', formState.errors);
console.log('dirtyFields:', formState.dirtyFields);
```

---

## 9. リリースチェックリスト

本番リリース前に確認：

- [ ] TypeScript strict mode でエラーなし
- [ ] ESLint / Prettier でエラーなし
- [ ] ユニットテスト 100% 成功
- [ ] 統合テスト 100% 成功
- [ ] E2E テスト合格（複数ブラウザ）
- [ ] Lighthouse スコア 90+
- [ ] アクセシビリティ（axe） 0 violation
- [ ] セキュリティスキャン（OWASP） 合格
- [ ] メモリリーク検査（DevTools） 合格
- [ ] 各問題形式での保存確認
- [ ] エラーハンドリング確認（API失敗時）
- [ ] 複数大問・小問での負荷テスト
- [ ] 関連ドキュメント（README等）更新

---

## 10. サポート＆リソース

### 質問・相談時の情報

何か質問がある場合は以下を含めてください：

1. **エラーメッセージ** (完全なスタックトレース)
2. **再現手順** (Step-by-step)
3. **期待値** vs **実際の動作**
4. **関連コード** (可能な限り最小化)

### 参考資料

- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **TanStack Query**: https://tanstack.com/query/latest
- **MUI**: https://mui.com/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Playwright**: https://playwright.dev/

---

## 11. 今後のメンテナンス

### 定期的に確認すべき項目

- 依存ライブラリの新バージョン対応
- TypeScript バージョンアップ時の型チェック
- MUI v7+ への移行検討（年1回程度）
- TanStack Query キャッシング戦略の最適化（ユーザーフィードバック基づき）

### Deprecation Warning が出た場合

```bash
# 1. npm audit で脆弱性確認
npm audit

# 2. npm outdated で更新可能パッケージ確認
npm outdated

# 3. 段階的に更新
npm update <package-name>

# 4. テスト実行
pnpm test
```

---

**最終確認**: このドキュメントが理解できたら、Phase 1 の実装を開始してください。不明な点があれば、早期に相談することをお勧めします。

