# Scripts - 開発者向けツール

このディレクトリはアーキテクチャ管理用のスクリプトを格納しています。
**注意**: このディレクトリはリリースZIPには含まれません。

---

## create-release-zip.ps1

アーキテクチャコードをZIPファイルとしてリリースするスクリプト。

### 使用方法

```bash
# npm script経由
pnpm release:zip

# 直接実行
powershell -ExecutionPolicy Bypass -File ./scripts/create-release-zip.ps1

# カスタム出力パス
powershell -ExecutionPolicy Bypass -File ./scripts/create-release-zip.ps1 -OutputPath "./releases/v1.0.0.zip"
```

### 除外されるファイル/ディレクトリ

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
| `playwright.arch.config.ts` | アーキテクチャ用E2E設定 |
| `*.tsbuildinfo` | TypeScriptビルドキャッシュ |
| `pnpm-lock.yaml` | ロックファイル（サイズ大） |
| `*.zip` | 既存のZIPファイル |

### ZIPに含まれるアーキテクチャ関連ファイル

| 対象 | 説明 |
|------|------|
| `src/samples/tests/` | サンプルテスト（単体・統合・E2E）（ZIPに含まれる） |
| `src/contracts/` | 共有インターフェース（DTO・リポジトリ契約） |
| `src/domains/` | 暫定スキャフォールド（@/samples/ の再エクスポート） |

> **注意**: `src/samples/tests/` はリリースZIPに含まれますが、`playwright.arch.config.ts` と `vitest.samples.config.ts` は含まれません。
> 開発時の `pnpm test:unit` / `pnpm test:e2e` ではサンプルテストは自動的に除外されます。

### リリースフロー

1. コードの変更をコミット
2. テストを実行して品質を確認
   ```bash
   pnpm test:unit
   pnpm test:e2e:samples
   pnpm lint
   pnpm typecheck
   ```
3. リリースZIPを作成
   ```bash
   pnpm release:zip
   ```
4. 生成された `ec-site-arch.zip` を配布

### 出力例

```
Collecting files...
Target files: 152
Copying files...
Creating ZIP...

========================================
Release ZIP created successfully
========================================
File: ec-site-arch.zip
Size: 178.66 KB
Path: C:\path\to\ec-site-arch.zip
Files: 152
```
