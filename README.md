# PromptVault

個人用プロンプト管理Webアプリケーション。  
様々なAIツール（Claude, ChatGPT, Geminiなど）のプロンプトを一元管理・検索できます。

## 機能

- **ユーザー認証** - 登録・ログイン（JWT認証）
- **プロンプト管理** - 作成・編集・削除・一覧表示
- **検索・フィルタ** - タイトル/本文の全文検索、カテゴリ・タグ・AIツールでのフィルタリング
- **マークダウン対応** - プロンプト本文のマークダウン記法
- **クリップボードコピー** - ワンクリックでプロンプトをコピー

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| Frontend | React 18 + TypeScript, Vite, React Router v6, TanStack Query, Tailwind CSS, Axios |
| Backend | Azure Functions v4 (TypeScript), Node.js 18+ |
| 認証 | JWT (jsonwebtoken), bcryptjs |
| Database | MongoDB (Atlas/ローカル) |
| Infrastructure | Azure Static Web Apps, MongoDB Atlas, GitHub Actions |

## プロジェクト構造

```
prompt-vault/
├── frontend/                # React + TypeScript フロントエンド
│   ├── src/
│   │   ├── api/            # APIクライアント
│   │   ├── components/     # PromptCard, SearchFilter
│   │   ├── pages/          # Login, Register, Dashboard, PromptForm
│   │   └── types/          # 型定義
│   └── vite.config.ts
│
├── backend/                 # Azure Functions バックエンド
│   ├── src/
│   │   ├── functions/      # Register, Login, GetPrompts, CreatePrompt, UpdatePrompt, DeletePrompt
│   │   ├── models/         # データモデル型定義
│   │   └── utils/          # MongoDB接続, JWT認証, パスワードハッシュ
│   └── host.json
│
├── REQUIREMENTS.md          # 要求仕様書
└── CLAUDE.md                # Claude Code 開発ガイド
```

## セットアップ

### 前提条件

- Node.js 18+
- Azure Functions Core Tools v4
- MongoDB（ローカル or Atlas）

### バックエンド

```bash
cd backend
npm install
```

`backend/local.settings.json` を作成し、MongoDBの接続情報を設定：

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority",
    "MONGODB_DATABASE": "PromptVaultDB",
    "JWT_SECRET": "your-secret-key"
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
npm run dev
```

開発サーバー: `http://localhost:5173`

## API エンドポイント

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| POST | `/api/register` | ユーザー登録 | 不要 |
| POST | `/api/login` | ログイン | 不要 |
| GET | `/api/prompts` | プロンプト一覧取得 | 必要 |
| POST | `/api/prompts` | プロンプト作成 | 必要 |
| PUT | `/api/prompts/{id}` | プロンプト更新 | 必要 |
| DELETE | `/api/prompts/{id}` | プロンプト削除 | 必要 |

## ライセンス

Private
