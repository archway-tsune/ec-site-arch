# クイックスタート: サンプル・本番分離アーキテクチャ

**日付**: 2026-02-08
**ブランチ**: `003-decouple-samples`

## 前提条件

- Node.js 18+
- pnpm インストール済み
- リポジトリのクローンと依存のインストール完了（`pnpm install`）

## 実装の流れ

### ステップ 1: リポジトリインターフェースの共有契約への追加

```bash
# 対象ファイル
src/contracts/catalog.ts   # ProductRepository 追加
src/contracts/cart.ts      # CartRepository, ProductFetcher 追加
src/contracts/orders.ts    # OrderRepository, CartFetcher 追加

# 検証
pnpm typecheck
```

### ステップ 2: サンプルのインターフェース参照先を共有契約に変更

```bash
# 対象ファイル
src/samples/domains/catalog/api/usecases.ts  # インライン定義を削除、@/contracts/catalog から import
src/samples/domains/cart/api/usecases.ts     # インライン定義を削除、@/contracts/cart から import
src/samples/domains/orders/api/usecases.ts   # インライン定義を削除、@/contracts/orders から import

# 検証
pnpm typecheck && pnpm test:unit
```

### ステップ 3: インフラ層の参照先を共有契約に変更

```bash
# 対象ファイル
src/infrastructure/repositories/product.ts  # @/samples/... → @/contracts/catalog
src/infrastructure/repositories/cart.ts     # @/samples/... → @/contracts/cart
src/infrastructure/repositories/order.ts    # @/samples/... → @/contracts/orders

# 検証
pnpm typecheck && pnpm test:unit
```

### ステップ 4: ドメイン層の暫定スキャフォールド作成

```bash
# 新規作成
src/domains/catalog/api/index.ts   # @/samples/domains/catalog/api の再エクスポート
src/domains/catalog/ui/index.ts    # @/samples/domains/catalog/ui の再エクスポート
src/domains/cart/api/index.ts      # @/samples/domains/cart/api の再エクスポート
src/domains/cart/ui/index.ts       # @/samples/domains/cart/ui の再エクスポート
src/domains/orders/api/index.ts    # @/samples/domains/orders/api の再エクスポート
src/domains/orders/ui/index.ts     # @/samples/domains/orders/ui の再エクスポート

# 検証
pnpm typecheck
```

### ステップ 5: APIルートの参照先をドメイン層に変更

```bash
# 対象ファイル（7ファイル）
src/app/api/catalog/products/route.ts
src/app/api/catalog/products/[id]/route.ts
src/app/api/cart/route.ts
src/app/api/cart/items/route.ts
src/app/api/cart/items/[productId]/route.ts
src/app/api/orders/route.ts
src/app/api/orders/[id]/route.ts

# 変更内容: import パスを @/samples/domains/{domain}/api → @/domains/{domain}/api

# 検証
pnpm typecheck && pnpm test:unit && pnpm test:integration
```

### ステップ 6: ページの参照先をドメイン層に変更

```bash
# 対象ファイル（5ファイル）
src/app/(buyer)/catalog/page.tsx
src/app/(buyer)/catalog/[id]/page.tsx
src/app/(buyer)/cart/page.tsx
src/app/(buyer)/orders/page.tsx
src/app/(buyer)/orders/[id]/page.tsx

# 変更内容: import パスを @/samples/domains/{domain}/ui/{Component} → @/domains/{domain}/ui

# 検証
pnpm typecheck && pnpm test:unit && pnpm test:e2e
```

### ステップ 7: リリースZIPのテスト同梱

```bash
# 対象ファイル
scripts/create-release-zip.ps1  # tests/e2e/arch の除外を解除

# 検証: ZIPを作成してテストファイルの存在を確認
```

### ステップ 8: ドキュメント・入力例の更新

```bash
# プロジェクトドキュメント（7ファイル）
README.md
docs/GETTING_STARTED.md
docs/SPECKIT_INTEGRATION.md
src/domains/README.md
src/samples/README.md
scripts/README.md
specs/001-ec-arch-foundation/quickstart.md

# 機能入力例（5ファイル）
docs/examples/constitution-example.md
docs/examples/spec-catalog-example.md
docs/examples/spec-cart-example.md
docs/examples/spec-order-example.md
docs/examples/spec-product-example.md
```

## 最終検証

```bash
# 全テスト実行
pnpm typecheck
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# @/samples/ への直接依存が残っていないことを確認
# src/app/ と src/infrastructure/ 配下で @/samples/ を grep して0件であること
```

## 注意事項

- 各ステップは独立して実施・検証可能
- ドメイン単位（catalog → cart → orders）で段階的に進めることも可能
- 暫定スキャフォールドは本番実装時に置き換える前提の一時的な構成
