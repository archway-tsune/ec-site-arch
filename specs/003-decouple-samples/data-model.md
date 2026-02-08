# 依存関係モデル: サンプル・本番分離アーキテクチャ

**日付**: 2026-02-08
**ブランチ**: `003-decouple-samples`

## 概要

本機能は新しいデータエンティティを追加しない内部リファクタリングである。
本ドキュメントでは、変更前後の依存関係を定義する。

## 変更前: 依存関係グラフ

```text
src/app/api/ (7ファイル)
  └──→ @/samples/domains/{domain}/api     ← 直接依存

src/app/(buyer)/ (5ファイル)
  └──→ @/samples/domains/{domain}/ui      ← 直接依存

src/infrastructure/repositories/ (3ファイル)
  └──→ @/samples/domains/{domain}/api/usecases  ← 型の直接依存

src/samples/domains/{domain}/api/usecases
  ├── リポジトリインターフェース定義（インライン）
  ├── ユースケース関数
  └── カスタムエラークラス
```

**問題**: 15ファイルが @/samples/ に直接依存。サンプルの変更・削除で本番が壊れる。

## 変更後: 依存関係グラフ

```text
src/app/api/ (7ファイル)
  └──→ @/domains/{domain}/api             ← 本番ドメイン層を参照

src/app/(buyer)/ (5ファイル)
  └──→ @/domains/{domain}/ui              ← 本番ドメイン層を参照

src/infrastructure/repositories/ (3ファイル)
  └──→ @/contracts/{domain}               ← 共有契約を参照

src/contracts/{domain}
  ├── DTOスキーマ（既存・変更なし）
  └── リポジトリインターフェース（新規追加）

src/domains/{domain}/api/index.ts         ← 暫定スキャフォールド
  └──→ @/samples/domains/{domain}/api     （再エクスポート）

src/domains/{domain}/ui/index.ts          ← 暫定スキャフォールド
  └──→ @/samples/domains/{domain}/ui      （再エクスポート）

src/samples/domains/{domain}/api/usecases
  └──→ @/contracts/{domain}               ← 共有契約からインターフェースを参照
```

**改善点**:
- src/app/ と src/infrastructure/ は @/samples/ に直接依存しない
- @/samples/ への依存は src/domains/ の暫定スキャフォールドに局所化
- 本番実装でスキャフォールドを置き換えれば、@/samples/ への依存を完全に解消可能

## 追加するリポジトリインターフェース

### src/contracts/catalog.ts に追加

| インターフェース | メソッド | 引数 | 戻り値 |
|----------------|---------|------|--------|
| ProductRepository | findAll | { status?, offset, limit } | Promise\<Product[]\> |
| | findById | id: string | Promise\<Product \| null\> |
| | create | Omit\<Product, 'id' \| 'createdAt' \| 'updatedAt'\> | Promise\<Product\> |
| | update | id: string, data: Partial\<...\> | Promise\<Product\> |
| | delete | id: string | Promise\<void\> |
| | count | status?: ProductStatus | Promise\<number\> |

### src/contracts/cart.ts に追加

| インターフェース | メソッド | 引数 | 戻り値 |
|----------------|---------|------|--------|
| CartRepository | findByUserId | userId: string | Promise\<Cart \| null\> |
| | create | userId: string | Promise\<Cart\> |
| | addItem | userId: string, item: Omit\<CartItem, 'addedAt'\> | Promise\<Cart\> |
| | updateItemQuantity | userId, productId, quantity | Promise\<Cart\> |
| | removeItem | userId, productId | Promise\<Cart\> |
| ProductFetcher | findById | productId: string | Promise\<{ id, name, price, imageUrl? } \| null\> |

### src/contracts/orders.ts に追加

| インターフェース | メソッド | 引数 | 戻り値 |
|----------------|---------|------|--------|
| OrderRepository | findAll | { userId?, status?, offset, limit } | Promise\<Order[]\> |
| | findById | id: string | Promise\<Order \| null\> |
| | create | Omit\<Order, 'id' \| 'createdAt' \| 'updatedAt'\> | Promise\<Order\> |
| | updateStatus | id: string, status: OrderStatus | Promise\<Order\> |
| | count | { userId?, status? } | Promise\<number\> |
| CartFetcher | getByUserId | userId: string | Promise\<Cart \| null\> |
| | clear | userId: string | Promise\<void\> |

## 依存関係のバリデーションルール

- **R-001**: src/app/ 配下のファイルは @/samples/ を import しないこと
- **R-002**: src/infrastructure/ 配下のファイルは @/samples/ を import しないこと
- **R-003**: src/contracts/ は src/samples/ に依存しないこと（循環依存防止）
- **R-004**: src/domains/ の暫定スキャフォールドは @/samples/ の再エクスポートのみ行うこと
- **R-005**: src/samples/ のユースケースファイルは @/contracts/ からリポジトリインターフェースを import すること
