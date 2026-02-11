# Feature Specification: speckit実装時の品質ガード強化

**Feature Branch**: `008-quality-guard`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "speckit実装時の品質ガード強化 — E2Eテスト実行スキップ防止、カバレッジ網羅性、外部URL検証、サンプルコード保護、TDDテンプレート整合"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - TDD Red-Green-Refactor ワークフローの徹底 (Priority: P1)

開発者がspeckitのタスク生成（`/speckit.tasks`）を実行した際に、
各ユーザーストーリーが Red（テスト作成）→ Green（最小実装）→ Refactor（改善）→ 検証（E2E・カバレッジ）の
4ステップ構成で生成される。テストは省略不可であり、ユースケース単体テスト・UIコンポーネント単体テスト・
API統合テスト・E2Eテストの4種別が Red フェーズに含まれる。

**Why this priority**: タスクテンプレートが constitution の TDD 原則（原則 VI「テスト駆動開発必須（非交渉）」）と
矛盾しており、テストが OPTIONAL と記載されている。この矛盾を放置すると、
すべての機能実装でテスト不足が発生し得る最も根本的な問題である。

**Independent Test**: タスクテンプレートを修正後、任意の機能仕様に対して `/speckit.tasks` を実行し、
生成されたタスクが Red-Green-Refactor-検証 の4ステップ構成であること、
テストが MANDATORY として含まれていることを確認する。

**Acceptance Scenarios**:

1. **Given** 修正後のタスクテンプレートが配置されている, **When** `/speckit.tasks` でタスクを生成する, **Then** 各ユーザーストーリーフェーズに Red（テスト）→ Green（実装）→ Refactor → 検証 の4セクションが含まれる
2. **Given** 修正後のタスクテンプレートが配置されている, **When** Red フェーズのタスクを確認する, **Then** ユースケース単体テスト・UIコンポーネント単体テスト・API統合テスト・E2Eテスト の4種別が標準タスク例として含まれている
3. **Given** 修正後のタスクテンプレートが配置されている, **When** テンプレート内で "OPTIONAL" を検索する, **Then** テストに関する OPTIONAL 記述が存在しない
4. **Given** 修正後の constitution が配置されている, **When** タスクテンプレートとの整合性を確認する, **Then** TDD 原則に関する矛盾が存在しない

---

### User Story 2 - サンプルコードの本番実装からの構造的保護 (Priority: P2)

開発者が本番機能を実装する際に contracts にフィールドを追加したり
infrastructure のシードデータを変更しても、サンプルコード（`src/samples/`）および
サンプルテスト（`src/samples/tests/`）がコンパイルエラーやテスト失敗を起こさない。
サンプルコードは一切の修正なしで本番機能の追加が可能である。

**Why this priority**: サンプルコードは ZIP 展開先プロジェクトにおけるリファレンス実装であり、
その安定性は開発者体験の根幹を成す。構造的な分離が不十分であると、
本番機能追加のたびにサンプルの修正作業が発生し、テンプレートとしての価値が毀損される。

**Independent Test**: contracts にダミーの新規フィールド（`.default()` 付き）を追加し、
サンプルの全テスト（unit・integration・E2E）が修正なしでパスすることを確認する。

**Acceptance Scenarios**:

1. **Given** contracts のスキーマに `.default()` 付きの新規フィールドが追加された, **When** サンプルの単体テストを実行する, **Then** テストヘルパーがフィールド追加を自動吸収し、全テストがパスする
2. **Given** infrastructure のシードデータにレコードが追加された, **When** サンプルの E2E テストを実行する, **Then** アサーションが特定のデータ件数に依存せず、全テストがパスする
3. **Given** リポジトリインターフェースにオプショナルな検索パラメータが追加された, **When** サンプルのユースケースをコンパイルする, **Then** 既存の呼び出し箇所にコンパイルエラーが発生しない
4. **Given** constitution-example が配置されている, **When** サンプル保護原則のセクションを確認する, **Then** contracts 後方互換ルール・シードデータ分離・インターフェース安定性のルールが記載されている

---

### User Story 3 - テスト実行・カバレッジの品質ゲート強化 (Priority: P3)

開発者が `/speckit.implement` で機能を実装する際に、E2E テストが実際に実行され
（スキップされず）、テスト実行結果の証跡が記録される。
また、各ユーザーストーリー完了時にローカルでカバレッジを確認し、
CI でも同一基準で検証される。

**Why this priority**: E2E テストのスキップとカバレッジ未確認は、
ローカルでは気づかずCI で初めて失敗するという開発サイクルの遅延を引き起こす。
US1（TDD 徹底）が実現した前提で、その実行を保証する仕組みとして必要。

**Independent Test**: 修正後の CI 設定で E2E テストジョブを実行し、
`--pass-with-no-tests` が除去されていること、テストファイル未存在時に CI が失敗すること、
サンプルテストのリグレッションチェックが含まれていることを確認する。

**Acceptance Scenarios**:

1. **Given** CI パイプラインが修正されている, **When** 本番 E2E テストファイルが存在しない状態で CI を実行する, **Then** E2E ジョブが失敗する（`--pass-with-no-tests` が除去されている）
2. **Given** CI パイプラインが修正されている, **When** quality ジョブを実行する, **Then** サンプルの単体・統合テストもリグレッションチェックとして実行される
3. **Given** constitution-example が修正されている, **When** テスト品質基準を確認する, **Then** E2E テスト証跡義務とカバレッジ確認の概要が記載され、詳細手順はテンプレート参照と記載されている
4. **Given** タスクテンプレートが ZIP に含まれている, **When** ZIP 展開後に `/speckit.tasks` を実行する, **Then** 検証フェーズに E2E テスト実行（証跡付き）とカバレッジ確認が含まれるタスクが生成される

---

### User Story 4 - 外部リソース URL 検証の実効性確保 (Priority: P4)

開発者がシードデータに外部 URL（画像等）を含める際に、
実装時点で各 URL に対して HTTP リクエストによる存在確認が行われ、
リンク切れ URL が本番コードに混入しない。
計画（plan）段階では「検証予定」とし、「検証済み」とは記載しない。

**Why this priority**: リンク切れ画像はエンドユーザーの体験を直接損なうが、
他の品質ガード（US1〜US3）に比べると影響範囲が限定的。
ただし、LLM が生成した URL は実在しない可能性があるため、明示的な検証手順が必要。

**Independent Test**: constitution-example に外部リソース検証の概要が記載されていること、
ec-site-arch の constitution に詳細手順（HTTP リクエスト検証・plan 時点の扱い）が記載されていることを確認する。

**Acceptance Scenarios**:

1. **Given** constitution-example が修正されている, **When** 外部リソース検証セクションを確認する, **Then** HTTP リクエストによる検証の概要と「plan 時点では検証済みとしない」旨が記載されている
2. **Given** ec-site-arch の constitution が修正されている, **When** 外部リソース検証セクションを確認する, **Then** 「各 URL に HTTP リクエストを送信し 200 応答を確認する」「失敗した URL は代替 URL に置換する」「plan 時点では検証予定とし検証済みとしない」旨が記載されている
3. **Given** タスクテンプレートが修正されている, **When** 検証フェーズのタスク例を確認する, **Then** 外部 URL の HTTP 検証が標準タスク例として含まれている

---

### Edge Cases

- ZIP 展開後にテンプレートが正しく `.specify/templates/` に配置され、`/speckit.tasks` で品質ガード構造のタスクが生成されるか
- constitution-example を更新した後、ZIP 展開先で `/speckit.constitution` を実行した場合に、品質ガードの概要が constitution に正しく反映されるか
- contracts に `.default()` なしの必須フィールドが追加された場合に、サンプルテストの破損を開発者が検知できるか（CI のリグレッションチェックで検知可能であること）
- E2E テストファイルが存在するがテストケースが 0 件の場合に、CI が正しくエラーとするか
- シードデータのベース部分とプロダクション拡張部分の境界が明確であり、誤ってベース部分を変更した場合に検知できるか

## Clarifications

### Session 2026-02-11

- Q: テンプレート（`.specify/templates/`）と constitution-example の間で品質ガード内容が重複する場合、どう整理するか？ → A: C — constitution-example を簡略化し、品質ガード詳細をテンプレートに委譲する。constitution は概要のみ保持。テンプレートをリリース ZIP に含め、`specify init` 後の ZIP 展開でテンプレートが上書きされる構成とする。

### Post-release 修正 (2026-02-11)

- **[skip ci] によるリリースワークフロー未実行**: `create-release-tag.ps1` のバンプコミットに `[skip ci]` が付与されていたため、そのコミットにタグが付いた場合に GitHub Actions のリリースワークフローがスキップされた。対応: (1) バンプコミットから `[skip ci]` を削除、(2) `ci.yml` の quality ジョブに `if: "!startsWith(github.event.head_commit.message, 'chore: bump version')"` を追加し、CI のみバンプコミットでスキップする構成に変更
- **ZIP に全テンプレート含めていた問題**: 008-quality-guard で修正したのは `tasks-template.md` のみであるため、他のテンプレート（spec/plan/checklist/agent-file）を ZIP に含めると展開先のカスタマイズを上書きするリスクがある。対応: `release.yml` で他テンプレート4件を個別に除外し、`tasks-template.md` のみ ZIP に含める構成に変更

## Requirements *(mandatory)*

### Functional Requirements

#### TDD ワークフロー（US1）

- **FR-001**: タスクテンプレートは各ユーザーストーリーを Red（テスト作成）→ Green（最小実装）→ Refactor（改善）→ 検証（E2E・カバレッジ）の 4 ステップ構成で定義しなければならない（MUST）
- **FR-002**: タスクテンプレートの Red フェーズはユースケース単体テスト・UI コンポーネント単体テスト・API 統合テスト・E2E テストの 4 種別を標準タスク例として含めなければならない（MUST）
- **FR-003**: タスクテンプレートからテストの OPTIONAL 記述を削除し、テストを MANDATORY としなければならない（MUST）
- **FR-004**: ec-site-arch の constitution とタスクテンプレートの TDD に関する記述に矛盾がない状態にしなければならない（MUST）

#### サンプルコード保護（US2）

- **FR-005**: contracts の新規フィールドは `.default()` または `.optional()` を付与し、既存コードの後方互換性を維持しなければならない（MUST）
- **FR-006**: サンプルテストヘルパーはスキーマの parse を用いてオブジェクトを構築し、新規フィールドの自動補完を活用しなければならない（MUST）
- **FR-007**: infrastructure のシードデータをベース部分（サンプル互換・不変）と拡張部分（本番追加分）に分離しなければならない（MUST）
- **FR-008**: リポジトリインターフェースの検索パラメータに新規項目を追加する場合はオプショナルとしなければならない（MUST）
- **FR-009**: constitution-example にサンプル保護原則の概要（後方互換ルール・シードデータ分離・インターフェース安定性の方針）を記載しなければならない。詳細な手順はテンプレートに委譲する（MUST）

#### テスト品質ゲート（US3）

- **FR-010**: CI の E2E テストジョブから `--pass-with-no-tests` フラグを削除しなければならない（MUST）
- **FR-011**: CI の quality ジョブにサンプルテスト（単体・統合）のリグレッションチェックを追加しなければならない（MUST）
- **FR-012**: constitution-example に E2E テスト実行の証跡義務とカバレッジ確認の概要を品質基準として記載しなければならない。詳細な手順はテンプレートに委譲する（MUST）
- **FR-013**: ec-site-arch の constitution に E2E テスト証跡義務（パス件数 0 件はエラー）とローカルカバレッジ確認手順を追加しなければならない（MUST）

#### 外部 URL 検証（US4）

- **FR-014**: constitution-example の外部リソース検証セクションに概要（HTTP リクエストによる検証・plan 時点では検証済みとしない旨）を記載しなければならない。詳細な手順はテンプレートに委譲する（MUST）
- **FR-015**: ec-site-arch の constitution に外部リソース検証の詳細（HTTP リクエストによる 200 応答確認・失敗時は代替 URL に置換・plan 時点では検証済みとしない）を追加しなければならない（MUST）

#### リリース ZIP・ドキュメント整備

- **FR-016**: リリース ZIP のパッケージング設定（release.yml）を修正し、`.specify/templates/tasks-template.md` のみを ZIP に含めなければならない。他のテンプレート（spec/plan/checklist/agent-file）は `specify init` で配置されるため除外する。`.specify/memory/` および `.specify/scripts/` は引き続き除外する（MUST）
- **FR-017**: SPECKIT_INTEGRATION.md のセットアップ手順を「`specify init` → ZIP 展開（テンプレート上書き）→ `/speckit.constitution`」の順序に更新しなければならない（MUST）

### Key Entities

- **タスクテンプレート**: speckit がタスク一覧を生成する際の構造定義。Red-Green-Refactor-検証の 4 ステップ、テスト種別、サンプル保護タスクを含む。リリース ZIP に同梱され、展開先で直接品質を制御する
- **constitution-example**: ZIP 展開先で `/speckit.constitution` を実行する際の入力ガイド。品質基準の概要を記載し、詳細な手順はテンプレートに委譲する
- **constitution**: ec-site-arch 自身の開発憲法。タスクテンプレートとの整合性を維持する
- **シードデータ**: infrastructure のインメモリストアに投入される初期データ。ベース部分（サンプル互換・不変）と拡張部分（本番追加分）で構成される

### Assumptions

- ZIP 展開先プロジェクトのセットアップ手順は `specify init` → ZIP 展開（`tasks-template.md` が上書きされる）→ `/speckit.constitution` の順序で行う
- `.specify/templates/tasks-template.md` のみリリース ZIP に含める。他のテンプレート・`.specify/memory/`・`.specify/scripts/` は ZIP に含めない
- 品質ガードの詳細（TDD ステップ構成・テスト種別・カバレッジ基準等）はテンプレートで直接制御し、constitution-example は概要のみを記載する
- constitution-example は `/speckit.constitution` 実行時の入力ガイドとしての役割に集中し、テンプレートと重複する詳細は記載しない
- サンプルテストのリグレッションチェックは CI の quality ジョブ内で実行し、E2E ジョブとは別に扱う
- シードデータのベース/拡張分離は、既存のサンプルテストが依存するデータセットを変更しないことを保証する

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: タスクテンプレートから生成されるタスクの 100% が Red-Green-Refactor-検証 の 4 ステップ構成を含む
- **SC-002**: contracts に `.default()` 付き新規フィールドを追加した場合に、サンプルの全テスト（unit・integration・E2E）が修正なしで 100% パスする
- **SC-003**: CI パイプラインで本番 E2E テストファイル未存在時に E2E ジョブが 100% 失敗する
- **SC-004**: CI パイプラインの quality ジョブでサンプルテストのリグレッションチェックが毎回実行される
- **SC-005**: ZIP 展開後の `.specify/templates/` にタスクテンプレートが配置され、`/speckit.tasks` で Red-Green-Refactor-検証 構成のタスクが生成される
- **SC-006**: タスクテンプレートと constitution の TDD 関連記述に矛盾が 0 件である
- **SC-007**: リリース ZIP に `.specify/templates/tasks-template.md` のみが含まれ、他のテンプレート・`.specify/memory/` が含まれない
