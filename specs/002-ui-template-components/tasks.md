# タスク: UIテンプレートコンポーネントの拡充

**入力**: `/specs/002-ui-template-components/` の設計ドキュメント
**前提条件**: plan.md（必須）, spec.md（必須）, research.md, data-model.md, contracts/components.ts, quickstart.md

**テスト**: 仕様書（spec.md）で TDD が必須と定められているため、テストタスクを含む（SC-003, SC-004, 設計原則VI）。

**構成**: タスクはユーザーストーリー単位でグループ化し、各ストーリーを独立して実装・テスト可能にする。

## フォーマット: `[ID] [P?] [ストーリー] 説明`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[ストーリー]**: タスクが属するユーザーストーリー（例: US1, US2, US3）
- 説明には正確なファイルパスを含める

---

## フェーズ1: セットアップ（共有インフラ）

**目的**: ディレクトリ構造の作成とエクスポート基盤の整備

- [x] T001 navigation/ ディレクトリと index.ts を作成する: `src/templates/ui/components/navigation/index.ts`
- [x] T002 [P] data-display/ ディレクトリと index.ts を作成する: `src/templates/ui/components/data-display/index.ts`
- [x] T003 [P] テストディレクトリ構造を確認・作成する: `tests/unit/templates/ui/components/`, `tests/unit/templates/ui/utils/`

---

## フェーズ2: 基盤（ブロッキング前提条件）

**目的**: 全ユーザーストーリーが依存するユーティリティ関数の実装

**注意**: このフェーズが完了するまでユーザーストーリーの作業は開始できない

### テスト（フェーズ2）

> **注意: テストを先に書き、実装前にFAILすることを確認する**

- [x] T004 formatPrice の単体テストを作成する（Given-When-Then形式）: `tests/unit/templates/ui/utils/format.test.ts` — 正の数（¥1,000）、0（無料）、負の数（-¥500）、大きな数（¥1,000,000）のテストケースを含む
- [x] T005 [P] formatDateTime の単体テストを作成する（Given-When-Then形式）: `tests/unit/templates/ui/utils/format.test.ts` — 有効なISO文字列、Dateオブジェクト、無効な日時（フォールバック '-'）のテストケースを含む

### 実装（フェーズ2）

- [x] T006 formatPrice 関数を実装する: `src/templates/ui/utils/format.ts` — ¥記号付きカンマ区切り、0円は「無料」、負の数はマイナス記号付き。JSDocコメント（日本語）、型定義セクション区切り線を含む。contracts/components.ts のシグネチャに準拠する
- [x] T007 formatDateTime 関数を実装する: `src/templates/ui/utils/format.ts` — Intl.DateTimeFormat で ja-JP ロケール、年・月・日・時・分を表示、無効な日時は '-' を返す。contracts/components.ts のシグネチャに準拠する
- [x] T008 utils/index.ts を更新して formatPrice, formatDateTime をエクスポートする: `src/templates/ui/utils/index.ts`

**チェックポイント**: `pnpm vitest run tests/unit/templates/ui/utils/format.test.ts` がすべてパスすること

---

## フェーズ3: ユーザーストーリー1 — ページネーション付き一覧の実装 (優先度: P1) 🎯 MVP

**目標**: Pagination コンポーネントを提供し、一覧画面のページネーション実装を5行以内で完了できるようにする

**独立テスト**: Pagination コンポーネント単体でレンダリングし、ページ遷移・表示件数・無効状態が正しく機能することを確認する

### テスト（US1）

> **注意: テストを先に書き、実装前にFAILすることを確認する**

- [x] T009 [US1] Pagination の単体テストを作成する（Given-When-Then形式）: `tests/unit/templates/ui/components/navigation.test.tsx` — 以下のシナリオを含む: (1) 表示テキスト「全N件中 M〜L件を表示」、(2) 1ページ目で「前へ」ボタン無効化、(3) 最終ページで「次へ」ボタン無効化、(4) 「次へ」クリックで onPageChange 呼び出し、(5) total=0 でコンポーネント非表示

### 実装（US1）

- [x] T010 [US1] Pagination コンポーネントを実装する: `src/templates/ui/components/navigation/Pagination.tsx` — 'use client' ディレクティブ、PaginationProps 型定義（contracts/components.ts 準拠）、「全N件中 M〜L件を表示」テキスト、前へ/次へボタン、data-testid 属性、ARIA ナビゲーション属性、base-900/base-50 カラーパレット
- [x] T011 [US1] navigation/index.ts を更新して Pagination をエクスポートする: `src/templates/ui/components/navigation/index.ts`

**チェックポイント**: `pnpm vitest run tests/unit/templates/ui/components/navigation.test.tsx` がすべてパスすること

---

## フェーズ4: ユーザーストーリー2 — 価格・日時の統一フォーマット (優先度: P1)

**目標**: formatPrice / formatDateTime ユーティリティが正しく動作し、テストがパスすることを確認する

**独立テスト**: フェーズ2で既に実装・テスト済み。このフェーズではフェーズ2の完了を確認するのみ

> ※ US2（formatPrice / formatDateTime）の実装とテストはフェーズ2で完了済み。US2は全ストーリーの前提条件であるため、基盤フェーズに配置した。

**チェックポイント**: フェーズ2のテストがすべてパスしていればUS2は完了

---

## フェーズ5: ユーザーストーリー3 — 画像プレースホルダーの統一 (優先度: P2)

**目標**: ImagePlaceholder コンポーネントを提供し、画像がない場合のフォールバック表示を統一する

**独立テスト**: ImagePlaceholder にsrc有り/無しで表示し、画像またはプレースホルダーが正しく表示されることを確認する

### テスト（US3）

> **注意: テストを先に書き、実装前にFAILすることを確認する**

- [x] T012 [US3] ImagePlaceholder の単体テストを作成する（Given-When-Then形式）: `tests/unit/templates/ui/components/data-display.test.tsx` — 以下のシナリオを含む: (1) src指定時に画像表示、(2) src未指定時にSVGプレースホルダー表示、(3) alt属性の設定、(4) sm/md/lg サイズバリアント

### 実装（US3）

- [x] T013 [US3] ImagePlaceholder コンポーネントを実装する: `src/templates/ui/components/data-display/ImagePlaceholder.tsx` — ImagePlaceholderProps 型定義（contracts/components.ts 準拠）、sm/md/lg サイズマッピング（w-16 h-16, w-24 h-24, w-64 h-64）、SVGアイコンプレースホルダー、data-testid 属性、alt 属性必須
- [x] T014 [US3] data-display/index.ts を更新して ImagePlaceholder をエクスポートする: `src/templates/ui/components/data-display/index.ts`

**チェックポイント**: `pnpm vitest run tests/unit/templates/ui/components/data-display.test.tsx` がすべてパスすること

---

## フェーズ6: ユーザーストーリー4 — ステータスバッジの柔軟な表示 (優先度: P2)

**目標**: StatusBadge コンポーネントを提供し、ドメインに依存しない汎用的なステータス表示を実現する

**独立テスト**: StatusBadge にステータスと色/ラベルマッピングを渡し、対応する色とラベルが表示されることを確認する

### テスト（US4）

> **注意: テストを先に書き、実装前にFAILすることを確認する**

- [x] T015 [US4] StatusBadge の単体テストを作成する（Given-When-Then形式）: `tests/unit/templates/ui/components/data-display.test.tsx` — 以下のシナリオを含む: (1) 定義済みステータスで対応する色とラベルが表示される、(2) 未定義ステータスでデフォルトスタイル（bg-base-100 text-base-900）とステータス値がそのまま表示される

### 実装（US4）

- [x] T016 [US4] StatusBadge コンポーネントを実装する: `src/templates/ui/components/data-display/StatusBadge.tsx` — StatusBadgeProps 型定義（contracts/components.ts 準拠）、rounded-full ピル型バッジ、statusColors/statusLabels による動的スタイリング、未定義ステータスのフォールバック、data-testid 属性
- [x] T017 [US4] data-display/index.ts を更新して StatusBadge をエクスポートする: `src/templates/ui/components/data-display/index.ts`

**チェックポイント**: `pnpm vitest run tests/unit/templates/ui/components/data-display.test.tsx` がすべてパスすること（US3 + US4）

---

## フェーズ7: ユーザーストーリー5 — 検索機能付き一覧の実装 (優先度: P3)

**目標**: SearchBar コンポーネントを提供し、キーワード検索UIを素早く実装できるようにする

**独立テスト**: SearchBar でテキスト入力・Enter押下・クリアの各操作が正しく機能することを確認する

### テスト（US5）

> **注意: テストを先に書き、実装前にFAILすることを確認する**

- [x] T018 [US5] SearchBar の単体テストを作成する（Given-When-Then形式）: `tests/unit/templates/ui/components/form-extended.test.tsx` — 以下のシナリオを含む: (1) テキスト入力してEnterで onSearch 呼び出し、(2) クリアボタンで入力リセットと onSearch('') 呼び出し、(3) 空のまま Enter で onSearch('') 呼び出し、(4) プレースホルダーテキストのカスタマイズ

### 実装（US5）

- [x] T019 [US5] SearchBar コンポーネントを実装する: `src/templates/ui/components/form/SearchBar.tsx` — 'use client' ディレクティブ、SearchBarProps 型定義（contracts/components.ts 準拠）、テキスト入力フィールド、Enterキーハンドラ、クリアボタン（入力値がある場合のみ表示）、data-testid 属性、ARIA 属性、base-900/base-50 カラーパレット
- [x] T020 [US5] form/index.ts を更新して SearchBar をエクスポートする: `src/templates/ui/components/form/index.ts`

**チェックポイント**: `pnpm vitest run tests/unit/templates/ui/components/form-extended.test.tsx` がすべてパスすること

---

## フェーズ8: ユーザーストーリー6 — 数量選択UIの実装 (優先度: P3)

**目標**: QuantitySelector コンポーネントを提供し、数量変更UIを素早く実装できるようにする

**独立テスト**: QuantitySelector で増減操作と境界値の動作を確認する

### テスト（US6）

> **注意: テストを先に書き、実装前にFAILすることを確認する**

- [x] T021 [US6] QuantitySelector の単体テストを作成する（Given-When-Then形式）: `tests/unit/templates/ui/components/form-extended.test.tsx` — 以下のシナリオを含む: (1) +ボタンで onChange(value+1) 呼び出し、(2) 最小値で-ボタン無効化、(3) 最大値で+ボタン無効化、(4) disabled=true で全コントロール無効化、(5) min > max で全コントロール無効化

### 実装（US6）

- [x] T022 [US6] QuantitySelector コンポーネントを実装する: `src/templates/ui/components/form/QuantitySelector.tsx` — 'use client' ディレクティブ、QuantitySelectorProps 型定義（contracts/components.ts 準拠）、-/+ ボタン、数値表示、min/max バリデーション、disabled 状態サポート、data-testid 属性、ARIA 属性、base-900/base-50 カラーパレット
- [x] T023 [US6] form/index.ts を更新して QuantitySelector をエクスポートする: `src/templates/ui/components/form/index.ts`

**チェックポイント**: `pnpm vitest run tests/unit/templates/ui/components/form-extended.test.tsx` がすべてパスすること（US5 + US6）

---

## フェーズ9: テストテンプレートの更新

**目的**: 新規コンポーネントのテストパターンを各テストテンプレートに反映し、開発者がドメイン実装時に参照できる雛形を拡充する

### 単体テストテンプレート

- [x] T024 [P] コンポーネント単体テストテンプレートにインタラクティブUIのテストパターンを追加する: `src/templates/tests/unit/component.test.tsx` — 現在は loading/error/empty/data パターンのみ。以下のパターンを追加する: (1) ボタンクリックによるコールバック呼び出し（QuantitySelector パターン）、(2) キーボード操作テスト（SearchBar の Enter キーパターン）、(3) 状態バリアントによるスタイル切り替え（StatusBadge パターン）、(4) 条件付き表示/非表示（Pagination の total=0 パターン）、(5) サイズバリアントテスト（ImagePlaceholder の sm/md/lg パターン）

### E2Eテストテンプレート

- [x] T025 [P] 購入者導線E2Eテンプレートに新コンポーネントの操作パターンを追加する: `src/templates/tests/e2e/buyer-flow.spec.ts` — 以下を追加する: (1) SearchBar を使用した商品検索シナリオ（`data-testid="search-input"` への入力 + Enter キー + クリアボタン）、(2) Pagination を使用したページ遷移シナリオ（`data-testid="pagination-next"` / `data-testid="pagination-prev"` クリック + 表示テキスト検証）、(3) QuantitySelector の +/- ボタン操作パターン（`data-testid="quantity-increment"` / `data-testid="quantity-decrement"` に変更）、(4) ImagePlaceholder のプレースホルダー表示検証
- [x] T026 [P] 管理者導線E2Eテンプレートに新コンポーネントの操作パターンを追加する: `src/templates/tests/e2e/admin-flow.spec.ts` — 以下を追加する: (1) StatusBadge の表示検証シナリオ（`data-testid="status-badge"` のテキスト・色の確認）、(2) Pagination を使用した商品・注文一覧のページ遷移シナリオ、(3) SearchBar を使用した管理画面検索シナリオ

### テストガイドドキュメント

- [x] T027 テストガイド README.md に新コンポーネントの data-testid 規約とテスト例を追加する: `src/templates/tests/README.md` — 以下を追加する: (1) data-testid 規約表に新パターンを追加（`{name}-badge`, `pagination-next`/`pagination-prev`/`pagination-info`, `search-input`/`search-clear`, `quantity-increment`/`quantity-decrement`/`quantity-value`）、(2) FE単体テスト例にインタラクティブコンポーネントのテスト例を追加（QuantitySelector の +/- ボタン、SearchBar の Enter キー）、(3) E2Eテスト例に Pagination, SearchBar の操作パターンを追加

**チェックポイント**: テストテンプレートファイルが更新され、既存テストに影響がないことを確認

---

## フェーズ10: 仕上げ・横断的関心事

**目的**: ドキュメント更新、既存テストのリグレッション確認、品質検証

- [x] T028 [P] DESIGN_GUIDE.md を更新し、全新規コンポーネントの使用例を追記する: `src/templates/ui/DESIGN_GUIDE.md` — Pagination, StatusBadge, ImagePlaceholder, SearchBar, QuantitySelector, formatPrice, formatDateTime の使用例とインポートパスを記載する
- [x] T029 [P] 全単体テストを実行してリグレッションがないことを確認する: `pnpm vitest run` — 既存テスト + 新規テストすべてがパスすること
- [x] T030 [P] 全E2Eテストを実行してリグレッションがないことを確認する: `pnpm playwright test` — 既存25件のE2Eテストがすべてパスすること
- [x] T031 quickstart.md の使用例が正しいことを検証する: `specs/002-ui-template-components/quickstart.md` のインポートパスとコンポーネント名が実装と一致することを確認する

---

## 依存関係と実行順序

### フェーズ依存関係

- **セットアップ（フェーズ1）**: 依存なし — すぐに開始可能
- **基盤（フェーズ2）**: フェーズ1完了後 — **全ユーザーストーリーをブロック**
- **US1 ページネーション（フェーズ3）**: フェーズ2完了後 — 他のストーリーに依存なし
- **US2 フォーマットユーティリティ（フェーズ4）**: フェーズ2で実装済み — 確認のみ
- **US3 画像プレースホルダー（フェーズ5）**: フェーズ2完了後 — 他のストーリーに依存なし
- **US4 ステータスバッジ（フェーズ6）**: フェーズ2完了後 — US3と同じテストファイルを共有するが独立
- **US5 検索バー（フェーズ7）**: フェーズ2完了後 — 他のストーリーに依存なし
- **US6 数量セレクター（フェーズ8）**: フェーズ2完了後 — US5と同じテストファイルを共有するが独立
- **テストテンプレート更新（フェーズ9）**: 全ユーザーストーリー完了後 — 実装済みコンポーネントの data-testid を参照するため
- **仕上げ（フェーズ10）**: フェーズ9完了後

### ユーザーストーリー依存関係

- **US1（P1）**: フェーズ2完了後に開始可能 — 他のストーリーに依存なし
- **US2（P1）**: フェーズ2で完了済み
- **US3（P2）**: フェーズ2完了後に開始可能 — 他のストーリーに依存なし
- **US4（P2）**: フェーズ2完了後に開始可能 — 他のストーリーに依存なし
- **US5（P3）**: フェーズ2完了後に開始可能 — 他のストーリーに依存なし
- **US6（P3）**: フェーズ2完了後に開始可能 — 他のストーリーに依存なし

### 各ユーザーストーリー内の順序

- テストを先に書き、FAILすることを確認する
- コンポーネントを実装する
- index.ts にエクスポートを追加する
- チェックポイントでテストがパスすることを確認する

### 並列実行の機会

- フェーズ1の全タスク（T001, T002, T003）は並列実行可能
- フェーズ2のテスト（T004, T005）は並列実行可能
- フェーズ2完了後、US1/US3/US4/US5/US6 は全て並列実行可能
- フェーズ9のテストテンプレート更新（T024, T025, T026, T027）は並列実行可能
- フェーズ10の全タスク（T028, T029, T030, T031）は並列実行可能

---

## 並列実行例: フェーズ2完了後

```text
# フェーズ2完了後、全ストーリーを並列に開始可能:

ストリーム A: US1 ページネーション
  タスク: T009 → T010 → T011

ストリーム B: US3 + US4 データ表示系
  タスク: T012 → T013 → T014 → T015 → T016 → T017

ストリーム C: US5 + US6 フォーム系
  タスク: T018 → T019 → T020 → T021 → T022 → T023

# 全ストーリー完了後、テストテンプレート更新を並列実行:

ストリーム D: テストテンプレート更新（全て並列可能）
  タスク: T024, T025, T026, T027
```

---

## 実装戦略

### MVP ファースト（US1 + US2 のみ）

1. フェーズ1: セットアップ完了
2. フェーズ2: 基盤完了（formatPrice / formatDateTime — **US2 完了**）
3. フェーズ3: US1 Pagination 完了
4. **停止して検証**: US1 + US2 を独立してテスト
5. 必要に応じてデプロイ/デモ

### インクリメンタルデリバリー

1. セットアップ + 基盤 → 基盤準備完了 + US2 完了
2. US1 追加 → 独立テスト → デモ（MVP!）
3. US3 + US4 追加 → 独立テスト → デモ
4. US5 + US6 追加 → 独立テスト → デモ
5. テストテンプレート更新 → 開発者向け雛形の充実
6. 各ストーリーは既存のストーリーを壊さずに価値を追加する

### 並列チーム戦略

複数の開発者がいる場合:

1. チーム全体でセットアップ + 基盤を完了
2. 基盤完了後:
   - 開発者A: US1 ページネーション
   - 開発者B: US3 画像プレースホルダー + US4 ステータスバッジ
   - 開発者C: US5 検索バー + US6 数量セレクター
3. 各ストーリーは独立して完了・統合可能

---

## 備考

- [P] マークのタスク = 異なるファイル、依存なし、並列実行可能
- [ストーリー] ラベルはタスクを特定のユーザーストーリーにマッピングする
- 各ユーザーストーリーは独立して完了・テスト可能
- テストがFAILすることを確認してから実装する
- 各タスクまたは論理グループ完了後にコミットする
- 任意のチェックポイントで停止してストーリーを独立して検証可能
- 既存テンプレートパターン（JSDocコメント、型定義セクション区切り線、data-testid、ARIA属性）を厳守する
