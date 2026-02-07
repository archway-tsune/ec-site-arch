# EC Site Architecture Template

ECサイト開発のためのアーキテクチャ基盤テンプレートです。
speckitと組み合わせてAI駆動開発を行うことを想定しています。

## 特徴

- **認証・認可基盤**: セッション管理、RBAC（buyer/admin）、CSRF対策
- **UIテンプレート**: レイアウト、フォーム、一覧・詳細・登録画面
- **APIテンプレート**: ユースケース、ハンドラー、DTO
- **テストテンプレート**: 単体・統合・E2Eテスト
- **品質ゲート**: TypeScript strict、ESLint、カバレッジ80%
- **speckit連携**: AI駆動開発のためのテンプレートと設定

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

```bash
# 1. GitHubリポジトリをクローン
git clone <your-repo-url>
cd <your-repo>

# 2. speckit初期化（既存リポジトリ内で実行）
specify init --here --ai claude

# 3. アーキテクチャコードの展開（リリースZIPをリポジトリルートに解凍）
unzip ec-site-arch.zip -d .

# 4. プロジェクト憲法の作成（Claude Codeで実行）
/speckit.constitution
```

`/speckit.constitution` でプロジェクト固有の情報を入力すると、
セットアップ手順やアーキテクチャの使い方を含む憲法が作成されます。

詳細は `docs/examples/constitution-example.md` を参照してください。

---

## ディレクトリ構成

```
src/
├── foundation/          # 共通基盤（認証・エラー・ログ・バリデーション）
├── templates/           # 再利用テンプレート（UI・API・インフラ・テスト）
├── samples/             # サンプル実装（Catalog, Cart, Orders）
├── domains/             # 本番ドメイン実装（ここに実装）
├── infrastructure/      # インフラ層実装
└── app/                 # Next.js App Router

tests/
├── e2e/                 # E2Eテスト（Playwright）
│   └── arch/            # アーキテクチャ基盤のE2E（開発時は自動除外）
├── integration/         # 統合テスト
│   ├── domains/         # ドメイン実装の統合テスト
│   ├── foundation/      # 共通基盤の統合テスト
│   └── templates/       # テンプレートの統合テスト
└── unit/                # 単体テスト
    ├── domains/         # ドメイン実装の単体テスト
    ├── foundation/      # 共通基盤の単体テスト
    └── templates/       # テンプレートの単体テスト
```

---

## 開発ワークフロー（speckit連携）

```bash
# 機能仕様を作成
/speckit.specify "ユーザー管理機能を追加"

# 実装計画を作成
/speckit.plan

# タスクを生成
/speckit.tasks

# 実装を開始
/speckit.implement
```

---

## ドキュメント

- [GETTING_STARTED.md](docs/GETTING_STARTED.md) - セットアップガイド
- [SPECKIT_INTEGRATION.md](docs/SPECKIT_INTEGRATION.md) - speckit連携ガイド
- [constitution-example.md](docs/examples/constitution-example.md) - 憲法の入力例

---

## ライセンス

MIT
