# Contracts: サンプル画面と本番画面の完全分離

本機能は新規 API 契約を追加しない。既存の `@/contracts/` 定義はすべて維持される。

## 変更サマリー

### ErrorCode enum 拡張

`src/foundation/errors/types.ts` の `ErrorCode` に `NOT_IMPLEMENTED` を追加:

```typescript
NOT_IMPLEMENTED = 'NOT_IMPLEMENTED'  // HTTP 501
```

### ドメインスタブのエクスポート契約

`src/domains/*/api/index.ts` のスタブは、既存の再エクスポートと同じ関数名をエクスポートする。
型シグネチャは維持するが、すべて `NotImplementedError` をスローする:

| Domain  | Export Functions |
|---------|----------------|
| catalog | `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`, `NotFoundError` |
| cart    | `getCart`, `addToCart`, `updateCartItem`, `removeFromCart`, `NotFoundError`, `CartItemNotFoundError` |
| orders  | `getOrders`, `getOrderById`, `createOrder`, `updateOrderStatus`, `NotFoundError`, `EmptyCartError`, `InvalidStatusTransitionError` |

`src/domains/*/ui/index.ts` のスタブは、既存の再エクスポートと同じコンポーネント名をエクスポートする:

| Domain  | Export Components |
|---------|------------------|
| catalog | `ProductList`, `ProductDetail` |
| cart    | `CartView` |
| orders  | `OrderList`, `OrderDetail` |

### サンプル API Routes のパスマッピング

| 本番パス | サンプルパス | Import 変更 |
|---------|------------|------------|
| `/api/catalog/products` | `/sample/api/catalog/products` | `@/domains/catalog/api` → `@/samples/domains/catalog/api` |
| `/api/cart` | `/sample/api/cart` | `@/domains/cart/api` → `@/samples/domains/cart/api` |
| `/api/orders` | `/sample/api/orders` | `@/domains/orders/api` → `@/samples/domains/orders/api` |
| `/api/auth/*` | `/sample/api/auth/*` | 変更なし（`@/infrastructure/` のみ依存） |
| `/api/test/reset` | `/sample/api/test/reset` | 変更なし（`@/infrastructure/` のみ依存） |
