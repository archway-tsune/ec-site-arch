# Data Model: サンプルテストの集約・再構成

本機能はテストファイルの構造変更のみであり、新しいデータエンティティの追加はない。

## ファイル移動マッピング

### 単体テスト（6ファイル）

| # | 移動元 | 移動先 |
|---|--------|--------|
| 1 | `src/samples/domains/catalog/tests/unit/usecase.test.ts` | `src/samples/tests/unit/domains/catalog/usecase.test.ts` |
| 2 | `src/samples/domains/catalog/tests/unit/ui.test.tsx` | `src/samples/tests/unit/domains/catalog/ui.test.tsx` |
| 3 | `src/samples/domains/cart/tests/unit/usecase.test.ts` | `src/samples/tests/unit/domains/cart/usecase.test.ts` |
| 4 | `src/samples/domains/cart/tests/unit/ui.test.tsx` | `src/samples/tests/unit/domains/cart/ui.test.tsx` |
| 5 | `src/samples/domains/orders/tests/unit/usecase.test.ts` | `src/samples/tests/unit/domains/orders/usecase.test.ts` |
| 6 | `src/samples/domains/orders/tests/unit/ui.test.tsx` | `src/samples/tests/unit/domains/orders/ui.test.tsx` |

### 統合テスト（3ファイル）

| # | 移動元 | 移動先 |
|---|--------|--------|
| 7 | `src/samples/domains/catalog/tests/integration/api.test.ts` | `src/samples/tests/integration/domains/catalog/api.test.ts` |
| 8 | `src/samples/domains/cart/tests/integration/api.test.ts` | `src/samples/tests/integration/domains/cart/api.test.ts` |
| 9 | `src/samples/domains/orders/tests/integration/api.test.ts` | `src/samples/tests/integration/domains/orders/api.test.ts` |

### E2Eテスト（2ファイル → 5ファイルに分解）

| # | 移動元 | 移動先 | 内容 |
|---|--------|--------|------|
| 10a | `tests/e2e/arch/buyer-flow.spec.ts` | `src/samples/tests/e2e/domains/catalog/buyer-flow.spec.ts` | 商品一覧・詳細・未ログイン |
| 10b | `tests/e2e/arch/buyer-flow.spec.ts` | `src/samples/tests/e2e/domains/cart/buyer-flow.spec.ts` | カート操作 |
| 10c | `tests/e2e/arch/buyer-flow.spec.ts` | `src/samples/tests/e2e/domains/orders/buyer-flow.spec.ts` | 注文・一連フロー |
| 11a | `tests/e2e/arch/admin-flow.spec.ts` | `src/samples/tests/e2e/domains/catalog/admin-flow.spec.ts` | 商品管理・権限 |
| 11b | `tests/e2e/arch/admin-flow.spec.ts` | `src/samples/tests/e2e/domains/orders/admin-flow.spec.ts` | 注文管理 |

## 設定変更一覧

| ファイル | 変更内容 |
|----------|----------|
| `vitest.config.ts` | `test.exclude` に `./src/samples/**/*.test.{ts,tsx}` を追加 |
| `playwright.arch.config.ts` | `testDir` を `./src/samples/tests/e2e` に変更 |
| `package.json` | `:samples` コマンド3つを追加 |

## ドキュメント更新一覧

| ファイル | 更新内容 |
|----------|----------|
| `src/samples/README.md` | テスト構造のディレクトリツリーを更新 |
| `README.md` | ディレクトリ構成のテスト部分を更新 |
| `scripts/README.md` | リリースZIP内容の説明を更新 |
| `docs/SPECKIT_INTEGRATION.md` | テストパス記述を更新 |
