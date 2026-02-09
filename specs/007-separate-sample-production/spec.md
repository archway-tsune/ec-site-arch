# Feature Specification: サンプル画面と本番画面の完全分離

**Feature Branch**: `007-separate-sample-production`
**Created**: 2026-02-09
**Status**: Draft
**Input**: User description: "サンプル画面と本番画面の完全分離 - リリースZIP展開後にサンプル実装が本番に混入しないよう、ページ・API Routes・ドメイン層を完全に分離する"

## Clarifications

### Session 2026-02-09

- Q: リリースZIPにサンプルアプリ実装（ページ・レイアウト・API Routes）を含めるか？含める場合、本番環境で `/sample/*` ルートとしてアクセス可能になるが許容するか？ → A: ZIPに全て含め、`/sample/*` ルートとしてアクセス可能な状態にする。本番実装時の参考コードとして活用する。
- Q: 本番実装完了後のサンプル除去方法は？ → A: `src/samples/` および `src/app/(samples)/` ディレクトリを削除することで、本番アプリからサンプル実装を完全に除去できるようにする。削除後もビルド・動作に影響がないこと。
- Q: 本番スキャフォールドページ（「ドメイン未実装」表示）にサンプルページへの参照リンクを含めるか？ → A: 含めない。「ドメイン未実装」メッセージのみ表示する。
- Q: 既存ドキュメントへの変更反映は？ → A: 分離に伴う変更を既存ドキュメント（`src/domains/README.md`, `src/samples/README.md`, `docs/GETTING_STARTED.md`, `CLAUDE.md`）に適切に反映する。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 本番デプロイ後にサンプル画面が動作しない (Priority: P1)

リリースZIPを展開して本番環境にデプロイした開発者が、サンプル画面に一切アクセスできないことを確認する。本番パス（`/catalog`, `/cart`, `/admin/products` 等）にアクセスしても、サンプルドメインの実装ではなく「ドメイン未実装」を示す案内が表示される。

**Why this priority**: この機能の存在理由そのもの。サンプル実装が本番に残ると、エンドユーザーに不完全な画面が見えてしまい、信頼性を損なう。

**Independent Test**: リリースZIPを展開し、全ての本番URLパスにアクセスして、サンプルデータやサンプルUIが表示されないことを確認できる。

**Acceptance Scenarios**:

1. **Given** リリースZIPを展開した直後の状態, **When** 購入者が `/catalog` にアクセスする, **Then** 「ドメイン未実装」を示す最小限のUIが表示され、サンプル商品一覧は表示されない
2. **Given** リリースZIPを展開した直後の状態, **When** 管理者が `/admin/products` にアクセスする, **Then** 「ドメイン未実装」を示す最小限のUIが表示され、サンプル商品管理画面は表示されない
3. **Given** リリースZIPを展開した直後の状態, **When** ユーザーがヘッダーのカートアイコンをクリックする, **Then** 「ドメイン未実装」のカートページが表示され、サンプルのカート実装は動作しない
4. **Given** リリースZIPを展開した直後の状態, **When** 外部から本番API `/api/catalog/products` を呼び出す, **Then** 「未実装」を示すエラーレスポンスが返され、サンプルデータは返却されない
5. **Given** リリースZIPを展開した直後の状態, **When** `/sample/catalog` にアクセスする, **Then** サンプル画面が表示される（参照用デモとして利用可能。本番パスとは完全に分離されている）

---

### User Story 2 - サンプル画面が独立して動作する (Priority: P2)

テンプレート開発者（アーキテクチャ基盤の開発者）が、サンプル画面を `/sample/` プレフィックス配下で独立して動作確認できる。サンプル画面内のナビゲーション・リンク・API呼び出しはすべてサンプル用のパスを使用し、本番パスへの遷移が発生しない。

**Why this priority**: サンプルが動作検証環境として機能し続けることで、アーキテクチャの品質を担保できる。

**Independent Test**: 開発環境でサンプル画面（`/sample/catalog` 等）にアクセスし、全てのリンク・操作がサンプル用パス内で完結することを確認できる。

**Acceptance Scenarios**:

1. **Given** 開発環境でアプリケーションが起動している状態, **When** `/sample/catalog` にアクセスする, **Then** サンプル商品一覧が表示され、商品データはサンプルAPIから取得される
2. **Given** サンプル購入者画面を表示している状態, **When** ヘッダーのカートアイコンをクリックする, **Then** `/sample/cart` に遷移し（`/cart` ではなく）、サンプルのカート画面が表示される
3. **Given** サンプル購入者画面を表示している状態, **When** ヘッダーのサイト名（ロゴ）をクリックする, **Then** `/sample/` に遷移し（`/` ではなく）、サンプルのホーム画面が表示される
4. **Given** サンプル管理者画面を表示している状態, **When** サイドバーの「商品管理」をクリックする, **Then** `/sample/admin/products` に遷移し（`/admin/products` ではなく）、サンプルの商品管理画面が表示される
5. **Given** サンプルカタログ画面で商品の「カートに追加」をクリックした状態, **When** APIリクエストが送信される, **Then** `/sample/api/cart/items` に対してリクエストが送信され（`/api/cart/items` ではなく）、サンプルのカートにアイテムが追加される

---

### User Story 3 - ドメイン層が本番実装に切り替え可能 (Priority: P3)

本番開発者がドメイン層のスタブ実装を独自のビジネスロジックに置き換えると、本番画面が正常に動作する。本番画面・API Routesの構造はそのまま利用でき、ドメイン層の置き換えのみで本番稼働に移行できる。

**Why this priority**: テンプレートの本来の目的である「置き換えによる本番実装」のワークフローが機能すること。

**Independent Test**: ドメイン層のスタブを簡易的な実装に置き換え、本番パスでその実装が動作することを確認できる。

**Acceptance Scenarios**:

1. **Given** ドメインスタブが配置された初期状態, **When** 開発者が `src/domains/catalog/api/index.ts` のスタブを独自実装に置き換える, **Then** `/api/catalog/products` が独自実装のレスポンスを返す
2. **Given** ドメインスタブが配置された初期状態, **When** 開発者が `src/domains/catalog/ui/index.ts` のプレースホルダーを独自コンポーネントに置き換える, **Then** `/catalog` ページが独自UIを表示する

---

### User Story 4 - 既存サンプルテストが継続動作する (Priority: P2)

サンプルE2Eテスト・単体テスト・統合テストが、サンプル画面の移動後も引き続き正常に動作する。テストのベースURLが `/sample/` プレフィックスに対応し、テスト結果に変化がない。

**Why this priority**: テストが壊れるとアーキテクチャの品質保証ができなくなるため、分離と同等の重要度。

**Independent Test**: サンプルテストコマンド（`pnpm test:unit:samples`, `pnpm test:e2e:samples` 等）を実行し、全テストがパスすることを確認できる。

**Acceptance Scenarios**:

1. **Given** サンプル画面が `/sample/` 配下に移動した状態, **When** `pnpm test:e2e:samples` を実行する, **Then** 全てのサンプルE2Eテストがパスする
2. **Given** サンプル画面が `/sample/` 配下に移動した状態, **When** `pnpm test:unit:samples` を実行する, **Then** 全てのサンプル単体テストがパスする
3. **Given** サンプル画面が `/sample/` 配下に移動した状態, **When** `pnpm test:integration:samples` を実行する, **Then** 全てのサンプル統合テストがパスする

---

### User Story 5 - リリースZIPにサンプルアプリ実装が参照用として含まれる (Priority: P2)

リリース自動化ワークフローで生成されるZIPファイルに、サンプルアプリ実装（ページ・レイアウト・サンプルAPI Routes）が全て含まれること。本番開発者がサンプルコードを参照しながら本番実装を行える。ZIPを展開してビルドすると `/sample/*` でサンプル画面にアクセスでき、動作するデモとしても活用できる。

**Why this priority**: サンプル実装が参照コードとして利用可能であることで、本番開発の効率が向上する。

**Independent Test**: リリースZIPを生成・展開し、`/sample/catalog` 等にアクセスしてサンプル画面が動作することを確認できる。

**Acceptance Scenarios**:

1. **Given** リリースワークフローが実行された状態, **When** ZIPファイルの内容を確認する, **Then** `src/app/(samples)/` ディレクトリおよびその配下のファイルが含まれている
2. **Given** リリースZIPを展開した状態, **When** Next.jsビルドを実行し `/sample/catalog` にアクセスする, **Then** サンプル商品一覧が表示され、動作するデモとして利用できる

---

### Edge Cases

- 本番API Routesにドメインスタブが配置された状態で大量のリクエストが送信された場合、適切なエラーレスポンス（501 Not Implemented）を返し、サーバーエラー（500）にならないこと
- サンプル画面と本番画面で同一の `@/infrastructure/` リポジトリを共有するため、開発環境でサンプル操作（カートにアイテム追加等）と本番操作が同一データストアに影響し合う可能性がある。サンプルAPIと本番APIは独立したインフラ層エンドポイントを参照するため、データ混在は発生しない前提とする
- サンプル画面を除外した状態でも `src/samples/domains/` と `src/samples/tests/` はZIPに含まれ、参照コードとして利用可能であること
- 認証ミドルウェアがサンプルパス（`/sample/admin/*`）と本番パス（`/admin/*`）の両方で正しく動作すること
- `src/samples/` と `src/app/(samples)/` を削除した後、残存する本番コードにインポートエラーやビルドエラーが発生しないこと（本番コードからサンプルへの逆依存が存在しない）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 本番パス（`/`, `/catalog`, `/cart`, `/checkout`, `/orders`, `/admin` 等）のページは、`@/samples/` を一切参照せず、ドメイン未実装を示す最小限のUIを表示しなければならない
- **FR-002**: 本番API Routes（`/api/catalog/*`, `/api/cart/*`, `/api/orders/*`）は、`@/samples/` を一切参照せず、ドメイン未実装時に 501 Not Implemented レスポンスを返さなければならない
- **FR-003**: サンプル画面は `/sample/` URLプレフィックス配下でのみアクセス可能でなければならない（購入者: `/sample/catalog` 等、管理者: `/sample/admin` 等）
- **FR-004**: サンプルAPI Routesは `/sample/api/` URLプレフィックス配下でのみアクセス可能でなければならない
- **FR-005**: サンプル画面内のすべてのナビゲーションリンク（ヘッダーのカートアイコン、サイト名リンク、ログイン/ログアウトリンク、ナビゲーションメニュー）は `/sample/` プレフィックス付きのパスを使用しなければならない
- **FR-006**: サンプル画面内のすべてのAPIリクエスト（データ取得・更新・削除）は `/sample/api/` プレフィックス付きのエンドポイントに送信しなければならない
- **FR-007**: ドメイン層スキャフォールド（`src/domains/*/api/`, `src/domains/*/ui/`）は `@/samples/` への依存を含まず、スタブ実装を提供しなければならない
- **FR-008**: リリースZIPにサンプルアプリ実装（ページ・レイアウト・API Routes: `src/app/(samples)/`）を全て含め、本番実装時の参照用デモとして利用可能にしなければならない
- **FR-009**: リリースZIPにサンプルの参照コード（`src/samples/domains/`, `src/samples/tests/`）も引き続き含めなければならない
- **FR-010**: 既存のサンプルテスト（単体・統合・E2E）はサンプル画面移動後も正常に動作しなければならない
- **FR-011**: 認証ミドルウェアはサンプルパスと本番パスの両方で適切に動作しなければならない
- **FR-012**: 共有レイヤー（`@/infrastructure/`, `@/foundation/`, `@/contracts/`, `@/templates/`）のインターフェースは変更してはならない
- **FR-013**: 本番実装完了後に `src/samples/` および `src/app/(samples)/` を削除した場合、ビルドエラーや実行時エラーが発生せず、本番アプリが正常に動作しなければならない
- **FR-014**: 本番コード（`src/app/` の本番ページ・API Routes、`src/domains/`、`src/infrastructure/`、`src/foundation/`）は `src/samples/` および `src/app/(samples)/` への依存を一切持ってはならない
- **FR-015**: 分離に伴う変更を既存ドキュメントに反映しなければならない。対象: `src/domains/README.md`（スタブ実装の説明）、`src/samples/README.md`（`/sample/` URL構成・`src/app/(samples)/` の説明）、`docs/GETTING_STARTED.md`（依存構造図・本番移行手順・サンプル削除手順）、`CLAUDE.md`（プロジェクト構造）

### Key Entities

- **本番スキャフォールドページ**: 本番パスに配置される最小限のUI。ドメイン未実装を示すメッセージのみを表示する（サンプルページへのリンクは含めない）。`@/domains/` のスタブを参照する
- **サンプルページ**: `/sample/` 配下に配置されるデモ画面。`@/samples/domains/` を直接参照し、サンプルAPIを呼び出す
- **ドメインスタブ**: `src/domains/` に配置されるプレースホルダー実装。`@/samples/` への依存を持たず、本番実装に置き換えられる前提のスタブ（API: エラーをスロー、UI: プレースホルダーコンポーネント）
- **サンプルAPI Routes**: `/sample/api/` 配下に配置されるAPI。`@/samples/domains/` のビジネスロジックと共有 `@/infrastructure/` を利用する

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: リリースZIP展開後の全本番URLパス（購入者8画面 + 管理者8画面）で、サンプル実装由来のデータ・UIが一切表示されないこと
- **SC-002**: リリースZIP展開後の全本番APIエンドポイントで、サンプル実装由来のレスポンスが返却されないこと
- **SC-003**: 開発環境のサンプル画面（`/sample/` 配下）で、本番パスへのリンク・遷移が一切発生しないこと
- **SC-004**: 既存のサンプルテスト（単体・統合・E2E）が100%パスすること
- **SC-005**: `src/domains/` 配下のファイルに `@/samples/` への import 文が存在しないこと
- **SC-006**: リリースZIPに `src/app/(samples)/` 配下のサンプルアプリ実装が全て含まれ、展開後に `/sample/*` でサンプル画面が動作すること
- **SC-007**: 既存ドキュメント（`src/domains/README.md`, `src/samples/README.md`, `docs/GETTING_STARTED.md`, `CLAUDE.md`）の記述が分離後のアーキテクチャと整合していること

## Assumptions

- `@/infrastructure/` はサンプルと本番で共有利用する。インフラ層自体はサンプルデータを内部に持つが、`@/samples/` からインポートしていないため分離対象外とする
- 本番API Routesの認証フロー（`/api/auth/login`, `/api/auth/logout`, `/api/auth/session`）はドメイン層を使用しないため、引き続き本番でも動作する
- テスト用APIエンドポイント（`/api/test/reset`）はインフラ層のみに依存するため、本番でも存在する（開発用のため本番デプロイ時に削除するかは利用者の判断）
- サンプルページは `@/samples/domains/` を直接インポートし、`@/domains/` 経由の再エクスポートは使用しない
