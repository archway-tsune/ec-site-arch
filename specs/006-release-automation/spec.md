# Feature Specification: GitHub リリース自動化

**Feature Branch**: `006-release-automation`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "GitHub Releases を使ったリリース自動化。タグプッシュ(v*)で ZIP 作成・GitHub Release 公開・パッチバージョンインクリメントを行う GitHub Actions ワークフローを追加する。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - コマンド実行によるリリース (Priority: P1)

開発者がリリースコマンド（例: `pnpm release`）を実行すると、`package.json` の現在のバージョンからタグが自動作成・プッシュされ、GitHub Actions がリリース ZIP の作成と GitHub Release の公開を行う。開発者はバージョン番号を手入力する必要がない。

**Why this priority**: リリース自動化の中核機能。タグ番号の手動管理を不要にし、手動作業の削減と配布の一貫性を確保するために最も重要。

**Independent Test**: リリースコマンドを実行した後、GitHub Releases ページにリリースが作成され、バージョン付き ZIP ファイルがダウンロード可能であることを確認する。

**Acceptance Scenarios**:

1. **Given** `package.json` の version が `1.0.4` の状態, **When** 開発者がリリースコマンドを実行する, **Then** `v1.0.4` タグが作成・プッシュされ、GitHub Release が `v1.0.4` タイトルで作成され、`ec-site-arch-v1.0.4.zip` が添付される
2. **Given** タグプッシュによりワークフローが起動した状態, **When** ZIP が作成される, **Then** ZIP には開発ツール・ビルド成果物・CI 関連ファイルが除外され、配布に必要なファイルのみが含まれる
3. **Given** タグプッシュによりワークフローが起動した状態, **When** GitHub Release が作成される, **Then** リリースノートが自動生成される
4. **Given** 同じバージョンのタグが既に存在する状態, **When** 開発者がリリースコマンドを実行する, **Then** 「タグ v{VERSION} は既に存在します。package.json のバージョンを確認してください。」というエラーメッセージが表示され、タグは作成されない

---

### User Story 2 - パッチバージョン自動インクリメント (Priority: P2)

リリース完了後、`package.json` のパッチバージョン（PATCH）のみが自動的にインクリメントされ、main ブランチにコミットされる。MAJOR・MINOR は変更しない。`package.json` のフォーマット（インデント 2 スペース、末尾改行）は保持される。これにより、次のリリースコマンド実行時に新しいバージョンで自動的にタグが作成される。

**Why this priority**: リリース後の手作業を減らし、バージョン番号の一貫性を保つ。ただし P1 なしでは成立しないため P2。

**Independent Test**: リリースコマンド実行後、main ブランチの `package.json` のバージョンがインクリメントされていることを確認する。

**Acceptance Scenarios**:

1. **Given** `v1.0.4` タグでリリースが完了した状態, **When** バージョンインクリメントが実行される, **Then** `package.json` の version が `1.0.5` に更新され、main ブランチにコミットされる
2. **Given** バージョンインクリメントのコミットが作成される状態, **When** main ブランチにプッシュされる, **Then** CI ワークフローが再トリガーされない（コミットメッセージに `[skip ci]` を含めることで制御）
3. **Given** バージョンが `1.0.5` にインクリメントされた状態, **When** 開発者が再度リリースコマンドを実行する, **Then** `v1.0.5` タグが自動的に作成される

---

### Edge Cases

- 同じバージョンのタグが既に存在する場合、リリースコマンドがエラーメッセージを表示して終了する
- タグ名が `v` で始まらない場合はワークフローがトリガーされない
- バージョンインクリメントのコミット・プッシュ時にコンフリクトが発生した場合、ワークフローはエラー終了する（GitHub Release は作成済みだが package.json は未更新の中間状態となる。開発者が手動で `package.json` のバージョンをインクリメントしてコミットする必要がある）
- `package.json` のバージョン形式がセマンティックバージョニング（x.y.z）でない場合はリリースコマンドが失敗する
- main ブランチ以外でリリースコマンドを実行した場合、警告メッセージを表示して中断する
- ワークフローの ZIP 作成・GitHub Release 作成ステップが失敗した場合、ワークフローはエラー終了する（タグは作成済みのため、開発者が手動でタグを削除してから再実行するか、GitHub Release を手動で作成する）
- リリースコマンド実行時のローカルの未コミット変更やリモートとの分岐状態は、タグ作成・プッシュの成否に影響しない（git の標準動作に従う）
- 複数の開発者が同時にリリースコマンドを実行した場合、2 人目はタグの重複エラーで中断される（排他制御は git タグの一意性に依存する）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 開発者がリリースコマンド（例: `pnpm release`）を実行すると、`package.json` の現在のバージョンからタグ（`v{VERSION}`）が自動作成・プッシュされなければならない
- **FR-002**: リリースコマンドは、同じバージョンのタグが既に存在する場合、「タグ v{VERSION} は既に存在します。package.json のバージョンを確認してください。」というエラーメッセージを表示して中断しなければならない
- **FR-003**: リリースコマンドは、main ブランチ以外で実行された場合、警告メッセージを表示して中断しなければならない
- **FR-004**: システムは `v*` パターンのタグプッシュを検知してリリースワークフローを自動実行しなければならない
- **FR-005**: システムはタグ名からバージョン番号を抽出しなければならない（例: `v1.0.4` → `1.0.4`）
- **FR-006**: システムはプロジェクトファイルを ZIP 形式でアーカイブしなければならない。ZIP のファイル名は `ec-site-arch-v{VERSION}.zip` とする
- **FR-007**: ZIP から除外するファイル・ディレクトリは以下を指定しなければならない: `node_modules`, `.next`, `coverage`, `test-results`, `playwright-report`, `.git`, `.claude`, `.specify`, `scripts`, `specs`（ディレクトリ）、`*.tsbuildinfo`, `pnpm-lock.yaml`, `*.zip`, `playwright.samples.config.ts`, `.github/workflows/release.yml`（ファイル）。なお、`scripts/` ディレクトリ全体が除外されるため、`create-release-tag.ps1` は暗黙的に除外される
- **FR-008**: システムは GitHub Release を作成し、タイトルにバージョン番号を含め、ZIP ファイルを添付しなければならない
- **FR-009**: システムはリリースノートを自動生成しなければならない
- **FR-010**: リリース完了後、システムは `package.json` の PATCH バージョンのみを自動的にインクリメントしなければならない（例: `1.0.4` → `1.0.5`）。MAJOR・MINOR は変更しない。`package.json` のフォーマット（インデント、末尾改行）は保持する
- **FR-011**: バージョンインクリメントのコミットメッセージに `[skip ci]` を含め、CI を再トリガーしないよう制御しなければならない
- **FR-012**: バージョンインクリメントのコミットは main ブランチにプッシュしなければならない
- **FR-013**: ローカル ZIP 作成スクリプト（`scripts/create-release-zip.ps1`）を削除し、`package.json` から `release:zip` スクリプトを削除しなければならない（自動リリースで代替されるため不要）
- **FR-014**: リリース関連のドキュメント（`scripts/README.md`）を更新し、コマンドベースのリリースフローを反映しなければならない
- **FR-015**: リリースワークフローの権限は `contents: write` のみとし、最小権限の原則に従わなければならない

### Key Entities

- **バージョンタグ**: セマンティックバージョニングに基づくタグ（`v{MAJOR}.{MINOR}.{PATCH}`）。リリースワークフローのトリガーとなる
- **リリース ZIP**: プロジェクトの配布用アーカイブ。開発ツールやビルド成果物を除外したプロジェクトファイルの集合
- **GitHub Release**: GitHub 上のリリースエントリ。バージョン情報、リリースノート、ダウンロード可能な ZIP を含む

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 開発者がリリースコマンドを 1 回実行した後、タグ作成・プッシュ以降のすべてのステップ（ZIP 作成、GitHub Release 公開、バージョンインクリメント）が人手を介さず完了する
- **SC-002**: リリース完了後、`package.json` の PATCH バージョンが自動的にインクリメントされている
- **SC-003**: バージョンインクリメントのコミット後、GitHub Actions の CI ワークフロー（`ci.yml`）の実行履歴に新たな実行が記録されないことで、再トリガーされていないことを確認する

## Assumptions

- リポジトリは GitHub でホストされており、GitHub Actions が利用可能である
- リリースは main ブランチからのみ行う
- バージョニングはセマンティックバージョニング（MAJOR.MINOR.PATCH）に従う
- タグはリリースコマンドにより `package.json` のバージョンから自動作成される
- リリースノートは GitHub の自動生成機能を使用する（カスタムテンプレートは範囲外）
- CI/CD パイプライン（`ci.yml`）は既に存在し、テスト実行を担当している。リリースワークフローではテストは実行しない
- GitHub Actions ランナー（ubuntu-latest）に `gh` CLI がプリインストールされている
- GitHub Actions のデフォルトトークン（`github.token`）に `contents: write` 権限を付与すれば、リリース作成・コミットプッシュに十分である
- GitHub Actions ランナーの Node.js バージョンは `package.json` の `engines` フィールド（`>=20.0.0`）と整合する

## Scope Boundaries

### In Scope

- リリースコマンド（`pnpm release`）の新規作成（`package.json` のバージョンからタグ自動作成・プッシュ）
- GitHub Actions リリースワークフローの新規作成
- タグプッシュによる ZIP 作成・GitHub Release 公開
- パッチバージョンの自動インクリメント
- ローカル ZIP 作成スクリプト（`create-release-zip.ps1`）と `release:zip` スクリプトの削除（自動リリースで代替）
- ドキュメント（`scripts/README.md`）の更新

### Out of Scope

- MAJOR / MINOR バージョンの自動インクリメント
- リリースノートのカスタムテンプレート
- CI/CD パイプライン（`ci.yml`）の変更
- NPM パッケージとしての公開

### ZIP 展開後の開発リポジトリへの影響

本機能はアーキテクチャリポジトリ固有の機能である。ZIP 展開後の開発リポジトリへの影響は以下のとおり:

- `release.yml` は ZIP に含まれない（FR-007 で除外）
- `create-release-tag.ps1` は `scripts/` ディレクトリごと ZIP に含まれない
- `package.json` の `release` スクリプトは ZIP に含まれるが、`create-release-tag.ps1` が存在しないためコマンド実行時にエラーとなるだけで無害である
