# Tasks: リリースZIP展開後のナビゲーション制御

**Input**: Design documents from `/specs/005-nav-control/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: ベースラインの記録

- [ ] T001 テストのベースラインを記録する（unit テスト数、integration テスト数、E2E テスト数を確認）

---

## Phase 2: User Story 1 - 購入者画面のナビゲーション制御 (Priority: P1) 🎯 MVP

**Goal**: 購入者レイアウトの navLinks を空配列にし、未実装ドメインのリンクを非表示にする

**Independent Test**: `pnpm typecheck` がパスし、既存のテストがすべてパスすること

- [ ] T002 [US1] `src/app/(buyer)/layout.tsx` の `navLinks` を空配列に変更する。コメントで追加例（`{ href: '/catalog', label: '商品一覧' }` 等）を残す

**Checkpoint**: 購入者画面のナビゲーションにドメイン固有のリンクが表示されないこと

---

## Phase 3: User Story 2 - 管理者画面のナビゲーション制御 (Priority: P2)

**Goal**: 管理者レイアウトの navLinks をダッシュボードのみにし、未実装ドメインの管理メニューを非表示にする

**Independent Test**: `pnpm typecheck` がパスし、既存のテストがすべてパスすること

- [ ] T003 [US2] `src/app/admin/layout.tsx` の `navLinks` からドメイン固有のリンク（商品管理、注文管理）を削除し、ダッシュボードのみ残す。コメントで追加例を残す

**Checkpoint**: 管理者画面のサイドバーにダッシュボードのみ表示されること

---

## Phase 4: User Story 3 - サンプル実装時の全メニュー表示 (Priority: P3)

**Goal**: サンプル実装が存在する状態で全メニューが表示されることを確認する

**Independent Test**: `pnpm typecheck` + `pnpm test:unit` + `pnpm test:integration` がすべてパスし、テスト数がベースラインと一致すること

- [ ] T004 [US3] typecheck を実行してエラーがないことを確認する
- [ ] T005 [US3] 単体テスト・統合テストを実行し、テスト数がベースラインと一致することを確認する

**Checkpoint**: サンプル実装環境で全テストがパスし、既存の振る舞いが維持されていること

---

## Phase 5: User Story 4 - ドキュメント更新 (Priority: P4)

**Goal**: ナビゲーション制御の仕組みに合わせてドキュメントを更新する

**Independent Test**: ドキュメントにナビゲーション追加手順が記載されていること

- [ ] T006 [P] [US4] `docs/examples/constitution-example.md` の実装ワークフローにナビゲーションリンク追加手順を含める
- [ ] T007 [P] [US4] `docs/examples/spec-catalog-example.md` の `/speckit.plan` 入力にナビゲーションリンク追加を含める
- [ ] T008 [P] [US4] `docs/examples/spec-cart-example.md` の `/speckit.plan` 入力にナビゲーションリンク追加を含める
- [ ] T009 [P] [US4] `docs/examples/spec-order-example.md` の `/speckit.plan` 入力にナビゲーションリンク追加を含める
- [ ] T010 [P] [US4] `docs/examples/spec-product-example.md` の `/speckit.plan` 入力にナビゲーションリンク追加を含める
- [ ] T011 [P] [US4] `src/samples/README.md` にナビゲーション制御の説明を追加する

**Checkpoint**: ドキュメントにナビゲーション追加手順が記載されていること

---

## Phase 6: Polish & 最終検証

**Purpose**: 全体の整合性確認

- [ ] T012 typecheck / unit / integration すべてパスし、テスト数がベースラインと一致することを最終確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 即時開始可能
- **US1 (Phase 2)**: Setup 完了後に開始
- **US2 (Phase 3)**: Setup 完了後に開始（US1 と並行可能）
- **US3 (Phase 4)**: US1 + US2 完了後に検証
- **US4 (Phase 5)**: US1 + US2 完了後に開始（US3 と並行可能）
- **Polish (Phase 6)**: 全ユーザーストーリー完了後

### User Story Dependencies

1. US1 完了 → 購入者画面のナビゲーション制御が機能
2. US2 完了 → 管理者画面のナビゲーション制御が機能
3. US3 完了 → サンプル実装環境で全テストパス確認
4. US4 完了 → ドキュメント整備完了

### Parallel Opportunities

- T002 と T003 は異なるファイルのため並行実行可能
- T006〜T011 はすべて異なるファイルのため並行実行可能

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001: ベースライン記録
2. T002: 購入者レイアウトの navLinks 変更
3. **検証**: typecheck パス確認

### Incremental Delivery

1. US1 → 購入者画面のナビゲーション制御
2. US2 → 管理者画面のナビゲーション制御
3. US3 → 全テスト検証
4. US4 → ドキュメント更新
5. 最終検証
