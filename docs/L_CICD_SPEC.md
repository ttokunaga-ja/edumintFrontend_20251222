# CI/CD パイプライン仕様（Frontend）

```yaml
Pipeline_Stages:
  1. Lint:
      - command: "npm run lint"  # eslint + prettier
  2. TypeCheck:
      - command: "npm run typecheck"
  3. Test:
      - command: "npm run test -- --runInBand --coverage"
      - artifacts: "coverage/lcov.info"
  4. Security Scan:
      - tool: "npm audit --audit-level=high"
      - tool: "trivy fs ."  # optional in nightly
  5. Build:
      - command: "npm run build"
      - env_required: ["VITE_API_BASE_URL"]
      - output: "dist/"
  6. Docker:
      - command: "docker build -t ${IMAGE}:${GIT_SHA} ."
  7. Deploy:
      - trigger: main only
      - strategy: ArgoCD/Helm sync (blue/green or canary)
Artifacts:
  - dist/: upload for preview
  - coverage/lcov.info: upload to codecov
Environment_Limitations:
  - build_time_target: "<=8m"
  - secrets: GitHub Secrets (`VITE_API_BASE_URL`, `SENTRY_DSN` optional)
  - cache: npm cache keyed by package-lock.json
Quality_Gates:
  - lint/test/typecheck must pass
  - build fails if env 未設定 or API schema check fails
```

## Sources
- `../delivery/README.md`
- `../services/search-service/ci-cd.md`（CIの粒度/考え方の参考）
