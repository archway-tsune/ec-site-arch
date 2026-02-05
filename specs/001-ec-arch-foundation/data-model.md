# データモデル: ECサイト向けアーキテクチャ基盤

**ブランチ**: `001-ec-arch-foundation`
**日付**: 2026-02-05
**ステータス**: 完了

## 1. エンティティ概要

本データモデルは、ECアーキテクチャ基盤のテンプレートとして利用されるエンティティを定義する。
永続層の実装詳細はスコープ外であり、インターフェースのみを定義する。

```
┌──────────────────────────────────────────────────────────────────┐
│                     認証・認可基盤                                │
│  ┌─────────┐     ┌─────────┐     ┌─────────────┐                │
│  │  User   │────▶│ Session │────▶│ CSRFToken   │                │
│  └─────────┘     └─────────┘     └─────────────┘                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     ドメインエンティティ                          │
│  ┌─────────┐     ┌──────────┐     ┌─────────┐                   │
│  │ Product │◀────│ CartItem │────▶│  Cart   │                   │
│  └─────────┘     └──────────┘     └─────────┘                   │
│       │                                │                         │
│       │                                │                         │
│       ▼                                ▼                         │
│  ┌───────────┐                   ┌─────────┐                    │
│  │ OrderItem │◀──────────────────│  Order  │                    │
│  └───────────┘                   └─────────┘                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     監査・ログ                                    │
│  ┌───────────┐                                                   │
│  │ AuditLog  │                                                   │
│  └───────────┘                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## 2. 認証・認可基盤エンティティ

### 2.1 User

ユーザーを表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| id | string | 必須, 一意 | ユーザー識別子 |
| role | Role | 必須 | ロール（buyer / admin） |
| createdAt | Date | 必須 | 作成日時 |
| updatedAt | Date | 必須 | 更新日時 |

**バリデーションルール**:
- `id`: UUID v4 形式
- `role`: 'buyer' または 'admin' のみ

**型定義**:
```typescript
type Role = 'buyer' | 'admin';

interface User {
  id: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Session

セッションを表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| id | string | 必須, 一意 | セッション識別子 |
| userId | string | 必須 | ユーザー参照 |
| role | Role | 必須 | ロール（キャッシュ） |
| expiresAt | Date | 必須 | 有効期限 |
| createdAt | Date | 必須 | 作成日時 |

**バリデーションルール**:
- `id`: セキュアなランダム文字列（32文字以上）
- `expiresAt`: 現在時刻より未来

**型定義**:
```typescript
interface Session {
  id: string;
  userId: string;
  role: Role;
  expiresAt: Date;
  createdAt: Date;
}

// セッションに保持する最小限の情報
interface SessionData {
  userId: string;
  role: Role;
}
```

### 2.3 CSRFToken

CSRFトークンを表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| token | string | 必須, 一意 | CSRFトークン |
| sessionId | string | 必須 | セッション参照 |
| createdAt | Date | 必須 | 作成日時 |

**バリデーションルール**:
- `token`: セキュアなランダム文字列（32文字以上）

## 3. ドメインエンティティ

### 3.1 Product（Catalogドメイン）

商品を表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| id | string | 必須, 一意 | 商品識別子 |
| name | string | 必須, 1-200文字 | 商品名 |
| price | number | 必須, 0以上 | 価格（円） |
| description | string | 任意, 最大2000文字 | 商品説明 |
| imageUrl | string | 任意 | 画像URL |
| status | ProductStatus | 必須 | 公開状態 |
| createdAt | Date | 必須 | 作成日時 |
| updatedAt | Date | 必須 | 更新日時 |

**状態遷移**:
```
draft → published → archived
         ↑    ↓
         └────┘
```

**型定義**:
```typescript
type ProductStatus = 'draft' | 'published' | 'archived';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Cart（Cartドメイン）

カートを表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| id | string | 必須, 一意 | カート識別子 |
| userId | string | 必須 | ユーザー参照 |
| items | CartItem[] | 必須 | カート内商品リスト |
| createdAt | Date | 必須 | 作成日時 |
| updatedAt | Date | 必須 | 更新日時 |

**型定義**:
```typescript
interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.3 CartItem（Cartドメイン）

カート内商品を表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| productId | string | 必須 | 商品参照 |
| quantity | number | 必須, 1以上 | 数量 |
| addedAt | Date | 必須 | 追加日時 |

**バリデーションルール**:
- `quantity`: 1以上の整数
- 同一商品が既にカートにある場合、数量を加算

**型定義**:
```typescript
interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}
```

### 3.4 Order（Ordersドメイン）

注文を表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| id | string | 必須, 一意 | 注文識別子 |
| userId | string | 必須 | 購入者参照 |
| items | OrderItem[] | 必須, 1件以上 | 注文商品リスト |
| totalAmount | number | 必須, 0以上 | 合計金額 |
| status | OrderStatus | 必須 | 注文ステータス |
| createdAt | Date | 必須 | 作成日時 |
| updatedAt | Date | 必須 | 更新日時 |

**状態遷移**:
```
pending → confirmed → shipped → delivered
    ↓         ↓
 cancelled  cancelled
```

**型定義**:
```typescript
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.5 OrderItem（Ordersドメイン）

注文商品を表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| productId | string | 必須 | 商品参照 |
| productName | string | 必須 | 商品名（スナップショット） |
| price | number | 必須, 0以上 | 価格（スナップショット） |
| quantity | number | 必須, 1以上 | 数量 |

**型定義**:
```typescript
interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}
```

## 4. 監査・ログエンティティ

### 4.1 AuditLog

監査ログを表すエンティティ。

| フィールド | 型 | 制約 | 説明 |
|------------|-----|------|------|
| id | string | 必須, 一意 | ログ識別子 |
| action | AuditAction | 必須 | 操作種別 |
| actorId | string | 必須 | 実行者（ユーザーID） |
| targetType | string | 必須 | 操作対象の種類 |
| targetId | string | 必須 | 操作対象の識別子 |
| details | object | 任意 | 追加情報（個人情報除外） |
| timestamp | Date | 必須 | 実行日時 |

**監査対象操作**:
- 商品の登録・編集・削除（admin）
- 注文ステータスの変更（admin）

**型定義**:
```typescript
type AuditAction = 'create' | 'update' | 'delete' | 'status_change';

interface AuditLog {
  id: string;
  action: AuditAction;
  actorId: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}
```

## 5. リレーション

| From | To | 関係 | 説明 |
|------|-----|------|------|
| Session | User | N:1 | セッションはユーザーに属する |
| CSRFToken | Session | 1:1 | CSRFトークンはセッションに紐づく |
| Cart | User | 1:1 | ユーザーは1つのカートを持つ |
| CartItem | Product | N:1 | カート商品は商品を参照 |
| Order | User | N:1 | 注文はユーザーに属する |
| OrderItem | Product | N:1 | 注文商品は商品を参照（スナップショット） |
| AuditLog | User | N:1 | 監査ログは実行者を参照 |

## 6. インデックス推奨

| エンティティ | フィールド | 種別 | 理由 |
|--------------|------------|------|------|
| User | id | Primary | 識別子 |
| Session | id | Primary | 識別子 |
| Session | userId | Index | ユーザー検索 |
| Session | expiresAt | Index | 有効期限チェック |
| Product | id | Primary | 識別子 |
| Product | status | Index | 公開商品フィルタ |
| Cart | userId | Unique | ユーザーごとに1カート |
| Order | userId | Index | ユーザーの注文履歴 |
| Order | status | Index | ステータス別検索 |
| AuditLog | actorId | Index | 実行者別検索 |
| AuditLog | timestamp | Index | 日時検索 |
