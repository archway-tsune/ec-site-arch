# Getting Started - テンプレート展開ガイド

このドキュメントは、EC Site Architecture Templateから新規プロジェクトを作成した後の手順を説明します。

---

## 1. 初期セットアップ

### 1.1 依存関係のインストール

```bash
pnpm install
```

### 1.2 Playwrightブラウザのインストール（E2Eテスト用）

```bash
npx playwright install
```

### 1.3 動作確認

```bash
# 開発サーバー起動
pnpm dev

# ブラウザで確認
# http://localhost:3000/catalog  （購入者画面）
# http://localhost:3000/admin    （管理者画面）

# テスト実行
pnpm test:unit
pnpm test:e2e
```

---

## 2. プロジェクト情報の更新

### 2.1 package.json

```json
{
  "name": "your-project-name",
  "description": "Your project description",
  "version": "0.1.0"
}
```

### 2.2 README.md

プロジェクト固有の内容に更新してください。

### 2.3 tailwind.config.js（オプション）

ブランドカラーを変更する場合：

```javascript
theme: {
  extend: {
    colors: {
      base: {
        50: '#your-color',
        // ...
      },
      accent: '#your-accent-color',
    },
  },
},
```

---

## 3. サンプル実装の扱い

### 3.1 参照として残す場合

`src/samples/` ディレクトリは参考実装として残しておけます。
本番実装は `src/domains/` に作成してください。

### 3.2 サンプルを削除する場合

```bash
# サンプル実装を削除
rm -rf src/samples/

# サンプル関連のテストを削除
rm -rf tests/unit/samples/
rm -rf tests/integration/samples/

# tsconfig.jsonからパスエイリアスを削除
# "@/samples/*": ["./src/samples/*"]  ← この行を削除
```

### 3.3 サンプルを本番実装のベースにする場合

```bash
# サンプルをdomainsにコピー
cp -r src/samples/domains/catalog src/domains/
cp -r src/samples/domains/cart src/domains/
cp -r src/samples/domains/orders src/domains/

# インポートパスを更新
# @/samples/domains/xxx → @/domains/xxx
```

---

## 4. 新規ドメインの追加

### 4.1 ディレクトリ構成

```
src/domains/your-domain/
├── api/
│   └── usecases.ts      # APIユースケース
├── ui/
│   ├── YourList.tsx     # 一覧コンポーネント
│   ├── YourDetail.tsx   # 詳細コンポーネント
│   └── YourForm.tsx     # フォームコンポーネント
├── types/
│   └── index.ts         # 型定義
└── tests/
    └── unit/
        └── usecases.test.ts
```

### 4.2 テンプレートの利用

```typescript
// UIテンプレートの利用例
import { ListPageTemplate } from '@/templates/ui/pages/list';
import { DetailPageTemplate } from '@/templates/ui/pages/detail';
import { FormPageTemplate } from '@/templates/ui/pages/form';

// APIテンプレートの利用例
import { createUseCase } from '@/templates/api/usecase';

// インフラテンプレートの利用例
import { createHmrSafeStore } from '@/templates/infrastructure/repository';
```

### 4.3 ページの追加

```
src/app/(buyer)/your-domain/
├── page.tsx             # 一覧ページ
└── [id]/
    └── page.tsx         # 詳細ページ

src/app/admin/your-domain/
├── page.tsx             # 管理一覧
├── new/
│   └── page.tsx         # 新規登録
└── [id]/
    └── edit/
        └── page.tsx     # 編集
```

---

## 5. 認証・認可の設定

### 5.1 ロールの追加（必要な場合）

```typescript
// src/foundation/auth/session.ts
export type UserRole = 'buyer' | 'admin' | 'staff';  // staffを追加
```

### 5.2 認可チェック

```typescript
import { requireRole } from '@/foundation/auth/authorize';

// APIでの認可
const session = await requireRole(request, 'admin');

// UIでの認可（レイアウト）
import { AdminLayout } from '@/templates/ui/layouts/AdminLayout';
```

### 5.3 デモユーザーの変更

```typescript
// src/infrastructure/auth/demo-users.ts
export const DEMO_USERS = [
  { email: 'buyer@example.com', password: 'demo', role: 'buyer', name: '購入者テスト' },
  { email: 'admin@example.com', password: 'demo', role: 'admin', name: '管理者テスト' },
  // 追加のユーザー
];
```

---

## 6. テストの追加

### 6.1 単体テスト

```typescript
// tests/unit/domains/your-domain/usecases.test.ts
import { describe, it, expect } from 'vitest';

describe('YourDomain Usecases', () => {
  describe('GetYourItems', () => {
    it('Given 正常なリクエスト, When 実行, Then アイテム一覧が返される', async () => {
      // テスト実装
    });
  });
});
```

### 6.2 E2Eテスト

```typescript
// tests/e2e/your-domain.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Your Domain', () => {
  test('一覧ページが表示される', async ({ page }) => {
    await page.goto('/your-domain');
    await expect(page.locator('h1')).toContainText('Your Domain');
  });
});
```

---

## 7. 本番デプロイの準備

### 7.1 環境変数

```bash
# .env.local（ローカル開発用）
# .env.production（本番用）

DATABASE_URL=your-database-url
SESSION_SECRET=your-secret-key
```

### 7.2 データベース接続

インメモリリポジトリを本番用リポジトリに置き換え：

```typescript
// src/infrastructure/repositories/your-domain.ts
// createHmrSafeStore() → データベースクライアント
```

### 7.3 ビルド確認

```bash
pnpm build
pnpm start
```

---

## 8. チェックリスト

- [ ] package.jsonのプロジェクト情報を更新
- [ ] README.mdを更新
- [ ] 開発サーバーで動作確認
- [ ] サンプル実装の扱いを決定
- [ ] 必要なドメインを `src/domains/` に追加
- [ ] テストを追加してカバレッジ80%以上を維持
- [ ] E2Eテストで主要導線を検証
- [ ] 本番用リポジトリ（DB接続）を実装
- [ ] 環境変数を設定
- [ ] ビルドが成功することを確認
