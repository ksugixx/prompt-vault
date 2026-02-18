# 環境変数の全体像

## 全体の構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Secrets                           │
│  (リポジトリの Settings > Secrets で設定)                        │
│                                                                 │
│  ┌──────────────────────────────────┐  ┌─────────────────────┐  │
│  │ AZURE_STATIC_WEB_APPS_API_TOKEN │  │ VITE_GOOGLE_CLIENT_ │  │
│  │ → Azureデプロイ認証用            │  │ ID → ビルド時に      │  │
│  │                                  │  │ フロントに埋め込み   │  │
│  └──────────┬───────────────────────┘  └──────────┬──────────┘  │
│             │                                     │              │
│  ┌──────────┴─────────────────────────────────────┴──────────┐  │
│  │          GitHub Actions CI/CD ワークフロー                 │  │
│  │          (.github/workflows/azure-static-web-apps.yml)    │  │
│  │                                                           │  │
│  │  ビルド時:                                                │  │
│  │    env:                                                   │  │
│  │      VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_...}} │  │
│  │                                                           │  │
│  │  デプロイ時:                                              │  │
│  │    azure_static_web_apps_api_token:                       │  │
│  │      ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}       │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │ デプロイ
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Azure Static Web Apps (本番)                    │
│                                                                 │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │   フロントエンド (静的)  │  │   バックエンド (Azure Funcs)  │  │
│  │                         │  │                              │  │
│  │ ビルド時に埋め込み済み:  │  │ Azureポータルで設定:          │  │
│  │  VITE_GOOGLE_CLIENT_ID  │  │  MONGODB_URI                 │  │
│  │  VITE_API_BASE_URL      │  │  MONGODB_DATABASE            │  │
│  │  → 未設定=デフォルト     │  │  JWT_SECRET                  │  │
│  │    "/api" が使われる     │  │  GOOGLE_CLIENT_ID            │  │
│  │                         │  │  MAX_USERS                   │  │
│  └─────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 1. フロントエンド環境変数（2つ）

| 変数名 | 用途 | ローカル設定場所 | 本番での設定方法 |
|--------|------|-----------------|-----------------|
| `VITE_API_BASE_URL` | APIのベースURL | `frontend/.env.local` | **設定不要**（デフォルト `/api` が使われ、Azure SWAが自動ルーティング） |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth用クライアントID | `frontend/.env.local` | **GitHub Secrets** → ビルド時に埋め込み |

**重要ポイント:**
- `VITE_` プレフィックスの変数はViteの仕組みで**ビルド時にJSファイルに直接埋め込まれる**（実行時の環境変数ではない）
- 本番では `VITE_API_BASE_URL` は未設定 → デフォルトの `/api` が使われ、Azure SWAのAPI統合で自動的にバックエンドにルーティングされる

```
コード上の参照:
  frontend/src/api/client.ts:18   → import.meta.env.VITE_API_BASE_URL || '/api'
  frontend/src/pages/Login.tsx:60 → import.meta.env.VITE_GOOGLE_CLIENT_ID
```

## 2. バックエンド環境変数（5つ + Azure系2つ）

| 変数名 | 用途 | 必須 | デフォルト | ローカル設定場所 |
|--------|------|------|-----------|-----------------|
| `MONGODB_URI` | MongoDB接続文字列 | **必須** | なし（エラー） | `backend/local.settings.json` |
| `MONGODB_DATABASE` | DB名 | 任意 | `PromptVaultDB` | `backend/local.settings.json` |
| `JWT_SECRET` | JWTの署名キー | **必須** | なし（エラー） | `backend/local.settings.json` |
| `GOOGLE_CLIENT_ID` | Google IDトークン検証用 | **必須** | 空文字 | `backend/local.settings.json` |
| `MAX_USERS` | 最大登録ユーザー数 | 任意 | `3` | `backend/local.settings.json` |
| `FUNCTIONS_WORKER_RUNTIME` | Azure Functions ランタイム | 必須 | - | `backend/local.settings.json` |
| `AzureWebJobsStorage` | Azureストレージ接続 | 任意 | 空 | `backend/local.settings.json` |

**本番での設定方法:** Azureポータルの「構成」→「アプリケーション設定」で設定

## 3. GitHub Secrets（CI/CDで使用）

| シークレット名 | 用途 | 使用ワークフロー |
|----------------|------|-----------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azureへのデプロイ認証 | `azure-static-web-apps.yml` |
| `VITE_GOOGLE_CLIENT_ID` | フロントビルド時に埋め込み | `azure-static-web-apps.yml` |
| `GITHUB_TOKEN` | GitHub API操作（自動提供） | 両方のワークフロー |

## 4. ローカル開発 vs 本番の対応関係

```
ローカル開発                          本番環境
─────────────────                    ─────────────────
frontend/.env.local                  GitHub Secrets
  VITE_API_BASE_URL ─────────────→  設定不要（/api がデフォルト）
  VITE_GOOGLE_CLIENT_ID ─────────→  VITE_GOOGLE_CLIENT_ID (Secret)
                                       ↓ ビルド時に埋め込み

backend/local.settings.json          Azure ポータル > アプリケーション設定
  MONGODB_URI ───────────────────→  MONGODB_URI
  MONGODB_DATABASE ──────────────→  MONGODB_DATABASE
  JWT_SECRET ────────────────────→  JWT_SECRET（本番用の強い値に変更！）
  GOOGLE_CLIENT_ID ──────────────→  GOOGLE_CLIENT_ID
  MAX_USERS ─────────────────────→  MAX_USERS
```

## 5. 同じ値を共有している変数

`GOOGLE_CLIENT_ID` は**フロントとバックエンドで同じ値**を使っているが、設定場所と変数名が異なる:

```
Google OAuth Client ID (同一の値)
  │
  ├─ フロント: VITE_GOOGLE_CLIENT_ID  ← Googleログインボタンの初期化
  │    └─ ローカル: frontend/.env.local
  │    └─ 本番:    GitHub Secrets → ビルド時埋め込み
  │
  └─ バックエンド: GOOGLE_CLIENT_ID   ← IDトークンの検証
       └─ ローカル: backend/local.settings.json
       └─ 本番:    Azure アプリケーション設定
```
