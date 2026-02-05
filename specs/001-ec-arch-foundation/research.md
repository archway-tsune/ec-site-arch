# リサーチ: ECサイト向けアーキテクチャ基盤

**ブランチ**: `001-ec-arch-foundation`
**日付**: 2026-02-05
**ステータス**: 完了

## 1. 技術選定

### 1.1 フレームワーク: Next.js 14+ (App Router)

**決定**: Next.js 14+ を採用（App Router / Server Components）

**理由**:
- Server Components が標準でサポートされ、サーバーサイド中心のデータ制御が自然に実現できる
- App Router のルートグループ機能により、ロール別のルーティング（`(buyer)`, `(admin)`）が宣言的に実装可能
- TypeScript の型安全性がファーストクラスでサポートされている
- 日本語ドキュメントと国内コミュニティが充実している

**検討した代替案**:
- Remix: Server Components のサポートが限定的
- SvelteKit: TypeScript サポートは良好だが、Server Components 相当の機能が異なる設計思想
- Nuxt.js: Vue.js ベースのため、React エコシステムとの互換性がない

### 1.2 バリデーション: Zod

**決定**: Zod を runtime validation に採用

**理由**:
- TypeScript の型と runtime validation を一体化できる
- スキーマから型を推論でき、型定義の重複を防げる
- Next.js Server Actions との親和性が高い
- エラーメッセージのカスタマイズが柔軟

**検討した代替案**:
- Yup: TypeScript 型推論が Zod より弱い
- io-ts: 学習コストが高く、エラーメッセージのカスタマイズが難しい
- Valibot: 軽量だが、エコシステムが Zod より小さい

### 1.3 テストフレームワーク

**決定**:
- 単体/統合テスト: Vitest
- コンポーネントテスト: Testing Library
- E2Eテスト: Playwright

**理由**:
- Vitest: Jest 互換 API でありながら高速、ESM ネイティブサポート
- Testing Library: ユーザー視点のテストを促進、アクセシビリティ指向
- Playwright: クロスブラウザ対応、安定性が高い、デバッグツールが充実

**検討した代替案**:
- Jest: ESM サポートが Vitest より複雑
- Cypress: Playwright より実行速度が遅い傾向

### 1.4 スタイリング: Tailwind CSS

**決定**: Tailwind CSS を採用

**理由**:
- ユーティリティファーストで一貫したデザインシステムを構築しやすい
- Server Components との相性が良い（CSS-in-JS のランタイムコストがない）
- レスポンシブ対応が宣言的に記述可能
- アクセシビリティ関連のユーティリティが充実

**検討した代替案**:
- CSS Modules: スコープ管理は良いが、デザインシステムの一貫性維持が難しい
- styled-components: Server Components との相性問題

## 2. アーキテクチャパターン

### 2.1 認証・セッション管理

**決定**: セッション方式を採用（サーバーサイドセッション + Cookie）

**理由**:
- サーバーサイドでセッション状態を完全に制御できる
- セッション無効化が即座に反映される
- クライアントに機密情報を保持しない

**実装パターン**:
```typescript
// セッションに保持する最小限の情報
interface SessionData {
  userId: string;
  role: 'buyer' | 'admin';
}
```

**CSRF対策**:
- Double Submit Cookie パターンを採用
- サーバーサイドで検証を行い、不正なリクエストを拒否

### 2.2 認可の二重防御

**決定**: 画面遷移レベル + ユースケース実行レベルの二段階認可

**実装パターン**:

1. **画面遷移レベル**: Next.js Middleware でルートを保護
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return redirectToLogin();
  if (isAdminRoute(request) && session.role !== 'admin') {
    return forbidden();
  }
}
```

2. **ユースケース実行レベル**: 各ユースケースで認可を検証
```typescript
// usecase.ts
async function executeUseCase(input: Input, session: SessionData) {
  authorize(session, requiredRole); // 認可チェック
  validate(input); // バリデーション
  // ビジネスロジック実行
}
```

### 2.3 エラー処理パターン

**決定**: 統一されたエラーコード体系とマスキング

**エラーコード**:
| コード | 意味 | HTTP ステータス |
|--------|------|-----------------|
| UNAUTHORIZED | 未認証 | 401 |
| FORBIDDEN | 認可失敗 | 403 |
| VALIDATION_ERROR | 入力検証エラー | 400 |
| NOT_FOUND | リソース未存在 | 404 |
| CONFLICT | 状態競合 | 409 |
| INTERNAL_ERROR | 内部エラー | 500 |

**マスキングルール**:
- クライアントには安全なメッセージのみ返却
- スタックトレースは本番環境では非表示
- 内部エラーの詳細はサーバーログにのみ記録

### 2.4 ドメイン構造パターン

**決定**: ドメインごとに UI / API / テストを一体として配置

**ディレクトリ構造**:
```text
src/domains/catalog/
├── ui/
│   ├── ProductList.tsx
│   └── ProductDetail.tsx
├── api/
│   ├── usecases/
│   │   ├── getProducts.ts
│   │   └── getProductById.ts
│   └── dto/
│       └── product.ts
└── tests/
    ├── unit/
    │   └── getProducts.test.ts
    ├── integration/
    │   └── api.test.ts
    └── e2e/
        └── catalog-flow.spec.ts
```

## 3. テスト戦略詳細

### 3.1 単体テスト（BE）

**対象**: ユースケース、ドメインロジック、認可条件

**パターン**:
```typescript
describe('getProducts ユースケース', () => {
  describe('正常系', () => {
    it('Given 商品が存在する, When 商品一覧を取得する, Then 商品リストが返される', async () => {
      // Arrange
      const mockRepository = createMockRepository([product1, product2]);

      // Act
      const result = await getProducts({ repository: mockRepository });

      // Assert
      expect(result.products).toHaveLength(2);
    });
  });

  describe('認可条件', () => {
    it('Given 未認証, When 商品一覧を取得する, Then UNAUTHORIZED エラー', async () => {
      // ...
    });
  });
});
```

### 3.2 単体テスト（FE）

**対象**: コンポーネントの表示条件、状態遷移、フォームバリデーション

**パターン**:
```typescript
describe('ProductList コンポーネント', () => {
  it('Given ローディング中, When レンダリング, Then ローディング表示', () => {
    render(<ProductList loading={true} products={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('Given 商品が空, When レンダリング, Then 空状態表示', () => {
    render(<ProductList loading={false} products={[]} />);
    expect(screen.getByText('商品がありません')).toBeInTheDocument();
  });
});
```

### 3.3 統合テスト

**対象**: API + ユースケース + 認可 + バリデーション

**パターン**:
```typescript
describe('GET /api/products', () => {
  it('認証済みユーザーは商品一覧を取得できる', async () => {
    const session = createSession({ role: 'buyer' });
    const response = await request(app)
      .get('/api/products')
      .set('Cookie', sessionCookie(session));

    expect(response.status).toBe(200);
    expect(response.body).toMatchSchema(ProductListResponseSchema);
  });

  it('未認証ユーザーは401エラー', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });
});
```

### 3.4 E2Eテスト

**対象**: ユーザー導線

**購入者導線**:
```typescript
test('商品閲覧からカート追加まで', async ({ page }) => {
  // Given: buyerロールでログイン
  await login(page, 'buyer');

  // When: 商品一覧→詳細→カート追加
  await page.goto('/catalog');
  await page.click('[data-testid="product-1"]');
  await page.click('[data-testid="add-to-cart"]');

  // Then: カート件数が更新される
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
});
```

## 4. 品質ゲート設定

### 4.1 CI 設定（GitHub Actions）

```yaml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Type Check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Unit Tests
        run: pnpm test:unit --coverage

      - name: Coverage Gate (80%)
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% is below 80%"
            exit 1
          fi

      - name: Integration Tests
        run: pnpm test:integration

      - name: E2E Tests
        run: pnpm test:e2e
```

### 4.2 品質基準

| 項目 | 基準 | 検証方法 |
|------|------|----------|
| 型安全 | エラー 0 件 | `tsc --noEmit` |
| Lint | エラー 0 件 | `eslint` |
| カバレッジ | 80% 以上 | Vitest coverage |
| 単体テスト | 全パス | Vitest |
| 統合テスト | 全パス | Vitest |
| E2Eテスト | 全パス | Playwright |

## 5. UIデザイン参照基準

### 5.1 参照サイト

**URL**: https://ugmonk.com/en-jp/collections/analog

Ugmonk Analog コレクションのECサイトを、UIデザインの参照基準として採用する。

> **重要**: 本参照はブランド模倣を目的としない。
> 「レイアウト・情報設計・インタラクション原則」を学習対象とし、
> テンプレートに応用可能な設計パターンを抽出する。

### 5.2 デザイン特徴の分析

#### レイアウト
- **モジュール式グリッドシステム**を採用
- レスポンシブデザイン（モバイル/デスクトップ）
- ヘッダーは固定表示可能、スクロール時の表示制御

#### 配色
| 用途 | カラー | 説明 |
|------|--------|------|
| ベース（背景） | `#fafaf2` | オフホワイト、温かみのある白 |
| テキスト/UI | `#1a1a1a` | 濃いグレー/黒 |
| アクセント | `#ffd879` | 淡いイエロー（ハイライト用） |

- 高いコントラスト比で可読性を確保
- 「ミニマルで洗練」という世界観を表現

#### タイポグラフィ
- 見出し: サンセリフ系（軽量ウェイト）
- 装飾見出し: セリフ系（クラシカルなアクセント）
- モノスペース: タイプライター風のアクセント
- 可読性と美的価値を両立

#### 余白
- セクション間の余白: **2〜2.4rem** と豊富
- 要素が窮屈でなく「呼吸する」余裕
- 高級感・品質感を醸成

#### 商品表示
- 高品質な写真を複数枚展示
- 商品カード形式で情報をコンパクトに配置
- 在庫状態を視覚的に表示
- 過度な演出を行わない

#### ナビゲーション
- ハンバーガーメニュー（モバイル対応）
- 検索機能をヘッダー右に配置
- カート表示は常に見える位置

### 5.3 適用方針

本プロジェクトのUIテンプレートは、Ugmonkから以下の**設計原則**を学習・応用する：

#### レイアウト原則
- モジュール式グリッドシステム
- 豊富な余白（2〜2.4rem）による「呼吸感」
- レスポンシブ対応の情報優先度維持

#### 情報設計原則
- 商品情報と購入導線を最優先
- 補足情報は控えめに配置
- 不要な視覚要素の徹底的な排除

#### インタラクション原則
- シンプルで予測可能なナビゲーション
- 明確なCTA配置と十分なタッチ領域
- 状態遷移の視覚的フィードバック

> **注意**: 配色やフォントは参考値であり、実際のプロジェクトでカスタマイズ可能。
> 重要なのは「原則」の理解と応用であり、見た目の模倣ではない。

### 5.4 Tailwind CSS カスタムテーマ（案）

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Ugmonk inspired palette
        base: {
          50: '#fafaf2',   // オフホワイト（背景）
          100: '#f5f5e8',
          900: '#1a1a1a',  // ダークグレー（テキスト）
        },
        accent: {
          DEFAULT: '#ffd879', // イエローアクセント
          hover: '#ffcc4d',
        },
      },
      spacing: {
        // 余白を豊富に
        'section': '2.4rem',
        'section-lg': '4rem',
      },
      fontFamily: {
        // 日本語対応フォント
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
        serif: ['Playfair Display', 'Noto Serif JP', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

## 6. 結論

本リサーチにより、以下の技術スタックと設計パターンを採用する:

- **フレームワーク**: Next.js 14+ (App Router / Server Components)
- **言語**: TypeScript 5.x (strict mode)
- **バリデーション**: Zod
- **テスト**: Vitest + Testing Library + Playwright
- **スタイリング**: Tailwind CSS
- **認証**: セッション方式 + CSRF対策
- **認可**: 二重防御パターン
- **エラー処理**: 統一コード体系 + マスキング
- **UIデザイン参照**: Ugmonk Analog（ミニマリスト × 職人気質）

すべての技術選定が憲章の6原則に準拠していることを確認済み。
