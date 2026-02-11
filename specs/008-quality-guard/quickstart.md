# Quickstart: speckit実装時の品質ガード強化

**Branch**: `008-quality-guard` | **Date**: 2026-02-11

## 変更の検証手順

### 1. タスクテンプレート TDD 整合性検証

```bash
# タスクテンプレートに OPTIONAL が含まれていないことを確認
grep -i "OPTIONAL" .specify/templates/tasks-template.md
# → テストに関する OPTIONAL 記述が存在しないこと

# Red-Green-Refactor-検証 の4ステップが含まれていることを確認
grep -E "Red|Green|Refactor|検証" .specify/templates/tasks-template.md
# → 4ステップのセクション見出しが存在すること

# constitution との TDD 矛盾がないことを確認
grep "TDD\|テスト駆動" .specify/memory/constitution.md
# → 「テスト駆動開発（TDD）必須（非交渉）」と整合していること
```

### 2. サンプルテスト後方互換性検証

```bash
# サンプル単体テスト実行
pnpm test:unit:samples

# サンプル統合テスト実行
pnpm test:integration:samples

# サンプル E2E テスト実行
pnpm test:e2e:samples

# → 全テストがパスすること（Schema.parse() 移行後も動作すること）
```

### 3. CI パイプライン検証

```bash
# --pass-with-no-tests が削除されていることを確認
grep "pass-with-no-tests" .github/workflows/ci.yml
# → 出力なし（削除済み）

# サンプルリグレッションチェックが追加されていることを確認
grep "test:unit:samples\|test:integration:samples" .github/workflows/ci.yml
# → 両方のステップが存在すること
```

### 4. リリース ZIP テンプレート含有検証

```bash
# release.yml で .specify/templates/ が除外されていないことを確認
grep "specify" .github/workflows/release.yml
# → .specify/memory/* と .specify/scripts/* のみが除外対象
# → .specify/templates/* が除外されていないこと
```

### 5. constitution-example 品質ガード概要検証

```bash
# 品質ガード関連キーワードの存在確認
grep -E "TDD|Red.*Green|カバレッジ|E2E.*証跡|外部.*URL|サンプル.*保護" docs/examples/constitution-example.md
# → 各品質ガード項目の概要が記載されていること
```

### 6. SPECKIT_INTEGRATION.md 手順検証

```bash
# セットアップ手順の順序確認
grep -A5 "セットアップフロー\|specify init" docs/SPECKIT_INTEGRATION.md
# → specify init → ZIP 展開 → /speckit.constitution の順序であること
```

### 7. シードデータ分離検証

```bash
# BASE_PRODUCTS と EXTENSION_PRODUCTS の存在確認
grep -E "BASE_PRODUCTS|EXTENSION_PRODUCTS" src/infrastructure/repositories/product.ts
# → 両方の配列が定義されていること

# 全テスト実行で破損がないことを確認
pnpm test:unit:samples
pnpm test:e2e:samples
```

## エンドツーエンド検証シナリオ

### シナリオ A: contracts フィールド追加耐性

1. `src/contracts/catalog.ts` の `ProductSchema` に `.default()` 付きフィールドを追加:
   ```typescript
   stock: z.number().int().min(0).default(0),
   ```
2. `pnpm test:unit:samples` を実行 → 全テストがパスすること
3. `pnpm test:integration:samples` を実行 → 全テストがパスすること
4. 追加したフィールドを削除して元に戻す

### シナリオ B: ZIP 展開後のテンプレート確認

1. リリース ZIP を作成（またはシミュレート）
2. 新規ディレクトリに `specify init --here --ai claude` を実行
3. ZIP を展開して `.specify/templates/` を上書き
4. `tasks-template.md` が Red-Green-Refactor-検証 構造であることを確認
