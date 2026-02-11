# Research: speckit実装時の品質ガード強化

**Branch**: `008-quality-guard` | **Date**: 2026-02-11

## R1: release.yml での `.specify/templates/` 選択的 ZIP 同梱

**決定**: `-x ".specify/*"` を `-x ".specify/memory/*"` と `-x ".specify/scripts/*"` に分割する。

**根拠**: `zip -r` の `-x` オプションはグロブパターンで除外対象を指定する。`-x ".specify/*"` はディレクトリ全体を除外する。個別ディレクトリを除外することで `.specify/templates/` のみを含める。

**代替案**:
- A) `.specify/templates/` を別ディレクトリ（例: `docs/templates/`）にコピーして ZIP に含める → 不採用: ディレクトリ構造が speckit の規約と異なり、`specify init` 後の上書きが機能しない
- B) ZIP 作成後に `zip -u` で `.specify/templates/` を追加 → 不採用: 2 ステップになり、CI ステップが複雑化する

**検証**: リリース ZIP を展開後、`.specify/templates/tasks-template.md` が存在し、`.specify/memory/constitution.md` が存在しないことを確認する。

## R2: Zod Schema.parse() によるテストヘルパー後方互換性

**決定**: `createMock*()` ヘルパーで `Schema.parse()` を使用する。

**根拠**: Zod の `z.infer<typeof Schema>` は `.default()` 付きフィールドを output 型では required として扱う（input 型では optional）。つまり:
```typescript
const S = z.object({ name: z.string(), stock: z.number().default(0) });
type Out = z.infer<typeof S>; // { name: string; stock: number } ← stock は required
type In = z.input<typeof S>;  // { name: string; stock?: number } ← stock は optional
```
手動でオブジェクトリテラルを `Product` 型に代入する場合、新規フィールド（`stock` 等）を列挙しないとコンパイルエラーになる。`Schema.parse()` に渡す場合は `.default()` が自動補完されるため、既存のフィールドのみの記述で動作する。

**注意点**:
- `parse()` は runtime バリデーションも実行するため、テストデータが schema に適合していない場合は `ZodError` がスローされる
- `Partial<Product>` の overrides はスプレッドで適用し、`parse()` の入力に含める
- `z.coerce.date()` フィールドは `Date` オブジェクトまたは ISO 文字列のどちらも受け付ける

**対象ファイル調査結果**:

| ファイル | ヘルパー | Schema |
|---------|---------|--------|
| `src/samples/tests/unit/domains/catalog/usecase.test.ts` | `createMockProduct()` | `ProductSchema` |
| `src/samples/tests/unit/domains/catalog/ui.test.tsx` | `createMockProduct()` | `ProductSchema` |
| `src/samples/tests/integration/domains/catalog/api.test.ts` | `createMockProduct()` | `ProductSchema` |
| `src/samples/tests/unit/domains/cart/usecase.test.ts` | `createMockCart()` | `CartSchema` |
| `src/samples/tests/unit/domains/cart/ui.test.tsx` | 要確認 | `CartSchema` or N/A |
| `src/samples/tests/integration/domains/cart/api.test.ts` | 要確認 | `CartSchema` |
| `src/samples/tests/unit/domains/orders/usecase.test.ts` | `createMockOrder()` | `OrderSchema` |
| `src/samples/tests/unit/domains/orders/ui.test.tsx` | 要確認 | `OrderSchema` or N/A |
| `src/samples/tests/integration/domains/orders/api.test.ts` | 要確認 | `OrderSchema` |

## R3: シードデータ分離の設計パターン

**決定**: `BASE_PRODUCTS` と `EXTENSION_PRODUCTS` の 2 配列に分離。

**根拠**: 現在の `sampleProducts` は 6 件のデータを含み、サンプル E2E テストがこのデータに依存している（例: 件数の `toHaveCount()`、在庫切れ商品の存在チェック）。本番機能追加時にデータを追加・変更するとサンプルテストが破損する。

**設計詳細**:
- `BASE_PRODUCTS`: 既存の 6 件をそのまま保持。export して外部から参照可能にする
- `EXTENSION_PRODUCTS`: 空配列として定義。本番機能実装時にここにデータを追加する
- `initializeProductStore()` は `[...BASE_PRODUCTS, ...EXTENSION_PRODUCTS]` をマージ
- `resetProductStore()` も同様にマージ版でリセット

**代替案**:
- A) サンプル E2E テストのアサーションを件数に依存しない形に変更 → 不採用: 既に存在するテストの意図が変わり、テスト品質が低下する
- B) サンプル専用の別リポジトリモジュールにシードデータを分離 → 不採用: 過度な分離。配列分離で十分

## R4: CI サンプルリグレッションチェック

**決定**: CI の quality ジョブに `pnpm test:unit:samples` と `pnpm test:integration:samples` ステップを追加。

**根拠**: package.json に既にスクリプトが定義済み:
- `"test:unit:samples": "vitest run src/samples/tests/unit --config vitest.samples.config.ts"`
- `"test:integration:samples": "vitest run src/samples/tests/integration --config vitest.samples.config.ts"`

追加の設定変更は不要。CI ステップに `run:` 行を追加するのみ。

**配置位置**: quality ジョブの `Integration Tests` ステップの後に追加。本番テストの後にサンプルリグレッションを実行する流れ。

## R5: タスクテンプレート 4 ステップ構造

**決定**: 各ユーザーストーリーフェーズの構造を Red-Green-Refactor-検証 に再構成。

**現状のテンプレート構造**:
```markdown
## Phase N: User Story N - [Title]
### Tests for User Story N (OPTIONAL - only if tests requested) ⚠️
### Implementation for User Story N
**Checkpoint**
```

**新構造**:
```markdown
## Phase N: User Story N - [Title]
### Red: テスト作成 (MANDATORY)
> ユースケース単体テスト・UIコンポーネント単体テスト・API統合テスト・E2Eテスト
### Green: 最小実装
### Refactor: 改善
> 重複排除・命名改善・責務分離。全テストパスを検証
### 検証: E2Eテスト実行 + カバレッジ確認
> E2Eテスト実行結果を確認（パス件数0件はエラー）
> `pnpm test:unit --coverage` でカバレッジ80%以上を確認
**Checkpoint**
```

**追加の変更**:
- テンプレート冒頭の `Tests are OPTIONAL` 文言を削除
- TDD フローの説明を追加
- サンプルタスク例を 4 ステップ構造に更新
