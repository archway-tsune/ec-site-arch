# Research: サンプルテストの集約・再構成

## R-001: Vitest の exclude パターンでサンプルテストを除外する方法

**Decision**: `vitest.config.ts` の `test.exclude` でデフォルト除外 + `vitest.samples.config.ts` でサンプル専用設定

**Rationale**: 当初は `test.exclude` だけで制御し、`:samples` コマンドではパス指定で exclude を迂回する想定だった。しかし Vitest 1.6 では CLI の `--exclude` は config の `exclude` に追加されるだけで上書きできず、パス指定も `exclude` を無視しない。そのため、サンプル専用の `vitest.samples.config.ts` を作成し、`include` を `src/samples/` に限定する方式に変更した。メインの `vitest.config.ts` には `test.exclude` でサンプルを除外しつつ、`:samples` コマンドでは `--config vitest.samples.config.ts` で専用設定を使用する。

**Alternatives considered**:
- 環境変数による条件分岐: 設定が複雑になり、CI設定にも影響する
- `test.exclude` のみ（当初の計画）: Vitest の CLI が exclude を上書きできないため実現不可

## R-002: Playwright で サンプルE2Eテストを分離する方法

**Decision**: `playwright.arch.config.ts` の `testDir` を `./src/samples/tests/e2e` に変更する

**Rationale**: 既に `playwright.arch.config.ts` が独立した設定ファイルとして存在し、`pnpm test:e2e:arch` コマンドで使用されている。`testDir` を変更するだけで新しい配置先に対応できる。通常の `playwright.config.ts` は `testDir: './tests/e2e'` のままなので、サンプルE2Eは自動的に除外される。

**Alternatives considered**:
- `playwright.config.ts` の `testIgnore` でサンプルを除外: 既に `testDir` が `./tests/e2e` なので、`src/samples/` 配下のテストは元々対象外。変更不要。

## R-003: E2Eテスト分解時のテスト独立性の確保

**Decision**: 共有ヘルパー関数（`loginAsBuyer`, `loginAsAdmin`, `createOrderAsBuyer`）を各テストファイルにインラインで配置する

**Rationale**: ファイル数が5つと少なく、ヘルパーも数行程度。各ファイルが完全に独立し、本番テスト作成時にファイル1つをコピーするだけで完結する。DRY原則よりもテストの独立性と参照の容易さを優先する。

**Alternatives considered**:
- 共通モジュール（helpers.ts）に抽出: ファイル間の依存が生じ、本番テスト作成時に複数ファイルのコピーが必要になる
- Playwright fixture として定義: セットアップが複雑になり、参照コードとしての分かりやすさが低下する

## R-004: package.json コマンド命名規則

**Decision**: `:samples` サフィックスを使用（`test:unit:samples`, `test:integration:samples`, `test:e2e:samples`）

**Rationale**: 既存のコマンド体系（`test:unit`, `test:integration`, `test:e2e`, `test:e2e:arch`）と整合する。`:samples` が意味的に明確で、CI設定でも分かりやすい。

**Alternatives considered**:
- `:all` サフィックス: 「すべて」の意味が曖昧（本番+サンプル? 全テスト種別?）
- 統合コマンド `test:samples`: テスト種別ごとの実行ができなくなる
