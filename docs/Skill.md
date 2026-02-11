# Eduanima Development Standards Documentation

---

## 1. Complete .clinerules Reference

```markdown
# Eduanima Development Standards v2026.02.2

## Project Context

Eduanima is an educational content sharing platform built with:
- **Microservices Architecture**: 11 services (Auth, Content, Search, AI Worker, etc.)
- **Development Team**: 1 person + CodingAgent collaboration
- **Developer Profile**: Junior engineer learning alongside AI assistance
- **Priority**: Production error prevention > Feature velocity

---

## Core Technology Stack (2026-02-06 Latest Stable)

| Technology | Version | Status | Release Date | Key Features |
|-----------|---------|--------|--------------|--------------|
| **Go** | **1.25.7** | MANDATORY | 2026-02-04 | Latest stable. Iterators, slog, math/rand/v2, security fixes |
| **Echo** | **v5.0.1** | MANDATORY | 2026-01-28 | Concrete struct Context (v4/Chi/Gin PROHIBITED) |
| **PostgreSQL** | **18.1+** | MANDATORY | 2025-10 | Native uuidv7(), AIO, B-tree skip scan |
| **pgvector** | **0.8.1+** | MANDATORY | 2025-09-04 | HNSW index iterative scan (10x faster LIMIT queries), 1536-dim |
| **Atlas** | **v1.0.0+** | MANDATORY | 2025-12-24 | Monitoring as Code, Schema Statistics (golang-migrate PROHIBITED) |
| **Redis** | 7.4+ | MANDATORY | - | Cache &amp; session store |
| **Kafka** | 4.1.0+ | MANDATORY | - | Event streaming (KRaft mode) |
| **Elasticsearch** | 9.2.4+ | MANDATORY | - | Unified search (Qdrant replaced) |
| **Debezium** | 3.0.1+ | MANDATORY | - | PostgreSQL CDC |

### Key Libraries

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| **go-jose/v4** | v4.0.5 | JWT/JWE/JWS | square/go-jose PROHIBITED |
| **franz-go** | v1.20.6 | Kafka client | KIP-848 support |
| **sqlc** | v1.30.0 | Type-safe SQL | pgx/v5 engine, ENUM arrays |
| **oapi-codegen/v2** | v2.5.0 | OpenAPI 3.1 codegen | - |
| **testcontainers-go** | v0.40.1 | Integration testing | - |
| **pgx/v5** | v5.8.0+ | PostgreSQL driver | lib/pq PROHIBITED |
| **golangci-lint** | v2.8.0 | Modern linting | - |
| **pgvector-go** | v0.3.0 | Vector operations | 1536-dim support |
| **google/uuid** | v1.6.0 | UUID parsing | Generation via PostgreSQL uuidv7() |
| **godotenv** | v1.5.1 | .env loading | Development only |
| **cloud.google.com/go/secretmanager** | v1.14.2+ | GCP Secret Manager | Production secrets |

### Observability Stack

| Tool | Version | Purpose |
|------|---------|---------|
| **OpenTelemetry Go SDK** | v1.32.0 | Distributed tracing |
| **Tempo** | v2.7.0 | Trace storage |
| **Prometheus** | v2.56.0 | Metrics collection |
| **Grafana** | v11.5.0 | Unified dashboards |
| **Loki** | v3.3.0 | Log aggregation |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Atlas** | v1.0.0+ | Database migrations |
| **Spectral** | v6.14.0 | OpenAPI linter |
| **Docker Compose** | v2.31.0 | Local development |
| **k6** | Latest | Load testing |

---

## ⚠️ AI Agent Hallucination Prevention

**CRITICAL: This section prevents AI coding agents from using outdated/incorrect versions.**

### Version Reference Table (Updated: 2026-02-06)

| Technology | REQUIRED Version | Released | Previous Versions (PROHIBITED) |
|-----------|------------------|----------|-------------------------------|
| **Go** | **1.25.7** | 2026-02-04 | 1.25.6, 1.24.x, 1.23.x, 1.22.x |
| **PostgreSQL** | **18.1+** | 2025-10 | 17.x, 16.x, 15.x, 14.x |
| **pgvector** | **0.8.1+** | 2025-09-04 | 0.8.0, 0.7.x, 0.6.x, 0.5.x |
| **Atlas** | **v1.0.0+** | 2025-12-24 | 0.28.x, 0.27.x, 0.26.x, 0.25.x |
| **sqlc** | **1.30.0+** | 2025-09-01 | 1.29.x, 1.28.x, 1.27.x, 1.26.x |
| **pgx** | **v5.8.0+** | 2025-12-26 | v5.7.x, v5.6.x, v5.5.x, v4.x |
| **Echo** | **v5.0.1+** | 2026-01-28 | v5.0.0-beta, v4.x, v3.x |

### Feature Availability Matrix

| Feature | Minimum Version | Verification Method |
|---------|----------------|---------------------|
| **uuidv7()** | PostgreSQL 18.0+ | `SELECT uuidv7();` (no extension needed) |
| **B-tree Skip Scan** | PostgreSQL 18.0+ | Automatic (check `EXPLAIN` output) |
| **Async I/O (AIO)** | PostgreSQL 18.0+ | Enabled by default |
| **HNSW Iterative Scan** | pgvector 0.8.1+ | 10x faster LIMIT queries |
| **Monitoring as Code** | Atlas v1.0.0+ | `atlas schema inspect --format stats` |
| **ENUM Arrays** | sqlc 1.30.0+ | `[]UserRole` type generation |
| **Concrete Context** | Echo v5.0.0+ | `func(c *echo.Context)` (NOT interface) |

### AI Agent Pre-Flight Checklist

Before generating ANY code, verify:

- [ ] ✅ Import paths use correct versions:
  - `github.com/labstack/echo/v5` (NOT v4)
  - `github.com/jackc/pgx/v5` (NOT v4 or github.com/lib/pq)
  - `github.com/go-jose/go-jose/v4` (NOT square/go-jose)
  - `cloud.google.com/go/secretmanager/apiv1` (NOT Doppler)

- [ ] ✅ PostgreSQL syntax uses latest features:
  - `DEFAULT uuidv7()` (NOT gen_random_uuid() or uuid_generate_v4())
  - `vector(1536)` type (NOT embedding column without dimension)
  - `USING HNSW` (NOT IVFFlat or GiST)

- [ ] ✅ Logging uses structured format:
  - `slog.Info("message", slog.String("key", value))` (NOT fmt.Println() or log.Printf())

- [ ] ✅ Secret management follows environment rules:
  - Development: `godotenv.Load()` + `.env` file
  - Production: `secretmanager.NewClient()` + GCP Secret Manager
  - (NOT Doppler CLI commands)

- [ ] ✅ Primary key design follows composite key rules:
  - 5 special tables (`teachers`, `exams`, `questions`, `sub_questions`, `keywords`):
    ```sql
    PRIMARY KEY (id, public_id)
    ```
  - All other tables:
    ```sql
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    public_id VARCHAR(8) NOT NULL UNIQUE
    ```
  - Foreign keys ALWAYS reference `id` column only (NOT composite)

**If ANY item is uncertain, STOP and ASK THE USER before proceeding.**

---

## Go 1.25.7 Standards

### 1. Iterators (Range over Functions) - MANDATORY

**Use iter.Seq2 for streaming database results.**

```go
import "iter"

// ✅ CORRECT: Iterator pattern
func (r *ExamRepository) StreamExams(ctx context.Context) iter.Seq2[*Exam, error] {
    return func(yield func(*Exam, error) bool) {
        rows, err := r.db.Query(ctx, "SELECT * FROM exams")
        if err != nil {
            yield(nil, err)
            return
        }
        defer rows.Close()
        
        for rows.Next() {
            var exam Exam
            if err := rows.Scan(&exam.ID, &exam.Title); err != nil {
                yield(nil, err)
                return
            }
            if !yield(&exam, nil) {
                return  // Consumer stopped
            }
        }
    }
}

// Usage
for exam, err := range repo.StreamExams(ctx) {
    if err != nil {
        return err
    }
    process(exam)  // Constant memory
}

// ❌ PROHIBITED: Loading all into memory
exams, _ := repo.ListExams(ctx, 10000)  // Memory spike!
```

**Use Cases:**
- AI batch processing (embeddings, OCR)
- Revenue aggregation
- Search indexing

---

### 2. Structured Logging (slog) - MANDATORY

**Replace ALL fmt.Println, log.Printf with slog.**

```go
import "log/slog"

// Initialize at startup
func initLogger() *slog.Logger {
    var handler slog.Handler
    if os.Getenv("ENV") == "production" {
        handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
            Level: slog.LevelInfo,
            AddSource: true,
        })
    } else {
        handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
            Level: slog.LevelDebug,
        })
    }
    return slog.New(handler)
}

// Request-scoped logging
func SlogMiddleware() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c *echo.Context) error {
            logger := slog.With(
                slog.String("request_id", c.Response().Header().Get(echo.HeaderXRequestID)),
                slog.String("method", c.Request().Method),
                slog.String("path", c.Request().URL.Path),
            )
            c.Set("logger", logger)
            
            start := time.Now()
            err := next(c)
            
            logger.Info("request completed",
                slog.Int("status", c.Response().Status),
                slog.Duration("duration", time.Since(start)),
            )
            return err
        }
    }
}

// Handler usage
func getExam(c *echo.Context) error {
    logger := c.Get("logger").(*slog.Logger)
    logger.Debug("fetching exam", slog.String("exam_id", examID))
    // ...
}
```

**Benefits:**
- Structured logs → Loki/Elasticsearch parsing
- Request tracing via request_id
- Performance metrics built-in

---

### 3. math/rand/v2 - MANDATORY

```go
import "math/rand/v2"  // ✅ Go 1.25.6

// ✅ CORRECT: Auto-seeded, thread-safe
func generateSessionID() string {
    return fmt.Sprintf("%d", rand.Int64())
}

// ❌ PROHIBITED: Old API
import "math/rand"
rand.Seed(time.Now().UnixNano())  // Race condition!

// ⚠️ CRITICAL: Use crypto/rand for security
import "crypto/rand"
func generateAccessToken() (string, error) {
    b := make([]byte, 32)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b), nil
}
```

**Use math/rand/v2 for:**
- Session IDs
- Test data
- A/B testing

**Use crypto/rand for:**
- OAuth2 tokens
- Password reset tokens
- API keys

---

## Echo v5.0.1 Standards

### 1. Architecture Pattern

```
eduanimaContent/
  cmd/
    server/
      main.go
  internal/
    handler/          # HTTP handlers (Echo)
      exam_handler.go
    service/          # Business logic
      exam_service.go
    repository/       # Data access (sqlc)
      exam_repository.go
      query.sql
      generated.go
    domain/           # Domain models
      exam.go
  api/
    openapi.yaml
```

---

### 2. Dependency Injection

```go
// domain/exam.go
type ExamRepository interface {
    GetByID(ctx context.Context, id uuid.UUID) (*Exam, error)
}

type ExamService interface {
    GetExam(ctx context.Context, publicID string) (*Exam, error)
}

// service/exam_service.go
type examService struct {
    repo   domain.ExamRepository
    logger *slog.Logger
}

func NewExamService(repo domain.ExamRepository, logger *slog.Logger) domain.ExamService {
    return &examService{repo: repo, logger: logger}
}

// handler/exam_handler.go
type ExamHandler struct {
    service domain.ExamService
}

func NewExamHandler(service domain.ExamService) *ExamHandler {
    return &ExamHandler{service: service}
}

// cmd/server/main.go - Wire dependencies
func main() {
    logger := initLogger()
    db := initDB()
    
    examRepo := repository.NewExamRepository(db)
    examService := service.NewExamService(examRepo, logger)
    examHandler := handler.NewExamHandler(examService)
    
    e := echo.New()
    e.GET("/exams/:id", examHandler.GetExam)
    e.Start(":8080")
}
```

---

### 3. Error Handling

```go
// Standard errors
var (
    ErrNotFound     = errors.New("resource not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrBadRequest   = errors.New("bad request")
)

// Error response
type ErrorResponse struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Details any    `json:"details,omitempty"`
}

// Centralized handler
func handleError(c *echo.Context, err error) error {
    logger := c.Get("logger").(*slog.Logger)
    logger.Error("request error", slog.Any("error", err))
    
    switch {
    case errors.Is(err, ErrNotFound):
        return c.JSON(http.StatusNotFound, ErrorResponse{
            Code:    "NOT_FOUND",
            Message: "Resource not found",
        })
    case errors.Is(err, ErrBadRequest):
        return c.JSON(http.StatusBadRequest, ErrorResponse{
            Code:    "BAD_REQUEST",
            Message: err.Error(),
        })
    default:
        return c.JSON(http.StatusInternalServerError, ErrorResponse{
            Code:    "INTERNAL_ERROR",
            Message: "Unexpected error",
        })
    }
}
```

---

### 4. Request Validation (oapi-codegen)

```yaml
# api/openapi.yaml
components:
  schemas:
    CreateExamRequest:
      type: object
      required: [title, academic_year]
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 255
        academic_year:
          type: integer
          minimum: 2000
          maximum: 2100
```

```bash
# Generate code
oapi-codegen -package api -generate types,echo-server api/openapi.yaml > internal/api/generated.go
```

```go
// Handler - automatic validation
func (h *ExamHandler) CreateExam(c *echo.Context) error {
    var req api.CreateExamRequest
    if err := c.Bind(&req); err != nil {
        return handleValidationError(c, err)
    }
    // req is validated against OpenAPI spec
}
```

---

## PostgreSQL 18.1 Standards

### 1. Connection Pool

```go
func initDB(ctx context.Context) *pgxpool.Pool {
    config, _ := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
    
    // Pool tuning
    config.MaxConns = 25
    config.MinConns = 5
    config.MaxConnLifetime = 1 * time.Hour
    config.MaxConnIdleTime = 15 * time.Minute
    config.HealthCheckPeriod = 1 * time.Minute
    config.ConnConfig.ConnectTimeout = 5 * time.Second
    
    // Statement timeout
    config.ConnConfig.RuntimeParams = map[string]string{
        "statement_timeout": "30000",  // 30s
    }
    
    // OpenTelemetry
    config.ConnConfig.Tracer = otelpgx.NewTracer()
    
    pool, _ := pgxpool.NewWithConfig(ctx, config)
    pool.Ping(ctx)
    return pool
}
```

**Pool Sizing:**
```
MaxConns = (CPU Cores × 2) + 1
Cloud default: 25-50
```

---

### 2. Transaction Pattern

```go
func (s *examService) CreateExamWithQuestions(ctx context.Context, req CreateExamRequest) error {
    tx, _ := s.db.Begin(ctx)
    defer tx.Rollback(ctx)
    
    exam, _ := s.queries.WithTx(tx).CreateExam(ctx, req)
    for _, q := range req.Questions {
        s.queries.WithTx(tx).CreateQuestion(ctx, q)
    }
    
    return tx.Commit(ctx)
}
```

---

### 3. Batch Insert (COPY Protocol)

```go
func (r *ExamRepository) BatchInsertQuestions(ctx context.Context, questions []*Question) error {
    return r.db.CopyFrom(
        ctx,
        pgx.Identifier{"questions"},
        []string{"id", "exam_id", "question_text"},
        pgx.CopyFromSlice(len(questions), func(i int) ([]any, error) {
            q := questions[i]
            return []any{q.ID, q.ExamID, q.QuestionText}, nil
        }),
    )
}
```

**Performance:**
- Individual INSERTs: 50s for 10k rows
- Batched INSERTs: 5s for 10k rows
- **COPY protocol: 500ms for 10k rows** ✅

---

### 4. Vector Search

```sql
-- query.sql
-- name: SearchExamsBySimilarity :many
SELECT id, public_id, title, 1 - (embedding <=> $1::vector) AS similarity
FROM exams
WHERE status = 'active' AND embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT $2;
```

```sql
-- HNSW Index tuning
SET hnsw.ef_search = 100;  -- 95% recall, 15ms query time
```

---

### 5. pgvector 0.8.1 Iterative Index Scan (NEW)

**Performance Breakthrough: 10x Faster LIMIT Queries**

pgvector 0.8.1 introduces iterative HNSW index scans, dramatically improving performance for top-K queries.

**Before (0.7.x - Full Index Scan):**
```sql
-- Old behavior: Scans entire index
SELECT id, title, 1 - (embedding <=> $1::vector) AS similarity
FROM exams
WHERE status = 'active'
ORDER BY embedding <=> $1::vector
LIMIT 10;
-- Execution time: 50ms (1M rows)
```

**After (0.8.1+ - Iterative Scan):**
```sql
-- New behavior: Stops after finding 10 results
SELECT id, title, 1 - (embedding <=> $1::vector) AS similarity
FROM exams
WHERE status = 'active'
ORDER BY embedding <=> $1::vector
LIMIT 10;
-- Execution time: 5ms (1M rows) ✅ 10x improvement
```

**Tuning Parameters:**

```sql
-- High recall (research/critical apps)
SET hnsw.ef_search = 200;  -- 98% recall, 8ms query time

-- Balanced (default)
SET hnsw.ef_search = 100;  -- 95% recall, 5ms query time

-- High throughput (real-time apps)
SET hnsw.ef_search = 50;   -- 90% recall, 2ms query time
```

**Verification:**

```sql
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id FROM exams 
ORDER BY embedding <=> '[0.1,0.2,...]'::vector(1536) 
LIMIT 10;

-- Look for: "Index Scan using idx_exams_embedding_hnsw"
--           "Rows Removed by Index Recheck: 0" (iterative scan working)
```

**Atlas HCL Configuration:**

```hcl
index "idx_exams_embedding_hnsw" {
  type = HNSW
  columns = [column.embedding]
  options = {
    m = 16               # Connections per node (balanced)
    ef_construction = 64 # Build-time quality (moderate)
  }
  ops = vector_cosine_ops
}
```

**Go Integration:**

```go
import "github.com/pgvector/pgvector-go"

// Query with tuned ef_search
func (r *ExamRepository) SearchBySimilarity(
    ctx context.Context, 
    embedding []float32, 
    limit int32,
) ([]*Exam, error) {
    // Set session parameter
    _, err := r.db.Exec(ctx, "SET LOCAL hnsw.ef_search = 100")
    if err != nil {
        return nil, err
    }
    
    // Execute vector search
    return r.queries.SearchExamsBySimilarity(ctx, repository.SearchExamsBySimilarityParams{
        Embedding: pgvector.NewVector(embedding),
        Limit:     limit,
    })
}
```

**Performance Benchmarks (1M exam dataset):**

| ef_search | Recall | Latency (p50) | Latency (p99) | Throughput |
|-----------|--------|---------------|---------------|------------|
| 50 | 90% | 2ms | 5ms | 500 QPS |
| 100 | 95% | 5ms | 12ms | 200 QPS |
| 200 | 98% | 8ms | 20ms | 125 QPS |
| 400 | 99.5% | 15ms | 40ms | 66 QPS |

**Recommendation:** Use `ef_search = 100` for production (95% recall, 5ms latency).

---

## Atlas Migration Standards

### 1. Configuration

```hcl
# atlas.hcl
env "dev" {
  src = "file://schema"
  url = env("DATABASE_URL")
  dev = "docker://postgres/18/dev"
  
  migration {
    dir = "file://migrations"
  }
  
  diff {
    skip {
      drop_schema = true
      drop_table  = true
    }
  }
}

env "prod" {
  src = "file://schema"
  url = env("DATABASE_URL")
  
  migration {
    dir = "file://migrations"
  }
  
  diff {
    skip {
      drop_schema = true
      drop_table  = true
      drop_column = true
    }
  }
}
```

---

### 2. Schema Templates

**Standard Table (UUID PK):**
```hcl
table "table_name" {
  schema = schema.public
  
  column "id" {
    type = uuid
    default = sql("uuidv7()")
  }
  
  column "public_id" {
    type = varchar(8)
    null = false
  }
  
  column "created_at" {
    type = timestamptz
    default = sql("CURRENT_TIMESTAMP")
  }
  
  primary_key {
    columns = [column.id]
  }
  
  index "idx_table_name_public_id" {
    unique = true
    columns = [column.public_id]
  }
}
```

**Composite PK (5 special tables):**
```hcl
# For: teachers, exams, questions, sub_questions, keywords
table "exams" {
  column "id" {
    type = uuid
    default = sql("uuidv7()")
  }
  column "public_id" {
    type = varchar(8)
    null = false
  }
  
  primary_key {
    columns = [column.id, column.public_id]
  }
  
  index "idx_exams_public_id" {
    unique = true
    columns = [column.public_id]
  }
}
```

**ENUM Type:**
```hcl
enum "user_role_enum" {
  schema = schema.public
  values = ["free", "system", "admin", "premium"]
}

table "users" {
  column "role" {
    type = enum.user_role_enum
    default = "free"
  }
}
```

**Vector Column:**
```hcl
column "embedding" {
  type = sql("vector(1536)")
  null = true
}

index "idx_exams_embedding_hnsw" {
  type = HNSW
  columns = [column.embedding]
  options = {
    m = 16
    ef_construction = 64
  }
  ops = vector_cosine_ops
}
```

**Foreign Key (Logical - Cross-Service):**
```hcl
column "user_id" {
  type = uuid
  null = false
  comment = "Logical FK to users.id (no constraint)"
}
```

**Foreign Key (Physical - Same Service):**
```hcl
column "faculty_id" {
  type = uuid
  null = false
}

foreign_key "fk_departments_faculty" {
  columns = [column.faculty_id]
  ref_columns = [table.faculties.column.id]
  on_delete = CASCADE
}
```

---

### 4. Atlas v1.0.0 Monitoring as Code (NEW)

**Production Schema Health Tracking**

Atlas v1.0.0 introduces built-in monitoring and schema statistics for production databases.

**Configuration (atlas.hcl):**

```hcl
env "prod" {
  src = "file://schema"
  url = env("DATABASE_URL")
  
  migration {
    dir = "file://migrations"
  }
  
  // NEW: Monitoring configuration
  monitor {
    // Query performance tracking
    query_performance {
      slow_threshold = "100ms"
      alert_channel = "slack://ops-alerts"
      log_queries = true
    }
    
    // Index usage tracking
    index_usage {
      min_usage_percentage = 50  // Alert if < 50% usage
      check_interval = "24h"
      exclude_pattern = "^idx_temp_"
    }
    
    // Table bloat detection
    bloat {
      threshold_percentage = 20
      check_interval = "12h"
      auto_vacuum_hint = true
    }
  }
  
  // Schema statistics
  stats {
    enabled = true
    retention_days = 90
    export_path = "file://schema-stats"
  }
}
```

**Generate Schema Health Report:**

```bash
# Inspect schema with statistics
atlas schema inspect \
  --url "env://prod" \
  --format "{{ json .Stats }}" > schema_stats.json

# Output structure:
{
  "tables": {
    "exams": {
      "row_count": 1250000,
      "size_bytes": 524288000,
      "index_size_bytes": 104857600,
      "bloat_percentage": 5.2,
      "last_vacuum": "2026-02-05T10:30:00Z",
      "last_analyze": "2026-02-05T10:30:00Z"
    }
  },
  "indexes": {
    "idx_exams_embedding_hnsw": {
      "size_bytes": 78643200,
      "usage_count": 125000,
      "scans": 450000,
      "tuples_read": 4500000,
      "tuples_fetched": 45000
    },
    "idx_exams_public_id": {
      "size_bytes": 26214400,
      "usage_count": 2500000,
      "scans": 2500000,
      "tuples_read": 2500000,
      "tuples_fetched": 2500000
    }
  },
  "queries": {
    "slow_queries": [
      {
        "query": "SELECT * FROM exams WHERE title ILIKE '%physics%'",
        "avg_duration_ms": 250,
        "call_count": 1500,
        "recommendation": "Add GIN index on title column"
      }
    ]
  }
}
```

**Automated Alerts (GitHub Actions):**

```yaml
# .github/workflows/schema-health.yml
name: Schema Health Check
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ariga/setup-atlas@v0
        with:
          version: v1.0.0
      
      - name: Check schema health
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
        run: |
          atlas schema inspect --url "$DATABASE_URL" --format "{{ json .Stats }}" > stats.json
          
          # Check for bloat
          BLOAT=$(jq '.tables | to_entries | map(select(.value.bloat_percentage > 20)) | length' stats.json)
          if [ "$BLOAT" -gt 0 ]; then
            echo "❌ $BLOAT tables have >20% bloat"
            exit 1
          fi
          
          # Check for unused indexes
          UNUSED=$(jq '.indexes | to_entries | map(select(.value.usage_count == 0)) | length' stats.json)
          if [ "$UNUSED" -gt 0 ]; then
            echo "⚠️ $UNUSED indexes are unused (consider dropping)"
          fi
          
          echo "✅ Schema health check passed"
      
      - name: Upload stats artifact
        uses: actions/upload-artifact@v4
        with:
          name: schema-stats
          path: stats.json
```

**Index Usage Report:**

```bash
# Generate index usage report
atlas schema inspect \
  --url "env://prod" \
  --format "{{ range .Indexes }}{{ if lt .UsageCount 1000 }}{{ .Name }}: {{ .UsageCount }} uses{{ end }}{{ end }}" \
  > unused_indexes.txt

# Example output:
# idx_exams_created_at: 50 uses
# idx_questions_legacy_id: 0 uses
```

**Recommendations:**
- Run `atlas schema inspect` daily in CI/CD
- Set up Slack alerts for bloat &gt; 20%
- Review unused indexes quarterly
- Export stats to BigQuery for long-term analysis

---

### 5. Daily Workflow

```bash
# Create new table
atlas migrate diff add_exam_views --env dev
atlas migrate apply --env dev

# Add column
# (Edit schema/exams.hcl)
atlas migrate diff add_is_featured --env dev
atlas migrate apply --env dev

# Production deployment
atlas migrate apply --env prod --dry-run > prod_plan.sql
# Review prod_plan.sql
atlas migrate apply --env prod
```

---

## Kafka Standards (franz-go)

### 1. Producer

```go
func NewProducer(brokers []string) (*Producer, error) {
    client, err := kgo.NewClient(
        kgo.SeedBrokers(brokers...),
        kgo.RequiredAcks(kgo.AllISRAcks()),
        kgo.ProducerLinger(10 * time.Millisecond),
        kgo.ProducerBatchMaxBytes(1000000),
        kgo.WithHooks(kotel.NewKotel().Hooks()...),
        kgo.ProducerBatchCompression(kgo.GzipCompression()),
    )
    return &Producer{client: client}, err
}

func (p *Producer) PublishEvent(ctx context.Context, topic, key string, value []byte) error {
    record := &kgo.Record{
        Topic: topic,
        Key:   []byte(key),
        Value: value,
    }
    return p.client.ProduceSync(ctx, record).FirstErr()
}
```

---

### 2. Consumer

```go
func NewConsumer(brokers []string, groupID string, topics []string, handler EventHandler) (*Consumer, error) {
    client, err := kgo.NewClient(
        kgo.SeedBrokers(brokers...),
        kgo.ConsumerGroup(groupID),
        kgo.ConsumeTopics(topics...),
        kgo.ConsumeResetOffset(kgo.NewOffset().AtStart()),
        kgo.SessionTimeout(30 * time.Second),
        kgo.WithHooks(kotel.NewKotel().Hooks()...),
    )
    return &Consumer{client: client, handler: handler}, err
}

func (c *Consumer) Start(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
        }
        
        fetches := c.client.PollFetches(ctx)
        fetches.EachRecord(func(record *kgo.Record) {
            if err := c.handler(ctx, record); err != nil {
                // Log error, send to DLQ
            } else {
                c.client.CommitRecords(ctx, record)
            }
        })
    }
}
```

---

### 3. Topic Schema

| Topic | Producer | Consumer | Retention |
|-------|----------|----------|-----------|
| `content.lifecycle` | eduanimaContent | eduanimaSearch, eduanimaGateway | 7 days |
| `content.jobs` | eduanimaFile | eduanimaGateway, eduanimaAiWorker | 3 days |
| `ai.results` | eduanimaAiWorker | eduanimaContent, eduanimaGateway | 3 days |
| `content.feedback` | eduanimaSocial | eduanimaContent | 30 days |
| `monetization.transactions` | eduanimaMonetizeWallet | eduanimaRevenue | 365 days |

---

## Testing Standards

### 1. Coverage Requirements

- Unit tests: **80% minimum**
- Integration tests: Critical paths
- E2E tests: Happy path + 3-5 errors

---

### 2. Unit Test Pattern

```go
func TestExamService_GetExam(t *testing.T) {
    tests := []struct {
        name      string
        publicID  string
        mockSetup func(*MockExamRepository)
        wantErr   error
    }{
        {
            name:     "success",
            publicID: "abc12345",
            mockSetup: func(m *MockExamRepository) {
                m.On("GetByID", mock.Anything, mock.Anything).Return(&domain.Exam{
                    PublicID: "abc12345",
                }, nil)
            },
            wantErr: nil,
        },
        {
            name:     "not found",
            publicID: "notfound",
            mockSetup: func(m *MockExamRepository) {
                m.On("GetByID", mock.Anything, mock.Anything).Return(nil, domain.ErrNotFound)
            },
            wantErr: domain.ErrNotFound,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mockRepo := new(MockExamRepository)
            tt.mockSetup(mockRepo)
            svc := service.NewExamService(mockRepo, slog.Default())
            
            _, err := svc.GetExam(context.Background(), tt.publicID)
            
            if tt.wantErr != nil {
                assert.Error(t, err)
            } else {
                assert.NoError(t, err)
            }
            mockRepo.AssertExpectations(t)
        })
    }
}
```

---

### 3. Integration Test Pattern

```go
//go:build integration

type ExamRepositoryIntegrationSuite struct {
    suite.Suite
    container testcontainers.Container
    pool      *pgxpool.Pool
}

func (s *ExamRepositoryIntegrationSuite) SetupSuite() {
    ctx := context.Background()
    pgContainer, _ := postgres.Run(ctx,
        "pgvector/pgvector:pg18",
        postgres.WithDatabase("testdb"),
        postgres.WithInitScripts("../migrations/initial.sql"),
    )
    s.container = pgContainer
    connStr, _ := pgContainer.ConnectionString(ctx, "sslmode=disable")
    s.pool, _ = pgxpool.New(ctx, connStr)
}

func (s *ExamRepositoryIntegrationSuite) TestCreate() {
    exam := &domain.Exam{ID: uuid.New(), PublicID: "test1234"}
    err := s.repo.Create(context.Background(), exam)
    s.NoError(err)
}
```

---

## CI/CD Pipeline

### GitHub Actions Template

```yaml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.25.7'
      - uses: golangci/golangci-lint-action@v6
        with:
          version: v2.8.0
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
      - run: go test ./... -short -coverprofile=coverage.out
      - run: |
          COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | sed 's/%//')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then exit 1; fi
  
  atlas-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ariga/setup-atlas@v0
      - run: atlas migrate validate --env dev
```

---

## Security Standards

### 1. Secret Management (Environment-Based)

**⚠️ Doppler is PROHIBITED as of v7.0.2**

**Development Environment (.env):**
```bash
# .env (Git-ignored, DO NOT COMMIT)
DATABASE_URL=postgresql://user:pass@localhost:5432/eduanima_dev
JWT_SECRET=dev_secret_key_32_chars_min
GEMINI_API_KEY=dev_api_key_for_testing
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
```

```go
// main.go - Load .env in development only
import "github.com/joho/godotenv"

func init() {
    if os.Getenv("ENV") != "production" {
        if err := godotenv.Load(); err != nil {
            log.Fatal("Error loading .env file")
        }
    }
}
```

**Production Environment (GCP Secret Manager):**
```go
import (
    secretmanager "cloud.google.com/go/secretmanager/apiv1"
    "cloud.google.com/go/secretmanager/apiv1/secretmanagerpb"
)

type SecretClient struct {
    client    *secretmanager.Client
    projectID string
}

func NewSecretClient(ctx context.Context, projectID string) (*SecretClient, error) {
    client, err := secretmanager.NewClient(ctx)
    if err != nil {
        return nil, fmt.Errorf("failed to create secret manager client: %w", err)
    }
    return &SecretClient{client: client, projectID: projectID}, nil
}

func (s *SecretClient) GetSecret(ctx context.Context, name string) (string, error) {
    req := &secretmanagerpb.AccessSecretVersionRequest{
        Name: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", 
            s.projectID, name),
    }
    
    result, err := s.client.AccessSecretVersion(ctx, req)
    if err != nil {
        return "", fmt.Errorf("failed to access secret %s: %w", name, err)
    }
    
    return string(result.Payload.Data), nil
}

// Usage in main.go
func main() {
    ctx := context.Background()
    projectID := os.Getenv("GCP_PROJECT_ID")
    
    secretClient, _ := NewSecretClient(ctx, projectID)
    dbURL, _ := secretClient.GetSecret(ctx, "DATABASE_URL")
    jwtSecret, _ := secretClient.GetSecret(ctx, "JWT_SECRET")
    
    db := initDB(ctx, dbURL)
    authService := initAuth(jwtSecret)
}
```

**Cloud Run Deployment:**
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'eduanima-content'
      - '--image=gcr.io/${PROJECT_ID}/eduanima-content'
      - '--region=asia-northeast1'
      - '--set-secrets=DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest'
```

**❌ PROHIBITED:**
- Doppler CLI (`doppler run`, `doppler secrets download`)
- Hardcoded secrets in code
- Environment variables in Dockerfile
- Secrets in Git repository

---

### 2. JWT Authentication

```go
import "github.com/go-jose/go-jose/v4/jwt"

func JWTMiddleware() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c *echo.Context) error {
            tokenString := c.Request().Header.Get("Authorization")
            token, err := jwt.ParseSigned(tokenString, []jose.SignatureAlgorithm{jose.HS256})
            if err != nil {
                return echo.NewHTTPError(http.StatusUnauthorized)
            }
            
            claims := &CustomClaims{}
            token.Claims(jwtKey, claims)
            c.Set("user_id", claims.UserID)
            return next(c)
        }
    }
}
```

---

## Observability

### OpenTelemetry Setup

```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
    "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer() {
    exporter, _ := otlptracegrpc.New(context.Background(),
        otlptracegrpc.WithEndpoint("tempo:4317"),
        otlptracegrpc.WithInsecure(),
    )
    tp := trace.NewTracerProvider(trace.WithBatcher(exporter))
    otel.SetTracerProvider(tp)
}

// Echo middleware
e.Use(otelecho.Middleware("eduanimaContent"))

// pgx tracing
config.ConnConfig.Tracer = otelpgx.NewTracer()

// Kafka tracing
kgo.WithHooks(kotel.NewKotel().Hooks()...)
```

---

### Prometheus Metrics

```go
var dbQueryDuration = promauto.NewHistogramVec(
    prometheus.HistogramOpts{
        Name: "eduanima_db_query_duration_seconds",
        Buckets: prometheus.ExponentialBuckets(0.001, 2, 10),
    },
    []string{"query_name"},
)

func (r *ExamRepository) GetByID(ctx context.Context, id uuid.UUID) (*Exam, error) {
    timer := prometheus.NewTimer(dbQueryDuration.WithLabelValues("GetExamByID"))
    defer timer.ObserveDuration()
    return r.queries.GetExamByID(ctx, id)
}
```

---

## CodingAgent Collaboration Guidelines

### 1. Code Generation Prompts

**Example: Create Handler**
```
Generate Echo v5 handler for ExamService.GetExam:
- Extract public_id from path param
- Call service.GetExam with context
- Handle errors using handleError function
- Return JSON response
- Include slog logging
```

**Example: Create Test**
```
Generate table-driven unit tests for ExamService.GetExam:
- Use testify/assert and testify/mock
- Cover success + not_found + internal_error
- Follow Eduanima conventions
```

---

### 2. Atlas Schema Generation

```
Create Atlas HCL schema for "exam_comments" table (Phase 2 deployment - 2026 Q4-2027 Q1):
- id: UUID v7
- exam_id: UUID (logical FK)
- user_id: UUID (logical FK)
- comment_text: TEXT not null
- is_edited, is_deleted: BOOLEAN
- created_at, updated_at: TIMESTAMPTZ
- Indexes on exam_id, user_id
- Add comment indicating Phase 2 deployment
```

---

### 3. Code Review Checklist

**CodingAgent MUST verify:**
- [ ] All imports use correct versions (go-jose/v4, not square/go-jose)
- [ ] slog used instead of fmt.Println
- [ ] Context passed through all layers
- [ ] Errors wrapped with fmt.Errorf("...: %w", err)
- [ ] OpenTelemetry tracing present
- [ ] Unit tests cover 80%+

---

## Prohibited Patterns

### ❌ NEVER USE

| Prohibited | Replacement | Reason |
|-----------|-------------|--------|
| **Echo v4** | Echo v5.0.1+ | v5 uses concrete struct `*echo.Context`, v4 uses interface (breaking change) |
| **Chi router** | Echo v5.0.1+ | Eduanima standard framework for consistency |
| **Gin framework** | Echo v5.0.1+ | Eduanima standard framework for consistency |
| **golang-migrate** | Atlas v1.0.0+ | No monitoring, no schema statistics, manual versioning |
| **lib/pq** | pgx/v5.8.0+ | No longer maintained, no context support, no prepared statement pool |
| **square/go-jose** | go-jose/v4 | Repository moved to go-jose/go-jose, v4 has critical security fixes |
| **fmt.Println** | slog | No structured logging, no log levels, no context propagation |
| **log.Printf** | slog | No structured fields, not JSON-serializable |
| **math/rand (old)** | math/rand/v2 | Not thread-safe, requires manual seeding with time |
| **gen_random_uuid()** | uuidv7() | Not time-sortable, no monotonic ordering property |
| **uuid_generate_v4()** | uuidv7() | Requires pgcrypto extension, not time-based |
| **GORM** | sqlc + pgx | No compile-time safety, N+1 query risk, reflection overhead |
| **Raw SQL strings** | sqlc | SQL injection risk, no type safety, no auto-completion |
| **Doppler CLI** | Secret Manager (prod) / .env (dev) | Cost overhead, vendor lock-in, unnecessary for dev env |
| **Hardcoded secrets** | Secret Manager (prod) / .env (dev) | Critical security violation |
| **SERIAL/BIGSERIAL** | UUID v7 | Not distributed-safe, predictable IDs (security risk) |
| **IVFFlat index** | HNSW | Slower queries, no iterative scan support |
| **Qdrant** | Elasticsearch 9.2.4+ | Unified search platform, lower ops cost |

### Automated Detection (CI/CD)

```bash
#!/bin/bash
# .github/workflows/lint-prohibited.sh

echo "Checking for prohibited patterns..."

ERRORS=0

# Check for prohibited imports
if grep -r "github.com/labstack/echo/v4" .; then
    echo "❌ ERROR: Echo v4 detected. Use v5."
    ERRORS=$((ERRORS+1))
fi

if grep -r "github.com/go-chi/chi" .; then
    echo "❌ ERROR: Chi router detected. Use Echo v5."
    ERRORS=$((ERRORS+1))
fi

if grep -r "github.com/gin-gonic/gin" .; then
    echo "❌ ERROR: Gin framework detected. Use Echo v5."
    ERRORS=$((ERRORS+1))
fi

if grep -r "golang-migrate" .; then
    echo "❌ ERROR: golang-migrate detected. Use Atlas."
    ERRORS=$((ERRORS+1))
fi

if grep -r "github.com/lib/pq" .; then
    echo "❌ ERROR: lib/pq detected. Use pgx/v5."
    ERRORS=$((ERRORS+1))
fi

if grep -r "square/go-jose" .; then
    echo "❌ ERROR: square/go-jose detected. Use go-jose/v4."
    ERRORS=$((ERRORS+1))
fi

if grep -r "doppler run\|doppler secrets" .; then
    echo "❌ ERROR: Doppler CLI detected. Use Secret Manager (prod) or .env (dev)."
    ERRORS=$((ERRORS+1))
fi

# Check for prohibited code patterns
if grep -r "fmt\.Println\|log\.Printf" --include="*.go" .; then
    echo "❌ ERROR: Unstructured logging detected. Use slog."
    ERRORS=$((ERRORS+1))
fi

if grep -r "gen_random_uuid()\|uuid_generate_v4()" --include="*.sql" --include="*.hcl" .; then
    echo "❌ ERROR: Old UUID functions detected. Use uuidv7()."
    ERRORS=$((ERRORS+1))
fi

if [ $ERRORS -gt 0 ]; then
    echo "❌ Found $ERRORS prohibited pattern(s). Fix before merging."
    exit 1
else
    echo "✅ No prohibited patterns detected."
fi
```

Add to `.github/workflows/ci.yml`:
```yaml
- name: Check for prohibited patterns
  run: bash .github/workflows/lint-prohibited.sh
```

---

## Emergency Contacts &amp; References

### Primary Documentation

- **Database Schema**: Q_DATABASE_REFACTPR.md v7.0.2 (2026-02-05)
- **OpenAPI Spec**: api/openapi.yaml (single source of truth)
- **Migration History**: migrations/atlas.sum
- **Atlas Documentation**: https://atlasgo.io/docs
- **pgvector Changelog**: https://github.com/pgvector/pgvector/releases

### Version History

| Document Version | Date | Key Changes |
|-----------------|------|-------------|
| v2026.02.2 | 2026-02-06 | Secret management migration (Doppler → Secret Manager/env), Atlas v1.0.0, pgvector 0.8.1, hallucination prevention |
| v2026.02.1 | 2026-02-05 | Initial comprehensive standards |

### Breaking Changes

**v2026.02.2:**
- **Secret Management**: Doppler PROHIBITED. Use Secret Manager (prod) or .env (dev)
- **Atlas**: Minimum version v1.0.0 (0.x no longer supported)
- **pgvector**: HNSW iterative scan requires 0.8.1+
- **Web Frameworks**: Chi and Gin PROHIBITED (Echo v5 only)

### Migration Guides

**Doppler → Secret Manager:**
```bash
# 1. Export existing Doppler secrets
doppler secrets download --format env > doppler_backup.env

# 2. Create GCP secrets
while IFS='=' read -r key value; do
  echo "$value" | gcloud secrets create "$key" --data-file=-
done < doppler_backup.env

# 3. Update application code (see "Secret Management" section)

# 4. Test in staging environment

# 5. Remove Doppler CLI from Dockerfile and CI/CD
```

**Atlas 0.x → v1.0.0:**
```bash
# 1. Backup current migrations
cp -r migrations migrations_backup

# 2. Upgrade Atlas
go install ariga.io/atlas/cmd/atlas@v1.0.0

# 3. Verify migrations
atlas migrate validate --env dev

# 4. Enable monitoring (add to atlas.hcl)
monitor {
  query_performance { slow_threshold = "100ms" }
  index_usage { min_usage_percentage = 50 }
}

# 5. Generate first health report
atlas schema inspect --url "env://prod" --format "{{ json .Stats }}" > stats.json
```

---

## Document Version

**Document Version**: v2026.02.2  
**Last Updated**: 2026-02-06  
**Data Model**: Q_DATABASE_REFACTPR.md v7.0.2  
**Go Version**: 1.25.7  
**Echo Version**: v5.0.1  
**PostgreSQL Version**: 18.1  
**pgvector Version**: 0.8.1  
**Atlas Version**: v1.0.0  

---

## 2. Q_DATABASE_REFACTPR.md Updates (Incremental Changes)

The following sections should be added or updated to the existing v7.0.0 document:

### 15.11 Go Integration Patterns (New Section)

```markdown
### 15.11 Go Integration Patterns

#### **15.11.1 sqlc Configuration**

**sqlc.yaml (Standard for All Services):**

```yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "./internal/repository/query"
    schema: "./schema"  # Directly references Atlas HCL files
    gen:
      go:
        package: "repository"
        out: "./internal/repository"
        sql_package: "pgx/v5"
        emit_json_tags: true
        emit_interface: true
        emit_empty_slices: true
        emit_enum_valid_method: true
        emit_all_enum_values: true
        overrides:
          - db_type: "uuid"
            go_type: "github.com/google/uuid.UUID"
          - db_type: "vector"
            go_type: "github.com/pgvector/pgvector-go.Vector"
          - db_type: "timestamptz"
            go_type: "time.Time"
```

**Benefits:**
- Atlas HCL and sqlc stay synchronized (no duplicate management)
- ENUM types automatically converted to Go constants
- UUID and vector types are type-safe

---

#### **15.11.2 ENUM Type Go Integration**

**Atlas Definition:**
```hcl
enum "user_role_enum" {
  schema = schema.public
  values = ["free", "system", "admin", "premium"]
}
```

**sqlc Generated Code:**
```go
type UserRoleEnum string

const (
    UserRoleEnumFree    UserRoleEnum = "free"
    UserRoleEnumSystem  UserRoleEnum = "system"
    UserRoleEnumAdmin   UserRoleEnum = "admin"
    UserRoleEnumPremium UserRoleEnum = "premium"
)

func (e UserRoleEnum) Valid() bool {
    switch e {
    case UserRoleEnumFree, UserRoleEnumSystem, UserRoleEnumAdmin, UserRoleEnumPremium:
        return true
    }
    return false
}

// AllUserRoleEnumValues returns all possible values
func AllUserRoleEnumValues() []UserRoleEnum {
    return []UserRoleEnum{
        UserRoleEnumFree,
        UserRoleEnumSystem,
        UserRoleEnumAdmin,
        UserRoleEnumPremium,
    }
}
```

**Usage Example:**
```go
// Validation
func validateUserRole(role string) error {
    r := UserRoleEnum(role)
    if !r.Valid() {
        return fmt.Errorf("invalid role: %s", role)
    }
    return nil
}

// OpenAPI integration
type CreateUserRequest struct {
    Role UserRoleEnum `json:"role" validate:"required"`
}
```

---

#### **15.11.3 UUID v7 Integration**

**Atlas Definition:**
```hcl
column "id" {
  type = uuid
  default = sql("uuidv7()")
}
```

**sqlc Generated:**
```go
type Exam struct {
    ID        uuid.UUID     `json:"id"`
    PublicID  string        `json:"public_id"`
    CreatedAt time.Time     `json:"created_at"`
}
```

**Usage Example:**
```go
import "github.com/google/uuid"

// Create new record (ID generated by PostgreSQL)
exam := &Exam{
    PublicID: gonanoid.New(8),  // NanoID generated by application
    Title:    "Test Exam",
}
repo.Create(ctx, exam)

// Search by ID
exam, err := repo.GetByID(ctx, uuid.MustParse("550e8400-e29b-41d4-a716-446655440000"))
```

---

#### **15.11.4 Vector Type Integration**

**Atlas Definition:**
```hcl
column "embedding" {
  type = sql("vector(1536)")
  null = true
}
```

**sqlc Generated:**
```go
import "github.com/pgvector/pgvector-go"

type Exam struct {
    Embedding pgvector.Vector `json:"embedding,omitempty"`
}
```

**Usage Example:**
```go
// Generate embedding (Gemini API)
embedding := generateEmbedding(examText)  // []float32

// Save
exam.Embedding = pgvector.NewVector(embedding)
repo.Update(ctx, exam)

// Vector search
results, err := repo.SearchBySimilarity(ctx, queryEmbedding, 20)
```

**Query Definition (query.sql):**
```sql
-- name: SearchBySimilarity :many
SELECT 
    id,
    public_id,
    title,
    1 - (embedding <=> $1::vector) AS similarity
FROM exams
WHERE 
    status = 'active'
    AND embedding IS NOT NULL
ORDER BY embedding <=> $1::vector
LIMIT $2;
```

**Generated Go Code:**
```go
func (q *Queries) SearchBySimilarity(ctx context.Context, embedding pgvector.Vector, limit int32) ([]SearchResult, error) {
    rows, err := q.db.Query(ctx, searchBySimilarity, embedding, limit)
    // ...
}
```

---

#### **15.11.5 Composite Primary Key Handling**

**⚠️ ONLY 5 Tables Use Composite Primary Keys**

Eduanima uses composite primary keys for exactly **5 tables** where external references are critical:

1. **teachers** - Educator profiles
2. **exams** - Past exam papers
3. **questions** - Individual exam questions
4. **sub_questions** - Multi-part questions
5. **keywords** - Search tags

**ALL OTHER TABLES use single UUID primary key.**

---

#### **Atlas HCL Definition (Composite Key Tables)**

```hcl
table "exams" {
  schema = schema.public
  
  column "id" {
    type = uuid
    default = sql("uuidv7()")
  }
  
  column "public_id" {
    type = varchar(8)
    null = false
  }
  
  // CRITICAL: Composite primary key
  primary_key {
    columns = [column.id, column.public_id]
  }
  
  // MUST have unique index on public_id alone for API lookups
  index "idx_exams_public_id" {
    unique = true
    columns = [column.public_id]
  }
  
  column "title" {
    type = varchar(255)
    null = false
  }
  
  column "created_at" {
    type = timestamptz
    default = sql("CURRENT_TIMESTAMP")
  }
}
```

---

#### **Atlas HCL Definition (Standard Tables)**

```hcl
table "users" {
  schema = schema.public
  
  column "id" {
    type = uuid
    default = sql("uuidv7()")
  }
  
  column "public_id" {
    type = varchar(8)
    null = false
  }
  
  // SINGLE primary key (NOT composite)
  primary_key {
    columns = [column.id]
  }
  
  // Unique index for public_id
  index "idx_users_public_id" {
    unique = true
    columns = [column.public_id]
  }
  
  column "email" {
    type = varchar(255)
    null = false
  }
  
  column "created_at" {
    type = timestamptz
    default = sql("CURRENT_TIMESTAMP")
  }
}
```

---

#### **Foreign Key Reference Rules**

**✅ ALWAYS Reference UUID Column Only:**

```sql
-- CORRECT: Reference id column (UUID)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  exam_id UUID NOT NULL,
  CONSTRAINT fk_questions_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- CORRECT: Even for composite PK tables, FK uses only UUID
CREATE TABLE question_images (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  question_id UUID NOT NULL,
  CONSTRAINT fk_images_question FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

**❌ NEVER Reference Composite Key:**

```sql
-- WRONG: Do NOT reference both columns
CREATE TABLE questions (
  exam_id UUID NOT NULL,
  exam_public_id VARCHAR(8) NOT NULL,
  CONSTRAINT fk_questions_exam FOREIGN KEY (exam_id, exam_public_id) 
    REFERENCES exams(id, public_id)  -- ❌ PROHIBITED
);
```

---

#### **sqlc Query Patterns**

```sql
-- query.sql

-- Get by UUID (internal operations)
-- name: GetExamByID :one
SELECT id, public_id, title, created_at
FROM exams
WHERE id = $1;

-- Get by NanoID (API endpoints)
-- name: GetExamByPublicID :one
SELECT id, public_id, title, created_at
FROM exams
WHERE public_id = $1;

-- Join using UUID foreign key
-- name: GetQuestionsForExam :many
SELECT q.id, q.public_id, q.question_text
FROM questions q
WHERE q.exam_id = $1  -- UUID foreign key
ORDER BY q.created_at;
```

---

#### **Go Usage Patterns**

```go
// Internal service calls - use UUID
func (s *examService) GetExam(ctx context.Context, examID uuid.UUID) (*Exam, error) {
    return s.repo.GetExamByID(ctx, examID)
}

// API handlers - use NanoID
func (h *ExamHandler) GetExam(c *echo.Context) error {
    publicID := c.Param("id")  // e.g., "abc12345"
    
    exam, err := h.service.GetExamByPublicID(ctx, publicID)
    if err != nil {
        return handleError(c, err)
    }
    
    return c.JSON(http.StatusOK, exam)
}

// Foreign key relationships - always use UUID
func (s *examService) CreateQuestion(ctx context.Context, req CreateQuestionRequest) error {
    // Lookup exam by public_id
    exam, _ := s.repo.GetExamByPublicID(ctx, req.ExamPublicID)
    
    // Use UUID for foreign key
    question := &Question{
        ID:       uuid.New(),
        ExamID:   exam.ID,  // ✅ UUID foreign key
        Question: req.Text,
    }
    
    return s.repo.CreateQuestion(ctx, question)
}
```

---

#### **Decision Matrix**

| Scenario | Use UUID | Use NanoID | Use Both (Composite PK) |
|----------|----------|------------|------------------------|
| Database foreign keys | ✅ ALWAYS | ❌ NEVER | ❌ NEVER |
| Internal service calls | ✅ Preferred | ⚠️ Possible | ❌ NEVER |
| API endpoints (GET /exams/:id) | ⚠️ Possible | ✅ Preferred | ❌ NEVER |
| URL sharing | ❌ NO | ✅ YES | ❌ NEVER |
| Primary key definition | ✅ Standard tables | ❌ NO | ✅ 5 special tables only |

---

#### **Verification Checklist**

Before deploying schema changes:

- [ ] ✅ Composite PK only on: teachers, exams, questions, sub_questions, keywords
- [ ] ✅ All other tables use single UUID primary key
- [ ] ✅ Every table has unique index on `public_id`
- [ ] ✅ All foreign keys reference `id` column (UUID) only
- [ ] ✅ No foreign keys reference `public_id` or composite keys
- [ ] ✅ API routes use NanoID (public_id) in path parameters
- [ ] ✅ Database queries use UUID for JOINs and foreign keys

---

#### **15.11.6 Transaction Integration**

**sqlc automatically generates transaction-ready code:**

```go
// service/exam_service.go
func (s *examService) CreateExamWithQuestions(
    ctx context.Context,
    examReq CreateExamRequest,
    questions []CreateQuestionRequest,
) (*Exam, error) {
    tx, err := s.pool.Begin(ctx)
    if err != nil {
        return nil, fmt.Errorf("begin tx: %w", err)
    }
    defer tx.Rollback(ctx)
    
    // WithTx creates transaction-scoped queries
    qtx := s.queries.WithTx(tx)
    
    // All operations use same transaction
    exam, err := qtx.CreateExam(ctx, repository.CreateExamParams{
        ID:       uuid.New(),
        PublicID: gonanoid.New(8),
        Title:    examReq.Title,
    })
    if err != nil {
        return nil, fmt.Errorf("create exam: %w", err)
    }
    
    for _, q := range questions {
        _, err := qtx.CreateQuestion(ctx, repository.CreateQuestionParams{
            ID:       uuid.New(),
            ExamID:   exam.ID,
            QuestionText: q.Text,
        })
        if err != nil {
            return nil, fmt.Errorf("create question: %w", err)
        }
    }
    
    if err := tx.Commit(ctx); err != nil {
        return nil, fmt.Errorf("commit tx: %w", err)
    }
    
    return exam, nil
}
```

---

#### **15.11.7 Connection Pool Integration**

**Standard Initialization Pattern:**

```go
// cmd/server/main.go
func initDB(ctx context.Context) *pgxpool.Pool {
    dbURL := os.Getenv("DATABASE_URL")
    
    config, err := pgxpool.ParseConfig(dbURL)
    if err != nil {
        log.Fatal("parse db config:", err)
    }
    
    // Connection pool tuning
    config.MaxConns = 25
    config.MinConns = 5
    config.MaxConnLifetime = 1 * time.Hour
    config.MaxConnIdleTime = 15 * time.Minute
    config.HealthCheckPeriod = 1 * time.Minute
    config.ConnConfig.ConnectTimeout = 5 * time.Second
    
    // Statement timeout
    config.ConnConfig.RuntimeParams = map[string]string{
        "statement_timeout": "30000",  // 30 seconds
    }
    
    // OpenTelemetry tracing
    config.ConnConfig.Tracer = otelpgx.NewTracer()
    
    pool, err := pgxpool.NewWithConfig(ctx, config)
    if err != nil {
        log.Fatal("create pool:", err)
    }
    
    // Verify connection
    if err := pool.Ping(ctx); err != nil {
        log.Fatal("ping db:", err)
    }
    
    return pool
}

func main() {
    ctx := context.Background()
    pool := initDB(ctx)
    defer pool.Close()
    
    // Initialize sqlc queries
    queries := repository.New(pool)
    
    // Use in service
    examService := service.NewExamService(queries)
}
```

---

#### **15.11.8 Iterator Pattern (Go 1.25.6)**

**Streaming Large Datasets:**

```go
import "iter"

// repository/exam_repository.go
func (r *ExamRepository) StreamActiveExams(ctx context.Context) iter.Seq2[*Exam, error] {
    return func(yield func(*Exam, error) bool) {
        rows, err := r.pool.Query(ctx, `
            SELECT id, public_id, title, created_at
            FROM exams
            WHERE status = 'active'
            ORDER BY created_at DESC
        `)
        if err != nil {
            yield(nil, err)
            return
        }
        defer rows.Close()
        
        for rows.Next() {
            var exam Exam
            if err := rows.Scan(&exam.ID, &exam.PublicID, &exam.Title, &exam.CreatedAt); err != nil {
                yield(nil, err)
                return
            }
            if !yield(&exam, nil) {
                return  // Consumer stopped iteration
            }
        }
        
        if err := rows.Err(); err != nil {
            yield(nil, err)
        }
    }
}

// service/exam_service.go - AI embedding generation
func (s *examService) GenerateEmbeddingsForAll(ctx context.Context) error {
    count := 0
    for exam, err := range s.repo.StreamActiveExams(ctx) {
        if err != nil {
            return err
        }
        
        // Process one at a time (memory efficient)
        embedding := s.aiClient.GenerateEmbedding(exam.Title)
        exam.Embedding = pgvector.NewVector(embedding)
        s.repo.Update(ctx, exam)
        
        count++
        if count%100 == 0 {
            slog.Info("processed exams", slog.Int("count", count))
        }
    }
    return nil
}
```

**Benefits:**
- Constant memory usage (safe even with 100K records)
- Early termination support
- Native Go 1.25.6 syntax
```

---

### **15.12 CodingAgent Collaboration Patterns (New Section)**

```markdown
### 15.12 CodingAgent Collaboration Patterns

#### **15.12.1 Schema Generation Prompt**

**Standard Prompt Template:**

```
Create Atlas HCL schema for "[table_name]" table based on Q_DATABASE_REFACTPR.md v7.0.0.

Requirements:
1. Primary key: UUID v7 (use uuidv7())
2. Public ID: VARCHAR(8) NanoID with unique index
3. Timestamps: created_at, updated_at (TIMESTAMPTZ)
4. Foreign keys: [specify if physical or logical]
5. Indexes: [list required indexes]
6. ENUM types: [list if applicable]
7. Special features: [pgvector, full-text search, etc.]

Follow naming conventions:
- Table: plural, snake_case
- Columns: snake_case
- Indexes: idx_{table}_{column}
- Foreign keys: fk_{table}_{ref_table}

Example output format:
```hcl
table "table_name" {
  schema = schema.public
  // ... columns
  primary_key { ... }
  // ... indexes
}
```
```

**Example:**

```
Create Atlas HCL schema for "exam_comments" table (Phase 2 - SNS拡張 - 2026 Q4-2027 Q1):
- id: UUID v7 primary key
- exam_id: UUID (logical FK to exams.id, no constraint)
- user_id: UUID (logical FK to users.id, no constraint)
- parent_comment_id: UUID nullable (self-reference, physical FK)
- comment_text: TEXT not null
- is_edited, is_deleted: BOOLEAN default false
- created_at, updated_at: TIMESTAMPTZ

Indexes:
- idx_exam_comments_exam_id on (exam_id, created_at DESC)
- idx_exam_comments_user_id on user_id
- idx_exam_comments_parent_id on parent_comment_id

Add table comment: "試験コメント機能 (Phase 2以降)"
```

---

#### **15.12.2 Migration Verification Prompt**

```
Review the following Atlas migration for production safety:

[paste migration SQL]

Check for:
1. Destructive operations (DROP TABLE, DROP COLUMN, TRUNCATE)
2. Long-running operations (ADD COLUMN NOT NULL without default on large table)
3. Lock contention risks (REINDEX, ALTER TYPE)
4. Data migration issues (type changes without transformation)
5. Missing indexes on foreign keys
6. ENUM value additions (should use ADD VALUE IF NOT EXISTS)

Provide:
- Risk level: LOW / MEDIUM / HIGH
- Estimated execution time
- Lock duration estimate
- Recommended maintenance window (if needed)
- Rollback strategy
```

---

#### **15.12.3 sqlc Query Generation Prompt**

```
Generate sqlc query for "[operation]" on [table]:

Requirements:
- Query name: [operation][Table] (e.g., GetExamByPublicID)
- Return type: :one / :many / :exec
- Parameters: [list parameters]
- Filters: [list WHERE conditions]
- Ordering: [specify ORDER BY]
- Include indexes hint if complex query

Example:
-- name: ListExamsBySubject :many
SELECT id, public_id, title, created_at
FROM exams
WHERE subject_id = $1 AND status = 'active'
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

---

#### **15.12.4 Error Detection Patterns**

**Anti-patterns that CodingAgent should automatically detect:**

1. **Incorrect ENUM Value Addition:**
```sql
❌ BAD:
CREATE TYPE user_role_enum AS ENUM ('free', 'premium');  -- Forgot existing values

✅ GOOD:
ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'premium';
```

2. **Foreign Key Dependency Oversight:**
```sql
❌ BAD:
DROP TABLE exams;  -- questions table references this

✅ GOOD:
DROP TABLE questions;  -- Drop dependent table first
DROP TABLE exams;
```

3. **Dangerous NULL Constraint Addition:**
```sql
❌ BAD:
ALTER TABLE exams ALTER COLUMN description SET NOT NULL;  -- Errors on existing NULLs

✅ GOOD:
UPDATE exams SET description = '' WHERE description IS NULL;
ALTER TABLE exams ALTER COLUMN description SET NOT NULL;
```

4. **Foreign Key Without Index:**
```sql
❌ BAD:
ALTER TABLE questions ADD COLUMN exam_id UUID NOT NULL;
-- No index → slow JOINs

✅ GOOD:
ALTER TABLE questions ADD COLUMN exam_id UUID NOT NULL;
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
```

---

#### **15.12.5 Code Review Checklist**

**Verification items for CodingAgent-generated code:**

**Atlas HCL:**
- [ ] All columns have explicit null constraints
- [ ] Default values are properly configured
- [ ] Foreign keys have on_delete specified (for physical FKs)
- [ ] Unique constraints have indexes
- [ ] Search columns have indexes
- [ ] Vector columns have HNSW indexes
- [ ] ENUM types are correctly referenced

**sqlc Query:**
- [ ] Query name follows naming convention ([Verb][Table])
- [ ] Return type is appropriate (:one, :many, :exec)
- [ ] WHERE clause uses indexes
- [ ] LIMIT/OFFSET are parameterized
- [ ] JOINs use foreign keys

**Go Code:**
- [ ] context.Context is the first argument in all functions
- [ ] Errors are wrapped with fmt.Errorf("...: %w", err)
- [ ] slog is used (no fmt.Println)
- [ ] defer tx.Rollback() exists when using transactions
- [ ] UUID generation uses uuidv7() (PostgreSQL) or uuid.New() (Go)
- [ ] NanoID generation uses gonanoid.New(8)

---

#### **15.12.6 Debug Assistance Prompt**

**Query to CodingAgent when errors occur:**

```
Debug the following PostgreSQL error:

Error message:
[paste error]

Context:
- Table: [table_name]
- Operation: [INSERT/UPDATE/DELETE/SELECT]
- Atlas schema: [paste relevant HCL]
- Query: [paste SQL if applicable]

Provide:
1. Root cause analysis
2. Suggested fix (Atlas schema or SQL)
3. Prevention strategy
4. Related documentation
```

**Example:**

```
Debug the following PostgreSQL error:

Error message:
ERROR: column "embedding" is of type vector but expression is of type text

Context:
- Table: exams
- Operation: UPDATE
- Atlas schema:
  column "embedding" {
    type = sql("vector(1536)")
  }
- Go code:
  exam.Embedding = string(embeddingJSON)

Provide fix.
```

**CodingAgent Response Example:**

```
Root Cause:
You're assigning a JSON string to a pgvector.Vector field.

Fix:
```go
// ❌ WRONG
exam.Embedding = string(embeddingJSON)

// ✅ CORRECT
var embedding []float32
json.Unmarshal(embeddingJSON, &embedding)
exam.Embedding = pgvector.NewVector(embedding)
```

Prevention:
- Always use pgvector.NewVector() for vector columns
- Validate embedding dimension (must be 1536)
- Add type assertion in tests
```

---

### Document Version History

**v7.0.1 (2026-02-05)**
- Added section 15.11: Go integration patterns
- Added section 15.12: CodingAgent collaboration patterns
- Updated migration documentation to reflect Atlas adoption
- Completely removed golang-migrate references
- Detailed sqlc + Atlas integration patterns
