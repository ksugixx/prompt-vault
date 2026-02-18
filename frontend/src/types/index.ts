/**
 * PromptVault - フロントエンド型定義
 */

/** ユーザー情報 */
export interface User {
  id: string;
  displayName: string;
  email: string;
  pictureUrl?: string;
}

/** プロンプト */
export interface Prompt {
  id: string;
  userId: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  aiTool?: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

/** プロンプト作成/更新リクエスト */
export interface PromptFormData {
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  aiTool?: string;
  isPinned?: boolean;
}

/** Google認証レスポンス */
export interface GoogleAuthResponse {
  token: string;
  userId: string;
  displayName: string;
  email: string;
  pictureUrl?: string;
  isNewUser: boolean;
}

/** プロンプト一覧レスポンス */
export interface PromptsResponse {
  prompts: Prompt[];
}

/** プロンプト作成レスポンス */
export interface CreatePromptResponse {
  id: string;
  message: string;
}

/** APIエラーレスポンス */
export interface ApiError {
  error: string;
}

/** 検索・フィルタパラメータ */
export interface PromptFilters {
  search?: string;
  category?: string;
  tag?: string;
  aiTool?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/** 認証状態 */
export interface AuthState {
  token: string | null;
  userId: string | null;
  displayName: string | null;
  email: string | null;
  pictureUrl: string | null;
  isAuthenticated: boolean;
}

/** プリセットカテゴリ */
export const CATEGORIES = [
  'コーディング',
  'ライティング',
  '分析',
  '翻訳',
  '要約',
  'アイデア出し',
  'その他',
] as const;

/** AIツール */
export const AI_TOOLS = [
  'Claude',
  'ChatGPT',
  'Gemini',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];
export type AITool = typeof AI_TOOLS[number];

/** プロンプトインポートレスポンス */
export interface ImportPromptsResponse {
  message: string;
  importedCount: number;
  failedCount: number;
  errors?: Array<{ index: number; error: string }>;
}
