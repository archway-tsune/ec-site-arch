# EC Site Architecture Template

ECサイト開発のためのアーキテクチャ基盤テンプレートです。

## 特徴

- **認証・認可基盤**: セッション管理、RBAC（buyer/admin）、CSRF対策
- **UIテンプレート**: レイアウト、フォーム、一覧・詳細・登録画面
- **APIテンプレート**: ユースケース、ハンドラー、DTO
- **テストテンプレート**: 単体・統合・E2Eテスト
- **品質ゲート**: TypeScript strict、ESLint、カバレッジ80%

## 技術スタック

- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- Zod (バリデーション)
- Vitest (単体・統合テスト)
- Playwright (E2Eテスト)

---

## クイックスタート

### 1. テンプレートから新規プロジェクト作成

GitHubで「**Use this template**」ボタンをクリック

### 2. セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_ORG/YOUR_PROJECT.git
cd YOUR_PROJECT

# 依存関係をインストール
pnpm install

# 開発サーバー起動
pnpm dev
```

### 3. プロジェクトをカスタマイズ

```bash
# package.jsonの名前を変更
# - "name": "ec-site-arch" → "your-project-name"

# samples/ディレクトリを確認（実装の参考に）
# domains/ディレクトリに本番実装を開始
```

---

## ディレクトリ構成

```
src/
├── foundation/          # 共通基盤（認証・エラー・ログ・バリデーション）
│   ├── auth/           # 認証・認可・CSRF
│   ├── errors/         # エラーハンドリング
│   ├── logging/        # ログ・監査
│   └── validation/     # ランタイムバリデーション
│
├── templates/           # 再利用テンプレート
│   ├── api/            # APIテンプレート（usecase, handler, dto）
│   ├── ui/             # UIテンプレート（layouts, pages, components）
│   ├── infrastructure/ # インフラテンプレート（repository, session）
│   └── tests/          # テストテンプレート
│
├── samples/             # サンプル実装（参考用）
│   └── domains/        # Catalog, Cart, Ordersのサンプル
│
├── domains/             # 本番ドメイン実装（ここに実装）
│
├── infrastructure/      # インフラ層実装
│
└── app/                 # Next.js App Router
    ├── (buyer)/        # 購入者向け画面
    ├── admin/          # 管理者向け画面
    └── api/            # APIルート
```

---

## 展開後の作業

### Step 1: プロジェクト情報の更新

```json
// package.json
{
  "name": "your-project-name",
  "description": "Your project description"
}
```

### Step 2: サンプル実装の確認

`src/samples/domains/` に以下のサンプル実装があります：

- **Catalog**: 商品一覧・詳細
- **Cart**: カート操作
- **Orders**: 注文管理

これらを参考に、`src/domains/` に本番実装を作成してください。

### Step 3: 新規ドメインの実装

```bash
# 例: Paymentドメインを追加
src/domains/payment/
├── api/
│   └── usecases.ts      # APIユースケース
├── ui/
│   └── PaymentForm.tsx  # UI コンポーネント
└── tests/
    └── unit/            # 単体テスト
```

### Step 4: テストの実行

```bash
# 単体テスト
pnpm test:unit

# 統合テスト
pnpm test:integration

# E2Eテスト
pnpm test:e2e

# カバレッジ
pnpm test:coverage
```

---

## デモユーザー

| ロール | メール | パスワード |
|-------|--------|-----------|
| 購入者 | buyer@example.com | demo |
| 管理者 | admin@example.com | demo |

---

## スクリプト

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm test` | テスト実行（watch mode） |
| `pnpm test:unit` | 単体テスト |
| `pnpm test:integration` | 統合テスト |
| `pnpm test:e2e` | E2Eテスト |
| `pnpm test:coverage` | カバレッジレポート |
| `pnpm lint` | ESLint実行 |
| `pnpm typecheck` | TypeScript型チェック |

---

## 品質基準

- TypeScript: strictモード、エラー0件
- ESLint: エラー0件
- テストカバレッジ: 80%以上
- E2Eテスト: 全シナリオ成功

---

## ライセンス

MIT
