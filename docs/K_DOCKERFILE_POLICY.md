# Dockerfile 方針書（Frontend React/Vite）

- Build: `node:20-alpine`（builder）。`npm ci` → `npm run build`。
- Runtime: `nginx:1.25-alpine` で静的配信。root 禁止、`USER 101` 等の非 root に切替。
- 必須:
  1. マルチステージで builder/runtime を分離し、`dist/` のみコピー。
  2. `.dockerignore` に `node_modules/`, `.git`, `.turbo`, `coverage/`, `dist/` を含める。
  3. Build 時に `VITE_API_BASE_URL` 未設定なら失敗させる（build arg で秘密情報を渡さない）。
  4. Nginx で `/health` に静的 200 を提供し `HEALTHCHECK` を設定。
  5. セキュリティヘッダは `nginx.conf` テンプレに含める（X-Frame-Options, X-Content-Type-Options 等）。

## スケルトン例
```Dockerfile
# builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN test -n "$VITE_API_BASE_URL"
RUN npm run build

# runtime
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
RUN addgroup -S web && adduser -S web -G web
COPY --from=builder /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK CMD wget -qO- http://localhost:80/health || exit 1
USER web
```

## キャッシュ/サイズ最適化
- `package-lock.json` 変更がない限り `npm ci` レイヤーを再利用。
- 画像サイズ目安: < 60MB (圧縮後)。

## シグナル/エントリポイント
- Nginx は PID1 とし、Graceful reload はデプロイパイプラインで実施。Node サーバーを runtime に残さない。

## Sources
- `../delivery/README.md`
