### 【保存版】Webサービス実装用 問題形式定義リスト（初期リリース・表示専用）

**前提仕様:**
*   **全形式共通:** 問題文、選択肢、解説、模範解答のすべてで Markdown および LaTeX (`$$`等) をレンダリングします。
*   **初期動作:** 問題と選択肢（ある場合）を表示し、ボタン等で「解答・解説」を表示するビューワーとして動作します。
*   **数値問題:** 変数（乱数）は使用せず、固定数値の文章題として扱い、記述式（Essay）のロジックで処理します。

> NOTE: As of 2025-12-31 the frontend was refactored to consolidate multiple per-type View/Edit components into `NormalSubQuestionView`. For types 1,4,5,6,7,8,9 the `NormalSubQuestionView` now handles both display and edit (mode-based). This doc's examples remain valid conceptually; component-level references in code now point to `NormalSubQuestionView`.

## 実際のフロントエンド typeId マッピング（実装参照）

以下は現在のフロントエンド実装（`src/components/problemTypes/ProblemTypeRegistry.tsx` の `registerDefaults`）で使用している `typeId` とコンポーネントの対応表です。ドキュメント中の概念的な分類（選択系 / 記述系）とは別に、実装上の `typeId` を明示します。

### パターンA：選択・構造化データ系（新規形式対応）

| typeId | 形式 | コンポーネント | 備考 |
| :---: | :--- | :--- | :--- |
| 1 | 単一選択 | `SelectionViewer` (isSingleSelect=true) | 新規実装済み（SelectionViewer統合予定） |
| 2 | 複数選択 | `MultipleChoiceView` + `SelectionViewer` | ✅ 実装済み（SelectionViewer統合済み） |
| 3 | 正誤判定 | `SelectionViewer` (Yes/No二者択一) | 実装予定 |
| 4 | 組み合わせ | `MatchViewer` (ペアリング) | 新規実装済み（統合予定） |
| 5 | 順序並べ替え | `OrderViewer` (シーケンス) | 新規実装済み（統合予定） |

### パターンB：自由記述・テキスト系（汎用化）

| typeId | 形式 | コンポーネント | 備考 |
| :---: | :--- | :--- | :--- |
| 10 | 記述式 | `NormalSubQuestionView` | 汎用エッセイロジック |
| 11 | 証明問題 | `NormalSubQuestionView` | LaTeX表示最適化 |
| 12 | コード記述 | `NormalSubQuestionView` | シンタックスハイライト対応 |
| 13 | 翻訳 | `NormalSubQuestionView` | 対照テキスト表示対応 |
| 14 | 数値計算 | `NormalSubQuestionView` | 完全一致判定対応 |

**注記（2025-12-31 更新）:**
- ✅ パターンA（選択系）の共通コンポーネント実装完了：`SelectionViewer`, `MatchViewer`, `OrderViewer`
- ✅ MultipleChoiceView に SelectionViewer を統合完了
- 🔄 ProblemTypeRegistry.registerDefaults に ID 1-5, 10-14 の完全マッピング追加
- 🔄 呼び出し元（SubQuestionBlockContent）を useEffect で最適化し、レジストリ登録を初回のみに変更
- 📋 将来的に ID 4-9 を使用する既存コンテンツは自動的に NormalSubQuestionView にフォールバック

注: API の `type_id`（バックエンド）との整合性は別途確認し、必要に応じて `ProblemTypeRegistry.registerDefaults` の内容を更新してください。

#### 1. 選択・構造化データ系（Selection & Structured）
選択肢や項目リストを持つ形式です。ユーザーは将来的にこれらを選んだり並べ替えたりします。

| ID | 問題形式名 | 英名 / 将来のUI | 内部データ構造 | Moodle参照 (データ構造) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **単一選択** | Single Choice (Radio) | 問題文 + **選択肢リスト** + 正解ID | `multichoice` (`single=1`) |
| **2** | **複数選択** | Multiple Choice (Checkbox) | 問題文 + **選択肢リスト** + 正解IDリスト | `multichoice` (`single=0`) |
| **3** | **正誤判定** | True/False | 問題文 + **正解ブール値** (True/False) | `truefalse` |
| **4** | **組み合わせ** | Matching | 問題文 + **ペアリスト** (項目A - 項目B) | `match` |
| **5** | **順序並べ替え** | Ordering | 問題文 + **項目リスト** (正解順序) | `qtype_ordering` |

#### 2. 自由記述・テキストデータ系（Free Text / Universal Essay）
**すべての内部処理を「記述式（Essay）」として共通化します。**
Markdown/LaTeX対応により、数式やコードも「単なるテキスト」として保存・表示できるため、バックエンドは完全に同一になります。IDの違いは、**将来表示する入力エディタの種類**と**AIへの採点指示（プロンプト）**の違いのみです。

| ID | 問題形式名 | 将来の入力UI | AI採点の役割 (将来) | 内部データ構造 |
| :--- | :--- | :--- | :--- | :--- |
| **10** | **記述式** | 標準テキストエリア | 文脈・キーワード・論理性の一致判定 | 問題文 + 模範解答テキスト |
| **11** | **証明問題** | 数式パレット付きエリア | 数学的推論のプロセス・論証の正当性判定 | 問題文 + 模範解答 (LaTeX含) |
| **12** | **コード記述** | コードエディタ | 仕様適合性・アルゴリズムの正当性判定 | 問題文 + 模範解答コード |
| **13** | **翻訳** | 左右対照エリア | 言語間のニュアンス・文法の正確性判定 | 問題文 + 模範解答テキスト |
| **14** | **数値計算** | 数値のみ入力欄 | **完全一致判定** (許容誤差設定) または AIによるプロセス判定 | 問題文 + 正解数値 |

---

### 記述式（Essay）で対応できる範囲と共通化の考察

ご質問の「記述式で対応できる範囲」および「内部処理の共通化」についての技術的なまとめです。

#### 1. 記述式（ID 10〜14）のカバー範囲
**結論：静的な問題であれば、実質ほぼすべてカバー可能です。**

今回の要件では「Markdown/LaTeX対応」かつ「数値は固定」であるため、以下のすべてが**「テキストデータ（String）」**として管理可能です。

*   **通常の文章題:** そのままテキスト。
*   **数式・証明:** LaTeX文字列（例: `$$ \int_0^1 x dx $$`）としてテキスト保存すれば、フロントエンドが数式として描画します。
*   **プログラミング:** コードブロック（例: ` ```python ... ``` `）を含むテキストとして保存すれば、フロントエンドがシンタックスハイライトを行います。
*   **数値問題:** 「10mの梯子を...」といった問題文はテキスト、正解の「5√3」もテキストとして保持します。

#### 2. 内部処理の共通化設計（バックエンド/DB）

初期リリース（表示のみ）において、システム内部は極限までシンプルに共通化できます。大きく分けて2つのデータ構造のみで管理可能です。

**パターンA：選択・構造化タイプ (ID 1〜5)**
*   **必要なデータ:** `Question Body` + `Options List (JSON)` + `Answer Key`
*   **Moodle参考:** `multichoice` のテーブル構造がベースになりますが、JSON型カラム1つに選択肢を配列で入れてしまうのが現代的なWeb開発（PostgreSQL/MySQL）では効率的です。

**パターンB：記述・テキストタイプ (ID 10〜14)**
*   **必要なデータ:** `Question Body` + `Model Answer Text`
*   **共通ロジック:**
    *   DB上は、ID 10も14も全く同じカラム構成（`question_text`, `answer_text`）で保存します。
    *   **区別の方法:** `type_id` カラムの値だけを変えておきます。
    *   **表示の制御:** フロントエンド（React/Vueなど）が `type_id` を見て、「ID 12ならコードブロック用のスタイルを当てる」「ID 11ならMathJaxを強制ロードする」といった**表示の振る舞いだけを変えます**。

### 開発用 DBテーブル定義イメージ

```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    type_id INTEGER NOT NULL, -- 上記のID (1, 2, ..., 10, 11...)
    title VARCHAR(255),
    
    -- 問題文 (Markdown/LaTeX対応)
    content TEXT NOT NULL, 
    
    -- 構造化データ (選択肢など。記述系の場合はNULLまたは空配列)
    -- 例: [{"id":1, "text":"Option A"}, {"id":2, "text":"Option B"}]
    options JSONB, 
    
    -- 正解データ (AIプロンプト/正誤判定用)
    -- 選択式なら正解ID、記述式なら模範解答テキストが入る
    model_answer TEXT, 
    
    -- 解説 (Markdown/LaTeX対応)
    explanation TEXT
);
```

**結論:**
初期リリースでは、**「選択肢があるかないか」**の違いしかありません。記述式系のID（10〜14）は、DB保存・取得ロジックを**完全に1つの処理に共通化**し、フロントエンドの表示（CSS/コンポーネント）だけで出し分ける設計が最もコストパフォーマンスが良いです。

**選択・構造化データ系（ID 1〜5）**を最も効率的に共通化するための設計方針を提案します。

結論から言うと、これら全ての形式は**「リスト形式（配列）」という単一のデータ構造**で管理できます。
データベースのカラムを形式ごとに分ける必要はありません。**「表示用テキスト（Face）」**と**「正解定義（Core）」**のペアを持つ汎用的なJSON構造を1つ定義し、それを使い回します。

### 1. 共通データモデル：「汎用アイテムリスト」

すべての構造化問題は、結局のところ「項目のリスト」です。DBには `items` というJSONカラムを1つ用意し、以下の共通スキーマで保存します。

#### 共通JSONスキーマ（`items` カラム）
```json
[
  {
    "id": "ユニークID (uuid等)",
    "label": "表示テキスト (Markdown/LaTeX対応)",
    "value": "正解データ (形式により役割が変化)"
  },
  ...
]
```

この `value` の使い方を変えるだけで、全ての形式に対応します。

---

### 2. 各形式へのマッピング詳細

IDごとの `label` と `value` の使い分けは以下の通りです。これで内部処理（DB保存・読み出し）は完全に共通化されます。

| ID | 問題形式 | `label` (ユーザーに見せるもの) | `value` (システムが正解とみなすもの) | データ例 |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **単一選択** | 選択肢の文言 | `true` (正解) または `false` (不正解) | `{"label": "東京", "value": true}` |
| **2** | **複数選択** | 選択肢の文言 | `true` (正解) または `false` (不正解) | `{"label": "富士山", "value": true}` |
| **3** | **正誤判定** | "正しい" / "誤り" (または Yes/No) | `true` (正解の側) | `{"label": "Yes", "value": true}` |
| **4** | **組み合わせ** | 質問項目 (Stem) | 対応する答え (Match) | `{"label": "Apple", "value": "Ringo"}` |
| **5** | **並べ替え** | 並べ替える対象の文言 | 正しい順序番号 (Integer) | `{"label": "手順1", "value": 1}` |

#### 特記事項
*   **ダミー選択肢（組み合わせ問題）:** `label` を空文字、`value` に値を入れれば「余分な選択肢」として表現できます。
*   **正誤判定:** システムで固定せず、データとして「True/False」を持たせることで、「Yes/No」「A/B」などのカスタマイズが容易になります。

---

### 3. フロントエンド（UI）での共通化と分岐

このデータ構造を採用することで、Webサービスのフロントエンド実装も非常にシンプルになります。

**共通コンポーネントのロジック:**
1.  DBから `items` 配列を受け取る。
2.  `items` をシャッフルする（ID 5「並べ替え」以外は基本シャッフルして表示）。
3.  `type_id` に応じて描画パーツ（Radio/Checkbox/List）を切り替える。

**表示ロジックの疑似コード:**

```javascript
// Props: type_id, items (from DB)

function QuestionViewer({ type_id, items }) {
  // 1. 解説・正解表示モードの場合の処理
  const renderAnswer = (item) => {
    if (type_id === 4) return `正解: ${item.value}`; // 組み合わせ
    if (type_id === 5) return `順序: ${item.value}`; // 並べ替え
    return item.value === true ? "◎ 正解" : "";       // 選択系
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="item-row">
          {/* UI分岐 */}
          {type_id === 1 && <RadioButton label={item.label} />}
          {type_id === 2 && <Checkbox label={item.label} />}
          {type_id === 4 && <div class="match-pair">{item.label} ↔ {item.value}</div>}
          {type_id === 5 && <SortableItem label={item.label} />}
          
          {/* 正解表示（初期リリース要件） */}
          <div className="answer-reveal">
            {renderAnswer(item)}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. まとめ：開発者への指示書

開発チームには以下の仕様を伝えてください。

1.  **DB設計:**
    *   選択系・構造化系の専用テーブルは作らない。
    *   `questions` テーブルに `structured_items` (JSONB) カラムを1つ追加するだけでよい。
2.  **API設計:**
    *   どの問題タイプでも、そのままこのJSON配列をクライアントに返すだけでよい。
3.  **Markdown/LaTeX対応:**
    *   `label` フィールドの中身はプレーンテキストではなく Markdown としてパースして表示するルールを徹底する。これで選択肢の中に数式（`$$x^2$$`）や画像を入れることが可能になる。


表示機能（レンダリング）において「どこまで共通化すべきか」という問いに対する結論は、**「行（Row）のコンポーネントは共通化し、リスト全体のレイアウト（Container）は3パターンに分ける」**のが最適解です。

無理に1つの巨大なコンポーネントですべてを賄おうとすると、将来 `if/else` の分岐が複雑になりすぎてメンテナンス性が落ちます。

以下に、React/Vueなどの現代的なフレームワークを想定した**「共通化の境界線」**を定義します。

---

### 1. 共通化すべき部分（Atomic / Molecule Level）

ここは**100%共通化**します。ID 1〜5すべての問題形式で全く同じ部品を使います。

#### A. コンテンツ描画部 (`RichTextRenderer`)
問題文、選択肢のテキスト、正解の値を表示する最小単位です。
*   **機能:** Markdownのパース、LaTeX（数式）のレンダリング、画像の表示。
*   **理由:** どの形式でも「テキストの中に数式や画像が入る」という要件は変わらないため。

#### B. 行のラッパー (`OptionRow`)
選択肢1つ分を表示する外枠（カードや枠線）のデザインです。
*   **機能:** ホバー時の背景色変化、正解時のハイライト（緑枠にする等）、不正解時のスタイル。
*   **理由:** 「単一選択」でも「並べ替え」でも、リスト項目の見た目のトーン＆マナーは統一すべきであるため。

---

### 2. 分けるべき部分（Organism Level）

ここが**「共通化の限界点」**です。UIの挙動とメンタルモデルが異なるため、以下の**3つのパターン**に分けて実装することを強く推奨します。

#### パターン1：選択リスト型（ID 1, 2, 3）
*   **対象:** 単一選択、複数選択、正誤判定
*   **共通ロジック:**
    *   左側に「マーカー（ラジオボタン/チェックボックス/記号）」を置く。
    *   右側に「コンテンツ」を置く。
    *   **初期リリース（表示のみ）の挙動:** 正解の行には「✅」アイコンを出し、スタイルを緑色にする。
*   **実装イメージ:**
    ```jsx
    // SelectionViewer
    items.map(item => (
      <OptionRow>
        <Marker type={isSingle ? 'radio' : 'check'} />
        <RichTextRenderer content={item.label} />
        {item.value === true && <CorrectBadge />} {/* 正解表示 */}
      </OptionRow>
    ))
    ```

#### パターン2：ペアリング型（ID 4）
*   **対象:** 組み合わせ
*   **独自ロジック:**
    *   リストではなく**「対（つい）」**構造。
    *   `label`（問題）と `value`（答え）を「矢印」や「左右分割」で繋いで表示する必要がある。
*   **実装イメージ:**
    ```jsx
    // MatchViewer
    items.map(item => (
      <OptionRow class="flex-row">
        <div class="left"><RichTextRenderer content={item.label} /></div>
        <div class="connector">➡</div>
        <div class="right"><RichTextRenderer content={item.value} /></div>
      </OptionRow>
    ))
    ```

#### パターン3：シーケンス型（ID 5）
*   **対象:** 順序並べ替え
*   **独自ロジック:**
    *   左側に「チェックボックス」ではなく**「順序番号（1, 2, 3...）」**を表示する。
    *   **初期リリース（表示のみ）の挙動:** 正しい順番（`value` の値順）でソートして表示し、「この順番が正解です」と見せる。
*   **実装イメージ:**
    ```jsx
    // OrderViewer
    // value(順序)でソートしてから表示
    items.sort((a,b) => a.value - b.value).map((item, index) => (
      <OptionRow>
        <NumberBadge number={index + 1} />
        <RichTextRenderer content={item.label} />
      </OptionRow>
    ))
    ```

---

### 3. 将来（入力機能実装時）への布石

このように「3パターン」に分けておくと、将来入力機能を実装する際に、スムーズに移行できます。

*   **パターン1:** クリックイベントで `selected` 状態を管理する処理を追加するだけ。
*   **パターン2:** 右側の箱を `<select>` (プルダウン) に変えるか、ドラッグ＆ドロップ領域に変えるだけで済む。
*   **パターン3:** ドラッグハンドル（「≡」アイコン）を追加し、ドラッグ＆ドロップライブラリを組み込むだけで済む。

### 結論：共通化マトリクス

| コンポーネント階層 | 共通化方針 | 具体的な対応 |
| :--- | :--- | :--- |
| **データ構造 (DB)** | **完全共通** | 全て `items` 配列 (JSON) で管理 |
| **テキスト描画 (Atom)** | **完全共通** | Markdown/LaTeXレンダラーは1つだけ |
| **行のデザイン (Style)** | **ほぼ共通** | 枠線、余白、フォントは共通CSS/コンポーネント |
| **リスト構造 (Layout)** | **3分割** | **1. 選択系** (Select)<br>**2. ペア系** (Match)<br>**3. 順序系** (Order) |

**アドバイス:**
初期リリースでは、**「パターン1（選択系）」**のコンポーネントを作り、ID 3（正誤）も ID 1（単一選択）のコンポーネントを流用して表示してください。
（※ID 3は単に選択肢が「Yes」「No」の2つしかない単一選択問題として扱えば、実装工数を削減できます）