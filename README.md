# PromptVault

個人用プロンプト管理Webアプリケーション。
様々なAIツール（Claude, ChatGPT, Geminiなど）のプロンプトを一元管理・検索できます。

## 機能

- **Google OAuth認証** - Googleアカウントでログイン（自動登録、ユーザー数上限制御）
- **プロンプト管理** - 作成・編集・削除・一覧表示・ピン留め
- **検索・フィルタ** - タイトル/本文の全文検索、カテゴリ・タグ・AIツールでのフィルタリング
- **ソート** - 作成日時・更新日時・タイトル順（昇順/降順）
- **マークダウン対応** - プロンプト本文のマークダウン記法・プレビュー表示
- **クリップボードコピー** - ワンクリックでプロンプトをコピー
- **インポート/エクスポート** - JSON形式でプロンプトの一括インポート・エクスポート
- **ダークモード** - ライト/ダークテーマの切り替え

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| Frontend | React 19 + TypeScript, Vite 7, React Router v7, TanStack Query v5, Tailwind CSS v4, Axios |
| Backend | Azure Functions v4 (TypeScript), Node.js 18+ |
| 認証 | Google OAuth (google-auth-library) + JWT (jsonwebtoken) |
| Database | MongoDB (Atlas) |
| テスト | Vitest, Playwright, Allure レポート |
| Infrastructure | Azure Static Web Apps, MongoDB Atlas, GitHub Actions CI/CD |

## プロジェクト構造

```
prompt-vault/
├── frontend/                # React + TypeScript フロントエンド
│   ├── src/
│   │   ├── api/            # APIクライアント (Axios)
│   │   ├── components/     # PromptCard, SearchFilter, ImportModal, PromptDetailModal, ThemeToggle
│   │   ├── pages/          # Login, Dashboard, PromptForm
│   │   ├── types/          # TypeScript型定義
│   │   ├── utils/          # ユーティリティ関数
│   │   ├── App.tsx         # ルーティング設定
│   │   └── main.tsx        # エントリポイント
│   ├── staticwebapp.config.json  # Azure Static Web Apps設定
│   └── vite.config.ts
│
├── backend/                 # Azure Functions バックエンド
│   ├── src/
│   │   ├── functions/      # GoogleAuth, GetPrompts, CreatePrompt, UpdatePrompt, DeletePrompt, ImportPrompts
│   │   ├── models/         # データモデル・型定義
│   │   └── utils/          # MongoDB接続, JWT認証, Google OAuth検証
│   ├── host.json
│   └── package.json
│
├── e2e/                     # E2Eテスト (Playwright)
│   ├── tests/              # テストスペック
│   ├── fixtures/           # テストフィクスチャ
│   ├── pages/              # ページオブジェクトモデル
│   └── helpers/            # モックデータ・ヘルパー
│
├── .github/workflows/      # GitHub Actions CI/CD
│   ├── azure-static-web-apps.yml  # ビルド・デプロイ
│   └── e2e-tests.yml              # E2Eテスト・Allureレポート
│
├── .claude/                # Claude Code設定・ルール
│   └── rules.md            # コーディング規約・コミット規約
├── playwright.config.ts    # Playwright設定
├── REQUIREMENTS.md         # 要求仕様書
└── CLAUDE.md               # Claude Code 開発ガイド
```

## セットアップ

### 前提条件

- Node.js 18+
- Azure Functions Core Tools v4
- MongoDB Atlas アカウント
- Google Cloud Console プロジェクト（OAuth 2.0 クライアントID）

### バックエンド

```bash
cd backend
npm install
```

`backend/local.settings.json` を作成し、接続情報を設定：

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "MONGODB_URI": "mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority",
    "MONGODB_DATABASE": "PromptVaultDB",
    "JWT_SECRET": "your-secret-key",
    "GOOGLE_CLIENT_ID": "your-google-client-id.apps.googleusercontent.com",
    "MAX_USERS": "3"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

起動：

```bash
npm start
```

APIエンドポイント: `http://localhost:7071/api/`

### フロントエンド

```bash
cd frontend
npm install
```

`frontend/.env.local` を作成：

```
VITE_API_BASE_URL=http://localhost:7071/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

起動：

```bash
npm run dev
```

開発サーバー: `http://localhost:5173`

### テスト

```bash
# バックエンド ユニットテスト
cd backend && npm test

# フロントエンド ユニットテスト
cd frontend && npm test

# フロントエンド リント
cd frontend && npm run lint

# E2Eテスト（プロジェクトルート）
npx playwright test
```

## API エンドポイント

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| POST | `/api/auth/google` | Google OAuth認証（自動登録） | 不要 |
| GET | `/api/prompts` | プロンプト一覧取得（検索・フィルタ・ソート対応） | 必要 |
| POST | `/api/prompts` | プロンプト作成 | 必要 |
| PUT | `/api/prompts/{id}` | プロンプト更新 | 必要 |
| DELETE | `/api/prompts/{id}` | プロンプト削除 | 必要 |
| POST | `/api/prompts/import` | プロンプト一括インポート（最大100件） | 必要 |

認証が必要なエンドポイントには `X-Authorization: Bearer <token>` ヘッダーを付与してください。

## ライセンス

Private
