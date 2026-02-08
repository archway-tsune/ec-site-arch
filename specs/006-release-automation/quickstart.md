# Quickstart: GitHub リリース自動化

**Feature Branch**: `006-release-automation`

## リリースフロー（自動化後）

```text
開発者                    GitHub Actions
  │                           │
  ├── pnpm release ──────────►│
  │   (tag v1.0.4 作成・push)  │
  │                           ├── ZIP 作成 (ec-site-arch-v1.0.4.zip)
  │                           ├── GitHub Release 作成 + ZIP 添付
  │                           ├── package.json → 1.0.5 にインクリメント
  │                           └── main にコミット [skip ci]
  │                           │
  ◄───────────────────────────┘
```

## 使い方

### リリースを実行する

```bash
pnpm release
```

このコマンドで以下が自動実行される:

1. `package.json` の現在のバージョン（例: `1.0.4`）からタグ `v1.0.4` を作成
2. タグをリモートにプッシュ
3. GitHub Actions がトリガーされ:
   - リリース ZIP を作成
   - GitHub Release を公開（リリースノート自動生成）
   - `package.json` を `1.0.5` にインクリメント

## 前提条件

- main ブランチで作業していること
- リモートリポジトリにプッシュ権限があること
- GitHub Actions が有効であること

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| "タグ v1.0.4 は既に存在します" | 同じバージョンで既にリリース済み | `package.json` のバージョンを手動で更新する |
| GitHub Release が作成されない | タグ名が `v` で始まっていない | `pnpm release` を使用する（手動タグ作成ではなく） |
| CI が無限ループする | `[skip ci]` が機能していない | コミットメッセージを確認する |

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `scripts/create-release-tag.ps1` | 新規: タグ自動作成スクリプト |
| `.github/workflows/release.yml` | 新規: リリースワークフロー |
| `package.json` | `release` スクリプト追加 |
| `scripts/README.md` | リリースフロー・ドキュメント更新 |
