/**
 * Google認証API
 * POST /api/auth/google
 * ログインと自動登録を統合したエンドポイント
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getUsersCollection } from '../../utils/mongodb';
import { generateToken } from '../../utils/auth';
import { verifyGoogleIdToken } from '../../utils/google';
import type { GoogleAuthRequest, GoogleAuthResponse, User } from '../../models/types';

export async function googleAuth(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('GoogleAuth function processed a request.');

  try {
    const body = await request.json() as GoogleAuthRequest;
    const { idToken } = body;

    if (!idToken) {
      return {
        status: 400,
        jsonBody: { error: 'ID token is required' },
      };
    }

    // Google IDトークンを検証
    const googleUser = await verifyGoogleIdToken(idToken);
    if (!googleUser) {
      return {
        status: 401,
        jsonBody: { error: 'Invalid Google ID token' },
      };
    }

    const collection = await getUsersCollection();

    // googleIdで既存ユーザーを検索
    const existingUser = await collection.findOne<User>({ googleId: googleUser.googleId });

    if (existingUser) {
      // 既存ユーザー: JWT発行してログイン
      const token = generateToken(existingUser.id, existingUser.displayName);

      context.log(`User logged in via Google: ${googleUser.email}`);

      const response: GoogleAuthResponse = {
        token,
        userId: existingUser.id,
        displayName: existingUser.displayName,
        email: existingUser.email,
        pictureUrl: existingUser.pictureUrl,
        isNewUser: false,
      };

      return {
        status: 200,
        jsonBody: response,
      };
    }

    // 新規ユーザー: MAX_USERSチェック
    const maxUsers = parseInt(process.env.MAX_USERS || '3', 10);
    const currentUserCount = await collection.countDocuments();
    if (currentUserCount >= maxUsers) {
      return {
        status: 403,
        jsonBody: { error: 'User registration limit reached' },
      };
    }

    // 新規ユーザー作成
    const userId = uuidv4();
    const newUser: User = {
      id: userId,
      googleId: googleUser.googleId,
      email: googleUser.email,
      displayName: googleUser.displayName,
      pictureUrl: googleUser.pictureUrl,
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(newUser);

    const token = generateToken(userId, newUser.displayName);

    context.log(`New user registered via Google: ${googleUser.email}`);

    const response: GoogleAuthResponse = {
      token,
      userId,
      displayName: newUser.displayName,
      email: newUser.email,
      pictureUrl: newUser.pictureUrl,
      isNewUser: true,
    };

    return {
      status: 200,
      jsonBody: response,
    };
  } catch (error) {
    context.error('Error in googleAuth function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('GoogleAuth', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/google',
  handler: googleAuth,
});
