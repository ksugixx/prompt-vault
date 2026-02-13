/**
 * APIクライアント
 * バックエンドとの通信を一元管理
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  PromptsResponse,
  PromptFormData,
  CreatePromptResponse,
  PromptFilters,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** Axiosインスタンスの作成 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** リクエストインターセプター: JWTトークンの自動付与 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['X-Authorization'] = `Bearer ${token}`;
  }
  return config;
});

/** 401自動リダイレクトを除外するパス（認証エラーを自前でハンドリングするエンドポイント） */
const AUTH_ERROR_SELF_HANDLED = ['/login', '/register', '/change-password'];

/** レスポンスインターセプター: 401エラー時の自動ログアウト */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isSelfHandled = AUTH_ERROR_SELF_HANDLED.some((path) => requestUrl.endsWith(path));
      if (!isSelfHandled) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== 認証API =====

/** ユーザー登録 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/register', data);
  return response.data;
};

/** ログイン */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/login', data);
  // トークンとユーザー情報をlocalStorageに保存
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('userId', response.data.userId);
  localStorage.setItem('username', response.data.username);
  return response.data;
};

/** ログアウト */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
};

/** パスワード変更 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<ChangePasswordResponse>('/change-password', data);
  return response.data;
};

/** 認証状態の取得 */
export const getAuthState = () => ({
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId'),
  username: localStorage.getItem('username'),
  isAuthenticated: !!localStorage.getItem('token'),
});

// ===== プロンプトAPI =====

/** プロンプト一覧取得 */
export const getPrompts = async (filters?: PromptFilters): Promise<PromptsResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.tag) params.set('tag', filters.tag);
  if (filters?.aiTool) params.set('aiTool', filters.aiTool);

  const response = await apiClient.get<PromptsResponse>('/prompts', { params });
  return response.data;
};

/** プロンプト作成 */
export const createPrompt = async (data: PromptFormData): Promise<CreatePromptResponse> => {
  const response = await apiClient.post<CreatePromptResponse>('/prompts', data);
  return response.data;
};

/** プロンプト更新 */
export const updatePrompt = async (id: string, data: PromptFormData): Promise<void> => {
  await apiClient.put(`/prompts/${id}`, data);
};

/** プロンプト削除 */
export const deletePrompt = async (id: string): Promise<void> => {
  await apiClient.delete(`/prompts/${id}`);
};

export default apiClient;
