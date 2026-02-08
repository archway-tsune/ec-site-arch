# Data Model: サンプル画面と本番画面の完全分離

本機能はデータモデルの変更を伴わない。既存の `@/contracts/` に定義された型定義（`Product`, `Cart`, `Order` 等）はそのまま維持される。

## 変更対象エンティティ

### ドメインスタブ（`src/domains/`）

既存の再エクスポートをスタブ実装に置き換える。型定義は `@/contracts/` の既存定義をそのまま使用。

**API スタブ（catalog/api/index.ts の例）**:

```typescript
// 既存の型をインポート（@/contracts/ のみ依存）
import type { Product } from '@/contracts/catalog';

export class NotImplementedError extends Error {
  constructor(domain: string, operation: string) {
    super(`ドメイン未実装: ${domain}.${operation}`);
    this.name = 'NotImplementedError';
  }
}

export function getProducts(): never {
  throw new NotImplementedError('catalog', 'getProducts');
}

export function getProductById(): never {
  throw new NotImplementedError('catalog', 'getProductById');
}

// ... 他の関数も同様
```

**UI スタブ（catalog/ui/index.ts の例）**:

```typescript
export function ProductList() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-base-900/60">ドメイン未実装</p>
    </div>
  );
}

export function ProductDetail() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-base-900/60">ドメイン未実装</p>
    </div>
  );
}
```

### NotImplementedError の追加

`@/foundation/errors/types.ts` の `ErrorCode` enum に `NOT_IMPLEMENTED` を追加:

```typescript
export enum ErrorCode {
  // ... 既存のコード
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}
```

各本番 API Route の catch ブロックに `NotImplementedError` のハンドリングを追加:

```typescript
if (err instanceof NotImplementedError) {
  return NextResponse.json(
    error(ErrorCode.NOT_IMPLEMENTED, err.message),
    { status: 501 }
  );
}
```

## 依存関係マップ

```
本番ページ → @/domains/ (スタブ) → @/contracts/ のみ
本番 API   → @/domains/ (スタブ) → @/contracts/ のみ
           → @/infrastructure/    → @/contracts/ のみ
           → @/foundation/

サンプルページ → @/samples/domains/ → @/contracts/ のみ
サンプル API   → @/samples/domains/ → @/contracts/ のみ
              → @/infrastructure/  → @/contracts/ のみ
              → @/foundation/

共有（変更なし）:
  @/contracts/       → 依存なし
  @/infrastructure/  → @/contracts/
  @/foundation/      → 外部依存なし
  @/templates/       → 依存なし
```
