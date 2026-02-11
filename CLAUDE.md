# CLAUDE.md - Claude Code 開発ガイド

このファイルは、Claude Codeがこのプロジェクトを効率的に理解し、実装するためのガイドです。

## プロジェクト概要

**プロジェクト名:** PromptVault  
**目的:** 個人用プロンプト管理Webアプリケーション  
**詳細仕様:** REQUIREMENTS.md を参照

## プロジェクト構造

```
prompt-vault/
├── frontend/              # React + TypeScript フロントエンド
│   ├── src/
│   │   ├── api/          # API通信クライアント
│   │   ├── components/   # 再利用可能なコンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── types/        # TypeScript型定義
│   │   ├── utils/        # ユーティリティ関数
│   │   ├── App.tsx       # ルーティング設定
│   │   └── main.tsx      # エントリポイント
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── backend/               # Azure Functions バックエンド
│   ├── src/
│   │   ├── functions/    # Azure Functions (API エンドポイント)
│   │   │   ├── Register/
│   │   │   ├── Login/
│   │   │   ├── GetPrompts/
│   │   │   ├── CreatePrompt/
│   │   │   ├── UpdatePrompt/
│   │   │   └── DeletePrompt/
│   │   ├── models/       # データモデル・型定義
│   │   └── utils/        # ユーティリティ（DB接続、認証など）
│   ├── host.json
│   ├── local.settings.json  # ローカル環境変数（gitignore対象）
│   └── package.json
│
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
│
├── REQUIREMENTS.md       # 要求仕様書
├── CLAUDE.md             # このファイル
└── README.md
```

## 実装の優先順位

### Phase 1: バックエンド基盤（最優先）
1. **型定義** - `backend/src/models/types.ts`
2. **MongoDB接続** - `backend/src/utils/mongodb.ts`
3. **認証ユーティリティ** - `backend/src/utils/auth.ts`, `backend/src/utils/password.ts`

### Phase 2: 認証API
4. **ユーザー登録** - `backend/src/functions/Register/index.ts`
5. **ログイン** - `backend/src/functions/Login/index.ts`

### Phase 3: プロンプトCRUD API
6. **プロンプト取得** - `backend/src/functions/GetPrompts/index.ts`
7. **プロンプト作成** - `backend/src/functions/CreatePrompt/index.ts`
8. **プロンプト更新** - `backend/src/functions/UpdatePrompt/index.ts`
9. **プロンプト削除** - `backend/src/functions/DeletePrompt/index.ts`

### Phase 4: フロントエンド基盤
10. **APIクライアント** - `frontend/src/api/client.ts`
11. **型定義** - `frontend/src/types/index.ts`

### Phase 5: 認証UI
12. **ログインページ** - `frontend/src/pages/Login.tsx`
13. **登録ページ** - `frontend/src/pages/Register.tsx`

### Phase 6: プロンプト管理UI
14. **ダッシュボード** - `frontend/src/pages/Dashboard.tsx`
15. **プロンプトフォーム** - `frontend/src/pages/PromptForm.tsx`
16. **プロンプトカード** - `frontend/src/components/PromptCard.tsx`
17. **検索・フィルタ** - `frontend/src/components/SearchFilter.tsx`

### Phase 7: ルーティング・統合
18. **ルーティング** - `frontend/src/App.tsx`
19. **統合テスト**

## コーディング規約

### TypeScript
- **厳格な型付け**: `any` の使用を避ける
- **インターフェースファースト**: 型定義を先に作成
- **明示的な戻り値**: 関数の戻り値の型を明記

### 命名規則
- **ファイル名**: PascalCase (コンポーネント), camelCase (ユーティリティ)
- **変数・関数**: camelCase
- **コンポーネント**: PascalCase
- **定数**: UPPER_SNAKE_CASE
- **型・インターフェース**: PascalCase

### React
- **関数コンポーネント**: アロー関数で定義
- **Hooks**: 必要最小限で使用
- **Props**: インターフェースで型定義

### エラーハンドリング
- **API**: try-catchで適切にエラーをキャッチ
- **フロントエンド**: エラーメッセージをユーザーフレンドリーに表示
- **バックエンド**: 適切なHTTPステータスコードを返す

## 環境変数

### Backend (`local.settings.json`)
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "MONGODB_URI": "mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority",
    "MONGODB_DATABASE": "PromptVaultDB",
    "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

### Frontend (`.env.local`)
```
VITE_API_BASE_URL=http://localhost:7071/api
```

## 重要な実装ポイント

### 認証フロー
1. ユーザーがログイン → バックエンドがJWTトークンを発行
2. フロントエンドがトークンを `localStorage` に保存
3. 以降のAPIリクエストで `Authorization: Bearer <token>` ヘッダーを付与
4. バックエンドがトークンを検証 → userIdを取得 → リクエスト処理

### MongoDB インデックス設計
- **Users**: `{ username: 1 }` unique - ユーザー名の一意性保証・検索用
- **Prompts**: `{ userId: 1, createdAt: -1 }` - ユーザーごとの一覧取得用
- **Prompts**: `{ id: 1, userId: 1 }` - 更新・削除の所有権チェック用

### CORS設定
- **開発環境**: すべてのオリジンを許可 (*)
- **本番環境**: 特定ドメインのみ許可

## テスト方法

### バックエンドのローカルテスト
```bash
cd backend
npm install
func start
```

APIエンドポイント: `http://localhost:7071/api/*`

### フロントエンドのローカルテスト
```bash
cd frontend
npm install
npm run dev
```

開発サーバー: `http://localhost:5173`

### 手動APIテスト（例: curl）
```bash
# ユーザー登録
curl -X POST http://localhost:7071/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test1234"}'

# ログイン
curl -X POST http://localhost:7071/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test1234"}'

# プロンプト取得（要JWT）
curl http://localhost:7071/api/prompts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## デバッグのヒント

### よくあるエラーと解決方法

#### 1. MongoDB接続エラー
- `local.settings.json` の `MONGODB_URI` を確認
- MongoDB Atlasのダッシュボードで接続文字列・IPホワイトリストを再確認

#### 2. CORS エラー
- `local.settings.json` の `Host.CORS` 設定を確認
- フロントエンドのリクエストURLを確認

#### 3. JWT認証エラー
- トークンの有効期限を確認
- `JWT_SECRET` がフロントエンド・バックエンドで一致しているか確認

#### 4. Azure Functions が起動しない
- `func --version` で Azure Functions Core Tools がインストールされているか確認
- `package.json` の依存関係を再インストール

## Git コミットメッセージ規約

```
<type>: <subject>

<body>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更（機能に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・補助ツールの変更

**例:**
```
feat: ユーザー登録APIの実装

- Register関数の作成
- パスワードハッシュ化
- ユーザー重複チェック
```

## Claude Codeへの依頼例

### 良い依頼例 ✅
```
backend/src/models/types.tsを作成して、
REQUIREMENTS.mdに記載されているUser、Prompt、AuthTokenの型定義を実装してください。

各型には適切なコメントも追加してください。
```

### 悪い依頼例 ❌
```
バックエンドを作って
```

→ 具体性が不足。何をどのように実装するか不明確。

### 段階的な依頼の例 ✅
```
バックエンドの認証機能を実装します。以下の順序で進めてください：

1. backend/src/utils/password.ts - パスワードハッシュ化・検証関数
2. backend/src/utils/auth.ts - JWT生成・検証関数
3. backend/src/functions/Register/index.ts - ユーザー登録API
4. backend/src/functions/Login/index.ts - ログインAPI

各ファイルには適切なエラーハンドリングとバリデーションを含めてください。
```

## 注意事項

### セキュリティ
- **パスワードは平文で保存しない** - 必ず bcrypt でハッシュ化
- **JWT_SECRET は環境変数で管理** - ハードコードしない
- **本番環境では HTTPS を使用**
- **入力値の検証を徹底** - SQLインジェクション、XSS対策

### パフォーマンス
- **MongoDBクエリの最適化** - インデックスを活用
- **不要な re-render を避ける** - React.memo や useMemo を適切に使用
- **画像・アセットの最適化**

### コスト管理
- **MongoDB Atlas** - 開発中は無料枠（M0）を活用
- **Azure Functions** - 不要な関数は削除
- **ログレベル** - 本番環境では `INFO` 以上

## 参考リンク

- https://learn.microsoft.com/azure/azure-functions/functions-reference-node
- https://www.mongodb.com/docs/drivers/node/current/
- https://reactrouter.com/
- https://tanstack.com/query/latest
- https://tailwindcss.com/


