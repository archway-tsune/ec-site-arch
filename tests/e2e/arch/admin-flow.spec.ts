/**
 * 管理者導線E2Eテスト
 * 商品管理・注文管理の一連の流れを検証
 */
import { test, expect } from '@playwright/test';

// 管理者ログインヘルパー
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await page.waitForLoadState('networkidle');
  await page.locator('#email').fill('admin@example.com');
  await page.locator('#password').fill('demo');
  await page.getByRole('button', { name: /ログイン/i }).click();
  await page.waitForURL(/\/admin(?!\/login)/);
  await page.waitForLoadState('networkidle');
}

// 購入者ログインヘルパー
async function loginAsBuyer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('#email').fill('buyer@example.com');
  await page.locator('#password').fill('demo');
  await page.getByRole('button', { name: /ログイン/i }).click();
  await page.waitForURL(/\/catalog/);
  await page.waitForLoadState('networkidle');
}

test.describe('管理者導線', () => {
  test.beforeEach(async ({ page, request }) => {
    // テスト前に状態をリセット
    await request.post('/api/test/reset');

    // 管理者としてログイン
    await loginAsAdmin(page);
  });

  test.describe('商品管理', () => {
    test('商品一覧が表示される', async ({ page }) => {
      await page.goto('/admin/products');

      // 商品一覧テーブル
      await expect(page.locator('table')).toBeVisible();

      // 新規登録リンク（Link要素）
      await expect(page.getByRole('link', { name: /新規登録/i })).toBeVisible();
    });

    test('商品を新規登録できる', async ({ page }) => {
      await page.goto('/admin/products/new');

      // フォーム入力（id属性を使用）
      await page.locator('#name').fill('テスト商品');
      await page.locator('#price').fill('1000');
      await page.locator('#description').fill('テスト商品の説明です');

      // 登録
      await page.getByRole('button', { name: /登録/i }).click();

      // 成功メッセージまたはリダイレクト
      await expect(page).toHaveURL(/\/admin\/products/);
    });

    test('商品を編集できる', async ({ page }) => {
      await page.goto('/admin/products');

      // 編集ボタンをクリック
      await page.locator('[data-testid="edit-button"]').first().click();

      // 編集ページに遷移を待つ
      await expect(page).toHaveURL(/\/admin\/products\/.*\/edit/);

      // 編集フォームが読み込まれるのを待つ
      await expect(page.locator('#name')).toBeVisible({ timeout: 10000 });

      // 名前を変更
      await page.locator('#name').clear();
      await page.locator('#name').fill('編集後商品名');

      // 保存
      await page.getByRole('button', { name: /保存/i }).click();

      // 成功
      await expect(page).toHaveURL(/\/admin\/products$/);
    });

    test('商品を削除できる', async ({ page }) => {
      await page.goto('/admin/products');

      // 商品一覧が読み込まれるのを待つ
      await expect(page.locator('[data-testid="product-row"]').first()).toBeVisible({ timeout: 10000 });

      // 削除前の商品数を取得
      const initialCount = await page.locator('[data-testid="product-row"]').count();

      // 削除ボタンをクリック
      await page.locator('[data-testid="delete-button"]').first().click();

      // 確認ダイアログ
      await page.getByRole('button', { name: /削除する/i }).click();

      // 商品が削除される（一覧から消える）
      await expect(page.locator('[data-testid="product-row"]')).toHaveCount(initialCount - 1, { timeout: 10000 });
    });

    test('商品ステータスを変更できる', async ({ page }) => {
      await page.goto('/admin/products');

      // 商品一覧が読み込まれるのを待つ
      await expect(page.locator('[data-testid="product-row"]').first()).toBeVisible({ timeout: 10000 });

      // ステータス変更
      await page.locator('[data-testid="status-select"]').first().selectOption('published');

      // 変更が反映される（APIコール完了を待つ）
      await expect(page.locator('[data-testid="status-badge"]').first()).toContainText('公開中', { timeout: 10000 });
    });
  });

  test.describe('注文管理', () => {
    // 注文が存在する状態を作るためのヘルパー
    async function createOrderAsBuyer(page: import('@playwright/test').Page) {
      // buyerとしてログイン
      await loginAsBuyer(page);

      // 商品をカートに追加して注文
      await page.goto('/catalog');
      await expect(page.locator('h1')).toContainText('商品');
      await page.locator('[data-testid="product-card"]').first().click();
      await expect(page).toHaveURL(/\/catalog\/[a-f0-9-]+/);
      await page.getByRole('button', { name: /カートに追加/i }).click();
      await expect(page.locator('[data-testid="cart-count"]')).toBeVisible();
      await page.goto('/cart');
      await expect(page.locator('h1')).toContainText('カート');
      // カートに商品があることを確認
      await expect(page.locator('[data-testid="cart-subtotal"]')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: /注文手続きへ/i }).click();
      await expect(page).toHaveURL(/\/checkout/);
      await page.getByRole('button', { name: /注文を確定/i }).click();
      await expect(page).toHaveURL(/\/orders\//);
    }

    test('注文一覧が表示される', async ({ page }) => {
      // まずbuyerとして注文を作成
      await createOrderAsBuyer(page);

      // 再度adminとしてログイン
      await loginAsAdmin(page);

      await page.goto('/admin/orders');

      // 注文一覧テーブル
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('[data-testid="order-row"]').first()).toBeVisible();
    });

    test('注文詳細を確認できる', async ({ page }) => {
      // まずbuyerとして注文を作成
      await createOrderAsBuyer(page);

      // 再度adminとしてログイン
      await loginAsAdmin(page);

      await page.goto('/admin/orders');

      // 注文行をクリック
      await page.locator('[data-testid="order-row"]').first().click();

      // 注文詳細ページ（メインコンテンツ内のh1を確認）
      await expect(page.locator('main h1')).toContainText('注文詳細');

      // 顧客情報
      await expect(page.locator('[data-testid="customer-info"]')).toBeVisible();

      // 商品一覧
      await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
    });

    test('注文ステータスを更新できる', async ({ page }) => {
      // まずbuyerとして注文を作成
      await createOrderAsBuyer(page);

      // 再度adminとしてログイン
      await loginAsAdmin(page);

      await page.goto('/admin/orders');

      // 注文詳細へ
      await page.locator('[data-testid="order-row"]').first().click();

      // ステータス変更
      await page.locator('[data-testid="status-select"]').selectOption('confirmed');

      // 更新ボタン
      await page.getByRole('button', { name: /ステータス更新/i }).click();

      // 成功メッセージ
      await expect(page.locator('text=ステータスを更新しました')).toBeVisible();
    });

    test('ステータスフィルタで絞り込める', async ({ page }) => {
      // まずbuyerとして注文を作成
      await createOrderAsBuyer(page);

      // 再度adminとしてログイン
      await loginAsAdmin(page);

      await page.goto('/admin/orders');

      // フィルタ選択
      await page.locator('[data-testid="status-filter"]').selectOption('pending');

      // フィルタ適用後の結果
      await expect(page.locator('[data-testid="order-status"]').first()).toContainText('処理待ち');
    });
  });

  test.describe('一連の管理フロー', () => {
    test('商品登録 → 公開', async ({ page }) => {
      // 1. 商品登録
      await page.goto('/admin/products/new');
      await page.locator('#name').fill('管理フローテスト商品');
      await page.locator('#price').fill('5000');
      await page.getByRole('button', { name: /登録/i }).click();

      // 2. 商品一覧で確認
      await page.goto('/admin/products');
      await expect(page.locator('text=管理フローテスト商品').first()).toBeVisible();

      // 3. ステータスを公開に変更
      // 最後の行（新しく追加した商品）のステータスセレクトを変更
      const productRows = page.locator('[data-testid="product-row"]');
      const lastRow = productRows.last();
      await lastRow.locator('[data-testid="status-select"]').selectOption('published');

      // 公開に変更されたことを確認
      await expect(lastRow.locator('[data-testid="status-badge"]')).toContainText('公開中');
    });
  });

  test.describe('権限確認', () => {
    test('未認証ユーザーは管理画面にアクセスできない', async ({ browser }) => {
      // 新しいブラウザコンテキストで完全に未認証状態
      const newContext = await browser.newContext();
      const newPage = await newContext.newPage();

      await newPage.goto('/admin/products');

      // ログインページにリダイレクト
      await expect(newPage).toHaveURL(/\/admin\/login/);

      await newContext.close();
    });

    test('buyerロールは管理画面にアクセスできない', async ({ browser }) => {
      // 新しいコンテキストでbuyerとしてログイン
      const buyerContext = await browser.newContext();
      const page = await buyerContext.newPage();

      // buyerとしてログイン
      await loginAsBuyer(page);

      // buyerとしてログインが完了していることを確認（ユーザー名が表示される）
      await expect(page.locator('text=購入者テスト')).toBeVisible({ timeout: 10000 });

      // 管理画面にアクセス
      await page.goto('/admin/products');

      // 権限なしメッセージ
      await expect(page.locator('text=権限がありません')).toBeVisible();

      await buyerContext.close();
    });
  });
});
