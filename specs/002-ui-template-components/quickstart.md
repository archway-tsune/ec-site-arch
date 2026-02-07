# クイックスタート: UIテンプレートコンポーネントの拡充

**ブランチ**: `002-ui-template-components` | **作成日**: 2026-02-07
**入力**: [spec.md](./spec.md) + [plan.md](./plan.md) + [data-model.md](./data-model.md)

## 概要

5つのUIコンポーネント（Pagination, StatusBadge, ImagePlaceholder, SearchBar, QuantitySelector）と2つのユーティリティ関数（formatPrice, formatDateTime）をテンプレートとして追加する。

## 使用例

### Pagination（ページネーション）

```tsx
import { Pagination } from '@/templates/ui/components/navigation';

// 一覧画面でのページネーション
<Pagination
  page={1}
  limit={10}
  total={50}
  totalPages={5}
  onPageChange={(page) => setCurrentPage(page)}
/>
// → 「全50件中 1〜10件を表示」+ 前へ/次へボタン
```

### StatusBadge（ステータスバッジ）

```tsx
import { StatusBadge } from '@/templates/ui/components/data-display';

// 注文ステータスの表示
const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const orderStatusLabels: Record<string, string> = {
  pending: '保留中',
  confirmed: '確認済み',
  shipped: '発送済み',
  cancelled: 'キャンセル',
};

<StatusBadge
  status={order.status}
  statusColors={orderStatusColors}
  statusLabels={orderStatusLabels}
/>
```

### ImagePlaceholder（画像プレースホルダー）

```tsx
import { ImagePlaceholder } from '@/templates/ui/components/data-display';

// 商品画像（画像なしの場合はプレースホルダー表示）
<ImagePlaceholder
  src={product.imageUrl}
  alt={product.name}
  size="md"
/>

// サイズバリアント: sm(64px), md(96px), lg(256px)
```

### SearchBar（検索バー）

```tsx
import { SearchBar } from '@/templates/ui/components/form';

// 商品検索
<SearchBar
  onSearch={(query) => handleSearch(query)}
  defaultValue={currentQuery}
  placeholder="商品名で検索..."
/>
// Enter キーまたは検索ボタンで検索実行
// クリアボタンで入力をリセット
```

### QuantitySelector（数量セレクター）

```tsx
import { QuantitySelector } from '@/templates/ui/components/form';

// カート内商品の数量変更
<QuantitySelector
  value={item.quantity}
  min={1}
  max={item.stock}
  onChange={(qty) => updateQuantity(item.id, qty)}
  disabled={isUpdating}
/>
// -/+ ボタンで数量を変更
// 最小値/最大値でボタン無効化
```

### formatPrice（価格フォーマット）

```tsx
import { formatPrice } from '@/templates/ui/utils';

formatPrice(1000);   // → '¥1,000'
formatPrice(0);      // → '無料'
formatPrice(15800);  // → '¥15,800'
formatPrice(-500);   // → '-¥500'
```

### formatDateTime（日時フォーマット）

```tsx
import { formatDateTime } from '@/templates/ui/utils';

formatDateTime('2026-02-07T14:30:00');  // → '2026年2月7日 14:30'
formatDateTime(new Date());              // → '2026年2月7日 10:00'
formatDateTime('invalid');               // → '-'
```

## ディレクトリ構成

```text
src/templates/ui/
├── components/
│   ├── navigation/
│   │   ├── Pagination.tsx        # ページネーション
│   │   └── index.ts
│   ├── data-display/
│   │   ├── StatusBadge.tsx       # ステータスバッジ
│   │   ├── ImagePlaceholder.tsx  # 画像プレースホルダー
│   │   └── index.ts
│   └── form/
│       ├── FormField.tsx         # (既存)
│       ├── SearchBar.tsx         # 検索バー
│       ├── QuantitySelector.tsx  # 数量セレクター
│       └── index.ts              # (更新)
├── utils/
│   ├── events.ts                 # (既存)
│   ├── format.ts                 # 価格・日時フォーマット
│   └── index.ts                  # (更新)
└── DESIGN_GUIDE.md               # (更新)
```

## テストファイル構成

```text
tests/unit/templates/ui/
├── components/
│   ├── navigation.test.tsx       # Pagination テスト
│   ├── data-display.test.tsx     # StatusBadge, ImagePlaceholder テスト
│   └── form-extended.test.tsx    # SearchBar, QuantitySelector テスト
└── utils/
    └── format.test.ts            # formatPrice, formatDateTime テスト
```

## コーディングパターン

各コンポーネントは以下の既存パターンに準拠する:

1. **JSDocコメント**（日本語）に使用例を含む
2. **型定義セクション**（`// ─────` 区切り線付き）
3. **スタイル定数セクション**（Tailwind CSSクラス）
4. **コンポーネントセクション**
5. **`data-testid`** 属性（テスト用）
6. **ARIA** アクセシビリティ属性
7. **`'use client'`** ディレクティブ（イベントハンドラを持つ場合）

## インポートパス

```tsx
// コンポーネント
import { Pagination } from '@/templates/ui/components/navigation';
import { StatusBadge, ImagePlaceholder } from '@/templates/ui/components/data-display';
import { SearchBar, QuantitySelector } from '@/templates/ui/components/form';

// ユーティリティ
import { formatPrice, formatDateTime } from '@/templates/ui/utils';
```
