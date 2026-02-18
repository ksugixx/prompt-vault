/**
 * JWT認証ユーティリティ
 */

import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../models/types';
import { HttpRequest } from '@azure/functions';

// JWT秘密鍵（環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET || '';

// トークン有効期限（24時間）
const TOKEN_EXPIRY = '24h';

/**
 * JWTトークンを生成
 * @param userId ユーザーID
 * @param displayName 表示名
 * @returns JWTトークン
 */
export function generateToken(userId: string, displayName: string): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload: AuthTokenPayload = {
    userId,
    displayName,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  return token;
}

/**
 * JWTトークンを検証
 * @param token JWTトークン
 * @returns 検証されたペイロード、失敗時はnull
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * HTTPリクエストからトークンを抽出
 * Authorization: Bearer <token> ヘッダーから取得
 * @param request HTTPリクエスト
 * @returns トークン、存在しない場合はnull
 */
export function extractTokenFromRequest(request: HttpRequest): string | null {
  const authHeader = request.headers.get('x-authorization') || request.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  // "Bearer <token>" 形式をチェック
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * HTTPリクエストから認証済みユーザー情報を取得
 * @param request HTTPリクエスト
 * @returns ユーザー情報、認証失敗時はnull
 */
export function getAuthenticatedUser(request: HttpRequest): AuthTokenPayload | null {
  const token = extractTokenFromRequest(request);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

