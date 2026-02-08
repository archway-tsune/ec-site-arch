# Research: サンプル画面と本番画面の完全分離

## R-001: Next.js App Router ルートグループによるサンプル分離

**Decision**: `(samples)` ルートグループ + `sample/` ディレクトリで `/sample/*` URLプレフィックスを実現する

**Rationale**:
- Next.js App Router の `(groupName)` はURL構造に影響しないルートグループ
- `(samples)/sample/` 構成では `(samples)` がグループ名（URLに含まれない）、`sample/` が実際のURLセグメント
- `src/app/(samples)/sample/catalog/page.tsx` → URL: `/sample/catalog`
- `src/app/(samples)/sample/admin/page.tsx` → URL: `/sample/admin`
- ルートグループ内に独自の `layout.tsx` を配置可能（サンプル専用レイアウト不要の場合は省略可）

**Alternatives considered**:
- 環境変数による切り替え: 本番コードにサンプルコードが残る問題が解決しない
- 別アプリケーション: 過剰な複雑さ
- ビルド時除外: Next.js の標準機能では対応困難

## R-002: ドメインスタブの設計パターン

**Decision**: `NotImplementedError` をスローするスタブ関数 + プレースホルダー React コンポーネント

**Rationale**:
- API スタブ: 既存の API Routes は `try-catch` で `@/domains/` のエラーをハンドリングしている。`NotImplementedError` をスローすれば、既存の catch ブロックで 500 として処理されるが、501 を返すには API Route 側で明示的にキャッチする必要がある
- 調査結果: 既存 API Routes の catch ブロックは特定のエラー型（`NotFoundError`, `ValidationError`, `ForbiddenError`）を個別処理し、その他は `ErrorCode.INTERNAL_ERROR` (500) として返す
- **対応方針**: `@/foundation/errors/` に `NotImplementedError` クラスを追加し、API Routes の catch ブロックにそのハンドリングを追加する。ただし、FR-012 で共有レイヤーのインターフェース変更を禁止しているため、`NotImplementedError` は `@/domains/` 内に定義するか、既存の `@/foundation/errors/types.ts` の `ErrorCode` enum に `NOT_IMPLEMENTED` を追加する（enum 値の追加はインターフェース破壊にならない）
- UI スタブ: 既存の `ProductList`, `CartView`, `OrderList`, `OrderDetail`, `ProductDetail` と同じ export 名で「ドメイン未実装」を表示するコンポーネントを提供

**Alternatives considered**:
- 空オブジェクトの export: 型安全性が失われる
- 条件分岐による切り替え: `@/samples/` への依存が残る

## R-003: サンプルAPI Routes の import 構造

**Decision**: 既存 API Routes を複製し、`@/domains/*/api` の import を `@/samples/domains/*/api` に置き換える

**Rationale**:
- 現在の API Route 構造:
  ```typescript
  import { getProducts, createProduct } from '@/domains/catalog/api';
  import { productRepository } from '@/infrastructure/repositories';
  ```
- サンプル API Route:
  ```typescript
  import { getProducts, createProduct } from '@/samples/domains/catalog/api';
  import { productRepository } from '@/infrastructure/repositories';
  ```
- `@/infrastructure/` と `@/foundation/` の import はそのまま維持
- 認証 API Routes（`/api/auth/*`）は `@/domains/` を使用しないため、そのまま複製可能

**Alternatives considered**:
- Route handler ファクトリパターン: 過剰な抽象化。ファイル数は増えるが、各ファイルの変更は import 1行のみ

## R-004: ミドルウェアのサンプルパス対応

**Decision**: 既存ミドルウェアの `PUBLIC_PATHS` と `ADMIN_PATHS` にサンプルパスのパターンを追加

**Rationale**:
- 現在の構成:
  - `PUBLIC_PATHS = ['/login', '/api/auth/login', '/_next', '/favicon.ico']`
  - `ADMIN_PATHS = ['/admin']`
- サンプル追加分:
  - `PUBLIC_PATHS` に `/sample/login`, `/sample/api/auth/login` を追加
  - `ADMIN_PATHS` に `/sample/admin` を追加
- `isPublicPath` と `isAdminPath` は `startsWith` で判定しているため、`/sample/admin` を追加すれば `/sample/admin/*` 全体がカバーされる
- 未認証時のリダイレクト先: サンプルパスからのアクセスは `/sample/login` にリダイレクトする必要がある（現在は `/login` 固定）

**Alternatives considered**:
- サンプルパスを認証不要にする: セキュリティ要件（FR-011）に違反

## R-005: サンプルE2Eテストの URL 更新

**Decision**: E2E テスト内の全 URL に `/sample` プレフィックスを追加

**Rationale**:
- 現在のテストは `page.goto('/catalog')` 等でページ遷移している
- `/sample/catalog` に変更するだけで対応可能
- `playwright.samples.config.ts` の `baseURL` は `http://localhost:3000` のまま維持（プレフィックスはテスト内のパスで対応）
- API 呼び出し（`/api/test/reset` 等）も `/sample/api/test/reset` に変更

**Alternatives considered**:
- baseURL を変更: Next.js App Router では basePath 設定が難しく、テスト内のパスで対応する方が確実

## R-006: リリースZIPの除外パターン変更

**Decision**: `release.yml` から `playwright.samples.config.ts` の除外を維持。`src/app/(samples)/` は除外しない（ZIPに含める）

**Rationale**:
- spec の clarification で「リリースZIPにはサンプルアプリ実装をすべて含める」と決定済み
- 現在の除外リスト変更なし（`playwright.samples.config.ts` のみ除外は維持）
- `vitest.samples.config.ts` は現在除外されていない → release.yml に `vitest.samples.config.ts` の除外追加を検討したが、サンプルテスト設定も参照用として有用なため含める

**Alternatives considered**:
- N/A（仕様確定済み）
