# Data Model: speckit実装時の品質ガード強化

**Branch**: `008-quality-guard` | **Date**: 2026-02-11

本機能はプロセス改善であり、新規エンティティの追加はない。
以下はシードデータ分離に伴う既存データモデルの構造変更を記述する。

## シードデータ分離: `src/infrastructure/repositories/product.ts`

### 現状

```typescript
// 単一配列（6件）
const sampleProducts: Product[] = [
  { id: '550e8400-...440000', name: 'E2Eテスト商品', ... },
  { id: '550e8400-...440001', name: 'ミニマルTシャツ', ... },
  { id: '550e8400-...440002', name: 'レザーウォレット', ... },
  { id: '550e8400-...440003', name: 'キャンバストートバッグ', ... },
  { id: '550e8400-...440004', name: 'ウールニット', ... },
  { id: '550e8400-...440005', name: 'デニムパンツ', status: 'draft', ... },
];
```

### 変更後

```typescript
/**
 * ベースデータ（サンプル互換・不変）
 * サンプルテストが依存するデータセット。変更禁止。
 * 本番機能追加時は EXTENSION_PRODUCTS に追加すること。
 */
export const BASE_PRODUCTS: Product[] = [
  { id: '550e8400-...440000', name: 'E2Eテスト商品', ... },
  { id: '550e8400-...440001', name: 'ミニマルTシャツ', ... },
  { id: '550e8400-...440002', name: 'レザーウォレット', ... },
  { id: '550e8400-...440003', name: 'キャンバストートバッグ', ... },
  { id: '550e8400-...440004', name: 'ウールニット', ... },
  { id: '550e8400-...440005', name: 'デニムパンツ', status: 'draft', ... },
];

/**
 * 拡張データ（本番追加分）
 * 本番機能実装時にここにデータを追加する。
 * ベースデータとの ID 重複を避けること。
 */
export const EXTENSION_PRODUCTS: Product[] = [];
```

### 制約

| ルール | 内容 |
|--------|------|
| ベースデータの不変性 | `BASE_PRODUCTS` の件数・フィールド値を変更してはならない |
| ID 重複禁止 | `EXTENSION_PRODUCTS` のIDは `BASE_PRODUCTS` のIDと重複してはならない |
| ステータス分布 | `BASE_PRODUCTS` に published と draft の両方を含む（テスト用） |

## contracts 後方互換ルール

新規フィールド追加時の設計ルール（既存の `src/contracts/catalog.ts` を基準に記述）:

| ルール | 説明 | 例 |
|--------|------|-----|
| `.default()` 付与 | 新規フィールドにデフォルト値を設定 | `stock: z.number().int().min(0).default(0)` |
| `.optional()` 付与 | デフォルト値がない場合はオプショナルに | `category: z.string().optional()` |
| 必須フィールド追加禁止 | `.default()` も `.optional()` もないフィールドの追加はサンプルテストを破損させるため禁止 | ❌ `stock: z.number().int().min(0)` |

### 現在の ProductSchema フィールド

| フィールド | 型 | 必須/Optional | default |
|-----------|------|---------------|---------|
| id | string (uuid) | 必須 | - |
| name | string | 必須 | - |
| price | number (int) | 必須 | - |
| description | string | optional | - |
| imageUrl | string (url) | optional | - |
| status | ProductStatus | 必須 | - |
| createdAt | date (coerce) | 必須 | - |
| updatedAt | date (coerce) | 必須 | - |

## リポジトリインターフェース安定性ルール

| ルール | 説明 |
|--------|------|
| 検索パラメータ追加はオプショナル | `findAll(params: { ..., keyword?: string })` のように `?` を付与 |
| 既存メソッドシグネチャの破壊禁止 | 既存パラメータの型変更・削除は prohibited |
| 新規メソッド追加は許可 | 既存メソッドに影響しないため |
