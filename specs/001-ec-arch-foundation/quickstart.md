# クイックスタート: ECサイト向けアーキテクチャ基盤

**ブランチ**: `001-ec-arch-foundation`
**日付**: 2026-02-05

## 1. 概要

本ドキュメントは、ECサイト向けアーキテクチャ基盤を利用して新規ドメインを立ち上げる手順を説明する。

## 2. 前提条件

- Node.js 20.x 以上
- pnpm 8.x 以上
- TypeScript 5.x

## 3. プロジェクトセットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev

# 型チェック
pnpm typecheck

# テスト実行
pnpm test
```

## 4. 新規ドメインの追加手順

### 4.1 ディレクトリ作成

```bash
# 例: Wishlist ドメインを追加する場合
mkdir -p src/domains/wishlist/{ui,api,tests/{unit,integration}}
```

### 4.2 契約（DTO）の定義

`specs/001-ec-arch-foundation/contracts/` を参考に、ドメインの契約を定義する。

```typescript
// src/domains/wishlist/contracts/wishlist.ts
import { z } from 'zod';

export const WishlistItemSchema = z.object({
  productId: z.string().uuid(),
  addedAt: z.coerce.date(),
});
export type WishlistItem = z.infer<typeof WishlistItemSchema>;

// 入出力契約を定義...
```

### 4.3 ユースケースの実装

`src/templates/api/usecase.ts` をテンプレートとして利用する。

```typescript
// src/domains/wishlist/api/usecases/addToWishlist.ts
import { authorize } from '@/foundation/auth/authorize';
import { validate } from '@/foundation/validation/runtime';
import { AddToWishlistInputSchema, type AddToWishlistInput } from '../contracts/wishlist';

export async function addToWishlist(
  input: unknown,
  session: SessionData
): Promise<AddToWishlistOutput> {
  // 1. 認可チェック
  authorize(session, 'buyer');

  // 2. バリデーション
  const validated = validate(AddToWishlistInputSchema, input);

  // 3. ビジネスロジック
  // ...

  return result;
}
```

### 4.4 UIの実装

`src/templates/ui/pages/` をテンプレートとして利用する。

```tsx
// src/domains/wishlist/ui/WishlistPage.tsx
import { getSession } from '@/foundation/auth/session';
import { Layout } from '@/templates/ui/components/layout/Layout';
import { Loading } from '@/templates/ui/components/status/Loading';
import { Empty } from '@/templates/ui/components/status/Empty';

export default async function WishlistPage() {
  const session = await getSession();
  const wishlist = await getWishlist(session.userId);

  if (!wishlist) {
    return <Loading />;
  }

  if (wishlist.items.length === 0) {
    return <Empty message="ウィッシュリストは空です" />;
  }

  return (
    <Layout>
      {/* 商品リスト表示 */}
    </Layout>
  );
}
```

### 4.5 テストの実装

`src/templates/tests/` をテンプレートとして利用する。

#### 単体テスト（ユースケース）

```typescript
// src/domains/wishlist/tests/unit/addToWishlist.test.ts
import { describe, it, expect, vi } from 'vitest';
import { addToWishlist } from '../../api/usecases/addToWishlist';

describe('addToWishlist ユースケース', () => {
  describe('正常系', () => {
    it('Given 有効な商品ID, When ウィッシュリストに追加, Then 追加される', async () => {
      // Arrange
      const session = { userId: 'user-1', role: 'buyer' as const };
      const input = { productId: 'product-1' };

      // Act
      const result = await addToWishlist(input, session);

      // Assert
      expect(result.items).toContainEqual(expect.objectContaining({
        productId: 'product-1',
      }));
    });
  });

  describe('認可条件', () => {
    it('Given adminロール, When ウィッシュリストに追加, Then FORBIDDEN', async () => {
      const session = { userId: 'admin-1', role: 'admin' as const };
      const input = { productId: 'product-1' };

      await expect(addToWishlist(input, session)).rejects.toThrow('FORBIDDEN');
    });
  });
});
```

#### 統合テスト（API）

```typescript
// src/domains/wishlist/tests/integration/api.test.ts
import { describe, it, expect } from 'vitest';
import { createTestClient, createSession } from '@/test-utils';

describe('POST /api/wishlist/items', () => {
  it('buyerは商品をウィッシュリストに追加できる', async () => {
    const client = createTestClient();
    const session = createSession({ role: 'buyer' });

    const response = await client
      .post('/api/wishlist/items')
      .set('Cookie', session.cookie)
      .send({ productId: 'product-1' });

    expect(response.status).toBe(200);
    expect(response.body.items).toContainEqual(
      expect.objectContaining({ productId: 'product-1' })
    );
  });

  it('未認証ユーザーは401エラー', async () => {
    const client = createTestClient();

    const response = await client
      .post('/api/wishlist/items')
      .send({ productId: 'product-1' });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });
});
```

### 4.6 ルーティングの追加

Next.js App Router にルートを追加する。

```typescript
// src/app/(buyer)/wishlist/page.tsx
export { default } from '@/domains/wishlist/ui/WishlistPage';
```

## 5. 認可の設定

`contracts/auth.ts` にユースケースの認可要件を追加する。

```typescript
export const UseCaseAuthorization = {
  // 既存の定義...

  // Wishlist
  getWishlist: { requiredRole: 'buyer', action: 'ウィッシュリスト取得' },
  addToWishlist: { requiredRole: 'buyer', action: 'ウィッシュリスト追加' },
  removeFromWishlist: { requiredRole: 'buyer', action: 'ウィッシュリスト削除' },
} as const;
```

## 6. テスト実行

```bash
# 単体テスト
pnpm test:unit

# 統合テスト
pnpm test:integration

# E2Eテスト
pnpm test:e2e

# カバレッジ確認
pnpm test:coverage
```

## 7. チェックリスト

新規ドメイン追加時のチェックリスト:

- [ ] 契約（DTO）が Zod スキーマで定義されている
- [ ] ユースケースに認可チェックが含まれている
- [ ] ユースケースに runtime validation が含まれている
- [ ] UI が Server Components で実装されている
- [ ] 単体テストが Given-When-Then 形式で書かれている
- [ ] 単体テストに正常系・異常系・認可条件が含まれている
- [ ] 統合テストで API 契約が検証されている
- [ ] カバレッジが 80% 以上
- [ ] `UseCaseAuthorization` に認可要件が追加されている
