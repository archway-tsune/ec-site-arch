# Tasks: サンプル画面と本番画面の完全分離

**Input**: Design documents from `/specs/007-separate-sample-production/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: ブランチ作成と基本構造の準備

- [ ] T001 ブランチ `007-separate-sample-production` を作成し、`main` から分岐する

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ドメインスタブ・エラー型・ミドルウェアなど、全ユーザーストーリーの前提となる基盤変更

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの作業は開始できない

- [ ] T002 [P] `src/foundation/errors/types.ts` の `ErrorCode` に `NOT_IMPLEMENTED` を追加し、`ErrorCodeToHttpStatus` に 501、`DefaultErrorMessages` に「ドメイン未実装です」を追加する
- [ ] T003 [P] `src/domains/catalog/api/index.ts` を `@/samples/` 再エクスポートから `NotImplementedError` スタブ実装に置き換える。`NotImplementedError` クラスはファイル内に定義する（data-model.md 参照）。エクスポート: `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`, `NotFoundError`
- [ ] T004 [P] `src/domains/cart/api/index.ts` を `@/samples/` 再エクスポートから `NotImplementedError` スタブ実装に置き換える。エクスポート: `getCart`, `addToCart`, `updateCartItem`, `removeFromCart`, `NotFoundError`, `CartItemNotFoundError`
- [ ] T005 [P] `src/domains/orders/api/index.ts` を `@/samples/` 再エクスポートから `NotImplementedError` スタブ実装に置き換える。エクスポート: `getOrders`, `getOrderById`, `createOrder`, `updateOrderStatus`, `NotFoundError`, `EmptyCartError`, `InvalidStatusTransitionError`
- [ ] T006 [P] `src/domains/catalog/ui/index.ts` を `@/samples/` 再エクスポートから「ドメイン未実装」プレースホルダーコンポーネントに置き換える。エクスポート: `ProductList`, `ProductDetail`
- [ ] T007 [P] `src/domains/cart/ui/index.ts` を `@/samples/` 再エクスポートから「ドメイン未実装」プレースホルダーコンポーネントに置き換える。エクスポート: `CartView`
- [ ] T008 [P] `src/domains/orders/ui/index.ts` を `@/samples/` 再エクスポートから「ドメイン未実装」プレースホルダーコンポーネントに置き換える。エクスポート: `OrderList`, `OrderDetail`
- [ ] T009 `src/app/middleware.ts` を更新: `PUBLIC_PATHS` に `/sample/login`, `/sample/api/auth/login` を追加、`ADMIN_PATHS` に `/sample/admin` を追加。サンプルパス（`/sample/` で始まるパス）からの未認証リダイレクト先を `/sample/login` にする（現在の挙動と同様に buyer/admin 共通で `/sample/login` へリダイレクト。admin ログインページへは `/sample/admin/login` リンクから直接遷移する）

**Checkpoint**: ドメインスタブ・ミドルウェア基盤完了。本番パスは 501/プレースホルダー表示、サンプルパスの認証対応済み

---

## Phase 3: User Story 1 - 本番デプロイ後にサンプル画面が動作しない (Priority: P1) 🎯 MVP

**Goal**: 本番パスのページとAPI Routesがサンプル実装を一切利用せず、「ドメイン未実装」を表示する

**Independent Test**: 全本番URLパスにアクセスし、サンプルデータ・UIが表示されないことを確認

### Implementation for User Story 1

- [ ] T010 [P] [US1] `src/app/page.tsx` を本番スキャフォールドに置き換える。「ドメイン未実装」メッセージのみ表示する最小限のUI。`@/samples/` への参照を完全に除去する
- [ ] T011 [P] [US1] `src/app/login/page.tsx` は基盤機能（`@/infrastructure/` のみ依存）のため現状維持。`@/samples/` への依存がないことを確認する
- [ ] T012 [P] [US1] `src/app/(buyer)/layout.tsx` を本番スキャフォールドに置き換える。ナビゲーションリンクはコメントアウト（ドメイン実装後に有効化する前提）。`@/domains/` のUIスタブを利用せず、Header の cartUrl/homeUrl 等は本番パスを使用
- [ ] T013 [P] [US1] `src/app/(buyer)/catalog/page.tsx` を本番スキャフォールドに置き換える。`@/domains/catalog/ui` の `ProductList` プレースホルダーを表示
- [ ] T014 [P] [US1] `src/app/(buyer)/catalog/[id]/page.tsx` を本番スキャフォールドに置き換える。`@/domains/catalog/ui` の `ProductDetail` プレースホルダーを表示
- [ ] T015 [P] [US1] `src/app/(buyer)/cart/page.tsx` を本番スキャフォールドに置き換える。`@/domains/cart/ui` の `CartView` プレースホルダーを表示
- [ ] T016 [P] [US1] `src/app/(buyer)/checkout/page.tsx` を本番スキャフォールドに置き換える。「ドメイン未実装」メッセージのみ表示
- [ ] T017 [P] [US1] `src/app/(buyer)/orders/page.tsx` を本番スキャフォールドに置き換える。`@/domains/orders/ui` の `OrderList` プレースホルダーを表示
- [ ] T018 [P] [US1] `src/app/(buyer)/orders/[id]/page.tsx` を本番スキャフォールドに置き換える。`@/domains/orders/ui` の `OrderDetail` プレースホルダーを表示
- [ ] T019 [P] [US1] `src/app/admin/layout.tsx` を本番スキャフォールドに置き換える。サイドバーのナビゲーションリンクはコメントアウト（ドメイン実装後に有効化する前提）
- [ ] T020 [P] [US1] `src/app/admin/page.tsx` を本番スキャフォールドに置き換える。「ドメイン未実装」メッセージのみ表示
- [ ] T021 [P] [US1] `src/app/admin/login/page.tsx` は基盤機能（`@/infrastructure/` のみ依存）のため現状維持。`@/samples/` への依存がないことを確認する
- [ ] T022 [P] [US1] `src/app/admin/logout/page.tsx` は基盤機能（`@/infrastructure/` のみ依存）のため現状維持。`@/samples/` への依存がないことを確認する
- [ ] T023 [P] [US1] `src/app/admin/products/page.tsx`, `src/app/admin/products/new/page.tsx`, `src/app/admin/products/[id]/edit/page.tsx` を本番スキャフォールドに置き換える。「ドメイン未実装」メッセージのみ表示
- [ ] T024 [P] [US1] `src/app/admin/orders/page.tsx`, `src/app/admin/orders/[id]/page.tsx` を本番スキャフォールドに置き換える。「ドメイン未実装」メッセージのみ表示
- [ ] T025 [US1] 本番API Routes（`src/app/api/catalog/products/route.ts`, `src/app/api/catalog/products/[id]/route.ts`, `src/app/api/cart/route.ts`, `src/app/api/cart/items/route.ts`, `src/app/api/cart/items/[productId]/route.ts`, `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`）の catch ブロックに `NotImplementedError` のハンドリングを追加し、`ErrorCode.NOT_IMPLEMENTED` / 501 レスポンスを返す。500 にフォールバックしないことを確認する

**Checkpoint**: 全本番パスで「ドメイン未実装」表示。本番APIは501を返す。サンプル実装は動作しない

---

## Phase 4: User Story 2 - サンプル画面が独立して動作する (Priority: P2)

**Goal**: サンプル画面を `/sample/` 配下に配置し、全リンク・API呼び出しがサンプルパス内で完結する

**Independent Test**: `/sample/catalog` 等にアクセスし、全リンク・操作がサンプル用パス内で完結することを確認

### Implementation for User Story 2

#### サンプルページの作成

- [ ] T026 [P] [US2] `src/app/(samples)/sample/page.tsx` を作成: 既存 `src/app/page.tsx` の移動前の内容をベースに、全リンクを `/sample/` プレフィックス付きに更新
- [ ] T027 [P] [US2] `src/app/(samples)/sample/login/page.tsx` を作成: 既存ログインページをベースに、フォームのリダイレクト先を `/sample/` プレフィックス付きに更新
- [ ] T028 [P] [US2] `src/app/(samples)/sample/(buyer)/layout.tsx` を作成: 既存購入者レイアウトをベースに、Header の cartUrl=`/sample/cart`, homeUrl=`/sample/`, navLinks のすべてのhrefを `/sample/` プレフィックス付きに更新。API fetchのURLも `/sample/api/` に変更
- [ ] T029 [P] [US2] `src/app/(samples)/sample/(buyer)/catalog/page.tsx` を作成: 既存カタログページをベースに、API fetch先を `/sample/api/catalog/products` に変更、リンクを `/sample/catalog/[id]` に更新。`@/samples/domains/catalog/ui` から `ProductList` を直接インポート
- [ ] T030 [P] [US2] `src/app/(samples)/sample/(buyer)/catalog/[id]/page.tsx` を作成: 既存カタログ詳細ページをベースに、API fetch先を `/sample/api/` に変更。`@/samples/domains/catalog/ui` から `ProductDetail` を直接インポート
- [ ] T031 [P] [US2] `src/app/(samples)/sample/(buyer)/cart/page.tsx` を作成: 既存カートページをベースに、API fetch先を `/sample/api/cart` に変更。`@/samples/domains/cart/ui` から `CartView` を直接インポート
- [ ] T032 [P] [US2] `src/app/(samples)/sample/(buyer)/checkout/page.tsx` を作成: 既存チェックアウトページをベースに、API fetch先を `/sample/api/` に変更
- [ ] T033 [P] [US2] `src/app/(samples)/sample/(buyer)/orders/page.tsx` を作成: 既存注文一覧ページをベースに、API fetch先を `/sample/api/orders` に変更。`@/samples/domains/orders/ui` から直接インポート
- [ ] T034 [P] [US2] `src/app/(samples)/sample/(buyer)/orders/[id]/page.tsx` を作成: 既存注文詳細ページをベースに、API fetch先を `/sample/api/` に変更
- [ ] T035 [P] [US2] `src/app/(samples)/sample/admin/layout.tsx` を作成: 既存管理者レイアウトをベースに、サイドバーの全リンクを `/sample/admin/` プレフィックス付きに更新。loginHref, logoutHref を `/sample/admin/login`, `/sample/admin/logout` に変更
- [ ] T036 [P] [US2] `src/app/(samples)/sample/admin/page.tsx` を作成: 既存管理者ダッシュボードをベースに、API fetch先・リンクを `/sample/` に更新
- [ ] T037 [P] [US2] `src/app/(samples)/sample/admin/login/page.tsx`, `src/app/(samples)/sample/admin/logout/page.tsx` を作成: ログイン/ログアウトページをベースに、リダイレクト先を `/sample/admin` に更新
- [ ] T038 [P] [US2] `src/app/(samples)/sample/admin/products/page.tsx`, `src/app/(samples)/sample/admin/products/new/page.tsx`, `src/app/(samples)/sample/admin/products/[id]/edit/page.tsx` を作成: 商品管理ページをベースに、API fetch先を `/sample/api/catalog/products` に変更、リンクを `/sample/admin/products/` に更新
- [ ] T039 [P] [US2] `src/app/(samples)/sample/admin/orders/page.tsx`, `src/app/(samples)/sample/admin/orders/[id]/page.tsx` を作成: 注文管理ページをベースに、API fetch先を `/sample/api/orders` に変更

#### サンプルAPI Routesの作成

- [ ] T040 [P] [US2] `src/app/(samples)/sample/api/auth/login/route.ts`, `src/app/(samples)/sample/api/auth/logout/route.ts`, `src/app/(samples)/sample/api/auth/session/route.ts` を作成: 既存認証API Routesを複製（`@/infrastructure/` のみ依存のため、import変更なし）
- [ ] T041 [P] [US2] `src/app/(samples)/sample/api/test/reset/route.ts` を作成: 既存テストリセットAPI Routeを複製（`@/infrastructure/` のみ依存のため、import変更なし）
- [ ] T042 [P] [US2] `src/app/(samples)/sample/api/catalog/products/route.ts`, `src/app/(samples)/sample/api/catalog/products/[id]/route.ts` を作成: 既存カタログAPI Routesを複製し、importを `@/domains/catalog/api` → `@/samples/domains/catalog/api` に変更
- [ ] T043 [P] [US2] `src/app/(samples)/sample/api/cart/route.ts`, `src/app/(samples)/sample/api/cart/items/route.ts`, `src/app/(samples)/sample/api/cart/items/[productId]/route.ts` を作成: 既存カートAPI Routesを複製し、importを `@/domains/cart/api` → `@/samples/domains/cart/api` に変更
- [ ] T044 [P] [US2] `src/app/(samples)/sample/api/orders/route.ts`, `src/app/(samples)/sample/api/orders/[id]/route.ts` を作成: 既存注文API Routesを複製し、importを `@/domains/orders/api` → `@/samples/domains/orders/api` に変更

**Checkpoint**: サンプル画面が `/sample/` 配下で独立動作。全リンク・API呼び出しがサンプルパス内で完結

---

## Phase 5: User Story 4 - 既存サンプルテストが継続動作する (Priority: P2)

**Goal**: サンプルE2Eテスト・単体テスト・統合テストがサンプル画面移動後も正常動作する

**Independent Test**: `pnpm test:unit:samples`, `pnpm test:integration:samples`, `pnpm test:e2e:samples` が全パスする

### Implementation for User Story 4

- [ ] T045 [P] [US4] `src/samples/tests/e2e/domains/catalog/buyer-flow.spec.ts` のURL・API パスを `/sample/` プレフィックス付きに更新（`/catalog` → `/sample/catalog`, `/api/catalog/products` → `/sample/api/catalog/products` 等）
- [ ] T046 [P] [US4] `src/samples/tests/e2e/domains/catalog/admin-flow.spec.ts` のURL・API パスを `/sample/` プレフィックス付きに更新（`/admin/products` → `/sample/admin/products` 等）
- [ ] T047 [P] [US4] `src/samples/tests/e2e/domains/cart/buyer-flow.spec.ts` のURL・API パスを `/sample/` プレフィックス付きに更新
- [ ] T048 [P] [US4] `src/samples/tests/e2e/domains/orders/buyer-flow.spec.ts` のURL・API パスを `/sample/` プレフィックス付きに更新
- [ ] T049 [P] [US4] `src/samples/tests/e2e/domains/orders/admin-flow.spec.ts` のURL・API パスを `/sample/` プレフィックス付きに更新
- [ ] T050 [US4] サンプル単体テスト・統合テストがサンプルパス変更の影響を受けないことを確認する。影響がある場合は `/sample/` プレフィックスに対応する更新を実施

**Checkpoint**: 全サンプルテスト（unit, integration, e2e）がパスする

---

## Phase 6: User Story 5 - リリースZIPにサンプルアプリ実装が含まれる (Priority: P2)

**Goal**: リリースZIPに `src/app/(samples)/` が全て含まれ、展開後に `/sample/*` でアクセス可能

**Independent Test**: リリースZIPを生成し、`src/app/(samples)/` のファイルが含まれていることを確認

### Implementation for User Story 5

- [ ] T051 [US5] `.github/workflows/release.yml` の除外リストに `src/app/(samples)/` が含まれていないことを確認する。`src/samples/domains/` および `src/samples/tests/` もZIPに含まれることを確認する（FR-009）。現在の除外設定でサンプルアプリ実装がZIPに含まれる状態であることを検証し、必要に応じて除外パターンを修正する

**Checkpoint**: リリースZIPにサンプルアプリ実装が含まれる

---

## Phase 7: User Story 3 - ドメイン層が本番実装に切り替え可能 (Priority: P3)

**Goal**: ドメインスタブを独自実装に置き換えるだけで本番画面が動作することを検証可能にする

**Independent Test**: quickstart.md の手順に従い、ドメイン層置き換えで本番パスが動作することを確認できる

### Implementation for User Story 3

- [ ] T052 [US3] quickstart.md の内容を検証し、Step 1〜3 の手順がドメインスタブから本番実装への切り替えに対応していることを確認する

**Checkpoint**: ドメイン層のスタブ→本番切り替え手順がドキュメント化され、検証可能

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント更新・コード検証・全体整合性確認

- [ ] T053 [P] `src/domains/README.md` を更新: スタブ実装の説明、`@/samples/` への依存除去の説明、本番実装への置き換え手順（quickstart.md の Step 1〜3 に対応する具体例を含める）
- [ ] T054 [P] `src/samples/README.md` を更新: `/sample/` URL構成の説明、`src/app/(samples)/` ディレクトリの説明、サンプルAPI Routesの説明
- [ ] T055 [P] `docs/GETTING_STARTED.md` を更新: 依存構造図の更新、本番移行手順の追加、サンプル削除手順の追加
- [ ] T056 [P] `CLAUDE.md` を更新: プロジェクト構造の変更反映
- [ ] T057 `src/domains/` 配下の全ファイルに `@/samples/` への import が存在しないことを検証する（SC-005）
- [ ] T058 本番コード（`src/app/` の本番ページ・API Routes、`src/domains/`）が `src/samples/` および `src/app/(samples)/` への依存を持たないことを検証する（FR-014）
- [ ] T059 `src/samples/` と `src/app/(samples)/` を一時的に削除してビルドが成功することを検証する（FR-013）。検証後にファイルを復元する
- [ ] T060 共有レイヤー（`@/contracts/`, `@/templates/`, `@/infrastructure/`, `@/foundation/`）の既存インターフェースが変更されていないことを検証する（FR-012）。`ErrorCode` への値追加は破壊的変更に該当しないことを確認
- [ ] T061 `pnpm build` が成功することを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (domain stubs and middleware must be ready)
- **US2 (Phase 4)**: Depends on Phase 2 (middleware must handle `/sample/` paths)
- **US4 (Phase 5)**: Depends on Phase 4 (sample pages/API routes must exist at `/sample/`)
- **US5 (Phase 6)**: Depends on Phase 4 (sample app files must exist under `(samples)/`)
- **US3 (Phase 7)**: Depends on Phase 2 (domain stubs must be in place)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 2 - No dependencies on US1 (独立した `/sample/` パス)
- **User Story 4 (P2)**: Depends on US2 (E2Eテストはサンプル画面の存在が前提)
- **User Story 5 (P2)**: Depends on US2 (ZIPにサンプルアプリ実装が含まれる前提)
- **User Story 3 (P3)**: Can start after Phase 2 - No dependencies on other stories

### Within Each User Story

- US1: 本番ページ（T010-T024）は全て並列可能。API Route エラーハンドリング（T025）は Phase 2 の T002 完了後に実施
- US2: サンプルページ（T026-T039）とサンプルAPI Routes（T040-T044）は全て並列可能
- US4: E2Eテスト更新（T045-T049）は全て並列可能。T050 は全E2E更新後に実施

### Parallel Opportunities

- Phase 2 の T002-T009 は全て並列可能（異なるファイルを対象とするため）
- Phase 3 の T010-T024 は全て並列可能
- Phase 4 の T026-T044 は全て並列可能
- Phase 5 の T045-T049 は全て並列可能
- Phase 8 の T053-T056 は全て並列可能
- **Phase 3 と Phase 4 は Phase 2 完了後に並列実行可能**（異なるファイルツリーを対象）

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (domain stubs + middleware)
3. Complete Phase 3: User Story 1 (production scaffolds)
4. **STOP and VALIDATE**: 全本番パスで「ドメイン未実装」表示を確認
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → 本番パスのサンプル排除完了 → Deploy/Demo (MVP!)
3. Add US2 → サンプル画面が `/sample/` 配下で独立動作 → Deploy/Demo
4. Add US4 → 全サンプルテストパス → Deploy/Demo
5. Add US5 → リリースZIP検証 → Deploy/Demo
6. Add US3 + Polish → ドキュメント完備 → Final Release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- 本番ページのスキャフォールドは全て同じパターン（「ドメイン未実装」表示）だが、ファイルパスが異なるため個別タスク化
- 認証関連ページ（login, admin/login, admin/logout）は `@/infrastructure/` のみ依存の基盤機能のため、スキャフォールド化せず現状維持
- サンプルページの作成は既存ページのコピー＋リンク/API URL更新が主な作業
- サンプルAPI Routesの作成は既存API Routesのコピー＋import先変更が主な作業
- `NotImplementedError` クラスは各ドメインスタブファイル（T003-T005）内に定義する（data-model.md の例に準拠）
- Commit after each task or logical group
