# ドメイン実装

このディレクトリには、本番用のドメイン実装を配置します。

## ディレクトリ構成

新規ドメインを追加する場合は、以下の構成に従ってください:

```
src/domains/
└── {domain-name}/
    ├── api/           # ユースケース（ビジネスロジック）
    │   ├── usecases.ts
    │   └── index.ts
    ├── ui/            # UIコンポーネント
    │   ├── {Component}.tsx
    │   └── index.ts
    └── tests/         # テスト
        ├── unit/
        │   ├── usecase.test.ts
        │   └── ui.test.tsx
        └── integration/
            └── api.test.ts
```

## サンプル実装

サンプル実装は `src/samples/domains/` にあります。
新規ドメインを実装する際の参考にしてください。

## 利用可能なテンプレート

テンプレートは `src/templates/` からインポートできます:

```typescript
// ユースケーステンプレート
import { createUseCase } from '@/templates/api/usecase';

// UIテンプレート
import { ListPage, DetailPage, FormPage } from '@/templates/ui/pages';
import { Loading, Error, Empty } from '@/templates/ui/components/status';

// リポジトリテンプレート
import { createInMemoryStore, createCrudRepository } from '@/templates/infrastructure/repository';
```

## 実装手順

1. `src/domains/{domain-name}/` ディレクトリを作成
2. 契約（DTO）を `src/contracts/` に定義
3. ユースケースを `api/usecases.ts` に実装
4. UIコンポーネントを `ui/` に実装
5. テストを `tests/` に実装
6. ルーティングを `src/app/` に追加

詳細は `specs/001-ec-arch-foundation/quickstart.md` を参照してください。
