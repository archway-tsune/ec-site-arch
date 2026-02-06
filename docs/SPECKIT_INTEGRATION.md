# Speckit連携ガイド

このアーキテクチャテンプレートをspeckitで使用する方法を説明します。

## 関連ドキュメント

- [GETTING_STARTED.md](./GETTING_STARTED.md) - セットアップ手順
- [constitution-example.md](./examples/constitution-example.md) - `/speckit.constitution` の入力例
- [spec-template.md](./examples/spec-template.md) - 機能仕様のテンプレート例

---

## 1. セットアップフロー

```
1. speckit init my-ec-project --ai claude  # プロジェクトディレクトリと設定が作成される
2. cd my-ec-project                        # プロジェクトディレクトリに移動
3. ec-site-arch.zip 解凍                    # アーキテクチャコードを展開
4. /speckit.constitution                   # プロジェクト憲法を作成（セットアップ手順を含む）
5. 開発開始
```

### ディレクトリ構成

```
my-ec-project/
├── .claude/
│   └── commands/           ← speckit init で作成（スキル定義）
│       ├── speckit.specify.md
│       ├── speckit.plan.md
│       ├── speckit.tasks.md
│       ├── speckit.implement.md
│       └── ...
│
├── .specify/               ← speckit init で作成
│   ├── memory/
│   │   └── constitution.md ← /speckit.constitution で作成
│   └── templates/
│
├── src/                    ← zip から展開
│   ├── foundation/         # 共通基盤
│   ├── templates/          # 再利用テンプレート
│   ├── samples/            # サンプル実装（参考）
│   ├── domains/            # 本番ドメイン実装
│   └── app/                # Next.js App Router
│
├── tests/                  ← zip から展開
├── docs/                   ← zip から展開
└── package.json            ← zip から展開
```

---

## 2. 開発ワークフロー

### 新機能を追加する場合

```bash
# 1. 機能仕様を作成
/speckit.specify "ユーザープロフィール機能を追加"

# 2. 実装計画を作成
/speckit.plan

# 3. タスクを生成
/speckit.tasks

# 4. 実装を開始
/speckit.implement
```

### 機能仕様の例

`/speckit.specify` を実行すると、以下のような仕様書が生成されます：

```markdown
# Feature: ユーザープロフィール

## 概要
ユーザーが自分のプロフィール情報を閲覧・編集できる機能

## ユーザーストーリー
- As a buyer, I want to view my profile, so that I can check my information
- As a buyer, I want to edit my profile, so that I can update my information

## 機能要件

### FR-001: プロフィール表示
- 説明: ログインユーザーが自分のプロフィールを閲覧できる
- 優先度: Must
- 関連UI: `src/domains/profile/ui/ProfileView.tsx`
- 関連API: `GET /api/profile`
```

---

## 3. アーキテクチャとの対応表

### テンプレート対応

| 要件タイプ | テンプレート | パス |
|-----------|-------------|------|
| 一覧画面 | ListPageTemplate | `@/templates/ui/pages/list` |
| 詳細画面 | DetailPageTemplate | `@/templates/ui/pages/detail` |
| フォーム画面 | FormPageTemplate | `@/templates/ui/pages/form` |
| ログイン画面 | LoginPageTemplate | `@/templates/ui/pages/login` |
| 購入者レイアウト | BuyerLayout | `@/templates/ui/layouts/BuyerLayout` |
| 管理者レイアウト | AdminLayout | `@/templates/ui/layouts/AdminLayout` |
| ユースケース | createUseCase | `@/templates/api/usecase` |
| APIハンドラ | createHandler | `@/templates/api/handler` |
| リポジトリ | createHmrSafeStore | `@/templates/infrastructure/repository` |

### 認証・認可

| 要件 | 実装 |
|-----|------|
| ログイン必須 | `requireAuth()` |
| 管理者のみ | `requireRole(request, 'admin')` |
| 購入者のみ | `requireRole(request, 'buyer')` |

---

## 4. タスク生成の指針

`/speckit.tasks` で生成されるタスクは以下の構成になります：

```markdown
# Tasks: ユーザープロフィール

## フェーズ1: ドメイン実装

### Task 1-1: Profileドメイン実装
- [ ] T001 型定義を実装する `src/domains/profile/types/index.ts`
- [ ] T002 [P] UIコンポーネントを実装する `src/domains/profile/ui/`
- [ ] T003 [P] APIユースケースを実装する `src/domains/profile/api/usecases.ts`
- [ ] T004 リポジトリを実装する `src/infrastructure/repositories/profile.ts`

### Task 1-2: ページ実装
- [ ] T005 プロフィールページを実装する `src/app/(buyer)/profile/page.tsx`
- [ ] T006 編集ページを実装する `src/app/(buyer)/profile/edit/page.tsx`
- [ ] T007 [P] APIルートを実装する `src/app/api/profile/route.ts`

### Task 1-3: テスト実装
- [ ] T008 [P] 単体テストを実装する `tests/unit/domains/profile/`
- [ ] T009 E2Eテストを実装する `tests/e2e/profile.spec.ts`

## 依存関係
- T001 → T002, T003, T004
- T004 → T007
- T002, T003 → T005, T006
```

---

## 5. サンプル実装の参照

speckitで実装する際は、サンプル実装を参考にしてください：

### Catalogドメイン（商品管理）
- 一覧・詳細表示
- 検索・フィルタ
- ページネーション

参照: `src/samples/domains/catalog/`

### Cartドメイン（カート）
- 商品追加・削除
- 数量変更
- 合計計算

参照: `src/samples/domains/cart/`

### Ordersドメイン（注文）
- 注文作成
- 注文履歴
- ステータス管理

参照: `src/samples/domains/orders/`

---

## 6. 品質基準

speckit仕様に以下の品質基準が適用されます：

### テスト
- 単体テストカバレッジ: 80%以上
- E2Eテスト: 主要導線をカバー

### コード品質
- TypeScript: strictモード、エラー0件
- ESLint: エラー0件

### パフォーマンス
- 一覧ページ: 初回ロード 3秒以内
- API応答: 500ms以内

---

## 7. 憲法（constitution.md）について

`/speckit.constitution` を実行すると、プロジェクト固有の憲法が作成されます。

憲法には以下が含まれます：
- プロジェクト概要・技術スタック
- **アーキテクチャのセットアップ手順**（依存関係インストール、プロジェクト情報更新）
- アーキテクチャ原則
- 品質基準・テストコマンド
- ディレクトリ構成・命名規約
- 認証・認可パターン

憲法はspeckitの各コマンド（specify, plan, tasks, implement）で参照され、
一貫した実装を保証します。

入力例は `docs/examples/constitution-example.md` を参照してください。
