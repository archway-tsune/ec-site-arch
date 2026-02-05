# EC Site Architecture Template

ECサイト開発のためのアーキテクチャ基盤テンプレートです。

## プロジェクト構成

```
your-project/
├── ec-site-arch/           # アプリケーションコード（speckit実行）
│   ├── .specify/memory/
│   │   └── constitution.md # 憲法（ここに保存）
│   └── src/
├── specs/                  # speckit仕様（機能仕様）
│   └── 001-feature/
└── README.md
```

## クイックスタート

### 1. テンプレートから新規プロジェクト作成

GitHubで「**Use this template**」→「**Create a new repository**」

### 2. クローン＆セットアップ

```bash
git clone https://github.com/YOUR_ORG/your-ec-site.git
cd your-ec-site

# アプリケーションディレクトリに移動
cd ec-site-arch
pnpm install

# 動作確認
pnpm dev
# http://localhost:3000
```

### 3. speckit憲法の作成

```bash
# ec-site-arch ディレクトリで実行（移動不要）
/speckit.constitution
# → .specify/memory/constitution.md が上書きされる
```

**注意**: テンプレートの `constitution.md` はアーキテクチャ基盤用です。
必ず実行して、プロジェクト固有の内容に上書きしてください。

入力例は `ec-site-arch/docs/examples/constitution-example.md` を参照

### 4. 機能開発

```bash
# ec-site-arch ディレクトリで実行
/speckit.specify "新機能の説明"
/speckit.plan
/speckit.tasks
/speckit.implement
```

---

## ディレクトリ説明

### ec-site-arch/（アプリケーションコード）

```
ec-site-arch/
├── src/
│   ├── foundation/     # 共通基盤（認証・エラー・ログ）
│   ├── templates/      # 再利用テンプレート
│   ├── samples/        # サンプル実装（参考用）
│   ├── domains/        # 本番ドメイン実装
│   └── app/            # Next.js App Router
├── tests/              # テスト
└── docs/               # ドキュメント
```

詳細は [ec-site-arch/README.md](./ec-site-arch/README.md) を参照

### specs/（speckit仕様）

```
specs/
└── 001-feature-name/         # 機能仕様
    ├── spec.md
    ├── plan.md
    └── tasks.md
```

**注意**: 憲法（constitution）は `ec-site-arch/.specify/memory/constitution.md` に保存されます。

---

## 開発コマンド

```bash
# アプリケーションディレクトリで実行
cd ec-site-arch

pnpm dev              # 開発サーバー
pnpm build            # ビルド
pnpm test             # テスト（watch mode）
pnpm test:unit        # 単体テスト
pnpm test:e2e         # E2Eテスト
pnpm test:coverage    # カバレッジ
pnpm lint             # ESLint
pnpm typecheck        # TypeScript型チェック
```

---

## デモユーザー

| ロール | メール | パスワード |
|-------|--------|-----------|
| 購入者 | buyer@example.com | demo |
| 管理者 | admin@example.com | demo |

---

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [ec-site-arch/README.md](./ec-site-arch/README.md) | アプリケーション詳細 |
| [ec-site-arch/docs/GETTING_STARTED.md](./ec-site-arch/docs/GETTING_STARTED.md) | セットアップガイド |
| [ec-site-arch/docs/SPECKIT_INTEGRATION.md](./ec-site-arch/docs/SPECKIT_INTEGRATION.md) | speckit連携ガイド |
| [ec-site-arch/docs/examples/](./ec-site-arch/docs/examples/) | 仕様テンプレート例 |

---

## ライセンス

MIT
