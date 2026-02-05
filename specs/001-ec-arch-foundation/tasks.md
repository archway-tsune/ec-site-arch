# Tasks: ECサイト向けアーキテクチャ基盤

**入力**: `/specs/001-ec-arch-foundation/` の設計ドキュメント
**前提**: plan.md, spec.md, research.md, data-model.md, contracts/

**テスト**: TDD必須（テストテンプレートを含む）
**タスク設計方針**: 1タスク = 1責務、各タスクは「設計 → 実装 → テスト」が完結

## フォーマット: `[ID] [P?] [Phase] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Phase]**: フェーズ識別（F1=基盤, F2=テスト, F3=UI, F4=API, F5=ドメイン, F6=検証）
- 説明には正確なファイルパスを含める

## パス規約

- **共通基盤**: `src/foundation/`
- **テンプレート**: `src/templates/`
- **ドメイン**: `src/domains/`
- **アプリ**: `src/app/`
- **テスト**: `tests/`

---

## フェーズ1: 共通アーキテクチャ基盤

**目的**: ECサイトに共通で必要となる横断機能を提供する
**完了条件**: 認証・認可・セッションが独立して動作する

### Task 1-1: 認証基盤の定義と実装

- [ ] T001 [F1] セッションデータ型定義を実装する `src/foundation/auth/session.ts`
- [ ] T002 [F1] セッション生成・復元・失効処理を実装する `src/foundation/auth/session.ts`
- [ ] T003 [F1] 未認証時の統一挙動を実装する `src/foundation/auth/session.ts`
- [ ] T004 [P] [F1] 認証基盤の単体テストを実装する `tests/unit/foundation/auth/session.test.ts`

### Task 1-2: 認可（RBAC）基盤の定義と実装

- [ ] T005 [F1] ロール定義（buyer/admin）を実装する `src/foundation/auth/roles.ts`
- [ ] T006 [F1] 認可チェック関数を実装する `src/foundation/auth/authorize.ts`
- [ ] T007 [F1] ユースケース向け認可フックを実装する `src/foundation/auth/authorize.ts`
- [ ] T008 [P] [F1] 認可ロジックの単体テストを実装する `tests/unit/foundation/auth/authorize.test.ts`

### Task 1-3: セッション管理基盤の実装

- [ ] T009 [F1] CSRF対策を実装する `src/foundation/auth/csrf.ts`
- [ ] T010 [F1] セッションCookie管理を実装する `src/foundation/auth/session.ts`
- [ ] T011 [P] [F1] セッション管理の単体テストを実装する `tests/unit/foundation/auth/csrf.test.ts`

### Task 1-4: エラー・ログ・監査基盤の実装

- [ ] T012 [P] [F1] エラーコード体系を定義する `src/foundation/errors/types.ts`
- [ ] T013 [P] [F1] 共通エラーハンドラを実装する `src/foundation/errors/handler.ts`
- [ ] T014 [P] [F1] クライアント向けエラーマスクを実装する `src/foundation/errors/mask.ts`
- [ ] T015 [P] [F1] ログ出力ユーティリティを実装する `src/foundation/logging/logger.ts`
- [ ] T016 [P] [F1] 監査フックを実装する `src/foundation/logging/audit.ts`
- [ ] T017 [P] [F1] エラー・ログの単体テストを実装する `tests/unit/foundation/errors/handler.test.ts`

### Task 1-5: 基盤品質ゲートの整備

- [ ] T018 [P] [F1] runtime validationユーティリティを実装する `src/foundation/validation/runtime.ts`
- [ ] T019 [P] [F1] CI品質ゲート設定（カバレッジ80%）を構成する `.github/workflows/ci.yml`
- [ ] T020 [F1] 基盤READMEを作成する `src/foundation/README.md`

**チェックポイント**: 共通アーキテクチャ基盤が独立して動作する

---

## フェーズ2: テスト基盤（横断）

**目的**: UI/API/ドメイン適用すべてに対しTDDと品質ゲートが自然に適用される状態を作る
**完了条件**: テストテンプレートが利用可能、CI品質ゲートが稼働

### Task 2-1: バックエンド単体テストテンプレート定義

- [ ] T021 [P] [F2] ユースケース向けBE単体テストテンプレートを作成する `src/templates/tests/unit/usecase.test.ts`
- [ ] T022 [P] [F2] Given-When-Then構造・認可条件テスト指針を文書化する `src/templates/tests/README.md`

### Task 2-2: フロントエンド単体テストテンプレート定義

- [ ] T023 [P] [F2] UIコンポーネント向けFE単体テストテンプレートを作成する `src/templates/tests/unit/component.test.tsx`
- [ ] T024 [P] [F2] loading/error/empty状態テスト指針を文書化する `src/templates/tests/README.md`

### Task 2-3: API統合テストテンプレート定義

- [ ] T025 [P] [F2] API統合テストテンプレートを作成する `src/templates/tests/integration/api.test.ts`
- [ ] T026 [P] [F2] 契約検証・認可・エラーコード検証指針を文書化する `src/templates/tests/README.md`

### Task 2-4: E2Eテスト観点テンプレート定義

- [ ] T027 [P] [F2] 購入者導線E2Eテストテンプレートを作成する `src/templates/tests/e2e/buyer-flow.spec.ts`
- [ ] T028 [P] [F2] 管理者導線E2Eテストテンプレートを作成する `src/templates/tests/e2e/admin-flow.spec.ts`

**チェックポイント**: テストテンプレートからBE/FE単体・統合・E2Eテストを開始できる

---

## フェーズ3: UIテンプレート

**目的**: ドメインごとのUIを迅速かつ一貫性を保って実装できるUIテンプレートを提供する
**完了条件**: 新規画面がUIテンプレートから即作成できる

### Task 3-1: UIデザイン指針の具体化

- [ ] T029 [F3] UIデザインガイドを作成する `src/templates/ui/DESIGN_GUIDE.md`
- [ ] T030 [F3] Tailwind CSSカスタムテーマを設定する `tailwind.config.js`

### Task 3-2: 共通UIコンポーネント定義

- [ ] T031 [P] [F3] Loadingコンポーネントを実装する `src/templates/ui/components/status/Loading.tsx`
- [ ] T032 [P] [F3] Errorコンポーネントを実装する `src/templates/ui/components/status/Error.tsx`
- [ ] T033 [P] [F3] Emptyコンポーネントを実装する `src/templates/ui/components/status/Empty.tsx`
- [ ] T034 [P] [F3] 共通UIコンポーネントのFE単体テストを実装する `tests/unit/templates/ui/components/status.test.tsx`

### Task 3-3: 共通画面（ヘッダー／フッター／レイアウト）テンプレート実装

- [ ] T035 [P] [F3] Headerコンポーネントを実装する `src/templates/ui/components/layout/Header.tsx`
- [ ] T036 [P] [F3] Footerコンポーネントを実装する `src/templates/ui/components/layout/Footer.tsx`
- [ ] T037 [F3] Layoutコンポーネントを実装する `src/templates/ui/components/layout/Layout.tsx`
- [ ] T038 [P] [F3] レイアウトコンポーネントのFE単体テストを実装する `tests/unit/templates/ui/components/layout.test.tsx`

### Task 3-4: 標準画面パターンのテンプレート化

- [ ] T039 [P] [F3] 一覧画面テンプレートを実装する `src/templates/ui/pages/list.tsx`
- [ ] T040 [P] [F3] 詳細画面テンプレートを実装する `src/templates/ui/pages/detail.tsx`
- [ ] T041 [P] [F3] フォーム画面テンプレートを実装する `src/templates/ui/pages/form.tsx`
- [ ] T042 [P] [F3] 画面テンプレートのFE単体テストを実装する `tests/unit/templates/ui/pages.test.tsx`

### Task 3-5: 認証・認可前提の画面制御実装

- [ ] T043 [F3] 未認証時リダイレクト制御を実装する `src/app/middleware.ts`
- [ ] T044 [F3] 権限不足時の表示制御を実装する `src/templates/ui/components/auth/Forbidden.tsx`
- [ ] T045 [P] [F3] 画面制御のFE単体テストを実装する `tests/unit/templates/ui/auth.test.tsx`

**チェックポイント**: UIテンプレートと共通画面が利用可能

---

## フェーズ4: APIテンプレート

**目的**: ドメインごとのAPIを安全・一貫した形で実装できるAPIテンプレートを提供する
**完了条件**: 新規APIがテンプレートから作成できる

### Task 4-1: API基本フローのテンプレート化

- [ ] T046 [F4] ユースケーステンプレートを実装する `src/templates/api/usecase.ts`
- [ ] T047 [F4] APIハンドラテンプレートを実装する `src/templates/api/handler.ts`
- [ ] T048 [P] [F4] ユースケースのBE単体テスト例を実装する `tests/unit/templates/api/usecase.test.ts`

### Task 4-2: 入出力契約（DTO）テンプレート

- [ ] T049 [F4] DTO定義テンプレートを実装する `src/templates/api/dto.ts`
- [ ] T050 [P] [F4] DTO統合テスト例を実装する `tests/integration/templates/api/dto.test.ts`

### Task 4-3: エラーコード・レスポンス統一

- [ ] T051 [F4] 共通レスポンス形式を実装する `src/foundation/errors/response.ts`
- [ ] T052 [P] [F4] レスポンス形式の統合テストを実装する `tests/integration/foundation/errors/response.test.ts`

**チェックポイント**: APIテンプレートが利用可能、UIテンプレートと安全に接続できる

---

## フェーズ5: ドメイン適用（検証）

**目的**: UI/API/テストテンプレートが実際のドメイン実装に耐えられることを検証する
**完了条件**: テンプレートのみでドメイン実装が完結する

### Task 5-1: Catalogドメイン適用

- [ ] T053 [P] [F5] Catalog UI実装（商品一覧・詳細）を行う `src/domains/catalog/ui/`
- [ ] T054 [P] [F5] Catalog API実装（商品取得ユースケース）を行う `src/domains/catalog/api/`
- [ ] T055 [P] [F5] Catalog FE単体テストを実装する `src/domains/catalog/tests/unit/`
- [ ] T056 [P] [F5] Catalog BE単体テストを実装する `src/domains/catalog/tests/unit/`
- [ ] T057 [F5] Catalog API統合テストを実装する `src/domains/catalog/tests/integration/`

### Task 5-2: Cartドメイン適用

- [ ] T058 [P] [F5] Cart UI実装（カート表示・操作）を行う `src/domains/cart/ui/`
- [ ] T059 [P] [F5] Cart API実装（カート操作ユースケース）を行う `src/domains/cart/api/`
- [ ] T060 [P] [F5] Cart FE単体テストを実装する `src/domains/cart/tests/unit/`
- [ ] T061 [P] [F5] Cart BE単体テストを実装する `src/domains/cart/tests/unit/`
- [ ] T062 [F5] Cart API統合テストを実装する `src/domains/cart/tests/integration/`

### Task 5-3: Ordersドメイン適用

- [ ] T063 [P] [F5] Orders UI実装（注文一覧・詳細）を行う `src/domains/orders/ui/`
- [ ] T064 [P] [F5] Orders API実装（注文取得・作成ユースケース）を行う `src/domains/orders/api/`
- [ ] T065 [P] [F5] Orders FE単体テストを実装する `src/domains/orders/tests/unit/`
- [ ] T066 [P] [F5] Orders BE単体テストを実装する `src/domains/orders/tests/unit/`
- [ ] T067 [F5] Orders API統合テストを実装する `src/domains/orders/tests/integration/`

**チェックポイント**: 3ドメインでUI/API/テストがテンプレートから実装完了

---

## フェーズ6: 統合検証・品質確認

**目的**: 基盤・テンプレート・ドメイン実装が一体として正しく機能することを保証する
**完了条件**: E2E全パス、カバレッジ80%達成、品質ゲート全通過

### Task 6-1: 主要導線E2E検証

- [ ] T068 [P] [F6] 購入者導線E2Eテストを実装する `tests/e2e/buyer-flow.spec.ts`
- [ ] T069 [P] [F6] 管理者導線E2Eテストを実装する `tests/e2e/admin-flow.spec.ts`
- [ ] T070 [F6] E2Eテストを実行し結果を確認する

### Task 6-2: 品質・非機能要件確認

- [ ] T071 [P] [F6] テストカバレッジ80%を確認する
- [ ] T072 [P] [F6] TypeScript型チェック（strictモード）を確認する
- [ ] T073 [P] [F6] Lintエラー0件を確認する
- [ ] T074 [F6] 最終品質レポートを作成する `specs/001-ec-arch-foundation/quality-report.md`

**チェックポイント**: 全品質ゲート通過、プロジェクト完了

---

## 依存関係と実行順序

### フェーズ依存関係

- **フェーズ1（共通基盤）**: 依存なし - 即座に開始可能
- **フェーズ2（テスト基盤）**: フェーズ1完了後に開始（基盤のテストパターンが必要）
- **フェーズ3（UIテンプレート）**: フェーズ1完了後に開始可能
- **フェーズ4（APIテンプレート）**: フェーズ1完了後に開始可能
- **フェーズ5（ドメイン適用）**: フェーズ2, 3, 4すべて完了後に開始
- **フェーズ6（統合検証）**: フェーズ5完了後に開始

### 並列実行可能なフェーズ

```
フェーズ1（基盤）完了後:
├── フェーズ2（テスト基盤） ─┐
├── フェーズ3（UI）         ├── すべて完了後 → フェーズ5（ドメイン）
└── フェーズ4（API）        ─┘
```

### タスク内依存関係

- 認証基盤（T001-T004）→ 認可基盤（T005-T008）→ セッション管理（T009-T011）
- エラー基盤（T012-T017）は認証と並列実行可能
- 各ドメイン適用タスクはUI/APIを並列実行し、統合テストで結合確認

---

## 並列実行例

### フェーズ1: 認証・エラー基盤の並列実行

```bash
# 認証系とエラー系を並列で開始
並列: T001, T012, T013, T014, T015, T016

# 認証完了後に認可を開始
順次: T001-T004 完了 → T005-T008 開始
```

### フェーズ5: ドメイン適用の並列実行

```bash
# 3ドメインのUI/APIを並列で開始
並列:
  - Catalog: T053, T054, T055, T056
  - Cart: T058, T059, T060, T061
  - Orders: T063, T064, T065, T066

# 各ドメインの統合テストは個別に順次実行
順次: T057, T062, T067
```

---

## 実装戦略

### MVP優先（フェーズ1-3のみ）

1. フェーズ1: 共通基盤完了
2. フェーズ2: テスト基盤完了
3. フェーズ3: UIテンプレート完了
4. **検証**: 新規画面がテンプレートから作成できることを確認

### 段階的デリバリー

1. フェーズ1-2完了 → 基盤・テスト基盤が独立動作
2. フェーズ3-4完了 → UI/APIテンプレートが利用可能
3. フェーズ5完了 → 3ドメインでテンプレート適用を検証
4. フェーズ6完了 → 全品質ゲート通過

### 並列チーム戦略

複数開発者の場合:

1. 全員でフェーズ1を完了
2. フェーズ1完了後:
   - 開発者A: フェーズ2（テスト基盤）
   - 開発者B: フェーズ3（UIテンプレート）
   - 開発者C: フェーズ4（APIテンプレート）
3. フェーズ2-4完了後:
   - 開発者A: Catalogドメイン
   - 開発者B: Cartドメイン
   - 開発者C: Ordersドメイン

---

## タスクサマリー

| フェーズ | タスク数 | 並列可能 |
|---------|---------|---------|
| フェーズ1: 共通基盤 | 20 | 12 |
| フェーズ2: テスト基盤 | 8 | 8 |
| フェーズ3: UIテンプレート | 17 | 12 |
| フェーズ4: APIテンプレート | 7 | 3 |
| フェーズ5: ドメイン適用 | 15 | 12 |
| フェーズ6: 統合検証 | 7 | 4 |
| **合計** | **74** | **51** |

---

## 注意事項

- [P] タスク = 異なるファイル、依存なし
- [F#] ラベル = フェーズ識別（トレーサビリティ用）
- 各タスクは「設計 → 実装 → テスト」が完結する
- 単体テストはBE/FE双方で作成
- APIは統合テストで担保（単体テストはユースケースのみ）
- コミットはタスク完了ごと、または論理的なグループ単位
- チェックポイントで独立検証を実施
