/**
 * UIコンポーネント単体テスト テンプレート
 * TDD: RED → GREEN → REFACTOR
 *
 * このテンプレートは新しいUIコンポーネントのテストを書く際の雛形です。
 * 必要に応じてコピーして使用してください。
 *
 * テスト観点:
 * - 表示状態: loading/error/empty/data状態の表示確認
 * - ユーザーインタラクション: クリック、入力などの操作確認
 * - アクセシビリティ: 適切なARIAラベル、キーボード操作の確認
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// --- 以下はサンプルコンポーネント ---
// 実際のコンポーネントに置き換えてください

/**
 * サンプルProps型
 */
interface SampleComponentProps {
  /** ローディング状態 */
  loading?: boolean;
  /** エラー状態 */
  error?: string | null;
  /** データ */
  items?: Array<{ id: string; name: string }>;
  /** クリックハンドラ */
  onItemClick?: (id: string) => void;
}

/**
 * サンプルコンポーネント
 */
function SampleComponent({
  loading = false,
  error = null,
  items = [],
  onItemClick,
}: SampleComponentProps) {
  if (loading) {
    return (
      <div role="status" aria-label="読み込み中">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-label="エラー">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div role="status" aria-label="データなし">
        データがありません
      </div>
    );
  }

  return (
    <ul role="list" aria-label="アイテムリスト">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onItemClick?.(item.id)}
            aria-label={`${item.name}を選択`}
          >
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  );
}

// --- テスト本体 ---

describe('[コンポーネント名] コンポーネント', () => {
  // ユーザーイベントのセットアップ
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('表示状態', () => {
    describe('loading状態', () => {
      it('Given loading=true, When レンダリング, Then ローディング表示', () => {
        // Arrange & Act
        render(<SampleComponent loading={true} />);

        // Assert
        expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    describe('error状態', () => {
      it('Given error="エラーメッセージ", When レンダリング, Then エラー表示', () => {
        // Arrange & Act
        render(<SampleComponent error="エラーが発生しました" />);

        // Assert
        expect(screen.getByRole('alert', { name: 'エラー' })).toBeInTheDocument();
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      });
    });

    describe('empty状態', () => {
      it('Given items=[], When レンダリング, Then 空状態表示', () => {
        // Arrange & Act
        render(<SampleComponent items={[]} />);

        // Assert
        expect(screen.getByRole('status', { name: 'データなし' })).toBeInTheDocument();
        expect(screen.getByText('データがありません')).toBeInTheDocument();
      });
    });

    describe('data状態', () => {
      it('Given items配列, When レンダリング, Then アイテムリスト表示', () => {
        // Arrange
        const items = [
          { id: '1', name: 'アイテム1' },
          { id: '2', name: 'アイテム2' },
        ];

        // Act
        render(<SampleComponent items={items} />);

        // Assert
        expect(screen.getByRole('list', { name: 'アイテムリスト' })).toBeInTheDocument();
        expect(screen.getByText('アイテム1')).toBeInTheDocument();
        expect(screen.getByText('アイテム2')).toBeInTheDocument();
      });
    });
  });

  describe('ユーザーインタラクション', () => {
    it('Given アイテムリスト, When アイテムをクリック, Then onItemClickが呼ばれる', async () => {
      // Arrange
      const items = [{ id: '1', name: 'アイテム1' }];
      const onItemClick = vi.fn();

      render(<SampleComponent items={items} onItemClick={onItemClick} />);

      // Act
      await user.click(screen.getByRole('button', { name: 'アイテム1を選択' }));

      // Assert
      expect(onItemClick).toHaveBeenCalledWith('1');
      expect(onItemClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('アクセシビリティ', () => {
    it('Given アイテムリスト, When レンダリング, Then 適切なARIAラベルが設定されている', () => {
      // Arrange
      const items = [{ id: '1', name: 'アイテム1' }];

      // Act
      render(<SampleComponent items={items} />);

      // Assert
      expect(screen.getByRole('list')).toHaveAccessibleName('アイテムリスト');
      expect(screen.getByRole('button')).toHaveAccessibleName('アイテム1を選択');
    });

    it('Given ローディング状態, When レンダリング, Then status roleが設定されている', () => {
      // Arrange & Act
      render(<SampleComponent loading={true} />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('Given エラー状態, When レンダリング, Then alert roleが設定されている', () => {
      // Arrange & Act
      render(<SampleComponent error="エラー" />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
