# Spec Template - ECサイト機能仕様例

`/speckit.specify` 実行時の参考テンプレートです。

---

## 例: 商品レビュー機能

### spec.md

```markdown
# Feature: 商品レビュー機能

## 概要

購入者が商品に対してレビュー（評価・コメント）を投稿できる機能。
商品詳細ページでレビューを閲覧し、購入済み商品にレビューを投稿できる。

## ユーザーストーリー

- As a 購入者, I want to 商品のレビューを閲覧したい, so that 購入の参考にできる
- As a 購入者, I want to 購入した商品にレビューを投稿したい, so that 他の人の参考になる
- As a 管理者, I want to 不適切なレビューを非公開にしたい, so that サイトの品質を保てる

## 機能要件

### FR-001: レビュー閲覧
- 説明: 商品詳細ページでレビュー一覧を表示
- 表示項目: 評価（星1-5）、コメント、投稿者名、投稿日
- ソート: 新着順（デフォルト）、評価順
- ページネーション: 10件/ページ
- 優先度: Must

### FR-002: レビュー投稿
- 説明: 購入済み商品にレビューを投稿
- 入力項目: 評価（星1-5、必須）、コメント（任意、500文字以内）
- 制約: 同一商品に1件のみ、購入者本人のみ
- 優先度: Must

### FR-003: レビュー管理（管理者）
- 説明: 管理者がレビューを非公開/公開設定
- 一覧: 全レビュー、フィルタ（公開/非公開/報告済み）
- 操作: 公開/非公開切り替え、削除
- 優先度: Should

## UI要件

### 画面一覧
| 画面ID | 画面名 | パス | テンプレート |
|--------|--------|------|-------------|
| UI-001 | 商品詳細（レビュー表示） | /catalog/[id] | 既存に追加 |
| UI-002 | レビュー投稿モーダル | /catalog/[id] | FormPageTemplate |
| UI-003 | レビュー管理一覧 | /admin/reviews | ListPageTemplate |

### UIコンポーネント
- `ReviewList`: レビュー一覧表示
- `ReviewCard`: レビュー1件の表示
- `ReviewForm`: レビュー投稿フォーム
- `StarRating`: 星評価表示/入力

## API要件

### エンドポイント一覧
| メソッド | パス | 説明 | 認可 |
|---------|------|------|------|
| GET | /api/products/[id]/reviews | レビュー一覧取得 | 不要 |
| POST | /api/products/[id]/reviews | レビュー投稿 | buyer |
| GET | /api/admin/reviews | 管理用レビュー一覧 | admin |
| PATCH | /api/admin/reviews/[id] | レビュー公開/非公開 | admin |
| DELETE | /api/admin/reviews/[id] | レビュー削除 | admin |

### リクエスト/レスポンス

#### POST /api/products/[id]/reviews
\`\`\`typescript
// Request
interface CreateReviewInput {
  rating: number;      // 1-5
  comment?: string;    // max 500
}

// Response
interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  status: 'published' | 'hidden';
  createdAt: Date;
}
\`\`\`

## データモデル

### Review
| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string (UUID) | レビューID |
| productId | string | 商品ID |
| userId | string | 投稿者ID |
| rating | number | 評価 (1-5) |
| comment | string | null | コメント |
| status | enum | published / hidden |
| createdAt | Date | 投稿日時 |
| updatedAt | Date | 更新日時 |

## 実装ガイド

### 使用テンプレート
\`\`\`typescript
// UI
import { ListPageTemplate } from '@/templates/ui/pages/list';
import { FormField } from '@/templates/ui/components/form/FormField';

// API
import { createUseCase } from '@/templates/api/usecase';
import { requireAuth, requireRole } from '@/foundation/auth/authorize';

// インフラ
import { createHmrSafeStore } from '@/templates/infrastructure/repository';
\`\`\`

### ディレクトリ構成
\`\`\`
src/domains/review/
├── api/
│   └── usecases.ts
├── ui/
│   ├── ReviewList.tsx
│   ├── ReviewCard.tsx
│   ├── ReviewForm.tsx
│   └── StarRating.tsx
├── types/
│   └── index.ts
└── tests/
    └── unit/
        └── usecases.test.ts
\`\`\`

## テスト要件

### 単体テスト
- レビュー取得ユースケース（正常系、0件、ページネーション）
- レビュー投稿ユースケース（正常系、未購入エラー、重複エラー）
- StarRatingコンポーネント（表示、入力）

### E2Eテスト
- 商品詳細でレビュー一覧が表示される
- 購入者がレビューを投稿できる
- 管理者がレビューを非公開にできる

## 品質要件
- テストカバレッジ: 80%以上
- TypeScript: エラー0件
- ESLint: エラー0件
```

---

### plan.md

```markdown
# Plan: 商品レビュー機能

## 設計方針

### アーキテクチャ
- 既存の domains/ 構成に従い `src/domains/review/` に実装
- 商品詳細ページ（Catalog）にレビュー表示を統合
- 管理画面は独立したページとして実装

### データアクセス
- インメモリリポジトリ（開発用）
- 商品購入チェックは Orders リポジトリを参照

### 認可
- 閲覧: 認証不要
- 投稿: buyer（購入済み確認）
- 管理: admin

## 実装順序

1. **型定義・リポジトリ**: Review エンティティ、インメモリストア
2. **APIユースケース**: GetReviews, CreateReview, UpdateReviewStatus
3. **UIコンポーネント**: StarRating, ReviewCard, ReviewList, ReviewForm
4. **ページ統合**: 商品詳細にレビュー表示、管理一覧ページ
5. **テスト**: 単体テスト、E2Eテスト

## 技術的考慮事項

### パフォーマンス
- レビュー一覧はページネーション必須
- 平均評価は商品取得時に計算（キャッシュ推奨）

### セキュリティ
- XSS対策: コメントのサニタイズ
- 投稿制限: 同一商品に1件のみ
- 購入確認: 注文履歴との照合

### 拡張性
- レビュー報告機能（将来）
- レビューへの返信（将来）
```

---

### tasks.md

```markdown
# Tasks: 商品レビュー機能

## フェーズ1: 基盤実装

### Task 1-1: 型定義・リポジトリ
- [ ] T001 Review型定義を実装する `src/domains/review/types/index.ts`
- [ ] T002 Reviewリポジトリを実装する `src/infrastructure/repositories/review.ts`
- [ ] T003 [P] リポジトリの単体テストを実装する `tests/unit/infrastructure/review.test.ts`

### Task 1-2: APIユースケース
- [ ] T004 GetReviewsユースケースを実装する `src/domains/review/api/usecases.ts`
- [ ] T005 CreateReviewユースケースを実装する `src/domains/review/api/usecases.ts`
- [ ] T006 [P] ユースケースの単体テストを実装する `tests/unit/domains/review/usecases.test.ts`

## フェーズ2: UI実装

### Task 2-1: 共通コンポーネント
- [ ] T007 [P] StarRatingコンポーネントを実装する `src/domains/review/ui/StarRating.tsx`
- [ ] T008 [P] ReviewCardコンポーネントを実装する `src/domains/review/ui/ReviewCard.tsx`
- [ ] T009 ReviewListコンポーネントを実装する `src/domains/review/ui/ReviewList.tsx`
- [ ] T010 ReviewFormコンポーネントを実装する `src/domains/review/ui/ReviewForm.tsx`
- [ ] T011 [P] UIコンポーネントの単体テストを実装する `tests/unit/domains/review/ui.test.tsx`

### Task 2-2: ページ統合
- [ ] T012 商品詳細ページにレビュー表示を追加する `src/app/(buyer)/catalog/[id]/page.tsx`
- [ ] T013 レビューAPIルートを実装する `src/app/api/products/[id]/reviews/route.ts`

## フェーズ3: 管理機能

### Task 3-1: 管理API
- [ ] T014 UpdateReviewStatusユースケースを実装する `src/domains/review/api/usecases.ts`
- [ ] T015 管理用レビューAPIルートを実装する `src/app/api/admin/reviews/route.ts`

### Task 3-2: 管理UI
- [ ] T016 レビュー管理一覧ページを実装する `src/app/admin/reviews/page.tsx`

## フェーズ4: テスト

### Task 4-1: E2Eテスト
- [ ] T017 レビュー機能E2Eテストを実装する `tests/e2e/review.spec.ts`

## 依存関係
- T001 → T002, T004, T005
- T002 → T004, T005
- T004, T005 → T009, T010, T012, T013
- T007, T008 → T009, T010
- T014 → T015, T016
```

---

## 使い方

1. `/speckit.specify` で機能概要を入力
2. 生成された spec.md を上記例を参考に調整
3. `/speckit.plan` で実装計画を生成
4. `/speckit.tasks` でタスクを生成
5. `/speckit.implement` で実装開始
