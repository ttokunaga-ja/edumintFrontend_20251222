# **.clinerules と Q_DATABASE_REFACTPR.md の更新**

---

## **1. .clinerules の完全版**

```markdown
# EduMint Development Standards v2026.02.1

## Project Context

EduMint is an educational content sharing platform built with:
- **Microservices Architecture**: 11 services (Auth, Content, Search, AI Worker, etc.)
- **Development Team**: 1 person + CodingAgent collaboration
- **Developer Profile**: Junior engineer learning alongside AI assistance
- **Priority**: Production error prevention > Feature velocity

---

## Core Technology Stack (STRICT VERSIONS)

| Technology | Version | Status | Notes |
|-----------|---------|--------|-------|
| **Go** | 1.25.6 | MANDATORY | Use iterators, slog, math/rand/v2 |
| **Echo** | v5.0.1 | MANDATORY | Concrete struct Context (v4 PROHIBITED) |
| **PostgreSQL** | 18.1 | MANDATORY | Native uuidv7(), AIO, B-tree skip scan |
| **pgvector** | 0.8+ | MANDATORY | HNSW index, 1536-dim embeddings |
| **Atlas** | 0.28.1 | MANDATORY | Declarative migrations (golang-migrate PROHIBITED) |
| **Redis** | 7.4 | MANDATORY | Cache & session store |
| **Kafka** | 4.1.0 | MANDATORY | Event streaming (KRaft mode) |
| **Elasticsearch** | 9.2.4 | MANDATORY | Unified search (Qdrant replaced) |
| **Debezium** | 3.0.1 | MANDATORY | PostgreSQL CDC |

### Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **go-jose/v4** | v4.0.5 | JWT/JWE/JWS (square/go-jose PROHIBITED) |
| **franz-go** | v1.20.6 | Kafka client (KIP-848 support) |
| **sqlc** | v1.30.0 | Type-safe SQL (pgx/v5 engine) |
| **oapi-codegen/v2** | v2.5.0 | OpenAPI 3.1 codegen |
| **testcontainers-go** | v0.40.1 | Integration testing |
| **pgx/v5** | v5.7.2 | PostgreSQL driver (lib/pq PROHIBITED) |
| **golangci-lint** | v2.8.0 | Modern linting |
| **pgvector-go** | v0.3.0 | Vector operations |
| **google/uuid** | v1.6.0 | UUID parsing (generation via PostgreSQL) |

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
| **Atlas** | v0.28.1 | Database migrations |
| **Doppler** | Latest | Secret management |
| **Spectral** | v6.14.0 | OpenAPI linter |
| **Docker Compose** | v2.31.0 | Local development |
| **k6** | Latest | Load testing |

---

## Go 1.25.6 Standards

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
edumintContent/
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

### 3. Daily Workflow

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
| `content.lifecycle` | edumintContent | edumintSearch, edumintGateway | 7 days |
| `content.jobs` | edumintFile | edumintGateway, edumintAiWorker | 3 days |
| `ai.results` | edumintAiWorker | edumintContent, edumintGateway | 3 days |
| `content.feedback` | edumintSocial | edumintContent | 30 days |
| `monetization.transactions` | edumintMonetizeWallet | edumintRevenue | 365 days |

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
          go-version: '1.25.6'
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

### 1. Secret Management (Doppler)

```bash
# Development
doppler run -- go run cmd/server/main.go

# Production
doppler secrets download --format=env > /secrets/.env
```

```go
// Never commit secrets
dbURL := os.Getenv("DATABASE_URL")
jwtSecret := os.Getenv("JWT_SECRET")
```

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
e.Use(otelecho.Middleware("edumintContent"))

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
        Name: "edumint_db_query_duration_seconds",
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
- Follow EduMint conventions
```

---

### 2. Atlas Schema Generation

```
Create Atlas HCL schema for "exam_comments" table:
- id: UUID v7
- exam_id: UUID (logical FK)
- user_id: UUID (logical FK)
- comment_text: TEXT not null
- is_edited, is_deleted: BOOLEAN
- created_at, updated_at: TIMESTAMPTZ
- Indexes on exam_id, user_id
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

1. **Echo v4** → Use Echo v5.0.1
2. **golang-migrate** → Use Atlas
3. **lib/pq** → Use pgx/v5
4. **square/go-jose** → Use go-jose/v4
5. **fmt.Println** → Use slog
6. **math/rand (old)** → Use math/rand/v2
7. **gen_random_uuid()** → Use uuidv7()
8. **GORM** → Use sqlc + pgx
9. **Manual SQL strings** → Use sqlc
10. **Hardcoded secrets** → Use Doppler

---

## Emergency Contacts

- **Database Schema**: Refer to Q_DATABASE_REFACTPR.md v7.0.0
- **OpenAPI Spec**: api/openapi.yaml (single source of truth)
- **Migration History**: migrations/atlas.sum

---

## Version

**Document Version**: v2026.02.1  
**Last Updated**: 2026-02-05  
**Data Model**: Q_DATABASE_REFACTPR.md v7.0.0  
**Go Version**: 1.25.6  
**Echo Version**: v5.0.1  
**PostgreSQL Version**: 18.1  
**Atlas Version**: 0.28.1
```

---

## **2. Q_DATABASE_REFACTPR.md の更新（差分のみ）**

既存の v7.0.0 に以下のセクションを追加・更新します：

### **15.11 Go統合パターン（新規追加）**

```markdown
### 15.11 Go統合パターン

#### **15.11.1 sqlc設定**

**sqlc.yaml (全サービス標準):**

```yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "./internal/repository/query"
    schema: "./schema"  # Atlas HCLファイルを直接参照
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

**利点:**
- Atlas HCLとsqlcが同期（二重管理不要）
- ENUM型がGo constに自動変換
- UUID、vector型が型安全に

---

#### **15.11.2 ENUM型のGo統合**

**Atlas定義:**
```hcl
enum "user_role_enum" {
  schema = schema.public
  values = ["free", "system", "admin", "premium"]
}
```

**sqlc生成コード:**
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

**使用例:**
```go
// バリデーション
func validateUserRole(role string) error {
    r := UserRoleEnum(role)
    if !r.Valid() {
        return fmt.Errorf("invalid role: %s", role)
    }
    return nil
}

// OpenAPI統合
type CreateUserRequest struct {
    Role UserRoleEnum `json:"role" validate:"required"`
}
```

---

#### **15.11.3 UUID v7統合**

**Atlas定義:**
```hcl
column "id" {
  type = uuid
  default = sql("uuidv7()")
}
```

**sqlc生成:**
```go
type Exam struct {
    ID        uuid.UUID     `json:"id"`
    PublicID  string        `json:"public_id"`
    CreatedAt time.Time     `json:"created_at"`
}
```

**使用例:**
```go
import "github.com/google/uuid"

// 新規作成（IDはPostgreSQLが生成）
exam := &Exam{
    PublicID: gonanoid.New(8),  // NanoIDはアプリ生成
    Title:    "Test Exam",
}
repo.Create(ctx, exam)

// IDでの検索
exam, err := repo.GetByID(ctx, uuid.MustParse("550e8400-e29b-41d4-a716-446655440000"))
```

---

#### **15.11.4 ベクトル型統合**

**Atlas定義:**
```hcl
column "embedding" {
  type = sql("vector(1536)")
  null = true
}
```

**sqlc生成:**
```go
import "github.com/pgvector/pgvector-go"

type Exam struct {
    Embedding pgvector.Vector `json:"embedding,omitempty"`
}
```

**使用例:**
```go
// 埋め込み生成（Gemini API）
embedding := generateEmbedding(examText)  // []float32

// 保存
exam.Embedding = pgvector.NewVector(embedding)
repo.Update(ctx, exam)

// ベクトル検索
results, err := repo.SearchBySimilarity(ctx, queryEmbedding, 20)
```

**クエリ定義 (query.sql):**
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

**生成されるGoコード:**
```go
func (q *Queries) SearchBySimilarity(ctx context.Context, embedding pgvector.Vector, limit int32) ([]SearchResult, error) {
    rows, err := q.db.Query(ctx, searchBySimilarity, embedding, limit)
    // ...
}
```

---

#### **15.11.5 複合主キーの扱い**

**Atlas定義 (exams):**
```hcl
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
}
```

**sqlc生成:**
```go
type Exam struct {
    ID       uuid.UUID `db:"id" json:"id"`
    PublicID string    `db:"public_id" json:"public_id"`
    // ...
}

// GetByID uses only UUID (primary component)
func (q *Queries) GetExamByID(ctx context.Context, id uuid.UUID) (Exam, error) {
    // ...
}

// GetByPublicID uses unique index
func (q *Queries) GetExamByPublicID(ctx context.Context, publicID string) (Exam, error) {
    // ...
}
```

**使用パターン:**
```go
// 内部参照（UUID）
exam, _ := repo.GetByID(ctx, examID)

// 外部参照（NanoID）- API経由
exam, _ := repo.GetByPublicID(ctx, "abc12345")
```

---

#### **15.11.6 トランザクション統合**

**sqlcは自動的にトランザクション対応コードを生成:**

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

#### **15.11.7 接続プール統合**

**標準初期化パターン:**

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

#### **15.11.8 Iteratorパターン（Go 1.25.6）**

**大量データのストリーミング処理:**

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

// service/exam_service.go - AI埋め込み生成
func (s *examService) GenerateEmbeddingsForAll(ctx context.Context) error {
    count := 0
    for exam, err := range s.repo.StreamActiveExams(ctx) {
        if err != nil {
            return err
        }
        
        // 1件ずつ処理（メモリ効率的）
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

**利点:**
- 定数メモリ使用（10万件でも安全）
- 早期終了サポート
- Go 1.25.6ネイティブ構文
```

---

### **15.12 CodingAgent協調パターン（新規追加）**

```markdown
### 15.12 CodingAgent協調パターン

#### **15.12.1 スキーマ生成プロンプト**

**標準プロンプトテンプレート:**

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

**具体例:**

```
Create Atlas HCL schema for "exam_comments" table:
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
```

---

#### **15.12.2 マイグレーション検証プロンプト**

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

#### **15.12.3 sqlcクエリ生成プロンプト**

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

#### **15.12.4 エラー検出パターン**

**CodingAgentが自動検知すべきアンチパターン:**

1. **ENUM値の誤った追加:**
```sql
❌ BAD:
CREATE TYPE user_role_enum AS ENUM ('free', 'premium');  -- 既存値を忘れた

✅ GOOD:
ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'premium';
```

2. **外部キー依存の見落とし:**
```sql
❌ BAD:
DROP TABLE exams;  -- questionsテーブルが参照している

✅ GOOD:
DROP TABLE questions;  -- 先に依存テーブルを削除
DROP TABLE exams;
```

3. **NULL制約の危険な追加:**
```sql
❌ BAD:
ALTER TABLE exams ALTER COLUMN description SET NOT NULL;  -- 既存NULLでエラー

✅ GOOD:
UPDATE exams SET description = '' WHERE description IS NULL;
ALTER TABLE exams ALTER COLUMN description SET NOT NULL;
```

4. **インデックスなしの外部キー:**
```sql
❌ BAD:
ALTER TABLE questions ADD COLUMN exam_id UUID NOT NULL;
-- インデックスなし → JOINが遅い

✅ GOOD:
ALTER TABLE questions ADD COLUMN exam_id UUID NOT NULL;
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
```

---

#### **15.12.5 コードレビューチェックリスト**

**CodingAgentが生成したコードの検証項目:**

**Atlas HCL:**
- [ ] 全カラムにnull制約が明示されている
- [ ] default値が適切に設定されている
- [ ] 外部キーのon_deleteが指定されている（物理FKの場合）
- [ ] 一意制約にインデックスが存在する
- [ ] 検索用カラムにインデックスが存在する
- [ ] ベクトルカラムにHNSWインデックスが存在する
- [ ] ENUM型が正しく参照されている

**sqlc Query:**
- [ ] クエリ名が命名規則に従っている（[Verb][Table]）
- [ ] 戻り値型が適切（:one, :many, :exec）
- [ ] WHERE句でインデックスが使用される
- [ ] LIMIT/OFFSETがパラメータ化されている
- [ ] JOINで外部キーが使用されている

**Go Code:**
- [ ] context.Contextが全関数の第一引数
- [ ] エラーがfmt.Errorf("...: %w", err)でラップされている
- [ ] slogが使用されている（fmt.Printlnなし）
- [ ] トランザクション使用時にdefer tx.Rollback()が存在
- [ ] UUID生成がuuidv7()（PostgreSQL）またはuuid.New()（Go）
- [ ] NanoID生成がgonanoid.New(8)

---

#### **15.12.6 デバッグ支援プロンプト**

**エラー発生時のCodingAgentへの問い合わせ:**

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

**例:**

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

**CodingAgent応答例:**

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

### **本ドキュメントの更新履歴**

**v7.0.1 (2026-02-05)**
- 15.11 Go統合パターン追加
- 15.12 CodingAgent協調パターン追加
- Atlas単独採用に伴うマイグレーション記載の更新
- golang-migrate関連記述を完全削除
- sqlc + Atlas統合パターンの詳細化
```

---

## **3. 更新の適用方法**

### **ステップ1: .clinerules配置**

```bash
# プロジェクトルートに配置
cat > .clinerules <<'EOF'
[上記の完全版.clinerules内容]
EOF
```

---

### **ステップ2: Q_DATABASE_REFACTPR.md更新**

```bash
# 既存ファイルの末尾に追加
cat >> docs/Q_DATABASE_REFACTPR.md <<'EOF'

---

[上記の15.11, 15.12セクション内容]

---

**本ドキュメントの更新履歴**

**v7.0.1 (2026-02-05)**
- 15.11 Go統合パターン追加
- 15.12 CodingAgent協調パターン追加
- Atlas単独採用に伴う記載更新
EOF
```

---

### **ステップ3: バージョン管理**

```bash
# Git commit
git add .clinerules docs/Q_DATABASE_REFACTPR.md
git commit -m "docs: Update development standards to v2026.02.1

- Adopt Atlas as sole migration tool (golang-migrate removed)
- Add Go 1.25.6 idioms (iterators, slog, math/rand/v2)
- Add Echo v5.0.1 patterns (DI, error handling)
- Add PostgreSQL 18.1 optimization guides
- Add CodingAgent collaboration patterns
- Add sqlc + Atlas integration examples
- Update to Q_DATABASE_REFACTPR.md v7.0.1"
```

---

## **4. CodingAgentへの通知**

更新完了後、CodingAgentに以下のように通知してください：

```
Development standards have been updated:

1. .clinerules v2026.02.1
   - Atlas is now the ONLY migration tool
   - Go 1.25.6 idioms are mandatory (iterators, slog, math/rand/v2)
   - Echo v5.0.1 patterns documented
   - PostgreSQL 18.1 optimization guides added

2. Q_DATABASE_REFACTPR.md v7.0.1
   - Section 15.11: Go integration patterns added
   - Section 15.12: CodingAgent collaboration patterns added
   - All golang-migrate references removed

Please review these files before generating any code.
Key changes:
- Use Atlas HCL for schema definitions
- Use sqlc with pgx/v5 for queries
- Use slog for all logging
- Use iter.Seq2 for streaming queries
- Follow the provided templates and examples
```

---

これで、.clinerules と Q_DATABASE_REFACTPR.md の完全な統合が完了しました。この2つのドキュメントが、1人開発+CodingAgent協調における完全なリファレンスとなります。
