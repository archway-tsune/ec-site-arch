# Spec Template - カタログ一覧機能

`/speckit.specify` 実行時の参考テンプレートです。

---

## spec.md

```markdown
# Feature: カタログ一覧機能

## 概要

購入者が商品カタログを閲覧できる機能。
商品一覧の表示、検索、詳細表示ができる。

## ユーザーストーリー

- As a 購入者, I want to 商品一覧を閲覧したい, so that 欲しい商品を探せる
- As a 購入者, I want to 商品を検索したい, so that 目的の商品を素早く見つけられる
- As a 購入者, I want to 商品詳細を確認したい, so that 購入を判断できる

## 機能要件

### FR-001: 商品一覧表示
- 説明: 商品一覧をカード形式で表示
- 表示項目: 商品画像、商品名、価格、在庫状況
- ページネーション: 12件/ページ
- 優先度: Must

### FR-002: 商品検索
- 説明: キーワードで商品を検索
- 検索対象: 商品名、説明文
- 優先度: Should

### FR-003: 商品詳細表示
- 説明: 商品の詳細情報を表示
- 表示項目: 商品画像、商品名、価格、説明、在庫数
- 操作: カートに追加
- 優先度: Must

## UI要件

### 画面一覧
| 画面ID | 画面名 | パス | テンプレート |
|--------|--------|------|-------------|
| UI-001 | 商品一覧 | /catalog | ListPageTemplate |
| UI-002 | 商品詳細 | /catalog/[id] | DetailPageTemplate |

### UIコンポーネント
- `ProductList`: 商品一覧表示
- `ProductCard`: 商品カード（一覧用）
- `ProductDetail`: 商品詳細表示

## API要件

### エンドポイント一覧
| メソッド | パス | 説明 | 認可 |
|---------|------|------|------|
| GET | /api/catalog/products | 商品一覧取得 | 不要 |
| GET | /api/catalog/products/[id] | 商品詳細取得 | 不要 |

### リクエスト/レスポンス

#### GET /api/catalog/products
\`\`\`typescript
// Query Parameters
interface GetProductsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

// Response
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
\`\`\`

## 実装ガイド

### 使用テンプレート
\`\`\`typescript
// UI
import { ListPageTemplate } from '@/templates/ui/pages/list';
import { DetailPageTemplate } from '@/templates/ui/pages/detail';

// API
import { createUseCase } from '@/templates/api/usecase';

// インフラ
import { createHmrSafeStore } from '@/templates/infrastructure/repository';
\`\`\`

### ディレクトリ構成
\`\`\`
src/domains/catalog/
├── api/
│   └── usecases.ts
├── ui/
│   ├── ProductList.tsx
│   ├── ProductCard.tsx
│   └── ProductDetail.tsx
├── types/
│   └── index.ts
└── tests/
    └── unit/
        └── usecases.test.ts
\`\`\`

## テスト要件

### 単体テスト
- 商品一覧取得ユースケース（正常系、0件、検索、ページネーション）
- 商品詳細取得ユースケース（正常系、存在しないID）
- ProductCardコンポーネント（表示）

### E2Eテスト
- 商品一覧ページが表示される
- 商品を検索できる
- 商品詳細ページに遷移できる
```

---

## plan.md

```markdown
# Plan: カタログ一覧機能

## 設計方針

### アーキテクチャ
- `src/domains/catalog/` に実装
- templates/ のListPageTemplate、DetailPageTemplateを使用

### データアクセス
- インメモリリポジトリ（開発用）
- 本番はDB接続に置き換え

### 認可
- 閲覧: 認証不要（公開）

## 実装順序

1. **型定義・リポジトリ**: Product エンティティ、インメモリストア
2. **APIユースケース**: GetProducts, GetProductById
3. **UIコンポーネント**: ProductCard, ProductList, ProductDetail
4. **ページ実装**: 一覧ページ、詳細ページ
5. **テスト**: 単体テスト、E2Eテスト
```

---

## tasks.md

```markdown
# Tasks: カタログ一覧機能

## フェーズ1: 基盤実装

### Task 1-1: 型定義・リポジトリ
- [ ] T001 Product型定義を実装する `src/domains/catalog/types/index.ts`
- [ ] T002 Productリポジトリを実装する `src/infrastructure/repositories/product.ts`

### Task 1-2: APIユースケース
- [ ] T003 GetProductsユースケースを実装する `src/domains/catalog/api/usecases.ts`
- [ ] T004 GetProductByIdユースケースを実装する `src/domains/catalog/api/usecases.ts`
- [ ] T005 [P] ユースケースの単体テストを実装する

## フェーズ2: UI実装

### Task 2-1: コンポーネント
- [ ] T006 [P] ProductCardコンポーネントを実装する `src/domains/catalog/ui/ProductCard.tsx`
- [ ] T007 ProductListコンポーネントを実装する `src/domains/catalog/ui/ProductList.tsx`
- [ ] T008 ProductDetailコンポーネントを実装する `src/domains/catalog/ui/ProductDetail.tsx`

### Task 2-2: ページ・API
- [ ] T009 商品一覧ページを実装する `src/app/(buyer)/catalog/page.tsx`
- [ ] T010 商品詳細ページを実装する `src/app/(buyer)/catalog/[id]/page.tsx`
- [ ] T011 [P] APIルートを実装する `src/app/api/catalog/products/route.ts`

## フェーズ3: テスト

### Task 3-1: E2Eテスト
- [ ] T012 カタログ機能E2Eテストを実装する `tests/e2e/catalog.spec.ts`

## 依存関係
- T001 → T002, T003, T004
- T003, T004 → T007, T008, T009, T010, T011
- T006 → T007
```
