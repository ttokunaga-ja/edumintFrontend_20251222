# Current Frontend Architecture

## Aliases
- `@/*` → `src/`（唯一の正本）

## Directory Roles
- `src/components/primitives/`: 低レイヤーの UI 部品（Button/Input/Card など）
- `src/components/common/`: 複数ページで共有するドメイン寄りコンポーネント（ContextHealthAlert 等）
- `src/components/page/<PageName>/`: 画面固有の UI パーツ
- `src/pages/<PageName>/hooks/`: ページ専用のオーケストレーション（画面コントローラー）
- `src/features/<Domain>/hooks/`: ドメイン（API/ユースケース）単位の再利用可能な Hook
- `src/hooks/`: ドメイン知識を持たない汎用 Hook
- `src/services/api/`: httpClient とドメイン別 Gateway
- `src/mocks/`: MSW v2（browser/server/handlers/mockData）

## Dependency Flow
`pages -> pages/hooks -> (features/hooks | components/common | components/primitives | components/page/<PageName>) -> services/api`

## Notes
- 旧 `src/src`・`@app` は廃止。設定はすべてリポジトリルートで管理。
- UI は必ず `components/{primitives,common,page}` に置き、features 配下に UI を置かない。

## Save Semantics

- 全ページにおいて **全体保存 (Whole-form save)** を採用する。
- 個別ブロック単位の部分保存（Per-subquestion save）や、コンポーネントに対するインペリティブな `save()` メソッドの実装は禁止する。
- 編集・保存のトリガーは画面上部の `TopMenuBar` に集約し、保存は一度に試験（Exam）全体を送信することを原則とする。

理由: UI の一貫性保持とデータ整合性の簡素化のため。キャッシュや同期ロジックは TanStack Query のみで制御する。

## URL Design

本ドキュメントは、**edu-mint**プラットフォームにおける「不変性（Persistence）」と「SEO/UXの最大化」を両立させるURL設計の実装仕様である。リリース前につき、後方互換性を考慮しないベストプラクティスを定義する。

### 1. サイト全体のURL構造定義

| 画面名 | URLパス | 設計意図 |
| :--- | :--- | :--- |
| **ホーム** | `/` | 検索窓（メインUI）とおすすめ試験（レコメンド）を表示 |
| **試験詳細** | `/exam/{id}/{slug}` | **ID(16文字)**で解決。SlugはSEO・UX用の「飾り」 |
| **検索・一覧** | `/search/` | 全ての絞り込み（自分の投稿含む）をクエリパラメータで制御 |
| **問題生成** | `/create/` | 新規作成・編集（編集時は `/create?id=...` 等） |
| **マイページ** | `/mypage/` | プロフィール、統計、アカウント設定を統合 |

### 2. 試験詳細（Exam）: ID + Mutable Slug 実装

#### 2.1. URL戦略
*   **Permanent ID**: 16文字のNanoID。不変。
*   **Mutable Slug**: タイトルを正規化した文字列。ルーティングには使用しない。
*   **正規化URL**: SEO上の正規URL（Canonical）は `/exam/{id}/{slug}` とするが、IDさえ合致すればslugが何であっても（あるいは無くても）200 OKを返す。

#### 2.2. Database (SQL) 設計
```sql
CREATE TABLE exams (
    -- NanoID 16文字
    id VARCHAR(16) PRIMARY KEY,
    
    -- 外部公開用ユーザーID (16文字)
    author_id VARCHAR(16) NOT NULL,
    
    slug VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    -- ...その他のカラム
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exams_author ON exams(author_id);
```

#### 2.3. Backend (Golang) 実装
ID生成器を16文字仕様に設定。

```go
package utils

import (
	"crypto/rand"
	"math/big"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"

// GenerateNanoID returns a 16-character secure random string
func GenerateNanoID() (string, error) {
	n := 16
	b := make([]byte, n)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		b[i] = charset[num.Int64()]
	}
	return string(b), nil
}
```

#### 2.4. Gateway / Frontend 挙動ロジック
スラッグが最新でない場合、ユーザービリティとSEOのために最新URLへ `history.replaceState` または `301 Redirect` を行う。

```typescript
// React: useCanonicalUrl.ts
export const useCanonicalUrl = (id: string, currentSlug: string, apiSlug: string) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (currentSlug !== apiSlug) {
      // 履歴を汚さずにURLを最新に修正
      navigate(`/exam/${id}/${apiSlug}`, { replace: true });
    }
  }, [id, currentSlug, apiSlug]);
};
```

### 3. 検索・フィルタリング（Search）アーキテクチャ

全ての試験一覧（公開一覧、自分の投稿）を `/search/` エンドポイントに集約する。

#### 3.1. クエリパラメータ仕様

| パラメータ | 型 | 例 | 説明 |
| :--- | :--- | :--- | :--- |
| `q` | string | `積分` | キーワード検索 |
| `u_id` | string(16) | `u_k8P3n9L2mR5qW4xZ` | **外部公開用ユーザーID**。特定ユーザーの投稿に絞り込み |
| `visibility` | string | `all` | `all` 指定かつ `u_id` が本人時のみ非公開分を含める |
| `sort` | string | `newest` | `newest`, `popular` 等 |

#### 3.2. 「自分の投稿」の表示ロジック
マイページ等から「自分の投稿を確認」ボタンを押した際の挙動：
1.  URL: `/search?u_id={MY_NANO_ID}&visibility=all` へ遷移。
2.  Backendは `u_id` がリクエストユーザー（JWT等の認証情報）と一致するか確認。
3.  一致する場合、`is_public = false` のデータも結果に含めて返す。

### 4. マイページ（MyPage）設計

MVPでは設定画面を分離せず、`/mypage/` に集約する。

*   **URL**: `https://edu-mint.com/mypage/`
*   **機能包含**:
    *   **Profile**: 名前、アイコンの変更。
    *   **Account**: メールアドレス、パスワード設定。
    *   **Statistics**: 自分の試験の累計受験数、平均スコア等。
    *   **Links**: 「自分の投稿を管理（`/search?u_id=...`へのリンク）」。

### 5. SEO & セキュリティ要件

#### 5.1. SEOの厳格な管理
*   **Canonical**: 試験詳細ページでは、常に最新タイトルを含んだ `/exam/{id}/{latest-slug}` を正規URLとして検索エンジンに伝える。
*   **Noindex**: `/search/` ページにおいて、`u_id` や `visibility` パラメータが含まれる場合は `<meta name="robots" content="noindex">` を出力し、プライベートな絞り込みがインデックスされるのを防ぐ。

#### 5.2. セキュリティ
*   **ID推測攻撃の防止**: 内部的な連番ID（1, 2, 3...）はAPIレスポンス、URL、クエリパラメータのいずれにも露出させない。
*   **認可の徹底**: `/search?u_id={OTHER_ID}&visibility=all` と他人のIDを指定しても、バックエンド側で強制的に `visibility=public` 相当のフィルターを適用し、未公開データが漏洩するのを防ぐ。

### 6. まとめ：データフロー図

1.  **アクセス**: ユーザーが `/exam/8fA9xKQ2ZP7mR4LJ/old-slug` にアクセス。
2.  **解決**: システムは `8fA9xKQ2ZP7mR4LJ` のみでDBを検索。
3.  **検証**: 最新の `slug` が `new-awesome-exam` であることを確認。
4.  **修正**: ブラウザのURLを `/exam/8fA9xKQ2ZP7mR4LJ/new-awesome-exam` に書き換えつつ、コンテンツを表示。
5.  **検索**: 自分の過去問を探す際は `/search?u_id=...` を叩き、一貫したUIで管理。
