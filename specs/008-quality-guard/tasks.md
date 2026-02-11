# Tasks: speckit実装時の品質ガード強化

**Input**: Design documents from `/specs/008-quality-guard/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: MANDATORY — 本機能の constitution（原則 VI）は TDD 必須。各ユーザーストーリーは Red → Green → Refactor → 検証 の 4 ステップで実装する。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: ベースライン確認と前提条件の検証

- [x] T001 既存サンプルテストの全件パスを確認（ベースライン）: `pnpm test:unit:samples && pnpm test:integration:samples && pnpm test:e2e:samples` を実行し、全テストがパスすることを確認する
- [x] T002 [P] 既存 contracts の後方互換性を確認: `src/contracts/catalog.ts` の `ProductSchema` で `description` と `imageUrl` が `.optional()` であることを確認する。`src/contracts/cart.ts` と `src/contracts/orders.ts` も同様に確認する
- [x] T003 [P] TypeScript コンパイルのベースライン確認: `pnpm typecheck` を実行しエラー 0 件であることを確認する

**Checkpoint**: ベースライン確認完了。全テストパス、型チェックパス。

---

## Phase 2: User Story 1 - TDD Red-Green-Refactor ワークフローの徹底 (Priority: P1) 🎯 MVP

**Goal**: タスクテンプレートを Red-Green-Refactor-検証 の 4 ステップ構成に再構成し、テストを MANDATORY 化する。constitution との整合性を回復する。

**Independent Test**: テンプレート内で "OPTIONAL" を検索して 0 件、Red/Green/Refactor/検証 のセクション見出しが存在、constitution の TDD 原則と矛盾がないことを確認する。

### Red: 検証基準の定義 (US1)

- [x] T004 [US1] 現状のタスクテンプレートで OPTIONAL 記述が存在することを確認する（Red 確認）: `.specify/templates/tasks-template.md` を読み込み、"OPTIONAL" が含まれていることを確認する

### Green: 最小実装 (US1)

- [x] T005 [US1] タスクテンプレートを Red-Green-Refactor-検証 4 ステップ構成に再構成する: `.specify/templates/tasks-template.md` を以下の通り修正する — (1) 冒頭の `Tests are OPTIONAL - only include them if explicitly requested` を削除し TDD フローの説明に置換、(2) 各ユーザーストーリーフェーズの `### Tests for User Story N (OPTIONAL - only if tests requested) ⚠️` を `### Red: テスト作成 (MANDATORY)` に変更、(3) `### Implementation for User Story N` を `### Green: 最小実装` に変更、(4) `### Refactor: 改善` セクションを追加（重複排除・命名改善・責務分離、全テストパスを検証）、(5) `### 検証: E2Eテスト実行 + カバレッジ確認` セクションを追加（E2E 実行証跡義務、パス件数 0 件はエラー、`pnpm test:unit --coverage` でカバレッジ 80% 以上確認、外部 URL の HTTP 検証）、(6) Red フェーズのタスク例にユースケース単体テスト・UI コンポーネント単体テスト・API 統合テスト・E2E テストの 4 種別を含める（plan.md D4, R5 参照）
- [x] T006 [US1] ec-site-arch の constitution に品質基準を追加する: `.specify/memory/constitution.md` の `品質基準とゲート` セクションに以下を追加 — (1) E2E テスト証跡義務（テスト実行結果の出力を確認し、パス件数 0 件はエラーとする）、(2) ローカルカバレッジ確認（各ユーザーストーリー完了時に `pnpm test:unit --coverage` を実施し 80% 以上を確認）、(3) 外部リソース検証（実装時に各 URL に HTTP リクエストを送信し 200 応答を確認する。失敗した URL は代替 URL に置換する。plan 時点では検証予定とし、検証済みとしない）。Sync Impact Report の `tasks-template.md: ✅ 整合性確認済み` の虚偽記述を正しい内容に更新する

### Refactor: 改善 (US1)

- [x] T007 [US1] タスクテンプレートと constitution の TDD 記述の整合性を最終確認する: `.specify/templates/tasks-template.md` と `.specify/memory/constitution.md` を通読し、TDD に関する矛盾がないことを確認する。矛盾があれば修正する

### 検証 (US1)

- [x] T008 [US1] タスクテンプレートの OPTIONAL 記述が完全に削除されたことを検証する: `.specify/templates/tasks-template.md` 内で "OPTIONAL" を検索し、テストに関する OPTIONAL 記述が 0 件であることを確認する
- [x] T009 [US1] タスクテンプレートの 4 ステップ構造を検証する: `.specify/templates/tasks-template.md` に `Red: テスト作成`、`Green: 最小実装`、`Refactor: 改善`、`検証:` の 4 セクション見出しが各ユーザーストーリーフェーズに含まれていることを確認する

**Checkpoint**: US1 完了。テンプレートは MANDATORY + 4 ステップ構成。constitution と整合。

---

## Phase 3: User Story 2 - サンプルコードの本番実装からの構造的保護 (Priority: P2)

**Goal**: サンプルテストヘルパーを Schema.parse() ベースに移行し、シードデータをベース/拡張に分離する。contracts に `.default()` 付き新規フィールドを追加してもサンプルテストが修正なしでパスする状態にする。

**Independent Test**: `src/contracts/catalog.ts` の `ProductSchema` にダミーフィールド `stock: z.number().int().min(0).default(0)` を追加し、`pnpm test:unit:samples && pnpm test:integration:samples` が修正なしでパスすることを確認する。

### Red: ベースライン確認 (US2)

- [x] T010 [US2] サンプルテスト全件パスのベースラインを再確認する: `pnpm test:unit:samples && pnpm test:integration:samples` を実行し全テストがパスすることを確認する

### Green: 最小実装 (US2)

- [x] T011 [US2] シードデータを BASE_PRODUCTS / EXTENSION_PRODUCTS に分離する: `src/infrastructure/repositories/product.ts` の `sampleProducts` 配列を `export const BASE_PRODUCTS: Product[]`（既存 6 件をそのまま保持）にリネームし、`export const EXTENSION_PRODUCTS: Product[] = []` を追加する。`initializeProductStore()` を `[...BASE_PRODUCTS, ...EXTENSION_PRODUCTS]` でマージするように変更する。`resetProductStore()` も同様にマージ版でリセットする。JSDoc に「ベースデータは変更禁止、本番追加は EXTENSION_PRODUCTS に追加」と明記する（plan.md D2, data-model.md 参照）
- [x] T012 [P] [US2] Catalog ドメイン単体テストヘルパーを Schema.parse() に移行する: `src/samples/tests/unit/domains/catalog/usecase.test.ts` の `createMockProduct()` を `ProductSchema.parse({ ... })` ベースに変更する。import に `import { ProductSchema } from '@/contracts/catalog'` を追加する（plan.md D3, research.md R2 参照）
- [x] T013 [P] [US2] Catalog ドメイン UI テストヘルパーを Schema.parse() に移行する: `src/samples/tests/unit/domains/catalog/ui.test.tsx` の `createMockProduct()` を `ProductSchema.parse({ ... })` ベースに変更する
- [x] T014 [P] [US2] Catalog ドメイン統合テストヘルパーを Schema.parse() に移行する: `src/samples/tests/integration/domains/catalog/api.test.ts` の `createMockProduct()` を `ProductSchema.parse({ ... })` ベースに変更する
- [x] T015 [P] [US2] Cart ドメイン単体テストヘルパーを Schema.parse() に移行する: `src/samples/tests/unit/domains/cart/usecase.test.ts` の `createMockCart()` を `CartSchema.parse({ ... })` ベースに変更する。import に `import { CartSchema } from '@/contracts/cart'` を追加する
- [x] T016 [P] [US2] Cart ドメイン UI テストヘルパーを Schema.parse() に移行する: `src/samples/tests/unit/domains/cart/ui.test.tsx` の `createMockCart()` を `CartSchema.parse({ ... })` に、`createMockCartItem()` を `CartItemSchema.parse({ ... })` に変更する。import に `import { CartSchema, CartItemSchema } from '@/contracts/cart'` を追加する
- [x] T017 [P] [US2] Cart ドメイン統合テストヘルパーを Schema.parse() に移行する: `src/samples/tests/integration/domains/cart/api.test.ts` の `createMockCart()` を `CartSchema.parse({ ... })` ベースに変更する
- [x] T018 [P] [US2] Orders ドメイン単体テストヘルパーを Schema.parse() に移行する: `src/samples/tests/unit/domains/orders/usecase.test.ts` の `createMockOrder()` を `OrderSchema.parse({ ... })` に、`createMockCart()` を `CartSchema.parse({ ... })` に変更する。import に `import { OrderSchema } from '@/contracts/orders'` と `import { CartSchema } from '@/contracts/cart'` を追加する
- [x] T019 [P] [US2] Orders ドメイン UI テストヘルパーを Schema.parse() に移行する: `src/samples/tests/unit/domains/orders/ui.test.tsx` の `createMockOrder()` を `OrderSchema.parse({ ... })` ベースに変更する
- [x] T020 [P] [US2] Orders ドメイン統合テストヘルパーを Schema.parse() に移行する: `src/samples/tests/integration/domains/orders/api.test.ts` の `createMockOrder()` を `OrderSchema.parse({ ... })` に、`createMockCart()` を `CartSchema.parse({ ... })` に変更する

### Refactor: 改善 (US2)

- [x] T021 [US2] TypeScript コンパイルが成功することを確認する: `pnpm typecheck` を実行し、Schema.parse() 移行とシードデータ分離による型エラーが 0 件であることを確認する

### 検証 (US2)

- [x] T022 [US2] Schema.parse() 移行後にサンプルテスト全件がパスすることを検証する: `pnpm test:unit:samples && pnpm test:integration:samples` を実行し、全テストがパスすることを確認する
- [x] T023 [US2] フィールド追加耐性を検証する: `src/contracts/catalog.ts` の `ProductSchema` に `stock: z.number().int().min(0).default(0)` を一時的に追加し、`pnpm test:unit:samples && pnpm test:integration:samples` が修正なしでパスすることを確認する。確認後、追加したフィールドを削除して元に戻す

**Checkpoint**: US2 完了。サンプルテストヘルパーは Schema.parse() ベース。シードデータは BASE/EXTENSION 分離。フィールド追加耐性確認済み。

---

## Phase 4: User Story 3 - テスト実行・カバレッジの品質ゲート強化 (Priority: P3)

**Goal**: CI パイプラインから `--pass-with-no-tests` を削除し、サンプルリグレッションチェックを追加する。constitution-example に E2E 証跡義務とカバレッジ確認の概要を追加する。

**Independent Test**: `.github/workflows/ci.yml` に `--pass-with-no-tests` が含まれていないこと、`test:unit:samples` と `test:integration:samples` ステップが存在すること、`docs/examples/constitution-example.md` に E2E 証跡とカバレッジの記述があることを確認する。

### Red: 現状の問題確認 (US3)

- [x] T024 [US3] CI の --pass-with-no-tests フラグの存在を確認する（Red 確認）: `.github/workflows/ci.yml` を読み込み、`--pass-with-no-tests` が含まれていることを確認する

### Green: 最小実装 (US3)

- [x] T025 [US3] CI の E2E ジョブから --pass-with-no-tests を削除する: `.github/workflows/ci.yml` の `Run E2E tests` ステップで `pnpm test:e2e --pass-with-no-tests` から `--pass-with-no-tests` を削除し `pnpm test:e2e` にする（plan.md D5, FR-010 参照）
- [x] T026 [US3] CI の quality ジョブにサンプルリグレッションチェックを追加する: `.github/workflows/ci.yml` の quality ジョブに `Integration Tests` ステップの後に以下の 2 ステップを追加する — `- name: Sample Unit Tests (Regression)\n  run: pnpm test:unit:samples` と `- name: Sample Integration Tests (Regression)\n  run: pnpm test:integration:samples`（plan.md D5, R4, FR-011 参照）
- [x] T027 [P] [US3] constitution-example に E2E 証跡義務とカバレッジ確認の概要を追加する: `docs/examples/constitution-example.md` の `# 品質基準` セクションに以下を追加 — (1) E2E テスト: 「テスト実行結果の出力を確認し、パス件数 0 件はエラーとする。実装のみで実行スキップは不可（詳細はテンプレート参照）」、(2) カバレッジ: 「各ユーザーストーリー完了時に `pnpm test:unit --coverage` を実施し 80% 以上を確認（詳細はテンプレート参照）」（FR-012 参照）

### Refactor: 改善 (US3)

- [x] T028 [US3] CI の YAML 構文が正しいことを確認する: `.github/workflows/ci.yml` の YAML 構文を確認し、インデントやステップ構成に問題がないことを確認する

### 検証 (US3)

- [x] T029 [US3] CI から --pass-with-no-tests が完全に削除されたことを検証する: `.github/workflows/ci.yml` 内で "pass-with-no-tests" を検索し、0 件であることを確認する
- [x] T030 [US3] CI にサンプルリグレッションステップが存在することを検証する: `.github/workflows/ci.yml` 内で "test:unit:samples" と "test:integration:samples" を検索し、両方が quality ジョブ内に存在することを確認する

**Checkpoint**: US3 完了。CI は E2E テスト必須 + サンプルリグレッション実行。constitution-example に品質基準概要追加。

---

## Phase 5: User Story 4 - 外部リソース URL 検証の実効性確保 (Priority: P4)

**Goal**: constitution-example に外部 URL 検証の概要を追加し、ec-site-arch の constitution に詳細手順を追加する。

**Independent Test**: `docs/examples/constitution-example.md` に「HTTP リクエスト」「plan 時点では検証済みとしない」旨が記載されていること、`.specify/memory/constitution.md` に「200 応答確認」「代替 URL に置換」「検証予定」旨が記載されていることを確認する。

### Red: 現状確認 (US4)

- [x] T031 [US4] constitution-example の外部リソース検証の現状を確認する: `docs/examples/constitution-example.md` を読み込み、外部リソース検証の記述が具体性を欠いていることを確認する

### Green: 最小実装 (US4)

- [x] T032 [US4] constitution-example の外部リソース検証を概要レベルに更新する: `docs/examples/constitution-example.md` の `外部リソース検証` セクションを以下に更新 — 「実装時に各 URL に HTTP リクエストを送信し存在を確認する。失敗した URL は代替 URL に置換する。plan 時点では検証予定とし、検証済みとしない。LLM が生成した URL は実在しない可能性がある（詳細はテンプレート参照）」（FR-014 参照）
- [x] T033 [P] [US4] constitution-example にサンプル保護原則の概要を追加する: `docs/examples/constitution-example.md` に以下の概要を追加 — 「contracts の新規フィールドは `.default()` または `.optional()` を付与する。シードデータはベース（不変）と拡張（本番追加分）に分離する。リポジトリインターフェースの検索パラメータ追加はオプショナルとする（詳細はテンプレート参照）」（FR-009 参照）

### Refactor: 改善 (US4)

- [x] T034 [US4] constitution-example の品質ガード記述が概要レベルに統一されていることを確認する: `docs/examples/constitution-example.md` を通読し、テンプレートと重複する詳細記述がなく、概要 + テンプレート参照の形式で統一されていることを確認する

### 検証 (US4)

- [x] T035 [US4] constitution-example と constitution の外部 URL 検証記述を検証する: `docs/examples/constitution-example.md` に HTTP リクエスト検証の概要が、`.specify/memory/constitution.md` に詳細手順（200 応答確認・代替 URL 置換・plan 時点は検証予定）が記載されていることを確認する

**Checkpoint**: US4 完了。外部 URL 検証の実効性確保。constitution-example は概要、constitution は詳細。

---

## Phase 6: リリース ZIP・ドキュメント整備

**Purpose**: テンプレートを ZIP に含める設定と、セットアップ手順ドキュメントの更新

- [x] T036 release.yml を修正して .specify/templates/tasks-template.md のみを ZIP に含める: `.github/workflows/release.yml` の ZIP 作成ステップで、他のテンプレート（spec/plan/checklist/agent-file）を個別に除外する。これにより `tasks-template.md` のみが ZIP に含まれる（plan.md D1, FR-016 参照）
- [x] T037 [P] SPECKIT_INTEGRATION.md のセットアップ手順を更新する: `docs/SPECKIT_INTEGRATION.md` の `1. セットアップフロー` セクションの手順を `specify init` → ZIP 展開（テンプレート上書き）→ `/speckit.constitution` の順序に更新する。ディレクトリ構成の説明に `.specify/templates/` が ZIP から展開されることを追記する（FR-017 参照）
- [x] T038 release.yml の ZIP 除外設定を検証する: `.github/workflows/release.yml` に `.specify/memory/*`・`.specify/scripts/*`・他テンプレート4件が除外対象として記載されていること、`tasks-template.md` のみが含まれることを確認する

**Checkpoint**: リリース ZIP に tasks-template.md のみ含まれ、ドキュメントが最新化。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 最終検証と横断的な品質確認

- [x] T039 全サンプルテスト（unit・integration）のパスを最終確認する: `pnpm test:unit:samples && pnpm test:integration:samples` を実行し全テストがパスすることを確認する
- [x] T040 TypeScript コンパイルの最終確認: `pnpm typecheck` を実行しエラー 0 件であることを確認する
- [x] T041 [P] constitution Sync Impact Report の最終更新: `.specify/memory/constitution.md` の Sync Impact Report を更新する。`tasks-template.md: ✅ 整合性確認済み（TDD・フェーズ構成対応）` が実態と一致していることを確認し、本機能で追加した品質基準（E2E 証跡・カバレッジ・URL 検証・サンプル保護）を反映する
- [x] T042 [P] quickstart.md の検証シナリオを実施する: `specs/008-quality-guard/quickstart.md` の検証手順 1〜7 を順に実行し、全項目がパスすることを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - ベースライン確認
- **US1 (Phase 2)**: Setup 完了後に開始。タスクテンプレートと constitution を修正
- **US2 (Phase 3)**: Setup 完了後に開始。US1 とは独立（別ファイル）
- **US3 (Phase 4)**: US1 完了後に開始（タスクテンプレートの検証フェーズ記述が US1 で追加済み前提）
- **US4 (Phase 5)**: US1 完了後に開始（constitution の品質基準が US1 の T006 で追加済み前提）
- **ZIP・ドキュメント (Phase 6)**: US1〜US4 完了後に開始
- **Polish (Phase 7)**: 全フェーズ完了後に開始

### User Story Dependencies

- **US1 (P1)**: 独立。最優先で実施
- **US2 (P2)**: US1 と並行実施可能（別ファイル群）
- **US3 (P3)**: US1 完了が前提（constitution の品質基準を参照）
- **US4 (P4)**: US1 完了が前提（constitution の品質基準を参照）

### Within Each User Story

- Red → Green → Refactor → 検証 の順序で実施
- Green 内の [P] タスクは並行実施可能
- 検証はすべての Green・Refactor 完了後に実施

### Parallel Opportunities

- **Phase 1**: T002 と T003 は並行実施可能
- **US1 (Phase 2)**: T005 と T006 は同時には不可（T006 の Sync Impact Report が T005 に依存）
- **US2 (Phase 3)**: T012〜T020 は全て [P]（別ファイル）で並行実施可能。T011 のみ先行が必要
- **US3 (Phase 4)**: T027 は T025/T026 と並行実施可能（別ファイル）
- **US4 (Phase 5)**: T033 は T032 と並行実施可能（同一ファイルだが別セクション）
- **Phase 6**: T036 と T037 は並行実施可能（別ファイル）

---

## Parallel Example: User Story 2 (最大並列)

```bash
# Red: ベースライン確認
Task: T010 - サンプルテスト全件パス確認

# Green: シードデータ分離（先行）
Task: T011 - BASE_PRODUCTS / EXTENSION_PRODUCTS 分離

# Green: テストヘルパー移行（全9タスク並行）
Task: T012 - Catalog usecase.test.ts
Task: T013 - Catalog ui.test.tsx
Task: T014 - Catalog api.test.ts
Task: T015 - Cart usecase.test.ts
Task: T016 - Cart ui.test.tsx
Task: T017 - Cart api.test.ts
Task: T018 - Orders usecase.test.ts
Task: T019 - Orders ui.test.tsx
Task: T020 - Orders api.test.ts

# Refactor + 検証
Task: T021 - TypeScript コンパイル確認
Task: T022 - サンプルテスト全件パス検証
Task: T023 - フィールド追加耐性検証
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup（ベースライン確認）
2. Complete Phase 2: US1 - TDD テンプレート整合
3. **STOP and VALIDATE**: テンプレートに OPTIONAL なし、4 ステップ構成、constitution 整合
4. この時点で ec-site-arch 自身のタスク生成品質が改善

### Incremental Delivery

1. US1 完了 → タスクテンプレート品質改善（MVP）
2. US2 完了 → サンプルコード構造保護（フィールド追加耐性確保）
3. US3 完了 → CI 品質ゲート強化（E2E スキップ防止 + リグレッション）
4. US4 完了 → 外部 URL 検証実効性
5. Phase 6 完了 → ZIP 配信モデル更新
6. Phase 7 完了 → 最終検証

---

## Post-release 修正 (2026-02-11)

- [x] T043 [skip ci] によるリリースワークフロー未実行を修正: `create-release-tag.ps1` のバンプコミットから `[skip ci]` を削除し、`ci.yml` の quality ジョブに `if: "!startsWith(github.event.head_commit.message, 'chore: bump version')"` を追加。v1.0.16 タグをマージコミット (198b2b2) に付け直しリリース完了
- [x] T044 リリース ZIP に tasks-template.md のみ含める: `release.yml` で spec/plan/checklist/agent-file テンプレートを個別に除外し、tasks-template.md のみ ZIP に含める構成に変更。未修正テンプレートによる展開先カスタマイズ上書きリスクを解消

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Red フェーズは本機能ではベースライン確認・問題の存在確認として運用する（プロセス改善機能のため、従来の「失敗するテストを先に書く」とは異なるが、TDD の精神に準拠）
- テストヘルパーの Schema.parse() 移行（T012〜T020）は全て [P] で並行可能
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
