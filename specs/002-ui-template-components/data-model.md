# データモデル: UIテンプレートコンポーネントの拡充

**ブランチ**: `002-ui-template-components` | **作成日**: 2026-02-07
**入力**: [spec.md](./spec.md) + [research.md](./research.md)

## 概要

本フィーチャーはUIコンポーネントテンプレートの追加であり、永続化データモデルは不要。ここでは各コンポーネントが扱う**Props型**と**ユーティリティ関数のシグネチャ**をデータモデルとして定義する。

## エンティティ定義

### 1. PaginationProps

ページネーションコンポーネントの入力パラメータ。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| page | number | 必須 | - | 現在のページ番号（1始まり） |
| limit | number | 必須 | - | 1ページあたりの表示件数 |
| total | number | 必須 | - | 総件数 |
| totalPages | number | 必須 | - | 総ページ数 |
| onPageChange | (page: number) => void | 必須 | - | ページ変更コールバック |

**バリデーション規則**:
- page >= 1
- limit >= 1
- total >= 0
- totalPages >= 0
- total === 0 の場合、コンポーネント非表示

### 2. StatusBadgeProps

汎用ステータスバッジの入力パラメータ。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| status | string | 必須 | - | ステータス値 |
| statusColors | Record<string, string> | 必須 | - | ステータス→Tailwind CSSクラスのマッピング |
| statusLabels | Record<string, string> | 必須 | - | ステータス→表示ラベルのマッピング |

**バリデーション規則**:
- statusColors に status キーが存在しない場合、デフォルトスタイル（`bg-base-100 text-base-900`）を適用
- statusLabels に status キーが存在しない場合、status 値をそのまま表示

### 3. ImagePlaceholderProps

画像プレースホルダーの入力パラメータ。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| src | string \| undefined | 任意 | undefined | 画像URL |
| alt | string | 必須 | - | alt属性 |
| size | 'sm' \| 'md' \| 'lg' | 任意 | 'md' | サイズバリアント |
| className | string | 任意 | '' | 追加CSSクラス |

**サイズマッピング**:
- sm: w-16 h-16（ProductCard用）
- md: w-24 h-24（CartItem用）
- lg: w-64 h-64（ProductDetail用）

### 4. SearchBarProps

検索バーの入力パラメータ。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| onSearch | (query: string) => void | 必須 | - | 検索実行コールバック |
| defaultValue | string | 任意 | '' | 初期値 |
| placeholder | string | 任意 | '検索...' | プレースホルダーテキスト |

### 5. QuantitySelectorProps

数量セレクターの入力パラメータ。

| プロパティ | 型 | 必須 | デフォルト | 説明 |
|-----------|------|------|-----------|------|
| value | number | 必須 | - | 現在の数量 |
| min | number | 任意 | 1 | 最小値 |
| max | number | 任意 | 99 | 最大値 |
| onChange | (value: number) => void | 必須 | - | 数量変更コールバック |
| disabled | boolean | 任意 | false | 無効化状態 |

**バリデーション規則**:
- min <= max でなければ全コントロールを無効化
- value < min の場合、-ボタン無効化
- value >= max の場合、+ボタン無効化

### 6. ユーティリティ関数シグネチャ

#### formatPrice

```
formatPrice(price: number): string
```

| 入力 | 出力 |
|------|------|
| 0 | '無料' |
| 1000 | '¥1,000' |
| 15800 | '¥15,800' |
| -500 | '-¥500' |

#### formatDateTime

```
formatDateTime(date: string | Date): string
```

| 入力 | 出力 |
|------|------|
| '2026-02-07T14:30:00' | '2026年2月7日 14:30' |
| new Date(2026, 0, 1) | '2026年1月1日 0:00' |
| '無効な日時' | '-'（フォールバック） |

## 関係図

```text
┌─────────────────────────────────────────────────┐
│ src/templates/ui/                                │
│                                                  │
│  utils/                                          │
│  ├── format.ts ── formatPrice(), formatDateTime()│
│  ├── events.ts （既存）                           │
│  └── index.ts  （エクスポート集約）               │
│                                                  │
│  components/                                     │
│  ├── navigation/                                 │
│  │   └── Pagination ─── PaginationProps          │
│  ├── data-display/                               │
│  │   ├── StatusBadge ─── StatusBadgeProps         │
│  │   └── ImagePlaceholder ── ImagePlaceholderProps│
│  └── form/                                       │
│      ├── FormField （既存）                       │
│      ├── SearchBar ─── SearchBarProps             │
│      └── QuantitySelector ── QuantitySelectorProps│
└─────────────────────────────────────────────────┘
```

## 未解決事項

なし。すべての型定義が確定済み。
