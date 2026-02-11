# Quick Reference: Q_DATABASE_REFACTPR.md v7.0.0

## Document Navigation

### Core Architecture (Chapters 1-2)
- **Chapter 1**: ENUM definitions, UUID+NanoID design, tech stack
- **Chapter 2**: Service ownership table

### Microservice Chapters (3-13)
Each follows this structure:
- **X.1**: Main DB Tables (DDL examples with UUID/NanoID)
- **X.2**: Log Tables (Physical DB separation)

| Chapter | Service | Main Features |
|---------|---------|---------------|
| 3 | eduanimaAuth | OAuth, tokens, IDP links |
| 4 | eduanimaUserProfile | Users, profiles, follows, notifications |
| 5 | eduanimaContent | Institutions, exams, questions (composite PKs) |
| 6 | eduanimaFile | File uploads, OCR jobs |
| 7 | eduanimaSearch | Search terms, Elasticsearch design |
| 8 | eduanimaAiWorker | **DB-less** (ELK only) |
| 9 | eduanimaSocial | Likes, comments, views (**no log tables**) |
| 10 | eduanimaMonetizeWallet | Wallets, transactions (**7-year logs**) |
| 11 | eduanimaRevenue | Revenue reports, ad aggregations |
| 12 | eduanimaModeration | Content/user reports |
| 13 | eduanimaGateway | Job orchestration |

### Reference Chapters (14-15)
- **Chapter 14**: Event-driven flows (Kafka topics)
- **Chapter 15**: Design guidelines (naming, indexing, partitioning)

## Key Design Patterns

### Primary Key Structure

**Standard Table:**
```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(8) NOT NULL UNIQUE,  -- NanoID
  -- columns
);
```

**Composite PK (5 special tables):**
```sql
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid(),
  public_id VARCHAR(8) NOT NULL,
  PRIMARY KEY (id, public_id),
  -- columns
);
```

**Tables with composite PKs:**
- teachers
- exams
- questions
- sub_questions
- keywords

### Log Table Pattern

```sql
CREATE TABLE service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- log columns
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);
```

**Physical DBs:**
- `eduanima_auth_logs`
- `eduanima_userprofile_logs`
- `eduanima_content_logs`
- `eduanima_file_logs`
- `eduanima_search_logs`
- `eduanima_wallet_logs` (7-year retention)
- `eduanima_revenue_logs`
- `eduanima_moderation_logs`
- `eduanima_gateway_logs`

## ENUMs Reference

### user_role_enum (4 values)
- `'free'`
- `'system'`
- `'admin'`
- `'premium'`

### content_report_reason_enum (no IDs)
- `'incorrect_answer'`
- `'unclear_question'`
- `'mismatch'`
- `'copyright'`
- `'inappropriate'`
- `'spam'`
- `'other'`

## Foreign Key Strategy

**Same service (physical FK):**
```sql
faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE
```

**Cross-service (logical FK only):**
```sql
user_id UUID NOT NULL  -- users.idを参照（論理的）
```

## Removed/Replaced

| Old | New/Status |
|-----|-----------|
| `established_year` | ❌ REMOVED |
| `mext_code` | ❌ REMOVED |
| `parent_institution_id` | ❌ REMOVED |
| `question_number` | ✅ `sort_order INT` |
| `sub_number` | ✅ `sort_order INT` |
| `academic_field_metadata` | ✅ ENUM only |
| `content_report_reasons` | ✅ ENUM only |
| AUTO_INCREMENT/SERIAL | ✅ UUID |

## Special Configurations

### eduanimaAiWorker
- **No PostgreSQL DB**
- Stateless design
- Logs via ELK Stack only

### eduanimaSocial
- **No separate log tables**
- Main tables serve as activity logs

### eduanimaMonetizeWallet
- **7-year log retention**
- Legal requirement for financial records
- `retention_until DATE` column

## Index Patterns

**Full-text search:**
```sql
CREATE INDEX idx_name ON table USING gin(to_tsvector('japanese', column));
```

**Vector search:**
```sql
CREATE INDEX idx_embedding ON table USING hnsw(embedding vector_cosine_ops);
```

**Partitioned table:**
```sql
CREATE INDEX idx_logs ON logs(entity_id, created_at);
```

## Quick Tips

1. **Finding a table**: Use table of contents or Ctrl+F for service name
2. **UUID generation**: `gen_random_uuid()` in PostgreSQL
3. **NanoID generation**: Application layer (8 or 16 chars)
4. **Log retention**: Check X.2 sections for specific policies
5. **Kafka topics**: Chapter 14 for event flows

## Version History

- **v7.0.0**: Complete microservice restructure
- **v6.2.0**: YouTube-style language/region separation
- **v6.0.0**: BCP 47 language codes
- **v5.0.0**: PostgreSQL 18.1, pgvector, Elasticsearch 9.2.4
