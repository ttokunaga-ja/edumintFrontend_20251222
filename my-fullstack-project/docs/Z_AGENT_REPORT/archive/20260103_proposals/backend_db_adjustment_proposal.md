# Backend Database Adjustment Proposal

## 概要
本提案書では、フロントエンドの実装とバックエンドのデータベース設計との間に発見された不整合についてまとめています。これにより、データの整合性を保ち、アプリケーションの機能を円滑にするための修正案を提示します。

## 詳細分析

### 対象テーブル/モデル
- **ユーザーテーブル** (`users`)

### フロントエンドの実装箇所
- **ファイル名**: `src/client/interfaces/index.ts`
- **行番号**: 45-60

### 具体的な不整合の内容
1. **不足しているカラム**:
   - フロントエンドでは `lastLogin` フィールドが必要とされていますが、`users` テーブルには存在しません。

2. **データ型の不一致**:
   - フロントエンドでは `age` フィールドを数値型として扱っていますが、DBでは文字列型として定義されています。

3. **必須/任意の不一致**:
   - フロントエンドでは `email` フィールドを必須入力としているにもかかわらず、DBではNULLが許可されています。

4. **命名の不一致**:
   - フロントエンドでは `userName` としているフィールドが、DBでは `username` として定義されています。

## 修正提案
以下のSQL文を使用して、`docs/Q_DATABASE.md` に対して必要な修正を行います。

```sql
ALTER TABLE users
ADD COLUMN lastLogin TIMESTAMP NULL,
MODIFY COLUMN age INT NOT NULL,
MODIFY COLUMN email VARCHAR(255) NOT NULL,
CHANGE username userName VARCHAR(255);
```

これにより、フロントエンドとバックエンドのデータ構造の整合性が保たれ、アプリケーションの機能が正常に動作することが期待されます。