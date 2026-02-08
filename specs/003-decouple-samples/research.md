# 研究結果: サンプル・本番分離アーキテクチャ

**日付**: 2026-02-08
**ブランチ**: `003-decouple-samples`

## 決定事項 1: リポジトリインターフェースの配置方法

**決定**: 既存の契約ファイル（catalog.ts, cart.ts, orders.ts）にリポジトリインターフェースを追加する

**根拠**:
- 各契約ファイルは既にドメイン別に分離されており、DTOスキーマとリポジトリインターフェースは同じドメインに属する
- 新規ファイルを作成するよりも、既存ファイルに追加する方がシンプル
- DTOの型（Product, Cart, Order等）をリポジトリインターフェースが参照するため、同一ファイルにあると import が不要

**検討した代替案**:
- 別ファイル（contracts/repositories/catalog.ts 等）に分離 → DTOへの import が増えるだけで利点なし
- contracts/repositories.ts に全ドメイン集約 → ドメイン分離の原則に反する

## 決定事項 2: 暫定スキャフォールドの実装パターン

**決定**: `src/domains/{domain}/api/index.ts` と `src/domains/{domain}/ui/index.ts` でサンプルからの名前付き再エクスポートを行う

**根拠**:
- 再エクスポート（`export { fn } from '@/samples/...'`）はコードの複製を避けつつ、import パスの一元化を実現する
- 本番実装に置き換える際は、再エクスポートを実装コードに置き換えるだけでよい
- APIルート・ページ側の import パスは変更不要（`@/domains/{domain}/api` を維持）
- Tree Shaking は再エクスポートでも正常に機能する（名前付きエクスポートのため）

**検討した代替案**:
- サンプルコードのコピー → コード重複が発生し、サンプル更新時に乖離する
- TypeScript path alias でリダイレクト → import パスが実際のファイル構造と一致せず混乱を招く
- barrel ファイルで全エクスポート（`export * from`）→ 不要なエクスポートが公開されるリスク

## 決定事項 3: サンプルのリポジトリインターフェース移動方法

**決定**: サンプルのユースケースファイルからインターフェース定義を削除し、共有契約からの import に置き換える

**根拠**:
- 型の定義が一箇所（src/contracts/）に集約され、Single Source of Truth が実現する
- サンプルのユースケースファイルの振る舞いは変わらない（同じインターフェースを参照するため）
- インフラ層もサンプルのユースケースではなく共有契約を直接参照できるようになる

**検討した代替案**:
- インターフェースをサンプルにも残して二重定義 → 型の不整合リスク、保守負荷の増大
- サンプルは変更せず、共有契約にはコピーを配置 → 同じ問題（二重定義）

## 決定事項 4: ドメインスキャフォールドのエクスポート対象

**決定**: 各ドメインの API index.ts と UI index.ts で、現在 APIルート・ページが実際に使用しているエクスポートのみを再エクスポートする

**根拠**:
- 必要最小限のエクスポートにより、暫定スキャフォールドの意図が明確になる
- 本番実装時に置き換えるべき関数・コンポーネントの一覧がそのまま index.ts で把握できる

**具体的なエクスポート対象**:

| ドメイン | API エクスポート | UI エクスポート |
|---------|-----------------|----------------|
| catalog | getProducts, getProductById, createProduct, updateProduct, deleteProduct, NotFoundError | ProductList, ProductDetail |
| cart | getCart, addToCart, updateCartItem, removeFromCart, NotFoundError, CartItemNotFoundError | CartView |
| orders | getOrders, getOrderById, createOrder, updateOrderStatus, NotFoundError, EmptyCartError, InvalidStatusTransitionError | OrderList, OrderDetail |

## 決定事項 5: リリースZIPのテスト同梱方法

**決定**: create-release-zip.ps1 の除外リストから `tests/e2e/arch` と `tests\e2e\arch` を削除する（playwright.arch.config.ts は除外のまま維持）

**根拠**:
- 除外リストからの削除のみでテストファイルがZIPに含まれる
- playwright.arch.config.ts を除外のまま維持することで、CI の条件判定（config の存在チェック）により ZIP 展開先ではアーキテクチャE2Eが実行されない
- アーキテクチャリポジトリではconfig が存在するため、PRでのE2E実行は維持される

**検討した代替案**:
- CI ワークフロー側で条件を変更 → 既存の判定ロジックが機能しているため不要な変更
