# AdvancedSearchPanel コンポーネント仕様書

**更新日**: 2026年1月1日  
**バージョン**: 2.0

---

## 📋 概要

HomePageの詳細検索パネルコンポーネント。フィルターを使用した高度な検索機能を提供します。

### 使用ライブラリ
- **UI Components**: Material-UI (MUI) v6.1.5
  - `Autocomplete`: オートコンプリート入力
  - `Select`: プルダウン選択
  - `Checkbox`: チェックボックス
  - `TextField`: テキスト入力
  - `FormControl`, `InputLabel`, `MenuItem`: フォーム関連
  - `Accordion`, `AccordionSummary`, `AccordionDetails`: アコーディオン展開/非表示
- **State Management**: React hooks (useState, useCallback)
- **Internationalization**: react-i18next

---

## 🎯 機能要件

### レスポンシブレイアウト

| 画面幅 | レイアウト |
|--------|-----------|
| xs (〜599px) | 1列 |
| sm (600px〜) | 2列 |

---

## 📝 フィルター仕様

### Row 1: 大学 | 学部

#### 大学（Universities）
- **入力形式**: MUI Autocomplete（複数選択）
- **データソース**: UNIVERSITIES定数
- **デフォルト値**: ユーザープロフィール.university
- **動作**:
  - ユーザープロフィールの大学が自動入力される
  - ユーザーが明示的に変更しない場合、プロフィール値が適用される
  - 複数の大学を選択可能

#### 学部（Faculties）
- **入力形式**: MUI Autocomplete（複数選択）
- **データソース**: FACULTIES定数
- **デフォルト値**: ユーザープロフィール.faculty
- **動作**:
  - ユーザープロフィールの学部が自動入力される
  - ユーザーが明示的に変更しない場合、プロフィール値が適用される
  - 複数の学部を選択可能

---

### Row 2: 学問分野 | 教授

#### 学問分野（Academic Field / Field Type）
- **入力形式**: MUI Autocomplete（単一選択）
- **データソース**: FIELDS定数
- **デフォルト値**: ユーザープロフィール.academicField
- **動作**:
  - ユーザープロフィールの学問分野が自動入力される
  - ユーザーが明示的に変更しない場合、プロフィール値が適用される
  - 単一選択のみ

#### 教授（Professor）
- **入力形式**: MUI TextField（テキスト入力）
- **プレースホルダー**: "教授名を入力"
- **デフォルト値**: なし
- **動作**:
  - 自由なテキスト入力
  - 教授名の部分一致検索に使用

---

### Row 3: 試験年度 | 難易度

#### 試験年度（Year）
- **入力形式**: MUI TextField（数値スピナー付き）
- **デフォルト値**: 現在の年 - 1（例: 2025年なら2024）
- **バリデーション**:
  - 4桁の整数値のみ許可
  - 全角数字は自動的に半角に変換
  - 無効な値の場合はデフォルト値に戻す
- **操作**:
  - ↑↓ボタン（スピナー）で年を増減
  - テキスト入力フィールドで直接入力
  - 範囲: 1900〜2099年（推奨）

#### 難易度（Level）
- **入力形式**: MUI Select（プルダウン）
- **選択肢**:
  - すべて（デフォルト）
  - 基礎
  - 標準
  - 応用
  - 難関
- **デフォルト値**: "すべて"（空文字列）
- **動作**:
  - 単一選択のみ

---

### Row 4: 問題形式（Full Width）

#### 問題形式（Problem Formats）
- **入力形式**: MUI Checkbox + FormControlLabel（複数選択チェックボックス）
- **レイアウト**: 
  - xs: 1列（各チェックボックス横幅100%）
  - sm: 2列（各チェックボックス横幅50%）
  - md: 3列（各チェックボックス横幅33%）
- **選択肢**:
  - 単一選択
  - 複数選択
  - 正誤判定
  - 組み合わせ
  - 順序並べ替え
  - 記述式
  - 証明問題
  - コード記述
  - 翻訳
  - 数値計算
- **デフォルト値**: なし
- **動作**:
  - 複数選択可能
  - チェックされた項目のみフィルタに適用

---

### Row 5: 更新日時 | 所要時間

#### 更新日時（Period）
- **入力形式**: MUI Select（プルダウン）
- **選択肢**:
  - すべて（デフォルト）
  - 1日以内
  - 1週間以内
  - 1ヶ月以内
  - 1年以内
  - 期間指定
- **デフォルト値**: "すべて"（空文字列）

#### 所要時間（Duration）
- **入力形式**: MUI Select（プルダウン）
- **選択肢**:
  - すべて（デフォルト）
  - 5分以内
  - 15分以内
  - 30分以上
- **デフォルト値**: "すべて"（空文字列）

---

### Row 6: 学問系統（文系・理系） | 言語

#### 学問系統（Academic System）
- **入力形式**: MUI Select（プルダウン）
- **選択肢**:
  - すべて（デフォルト）
  - 文系
  - 理系
- **デフォルト値**: ユーザープロフィール.academicSystem（文系/理系）
- **データマッピング**:
  - liberal-arts: 文系
  - science: 理系
  - all: すべて
- **動作**:
  - ユーザープロフィール値が自動入力される
  - ユーザーが明示的に変更しない場合、プロフィール値が適用される

#### 言語（Language）
- **入力形式**: MUI Select（プルダウン）
- **選択肢**:
  - すべて（デフォルト）
  - 日本語
  - 英語
  - 中国語
  - 韓国語
  - その他
- **デフォルト値**: ユーザープロフィール.language
- **データマッピング**:
  - ja: 日本語
  - en: 英語
  - zh: 中国語
  - ko: 韓国語
  - other: その他
- **動作**:
  - ユーザープロフィール値が自動入力される
  - ユーザーが明示的に変更しない場合、プロフィール値が適用される

---

### Row 7: Custom Search（Full Width）

#### Custom Search Checkboxes
- **入力形式**: MUI Checkbox + FormControlLabel（複数選択チェックボックス）
- **レイアウト**:
  - xs: 2列（各チェックボックス横幅50%）
  - sm: 4列（各チェックボックス横幅25%）
- **選択肢**:
  - 学習済 (isLearned)
  - 高評価 (isHighRating)
  - コメント (isCommented)
  - 投稿 (isPosted)
- **デフォルト値**: すべてfalse
- **動作**:
  - 複数選択可能
  - チェック状態がフィルタに直接反映

---

## 🔧 コンポーネント共通化戦略

### 1. AutocompleteFilterField コンポーネント
**用途**: 大学、学部、学問分野など

```typescript
interface AutocompleteFilterFieldProps {
  label: string;
  options: string[];
  value: string | string[];
  multiple?: boolean;
  defaultValue?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
}
```

**使用場面**:
- 大学（複数選択）
- 学部（複数選択）
- 学問分野（単一選択）

---

### 2. SelectFilterField コンポーネント
**用途**: 難易度、更新日時、所要時間、学問系統、言語など

```typescript
interface SelectFilterFieldProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  defaultValue?: string;
  onChange: (value: string) => void;
}
```

**使用場面**:
- 難易度
- 更新日時
- 所要時間
- 学問系統
- 言語

---

### 3. CheckboxGroupField コンポーネント
**用途**: 問題形式、Custom Search など

```typescript
interface CheckboxGroupFieldProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
  };
}
```

**使用場面**:
- 問題形式
- Custom Search

---

### 4. YearInputField コンポーネント
**用途**: 試験年度の特殊入力

```typescript
interface YearInputFieldProps {
  label: string;
  value: string;
  defaultValue?: string; // 前年の西暦
  onChange: (value: string) => void;
}
```

**特徴**:
- スピナー（↑↓）ボタン付き
- 4桁バリデーション
- 全角→半角自動変換
- エラーメッセージ表示

---

## 📊 ユーザープロフィール連携

### 必須プロフィール属性
```typescript
interface UserProfile {
  university?: string;        // 大学名
  faculty?: string;          // 学部名
  academicField?: string;    // 学問分野
  academicSystem?: 'liberal-arts' | 'science';  // 学問系統（文系/理系）
  language?: 'ja' | 'en' | 'zh' | 'ko' | 'other';  // 言語
  // ... その他プロフィール属性
}
```

### デフォルト値適用ロジック
1. コンポーネント初期化時にプロフィール値をフォームに自動入力
2. ユーザーが明示的に変更しない場合、次の検索時にプロフィール値が使用される
3. ユーザーが値を変更した場合、変更後の値が優先される
4. 「リセット」ボタン押下時は、プロフィール値に戻す

---

## 🎨 バリデーション & エラーハンドリング

### 試験年度バリデーション
```typescript
function validateYear(input: string): { isValid: boolean; error?: string; normalizedValue?: string } {
  // 1. 全角数字を半角に変換
  const normalized = input.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
  
  // 2. 数値チェック
  if (!/^\d+$/.test(normalized)) {
    return { isValid: false, error: '数値のみ入力してください' };
  }
  
  // 3. 4桁チェック
  if (normalized.length !== 4) {
    return { isValid: false, error: '4桁の西暦を入力してください' };
  }
  
  // 4. 年の範囲チェック（オプション）
  const year = parseInt(normalized, 10);
  if (year < 1900 || year > 2099) {
    return { isValid: false, error: '1900～2099年の範囲で入力してください' };
  }
  
  return { isValid: true, normalizedValue: normalized };
}
```

### オートコンプリート入力
- 「指定なし」として空配列を許可
- ユーザーが明示的に変更しない場合のみデフォルト値を適用

### プルダウン選択
- デフォルトは「すべて」（空文字列）
- プロフィール連携フィールドはプロフィール値をデフォルトに設定

---

## 🔄 アクション

### 適用（Search）
- ローカル状態をグローバルフィルター状態に同期
- バックエンド検索API呼び出し

### リセット
- すべてのフィルターをプロフィール値にリセット
- グローバルフィルター状態を初期化

---

## 📱 レスポンシブ仕様

### ブレークポイント対応
| ブレークポイント | 説明 | レイアウト |
|-----------------|------|----------|
| xs | モバイル（〜599px） | 1列 |
| sm | タブレット（600px〜） | 2列 |
| md | デスクトップ（960px〜） | フルレイアウト |

### 全幅フィールド（Row 4, Row 7）
- すべてのブレークポイントで full width
- Row 4（問題形式）: xs=1列, sm=2列, md=3列
- Row 7（Custom Search）: xs=2列, sm=4列

---

## 🧪 テスト対象項目

- [ ] 大学・学部・学問分野のオートコンプリート動作
- [ ] 試験年度の↑↓スピナー操作
- [ ] 試験年度の全角→半角自動変換
- [ ] 試験年度の4桁バリデーション
- [ ] プロフィール値のデフォルト適用
- [ ] フィルター適用・リセット動作
- [ ] レスポンシブレイアウト表示
- [ ] チェックボックス複数選択
- [ ] バリデーションエラーメッセージ表示

---

## 📚 関連ドキュメント

- [SearchFilters Interface](./ADVANCEDSEARCHPANEL_REQUIREMENTS.md#-フィルター仕様)
- [UserProfile Interface](./USER_PROFILE.md)
- [Shared Components](./SHARED_COMPONENTS.md)

