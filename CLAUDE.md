# CLAUDE.md - Claude Code 開発ガイド

このファイルは、Claude Codeがこのプロジェクトを効率的に理解し、実装するためのガイドです。
コーディング規約・コミット規約・セキュリティ/パフォーマンス注意事項は `.claude/rules.md` を参照。

## 開発ワークフロー（必須）

Claude Codeは以下のフローを必ず守ること。mainブランチへの直接コミットは禁止。

### フロー

1. **計画**: 仕様を検討し、実装計画を立てる
2. **ブランチ作成**: `git checkout -b feature/xxx` でfeatureブランチを作成
3. **実装**: featureブランチ上で作業する
4. **ローカルテスト**: 実装後、以下を実行して確認
   - フロントエンド: `cd frontend && npm run build && npm run lint`
   - バックエンド: `cd backend && npm run build`
5. **コミット & push**: `git add <files> && git commit` → `git push -u origin feature/xxx`
6. **PR作成**: `gh pr create` でプルリクエストを作成
7. **レビュー待ち**: 人間がレビュー＆テスト → 承認 → マージ

### ブランチ命名規則

- 新機能: `feature/xxx`（例: `feature/add-login-page`）
- バグ修正: `fix/xxx`（例: `fix/auth-token-expiry`）
- リファクタ: `refactor/xxx`（例: `refactor/api-client`）
- ドキュメント: `docs/xxx`（例: `docs/update-readme`）

## プロジェクト概要

**プロジェクト名:** PromptVault
**目的:** 個人用プロンプト管理Webアプリケーション
**詳細仕様:** REQUIREMENTS.md を参照

**技術スタック:**
- Frontend: React + TypeScript, Vite, React Router, TanStack Query, Tailwind CSS
- Backend: Azure Functions (TypeScript), MongoDB Atlas, JWT認証
- Infra: Azure Static Web Apps, GitHub Actions CI/CD

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
│   └── vite.config.ts
│
├── backend/               # Azure Functions バックエンド
│   ├── src/
│   │   ├── functions/    # Azure Functions (API エンドポイント)
│   │   ├── models/       # データモデル・型定義
│   │   └── utils/        # ユーティリティ（MongoDB接続、認証など）
│   ├── host.json
│   └── package.json
│
├── .github/workflows/    # GitHub Actions CI/CD
├── .claude/              # Claude Code設定・ルール
│   └── rules.md          # コーディング規約・コミット規約
├── REQUIREMENTS.md       # 要求仕様書
└── CLAUDE.md             # このファイル
```

## 重要な実装ポイント

### 認証フロー
1. ユーザーがログイン → バックエンドがJWTトークンを発行
2. フロントエンドがトークンを `localStorage` に保存
3. 以降のAPIリクエストで `Authorization: Bearer <token>` ヘッダーを付与
4. バックエンドがトークンを検証 → userIdを取得 → リクエスト処理

### MongoDB インデックス設計
- **users**: `{ username: 1 }` unique - ユーザー名の一意性保証・検索用
- **prompts**: `{ userId: 1, createdAt: -1 }` - ユーザーごとの一覧取得用
- **prompts**: `{ _id: 1, userId: 1 }` - 更新・削除の所有権チェック用

### CORS設定
- **開発環境**: すべてのオリジンを許可 (*)
- **本番環境**: 特定ドメインのみ許可
