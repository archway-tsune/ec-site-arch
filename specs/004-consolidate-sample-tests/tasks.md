# Tasks: サンプルテストの集約・再構成

**Input**: Design documents from `/specs/004-consolidate-sample-tests/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: テスト内容の変更はスコープ外。既存テストの移動・分解・設定変更のみ。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: ベースライン記録と移動先ディレクトリの作成

- [x] T001 テスト数のベースラインを記録する（`pnpm test:unit:samples` 相当のテスト数、`pnpm test:integration:samples` 相当のテスト数、`pnpm test:e2e:arch` のテスト数を記録）
- [x] T002 移動先ディレクトリ構造を作成する（`src/samples/tests/unit/domains/{catalog,cart,orders}`, `src/samples/tests/integration/domains/{catalog,cart,orders}`, `src/samples/tests/e2e/domains/{catalog,cart,orders}`）

---

## Phase 2: User Story 1 - 単体・統合テストの集約移動 (Priority: P1) 🎯 MVP

**Goal**: 9ファイルのドメインテストを `src/samples/tests/` に集約し、import パスをエイリアスに変更する

**Independent Test**: `pnpm test:unit:samples` と `pnpm test:integration:samples` でテスト数がベースラインと一致し、すべてパスすること

### Catalog ドメイン

- [x] T003 [P] [US1] 単体テストを移動する `src/samples/domains/catalog/tests/unit/usecase.test.ts` → `src/samples/tests/unit/domains/catalog/usecase.test.ts`、import パスを `../../api/usecases` から `@/samples/domains/catalog/api/usecases` に変更
- [x] T004 [P] [US1] UIテストを移動する `src/samples/domains/catalog/tests/unit/ui.test.tsx` → `src/samples/tests/unit/domains/catalog/ui.test.tsx`、import パスを `../../ui/ProductList`, `../../ui/ProductDetail`, `../../ui/ProductCard` から `@/samples/domains/catalog/ui/ProductList`, `@/samples/domains/catalog/ui/ProductDetail`, `@/samples/domains/catalog/ui/ProductCard` に変更
- [x] T005 [P] [US1] 統合テストを移動する `src/samples/domains/catalog/tests/integration/api.test.ts` → `src/samples/tests/integration/domains/catalog/api.test.ts`、import パスを `../../api/usecases` から `@/samples/domains/catalog/api/usecases` に変更

### Cart ドメイン

- [x] T006 [P] [US1] 単体テストを移動する `src/samples/domains/cart/tests/unit/usecase.test.ts` → `src/samples/tests/unit/domains/cart/usecase.test.ts`、import パスを `../../api/usecases` から `@/samples/domains/cart/api/usecases` に変更
- [x] T007 [P] [US1] UIテストを移動する `src/samples/domains/cart/tests/unit/ui.test.tsx` → `src/samples/tests/unit/domains/cart/ui.test.tsx`、import パスを `../../ui/CartView` から `@/samples/domains/cart/ui/CartView` に変更
- [x] T008 [P] [US1] 統合テストを移動する `src/samples/domains/cart/tests/integration/api.test.ts` → `src/samples/tests/integration/domains/cart/api.test.ts`、import パスを `../../api/usecases` から `@/samples/domains/cart/api/usecases` に変更

### Orders ドメイン

- [x] T009 [P] [US1] 単体テストを移動する `src/samples/domains/orders/tests/unit/usecase.test.ts` → `src/samples/tests/unit/domains/orders/usecase.test.ts`、import パスを `../../api/usecases` から `@/samples/domains/orders/api/usecases` に変更
- [x] T010 [P] [US1] UIテストを移動する `src/samples/domains/orders/tests/unit/ui.test.tsx` → `src/samples/tests/unit/domains/orders/ui.test.tsx`、import パスを `../../ui/OrderList`, `../../ui/OrderDetail` から `@/samples/domains/orders/ui/OrderList`, `@/samples/domains/orders/ui/OrderDetail` に変更
- [x] T011 [P] [US1] 統合テストを移動する `src/samples/domains/orders/tests/integration/api.test.ts` → `src/samples/tests/integration/domains/orders/api.test.ts`、import パスを `../../api/usecases` から `@/samples/domains/orders/api/usecases` に変更

### クリーンアップ

- [x] T012 [US1] 旧テストディレクトリを削除する（`src/samples/domains/catalog/tests/`, `src/samples/domains/cart/tests/`, `src/samples/domains/orders/tests/`）

### 検証

- [x] T013 [US1] 型チェック（`pnpm typecheck`）がエラー0件で通ることを確認する
- [x] T014 [US1] 移動後のテスト実行（vitest run src/samples/tests/unit && vitest run src/samples/tests/integration）でテスト数がベースラインと一致し、すべてパスすることを確認する

**Checkpoint**: 単体・統合テスト9ファイルが `src/samples/tests/` に集約済み、旧ディレクトリ削除済み

---

## Phase 3: User Story 2 - E2Eテストのドメイン別分解 (Priority: P2)

**Goal**: 2ファイルのE2Eテストをドメイン別に5ファイルに分解し、各ファイルが独立して実行可能にする

**Independent Test**: `playwright test --config playwright.arch.config.ts` でテスト数がベースラインと一致し、すべてパスすること

### 購入者導線の分解

- [x] T015 [P] [US2] catalog の購入者導線E2Eテストを作成する `src/samples/tests/e2e/domains/catalog/buyer-flow.spec.ts`（元の `tests/e2e/arch/buyer-flow.spec.ts` から「商品一覧」2テスト + 「商品詳細」2テスト + 「未ログイン時の動作」1テスト を抽出、`loginAsBuyer` ヘルパーをインラインで含める）
- [x] T016 [P] [US2] cart の購入者導線E2Eテストを作成する `src/samples/tests/e2e/domains/cart/buyer-flow.spec.ts`（元の `tests/e2e/arch/buyer-flow.spec.ts` から「カート」4テスト を抽出、`loginAsBuyer` ヘルパーをインラインで含める）
- [x] T017 [P] [US2] orders の購入者導線E2Eテストを作成する `src/samples/tests/e2e/domains/orders/buyer-flow.spec.ts`（元の `tests/e2e/arch/buyer-flow.spec.ts` から「注文」3テスト + 「一連の購入フロー」1テスト を抽出、`loginAsBuyer` ヘルパーをインラインで含める）

### 管理者導線の分解

- [x] T018 [P] [US2] catalog の管理者導線E2Eテストを作成する `src/samples/tests/e2e/domains/catalog/admin-flow.spec.ts`（元の `tests/e2e/arch/admin-flow.spec.ts` から「商品管理」5テスト + 「一連の管理フロー」1テスト + 「権限確認」2テスト を抽出、`loginAsAdmin` と `loginAsBuyer` ヘルパーをインラインで含める）
- [x] T019 [P] [US2] orders の管理者導線E2Eテストを作成する `src/samples/tests/e2e/domains/orders/admin-flow.spec.ts`（元の `tests/e2e/arch/admin-flow.spec.ts` から「注文管理」4テスト を抽出、`loginAsAdmin`, `loginAsBuyer`, `createOrderAsBuyer` ヘルパーをインラインで含める）

### クリーンアップ

- [x] T020 [US2] 旧E2Eテストディレクトリを削除する（`tests/e2e/arch/`）
- [x] T021 [US2] `playwright.arch.config.ts` の `testDir` を `./src/samples/tests/e2e` に変更する

### 検証

- [x] T022 [US2] 分解後のE2Eテスト実行（`pnpm test:e2e:arch`）でテスト数（25テスト: catalog 13, cart 4, orders 8）がベースラインと一致し、すべてパスすることを確認する

**Checkpoint**: E2Eテスト5ファイルがドメイン別に配置済み、各ファイルが独立実行可能

---

## Phase 4: User Story 3 - サンプルテストの環境別実行制御 (Priority: P3)

**Goal**: デフォルトコマンドでサンプルテスト除外、`:samples` コマンドでサンプル含む実行を実現する

**Independent Test**: `pnpm test:unit` でサンプルテストが0件、`pnpm test:unit:samples` でサンプルテストが実行されること

- [x] T023 [US3] `vitest.config.ts` の `test` セクションに `exclude: ['./src/samples/**/*.test.{ts,tsx}']` を追加する
- [x] T024 [P] [US3] `package.json` に `:samples` コマンドを追加する（`"test:unit:samples": "vitest run src/samples/tests/unit"`, `"test:integration:samples": "vitest run src/samples/tests/integration"`, `"test:e2e:samples": "playwright test --config playwright.arch.config.ts"`）
- [x] T025 [US3] デフォルトコマンド（`pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e`）でサンプルテストが検出されないことを確認する
- [x] T026 [US3] サンプルコマンド（`pnpm test:unit:samples`, `pnpm test:integration:samples`, `pnpm test:e2e:samples`）でサンプルテストが実行され、すべてパスすることを確認する

**Checkpoint**: 環境別実行制御が機能し、デフォルト除外 + 専用コマンドで実行可能

---

## Phase 5: User Story 4 - 設定・ドキュメントの整合性確保 (Priority: P4)

**Goal**: ドキュメントが新しいテスト構造を正確に反映する

**Independent Test**: ドキュメント内のテストパス記述が実際のディレクトリ構成と一致すること

- [x] T027 [P] [US4] `src/samples/README.md` のディレクトリツリーを更新する（テスト構造を `src/samples/tests/` 配下の新構造に変更、テスト実行コマンドの説明を追加）
- [x] T028 [P] [US4] `README.md` のディレクトリ構成図を更新する（`tests/e2e/arch/` の記述を削除し、`src/samples/tests/` の説明を追加）
- [x] T029 [P] [US4] `scripts/README.md` のリリースZIP内容説明を更新する（`tests/e2e/arch/` の記述を `src/samples/tests/` に変更）
- [x] T030 [P] [US4] `docs/SPECKIT_INTEGRATION.md` のテストパス記述を更新する（サンプルテストの新配置先とテストコマンドの説明を反映）
- [x] T030a [P] [US4] `docs/examples/` の入力例を更新する（`constitution-example.md` のテスト除外記述、`spec-{catalog,cart,order,product}-example.md` の `/speckit.plan` 入力からサンプルテスト除外の記述を削除）

**Checkpoint**: すべてのドキュメントが新構造を正確に反映

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 最終検証とクリーンアップ

- [x] T031 型チェック（`pnpm typecheck`）がエラー0件で通ることを最終確認する
- [x] T032 全サンプルテスト（`pnpm test:unit:samples && pnpm test:integration:samples && pnpm test:e2e:samples`）がパスすることを最終確認する
- [x] T033 デフォルトテスト（`pnpm test:unit && pnpm test:integration`）でサンプルテストが検出されないことを最終確認する
- [x] T034 `@/samples/` 以外からサンプルテストへの参照がないことを確認する（grep で検証）
- [x] T035 `tests/e2e/arch/` ディレクトリが削除されていることを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **US1 (Phase 2)**: Depends on Setup (Phase 1) - ディレクトリ作成後に移動開始
- **US2 (Phase 3)**: Depends on Setup (Phase 1) - Phase 2 と並行可能だが、最終的に同じ `src/samples/tests/` 構造に配置
- **US3 (Phase 4)**: Depends on US1 (Phase 2) and US2 (Phase 3) - テストが集約済みでないと除外設定が検証できない
- **US4 (Phase 5)**: Depends on US3 (Phase 4) - ドキュメントは最終的な構造・コマンドを反映する必要がある
- **Polish (Phase 6)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Setup 完了後に開始可能。他ストーリーへの依存なし
- **US2 (P2)**: Setup 完了後に開始可能。US1 と並行実施可能
- **US3 (P3)**: US1 + US2 完了後に開始。テストが集約されていないと除外設定の検証不可
- **US4 (P4)**: US3 完了後に開始。最終的なコマンド名・構造が確定している必要あり

### Within Each User Story

- T003〜T011 はすべて [P] で並行実行可能（異なるファイル）
- T015〜T019 はすべて [P] で並行実行可能（異なるファイル）
- T027〜T030 はすべて [P] で並行実行可能（異なるファイル）

### Parallel Opportunities

```
Phase 1: T001 → T002

Phase 2 (US1):
  ┌─ T003 (catalog unit)
  ├─ T004 (catalog ui)
  ├─ T005 (catalog integration)
  ├─ T006 (cart unit)
  ├─ T007 (cart ui)
  ├─ T008 (cart integration)
  ├─ T009 (orders unit)
  ├─ T010 (orders ui)
  └─ T011 (orders integration)
  → T012 (cleanup) → T013, T014 (verify)

Phase 3 (US2):
  ┌─ T015 (catalog buyer)
  ├─ T016 (cart buyer)
  ├─ T017 (orders buyer)
  ├─ T018 (catalog admin)
  └─ T019 (orders admin)
  → T020, T021 (cleanup + config) → T022 (verify)

Phase 4 (US3): T023 → T024 → T025, T026 (verify)

Phase 5 (US4):
  ┌─ T027 (samples README)
  ├─ T028 (project README)
  ├─ T029 (scripts README)
  └─ T030 (SPECKIT_INTEGRATION)

Phase 6: T031 → T032 → T033 → T034 → T035
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup（ベースライン記録 + ディレクトリ作成）
2. Complete Phase 2: US1（9ファイル移動 + import 変更 + 旧ディレクトリ削除）
3. **STOP and VALIDATE**: typecheck + テスト実行で検証
4. この時点で「サンプル削除時の完結性」という主目的の大部分を達成

### Incremental Delivery

1. US1 完了 → 単体・統合テスト集約済み
2. US2 完了 → E2Eテストもドメイン別に分解・集約済み
3. US3 完了 → デフォルト除外 + 専用コマンドで環境別制御
4. US4 完了 → ドキュメント整合性確保
5. Polish → 最終検証

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- テスト内容・ロジックは変更しない（構造変更のみ）
- E2Eテスト分解時のヘルパー関数は各ファイルにインラインで含める
- `git mv` を使用してファイル移動の履歴を保持する
