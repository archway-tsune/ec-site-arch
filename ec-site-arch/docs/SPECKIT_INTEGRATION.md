# Speckit連携ガイド

このアーキテクチャテンプレートをspeckitプロジェクトで使用する方法を説明します。

## 関連ドキュメント

- [constitution-example.md](./examples/constitution-example.md) - `/speckit.constitution` の入力例
- [spec-template.md](./examples/spec-template.md) - 機能仕様（spec/plan/tasks）のテンプレート例

---

## 1. プロジェクト構成

```
your-ec-project/
├── specs/                    # speckit仕様ディレクトリ
│   ├── constitution.md       # プロジェクト憲法
│   └── 001-feature-name/     # 機能仕様
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
│
├── ec-site-arch/             # アーキテクチャ（このテンプレート）
│   ├── src/
│   │   ├── foundation/       # 共通基盤
│   │   ├── templates/        # 再利用テンプレート
│   │   ├── samples/          # サンプル実装（参考）
│   │   └── domains/          # 本番ドメイン実装
│   └── ...
│
└── README.md
```

---

## 2. speckit仕様の書き方

### 2.1 新機能の spec.md テンプレート

```markdown
# Feature: [機能名]

## 概要
[機能の概要を1-2文で]

## ユーザーストーリー
- As a [ユーザー種別], I want to [目的], so that [理由]

## 機能要件

### FR-001: [要件名]
- 説明: [詳細]
- 優先度: Must/Should/Could
- 関連UI: `src/domains/[domain]/ui/`
- 関連API: `src/domains/[domain]/api/`

## UI要件

### 画面一覧
| 画面ID | 画面名 | パス | テンプレート |
|--------|--------|------|-------------|
| UI-001 | [画面名] | /path | ListPageTemplate |

### UIコンポーネント
- テンプレート: `@/templates/ui/pages/list`
- レイアウト: `@/templates/ui/layouts/BuyerLayout`

## API要件

### エンドポイント一覧
| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/[resource] | 一覧取得 |
| POST | /api/[resource] | 新規作成 |

### 認可
- buyer: 自分のリソースのみ
- admin: 全リソース

## テスト要件

### 単体テスト
- ユースケースの正常系・異常系
- UIコンポーネントの状態表示

### E2Eテスト
- 主要導線（一覧→詳細→操作→完了）

## 実装ガイド

### 使用テンプレート
\`\`\`typescript
import { ListPageTemplate } from '@/templates/ui/pages/list';
import { createUseCase } from '@/templates/api/usecase';
import { createHmrSafeStore } from '@/templates/infrastructure/repository';
\`\`\`

### ディレクトリ構成
\`\`\`
src/domains/[domain]/
├── api/usecases.ts
├── ui/[Component].tsx
├── types/index.ts
└── tests/unit/
\`\`\`
```

---

## 3. アーキテクチャとの対応表

### テンプレート対応

| 要件タイプ | テンプレート | パス |
|-----------|-------------|------|
| 一覧画面 | ListPageTemplate | `@/templates/ui/pages/list` |
| 詳細画面 | DetailPageTemplate | `@/templates/ui/pages/detail` |
| フォーム画面 | FormPageTemplate | `@/templates/ui/pages/form` |
| ログイン画面 | LoginPageTemplate | `@/templates/ui/pages/login` |
| 購入者レイアウト | BuyerLayout | `@/templates/ui/layouts/BuyerLayout` |
| 管理者レイアウト | AdminLayout | `@/templates/ui/layouts/AdminLayout` |
| ユースケース | createUseCase | `@/templates/api/usecase` |
| APIハンドラ | createHandler | `@/templates/api/handler` |
| リポジトリ | createHmrSafeStore | `@/templates/infrastructure/repository` |

### 認証・認可

| 要件 | 実装 |
|-----|------|
| ログイン必須 | `requireAuth()` |
| 管理者のみ | `requireRole(request, 'admin')` |
| 購入者のみ | `requireRole(request, 'buyer')` |

---

## 4. タスク生成の指針

### tasks.md テンプレート

```markdown
# Tasks: [機能名]

## フェーズ1: ドメイン実装

### Task 1-1: [Domain]ドメイン実装
- [ ] T001 型定義を実装する `src/domains/[domain]/types/index.ts`
- [ ] T002 [P] UIコンポーネントを実装する `src/domains/[domain]/ui/`
- [ ] T003 [P] APIユースケースを実装する `src/domains/[domain]/api/usecases.ts`
- [ ] T004 リポジトリを実装する `src/infrastructure/repositories/[domain].ts`

### Task 1-2: ページ実装
- [ ] T005 一覧ページを実装する `src/app/(buyer)/[path]/page.tsx`
- [ ] T006 詳細ページを実装する `src/app/(buyer)/[path]/[id]/page.tsx`
- [ ] T007 [P] APIルートを実装する `src/app/api/[path]/route.ts`

### Task 1-3: テスト実装
- [ ] T008 [P] 単体テストを実装する `tests/unit/domains/[domain]/`
- [ ] T009 [P] 統合テストを実装する `tests/integration/domains/[domain]/`
- [ ] T010 E2Eテストを実装する `tests/e2e/[domain].spec.ts`

## 依存関係
- T001 → T002, T003, T004
- T004 → T007
- T002, T003 → T005, T006
```

---

## 5. サンプル実装の参照

### Catalogドメイン（商品管理）
- 一覧・詳細表示
- 検索・フィルタ
- ページネーション

参照: `src/samples/domains/catalog/`

### Cartドメイン（カート）
- 商品追加・削除
- 数量変更
- 合計計算

参照: `src/samples/domains/cart/`

### Ordersドメイン（注文）
- 注文作成
- 注文履歴
- ステータス管理

参照: `src/samples/domains/orders/`

---

## 6. 品質基準

speckit仕様に以下の品質基準を含めてください：

```markdown
## 品質要件

### テスト
- 単体テストカバレッジ: 80%以上
- E2Eテスト: 主要導線をカバー

### コード品質
- TypeScript: strictモード、エラー0件
- ESLint: エラー0件

### パフォーマンス
- 一覧ページ: 初回ロード 3秒以内
- API応答: 500ms以内
```
