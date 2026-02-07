# Getting Started - セットアップガイド

EC Site Architecture Templateを使って新規プロジェクトを開始する手順です。

---

## 前提条件

- Node.js 18以上
- pnpm
- Claude Code（speckitコマンド実行用）

---

## セットアップ手順

### Step 1: speckit初期化

```bash
speckit init my-ec-project --ai claude
cd my-ec-project
```

これにより以下が作成されます：
- `my-ec-project/` - プロジェクトディレクトリ
- `.claude/commands/` - speckitスキル定義
- `.specify/` - speckit設定とテンプレート

### Step 2: アーキテクチャコードの展開

```bash
unzip ec-site-arch.zip -d .
```

### Step 3: プロジェクト憲法の作成

Claude Codeで以下を実行：

```
/speckit.constitution
```

対話形式でプロジェクト情報を入力すると、以下を含む憲法が作成されます：
- 依存関係のインストール手順
- プロジェクト情報の更新方法
- アーキテクチャの使い方
- 品質基準とテストコマンド

入力例は `docs/examples/constitution-example.md` を参照してください。

---

## 開発ワークフロー

### 新機能の追加

```bash
# 1. 機能仕様を作成
/speckit.specify "決済機能を追加"

# 2. 実装計画を作成
/speckit.plan

# 3. タスクを生成
/speckit.tasks

# 4. 実装を開始
/speckit.implement
```

---

## サンプル実装

`src/samples/domains/` に以下のサンプル実装があります：

| ドメイン | 機能 |
|---------|------|
| Catalog | 商品一覧・詳細、検索・フィルタ |
| Cart | 商品追加・削除、数量変更 |
| Orders | 注文作成、注文履歴 |

これらを参考に、`src/domains/` に本番実装を作成してください。

### サンプルの扱い

```bash
# 参照として残す → そのまま
# 削除する → rm -rf src/samples/
# 本番実装のベースにする → cp -r src/samples/domains/* src/domains/
```

---

## テスト

### テストコマンド

```bash
# 単体テスト
pnpm test:unit

# 統合テスト
pnpm test:integration

# E2Eテスト（ドメイン実装のテスト）
pnpm test:e2e
```

ドメイン実装のE2Eテストは `tests/e2e/` 直下に配置してください。
`tests/e2e/arch/` 以下のアーキテクチャ基盤用E2Eテストは `pnpm test:e2e` の実行対象から自動的に除外されます。

---

## 関連ドキュメント

- [SPECKIT_INTEGRATION.md](./SPECKIT_INTEGRATION.md) - speckit連携の詳細
- [constitution-example.md](./examples/constitution-example.md) - 憲法の入力例
- [spec-template.md](./examples/spec-template.md) - 機能仕様のテンプレート
