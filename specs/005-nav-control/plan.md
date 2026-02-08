# Implementation Plan: リリースZIP展開後のナビゲーション制御

**Branch**: `005-nav-control` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-nav-control/spec.md`

## Summary

購入者レイアウトと管理者レイアウトのナビゲーションリンクを、ZIP展開直後は空（または最小限）とし、ドメイン実装時に開発者が追加する方式に変更する。既存のサンプル実装では全リンクを維持する。

## Technical Context

**Language/Version**: TypeScript 5 + React 18
**Primary Dependencies**: Next.js 14 (App Router)
**Storage**: N/A（ナビゲーション定義の変更のみ）
**Testing**: Vitest 1.6 + React Testing Library 16（単体テスト）、Playwright 1.45（E2E）
**Target Platform**: Web（Node.js）
**Project Type**: Web application
**Performance Goals**: N/A（静的なナビゲーション定義の変更）
**Constraints**: 既存のE2Eテスト・単体テストがパスすること
**Scale/Scope**: レイアウトファイル2つの変更 + ドキュメント更新

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 適合 | 備考 |
|------|------|------|
| I. コンポーネントファースト設計 | ✅ | 既存コンポーネント（Header, AdminLayout）の利用方法の変更のみ |
| II. ドメイン駆動設計 | ✅ | ドメイン単位でナビゲーションを制御する設計に整合 |
| III. サーバーサイド中心のデータ制御 | ✅ | 影響なし |
| IV. 型安全必須 | ✅ | NavLink[] 型は維持 |
| V. セキュリティ最優先 | ✅ | 影響なし |
| VI. テスト駆動開発（TDD）必須 | ✅ | 既存テストの振る舞い維持を検証 |
| テストカバレッジ80% | ✅ | 変更箇所はレイアウトファイル（E2Eテスト対象）のみ |
| ドキュメントは日本語 | ✅ | 日本語で記述 |

## Project Structure

### Documentation (this feature)

```text
specs/005-nav-control/
├── spec.md              # 機能仕様書
├── plan.md              # 本ファイル
├── research.md          # Phase 0 調査結果
├── quickstart.md        # Phase 1 クイックスタート
└── checklists/
    └── requirements.md  # 品質チェックリスト
```

### Source Code (repository root)

```text
# 変更対象ファイル
src/app/(buyer)/layout.tsx    # navLinks を空配列に変更
src/app/admin/layout.tsx      # navLinks をダッシュボードのみに変更

# ドキュメント更新対象
docs/examples/constitution-example.md
docs/examples/spec-catalog-example.md
docs/examples/spec-cart-example.md
docs/examples/spec-order-example.md
docs/examples/spec-product-example.md
src/samples/README.md
README.md
```

**Structure Decision**: 既存ファイルの変更のみ。新規ファイル・ディレクトリの作成なし。

### 変更内容

#### src/app/(buyer)/layout.tsx

変更前:
```typescript
const navLinks = [
  { href: '/catalog', label: '商品一覧' },
  { href: '/cart', label: 'カート' },
  { href: '/orders', label: '注文履歴' },
];
```

変更後:
```typescript
const navLinks: NavLink[] = [
  // ドメイン実装時にリンクを追加する:
  // { href: '/catalog', label: '商品一覧' },
  // { href: '/cart', label: 'カート' },
  // { href: '/orders', label: '注文履歴' },
];
```

#### src/app/admin/layout.tsx

変更前:
```typescript
const navLinks = [
  { href: '/admin', label: 'ダッシュボード' },
  { href: '/admin/products', label: '商品管理' },
  { href: '/admin/orders', label: '注文管理' },
];
```

変更後:
```typescript
const navLinks = [
  { href: '/admin', label: 'ダッシュボード' },
  // ドメイン実装時にリンクを追加する:
  // { href: '/admin/products', label: '商品管理' },
  // { href: '/admin/orders', label: '注文管理' },
];
```

### ドキュメント更新方針

- `docs/examples/` の各入力例: `/speckit.plan` の入力にナビゲーションリンク追加手順を含める
- `src/samples/README.md`: ナビゲーション制御の説明を追加
- `README.md`: プロジェクト構成にナビゲーション制御の記述を追加（必要に応じて）

### 既存テストへの影響

- **E2Eテスト**: サンプル実装が存在するため全リンクが表示される → テストに影響なし
- **単体テスト**: navLinks は Header/Layout コンポーネントに props で渡される → テストに影響なし
- **結論**: navLinks の変更はアプリレイアウトファイル内のみであり、テンプレートコンポーネントやサンプル実装のテストに影響しない

## Complexity Tracking

複雑さの追加なし。既存ファイルの数行変更のみ。
