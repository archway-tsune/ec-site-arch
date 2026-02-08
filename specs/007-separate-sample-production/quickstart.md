# Quickstart: サンプル画面と本番画面の完全分離

## 分離後のアーキテクチャ

```
本番パス（/, /catalog, /admin 等）    → src/app/ の本番スキャフォールド
  └→ @/domains/ スタブ（NotImplementedError）

サンプルパス（/sample/catalog 等）    → src/app/(samples)/sample/
  └→ @/samples/domains/ を直接インポート

共有レイヤー（変更なし）:
  @/contracts/       共有インターフェース
  @/infrastructure/  リポジトリ実装
  @/foundation/      認証・エラー・バリデーション
  @/templates/       UIテンプレート
```

## 本番実装への移行手順

### Step 1: ドメインロジックの実装

`src/domains/{domain}/api/index.ts` のスタブを独自実装に置き換える:

```typescript
// 変更前（スタブ）
export function getProducts(): never {
  throw new NotImplementedError('catalog', 'getProducts');
}

// 変更後（独自実装）
export { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from './usecases';
```

### Step 2: UIコンポーネントの実装

`src/domains/{domain}/ui/index.ts` のプレースホルダーを独自コンポーネントに置き換える:

```typescript
// 変更前（プレースホルダー）
export function ProductList() {
  return <div>ドメイン未実装</div>;
}

// 変更後（独自実装）
export { ProductList } from './ProductList';
export { ProductDetail } from './ProductDetail';
```

### Step 3: レイアウトのナビゲーション有効化

`src/app/(buyer)/layout.tsx` と `src/app/admin/layout.tsx` のコメントアウトされたリンクを有効化:

```typescript
const navLinks: NavLink[] = [
  { href: '/catalog', label: '商品一覧' },
  { href: '/cart', label: 'カート' },
  { href: '/orders', label: '注文履歴' },
];
```

### Step 4: サンプルの削除（任意）

本番実装が完了したら、サンプルを削除できる:

```bash
rm -rf src/samples/
rm -rf src/app/\(samples\)/
```

削除後もビルド・動作に影響はない。

## サンプル画面の確認方法

開発サーバー起動後:

| 画面 | URL |
|------|-----|
| サンプルホーム | http://localhost:3000/sample/ |
| サンプルカタログ | http://localhost:3000/sample/catalog |
| サンプルカート | http://localhost:3000/sample/cart |
| サンプル管理者 | http://localhost:3000/sample/admin |
| 本番ホーム（スキャフォールド） | http://localhost:3000/ |
| 本番カタログ（スキャフォールド） | http://localhost:3000/catalog |

## テスト実行

```bash
# サンプルテスト（/sample/ パス対象）
pnpm test:unit:samples
pnpm test:integration:samples
pnpm test:e2e:samples

# 本番テスト（ドメイン実装後に追加）
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```
