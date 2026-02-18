/**
 * PromptVault - データモデル型定義
 */

/**
 * ユーザー
 * MongoDB コレクション: Users
 */
export interface User {
  /** ユーザーID (UUID v4) */
  id: string;
  /** Google ID (sub claim) - ユニーク */
  googleId: string;
  /** メールアドレス */
  email: string;
  /** 表示名 (Google profile name) */
  displayName: string;
  /** プロフィール画像URL */
  pictureUrl?: string;
  /** 作成日時 (ISO 8601形式) */
  createdAt: string;
}

/**
 * プロンプト
 * Cosmos DB コンテナ: Prompts
 * パーティションキー: /userId
 */
export interface Prompt {
  /** プロンプトID (UUID v4) */
  id: string;
  /** 所有者のユーザーID */
  userId: string;
  /** タイトル (1-200文字) */
  title: string;
  /** 本文 (マークダウン対応、最大10,000文字) */
  content: string;
  /** 説明 (任意、最大200文字、カード表示用) */
  description?: string;
  /** カテゴリ */
  category: string;
  /** タグ (最大10個) */
  tags: string[];
  /** AIツール (任意) */
  aiTool?: string;
  /** 作成日時 (ISO 8601形式) */
  createdAt: string;
  /** 更新日時 (ISO 8601形式) */
  updatedAt: string;
  /** ピン留め状態 */
  isPinned?: boolean;
}

/**
 * プロンプト作成リクエスト
 */
export interface CreatePromptRequest {
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  aiTool?: string;
  isPinned?: boolean;
}

/**
 * プロンプト更新リクエスト
 */
export interface UpdatePromptRequest {
  title?: string;
  content?: string;
  description?: string;
  category?: string;
  tags?: string[];
  aiTool?: string;
  isPinned?: boolean;
}

/**
 * Google認証リクエスト
 */
export interface GoogleAuthRequest {
  /** Google IDトークン (クライアントから送信) */
  idToken: string;
}

/**
 * 認証トークンペイロード
 */
export interface AuthTokenPayload {
  /** ユーザーID */
  userId: string;
  /** 表示名 */
  displayName: string;
  /** トークン発行日時 (Unix timestamp) */
  iat?: number;
  /** トークン有効期限 (Unix timestamp) */
  exp?: number;
}

/**
 * Google認証レスポンス
 */
export interface GoogleAuthResponse {
  token: string;
  userId: string;
  displayName: string;
  email: string;
  pictureUrl?: string;
  isNewUser: boolean;
}

/**
 * プロンプト検索クエリパラメータ
 */
export interface PromptQueryParams {
  search?: string;
  category?: string;
  tag?: string;
  aiTool?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * プリセットカテゴリ
 */
export const CATEGORIES = [
  'コーディング',
  'ライティング',
  '分析',
  '翻訳',
  '要約',
  'アイデア出し',
  'その他',
] as const;

/**
 * AIツール
 */
export const AI_TOOLS = [
  'Claude',
  'ChatGPT',
  'Gemini',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];
export type AITool = typeof AI_TOOLS[number];

/**
 * プロンプトインポートレスポンス
 */
export interface ImportPromptsResponse {
  message: string;
  importedCount: number;
  failedCount: number;
  errors?: Array<{ index: number; error: string }>;
}
