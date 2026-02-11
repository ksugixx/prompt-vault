/**
 * ログインAPI
 * POST /api/login
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getUsersCollection } from '../../utils/mongodb';
import { verifyPassword } from '../../utils/password';
import { generateToken } from '../../utils/auth';
import type { LoginRequest, User } from '../../models/types';

async function login(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Login function processed a request.');

  try {
    // リクエストボディの解析
    const body = await request.json() as LoginRequest;
    const { username, password } = body;

    // 入力値のバリデーション
    if (!username || !password) {
      return {
        status: 400,
        jsonBody: { error: 'Username and password are required' },
      };
    }

    const collection = await getUsersCollection();

    // ユーザーの検索
    const user = await collection.findOne<User>({ username });

    if (!user) {
      return {
        status: 401,
        jsonBody: { error: 'Invalid credentials' },
      };
    }

    // パスワードの検証
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        status: 401,
        jsonBody: { error: 'Invalid credentials' },
      };
    }

    // JWTトークンの生成
    const token = generateToken(user.id, user.username);

    context.log(`User logged in successfully: ${username}`);

    return {
      status: 200,
      jsonBody: {
        token,
        userId: user.id,
        username: user.username,
      },
    };
  } catch (error) {
    context.error('Error in login function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('Login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'login',
  handler: login,
});
