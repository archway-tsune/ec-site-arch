# 実装計画: サンプル・本番分離アーキテクチャ

**ブランチ**: `003-decouple-samples` | **日付**: 2026-02-08 | **仕様**: [spec.md](./spec.md)
**入力**: `specs/003-decouple-samples/spec.md` の機能仕様書

## サマリー

本番コード（APIルート7ファイル・ページ5ファイル・インフラ層3ファイル）から `@/samples/` への直接 import を排除し、共有契約層（`src/contracts/`）と本番ドメイン層（`src/domains/`）を参照先とするアーキテクチャリファクタリング。暫定スキャフォールドとしてサンプルの再エクスポートを配置し、段階的な本番実装への置き換えを可能にする。リリースZIPにアーキテクチャE2Eテストを参照用として同梱する。

## 技術コンテキスト

**言語/バージョン**: TypeScript 5 (strict mode)
**主要依存**: Next.js 14 (App Router), React 18, Zod, Tailwind CSS 3
**ストレージ**: インメモリ（既存のリポジトリ実装を維持）
**テスト**: Vitest 1.6 + React Testing Library 16 + Playwright 1.45
**対象プラットフォーム**: Web (Node.js サーバー)
**プロジェクト種別**: Web アプリケーション (Next.js monolith)
**パフォーマンス目標**: 既存動作と同一（リファクタリングのため変更なし）
**制約**: 既存DTOスキーマ不変、サンプルの機能・振る舞い不変、既存テスト全通過
**スケール/スコープ**: 15ファイルの import 先変更 + 契約層への型追加 + ドメイン層スキャフォールド作成

## 憲章チェック

*ゲート: Phase 0 研究前に通過必須。Phase 1 設計後に再チェック。*

| 原則 | 適合状況 | 備考 |
|------|---------|------|
| I. コンポーネントファースト設計 | 適合 | UIコンポーネントの構造は変更しない。import パスのみ変更 |
| II. ドメイン駆動設計 | 適合 | ドメイン単位の分離を強化。各ドメインが独立した src/domains/ 配下に配置される |
| III. サーバーサイド中心のデータ制御 | 適合 | ユースケース起点の構成を維持。参照先のみ変更 |
| IV. 型安全必須 | 適合 | リポジトリインターフェースを共有契約に集約し、型の一元管理を強化 |
| V. セキュリティ最優先 | 適合 | 認証・認可の仕組みに変更なし |
| VI. TDD必須 | 適合 | 既存テストをすべて維持。各ステップで型チェック・テスト通過を確認 |

**ゲート結果**: 全原則に適合。違反なし。

## プロジェクト構成

### ドキュメント（本機能）

```text
specs/003-decouple-samples/
├── spec.md              # 機能仕様書
├── plan.md              # 本ファイル
├── research.md          # Phase 0: 研究結果
├── data-model.md        # Phase 1: 依存関係モデル
├── quickstart.md        # Phase 1: クイックスタート
├── contracts/           # Phase 1: 追加する契約定義
│   └── repository-interfaces.md
└── checklists/
    └── requirements.md  # 仕様品質チェックリスト
```

### ソースコード（変更対象）

```text
src/
├── contracts/               # 既存DTOスキーマ + リポジトリインターフェース追加
│   ├── catalog.ts           # ProductRepository 追加
│   ├── cart.ts              # CartRepository, ProductFetcher 追加
│   └── orders.ts            # OrderRepository, CartFetcher 追加
├── domains/                 # 暫定スキャフォールド新規作成
│   ├── catalog/
│   │   ├── api/
│   │   │   └── index.ts     # サンプルの再エクスポート
│   │   └── ui/
│   │       └── index.ts     # サンプルの再エクスポート
│   ├── cart/
│   │   ├── api/
│   │   │   └── index.ts
│   │   └── ui/
│   │       └── index.ts
│   └── orders/
│       ├── api/
│       │   └── index.ts
│       └── ui/
│           └── index.ts
├── infrastructure/
│   └── repositories/        # import 先を contracts に変更（3ファイル）
│       ├── product.ts
│       ├── cart.ts
│       └── order.ts
├── app/
│   ├── api/                 # import 先を @/domains/ に変更（7ファイル）
│   │   ├── catalog/products/route.ts
│   │   ├── catalog/products/[id]/route.ts
│   │   ├── cart/route.ts
│   │   ├── cart/items/route.ts
│   │   ├── cart/items/[productId]/route.ts
│   │   ├── orders/route.ts
│   │   └── orders/[id]/route.ts
│   └── (buyer)/             # import 先を @/domains/ に変更（5ファイル）
│       ├── catalog/page.tsx
│       ├── catalog/[id]/page.tsx
│       ├── cart/page.tsx
│       ├── orders/page.tsx
│       └── orders/[id]/page.tsx
├── samples/domains/         # import パスを共有契約に変更（構造的修正のみ）
│   ├── catalog/api/usecases.ts
│   ├── cart/api/usecases.ts
│   └── orders/api/usecases.ts
scripts/
└── create-release-zip.ps1   # tests/e2e/arch/ の除外を解除
docs/                        # ドキュメント更新（7ファイル）
docs/examples/               # 入力例更新（5ファイル）
```

**構成判断**: 既存の Next.js monolith 構成を維持。新規ディレクトリは `src/domains/{domain}/api/` と `src/domains/{domain}/ui/` のみ追加。既存の `src/contracts/` と `src/infrastructure/` の構成は変更しない。

## 複雑さの追跡

> 憲章チェックに違反がないため、本セクションは不要。
