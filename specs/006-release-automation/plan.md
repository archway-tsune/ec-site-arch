# Implementation Plan: GitHub リリース自動化

**Branch**: `006-release-automation` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-release-automation/spec.md`

## Summary

GitHub Releases を使ったリリース自動化。開発者が `pnpm release` を実行すると `package.json` のバージョンからタグを自動作成・プッシュし、GitHub Actions ワークフローが ZIP 作成・GitHub Release 公開・パッチバージョンインクリメントを行う。

## Technical Context

**Language/Version**: YAML (GitHub Actions), PowerShell 5.1+, Bash (GitHub Actions runner)
**Primary Dependencies**: GitHub Actions (`actions/checkout@v4`, `actions/setup-node@v4`), GitHub CLI (`gh`)
**Storage**: N/A
**Testing**: 手動検証（タグプッシュ → GitHub Release 作成を確認）
**Target Platform**: GitHub Actions (ubuntu-latest), ローカル開発環境 (Windows + PowerShell)
**Project Type**: CI/CD インフラ（アプリケーションコード変更なし）
**Performance Goals**: N/A
**Constraints**: GitHub Actions の `contents: write` 権限が必要。無限ループ防止のため `[skip ci]` を使用
**Scale/Scope**: ワークフローファイル 1 個、スクリプト 1 個新規、既存ファイル 2 個修正、既存ファイル 1 個削除

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

本機能は CI/CD インフラの追加であり、アプリケーションコード・UI・API の変更を含まない。

| 原則 | 該当 | 判定 |
|------|------|------|
| I. コンポーネントファースト設計 | 非該当 | PASS（UI 変更なし） |
| II. ドメイン駆動設計 | 非該当 | PASS（ドメインロジック変更なし） |
| III. サーバーサイド中心のデータ制御 | 非該当 | PASS（API 変更なし） |
| IV. 型安全必須 | 非該当 | PASS（TypeScript コード変更なし） |
| V. セキュリティ最優先 | 該当 | PASS（`contents: write` は最小権限。GitHub トークンは Actions 組み込み） |
| VI. テスト駆動開発 | 非該当 | PASS（アプリケーションコード変更なし。CI/CD ワークフローは手動検証） |

**品質基準**: CI ワークフロー（`ci.yml`）は変更しない。リリースワークフローは CI とは独立に動作する。

## Project Structure

### Documentation (this feature)

```text
specs/006-release-automation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
.github/workflows/
├── ci.yml                  # 既存（変更なし）
└── release.yml             # 新規: リリースワークフロー

scripts/
├── create-release-tag.ps1  # 新規: タグ自動作成スクリプト
└── README.md               # 既存（リリースフロー更新）

package.json                # 既存（release スクリプト追加、release:zip 削除）
```

**Structure Decision**: 既存の `scripts/` ディレクトリにリリースタグ作成用の PowerShell スクリプトを追加。GitHub Actions ワークフローは既存の `.github/workflows/` に配置。

## Complexity Tracking

該当なし。Constitution Check に違反はない。

## Implementation Details

### 変更ファイル一覧

| ファイル | 操作 | FR |
|---------|------|-----|
| `scripts/create-release-tag.ps1` | 新規 | FR-001, FR-002, FR-003 |
| `package.json` | 修正 | FR-001（`release` スクリプト追加）, FR-013（`release:zip` 削除） |
| `.github/workflows/release.yml` | 新規 | FR-004〜FR-012, FR-015 |
| `scripts/create-release-zip.ps1` | 削除 | FR-013 |
| `scripts/README.md` | 修正 | FR-014 |

### 1. `scripts/create-release-tag.ps1`（新規）

`package.json` のバージョンを読み取り、タグを作成・プッシュするスクリプト。

- `package.json` から version を読み取り `v{VERSION}` タグ名を生成
- 現在のブランチが main であることを確認し、main 以外なら警告・中断（FR-003）
- `git tag` で同名タグの存在を確認し、存在する場合はエラー終了（FR-002）
- `git tag v{VERSION}` でタグ作成
- `git push origin v{VERSION}` でリモートにプッシュ

### 2. `package.json`（修正）

`scripts` に `release` コマンドを追加:

```json
"release": "powershell -ExecutionPolicy Bypass -File ./scripts/create-release-tag.ps1"
```

### 3. `.github/workflows/release.yml`（新規）

`v*` タグプッシュでトリガーされるワークフロー:

- **トリガー**: `push: tags: ['v*']`
- **権限**: `contents: write`
- **ステップ**:
  1. Checkout（`fetch-depth: 0`）
  2. タグからバージョン抽出（`v1.0.4` → `1.0.4`）
  3. `zip -r` で ZIP 作成（FR-007 の除外パターンに従う）
  4. `gh release create` でリリース作成 + ZIP 添付（`--generate-notes`）
  5. Node.js セットアップ
  6. `node -e` で `package.json` パッチバージョンインクリメント
  7. `git commit` に `[skip ci]` 付与、`git push origin HEAD:main`

### 4. `scripts/create-release-zip.ps1`（削除）

自動リリースで代替されるため、ローカル ZIP 作成スクリプトを削除する。
`package.json` の `release:zip` スクリプトも削除する。

### 5. `scripts/README.md`（修正）

- リリースフローをコマンドベース（`pnpm release`）に更新
- `create-release-tag.ps1` のドキュメントを追加
- `create-release-zip.ps1` のドキュメントを削除

### ZIP 除外パターン（release.yml 内）

ディレクトリ:
- `node_modules/*`, `.next/*`, `coverage/*`, `test-results/*`
- `playwright-report/*`, `.git/*`, `.claude/*`, `.specify/*`
- `scripts/*`, `specs/*`

ファイル:
- `*.tsbuildinfo`, `pnpm-lock.yaml`, `*.zip`
- `playwright.samples.config.ts`, `.github/workflows/release.yml`
