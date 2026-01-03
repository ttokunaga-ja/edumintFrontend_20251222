# ProblemViewEditPage アーキテクチャ設計：DB & API 仕様

**目的**: ProblemViewEditPage（試験編集・閲覧ページ）の実装に必要なデータベース設計、API仕様、および実装者向けの前提条件をまとめたドキュメント。

---

## 1. DB スキーマ設計

### 1.1 テーブル関係図

```
exams (親)
  ├── questions (子)
  │   └── sub_questions (孫)
  │       ├── sub_question_selection (形式別: ID 1/2/3)
  │       ├── sub_question_matching (形式別: ID 4)
  │       ├── sub_question_ordering (形式別: ID 5)
  │       └── sub_question_essay (形式別: ID 10-14)
  │
  ├── keywords (グローバル)
  │   └── sub_question_keywords (多対多結合)
```

### 1.2 テーブル定義

#### `exams` テーブル

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| id | UUID | PK | 試験ID |
| exam_name | VARCHAR(500) | NOT NULL | 試験名 |
| exam_type | INT | NOT NULL | 試験種別 (0=期末, 1=中間, 2=その他) |
| university_id | UUID | FK | 大学ID |
| faculty_id | UUID | FK | 学部ID |
| teacher_id | UUID | FK | 教員ID |
| subject_id | UUID | FK | 科目ID |
| subject_name | VARCHAR(255) | | 科目名 |
| exam_year | INT | NOT NULL | 実施年 |
| user_id | UUID | FK, NOT NULL | 作成ユーザーID |
| is_public | BOOLEAN | DEFAULT false | 公開フラグ |
| status | ENUM | DEFAULT 'active' | ステータス (active/draft/archived) |
| comment_count | INT | DEFAULT 0 | コメント数 |
| view_count | INT | DEFAULT 0 | 閲覧数 |
| bookmark_count | INT | DEFAULT 0 | ブックマーク数 |
| good_count | INT | DEFAULT 0 | 評価数 |
| bad_count | INT | DEFAULT 0 | 否定評価数 |
| ad_count | INT | DEFAULT 0 | 広告表示数 |
| share_count | INT | DEFAULT 0 | シェア数 |
| pdf_download_count | INT | DEFAULT 0 | PDF DL数 |
| academic_field_id | UUID | FK | 学問分野ID |
| academic_field_name | VARCHAR(100) | | 学問分野名 |
| field_type | ENUM | | 分野タイプ (science/humanities) |
| level | ENUM | | レベル (basic/standard/applied) |
| question_count | INT | | 問題数 |
| duration_minutes | INT | | 試験時間（分） |
| major_type | INT | | 専攻タイプ |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now(), ON UPDATE | 更新日時 |
| version | INT | DEFAULT 1 | 楽観的ロック用バージョン |
| **インデックス** | | | |
| idx_user_id | (user_id) | | ユーザーの試験一覧検索用 |
| idx_university_id | (university_id) | | 大学別一覧 |
| idx_exam_year | (exam_year) | | 年度別一覧 |
| idx_status | (status) | | ステータス別絞り込み |

#### `questions` テーブル

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| id | UUID | PK | 大問ID |
| exam_id | UUID | FK, NOT NULL | 親試験ID |
| question_number | INT | NOT NULL | 問題番号（1, 2, 3...） |
| content | TEXT | | 大問の説明・指示文（Markdown形式） |
| format | INT | DEFAULT 0 | テキスト形式 (0=Markdown, 1=HTML) |
| difficulty | INT | DEFAULT 2 | 難易度 (1=基礎, 2=標準, 3=応用) |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now(), ON UPDATE | 更新日時 |
| **制約** | | | |
| unique(exam_id, question_number) | | | 同一試験内で問題番号は一意 |
| **インデックス** | | | |
| idx_exam_id | (exam_id) | | 試験内の問題検索用 |

#### `sub_questions` テーブル

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| id | UUID | PK | 小問ID |
| question_id | UUID | FK, NOT NULL | 親大問ID |
| sub_question_number | INT | NOT NULL | 小問番号（1, 2, 3...） |
| question_type_id | INT | NOT NULL | 問題形式 (1..5, 10..14) |
| content | TEXT | NOT NULL | 問題文（Markdown形式） |
| format | INT | DEFAULT 0 | テキスト形式 (0=Markdown, 1=HTML) |
| difficulty | INT | DEFAULT 2 | 難易度 (1..3) |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now(), ON UPDATE | 更新日時 |
| **制約** | | | |
| unique(question_id, sub_question_number) | | | 同一大問内で小問番号は一意 |
| **インデックス** | | | |
| idx_question_id | (question_id) | | 大問内の小問検索用 |
| idx_question_type_id | (question_type_id) | | 形式別検索 |

#### `sub_question_selection` テーブル（形式ID 1/2/3用）

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| id | UUID | PK | 選択肢ID |
| sub_question_id | UUID | FK, NOT NULL | 小問ID |
| content | TEXT | NOT NULL | 選択肢テキスト |
| is_correct | BOOLEAN | NOT NULL | 正解フラグ |
| sort_order | INT | NOT NULL | 表示順序 |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now(), ON UPDATE | 更新日時 |
| **インデックス** | | | |
| idx_sub_question_id | (sub_question_id) | | 小問別選択肢検索用 |

#### `sub_question_matching` テーブル（形式ID 4用）

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| id | UUID | PK | ペアID |
| sub_question_id | UUID | FK, NOT NULL | 小問ID |
| left_content | TEXT | NOT NULL | 左側テキスト（問題側） |
| right_content | TEXT | NOT NULL | 右側テキスト（答側） |
| sort_order | INT | NOT NULL | 表示順序 |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now(), ON UPDATE | 更新日時 |
| **インデックス** | | | |
| idx_sub_question_id | (sub_question_id) | | 小問別ペア検索用 |

#### `sub_question_ordering` テーブル（形式ID 5用）

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| id | UUID | PK | アイテムID |
| sub_question_id | UUID | FK, NOT NULL | 小問ID |
| content | TEXT | NOT NULL | アイテムテキスト |
| correct_order | INT | NOT NULL | 正解時の順序 (1, 2, 3...) |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now(), ON UPDATE | 更新日時 |
| **インデックス** | | | |
| idx_sub_question_id | (sub_question_id) | | 小問別アイテム検索用 |

#### `sub_question_essay` テーブル（形式ID 10-14用）

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| id | UUID | PK | 答案テンプレートID |
| sub_question_id | UUID | FK, NOT NULL | 小問ID |
| sample_answer | TEXT | NOT NULL | サンプル答案 |
| grading_criteria | TEXT | NOT NULL | 採点基準 |
| point_value | INT | NOT NULL | 配点 |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT now(), ON UPDATE | 更新日時 |
| **インデックス** | | | |
| idx_sub_question_id | (sub_question_id) | | 小問別答案検索用 |

#### `keywords` テーブル（グローバル）

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| id | UUID | PK | キーワードID |
| keyword | VARCHAR(100) | NOT NULL, UNIQUE | キーワード（正規化済み） |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| **インデックス** | | | |
| idx_keyword | (keyword) | | キーワード検索用 |

#### `sub_question_keywords` テーブル（多対多結合）

| カラム | 型 | 制約 | 説明 |
|--------|----|----- |------|
| sub_question_id | UUID | FK, NOT NULL | 小問ID |
| keyword_id | UUID | FK, NOT NULL | キーワードID |
| created_at | TIMESTAMP | DEFAULT now() | 作成日時 |
| **制約** | | | |
| PRIMARY KEY | (sub_question_id, keyword_id) | | 複合主キー |
| **インデックス** | | | |
| idx_sub_question_id | (sub_question_id) | | 小問別キーワード検索用 |
| idx_keyword_id | (keyword_id) | | キーワード別小問検索用 |

### 1.3 データ整合性・制約ルール

| ルール | 実装方法 | 説明 |
|--------|---------|------|
| **一対多関係** | FK + ON DELETE CASCADE | 試験削除時に大問・小問も削除 |
| **ユニーク制約** | UNIQUE (exam_id, question_number) | 同一試験内で大問番号の重複を防止 |
| **楽観的ロック** | version カラム | 競合時に 409 Conflict を返す |
| **問題形式の値域** | CHECK (question_type_id IN (1,2,3,4,5,10,11,12,13,14)) | 定義済みの形式のみ許可 |
| **難易度の値域** | CHECK (difficulty IN (1,2,3)) | 1=基礎, 2=標準, 3=応用 |
| **ステータスの値域** | ENUM ('active', 'draft', 'archived') | 定義済みのステータスのみ許可 |

---

## 2. API エンドポイント仕様

### 2.1 試験（Exam）関連

#### `GET /api/exams/:id` - 試験詳細取得

**リクエスト**:
```
GET /api/exams/exam-1?expand=questions,keywords
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "exam-1",
    "examName": "微分積分学 期末試験",
    "examType": 0,
    "universityId": "univ-1",
    "universityName": "筑波大学",
    "facultyId": "faculty-1",
    "facultyName": "数学科",
    "teacherId": "teacher-1",
    "teacherName": "山田太郎",
    "subjectId": "subject-1",
    "subjectName": "微分積分学",
    "examYear": 2024,
    "userId": "user-1",
    "isPublic": true,
    "status": "active",
    "level": "standard",
    "durationMinutes": 90,
    "questionCount": 9,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "questions": [
      {
        "id": "q-1",
        "questionNumber": 1,
        "content": "次の関数の導関数を求めよ。",
        "format": 0,
        "difficulty": 2,
        "keywords": [
          { "id": "kw-1", "keyword": "微分" }
        ],
        "subQuestions": [
          {
            "id": "sq-1",
            "subQuestionNumber": 1,
            "questionTypeId": "10",
            "content": "f(x) = x^2 \\sin(x) の導関数を求めよ。",
            "format": 0,
            "difficulty": 2,
            "keywords": [
              { "id": "kw-2", "keyword": "導関数" }
            ],
            "options": [],
            "pairs": [],
            "items": [],
            "answers": [
              {
                "id": "ans-1",
                "sampleAnswer": "f'(x) = 2x \\sin(x) + x^2 \\cos(x)",
                "gradingCriteria": "導関数の計算が正確であること。",
                "pointValue": 10
              }
            ]
          }
        ]
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**エラーレスポンス**:
- `404 Not Found`: 試験が見つからない
- `403 Forbidden`: アクセス権限がない

---

#### `PUT /api/exams/:id` - 試験全体更新（リプレイス）

**リクエスト**:
```json
{
  "examName": "微分積分学 期末試験 (修正版)",
  "examYear": 2025,
  "isPublic": true,
  "questions": [
    {
      "id": "q-1",
      "questionNumber": 1,
      "content": "...",
      "difficulty": 2,
      "subQuestions": [
        {
          "id": "sq-1",
          "subQuestionNumber": 1,
          "questionTypeId": "10",
          "content": "...",
          "answers": [...]
        }
      ]
    }
  ]
}
```

**レスポンス** (200 OK):
保存後の試験全体（上記と同じ形式）

**エラーレスポンス**:
- `400 Bad Request`: バリデーション失敗（Zod schema に不適合）
- `409 Conflict`: 競合（version が古い、楽観的ロック失敗）
- `403 Forbidden`: 編集権限なし

---

### 2.2 小問（SubQuestion）関連

#### `PUT /api/sub-questions/:id` - 小問基本情報更新

**リクエスト**:
```json
{
  "content": "修正された問題文",
  "difficulty": 2,
  "keywords": ["微分", "導関数"]
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "sq-1",
    "questionId": "q-1",
    "subQuestionNumber": 1,
    "questionTypeId": "10",
    "content": "修正された問題文",
    "difficulty": 2,
    "keywords": [
      { "id": "kw-2", "keyword": "微分" },
      { "id": "kw-3", "keyword": "導関数" }
    ]
  }
}
```

---

#### `PUT /api/sub-questions/:id/selection` - 選択肢データ更新（形式ID 1/2/3）

**リクエスト**:
```json
{
  "options": [
    { "id": "opt-1", "content": "選択肢A", "isCorrect": true },
    { "id": "opt-2", "content": "選択肢B", "isCorrect": false }
  ]
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "sq-1",
    "options": [...]
  }
}
```

---

#### `PUT /api/sub-questions/:id/matching` - マッチングデータ更新（形式ID 4）

**リクエスト**:
```json
{
  "pairs": [
    { "id": "pair-1", "question": "f(x) = x^2", "answer": "f'(x) = 2x" },
    { "id": "pair-2", "question": "f(x) = sin(x)", "answer": "f'(x) = cos(x)" }
  ]
}
```

---

#### `PUT /api/sub-questions/:id/ordering` - 並び替えデータ更新（形式ID 5）

**リクエスト**:
```json
{
  "items": [
    { "id": "item-1", "text": "関数を定義", "correctOrder": 1 },
    { "id": "item-2", "text": "導関数を計算", "correctOrder": 2 }
  ]
}
```

---

#### `PUT /api/sub-questions/:id/essay` - 記述系答案テンプレート更新（形式ID 10-14）

**リクエスト**:
```json
{
  "answers": [
    {
      "id": "essay-1",
      "sampleAnswer": "f'(x) = 2x \\sin(x) + x^2 \\cos(x)",
      "gradingCriteria": "導関数計算の正確性を評価",
      "pointValue": 10
    }
  ]
}
```

---

### 2.3 キーワード関連

#### `POST /api/sub-questions/:id/keywords` - キーワード追加

**リクエスト**:
```json
{
  "keyword": "微分積分"
}
```

**レスポンス** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "kw-new",
    "keyword": "微分積分"
  }
}
```

---

#### `DELETE /api/sub-questions/:id/keywords/:keywordId` - キーワード削除

**レスポンス** (204 No Content)

---

## 3. エラーハンドリング & HTTP ステータスコード

| HTTP ステータス | 用途 | 例 |
|-----------|------|-----|
| 200 OK | 正常な更新・取得 | PUT /exams/:id 成功 |
| 201 Created | リソース作成成功 | POST /keywords 成功 |
| 204 No Content | 削除成功 | DELETE /keywords/:id 成功 |
| 400 Bad Request | バリデーション失敗 | content が空文字 |
| 401 Unauthorized | 認証なし | トークン欠落 |
| 403 Forbidden | 認可失敗 | 他者の試験を編集しようとした |
| 404 Not Found | リソースなし | /exams/nonexistent |
| 409 Conflict | 競合（楽観的ロック失敗） | version 古い |
| 500 Internal Server Error | サーバー側エラー | DB接続失敗 |

### エラーレスポンス形式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "バリデーション失敗",
    "details": [
      {
        "field": "questions.0.subQuestions.0.content",
        "message": "問題文は必須です"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 4. バリデーション・ビジネスロジック

### 4.1 フロント側バリデーション（Zod Schema）

```typescript
// 即座にフィードバック（UX向上）
const SubQuestionSchema = z.object({
  content: z.string().min(1, '問題文は必須です'),
  options: z.array(...).min(2, '選択肢は2個以上必要です'),
  // ...
});
```

### 4.2 サーバー側バリデーション（二重検証）

```
1. スキーマ検証（Zod or OpenAPI）
2. ビジネスロジック検証
   - 単一選択：isCorrect が単一であること
   - 複数選択：isCorrect が1個以上であること
   - 並び替え：correct_order は 1..N の連続性
3. 権限検証（user_id == exam.user_id）
4. 整合性検証（形式と実データの一致）
```

### 4.3 バリデーションルール一覧

| フィールド | ルール | 例 |
|-----------|--------|-----|
| examName | 1-500文字 | "微分積分学 期末試験" |
| questionContent | Markdown, 最大10000文字 | "次の関数の..." |
| questionTypeId | 1\|2\|3\|4\|5\|10-14 | 1 |
| difficulty | 1\|2\|3 | 2 |
| options (form 1) | length >= 2 | [{text, isCorrect}] |
| options (form 2) | length >= 2, >=1 正解 | [{text, isCorrect}] |
| options (form 3) | length == 2 (true/false) | [{text: "真", isCorrect}] |
| pairs (form 4) | length >= 1 | [{question, answer}] |
| items (form 5) | correct_order 連続 | [{text, correctOrder: 1,2,...}] |
| answers (form 10-14) | length >= 1 | [{sampleAnswer, criteria, points}] |

---

## 5. 認可・セキュリティ設計

### 5.1 アクセス制御

```typescript
// 編集可能判定
const canEdit = (user.id === exam.userId);

// 公開試験の確認
const canView = exam.isPublic || user.id === exam.userId;
```

### 5.2 監査ログ

各 SubQuestion の更新・削除時に audit_logs テーブルに記録：

```sql
INSERT INTO audit_logs (
  user_id, action, entity_type, entity_id, 
  old_values, new_values, created_at
) VALUES (...);
```

**記録対象**:
- SubQuestion 作成・更新・削除
- 選択肢・ペア・アイテム・答案の変更

---

## 6. パフォーマンス最適化

### 6.1 インデックス戦略

```sql
-- 頻繁な検索用
CREATE INDEX idx_exam_user ON exams(user_id);
CREATE INDEX idx_question_exam ON questions(exam_id);
CREATE INDEX idx_sub_question_question ON sub_questions(question_id);

-- フィルタリング用
CREATE INDEX idx_exam_status ON exams(status);
CREATE INDEX idx_question_type ON sub_questions(question_type_id);
```

### 6.2 キャッシング戦略

| レイヤー | TTL | 対象 |
|---------|-----|------|
| クライアント (TanStack Query) | 5分 | GET /exams/:id |
| CDN | 1時間 | GET /exams/:id （公開試験のみ） |
| DB クエリキャッシュ | 10秒 | SELECT * FROM exams WHERE ... |

### 6.3 ページング・制限

```
- 試験リスト: limit 20 (デフォルト)
- 問題リスト: limit 100 per exam
- キーワード検索: limit 50
- API タイムアウト: 10秒
```

---

## 7. マイグレーション SQL（参考）

```sql
-- 1. exams テーブル
CREATE TABLE exams (
  id UUID PRIMARY KEY,
  exam_name VARCHAR(500) NOT NULL,
  user_id UUID NOT NULL,
  exam_year INT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  status ENUM('active', 'draft', 'archived') DEFAULT 'active',
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- 2. questions テーブル
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  exam_id UUID NOT NULL,
  question_number INT NOT NULL,
  content TEXT,
  difficulty INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_exam_question (exam_id, question_number),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_exam_id (exam_id)
);

-- 3. sub_questions テーブル
CREATE TABLE sub_questions (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL,
  sub_question_number INT NOT NULL,
  question_type_id INT NOT NULL,
  content TEXT NOT NULL,
  difficulty INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_question_subquestion (question_id, sub_question_number),
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id),
  INDEX idx_question_type_id (question_type_id),
  CHECK (question_type_id IN (1,2,3,4,5,10,11,12,13,14))
);

-- 4. sub_question_selection テーブル
CREATE TABLE sub_question_selection (
  id UUID PRIMARY KEY,
  sub_question_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  sort_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sub_question_id) REFERENCES sub_questions(id) ON DELETE CASCADE,
  INDEX idx_sub_question_id (sub_question_id)
);

-- (他のテーブルも同様に定義)
```

---

## 8. 今後の拡張・推奨事項

### 8.1 テンプレート機能
```sql
CREATE TABLE exam_templates (
  id UUID PRIMARY KEY,
  user_id UUID,
  name VARCHAR(255),
  template_data JSON,
  ...
);
```

### 8.2 バージョン管理
```sql
CREATE TABLE exam_revisions (
  id UUID PRIMARY KEY,
  exam_id UUID,
  revision_number INT,
  snapshot JSON,
  created_by UUID,
  created_at TIMESTAMP,
  ...
);
```

### 8.3 全文検索
Elasticsearch 導入で、キーワード検索を高速化：
```
POST /exams/_search
{
  "query": { "match": { "content": "微分積分" } }
}
```

---

## 参考資料

- **OpenAPI Spec**: `/docs/api-spec.yaml` (別途作成予定)
- **データベース正規化**: BCNF で設計
- **API設計**: REST 準拠、HATEOAS 考慮

