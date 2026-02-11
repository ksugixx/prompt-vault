/**
 * PromptVault - フロントエンド型定義
 */

/** ユーザー情報 */
export interface User {
  id: string;
  username: string;
}

/** プロンプト */
export interface Prompt {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  aiTool?: string;
  createdAt: string;
  updatedAt: string;
}

/** プロンプト作成/更新リクエスト */
export interface PromptFormData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  aiTool?: string;
}

/** ログインリクエスト */
export interface LoginRequest {
  username: string;
  password: string;
}

/** ログインレスポンス */
export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
}

/** 登録リクエスト */
export interface RegisterRequest {
  username: string;
  password: string;
}

/** 登録レスポンス */
export interface RegisterResponse {
  message: string;
  userId: string;
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
}

/** 認証状態 */
export interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
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
