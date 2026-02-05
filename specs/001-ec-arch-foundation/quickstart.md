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

## 3.5 テンプレート一覧

利用可能なテンプレートの一覧:

| カテゴリ | テンプレート | パス |
|---------|-------------|------|
| **UI ページ** | 一覧画面 | `src/templates/ui/pages/list.tsx` |
| | 詳細画面 | `src/templates/ui/pages/detail.tsx` |
| | フォーム画面 | `src/templates/ui/pages/form.tsx` |
| | ログインページ | `src/templates/ui/pages/login.tsx` |
| | ログアウトページ | `src/templates/ui/pages/logout.tsx` |
| **UI レイアウト** | 管理者レイアウト | `src/templates/ui/layouts/AdminLayout.tsx` |
| | 購入者レイアウト | `src/templates/ui/layouts/BuyerLayout.tsx` |
| **UI コンポーネント** | ヘッダー | `src/templates/ui/components/layout/Header.tsx` |
| | フッター | `src/templates/ui/components/layout/Footer.tsx` |
| | レイアウト | `src/templates/ui/components/layout/Layout.tsx` |
| | フォームフィールド | `src/templates/ui/components/form/FormField.tsx` |
| | Loading | `src/templates/ui/components/status/Loading.tsx` |
| | Error | `src/templates/ui/components/status/Error.tsx` |
| | Empty | `src/templates/ui/components/status/Empty.tsx` |
| | Forbidden | `src/templates/ui/components/auth/Forbidden.tsx` |
| **UI ユーティリティ** | カスタムイベント | `src/templates/ui/utils/events.ts` |
| **API** | ユースケース | `src/templates/api/usecase.ts` |
| | ハンドラー | `src/templates/api/handler.ts` |
| | DTO | `src/templates/api/dto.ts` |
| | ログインAPI | `src/templates/api/auth/login.ts` |
| | ログアウトAPI | `src/templates/api/auth/logout.ts` |
| | セッションAPI | `src/templates/api/auth/session.ts` |
| **インフラ** | インメモリリポジトリ | `src/templates/infrastructure/repository.ts` |
| | セッション管理 | `src/templates/infrastructure/session.ts` |
| | テストリセット | `src/templates/infrastructure/test-reset.ts` |
| **テスト** | ユースケース単体 | `src/templates/tests/unit/usecase.test.ts` |
| | コンポーネント単体 | `src/templates/tests/unit/component.test.tsx` |
| | API統合 | `src/templates/tests/integration/api.test.ts` |
| | E2E購入者導線 | `src/templates/tests/e2e/buyer-flow.spec.ts` |
| | E2E管理者導線 | `src/templates/tests/e2e/admin-flow.spec.ts` |

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

### 4.5 レイアウトの実装

#### 購入者向けレイアウト

`src/templates/ui/layouts/BuyerLayout.tsx` を利用して、自動ログインとカート同期機能付きのレイアウトを作成する。

```tsx
// src/app/(buyer)/layout.tsx
'use client';

import { BuyerLayout } from '@/templates/ui/layouts/BuyerLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BuyerLayout
      siteName="My EC Site"
      navLinks={[
        { href: '/catalog', label: '商品一覧' },
        { href: '/cart', label: 'カート' },
        { href: '/orders', label: '注文履歴' },
      ]}
      autoLogin={{
        enabled: true,  // デモ用自動ログイン
        email: 'buyer@example.com',
        password: 'demo',
      }}
    >
      {children}
    </BuyerLayout>
  );
}
```

#### 管理者向けレイアウト

`src/templates/ui/layouts/AdminLayout.tsx` を利用して、ロールチェック付きの管理画面レイアウトを作成する。

```tsx
// src/app/admin/layout.tsx
'use client';

import { AdminLayout } from '@/templates/ui/layouts/AdminLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout
      siteName="EC Site 管理"
      navLinks={[
        { href: '/admin', label: 'ダッシュボード' },
        { href: '/admin/products', label: '商品管理' },
        { href: '/admin/orders', label: '注文管理' },
      ]}
      requiredRole="admin"
      loginPath="/admin/login"
    >
      {children}
    </AdminLayout>
  );
}
```

### 4.6 認証ページの実装

#### ログインページ

`src/templates/ui/pages/login.tsx` を利用してログインページを作成する。

```tsx
// src/app/admin/login/page.tsx
'use client';

import { LoginPage, isAdmin } from '@/templates/ui/pages/login';

export default function AdminLoginPage() {
  return (
    <LoginPage
      title="管理者ログイン"
      apiEndpoint="/api/auth/login"
      redirectUrl="/admin"
      roleCheck={isAdmin}  // adminロールのみ許可
      roleErrorMessage="管理者権限が必要です"
    />
  );
}
```

#### ログアウトページ

`src/templates/ui/pages/logout.tsx` を利用してログアウトページを作成する。

```tsx
// src/app/admin/logout/page.tsx
'use client';

import { LogoutPage } from '@/templates/ui/pages/logout';

export default function AdminLogoutPage() {
  return (
    <LogoutPage
      title="ログアウト"
      logoutEndpoint="/api/auth/logout"
      redirectUrl="/admin/login"
      message="ログアウトしました"
    />
  );
}
```

### 4.7 認証APIの実装

`src/templates/api/auth/` を利用して認証APIを作成する。

```typescript
// src/app/api/auth/login/route.ts
import { createLoginHandler } from '@/templates/api/auth/login';
import { createServerSession, getDemoUserName } from '@/infrastructure/auth';

// カスタム認証ロジック
const authenticator = {
  async authenticate(email: string, password: string) {
    // 実際のDBユーザー検証をここに実装
    const isAdmin = email.includes('admin');
    return {
      userId: isAdmin ? 'admin-001' : 'buyer-001',
      role: isAdmin ? 'admin' : 'buyer',
      name: isAdmin ? '管理者' : '購入者',
    };
  },
};

// セッション作成ロジック
const sessionCreator = {
  async createSession(authResult) {
    await createServerSession(authResult.role);
  },
};

export const POST = createLoginHandler({
  authenticator,
  sessionCreator,
});
```

### 4.8 インメモリリポジトリの実装

`src/templates/infrastructure/repository.ts` を利用してデモ・テスト用のリポジトリを作成する。

```typescript
// src/infrastructure/repositories/wishlist.ts
import {
  createInMemoryStore,
  createCrudRepository,
  generateId,
  type BaseEntity,
} from '@/templates/infrastructure/repository';

interface WishlistItem extends BaseEntity {
  userId: string;
  productId: string;
}

// 初期データ（オプション）
const initialData: WishlistItem[] = [];

// ストア作成
const wishlistStore = createInMemoryStore<WishlistItem>(initialData);

// リポジトリ作成
export const wishlistRepository = createCrudRepository<
  WishlistItem,
  { userId: string; productId: string },
  Partial<WishlistItem>
>(
  wishlistStore,
  // create関数
  (input) => ({
    id: generateId(),
    userId: input.userId,
    productId: input.productId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  // update関数
  (entity, input) => ({
    ...entity,
    ...input,
    updatedAt: new Date(),
  })
);

// テスト用リセット関数
export function resetWishlistStore(): void {
  wishlistStore.clear();
}
```

### 4.9 カスタムイベントの利用

`src/templates/ui/utils/events.ts` を利用してコンポーネント間の状態同期を行う。

```tsx
// カート追加時にイベントを発火
import { dispatchCartUpdated } from '@/templates/ui/utils/events';

async function handleAddToCart(productId: string) {
  await fetch('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });

  // ヘッダーのカート数を更新
  dispatchCartUpdated({ action: 'add', productId });
}
```

```tsx
// ヘッダーでカート更新を監視
import { useEffect, useState } from 'react';
import { subscribeCartUpdated } from '@/templates/ui/utils/events';

function Header() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeCartUpdated(() => {
      // カート数を再取得
      fetchCartCount().then(setCartCount);
    });
    return unsubscribe;
  }, []);

  return <div>カート: {cartCount}</div>;
}
```

### 4.10 テストリセットAPIの実装

`src/templates/infrastructure/test-reset.ts` を利用してE2Eテスト用のリセットAPIを作成する。

```typescript
// src/app/api/test/reset/route.ts
import { createResetHandler } from '@/templates/infrastructure/test-reset';
import { resetCartStore } from '@/infrastructure/repositories/cart';
import { resetOrderStore } from '@/infrastructure/repositories/order';
import { resetWishlistStore } from '@/infrastructure/repositories/wishlist';

export const POST = createResetHandler({
  resetFunctions: [
    resetCartStore,
    resetOrderStore,
    resetWishlistStore,
  ],
});
```

### 4.11 フォームコンポーネントの利用

`src/templates/ui/components/form/FormField.tsx` を利用して統一されたフォームを作成する。

```tsx
// src/domains/wishlist/ui/WishlistForm.tsx
import { TextInput, TextArea, Select } from '@/templates/ui/components/form';

export function WishlistForm() {
  return (
    <form>
      <TextInput
        id="name"
        label="リスト名"
        placeholder="例: 欲しいもの"
        required
      />

      <TextArea
        id="description"
        label="説明"
        rows={3}
        hint="任意で説明を追加できます"
      />

      <Select
        id="visibility"
        label="公開設定"
        options={[
          { value: 'private', label: '非公開' },
          { value: 'public', label: '公開' },
        ]}
      />

      <button type="submit">作成</button>
    </form>
  );
}
```

### 4.12 テストの実装

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

### 4.13 ルーティングの追加

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

### 基本要件
- [ ] 契約（DTO）が Zod スキーマで定義されている
- [ ] ユースケースに認可チェックが含まれている
- [ ] ユースケースに runtime validation が含まれている
- [ ] `UseCaseAuthorization` に認可要件が追加されている

### UI 実装
- [ ] 適切なレイアウトテンプレート（BuyerLayout/AdminLayout）を使用している
- [ ] 一覧・詳細・フォーム画面がテンプレートから作成されている
- [ ] Loading/Error/Empty 状態が適切に処理されている
- [ ] フォームが FormField コンポーネントを使用している

### 認証・認可
- [ ] 認証が必要なページはレイアウトでセッションチェックしている
- [ ] ロールチェックが必要なページは roleCheck を設定している
- [ ] ログイン/ログアウトページが適切に設定されている

### インフラ
- [ ] リポジトリがテンプレートから作成されている
- [ ] リポジトリにリセット関数が実装されている
- [ ] リセット関数が `/api/test/reset` に登録されている

### イベント・状態同期
- [ ] コンポーネント間の状態同期にカスタムイベントを使用している
- [ ] イベントリスナーがクリーンアップされている

### テスト
- [ ] 単体テストが Given-When-Then 形式で書かれている
- [ ] 単体テストに正常系・異常系・認可条件が含まれている
- [ ] 統合テストで API 契約が検証されている
- [ ] E2Eテストで主要導線が検証されている
- [ ] カバレッジが 80% 以上

## 8. テンプレートのインポート

すべてのテンプレートは `@/templates` からインポート可能:

```typescript
// ページテンプレート
import { ListPage, DetailPage, FormPage, LoginPage, LogoutPage } from '@/templates';

// レイアウト
import { AdminLayout, BuyerLayout } from '@/templates';

// コンポーネント
import { Loading, Error, Empty, Forbidden } from '@/templates';
import { FormField, TextInput, TextArea, Select } from '@/templates';
import { Header, Footer, Layout } from '@/templates';

// ユーティリティ
import { dispatchCartUpdated, subscribeCartUpdated } from '@/templates';
import { isAdmin, isBuyer, allowAny } from '@/templates';

// インフラ
import { createInMemoryStore, createCrudRepository, generateId } from '@/templates';
import { createResetHandler, resetRegistry } from '@/templates';

// API ファクトリ
import { createLoginHandler, createLogoutHandler, createSessionHandler } from '@/templates';
```
