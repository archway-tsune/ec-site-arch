# 実装計画: UIテンプレートコンポーネントの拡充

**ブランチ**: `002-ui-template-components` | **作成日**: 2026-02-07 | **仕様**: [spec.md](./spec.md)
**入力**: `/specs/002-ui-template-components/spec.md` の機能仕様

## 概要

speckit-trainingリポジトリの3ドメイン（catalog/cart/orders）実装で発見された重複UIパターンを、再利用可能なテンプレートコンポーネントとして共通化する。Pagination（3箇所重複）、formatPrice（6箇所重複）、ImagePlaceholder（3箇所重複）、StatusBadge（2箇所重複）、SearchBar、QuantitySelectorの5コンポーネント+2ユーティリティ関数を追加する。

## 技術コンテキスト

**言語/バージョン**: TypeScript 5, React 18, Next.js 14 (App Router)
**主要依存関係**: Tailwind CSS 3, Zod（バリデーション）
**ストレージ**: N/A（UIコンポーネントのみ）
**テスト**: Vitest 1.6 + React Testing Library 16 + Playwright 1.45
**対象プラットフォーム**: Web（モバイルファースト、レスポンシブ）
**プロジェクト種別**: Webアプリケーション（Next.js App Router）
**パフォーマンス目標**: N/A（UIコンポーネントライブラリ、パフォーマンスクリティカルではない）
**制約**: 既存テンプレートパターン準拠、Tailwind CSS base-900/base-50カラーパレット、アクセシビリティ必須
**規模/スコープ**: 5コンポーネント + 2ユーティリティ関数 + テスト + ドキュメント更新

## 設計原則チェック

*ゲート: フェーズ0調査の前に通過必須。フェーズ1設計後に再チェック。*

| 原則 | 準拠状況 | 備考 |
|------|----------|------|
| I. コンポーネントファースト設計 | 合格 | 共通コンポーネントの拡充そのもの |
| II. ドメイン駆動設計 | 合格 | ドメインに依存しない汎用テンプレート |
| III. サーバーサイド中心のデータ制御 | 該当なし | UIコンポーネントのみ、データ制御なし |
| IV. 型安全必須 | 合格 | TypeScript strict mode、Props型定義必須 |
| V. セキュリティ最優先 | 該当なし | UIコンポーネントのみ、セキュリティ影響なし |
| VI. テスト駆動開発（TDD）必須 | 合格 | Given-When-Then形式の単体テスト必須 |

**ゲート結果: 合格** — 全原則に準拠、違反なし。

## プロジェクト構造

### ドキュメント（本フィーチャー）

```text
specs/002-ui-template-components/
├── plan.md              # 本ファイル
├── research.md          # フェーズ0 成果物
├── data-model.md        # フェーズ1 成果物
├── quickstart.md        # フェーズ1 成果物
├── contracts/           # フェーズ1 成果物
│   └── components.ts    # コンポーネントProps型定義
└── tasks.md             # フェーズ2 成果物（/speckit.tasks）
```

### ソースコード（リポジトリルート）

```text
src/templates/ui/
├── components/
│   ├── navigation/
│   │   ├── Pagination.tsx        # ページネーション
│   │   └── index.ts
│   ├── data-display/
│   │   ├── StatusBadge.tsx       # ステータスバッジ
│   │   ├── ImagePlaceholder.tsx  # 画像プレースホルダー
│   │   └── index.ts
│   ├── form/
│   │   ├── FormField.tsx         # （既存）
│   │   ├── SearchBar.tsx         # 検索バー
│   │   ├── QuantitySelector.tsx  # 数量セレクター
│   │   └── index.ts              # （更新）
│   ├── dialog/
│   │   ├── ConfirmDialog.tsx     # （既存）
│   │   └── index.ts
│   ├── status/                   # （既存）
│   ├── layout/                   # （既存）
│   └── auth/                     # （既存）
├── utils/
│   ├── events.ts                 # （既存）
│   ├── format.ts                 # 価格・日時フォーマット
│   └── index.ts                  # （更新）
├── DESIGN_GUIDE.md               # （更新）
└── ...

tests/unit/templates/ui/
├── components/
│   ├── navigation.test.tsx       # Pagination テスト
│   ├── data-display.test.tsx     # StatusBadge, ImagePlaceholder テスト
│   ├── form-extended.test.tsx    # SearchBar, QuantitySelector テスト
│   └── ...                       # （既存テスト）
└── utils/
    └── format.test.ts            # formatPrice, formatDateTime テスト
```

**構造の判断**: 既存の `src/templates/ui/components/` 配下にカテゴリ別サブディレクトリ（navigation, data-display）を追加。フォーム系は既存の `form/` に追加。ユーティリティは既存の `utils/` に追加。

## 複雑性トラッキング

違反なし。追加の正当化は不要。
