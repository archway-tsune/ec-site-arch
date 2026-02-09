# Implementation Plan: サンプル画面と本番画面の完全分離

**Branch**: `007-separate-sample-production` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-separate-sample-production/spec.md`

## Summary

リリースZIP展開後にサンプル実装が本番パスで動作する問題を解決する。現在 `src/app/` に配置されたページ・API Routes は `@/domains/` 経由で `@/samples/` のサンプル実装を利用している。これを以下の方針で完全分離する:

1. 現在の `src/app/` ページ・API Routes をサンプル画面として `src/app/(samples)/sample/` 配下に移動（`/sample/*` URLでアクセス）
2. `src/app/` 本番パスには「ドメイン未実装」スキャフォールドを配置
3. `src/domains/` の `@/samples/` 再エクスポートをスタブ実装に置き換え
4. サンプル画面内の全リンク・API呼び出しを `/sample/` プレフィックスに更新
5. ミドルウェアをサンプルパスに対応
6. サンプルE2Eテストを `/sample/` ベースURLに更新
7. 既存ドキュメントを更新

## Technical Context

**Language/Version**: TypeScript 5 + React 18 + Next.js 14 (App Router)
**Primary Dependencies**: Next.js App Router, Tailwind CSS 3
**Storage**: N/A（インメモリストアは `@/infrastructure/` に配置済み、変更なし）
**Testing**: Vitest 1.6 + React Testing Library 16 + Playwright 1.45
**Target Platform**: Web (Node.js server)
**Project Type**: Web application（Next.js monolith）
**Performance Goals**: N/A（構造変更のみ）
**Constraints**: Next.js App Router のルーティング規約、既存の `@/contracts/` インターフェース不変
**Scale/Scope**: ページ16画面 + API Routes 11本 + レイアウト3本 + ドメインスキャフォールド6本 + E2Eテスト5本 + ドキュメント4本

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. コンポーネントファースト設計 | PASS | 共通コンポーネント（Layout, Header等）はそのまま利用。スキャフォールドページは Server Components として実装 |
| II. ドメイン駆動設計 | PASS | ドメイン層（`src/domains/`）の構造を維持。スタブ実装に置き換えるが、インターフェースは同一 |
| III. サーバーサイド中心のデータ制御 | PASS | API Routes の構造は維持。スタブは 501 レスポンスを返すのみ |
| IV. 型安全必須 | PASS | ドメインスタブは既存の型定義（`@/contracts/`）に準拠 |
| V. セキュリティ最優先 | PASS | ミドルウェアの認証・認可をサンプルパスにも適用 |
| VI. TDD必須 | PASS | サンプルE2Eテストを `/sample/` 対応に更新。本番スキャフォールドは固定テキスト表示のみ（「ドメイン未実装」メッセージ）であり、ビジネスロジック・分岐・状態管理を含まないため、テスト対象外とする |
| テストカバレッジ 80%以上 | PASS | 既存テストの移行。カバレッジ対象に変更なし |

## Project Structure

### Documentation (this feature)

```text
specs/007-separate-sample-production/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (by /speckit.tasks)
```

### Source Code (repository root)

```text
src/app/
├── layout.tsx                          # 変更なし（共通ルートレイアウト）
├── globals.css                         # 変更なし
├── middleware.ts                       # 更新: /sample/ パスの認証対応
├── page.tsx                            # 置換: 本番スキャフォールド（「ドメイン未実装」）
├── login/page.tsx                      # 維持（基盤機能: @/infrastructure/ のみ依存）
├── (buyer)/                            # 本番購入者画面（スキャフォールド）
│   ├── layout.tsx                      # 置換: 本番スキャフォールド
│   ├── catalog/page.tsx                # 置換: 本番スキャフォールド
│   ├── catalog/[id]/page.tsx           # 置換: 本番スキャフォールド
│   ├── cart/page.tsx                   # 置換: 本番スキャフォールド
│   ├── checkout/page.tsx               # 置換: 本番スキャフォールド
│   ├── orders/page.tsx                 # 置換: 本番スキャフォールド
│   └── orders/[id]/page.tsx            # 置換: 本番スキャフォールド
├── admin/                              # 本番管理者画面（スキャフォールド）
│   ├── layout.tsx                      # 置換: 本番スキャフォールド
│   ├── page.tsx                        # 置換: 本番スキャフォールド
│   ├── login/page.tsx                  # 維持（基盤機能: @/infrastructure/ のみ依存）
│   ├── logout/page.tsx                 # 維持（基盤機能: @/infrastructure/ のみ依存）
│   ├── products/page.tsx               # 置換: 本番スキャフォールド
│   ├── products/new/page.tsx           # 置換: 本番スキャフォールド
│   ├── products/[id]/edit/page.tsx     # 置換: 本番スキャフォールド
│   ├── orders/page.tsx                 # 置換: 本番スキャフォールド
│   └── orders/[id]/page.tsx            # 置換: 本番スキャフォールド
├── api/                                # 本番API Routes（スタブ経由）
│   ├── auth/login/route.ts             # 維持（@/infrastructure/ のみ依存）
│   ├── auth/logout/route.ts            # 維持（@/infrastructure/ のみ依存）
│   ├── auth/session/route.ts           # 維持（@/infrastructure/ のみ依存）
│   ├── test/reset/route.ts             # 維持（@/infrastructure/ のみ依存）
│   ├── catalog/products/route.ts       # 維持（@/domains/ スタブ → 501）
│   ├── catalog/products/[id]/route.ts  # 維持（@/domains/ スタブ → 501）
│   ├── cart/route.ts                   # 維持（@/domains/ スタブ → 501）
│   ├── cart/items/route.ts             # 維持（@/domains/ スタブ → 501）
│   ├── cart/items/[productId]/route.ts # 維持（@/domains/ スタブ → 501）
│   ├── orders/route.ts                 # 維持（@/domains/ スタブ → 501）
│   └── orders/[id]/route.ts           # 維持（@/domains/ スタブ → 501）
└── (samples)/sample/                   # サンプル画面（新規作成）
    ├── page.tsx                        # 移動元: src/app/page.tsx
    ├── login/page.tsx                  # 移動元: src/app/login/page.tsx
    ├── (buyer)/
    │   ├── layout.tsx                  # 移動元 + リンク更新
    │   ├── catalog/page.tsx            # 移動元 + API URL更新
    │   ├── catalog/[id]/page.tsx       # 移動元 + API URL更新
    │   ├── cart/page.tsx               # 移動元 + API URL更新
    │   ├── checkout/page.tsx           # 移動元 + API URL更新
    │   ├── orders/page.tsx             # 移動元 + API URL更新
    │   └── orders/[id]/page.tsx        # 移動元 + API URL更新
    ├── admin/
    │   ├── layout.tsx                  # 移動元 + リンク更新
    │   ├── page.tsx                    # 移動元 + API URL更新
    │   ├── login/page.tsx              # 移動元 + リンク更新
    │   ├── logout/page.tsx             # 移動元 + リンク更新
    │   ├── products/page.tsx           # 移動元 + API URL更新
    │   ├── products/new/page.tsx       # 移動元 + API URL更新
    │   ├── products/[id]/edit/page.tsx # 移動元 + API URL更新
    │   ├── orders/page.tsx             # 移動元 + API URL更新
    │   └── orders/[id]/page.tsx        # 移動元 + API URL更新
    └── api/                            # サンプルAPI Routes（新規作成）
        ├── auth/login/route.ts         # 複製元: src/app/api/auth/login/
        ├── auth/logout/route.ts        # 複製元: src/app/api/auth/logout/
        ├── auth/session/route.ts       # 複製元: src/app/api/auth/session/
        ├── test/reset/route.ts         # 複製元: src/app/api/test/reset/
        ├── catalog/products/route.ts   # 複製元 + import を @/samples/domains/ に変更
        ├── catalog/products/[id]/route.ts
        ├── cart/route.ts               # 複製元 + import を @/samples/domains/ に変更
        ├── cart/items/route.ts
        ├── cart/items/[productId]/route.ts
        ├── orders/route.ts             # 複製元 + import を @/samples/domains/ に変更
        └── orders/[id]/route.ts

src/domains/                            # スタブ実装に置き換え
├── README.md                           # 更新
├── catalog/
│   ├── api/index.ts                    # @/samples/ 再エクスポート → スタブ
│   └── ui/index.ts                     # @/samples/ 再エクスポート → プレースホルダー
├── cart/
│   ├── api/index.ts                    # @/samples/ 再エクスポート → スタブ
│   └── ui/index.ts                     # @/samples/ 再エクスポート → プレースホルダー
└── orders/
    ├── api/index.ts                    # @/samples/ 再エクスポート → スタブ
    └── ui/index.ts                     # @/samples/ 再エクスポート → プレースホルダー
```

**Structure Decision**: 既存の Next.js App Router 構成を維持し、`(samples)` ルートグループを追加。本番 API Routes は既存ファイルを維持し、catch ブロックに `NotImplementedError` のハンドリング（501 レスポンス）を追加する。認証関連ページ（`login/`, `admin/login/`, `admin/logout/`）は `@/infrastructure/` のみに依存する基盤機能のため、本番でもそのまま維持する。サンプル API Routes は既存 API Routes を複製し、import 先を `@/samples/domains/` に変更する。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| サンプルAPI Routes の複製 | サンプル画面が独立して動作するには `/sample/api/*` が必要 | 共有API（`/api/*`）はドメインスタブ経由で501を返すため、サンプル画面から利用不可 |
