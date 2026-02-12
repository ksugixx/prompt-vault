# CI/CD・デプロイ構成ガイド

## アーキテクチャ概要

```
GitHub (main branch)
  │
  │  push / PR
  ▼
GitHub Actions
  │
  │  ビルド & デプロイ
  ▼
Azure Static Web Apps
  ├── Frontend (React SPA)    … /
  ├── Managed Functions (API)  … /api/*
  │
  ▼
MongoDB Atlas (Database)
```

## デプロイフロー

### 自動デプロイ（通常運用）

`main` ブランチへの push または PR で GitHub Actions が自動実行される。

```
コード変更 → git push → GitHub Actions → Azure Static Web Apps
```

### ワークフローの処理内容

1. **チェックアウト** - リポジトリのコードを取得
2. **Node.js セットアップ** - Node.js 20 を準備
3. **バックエンドビルド** - `backend/` で `npm ci` → `npm run build`（TypeScript → JavaScript）
4. **フロントエンド依存関係インストール** - `frontend/` で `npm ci`
5. **ビルド & デプロイ** - Azure Static Web Apps Action がフロントエンドのビルドとデプロイを実行

### PR 環境

PR を作成すると、ステージング環境が自動生成される。PR をクローズすると自動で削除される。

## 設定ファイル

### GitHub Actions ワークフロー

**ファイル:** `.github/workflows/azure-static-web-apps.yml`

| 設定 | 値 | 説明 |
|------|-----|------|
| `app_location` | `frontend` | フロントエンドのソースディレクトリ |
| `api_location` | `backend` | バックエンド（Azure Functions）のディレクトリ |
| `output_location` | `dist` | フロントエンドのビルド出力ディレクトリ |

### Static Web Apps 設定

**ファイル:** `frontend/staticwebapp.config.json`

| 設定 | 目的 |
|------|------|
| `navigationFallback` | SPA ルーティング。`/api/*` と `/assets/*` 以外は `index.html` にフォールバック |
| `routes` | `/api/*` は認証不要（`anonymous`）でアクセス可能 |
| `globalHeaders` | セキュリティヘッダー（`X-Content-Type-Options`, `X-Frame-Options`） |
| `forwardingGateway` | ホスト転送の許可設定 |

### Functions 除外設定

**ファイル:** `backend/.funcignore`

デプロイパッケージから除外されるファイル（TypeScript ソース、ローカル設定など）。

## GitHub Secrets

| シークレット名 | 用途 |
|---------------|------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure Static Web Apps のデプロイトークン |

**取得方法:** Azure Portal > Static Web Apps > 概要 > デプロイ トークンの管理

## Azure アプリケーション設定（環境変数）

Azure Portal > Static Web Apps > 構成 > アプリケーション設定 で管理。

| 設定名 | 説明 |
|--------|------|
| `MONGODB_URI` | MongoDB Atlas の接続文字列 |
| `MONGODB_DATABASE` | データベース名（`PromptVaultDB`） |
| `JWT_SECRET` | JWT トークン署名用の秘密鍵 |

## 注意事項

### Authorization ヘッダーの制約

Azure Static Web Apps の Managed Functions では、`Authorization` ヘッダーが内部認証機構に消費されるため、API に到達しない。
本プロジェクトでは `X-Authorization` カスタムヘッダーを使用して回避している。

- **フロントエンド** (`frontend/src/api/client.ts`): `X-Authorization: Bearer <token>` を送信
- **バックエンド** (`backend/src/utils/auth.ts`): `X-Authorization` を優先、`Authorization` をフォールバックで受け付け

### CORS

Managed Functions では CORS は Azure Static Web Apps が自動処理するため、`local.settings.json` の CORS 設定は本番環境には影響しない。

### MongoDB Atlas の IP 許可

Azure Static Web Apps のアウトバウンド IP は固定されないため、MongoDB Atlas の Network Access で `0.0.0.0/0`（全 IP 許可）を設定するか、Azure の VNet 統合を利用する。

## 本番 URL

| 種別 | URL |
|------|-----|
| フロントエンド | `https://nice-ocean-0a4bcbe00.1.azurestaticapps.net/` |
| API | `https://nice-ocean-0a4bcbe00.1.azurestaticapps.net/api/*` |

## トラブルシューティング

### デプロイが失敗する場合

1. GitHub Actions のログを確認: `gh run list` → `gh run view <run-id> --log-failed`
2. `AZURE_STATIC_WEB_APPS_API_TOKEN` が正しく設定されているか確認
3. `npm run build` がローカルで成功するか確認

### API が 401 を返す場合

1. Azure のアプリケーション設定に `JWT_SECRET` が登録されているか確認
2. フロントエンドが `X-Authorization` ヘッダーを送信しているか確認（DevTools の Network タブ）

### API が 500 を返す場合

1. Azure のアプリケーション設定に `MONGODB_URI` と `MONGODB_DATABASE` が登録されているか確認
2. MongoDB Atlas の IP 許可設定を確認
3. Azure Portal > Static Web Apps > Functions > ログ でエラー詳細を確認
