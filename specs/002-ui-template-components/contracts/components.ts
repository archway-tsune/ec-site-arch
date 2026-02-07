/**
 * コンポーネントProps型定義（コントラクト）
 *
 * このファイルは実装のコントラクト（契約）として機能する。
 * 実装時に各コンポーネントはこれらの型定義に準拠しなければならない。
 *
 * ※ このファイルは設計ドキュメントであり、ソースコードとして直接使用しない。
 *   実装時は各コンポーネントファイル内で型を定義する。
 */

// ─────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────

/** ページネーションコンポーネントのProps */
export interface PaginationProps {
  /** 現在のページ番号（1始まり） */
  page: number;
  /** 1ページあたりの表示件数 */
  limit: number;
  /** 総件数 */
  total: number;
  /** 総ページ数 */
  totalPages: number;
  /** ページ変更コールバック */
  onPageChange: (page: number) => void;
}

// ─────────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────────

/** ステータスバッジコンポーネントのProps */
export interface StatusBadgeProps {
  /** ステータス値 */
  status: string;
  /** ステータス→Tailwind CSSクラスのマッピング */
  statusColors: Record<string, string>;
  /** ステータス→表示ラベルのマッピング */
  statusLabels: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────
// ImagePlaceholder
// ─────────────────────────────────────────────────────────────────

/** 画像プレースホルダーコンポーネントのProps */
export interface ImagePlaceholderProps {
  /** 画像URL（未指定の場合プレースホルダーを表示） */
  src?: string;
  /** alt属性（必須） */
  alt: string;
  /** サイズバリアント */
  size?: 'sm' | 'md' | 'lg';
  /** 追加CSSクラス */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────
// SearchBar
// ─────────────────────────────────────────────────────────────────

/** 検索バーコンポーネントのProps */
export interface SearchBarProps {
  /** 検索実行コールバック */
  onSearch: (query: string) => void;
  /** 初期値 */
  defaultValue?: string;
  /** プレースホルダーテキスト */
  placeholder?: string;
}

// ─────────────────────────────────────────────────────────────────
// QuantitySelector
// ─────────────────────────────────────────────────────────────────

/** 数量セレクターコンポーネントのProps */
export interface QuantitySelectorProps {
  /** 現在の数量 */
  value: number;
  /** 最小値 */
  min?: number;
  /** 最大値 */
  max?: number;
  /** 数量変更コールバック */
  onChange: (value: number) => void;
  /** 無効化状態 */
  disabled?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// ユーティリティ関数シグネチャ
// ─────────────────────────────────────────────────────────────────

/**
 * 価格フォーマット関数
 *
 * @param price - フォーマットする価格（数値）
 * @returns フォーマット済み文字列（例: '¥1,000', '無料'）
 *
 * - 0 → '無料'
 * - 正の数 → '¥N,NNN'（カンマ区切り）
 * - 負の数 → '-¥N,NNN'
 */
export declare function formatPrice(price: number): string;

/**
 * 日時フォーマット関数
 *
 * @param date - フォーマットする日時（Date オブジェクトまたは ISO 文字列）
 * @returns ja-JP ロケールのフォーマット済み文字列（例: '2026年2月7日 14:30'）
 *
 * - 有効な日時 → 'YYYY年M月D日 HH:MM'
 * - 無効な日時 → '-'（フォールバック）
 */
export declare function formatDateTime(date: string | Date): string;
