# Feature Flag 方針書（Frontend）

- 実装: Vite 環境変数 `VITE_ENABLE_<FEATURE>` を一次フラグとして使用。SDK 導入時もラッパ関数経由で取得。  
- 命名: `FE_<area>_<feature>` 例 `FE_WALLET_ENABLE`, `FE_SOCIAL_ENABLE`, `FE_ADS_ENABLE`。  
- Fallback: 取得不可時は安全側（新機能は `false`）。API 未接続領域は Coming Soon + CTA disable。  
- Context: サインイン済みなら `userId`, `role` をフラグ評価に渡す。匿名時は匿名用のフラグを別に持つ。  
- トグル種別: Release（段階解放）、Ops（障害時切替）、Permission（役割別）。  
- コード例:
```ts
import { isFeatureEnabled } from "@/lib/featureFlags";

if (isFeatureEnabled("FE_WALLET_ENABLE")) {
  return <WalletCard />;
}
return <ComingSoon label="ウォレット準備中" />;
```
- 運用: `/health/<service>` が outage の場合はフラグに関係なく UI を disable し理由を表示。

## Sources
- `../overview/requirements.md`
