# Implementation Plan: speckit実装時の品質ガード強化

**Branch**: `008-quality-guard` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-quality-guard/spec.md`

## Summary

speckit の開発ワークフロー品質を強化する。5 つの問題（TDD テンプレート矛盾、サンプルコード構造的結合、E2E テストスキップ、カバレッジ未確認、URL 未検証）を修正する。
修正対象は 2 系統：(1) リリース ZIP 同梱ファイル（CI 設定・constitution-example・テストヘルパー・シードデータ・テンプレート）、(2) ec-site-arch 開発用ファイル（constitution・タスクテンプレート）。
テンプレートをリリース ZIP に含め、`specify init` → ZIP 展開 → `/speckit.constitution` の順序で展開先プロジェクトの品質を直接制御する。

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 14 (App Router), React 18, Zod, Tailwind CSS 3
**Storage**: インメモリストア（`globalThis` + `Map<string, T>`）
**Testing**: Vitest 1.6（単体・統合）, Playwright 1.45（E2E）, React Testing Library 16
**Target Platform**: Node.js 20 / GitHub Actions Ubuntu
**Project Type**: Web application（Next.js App Router）
**Performance Goals**: N/A（プロセス改善機能）
**Constraints**: リリース ZIP は `zip -r` で作成（GitHub Actions）。`.specify/templates/tasks-template.md` のみを含め、他のテンプレート・`.specify/memory/`・`.specify/scripts/` は除外する
**Scale/Scope**: 変更ファイル数: 約 15 ファイル。新規ファイル: 0。新規ディレクトリ: 0

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 影響 | 判定 |
|------|------|------|
| I. コンポーネントファースト設計 | UI コンポーネント変更なし | ✅ 影響なし |
| II. ドメイン駆動設計 | シードデータ分離は infrastructure 層の変更。ドメイン構造は不変 | ✅ 準拠 |
| III. サーバーサイド中心のデータ制御 | API/ユースケース変更なし | ✅ 影響なし |
| IV. 型安全必須 | contracts の後方互換ルール（`.default()` / `.optional()`）は型安全を維持しつつ互換性を確保 | ✅ 準拠 |
| V. セキュリティ最優先 | セキュリティ変更なし | ✅ 影響なし |
| VI. テスト駆動開発必須 | **中心テーマ**。タスクテンプレートの OPTIONAL→MANDATORY 変更で constitution と整合 | ✅ 改善 |
| 品質基準: カバレッジ 80% | constitution-example・constitution にローカルカバレッジ確認手順を追加 | ✅ 強化 |
| 品質基準: E2E 主要導線カバー | CI の `--pass-with-no-tests` 削除で実効性確保 | ✅ 強化 |
| Governance: テンプレート更新 | tasks-template.md を修正し、constitution との整合性を回復。Sync Impact Report を更新 | ✅ 必須対応 |

**GATE 結果**: ✅ 全項目パス。違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/008-quality-guard/
├── plan.md              # This file
├── research.md          # Phase 0: 技術調査
├── data-model.md        # Phase 1: シードデータ分離設計
├── quickstart.md        # Phase 1: 検証手順
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# 変更対象ファイル一覧（系統別）

# ── ec-site-arch 開発用（ZIP 非同梱） ──
.specify/
├── memory/
│   └── constitution.md           # 品質基準追加（E2E 証跡・カバレッジ・URL 検証）
│                                  # Sync Impact Report 更新
└── templates/
    └── tasks-template.md          # OPTIONAL→MANDATORY、Red-Green-Refactor-検証 4 ステップ

# ── リリース ZIP 同梱 ──
.github/workflows/
├── ci.yml                         # --pass-with-no-tests 削除、サンプルリグレッション追加
└── release.yml                    # .specify/templates/ を ZIP に含める

docs/
├── examples/
│   └── constitution-example.md    # 品質ガード概要追加（詳細はテンプレートに委譲）
└── SPECKIT_INTEGRATION.md         # セットアップ手順更新

src/
├── contracts/
│   └── catalog.ts                 # 後方互換検証（既存 .optional()/.default() 確認）
├── infrastructure/
│   └── repositories/
│       └── product.ts             # シードデータ: ベース/拡張分離
└── samples/tests/
    ├── unit/domains/
    │   ├── catalog/
    │   │   ├── usecase.test.ts    # createMockProduct → ProductSchema.parse()
    │   │   └── ui.test.tsx        # createMockProduct → ProductSchema.parse()
    │   ├── cart/
    │   │   ├── usecase.test.ts    # createMockCart → CartSchema.parse()
    │   │   └── ui.test.tsx        # 該当ヘルパーがあれば同様
    │   └── orders/
    │       ├── usecase.test.ts    # createMockOrder → OrderSchema.parse()
    │       └── ui.test.tsx        # 該当ヘルパーがあれば同様
    └── integration/domains/
        ├── catalog/api.test.ts    # createMockProduct → ProductSchema.parse()
        ├── cart/api.test.ts       # createMockCart → CartSchema.parse()
        └── orders/api.test.ts     # createMockOrder → OrderSchema.parse()
```

**Structure Decision**: 既存のプロジェクト構造を維持。新規ディレクトリ・ファイルの追加なし。全変更は既存ファイルの修正。

## Design Decisions

### D1: テンプレート配信モデル

**決定**: `.specify/templates/tasks-template.md` のみをリリース ZIP に含める。`specify init` → ZIP 展開の順序で、タスクテンプレートが上書きされる。他のテンプレート（spec/plan/checklist/agent-file）は `specify init` で配置されるため ZIP には含めない。

**根拠**: 008-quality-guard で修正したのは `tasks-template.md`（TDD 4ステップ構成、MANDATORY化）のみ。未修正のテンプレートを ZIP に含めると、展開先でユーザーがカスタマイズしたテンプレートを上書きするリスクがある。

**release.yml 変更**: 不要なテンプレートを個別に除外:
```yaml
-x ".specify/memory/*" \
-x ".specify/scripts/*" \
-x ".specify/templates/spec-template.md" \
-x ".specify/templates/plan-template.md" \
-x ".specify/templates/checklist-template.md" \
-x ".specify/templates/agent-file-template.md" \
```
これにより `.specify/templates/tasks-template.md` のみが ZIP に含まれる。

### D2: シードデータ分離パターン

**決定**: `sampleProducts` 配列を `BASE_PRODUCTS`（6件、不変）と定義し、export する。本番拡張時は別の配列で追加データを定義し、`initializeProductStore()` でマージする。

**根拠**: 既存の `sampleProducts`（6件）はサンプルテストが依存するベースデータ。本番機能追加時に件数やプロパティを変更するとサンプル E2E テストが破損する。配列を分離し、ベース部分を不変にすることで構造的に保護する。

**パターン**:
```typescript
// ベースデータ（サンプル互換・不変）
export const BASE_PRODUCTS: Product[] = [ /* 既存 6 件 */ ];

// 拡張データ（本番追加分）
export const EXTENSION_PRODUCTS: Product[] = [ /* 本番で追加 */ ];

function initializeProductStore(): Map<string, Product> {
  const all = [...BASE_PRODUCTS, ...EXTENSION_PRODUCTS];
  // ...
}
```

### D3: テストヘルパー Schema.parse() 移行

**決定**: 各ドメインの `createMock*()` ヘルパーを、手動オブジェクト構築から `Schema.parse()` ベースに変更する。

**根拠**: `z.infer<typeof ProductSchema>` の出力型は `.default()` 付きフィールドも required として扱う。手動構築では新フィールド追加時にコンパイルエラーが発生する。`Schema.parse()` は `.default()` を自動補完するため、フィールド追加を吸収できる。

**パターン（Before）**:
```typescript
function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '550e8400-...',
    name: 'テスト商品',
    price: 1000,
    // ... 全フィールド手動列挙
    ...overrides,
  };
}
```

**パターン（After）**:
```typescript
import { ProductSchema } from '@/contracts/catalog';

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return ProductSchema.parse({
    id: '550e8400-...',
    name: 'テスト商品',
    price: 1000,
    description: '商品の説明',
    imageUrl: 'https://example.com/image.jpg',
    status: 'published',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    ...overrides,
  });
}
```

**対象ファイル**: 3 ドメイン × 最大 3 テストファイル = 最大 9 ファイル（ヘルパーが存在するもののみ）

### D4: タスクテンプレート TDD 4 ステップ構造

**決定**: タスクテンプレートの各ユーザーストーリーフェーズを以下の 4 ステップに再構成:

1. **Red（テスト作成）**: ユースケース単体テスト、UI コンポーネント単体テスト、API 統合テスト、E2E テスト
2. **Green（最小実装）**: テストをパスさせる最小限のコード
3. **Refactor（改善）**: 重複排除・命名改善・責務分離（全テストパスを検証）
4. **検証**: E2E テスト実行（証跡付き）+ ローカルカバレッジ確認

**変更箇所**:
- `Tests are OPTIONAL - only include them if explicitly requested` → 削除
- `### Tests for User Story N (OPTIONAL - only if tests requested) ⚠️` → `### Red: テスト作成 (MANDATORY)`
- `### Implementation for User Story N` → `### Green: 最小実装`
- Refactor・検証セクションを新規追加

### D5: CI パイプライン修正

**E2E ジョブ**: `--pass-with-no-tests` を削除。本番 E2E テストファイルが存在しない場合は CI が失敗する。

**quality ジョブ**: サンプルテスト（単体・統合）のリグレッションチェックステップを追加:
```yaml
- name: Sample Unit Tests (Regression)
  run: pnpm test:unit:samples

- name: Sample Integration Tests (Regression)
  run: pnpm test:integration:samples
```

注意: `pnpm test:unit:samples` / `pnpm test:integration:samples` スクリプトが package.json に存在するか確認が必要。存在しない場合は vitest の `--config` オプションでサンプルテスト設定を指定する。

### D6: constitution-example 簡略化

**決定**: constitution-example の品質ガード記述を概要レベルに簡略化し、詳細はテンプレートに委譲する。

**追加するセクション概要**:
- TDD: 「Red-Green-Refactor-検証の 4 ステップで実装」（詳細はテンプレート参照）
- サンプル保護: 「contracts 後方互換・シードデータ分離・インターフェース安定性」の方針
- E2E 証跡: 「E2E テスト実行結果を確認し、パス件数 0 件はエラー」
- カバレッジ: 「各ユーザーストーリー完了時にローカルカバレッジ確認」
- 外部 URL 検証: 「HTTP リクエストで検証。plan 時点では検証済みとしない」

## Constitution Check (Post-Design)

| 原則 | 設計への影響 | 判定 |
|------|-------------|------|
| I. コンポーネントファースト | 変更なし | ✅ |
| II. ドメイン駆動 | シードデータ分離は infrastructure 内部リファクタリング。ドメイン境界不変 | ✅ |
| III. サーバーサイドデータ制御 | 変更なし | ✅ |
| IV. 型安全 | Schema.parse() ベースのテストヘルパーは型安全性を維持 | ✅ |
| V. セキュリティ | 変更なし | ✅ |
| VI. TDD 必須 | テンプレート MANDATORY 化 + 4 ステップ構造で完全準拠 | ✅ 改善 |
| 品質基準 | CI 強化 + ローカルカバレッジ確認追加 | ✅ 強化 |
| Governance: テンプレート更新 | Sync Impact Report 更新予定 | ✅ 対応 |

**GATE 結果**: ✅ 全項目パス。

## Complexity Tracking

違反なし。全変更は既存ファイルの修正であり、新規抽象化やパターンの導入は最小限（シードデータの配列分離のみ）。
