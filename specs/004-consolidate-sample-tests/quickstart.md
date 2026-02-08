# Quickstart: サンプルテストの集約・再構成

## 実装手順（概要）

### 1. ベースライン記録

```bash
# 移動前のテスト数を記録
pnpm test:unit --reporter=verbose 2>&1 | grep -c "✓\|✗"
pnpm test:integration --reporter=verbose 2>&1 | grep -c "✓\|✗"
pnpm test:e2e:arch 2>&1 | grep -E "passed|failed"
```

### 2. 単体・統合テストの移動（9ファイル）

```bash
# ディレクトリ作成
mkdir -p src/samples/tests/unit/domains/{catalog,cart,orders}
mkdir -p src/samples/tests/integration/domains/{catalog,cart,orders}

# ファイル移動（git mv）
git mv src/samples/domains/catalog/tests/unit/* src/samples/tests/unit/domains/catalog/
git mv src/samples/domains/cart/tests/unit/* src/samples/tests/unit/domains/cart/
# ... 以下同様
```

### 3. Import パス変更

各テストファイルの相対パス import をエイリアスに変更:
- `../../api/usecases` → `@/samples/domains/{domain}/api/usecases`
- `../../ui/{Component}` → `@/samples/domains/{domain}/ui/{Component}`

### 4. E2Eテストの分解（2ファイル → 5ファイル）

```bash
mkdir -p src/samples/tests/e2e/domains/{catalog,cart,orders}
```

各 describe ブロックをドメイン別に分解し、ヘルパー関数をインラインで各ファイルに含める。

### 5. 設定変更

- `vitest.config.ts`: exclude に `src/samples/` パターン追加
- `playwright.arch.config.ts`: testDir 変更
- `package.json`: `:samples` コマンド追加

### 6. 旧ディレクトリ削除

```bash
# 空になった旧テストディレクトリを削除
rm -rf src/samples/domains/catalog/tests
rm -rf src/samples/domains/cart/tests
rm -rf src/samples/domains/orders/tests
rm -rf tests/e2e/arch
```

### 7. 検証

```bash
# デフォルトコマンドでサンプルが除外されること
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# サンプルコマンドでサンプルが実行されること
pnpm test:unit:samples
pnpm test:integration:samples
pnpm test:e2e:samples

# テスト数がベースラインと一致すること
pnpm typecheck
```

### 8. ドキュメント更新

- `src/samples/README.md`
- `README.md`
- `scripts/README.md`
- `docs/SPECKIT_INTEGRATION.md`
