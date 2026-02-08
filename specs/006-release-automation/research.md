# Research: GitHub リリース自動化

**Feature Branch**: `006-release-automation`
**Date**: 2026-02-08

## R-001: GitHub Actions でのタグベースリリースワークフロー

**Decision**: `on: push: tags: ['v*']` トリガーを使用し、`gh release create` でリリースを作成する

**Rationale**:
- GitHub Actions の標準的なリリースパターン
- `gh` CLI は GitHub Actions ランナーにプリインストールされており、追加セットアップ不要
- `${{ github.token }}` で認証可能（PAT 不要）
- `--generate-notes` オプションでリリースノートを自動生成できる

**Alternatives considered**:
- `actions/create-release` アクション: 公式にアーカイブ済み（非推奨）
- `softprops/action-gh-release`: サードパーティ依存。`gh` CLI で十分なため不採用
- GitHub API 直接呼び出し: `gh` CLI のほうが簡潔

## R-002: ZIP 作成方法（CI 環境）

**Decision**: `zip -r` コマンドで `-x` オプションにより除外パターンを指定する

**Rationale**:
- GitHub Actions ランナー（ubuntu-latest）に `zip` はプリインストール済み
- `-x` オプションで除外パターンをインラインに指定可能
- 既存の `create-release-zip.ps1` は PowerShell + Windows パス処理に依存しているため CI では使えない

**Alternatives considered**:
- PowerShell をランナーにインストール: 追加のセットアップが必要で冗長
- `tar.gz` 形式: Windows ユーザーが多いため ZIP のほうが扱いやすい

## R-003: バージョンインクリメント方法

**Decision**: `node -e` でインラインスクリプトにより `package.json` のパッチバージョンを +1 する

**Rationale**:
- Node.js は既にワークフロー内でセットアップ済み
- 外部ツール（`npm version` 等）は git タグも作成してしまい、無限ループのリスクがある
- インラインスクリプトは依存関係なしで動作する

**Alternatives considered**:
- `npm version patch --no-git-tag-version`: npm がインストールされていない環境でも動作する node -e のほうがシンプル
- `jq` で直接 JSON 操作: バージョン文字列のパースに追加ロジックが必要
- `pnpm version`: pnpm セットアップが必要で冗長

## R-004: 無限ループ防止

**Decision**: バージョンインクリメントのコミットメッセージに `[skip ci]` を含める

**Rationale**:
- GitHub Actions の標準的な CI スキップパターン
- コミットメッセージに `[skip ci]` があると、`push` トリガーのワークフローがスキップされる
- タグプッシュではないため、`release.yml` もトリガーされない

**Alternatives considered**:
- `github-actions[bot]` のコミットをワークフロー条件で除外: 条件式が複雑になる
- 別ブランチにコミット: main へのマージが別途必要で冗長

## R-005: リリースコマンドのスクリプト言語

**Decision**: PowerShell スクリプト（`create-release-tag.ps1`）を使用

**Rationale**:
- 既存の `create-release-zip.ps1` と統一されたスクリプト言語
- 開発環境が Windows + PowerShell（既存パターンと一致）
- `package.json` の読み取りに `ConvertFrom-Json` が使える

**Alternatives considered**:
- Node.js スクリプト: プロジェクトの `scripts/` パターンと不一致
- Bash スクリプト: Windows 環境での互換性に懸念

## R-006: タグ重複チェック

**Decision**: `git tag -l` で既存タグを確認し、存在する場合はエラー終了

**Rationale**:
- `git tag -l "v{VERSION}"` で簡潔に確認可能
- エラー時に明確なメッセージを出力して開発者に対処方法を示す
- リモートタグの確認は `git push` 時に自然にエラーとなるため、ローカルチェックで十分

**Alternatives considered**:
- `git ls-remote --tags`: ネットワークアクセスが必要で遅い
- エラーを無視して push: 既存リリースとの衝突リスク
