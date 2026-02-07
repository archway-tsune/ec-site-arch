/**
 * 購入者導線E2Eテスト
 * 商品閲覧 → カート追加 → 注文確定 の一連の流れを検証
 */
import { test, expect } from '@playwright/test';

// ログインヘルパー
async function loginAsBuyer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('#email').fill('buyer@example.com');
  await page.locator('#password').fill('demo');
  await page.getByRole('button', { name: /ログイン/i }).click();
  await page.waitForURL(/\/catalog/);
  await page.waitForLoadState('networkidle');
}

test.describe('購入者導線', () => {
  test.beforeEach(async ({ page, request }) => {
    // テスト前に状態をリセット
    await request.post('/api/test/reset');
    // 購入者としてログイン
    await loginAsBuyer(page);
  });

  test.describe('商品一覧', () => {
    test('商品一覧ページが表示される', async ({ page }) => {
      await page.goto('/catalog');

      // ページタイトルを確認
      await expect(page.locator('h1')).toContainText('商品');

      // 商品カードが表示される（デモデータ）
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    });

    test('商品をクリックすると詳細ページに遷移する', async ({ page }) => {
      await page.goto('/catalog');

      // 最初の商品カードをクリック
      await page.locator('[data-testid="product-card"]').first().click();

      // 詳細ページに遷移
      await expect(page).toHaveURL(/\/catalog\/[a-f0-9-]+/);
    });
  });

  test.describe('商品詳細', () => {
    test('商品詳細が表示される', async ({ page }) => {
      // デモ商品IDでアクセス（実際のIDに置き換え）
      await page.goto('/catalog/550e8400-e29b-41d4-a716-446655440000');

      // 商品名が表示される
      await expect(page.locator('h1')).toBeVisible();

      // 価格が表示される
      await expect(page.locator('text=¥')).toBeVisible();

      // カートに追加ボタンが表示される
      await expect(page.getByRole('button', { name: /カートに追加/i })).toBeVisible();
    });

    test('カートに追加できる', async ({ page }) => {
      await page.goto('/catalog/550e8400-e29b-41d4-a716-446655440000');

      // カートに追加
      await page.getByRole('button', { name: /カートに追加/i }).click();

      // 成功メッセージまたはカートアイコン更新を確認
      await expect(page.locator('[data-testid="cart-count"]')).toContainText(/[1-9]/);
    });
  });

  test.describe('カート', () => {
    test('カートページが表示される', async ({ page }) => {
      await page.goto('/cart');

      // カートページのヘッダー
      await expect(page.locator('h1')).toContainText('カート');
    });

    test('カートが空の場合は空状態を表示する', async ({ page }) => {
      await page.goto('/cart');

      // 空状態メッセージ
      await expect(page.locator('text=カートは空です')).toBeVisible();
    });

    test('カート内商品の数量を変更できる', async ({ page }) => {
      // 事前にカートに商品を追加
      await page.goto('/catalog/550e8400-e29b-41d4-a716-446655440000');
      await page.getByRole('button', { name: /カートに追加/i }).click();

      // カートページへ
      await page.goto('/cart');

      // 数量セレクトを変更
      await page.locator('select').first().selectOption('3');

      // 合計金額が更新される
      await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible();
    });

    test('注文手続きに進める', async ({ page }) => {
      // 事前にカートに商品を追加
      await page.goto('/catalog/550e8400-e29b-41d4-a716-446655440000');
      await page.getByRole('button', { name: /カートに追加/i }).click();
      await expect(page.locator('[data-testid="cart-count"]')).toBeVisible();

      // カートページへ
      await page.goto('/cart');
      await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible();

      // 注文手続きへボタンをクリック
      await page.getByRole('button', { name: /注文手続きへ/i }).click();

      // 注文確認ページに遷移
      await expect(page).toHaveURL(/\/checkout/);
    });
  });

  test.describe('注文', () => {
    test('注文を確定できる', async ({ page }) => {
      // 商品一覧から開始（test 12と同じフロー）
      await page.goto('/catalog');
      await expect(page.locator('h1')).toContainText('商品');

      // 商品詳細へ
      await page.locator('[data-testid="product-card"]').first().click();
      await expect(page).toHaveURL(/\/catalog\/[a-f0-9-]+/);

      // カートに追加
      await page.getByRole('button', { name: /カートに追加/i }).click();
      await expect(page.locator('[data-testid="cart-count"]')).toBeVisible();

      // カートへ
      await page.goto('/cart');
      await expect(page.locator('h1')).toContainText('カート');
      // カートに商品があることを確認
      await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible({ timeout: 10000 });

      // 注文手続きへ
      await page.getByRole('button', { name: /注文手続きへ/i }).click();
      await expect(page).toHaveURL(/\/checkout/);

      // 注文確定
      await page.getByRole('button', { name: /注文を確定/i }).click();

      // 注文完了ページに遷移
      await expect(page).toHaveURL(/\/orders\/[a-f0-9-]+/);

      // 注文完了メッセージ
      await expect(page.locator('text=ご注文ありがとうございます')).toBeVisible();
    });

    test('注文履歴ページで注文を確認できる', async ({ page }) => {
      await page.goto('/orders');

      // 注文一覧が表示される
      await expect(page.locator('h1')).toContainText('注文');
    });

    test('注文詳細を確認できる', async ({ page }) => {
      // 商品一覧から開始（test 12と同じフロー）
      await page.goto('/catalog');
      await expect(page.locator('h1')).toContainText('商品');

      // 商品詳細へ
      await page.locator('[data-testid="product-card"]').first().click();
      await expect(page).toHaveURL(/\/catalog\/[a-f0-9-]+/);

      // カートに追加
      await page.getByRole('button', { name: /カートに追加/i }).click();
      await expect(page.locator('[data-testid="cart-count"]')).toBeVisible();

      // カートへ
      await page.goto('/cart');
      await expect(page.locator('h1')).toContainText('カート');
      // カートに商品があることを確認
      await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible({ timeout: 10000 });

      // 注文手続きへ
      await page.getByRole('button', { name: /注文手続きへ/i }).click();
      await expect(page).toHaveURL(/\/checkout/);

      // 注文確定
      await page.getByRole('button', { name: /注文を確定/i }).click();
      await expect(page).toHaveURL(/\/orders\/[a-f0-9-]+/);

      // 注文一覧ページへ
      await page.goto('/orders');
      await expect(page.locator('[data-testid="order-row"]').first()).toBeVisible();

      // 最初の注文をクリック
      await page.locator('[data-testid="order-row"]').first().click();

      // 注文詳細ページ
      await expect(page.locator('h1')).toContainText('注文詳細');

      // 注文ステータスが表示される
      await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    });
  });

  test.describe('一連の購入フロー', () => {
    test('商品閲覧 → カート → 注文確定', async ({ page }) => {
      // 1. 商品一覧
      await page.goto('/catalog');
      await expect(page.locator('h1')).toContainText('商品');

      // 2. 商品詳細（URLの変更を待つ）
      await page.locator('[data-testid="product-card"]').first().click();
      await expect(page).toHaveURL(/\/catalog\/[a-f0-9-]+/);
      await expect(page.locator('h1')).toBeVisible();

      // 3. カートに追加（詳細ページのボタンをクリック）
      await page.getByRole('button', { name: /カートに追加/i }).click();
      await expect(page.locator('[data-testid="cart-count"]')).toBeVisible();

      // 4. カートへ
      await page.goto('/cart');
      await expect(page.locator('h1')).toContainText('カート');
      // カートに商品があることを確認
      await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible({ timeout: 10000 });

      // 5. 注文手続きへ
      await page.getByRole('button', { name: /注文手続きへ/i }).click();
      await expect(page).toHaveURL(/\/checkout/);

      // 6. 注文確定
      await page.getByRole('button', { name: /注文を確定/i }).click();

      // 7. 注文完了
      await expect(page.locator('text=ご注文ありがとうございます')).toBeVisible();
    });
  });

  test.describe('未ログイン時の動作', () => {
    test('未ログインでカート追加するとログインページにリダイレクトされる', async ({ browser }) => {
      // 新しいコンテキストで未ログイン状態
      const newContext = await browser.newContext();
      const page = await newContext.newPage();

      // 商品詳細ページへ
      await page.goto('/catalog/550e8400-e29b-41d4-a716-446655440000');

      // カートに追加
      await page.getByRole('button', { name: /カートに追加/i }).click();

      // ログインページにリダイレクト
      await expect(page).toHaveURL(/\/login/);

      await newContext.close();
    });
  });
});
