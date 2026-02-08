# リポジトリインターフェース契約定義

**日付**: 2026-02-08
**ブランチ**: `003-decouple-samples`

## 概要

サンプルのユースケースファイル内に定義されているリポジトリインターフェースを共有契約層（src/contracts/）に移動する。
既存の DTOスキーマ・Zodスキーマは一切変更せず、インターフェース定義のみを追加する。

## catalog.ts に追加するインターフェース

```typescript
// ─── リポジトリインターフェース ───

export interface ProductRepository {
  findAll(params: {
    status?: Product['status'];
    offset: number;
    limit: number;
  }): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product>;
  update(
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Product>;
  delete(id: string): Promise<void>;
  count(status?: Product['status']): Promise<number>;
}
```

**移動元**: `src/samples/domains/catalog/api/usecases.ts`
**参照する既存型**: `Product`（同ファイル内で定義済み）

## cart.ts に追加するインターフェース

```typescript
// ─── リポジトリインターフェース ───

export interface CartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  create(userId: string): Promise<Cart>;
  addItem(
    userId: string,
    item: Omit<CartItem, 'addedAt'>
  ): Promise<Cart>;
  updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<Cart>;
  removeItem(userId: string, productId: string): Promise<Cart>;
}

export interface ProductFetcher {
  findById(productId: string): Promise<{
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  } | null>;
}
```

**移動元**: `src/samples/domains/cart/api/usecases.ts`
**参照する既存型**: `Cart`, `CartItem`（同ファイル内で定義済み）

## orders.ts に追加するインターフェース

```typescript
// ─── リポジトリインターフェース ───

export interface OrderRepository {
  findAll(params: {
    userId?: string;
    status?: OrderStatus;
    offset: number;
    limit: number;
  }): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  create(
    data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  count(params: { userId?: string; status?: OrderStatus }): Promise<number>;
}

export interface CartFetcher {
  getByUserId(userId: string): Promise<Cart | null>;
  clear(userId: string): Promise<void>;
}
```

**移動元**: `src/samples/domains/orders/api/usecases.ts`
**参照する既存型**: `Order`, `OrderStatus`（同ファイル内で定義済み）, `Cart`（`@/contracts/cart` から import）

## 注意事項

- CartFetcher は orders.ts に配置する（注文ドメインがカートを参照するユースケースのため）
- CartFetcher が参照する `Cart` 型は `@/contracts/cart` から import する必要がある
- ProductFetcher の戻り値型はインラインで定義する（Product の一部フィールドのみ使用するため、完全な Product 型への依存を避ける）
