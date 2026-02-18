# PromptVault - 要求仕様書

## プロジェクト概要
個人用のプロンプト管理Webアプリケーション。
AIツール別にプロンプトを整理・保存・検索できる。

## 目的
- 様々なAIツール（Claude, ChatGPT, Geminiなど）のプロンプトを一元管理
- カテゴリやタグで分類して効率的に検索
- 個人用として使いやすいシンプルなUI

## 実装済みスコープ

### 認証機能
- Google OAuth認証（Google Sign-In）
- 初回ログイン時に自動ユーザー登録
- MAX_USERS環境変数による登録ユーザー数制限
- JWT認証によるセッション管理
- ログアウト機能

### プロンプト管理機能
- プロンプトの作成
  - タイトル（必須、1-200文字）
  - 本文（必須、マークダウン対応、最大10,000文字）
  - 説明（任意、最大200文字、カード表示用）
  - カテゴリ（必須、ドロップダウン選択）
  - タグ（任意、複数選択可能、最大10個）
  - AIツール（任意：Claude, ChatGPT, Gemini, Other）
- プロンプトの編集
- プロンプトの削除
- プロンプト一覧表示（ソート対応）
- プロンプトのピン留め

### 検索・フィルタリング機能
- タイトル・本文での全文検索
- カテゴリフィルタ
- タグフィルタ
- AIツールフィルタ
- 複数フィルタの組み合わせ
- ソート機能（作成日時/更新日時/タイトル、昇順/降順）

### インポート/エクスポート機能
- JSON形式でのプロンプト一括エクスポート（ファイルダウンロード）
- JSON形式でのプロンプト一括インポート（最大100件）

### ダークモード
- ライト/ダークテーマの切り替え（Tailwind CSS `dark:` クラス活用）

## 技術スタック

### Frontend
- React 19 + TypeScript
- Vite 7（ビルドツール）
- React Router v7（ルーティング）
- TanStack Query v5（データフェッチング・状態管理）
- Tailwind CSS v4（スタイリング）
- Axios（HTTPクライアント）
- react-markdown（マークダウンレンダリング）

### Backend
- Azure Functions v4（TypeScript）
- Node.js 18+
- google-auth-library（Google IDトークン検証）
- jsonwebtoken（JWT認証）
- MongoDB Driver v6

### Database
- MongoDB Atlas
- コレクション構成：
  - **users** - ユーザー情報
  - **prompts** - プロンプトデータ

### テスト
- Vitest（ユニットテスト、フロントエンド・バックエンド共通）
- Playwright（E2Eテスト、Chromium）
- Allure（テストレポート生成）
- Testing Library（コンポーネントテスト）

## Infrastructure & DevOps
- Azure Static Web Apps（Frontend ホスティング + API プロキシ）
- Azure Functions（Backend API）
- MongoDB Atlas（本番DB）
- GitHub（ソースコード管理）
- GitHub Actions（CI/CD）
  - ビルド・テスト・デプロイパイプライン
  - E2Eテスト + Allureレポート（GitHub Pages）

## データモデル

### User
```typescript
{
  id: string;              // UUID v4
  googleId: string;        // Google IDトークンの sub claim（ユニーク）
  email: string;           // Googleアカウントのメールアドレス
  displayName: string;     // Googleプロフィール名
  pictureUrl?: string;     // Googleプロフィール画像URL
  createdAt: string;       // ISO 8601形式
}
```

### Prompt
```typescript
{
  id: string;              // UUID v4
  userId: string;          // 所有者のUser ID
  title: string;           // 1-200文字
  content: string;         // マークダウン対応、最大10,000文字
  description?: string;    // 最大200文字（カード表示用）
  category: string;        // 例: "コーディング", "ライティング", "分析", "翻訳", "その他"
  tags: string[];          // 例: ["Python", "デバッグ"], 最大10個
  aiTool?: string;         // "Claude" | "ChatGPT" | "Gemini" | "Other"（任意）
  isPinned?: boolean;      // ピン留め状態
  createdAt: string;       // ISO 8601形式
  updatedAt: string;       // ISO 8601形式
}
```

## API仕様

### 認証エンドポイント

#### POST /api/auth/google
Google OAuth認証（自動登録）

**リクエスト:**
```json
{
  "idToken": "google-id-token-here"
}
```

**レスポンス（成功 200）:**
```json
{
  "token": "jwt-token-here",
  "userId": "uuid-v4-here",
  "displayName": "ユーザー名",
  "email": "user@example.com",
  "pictureUrl": "https://..."
}
```

**エラー（401）:**
```json
{
  "error": "Invalid Google ID token"
}
```

**エラー（403）:**
```json
{
  "error": "Maximum number of users reached"
}
```

### プロンプト管理エンドポイント（要JWT認証）

認証ヘッダー:
```
X-Authorization: Bearer <jwt-token>
```

#### GET /api/prompts
プロンプト一覧取得

**クエリパラメータ:**
- `search`: 全文検索キーワード（任意）
- `category`: カテゴリフィルタ（任意）
- `tag`: タグフィルタ（任意）
- `aiTool`: AIツールフィルタ（任意）
- `sortBy`: ソートキー - `createdAt` | `updatedAt` | `title`（任意、デフォルト: `createdAt`）
- `sortOrder`: ソート順 - `asc` | `desc`（任意、デフォルト: `desc`）

**レスポンス（200）:**
```json
{
  "prompts": [
    {
      "id": "uuid-v4",
      "userId": "user-uuid",
      "title": "Python デバッグ用プロンプト",
      "content": "# デバッグ手順...",
      "description": "Pythonのデバッグに便利なプロンプト",
      "category": "コーディング",
      "tags": ["Python", "デバッグ"],
      "aiTool": "Claude",
      "isPinned": false,
      "createdAt": "2026-02-11T00:00:00Z",
      "updatedAt": "2026-02-11T00:00:00Z"
    }
  ]
}
```

#### POST /api/prompts
プロンプト作成

**リクエスト:**
```json
{
  "title": "新しいプロンプト",
  "content": "プロンプトの内容...",
  "description": "カード表示用の説明",
  "category": "ライティング",
  "tags": ["ブログ", "SEO"],
  "aiTool": "ChatGPT"
}
```

**レスポンス（201）:**
```json
{
  "id": "new-uuid-v4",
  "message": "Prompt created successfully"
}
```

#### PUT /api/prompts/{id}
プロンプト更新

**リクエスト:**
```json
{
  "title": "更新されたタイトル",
  "content": "更新された内容...",
  "description": "更新された説明",
  "category": "分析",
  "tags": ["データ分析"],
  "aiTool": "Claude",
  "isPinned": true
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

**レスポンス（200）:**
```json
{
  "message": "Prompt deleted successfully"
}
```

#### POST /api/prompts/import
プロンプト一括インポート

**リクエスト:**
```json
{
  "prompts": [
    {
      "title": "インポートするプロンプト",
      "content": "内容...",
      "category": "コーディング",
      "tags": ["Python"],
      "aiTool": "Claude"
    }
  ]
}
```

**レスポンス（201）:**
```json
{
  "message": "Prompts imported successfully",
  "count": 1
}
```

## UI/UX要件

### デザイン方針
- モダンでシンプル
- 直感的な操作性
- レスポンシブ対応（デスクトップ・タブレット・モバイル）
- ダークモード対応（実装済み）

### ページ構成

#### 1. ログインページ (/login)
- Google Sign-Inボタン
- アプリ説明テキスト

#### 2. ダッシュボード (/dashboard)
- ヘッダー
  - アプリ名
  - ダークモード切り替えボタン
  - ユーザー情報表示（Googleプロフィール画像・名前）
  - ログアウトボタン
- 検索バー
- フィルタUI
  - カテゴリドロップダウン
  - タグ選択（マルチセレクト）
  - AIツール選択
  - ソート設定
  - フィルタクリアボタン
- プロンプト一覧（カードレイアウト）
  - タイトル
  - 説明テキスト
  - カテゴリバッジ
  - タグバッジ
  - 作成日時
  - ピン留めボタン
  - 編集・削除ボタン
  - コピーボタン
- 新規作成ボタン
- インポート/エクスポートボタン

#### 3. プロンプト作成/編集（モーダル）
- タイトル入力
- 説明入力
- 本文入力（マークダウンエディタ）
- カテゴリ選択（ドロップダウン）
- タグ入力（入力補完、既存タグ提案）
- AIツール選択（任意）
- 保存ボタン
- キャンセルボタン

#### 4. プロンプト詳細（モーダル）
- マークダウンレンダリングされた本文表示
- メタ情報（カテゴリ・タグ・AIツール・作成日時）
- コピーボタン
- 編集ボタン

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
- Google IDトークンはバックエンドで `google-auth-library` を使用して検証
- JWT有効期限: 24時間
- HTTPS通信（本番環境）
- CORS設定（本番環境では特定ドメインのみ許可）
- JWT_SECRET, GOOGLE_CLIENT_ID は環境変数で管理
- X-Content-Type-Options: nosniff, X-Frame-Options: DENY ヘッダー設定

### 可用性
- ローカル開発環境で動作すること
- Azureへのデプロイが可能なこと
- GitHub Actionsで自動デプロイできること

## 将来的な拡張候補

- プロンプトの公開共有機能
- プロンプトのバージョン履歴
- チーム機能・コラボレーション
- 高度な検索（正規表現、全文検索エンジン）
- AIツールへの直接実行機能
- プロンプトのお気に入り/スター機能
- プロンプトのフォルダ階層管理
- プロンプトテンプレート機能（変数置換）
- プロンプト実行履歴
- AIツールごとの最適化提案

## 開発環境

### 必須ツール
- Node.js 18+
- npm
- Git
- Azure CLI
- Azure Functions Core Tools v4
- MongoDB Atlas アカウント
- Google Cloud Console プロジェクト（OAuth クライアントID）

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
