# 実装計画: ECサイト向けアーキテクチャ基盤

**ブランチ**: `001-ec-arch-foundation` | **日付**: 2026-02-05 | **仕様書**: [spec.md](./spec.md)
**入力**: `/specs/001-ec-arch-foundation/spec.md` からの機能仕様

## サマリー

ECサイトを効率的かつ安全に開発するための再利用可能な開発基盤を構築する。
共通アーキテクチャ基盤（認証・認可・セッション管理・エラー処理）と、
ドメイン別のUI・API・テスト実装テンプレートを提供し、
新規ECプロジェクトで即座に利用可能な状態を目指す。

## 技術コンテキスト

**言語/バージョン**: TypeScript 5.x（strict mode 必須）
**フレームワーク**: Next.js 14+（App Router / Server Components）
**主要依存関係**:
- Next.js（UI フレームワーク / Server Components）
- Zod（runtime validation）
- next-auth（セッション管理の参考実装）
- Tailwind CSS（スタイリング）

**ストレージ**: 永続層の実装詳細はスコープ外（インターフェースのみ定義）
**テスト**:
- Vitest（単体テスト / 統合テスト）
- Playwright（E2Eテスト）
- Testing Library（コンポーネントテスト）

**対象プラットフォーム**: Web（モバイル・タブレット・PC レスポンシブ対応）
**プロジェクト種別**: Web アプリケーション（モノレポ構成）

**パフォーマンス目標**:
- 購入者導線を3分以内に完了
- 認可エラー応答を1秒以内

**制約**:
- テストカバレッジ 80% 以上
- TypeScript strict mode 必須
- any 型の使用禁止

**スケール/スコープ**:
- 初期対象ドメイン: Catalog, Cart, Checkout, Orders, Admin
- テンプレートから30分以内に新規ドメイン立ち上げ可能

**UIデザイン参照**:
- 参照サイト: [Ugmonk Analog](https://ugmonk.com/en-jp/collections/analog)
- **参照目的**: ブランド模倣ではなく「レイアウト・情報設計・インタラクション原則」の学習対象
- 学習対象:
  - レイアウト: モジュール式グリッド、豊富な余白（2〜2.4rem）
  - 情報設計: 商品情報と購入導線の優先、不要な視覚要素の排除
  - インタラクション: シンプルなナビゲーション、明確なCTA配置

## Constitution Check

*ゲート: Phase 0 リサーチ開始前に合格必須。Phase 1 設計完了後に再確認。*

| 原則 | 状態 | 確認内容 |
|------|------|----------|
| I. コンポーネントファースト設計 | ✅ 合格 | Server Components 基本、共通コンポーネント優先利用を設計方針に含む |
| II. ドメイン駆動設計 | ✅ 合格 | 5ドメイン（Catalog, Cart, Checkout, Orders, Admin）でUI・API・テストを一体設計 |
| III. サーバーサイド中心のデータ制御 | ✅ 合格 | ユースケース起点、runtime validation、サーバーサイド認可を基盤に組み込み |
| IV. 型安全必須 | ✅ 合格 | TypeScript strict mode、Zod による runtime validation、any 禁止 |
| V. セキュリティ最優先 | ✅ 合格 | ログイン必須、二重認可、セッション方式、CSRF対策、エラーマスキング |
| VI. TDD 必須 | ✅ 合格 | Given-When-Then 形式、80% カバレッジ、テストテンプレート同格扱い |

**品質ゲート**:
- ✅ テスト駆動開発（TDD）必須 → テストテンプレートをフェーズ2で確立
- ✅ テストカバレッジ 80% 以上 → CI 品質ゲートに組み込み
- ✅ CI 自動テスト必須 → GitHub Actions で構成

## プロジェクト構造

### ドキュメント（本フィーチャー）

```text
specs/001-ec-arch-foundation/
├── plan.md              # 本ファイル
├── research.md          # Phase 0 出力
├── data-model.md        # Phase 1 出力
├── quickstart.md        # Phase 1 出力
├── contracts/           # Phase 1 出力（API契約定義）
│   ├── auth.ts          # 認証関連DTO
│   ├── catalog.ts       # Catalogドメイン契約
│   ├── cart.ts          # Cartドメイン契約
│   ├── orders.ts        # Ordersドメイン契約
│   └── errors.ts        # エラーコード定義
├── checklists/          # 品質チェックリスト
│   └── requirements.md
└── tasks.md             # Phase 2 出力（/speckit.tasks コマンド）
```

### ソースコード（リポジトリルート）

```text
src/
├── foundation/                    # 共通アーキテクチャ基盤
│   ├── auth/                      # 認証・認可
│   │   ├── session.ts             # セッション管理
│   │   ├── roles.ts               # ロール定義（buyer/admin）
│   │   ├── authorize.ts           # 認可チェック
│   │   └── csrf.ts                # CSRF対策
│   ├── errors/                    # エラー処理
│   │   ├── types.ts               # エラーコード定義
│   │   ├── handler.ts             # 共通エラーハンドラ
│   │   └── mask.ts                # クライアント向けマスキング
│   ├── logging/                   # ログ・監査
│   │   ├── logger.ts              # ログ出力（個人情報除外）
│   │   └── audit.ts               # 監査フック
│   └── validation/                # バリデーション
│       └── runtime.ts             # Zodベースのruntime validation
│
├── templates/                     # ドメイン別テンプレート
│   ├── ui/                        # UIテンプレート
│   │   ├── pages/                 # 画面パターン
│   │   │   ├── list.tsx           # 一覧画面テンプレート
│   │   │   ├── detail.tsx         # 詳細画面テンプレート
│   │   │   └── form.tsx           # フォーム画面テンプレート
│   │   └── components/            # 共通コンポーネント
│   │       ├── layout/            # レイアウト
│   │       │   ├── Header.tsx     # ヘッダー
│   │       │   ├── Footer.tsx     # フッター
│   │       │   └── Layout.tsx     # メインレイアウト
│   │       └── status/            # ステータス表示
│   │           ├── Loading.tsx    # ローディング
│   │           ├── Error.tsx      # エラー表示
│   │           └── Empty.tsx      # 空状態
│   │
│   ├── api/                       # APIテンプレート
│   │   ├── usecase.ts             # ユースケース雛形
│   │   ├── handler.ts             # APIハンドラ雛形
│   │   └── dto.ts                 # DTO定義パターン
│   │
│   └── tests/                     # テストテンプレート
│       ├── unit/                  # 単体テスト雛形
│       │   ├── usecase.test.ts    # BE単体テスト（ユースケース）
│       │   └── component.test.tsx # FE単体テスト（コンポーネント）
│       ├── integration/           # 統合テスト雛形
│       │   └── api.test.ts        # API統合テスト
│       └── e2e/                   # E2Eテスト雛形
│           ├── buyer-flow.spec.ts # 購入者導線
│           └── admin-flow.spec.ts # 管理者導線
│
├── domains/                       # ドメイン実装例
│   ├── catalog/                   # Catalogドメイン（代表例）
│   │   ├── ui/
│   │   ├── api/
│   │   └── tests/
│   ├── cart/                      # Cartドメイン（代表例）
│   │   ├── ui/
│   │   ├── api/
│   │   └── tests/
│   └── orders/                    # Ordersドメイン（代表例）
│       ├── ui/
│       ├── api/
│       └── tests/
│
└── app/                           # Next.js App Router
    ├── (auth)/                    # 認証グループ
    │   └── login/
    ├── (buyer)/                   # 購入者グループ
    │   ├── catalog/
    │   ├── cart/
    │   └── checkout/
    └── (admin)/                   # 管理者グループ
        └── dashboard/

tests/                             # テストルート
├── unit/
├── integration/
└── e2e/
```

**構造決定**: モノレポ構成を採用。`src/foundation/` に共通基盤、`src/templates/` にテンプレート、
`src/domains/` にドメイン実装例を配置。Next.js App Router のルートグループを活用し、
ロール別のルーティングを実現する。

## 複雑性トラッキング

> 憲章違反がある場合のみ記入

本計画において、憲章違反となる複雑性の追加はなし。

## フェーズ構成

本計画は以下の6フェーズで進行する:

1. **フェーズ1**: 共通アーキテクチャ基盤の構築
2. **フェーズ2**: テスト基盤・品質ゲートの確立（横断）
3. **フェーズ3**: UIテンプレートの構築（共通画面を含む）
4. **フェーズ4**: APIテンプレートの構築（契約と統合テストを含む）
5. **フェーズ5**: ドメインテンプレートの適用（代表例）
6. **フェーズ6**: 統合検証・品質確認（E2E含む）

## マイルストーン

| マイルストーン | 成果物 | 完了条件 |
|----------------|--------|----------|
| M1 | 共通アーキテクチャ基盤 | 認証・認可・セッションが独立動作 |
| M2 | テスト基盤・品質ゲート | BE/FE単体・統合・E2Eテンプレート完成、CI品質ゲート稼働 |
| M3 | UIテンプレート | 共通画面＋画面パターン＋FE単体テスト例完成 |
| M4 | APIテンプレート | 契約定義＋統合テスト雛形＋BE単体テスト例完成 |
| M5 | 代表ドメイン適用 | Catalog/Cart/OrdersでUI/API/テスト同時適用完了 |
| M6 | 統合検証完了 | E2E全パス、カバレッジ80%達成、品質ゲート全通過 |
