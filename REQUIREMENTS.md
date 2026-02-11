# PromptVault - 要求仕様書

## プロジェクト概要
個人用のプロンプト管理Webアプリケーション。
AIツール別にプロンプトを整理・保存・検索できる。

## 目的
- 様々なAIツール（Claude, ChatGPT, Geminiなど）のプロンプトを一元管理
- カテゴリやタグで分類して効率的に検索
- 個人用として使いやすいシンプルなUI

## MVP（最小機能）スコープ

### 認証機能
- ユーザー登録（ID/Passwordのみ）
- ログイン/ログアウト
- JWT認証
- 将来的に複数ユーザー対応を想定

### プロンプト管理機能
- プロンプトの作成
  - タイトル（必須）
  - 本文（必須、マークダウン対応）
  - カテゴリ（必須、ドロップダウン選択）
  - タグ（任意、複数選択可能）
  - AIツール（任意：Claude, ChatGPT, Gemini, Other）
- プロンプトの編集
- プロンプトの削除
- プロンプト一覧表示（作成日時順）

### 検索・フィルタリング機能
- タイトル・本文での全文検索
- カテゴリフィルタ
- タグフィルタ
- AIツールフィルタ
- 複数フィルタの組み合わせ

## 技術スタック

### Frontend
- React 18+ with TypeScript
- Vite (ビルドツール)
- React Router v6 (ルーティング)
- TanStack Query / React Query (データフェッチング・状態管理)
- Tailwind CSS (スタイリング)
- Axios (HTTP クライアント)

### Backend
- Azure Functions (TypeScript)
- Node.js 18+
- JWT認証
- bcryptjs（パスワードハッシュ化）

### Database
- Azure Cosmos DB (NoSQL)
- コンテナ構成：
  - **Users**（パーティションキー: /id）
  - **Prompts**（パーティションキー: /userId）

### Infrastructure & DevOps
- Azure Static Web Apps（Frontend ホスティング）
- Azure Functions（Backend API）
- GitHub（ソースコード管理）
- GitHub Actions（CI/CD）

## データモデル

### User
```typescript
{
  id: string;           // UUID v4
  username: string;     // ユニーク、3-20文字
  passwordHash: string; // bcryptでハッシュ化
  createdAt: string;    // ISO 8601形式
}
```

### Prompt
```typescript
{
  id: string;           // UUID v4
  userId: string;       // 所有者のUser ID
  title: string;        // 1-200文字
  content: string;      // マークダウン対応、最大10,000文字
  category: string;     // 例: "コーディング", "ライティング", "分析", "翻訳", "その他"
  tags: string[];       // 例: ["Python", "デバッグ"], 最大10個
  aiTool?: string;      // 例: "Claude", "ChatGPT", "Gemini", "Other" (任意)
  createdAt: string;    // ISO 8601形式
  updatedAt: string;    // ISO 8601形式
}
```

## API仕様

### 認証エンドポイント

#### POST /api/register
ユーザー登録

**リクエスト:**
```json
{
  "username": "user123",
  "password": "securePassword123"
}
```

**レスポンス（成功 201）:**
```json
{
  "message": "User registered successfully",
  "userId": "uuid-here"
}
```

**エラー（400）:**
```json
{
  "error": "Username already exists"
}
```

#### POST /api/login
ログイン

**リクエスト:**
```json
{
  "username": "user123",
  "password": "securePassword123"
}
```

**レスポンス（成功 200）:**
```json
{
  "token": "jwt-token-here",
  "userId": "uuid-here",
  "username": "user123"
}
```

**エラー（401）:**
```json
{
  "error": "Invalid credentials"
}
```

### プロンプト管理エンドポイント（要JWT認証）

#### GET /api/prompts
プロンプト一覧取得

**クエリパラメータ:**
- `search`: 全文検索キーワード（任意）
- `category`: カテゴリフィルタ（任意）
- `tag`: タグフィルタ（任意）
- `aiTool`: AIツールフィルタ（任意）

**リクエストヘッダー:**
```
Authorization: Bearer <jwt-token>
```

**レスポンス（200）:**
```json
{
  "prompts": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "title": "Python デバッグ用プロンプト",
      "content": "# デバッグ手順...",
      "category": "コーディング",
      "tags": ["Python", "デバッグ"],
      "aiTool": "Claude",
      "createdAt": "2026-02-11T00:00:00Z",
      "updatedAt": "2026-02-11T00:00:00Z"
    }
  ]
}
```

#### POST /api/prompts
プロンプト作成

**リクエストヘッダー:**
```
Authorization: Bearer <jwt-token>
```

**リクエスト:**
```json
{
  "title": "新しいプロンプト",
  "content": "プロンプトの内容...",
  "category": "ライティング",
  "tags": ["ブログ", "SEO"],
  "aiTool": "ChatGPT"
}
```

**レスポンス（201）:**
```json
{
  "id": "new-uuid",
  "message": "Prompt created successfully"
}
```

#### PUT /api/prompts/{id}
プロンプト更新

**リクエストヘッダー:**
```
Authorization: Bearer <jwt-token>
```

**リクエスト:**
```json
{
  "title": "更新されたタイトル",
  "content": "更新された内容...",
  "category": "分析",
  "tags": ["データ分析"],
  "aiTool": "Claude"
}
```

**レスポンス（200）:**
```json
{
  "message": "Prompt updated successfully"
}
```

**エラー（404）:**
```json
{
  "error": "Prompt not found"
}
```

#### DELETE /api/prompts/{id}
プロンプト削除

**リクエストヘッダー:**
```
Authorization: Bearer <jwt-token>
```

**レスポンス（200）:**
```json
{
  "message": "Prompt deleted successfully"
}
```

## UI/UX要件

### デザイン方針
- モダンでシンプル
- 直感的な操作性
- レスポンシブ対応（デスクトップ・タブレット・モバイル）
- ダークモード対応は後回し（将来的に対応）

### ページ構成

#### 1. ログインページ (/login)
- ユーザー名入力フィールド
- パスワード入力フィールド
- ログインボタン
- 「アカウント作成」へのリンク

#### 2. ユーザー登録ページ (/register)
- ユーザー名入力フィールド（バリデーション表示）
- パスワード入力フィールド（強度表示）
- 登録ボタン
- 「ログインへ戻る」リンク

#### 3. ダッシュボード (/dashboard)
- ヘッダー
  - アプリ名
  - ログアウトボタン
  - ユーザー名表示
- 検索バー
- フィルタUI
  - カテゴリドロップダウン
  - タグ選択（マルチセレクト）
  - AIツール選択
  - フィルタクリアボタン
- プロンプト一覧（カードレイアウト）
  - タイトル
  - カテゴリバッジ
  - タグバッジ
  - 作成日時
  - 編集・削除ボタン
  - コピーボタン
- 新規作成ボタン（フローティングボタン）

#### 4. プロンプト作成/編集ページ (/prompts/new, /prompts/:id/edit)
- タイトル入力
- 本文入力（マークダウンエディタ、プレビュー機能）
- カテゴリ選択（ドロップダウン）
- タグ入力（入力補完、既存タグ提案）
- AIツール選択（任意）
- 保存ボタン
- キャンセルボタン

### インタラクション
- プロンプトカードをクリック → 詳細モーダル表示
- コピーボタンをクリック → プロンプト本文をクリップボードにコピー＋トースト通知
- タグバッジをクリック → そのタグでフィルタリング
- カテゴリバッジをクリック → そのカテゴリでフィルタリング

## 非機能要件

### パフォーマンス
- ページロード時間: 3秒以内
- API レスポンス時間: 500ms以内

### セキュリティ
- パスワードはbcryptでハッシュ化（ソルトラウンド: 10）
- JWT有効期限: 24時間
- HTTPS通信（本番環境）
- CORS設定（本番環境では特定ドメインのみ許可）

### 可用性
- ローカル開発環境で動作すること
- Azureへのデプロイが可能なこと
- GitHub Actionsで自動デプロイできること

## 制約事項・除外項目

### MVPでは以下は対象外：
- プロンプトの公開共有機能
- プロンプトのバージョン履歴
- チーム機能・コラボレーション
- 高度な検索（正規表現、全文検索エンジン）
- プロンプトのインポート/エクスポート（CSV/JSON）
- AIツールへの直接実行機能
- プロンプトのお気に入り/スター機能
- プロンプトのフォルダ階層管理
- ダークモード

### 将来的な拡張候補：
- 上記除外項目の段階的実装
- プロンプトテンプレート機能（変数置換）
- プロンプト実行履歴
- AIツールごとの最適化提案

## 開発フロー

### Phase 1: バックエンド実装
1. 型定義（models/types.ts）
2. Cosmos DB接続（utils/cosmos.ts）
3. 認証ユーティリティ（utils/auth.ts, utils/password.ts）
4. 認証API（Register, Login）
5. プロンプトCRUD API（GetPrompts, CreatePrompt, UpdatePrompt, DeletePrompt）
6. ローカルテスト（func start）

### Phase 2: フロントエンド実装
1. API クライアント（api/client.ts）
2. 認証ページ（Login, Register）
3. プロンプト一覧ページ（Dashboard）
4. プロンプト作成/編集ページ（PromptForm）
5. 共通コンポーネント（PromptCard, Header, Filterなど）
6. ルーティング設定（App.tsx）
7. ローカルテスト（npm run dev）

### Phase 3: 統合テスト
1. フロントエンド + バックエンド連携確認
2. エンドツーエンドテスト

### Phase 4: デプロイ
1. Azure Static Web Apps設定
2. Azure Functions設定
3. 環境変数設定
4. GitHub Actions CI/CD設定
5. 本番デプロイ

## 開発環境

### 必須ツール
- Node.js 18+
- npm
- Git
- Azure CLI
- Azure Functions Core Tools
- Claude Code

### 推奨エディタ
- VS Code
  - 拡張機能: ESLint, Prettier, Tailwind CSS IntelliSense

## カテゴリ一覧（プリセット）
- コーディング
- ライティング
- 分析
- 翻訳
- 要約
- アイデア出し
- その他

## タグ例（ユーザーが自由に追加可能）
- Python, JavaScript, TypeScript
- デバッグ, リファクタリング
- ブログ, SEO, マーケティング
- データ分析, 統計
- 英語, 日本語
- ビジネス, 技術

---

## 補足
- 本仕様書はMVPの要件を定義しています
- 実装中に仕様変更が必要な場合は、本ドキュメントを更新してください
- 質問や不明点があれば、随時確認してください
