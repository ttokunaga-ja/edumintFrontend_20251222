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
