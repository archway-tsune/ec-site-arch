# 調査: UIテンプレートコンポーネントの拡充

**作成日**: 2026-02-07
**フィーチャー**: 002-ui-template-components

## 調査結果

### 1. 既存テンプレートのコーディングパターン

**判断**: 既存コンポーネント（Loading, Error, Empty, ConfirmDialog）のパターンを完全踏襲する

**理由**: speckit-trainingで実際に使われているパターンとの一貫性を保つため。既存テンプレートは以下の構造を持つ:
- `'use client'` ディレクティブ（クライアントコンポーネントの場合）
- JSDocコメント（日本語）に使用例を含む
- 型定義セクション（`// ─────` 区切り線付き）
- スタイル定数セクション
- コンポーネントセクション
- `data-testid` 属性
- ARIA アクセシビリティ属性

**検討した代替案**:
- shadcn/ui スタイル → 外部依存が増え、プロジェクトの最小依存方針に反する
- Headless UI パターン → オーバーエンジニアリング、テンプレートとしてはシンプルさが重要

### 2. コンポーネント配置ディレクトリ構造

**判断**: カテゴリ別サブディレクトリ（navigation/, data-display/）を新設し、form/ は既存に追加

**理由**: 既存構造（status/, layout/, form/, dialog/, auth/）に合わせたカテゴリ分類。コンポーネント数が増えてもファイルの検索性を維持できる。

**検討した代替案**:
- すべてを `components/` 直下にフラット配置 → ファイル数増加時に可読性低下
- 機能別ディレクトリ（pagination/, search/ 等） → 粒度が細かすぎる

### 3. ユーティリティ関数の配置

**判断**: `src/templates/ui/utils/format.ts` に formatPrice と formatDateTime を集約

**理由**: events.ts と同レベルに配置し、`utils/index.ts` からエクスポート。日付・通貨のフォーマットは密接に関連しているため同一ファイルに配置する。

**検討した代替案**:
- 個別ファイル（price.ts, datetime.ts） → 関数が少なく分割過剰
- foundation/ に配置 → UIテンプレートの表示用途なので templates/ui/utils が適切

### 4. Paginationコンポーネントの設計方針

**判断**: speckit-trainingの3箇所の実装を統合した汎用コンポーネント

**理由**: ProductList, OrderList, AdminProductTableの実装を分析し、共通のProps（page, limit, total, totalPages, onPageChange）を抽出。「全N件中 M〜L件を表示」テキスト + 前へ/次へボタンのシンプルなUI。

**検討した代替案**:
- ページ番号リスト付きのリッチなページネーション → speckit-trainingの実装はシンプルな前へ/次へのみ
- Headless pagination hook → コンポーネントテンプレートとしては具体的なUIが必要

### 5. StatusBadgeの汎用設計

**判断**: statusColors と statusLabels を Record<string, string> としてPropsで受け取る

**理由**: ドメインに依存しない汎用コンポーネントにするため、色とラベルのマッピングは利用側が定義する。注文ステータス、商品ステータス、支払いステータスなど異なるドメインで再利用可能。

**検討した代替案**:
- ステータス値を enum で固定 → ドメインに依存してしまい汎用性が失われる
- CSSクラスを直接渡す方式 → Tailwind CSSの色指定が統一されなくなる

### 6. ImagePlaceholderのサイズバリアント

**判断**: sm/md/lg の3サイズバリアント（Loading コンポーネントと同じパターン）

**理由**: Loadingコンポーネントで採用済みの sm/md/lg パターンに合わせる。ProductCard（sm）, ProductDetail（lg）, CartItem（md）の用途に対応。

**検討した代替案**:
- className で自由にサイズ指定 → 一貫性が保てない
- 固定サイズのみ → 用途が限定される

### 7. テスト構造

**判断**: 既存テストファイル（status.test.tsx, layout.test.tsx）と同じパターンで新規テストファイルを作成

**理由**: Given-When-Then形式、Vitest + React Testing Library、data-testid ベースのクエリを使用。カテゴリ別にテストファイルを分割（navigation.test.tsx, data-display.test.tsx 等）。

**検討した代替案**:
- コンポーネントごとに個別テストファイル → 既存パターンはカテゴリ別にまとめているため合わせる
- Storybook ベースのビジュアルテスト → 現在のプロジェクトにStorybook未導入

## 未解決事項

なし。すべての技術的判断が確定済み。
