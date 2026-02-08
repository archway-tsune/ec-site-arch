# Implementation Plan: サンプルテストの集約・再構成

**Branch**: `004-consolidate-sample-tests` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-consolidate-sample-tests/spec.md`

## Summary

サンプルテストを `src/samples/tests/` に集約し、E2Eテストをドメイン別に分解する。テスト設定の除外パターンでサンプルテストをデフォルト除外とし、アーキテクチャリポジトリのCIのみ `:samples` サフィックス付きコマンドで実行する。

## Technical Context

**Language/Version**: TypeScript 5 + React 18
**Primary Dependencies**: Next.js 14 (App Router), Vitest 1.6, Playwright 1.45, React Testing Library 16
**Storage**: N/A（テストファイルの構造変更のみ）
**Testing**: Vitest（単体・統合）、Playwright（E2E）
**Target Platform**: Web（Node.js）
**Project Type**: Web application
**Performance Goals**: N/A（リファクタリング）
**Constraints**: テスト数のベースライン一致、既存テストの振る舞い不変
**Scale/Scope**: 11ファイル移動 + 2ファイルを5ファイルに分解 + 設定変更 + ドキュメント更新

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 適合 | 備考 |
|------|------|------|
| I. コンポーネントファースト設計 | ✅ | テスト構造のみ変更、コンポーネント設計に影響なし |
| II. ドメイン駆動設計 | ✅ | E2Eテストをドメイン別に分解し、原則に沿った構造にする |
| III. サーバーサイド中心のデータ制御 | ✅ | 影響なし |
| IV. 型安全必須 | ✅ | TypeScript strict mode 維持、import パス変更のみ |
| V. セキュリティ最優先 | ✅ | 影響なし |
| VI. テスト駆動開発（TDD）必須 | ✅ | テスト数維持、構造改善 |
| テストカバレッジ80% | ✅ | テスト数不変のためカバレッジに影響なし |
| ドキュメントは日本語 | ✅ | 日本語で記述 |

## Project Structure

### Documentation (this feature)

```text
specs/004-consolidate-sample-tests/
├── spec.md              # 機能仕様書
├── plan.md              # 本ファイル
├── research.md          # Phase 0 調査結果
├── data-model.md        # Phase 1 データモデル
├── quickstart.md        # Phase 1 クイックスタート
└── checklists/
    └── requirements.md  # 品質チェックリスト
```

### Source Code (repository root)

```text
# 変更前（現在の構造）
src/samples/domains/catalog/tests/
├── unit/
│   ├── usecase.test.ts
│   └── ui.test.tsx
└── integration/
    └── api.test.ts

src/samples/domains/cart/tests/
├── unit/
│   ├── usecase.test.ts
│   └── ui.test.tsx
└── integration/
    └── api.test.ts

src/samples/domains/orders/tests/
├── unit/
│   ├── usecase.test.ts
│   └── ui.test.tsx
└── integration/
    └── api.test.ts

tests/e2e/arch/
├── buyer-flow.spec.ts
└── admin-flow.spec.ts

# 変更後（目標の構造）
src/samples/tests/
├── unit/domains/
│   ├── catalog/
│   │   ├── usecase.test.ts
│   │   └── ui.test.tsx
│   ├── cart/
│   │   ├── usecase.test.ts
│   │   └── ui.test.tsx
│   └── orders/
│       ├── usecase.test.ts
│       └── ui.test.tsx
├── integration/domains/
│   ├── catalog/
│   │   └── api.test.ts
│   ├── cart/
│   │   └── api.test.ts
│   └── orders/
│       └── api.test.ts
└── e2e/domains/
    ├── catalog/
    │   ├── buyer-flow.spec.ts   # 商品一覧・詳細閲覧
    │   └── admin-flow.spec.ts   # 商品CRUD・ステータス管理
    ├── cart/
    │   └── buyer-flow.spec.ts   # カート操作
    └── orders/
        ├── buyer-flow.spec.ts   # 注文確定・履歴 + 一連フロー
        └── admin-flow.spec.ts   # 注文管理
```

**Structure Decision**: `src/samples/tests/` 配下に `tests/` と同じ階層構造（テスト種別/domains/ドメイン名/）で配置。tests/ の構造（unit/domains/, integration/domains/）と対称的にし、本番テスト作成時の参照を容易にする。

### 設定ファイル変更

#### vitest.config.ts

現在の `include` パターン:
```
['./tests/**/*.test.{ts,tsx}', './src/**/*.test.{ts,tsx}']
```

変更後: `src/samples/` を `exclude` に追加（デフォルト除外）:
```
include: ['./tests/**/*.test.{ts,tsx}', './src/**/*.test.{ts,tsx}'],
exclude: ['./src/samples/**/*.test.{ts,tsx}', 'node_modules'],
```

#### vitest.samples.config.ts（新規作成）

サンプルテスト専用の設定。Vitest 1.6 は CLI の `--exclude` で config の `exclude` を上書きできないため、`:samples` コマンド用に別設定ファイルを用意する:
```
include: ['./src/samples/**/*.test.{ts,tsx}'],
// exclude なし（サンプルテストを実行するため）
```

#### playwright.arch.config.ts

変更後: `testDir` を新しい配置先に変更:
```
testDir: './src/samples/tests/e2e'
```

#### playwright.config.ts

変更不要: `testDir: './tests/e2e'` のまま。`testIgnore: ['**/arch/**']` は不要になるが、将来の安全のため残しても害はない。

#### package.json scripts

追加するコマンド:
```json
"test:unit:samples": "vitest run src/samples/tests/unit --config vitest.samples.config.ts",
"test:integration:samples": "vitest run src/samples/tests/integration --config vitest.samples.config.ts",
"test:e2e:samples": "playwright test --config playwright.arch.config.ts"
```

既存コマンドの変更:
- `test:unit`: `vitest run tests/unit` → 変更不要（tests/unit のみ対象）
- `test:integration`: `vitest run tests/integration` → 変更不要
- `test:e2e:arch`: `playwright test --config playwright.arch.config.ts` → 変更不要（config の testDir が変わるだけ）

### Import パス変更（ドメインテスト 9ファイル）

| 変更前（相対パス） | 変更後（エイリアス） |
|---|---|
| `../../api/usecases` | `@/samples/domains/{domain}/api/usecases` |
| `../../ui/ProductList` | `@/samples/domains/catalog/ui/ProductList` |
| `../../ui/ProductDetail` | `@/samples/domains/catalog/ui/ProductDetail` |
| `../../ui/ProductCard` | `@/samples/domains/catalog/ui/ProductCard` |
| `../../ui/CartView` | `@/samples/domains/cart/ui/CartView` |
| `../../ui/OrderList` | `@/samples/domains/orders/ui/OrderList` |
| `../../ui/OrderDetail` | `@/samples/domains/orders/ui/OrderDetail` |

E2Eテスト: `@playwright/test` のみ使用のため import 変更不要。

### E2Eテスト分解マッピング

#### buyer-flow.spec.ts → 3ファイルに分解

| 元のテスト describe | 移動先 |
|---|---|
| `商品一覧` (2テスト) | `catalog/buyer-flow.spec.ts` |
| `商品詳細` (2テスト) | `catalog/buyer-flow.spec.ts` |
| `カート` (4テスト) | `cart/buyer-flow.spec.ts` |
| `注文` (3テスト) | `orders/buyer-flow.spec.ts` |
| `一連の購入フロー` (1テスト) | `orders/buyer-flow.spec.ts` |
| `未ログイン時の動作` (1テスト) | `catalog/buyer-flow.spec.ts` |

合計: 13テスト → catalog: 5, cart: 4, orders: 4

#### admin-flow.spec.ts → 2ファイルに分解

| 元のテスト describe | 移動先 |
|---|---|
| `商品管理` (5テスト) | `catalog/admin-flow.spec.ts` |
| `注文管理` (4テスト) | `orders/admin-flow.spec.ts` |
| `一連の管理フロー` (1テスト) | `catalog/admin-flow.spec.ts` |
| `権限確認` (2テスト) | `catalog/admin-flow.spec.ts` |

合計: 12テスト → catalog: 8, orders: 4

#### ヘルパー関数の扱い

各ファイルにインラインで配置（ファイルの独立性を優先）:
- `loginAsBuyer()`: catalog/buyer, cart/buyer, orders/buyer に各々含める
- `loginAsAdmin()`: catalog/admin, orders/admin に各々含める
- `loginAsBuyer()`: orders/admin 内の `createOrderAsBuyer()` ヘルパーにも含める
- `test.beforeEach` の `request.post('/api/test/reset')`: 各ファイルに含める

## Complexity Tracking

複雑さの追加なし。既存テストの構造変更のみ。
