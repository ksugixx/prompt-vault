/**
 * PromptVault - データモデル型定義
 */

/**
 * ユーザー
 * Cosmos DB コンテナ: Users
 * パーティションキー: /id
 */
export interface User {
  /** ユーザーID (UUID v4) */
  id: string;
  /** ユーザー名 (ユニーク、3-20文字) */
  username: string;
  /** パスワードハッシュ (bcryptでハッシュ化) */
  passwordHash: string;
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
}

/**
 * プロンプト作成リクエスト
 */
export interface CreatePromptRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
  aiTool?: string;
}

/**
 * プロンプト更新リクエスト
 */
export interface UpdatePromptRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
  aiTool?: string;
}

/**
 * ユーザー登録リクエスト
 */
export interface RegisterRequest {
  username: string;
  password: string;
}

/**
 * ログインリクエスト
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 認証トークンペイロード
 */
export interface AuthTokenPayload {
  /** ユーザーID */
  userId: string;
  /** ユーザー名 */
  username: string;
  /** トークン発行日時 (Unix timestamp) */
  iat?: number;
  /** トークン有効期限 (Unix timestamp) */
  exp?: number;
}

/**
 * ログインレスポンス
 */
export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
}

/**
 * パスワード変更リクエスト
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * プロンプト検索クエリパラメータ
 */
export interface PromptQueryParams {
  search?: string;
  category?: string;
  tag?: string;
  aiTool?: string;
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
