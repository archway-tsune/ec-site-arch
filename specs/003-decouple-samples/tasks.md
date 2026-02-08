# タスク: サンプル・本番分離アーキテクチャ

**入力**: `specs/003-decouple-samples/` のデザインドキュメント
**前提**: plan.md, spec.md, research.md, data-model.md, contracts/

**テスト**: 本機能はリファクタリングのため新規テストは作成しない。各チェックポイントで既存テスト（型チェック・単体・統合・E2E）の通過を確認する。

**構成**: タスクはユーザーストーリー別に整理され、各ストーリーを独立して実装・検証できる。

## フォーマット: `[ID] [P?] [Story] 説明`

- **[P]**: 並行実行可能（異なるファイル、依存なし）
- **[Story]**: 所属するユーザーストーリー（例: US1, US2, US3）
- 説明に正確なファイルパスを含む

---

## Phase 1: 基盤構築 — US1 リポジトリインターフェースの共有契約への集約 (P1) 🎯 MVP

**目標**: リポジトリインターフェースを共有契約層に集約し、インフラ層とサンプルのユースケースファイルからの @/samples/ 直接依存を排除する

**独立テスト**: `pnpm typecheck` と `pnpm test:unit` が通ること。src/infrastructure/repositories/ 配下に @/samples/ への import が0件であること

**⚠️ 重要**: 後続の全ユーザーストーリーはこのフェーズの完了を前提とする

### 共有契約へのインターフェース追加

- [x] T001 [P] [US1] src/contracts/catalog.ts にProductRepository インターフェースを追加する（contracts/repository-interfaces.md の定義に従う。既存DTOスキーマは変更しない）
- [x] T002 [P] [US1] src/contracts/cart.ts にCartRepository, ProductFetcher インターフェースを追加する（contracts/repository-interfaces.md の定義に従う。既存DTOスキーマは変更しない）
- [x] T003 [P] [US1] src/contracts/orders.ts にOrderRepository, CartFetcher インターフェースを追加する（contracts/repository-interfaces.md の定義に従う。CartFetcher が参照する Cart 型は @/contracts/cart から import する。既存DTOスキーマは変更しない）

### サンプルのインターフェース参照先を共有契約に変更

- [x] T004 [P] [US1] src/samples/domains/catalog/api/usecases.ts のインライン ProductRepository 定義を削除し、@/contracts/catalog からの import に置き換える（再エクスポートを維持し、既存の外部参照を壊さない）
- [x] T005 [P] [US1] src/samples/domains/cart/api/usecases.ts のインライン CartRepository, ProductFetcher 定義を削除し、@/contracts/cart からの import に置き換える（再エクスポートを維持し、既存の外部参照を壊さない）
- [x] T006 [P] [US1] src/samples/domains/orders/api/usecases.ts のインライン OrderRepository, CartFetcher 定義を削除し、@/contracts/orders からの import に置き換える（再エクスポートを維持し、既存の外部参照を壊さない）

### インフラ層の参照先を共有契約に変更

- [x] T007 [P] [US1] src/infrastructure/repositories/product.ts の import を @/samples/domains/catalog/api/usecases から @/contracts/catalog に変更する（type { ProductRepository } のみ）
- [x] T008 [P] [US1] src/infrastructure/repositories/cart.ts の import を @/samples/domains/cart/api/usecases から @/contracts/cart に変更する（type { CartRepository, ProductFetcher } のみ）
- [x] T009 [P] [US1] src/infrastructure/repositories/order.ts の import を @/samples/domains/orders/api/usecases から @/contracts/orders に変更する（type { OrderRepository, CartFetcher } のみ）

### 検証

- [x] T010 [US1] 型チェックと単体テストを実行して基盤構築の完了を検証する（pnpm typecheck && pnpm test:unit）

**チェックポイント**: src/infrastructure/repositories/ 配下に @/samples/ への直接 import が0件であること。既存テストがすべて通ること。

---

## Phase 2: US2 — APIルートの参照先分離 (P2)

**目標**: 7つのAPIルートファイルの import 先を @/samples/domains/ から @/domains/ に変更し、暫定スキャフォールドで既存動作を維持する

**独立テスト**: `pnpm typecheck` と `pnpm test:unit` と `pnpm test:integration` が通ること。src/app/api/ 配下に @/samples/ への import が0件であること

### API暫定スキャフォールドの作成

- [x] T011 [P] [US2] src/domains/catalog/api/index.ts を作成し、@/samples/domains/catalog/api から getProducts, getProductById, createProduct, updateProduct, deleteProduct, NotFoundError を名前付き再エクスポートする
- [x] T012 [P] [US2] src/domains/cart/api/index.ts を作成し、@/samples/domains/cart/api から getCart, addToCart, updateCartItem, removeFromCart, NotFoundError, CartItemNotFoundError を名前付き再エクスポートする
- [x] T013 [P] [US2] src/domains/orders/api/index.ts を作成し、@/samples/domains/orders/api から getOrders, getOrderById, createOrder, updateOrderStatus, NotFoundError, EmptyCartError, InvalidStatusTransitionError を名前付き再エクスポートする

### APIルートの import 先変更

- [x] T014 [P] [US2] src/app/api/catalog/products/route.ts の import を @/samples/domains/catalog/api から @/domains/catalog/api に変更する
- [x] T015 [P] [US2] src/app/api/catalog/products/[id]/route.ts の import を @/samples/domains/catalog/api から @/domains/catalog/api に変更する
- [x] T016 [P] [US2] src/app/api/cart/route.ts の import を @/samples/domains/cart/api から @/domains/cart/api に変更する
- [x] T017 [P] [US2] src/app/api/cart/items/route.ts の import を @/samples/domains/cart/api から @/domains/cart/api に変更する
- [x] T018 [P] [US2] src/app/api/cart/items/[productId]/route.ts の import を @/samples/domains/cart/api から @/domains/cart/api に変更する
- [x] T019 [P] [US2] src/app/api/orders/route.ts の import を @/samples/domains/orders/api から @/domains/orders/api に変更する
- [x] T020 [P] [US2] src/app/api/orders/[id]/route.ts の import を @/samples/domains/orders/api から @/domains/orders/api に変更する

### 検証

- [x] T021 [US2] 型チェック・単体テスト・統合テストを実行してAPIルート分離の完了を検証する（pnpm typecheck && pnpm test:unit && pnpm test:integration）

**チェックポイント**: src/app/api/ 配下に @/samples/ への直接 import が0件であること。既存のAPI動作が維持されていること。

---

## Phase 3: US3 — ページコンポーネントの参照先分離 (P3)

**目標**: 5つのページファイルの import 先を @/samples/domains/ から @/domains/ に変更し、暫定スキャフォールドで既存表示を維持する

**独立テスト**: `pnpm typecheck` と `pnpm test:e2e` が通ること。src/app/(buyer)/ 配下に @/samples/ への import が0件であること

### UI暫定スキャフォールドの作成

- [x] T022 [P] [US3] src/domains/catalog/ui/index.ts を作成し、@/samples/domains/catalog/ui/ProductList から ProductList を、@/samples/domains/catalog/ui/ProductDetail から ProductDetail を名前付き再エクスポートする
- [x] T023 [P] [US3] src/domains/cart/ui/index.ts を作成し、@/samples/domains/cart/ui/CartView から CartView を名前付き再エクスポートする
- [x] T024 [P] [US3] src/domains/orders/ui/index.ts を作成し、@/samples/domains/orders/ui/OrderList から OrderList を、@/samples/domains/orders/ui/OrderDetail から OrderDetail を名前付き再エクスポートする

### ページの import 先変更

- [x] T025 [P] [US3] src/app/(buyer)/catalog/page.tsx の import を @/samples/domains/catalog/ui/ProductList から @/domains/catalog/ui に変更する
- [x] T026 [P] [US3] src/app/(buyer)/catalog/[id]/page.tsx の import を @/samples/domains/catalog/ui/ProductDetail から @/domains/catalog/ui に変更する
- [x] T027 [P] [US3] src/app/(buyer)/cart/page.tsx の import を @/samples/domains/cart/ui/CartView から @/domains/cart/ui に変更する
- [x] T028 [P] [US3] src/app/(buyer)/orders/page.tsx の import を @/samples/domains/orders/ui/OrderList から @/domains/orders/ui に変更する
- [x] T029 [P] [US3] src/app/(buyer)/orders/[id]/page.tsx の import を @/samples/domains/orders/ui/OrderDetail から @/domains/orders/ui に変更する

### 検証

- [x] T030 [US3] 型チェックとE2Eテストを実行してページ分離の完了を検証する（pnpm typecheck && pnpm test:e2e）

**チェックポイント**: src/app/(buyer)/ 配下に @/samples/ への直接 import が0件であること。既存の画面表示が維持されていること。

---

## Phase 4: US4 — リリースZIPへのテスト同梱 (P4)

**目標**: リリースZIPにアーキテクチャE2Eテストファイルを参照用として同梱し、playwright.arch.config.ts は除外のまま維持する

**独立テスト**: 生成されたZIPにtests/e2e/arch/のファイルが含まれ、playwright.arch.config.tsが含まれていないことを確認する

- [x] T031 [US4] scripts/create-release-zip.ps1 の $excludeDirs リストから 'tests\e2e\arch' と 'tests/e2e/arch' の2エントリを削除する（playwright.arch.config.ts は $excludeFiles に残す）
- [x] T032 [US4] リリースZIPを生成し、tests/e2e/arch/ のテストファイルが含まれていること、playwright.arch.config.ts が含まれていないことを確認する

**チェックポイント**: ZIPに含まれるテストファイルが参照専用であること（playwright.arch.config.ts の不在によりCIで実行されない）。

---

## Phase 5: US5 — ドキュメント・入力例の更新 (P5)

**目標**: プロジェクトドキュメントと機能入力例を新しいアーキテクチャ構造に合わせて更新する

**独立テスト**: ドキュメント内の開発手順で @/samples/ を直接参照する記述が残っていないことをテキスト検索で確認する

### プロジェクトドキュメントの更新

- [x] T033 [P] [US5] README.md のプロジェクト構成図・依存関係の説明を新構造（@/domains/ 起点、共有契約層の活用）に合わせて更新する
- [x] T034 [P] [US5] docs/GETTING_STARTED.md の開発手順の参照先を @/domains/ ベースに変更する
- [x] T035 [P] [US5] docs/SPECKIT_INTEGRATION.md の Speckit ワークフローの説明を新構造に合わせて更新する
- [x] T036 [P] [US5] src/domains/README.md を更新し、暫定スキャフォールドの存在と本番実装への置き換え手順を記述する
- [x] T037 [P] [US5] src/samples/README.md を更新し、サンプルが独立した参照専用である旨を明記する
- [x] T038 [P] [US5] scripts/README.md を更新し、リリースZIPの同梱内容の変更（tests/e2e/arch/ の追加）を反映する
- [x] T039 [P] [US5] specs/001-ec-arch-foundation/quickstart.md のクイックスタートの参照パスを @/domains/ ベースに更新する

### 機能入力例の更新

- [x] T040 [P] [US5] docs/examples/constitution-example.md の実装ワークフローの説明を新構造に合わせて更新する
- [x] T041 [P] [US5] docs/examples/spec-catalog-example.md の plan 入力の参照先を @/domains/ の暫定スキャフォールドをベースにした本番実装に変更する
- [x] T042 [P] [US5] docs/examples/spec-cart-example.md の plan 入力の参照先を @/domains/ の暫定スキャフォールドをベースにした本番実装に変更する
- [x] T043 [P] [US5] docs/examples/spec-order-example.md の plan 入力の参照先を @/domains/ の暫定スキャフォールドをベースにした本番実装に変更する
- [x] T044 [P] [US5] docs/examples/spec-product-example.md の plan 入力の参照先を @/domains/ の暫定スキャフォールドをベースにした本番実装に変更する

**チェックポイント**: 全ドキュメント・入力例が新構造を反映していること。

---

## Phase 6: 最終検証

**目的**: 全ユーザーストーリーの統合検証と成功基準の達成確認

- [x] T045 全テストスイートを実行して回帰がないことを確認する（pnpm typecheck && pnpm test:unit && pnpm test:integration && pnpm test:e2e）
- [x] T046 src/app/ と src/infrastructure/ 配下の全ファイルで @/samples/ への直接 import が0件であることを grep で確認する（SC-001）

---

## 依存関係と実行順序

### フェーズ依存関係

- **Phase 1 (US1 基盤構築)**: 依存なし — 即座に開始可能。**後続の全フェーズをブロックする**
- **Phase 2 (US2 APIルート)**: Phase 1 の完了に依存
- **Phase 3 (US3 ページ)**: Phase 1 の完了に依存（US2 とは独立、並行実行可能）
- **Phase 4 (US4 リリースZIP)**: Phase 1〜3 とは独立 — 任意のタイミングで実行可能
- **Phase 5 (US5 ドキュメント)**: Phase 1〜3 の完了に依存（新構造の確定後に更新）
- **Phase 6 (最終検証)**: 全フェーズの完了に依存

### ユーザーストーリー依存関係

- **US1 (P1)**: 依存なし — 他のすべてのストーリーの前提条件
- **US2 (P2)**: US1 に依存 — US3 とは独立して実装・テスト可能
- **US3 (P3)**: US1 に依存 — US2 とは独立して実装・テスト可能
- **US4 (P4)**: 他のストーリーに依存しない — 独立して実装可能
- **US5 (P5)**: US1〜US3 に依存 — コード変更確定後に実施

### 並行実行の機会

- Phase 1 内: T001〜T003（契約追加）、T004〜T006（サンプル変更）、T007〜T009（インフラ変更）が各グループ内で並行可能
- Phase 2 内: T011〜T013（スキャフォールド作成）、T014〜T020（ルート変更）が各グループ内で並行可能
- Phase 3 内: T022〜T024（スキャフォールド作成）、T025〜T029（ページ変更）が各グループ内で並行可能
- Phase 2 と Phase 3: Phase 1 完了後に並行して実行可能
- Phase 4: 他のフェーズと完全に独立して並行実行可能
- Phase 5 内: T033〜T044 の全ドキュメント更新タスクが並行可能

---

## 並行実行例: Phase 1 (US1)

```bash
# グループ1: 契約ファイルへのインターフェース追加（並行）
Task T001: "src/contracts/catalog.ts にProductRepository追加"
Task T002: "src/contracts/cart.ts にCartRepository, ProductFetcher追加"
Task T003: "src/contracts/orders.ts にOrderRepository, CartFetcher追加"

# グループ2: サンプルのインターフェース参照先変更（並行、T001〜T003完了後）
Task T004: "src/samples/domains/catalog/api/usecases.ts の参照先変更"
Task T005: "src/samples/domains/cart/api/usecases.ts の参照先変更"
Task T006: "src/samples/domains/orders/api/usecases.ts の参照先変更"

# グループ3: インフラ層の参照先変更（並行、T001〜T003完了後）
Task T007: "src/infrastructure/repositories/product.ts の参照先変更"
Task T008: "src/infrastructure/repositories/cart.ts の参照先変更"
Task T009: "src/infrastructure/repositories/order.ts の参照先変更"
```

## 並行実行例: Phase 2+3 (US2+US3 並行)

```bash
# US2 と US3 を Phase 1 完了後に同時開始
# US2: APIスキャフォールド作成 + ルート変更
Task T011〜T013: "API暫定スキャフォールド作成（並行）"
Task T014〜T020: "APIルート import 先変更（並行）"

# US3: UIスキャフォールド作成 + ページ変更（US2と独立して並行）
Task T022〜T024: "UI暫定スキャフォールド作成（並行）"
Task T025〜T029: "ページ import 先変更（並行）"
```

---

## 実装戦略

### MVP ファースト（US1 のみ）

1. Phase 1 (US1) を完了 → 型チェック・単体テスト通過を確認
2. **中断・検証可能**: インフラ層の分離が完了し、共有契約が Single Source of Truth として機能
3. この時点でサンプルの型定義が共有契約に集約され、以降の分離作業の基盤が確立

### 段階的デリバリー

1. Phase 1 (US1) → 基盤確立 ✓
2. Phase 2 (US2) + Phase 3 (US3) → 並行実行 → APIルート・ページ分離完了 ✓
3. Phase 4 (US4) → リリースZIP更新 ✓（任意のタイミングで実行可能）
4. Phase 5 (US5) → ドキュメント更新 ✓
5. Phase 6 → 最終検証 ✓
6. 各フェーズ完了後に独立して検証・デモ可能

---

## 備考

- [P] タスク = 異なるファイルへの変更、依存なし
- [Story] ラベルは spec.md のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了・テスト可能
- 各タスク完了後にコミットを推奨
- チェックポイントで中断し、ストーリーを独立して検証可能
