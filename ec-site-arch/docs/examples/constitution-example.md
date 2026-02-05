# Constitution Example - ECサイトプロジェクト向け

`/speckit.constitution` 実行時の入力例です。
このファイルをコピーして、プロジェクト固有の内容に編集してください。

---

## 実行ディレクトリ

```bash
# リポジトリルートで実行（ec-site-arch/ の親ディレクトリ）
cd /path/to/your-project
/speckit.constitution

# 出力先: specs/constitution.md
```

---

## 入力例（対話形式での回答）

### プロジェクト概要

```
プロジェクト名: [Your EC Site Name]
説明: Next.js + TypeScriptで構築するECサイト。EC Site Architecture Templateをベースに実装。
```

### 技術スタック

```
- Next.js 14 (App Router)
- TypeScript 5 (strict mode)
- React 18
- Tailwind CSS 3
- Zod (バリデーション)
- Vitest (単体・統合テスト)
- Playwright (E2Eテスト)
```

### アーキテクチャ原則

```
1. テンプレート駆動開発
   - UI/API/テストは templates/ のテンプレートを基に実装
   - 共通基盤は foundation/ を使用

2. ドメイン分離
   - 各ドメインは src/domains/[domain]/ に独立して実装
   - ドメイン間の依存は API 経由のみ

3. テストファースト
   - 新機能は必ずテストから開始
   - カバレッジ80%以上を維持
```

### 品質基準

```
- TypeScript: strictモード、エラー0件
- ESLint: エラー0件
- テストカバレッジ: 80%以上
- E2Eテスト: 主要導線をカバー
- パフォーマンス: 一覧ページ初回ロード3秒以内
```

### ディレクトリ規約

```
src/
├── foundation/     # 共通基盤（変更しない）
├── templates/      # テンプレート（カスタマイズ可）
├── domains/        # ドメイン実装（ここに実装）
├── infrastructure/ # インフラ層
└── app/            # Next.js App Router

tests/
├── unit/           # 単体テスト
├── integration/    # 統合テスト
└── e2e/            # E2Eテスト
```

### 認証・認可

```
- ロール: buyer（購入者）, admin（管理者）
- セッション管理: Cookie-based
- 認可: RBAC (Role-Based Access Control)
```

### 命名規約

```
- ファイル名: kebab-case (例: product-list.tsx)
- コンポーネント: PascalCase (例: ProductList)
- 関数: camelCase (例: getProducts)
- 定数: UPPER_SNAKE_CASE (例: MAX_ITEMS)
- 型: PascalCase (例: ProductType)
```

---

## constitution.md 出力例

```markdown
# Project Constitution: [Your EC Site Name]

## 1. プロジェクト概要

### 1.1 目的
Next.js + TypeScriptで構築するECサイト。
EC Site Architecture Templateをベースに、高品質で保守性の高いコードベースを実現する。

### 1.2 技術スタック
| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript 5 (strict) |
| UI | React 18, Tailwind CSS 3 |
| バリデーション | Zod |
| テスト | Vitest, Playwright |

---

## 2. アーキテクチャ原則

### 2.1 テンプレート駆動開発
- すべてのUI/APIは `@/templates/` のテンプレートを基に実装
- 共通機能は `@/foundation/` を使用し、重複実装を避ける
- 新規パターンが必要な場合はテンプレートとして追加

### 2.2 ドメイン分離
- 各ドメインは `src/domains/[domain]/` に独立して実装
- ドメイン内は `api/`, `ui/`, `types/`, `tests/` で構成
- ドメイン間の依存はAPI経由のみ（直接インポート禁止）

### 2.3 テストファースト
- 新機能は必ずテストケースから設計
- Given-When-Then形式でテストを記述
- カバレッジ80%以上を維持

---

## 3. 品質基準

### 3.1 コード品質
| 項目 | 基準 |
|-----|------|
| TypeScript | strictモード、エラー0件 |
| ESLint | エラー0件 |
| テストカバレッジ | 80%以上 |

### 3.2 パフォーマンス
| 項目 | 基準 |
|-----|------|
| 一覧ページ初回ロード | 3秒以内 |
| API応答時間 | 500ms以内 |
| Lighthouse Score | 80以上 |

---

## 4. ディレクトリ構成

\`\`\`
src/
├── foundation/          # 共通基盤（原則変更しない）
│   ├── auth/           # 認証・認可
│   ├── errors/         # エラーハンドリング
│   ├── logging/        # ログ・監査
│   └── validation/     # バリデーション
│
├── templates/           # 再利用テンプレート
│   ├── api/            # API (usecase, handler, dto)
│   ├── ui/             # UI (layouts, pages, components)
│   └── infrastructure/ # インフラ (repository, session)
│
├── domains/             # ドメイン実装
│   └── [domain]/
│       ├── api/        # ユースケース
│       ├── ui/         # コンポーネント
│       ├── types/      # 型定義
│       └── tests/      # テスト
│
├── infrastructure/      # インフラ層
│   ├── repositories/   # データアクセス
│   └── auth/           # 認証実装
│
└── app/                 # Next.js App Router
    ├── (buyer)/        # 購入者向け
    ├── admin/          # 管理者向け
    └── api/            # API Routes
\`\`\`

---

## 5. 認証・認可

### 5.1 ロール定義
| ロール | 説明 | 権限 |
|--------|------|------|
| buyer | 購入者 | 商品閲覧、カート操作、注文 |
| admin | 管理者 | 全機能 + 商品管理、注文管理 |

### 5.2 認可パターン
\`\`\`typescript
// 認証必須
const session = await requireAuth(request);

// 特定ロール必須
const session = await requireRole(request, 'admin');

// 自分のリソースのみ
await requireOwner(request, resourceOwnerId);
\`\`\`

---

## 6. 命名規約

| 対象 | 規約 | 例 |
|-----|------|-----|
| ファイル名 | kebab-case | `product-list.tsx` |
| コンポーネント | PascalCase | `ProductList` |
| 関数 | camelCase | `getProducts` |
| 定数 | UPPER_SNAKE_CASE | `MAX_ITEMS` |
| 型 | PascalCase | `ProductType` |
| テスト | Given-When-Then | `Given 正常入力, When 実行, Then 成功` |

---

## 7. Git運用

### 7.1 ブランチ戦略
- `main`: 本番リリース
- `develop`: 開発統合
- `feature/[issue-id]-[name]`: 機能開発
- `fix/[issue-id]-[name]`: バグ修正

### 7.2 コミットメッセージ
\`\`\`
<type>: <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
\`\`\`

type: feat, fix, docs, style, refactor, test, chore

---

## 8. CI/CD

### 8.1 品質ゲート
- TypeScript型チェック
- ESLint
- 単体テスト + カバレッジ
- E2Eテスト

### 8.2 自動化
- PR時: 品質ゲート実行
- main マージ時: 本番デプロイ
\`\`\`

---

## 使用方法

1. 新規プロジェクトで `/speckit.constitution` を実行
2. 上記の入力例を参考に回答
3. 生成された `constitution.md` をプロジェクトに合わせて調整
4. `specs/constitution.md` として保存
