# Scripts - 開発者向けツール

このディレクトリはアーキテクチャ管理用のスクリプトを格納しています。
**注意**: このディレクトリはリリースZIPには含まれません。

---

## create-release-tag.ps1

`package.json` のバージョンからタグを自動作成・プッシュし、GitHub Actions でリリースを自動実行するスクリプト。

### 使用方法

```bash
# npm script経由（推奨）
pnpm release

# 直接実行
powershell -ExecutionPolicy Bypass -File ./scripts/create-release-tag.ps1
```

### 動作フロー

1. `package.json` の `version` を読み取る
2. 現在のブランチが `main` であることを確認
3. 同名タグの重複チェック
4. `v{VERSION}` タグを作成・プッシュ
5. GitHub Actions が自動的にリリースを作成

### 前提条件

- `main` ブランチで実行すること
- リモートリポジトリにプッシュ権限があること
- GitHub Actions が有効であること

### エラー時の対処

| エラー | 原因 | 対処 |
|--------|------|------|
| "tag vX.Y.Z already exists" | 同じバージョンで既にリリース済み | `package.json` のバージョンを手動で更新する |
| "current branch is not 'main'" | main 以外のブランチで実行 | `main` ブランチに切り替えてから実行する |

---

## ZIP に含まれないファイル/ディレクトリ

リリース ZIP から除外される対象:

| 除外対象 | 理由 |
|---------|------|
| `node_modules/` | 依存関係（pnpm installで再生成） |
| `.next/` | ビルド出力 |
| `coverage/` | テストカバレッジ出力 |
| `test-results/` | テスト結果 |
| `playwright-report/` | E2Eテストレポート |
| `.git/` | Gitリポジトリ |
| `.claude/` | speckit initで作成 |
| `.specify/` | speckit initで作成 |
| `scripts/` | 開発者向けツール（このディレクトリ） |
| `specs/` | アーキテクチャ用の仕様 |
| `playwright.samples.config.ts` | サンプルE2E設定 |
| `*.tsbuildinfo` | TypeScriptビルドキャッシュ |
| `pnpm-lock.yaml` | ロックファイル（サイズ大） |
| `*.zip` | 既存のZIPファイル |
| `.github/workflows/release.yml` | リリースワークフロー |

### ZIPに含まれるアーキテクチャ関連ファイル

| 対象 | 説明 |
|------|------|
| `src/samples/tests/` | サンプルテスト（単体・統合・E2E）（ZIPに含まれる） |
| `src/contracts/` | 共有インターフェース（DTO・リポジトリ契約） |
| `src/domains/` | 暫定スキャフォールド（@/samples/ の再エクスポート） |

> **注意**: `src/samples/tests/` はリリースZIPに含まれますが、`playwright.samples.config.ts` と `vitest.samples.config.ts` は含まれません。
> ZIP展開後に `src/samples/` を削除すると、サンプルテストも自動的に除外されます。

---

## リリースフロー

1. コードの変更をコミット
2. テストを実行して品質を確認
   ```bash
   pnpm test:unit
   pnpm test:e2e:samples
   pnpm lint
   pnpm typecheck
   ```
3. リリースを実行
   ```bash
   pnpm release
   ```
4. GitHub Actions が自動的に:
   - リリース ZIP を作成
   - GitHub Release を公開（リリースノート自動生成）
   - `package.json` のパッチバージョンをインクリメント
