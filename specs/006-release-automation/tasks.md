# Tasks: GitHub リリース自動化

**Input**: Design documents from `/specs/006-release-automation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: テスト不要（CI/CD インフラのみ。手動検証で確認）

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: 新規ファイルの作成と基本構造の準備

- [x] T001 [P] `scripts/create-release-tag.ps1` を新規作成する。`package.json` の version を読み取り `v{VERSION}` タグを作成・プッシュするスクリプト。`ConvertFrom-Json` で version を読み取り、main ブランチであることを確認（FR-003）、`git tag -l` で重複チェック、存在する場合は「タグ v{VERSION} は既に存在します。package.json のバージョンを確認してください。」と表示して終了（FR-001, FR-002, FR-003）
- [x] T002 [P] `package.json` の scripts に `"release": "powershell -ExecutionPolicy Bypass -File ./scripts/create-release-tag.ps1"` を追加する（FR-001）

**Checkpoint**: `pnpm release` コマンドでタグが作成・プッシュされることをローカルで確認可能

---

## Phase 2: User Story 1 - コマンド実行によるリリース (Priority: P1) 🎯 MVP

**Goal**: タグプッシュで GitHub Actions がリリース ZIP 作成・GitHub Release 公開を自動実行する

**Independent Test**: `pnpm release` を実行し、GitHub Releases ページにリリースが作成され、バージョン付き ZIP がダウンロード可能であることを確認する

### Implementation for User Story 1

- [x] T003 [US1] `.github/workflows/release.yml` を新規作成する。トリガー: `on: push: tags: ['v*']`、権限: `permissions: contents: write`（FR-015 最小権限）、条件: `if: github.ref_type == 'tag'`（FR-004）
- [x] T004 [US1] `release.yml` にバージョン抽出ステップを追加する。`GITHUB_REF_NAME` から `v` プレフィックスを除去して `VERSION` 出力変数に設定する（FR-005）
- [x] T005 [US1] `release.yml` に ZIP 作成ステップを追加する。`zip -r "ec-site-arch-v${VERSION}.zip" .` で除外パターンを `-x` オプションで指定する。除外対象: `node_modules/*`, `.next/*`, `coverage/*`, `test-results/*`, `playwright-report/*`, `.git/*`, `.claude/*`, `.specify/*`, `scripts/*`, `specs/*`, `*.tsbuildinfo`, `pnpm-lock.yaml`, `*.zip`, `playwright.samples.config.ts`, `.github/workflows/release.yml`（FR-006, FR-007）
- [x] T006 [US1] `release.yml` に GitHub Release 作成ステップを追加する。`gh release create` でタグ名をタイトルに使用し、ZIP を添付し、`--generate-notes` でリリースノートを自動生成する。`GH_TOKEN: ${{ github.token }}` を env に設定する（FR-008, FR-009）

**Checkpoint**: タグプッシュで GitHub Release が作成され ZIP が添付されることを確認

---

## Phase 3: User Story 2 - パッチバージョン自動インクリメント (Priority: P2)

**Goal**: リリース完了後に `package.json` のパッチバージョンを自動インクリメントし main にコミットする

**Independent Test**: リリース後、main ブランチの `package.json` のバージョンがインクリメントされていることを確認する

### Implementation for User Story 2

- [x] T007 [US2] `release.yml` に Node.js セットアップステップを追加する。`actions/setup-node@v4` で node-version `'20'` を指定する
- [x] T008 [US2] `release.yml` にパッチバージョンインクリメントステップを追加する。`node -e` でインラインスクリプトにより `package.json` の PATCH バージョンのみを +1 する。MAJOR・MINOR は変更しない。`JSON.stringify(pkg, null, 2) + '\n'` でフォーマット（インデント 2 スペース、末尾改行）を保持する（FR-010）
- [x] T009 [US2] `release.yml` にコミット・プッシュステップを追加する。`git config` で `github-actions[bot]` を設定し、`git add package.json && git commit -m "chore: bump version to ${NEW_VERSION} [skip ci]" && git push origin HEAD:main` を実行する（FR-011, FR-012）

**Checkpoint**: リリース後に `package.json` のバージョンが自動インクリメントされ、CI が再トリガーされないことを確認

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント更新と最終確認

- [x] T010 [P] `scripts/create-release-zip.ps1` を削除し、`package.json` から `release:zip` スクリプトを削除する（FR-013）
- [x] T011 [P] `scripts/README.md` を更新する。リリースフローをコマンドベース（`pnpm release`）に更新し、`create-release-tag.ps1` のドキュメントを追加し、`create-release-zip.ps1` のドキュメントを削除する（FR-014）
- [x] T012 全変更ファイルの最終確認を行う。`release.yml` の除外パターンが FR-007 と一致していること、`package.json` に `release` スクリプトが追加され `release:zip` が削除されていること、`create-release-zip.ps1` が削除されていることを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - T001, T002 は並列実行可能
- **Phase 2 (US1)**: Phase 1 完了後に開始。T003→T004→T005→T006 は順次実行
- **Phase 3 (US2)**: Phase 2 完了後に開始（`release.yml` にステップを追加するため）
- **Phase 4 (Polish)**: Phase 2〜3 すべて完了後

### User Story Dependencies

- **User Story 1 (P1)**: Phase 1 完了後に開始。他のストーリーへの依存なし
- **User Story 2 (P2)**: US1 完了後に開始（同一ファイル `release.yml` への追記）

### Parallel Opportunities

- T001 と T002 は並列実行可能（異なるファイル）
- T010 と T011 は並列実行可能（異なるファイル）

---

## Parallel Example: Phase 1

```bash
# Phase 1 の並列実行:
Task: "create-release-tag.ps1 を新規作成する" (T001)
Task: "package.json に release スクリプトを追加する" (T002)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup（T001, T002）
2. Phase 2: User Story 1（T003〜T006）
3. **STOP and VALIDATE**: タグプッシュで GitHub Release が作成されることを確認
4. MVP として動作可能

### Incremental Delivery

1. Phase 1 → Setup 完了
2. Phase 2 (US1) → タグプッシュでリリース自動化 → MVP!
3. Phase 3 (US2) → パッチバージョン自動インクリメント追加
4. Phase 4 → ドキュメント更新・最終確認

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- CI/CD インフラのみのため、アプリケーションコードのテストは不要
- 手動検証: タグプッシュ後に GitHub Releases ページで確認
- `release.yml` は Phase 2〜3 で段階的に構築する（Phase 2 で基本構造、Phase 3 でインクリメント追加）
