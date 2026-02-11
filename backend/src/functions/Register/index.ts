/**
 * ユーザー登録API
 * POST /api/register
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getUsersCollection } from '../../utils/mongodb';
import { hashPassword, validatePasswordStrength } from '../../utils/password';
import { validateUsername } from '../../utils/auth';
import { RegisterRequest, User } from '../../models/types';

async function register(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Register function processed a request.');

  try {
    // リクエストボディの解析
    const body = await request.json() as RegisterRequest;
    const { username, password } = body;

    // ユーザー名のバリデーション
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return {
        status: 400,
        jsonBody: { error: usernameValidation.error },
      };
    }

    // パスワードのバリデーション
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return {
        status: 400,
        jsonBody: { error: passwordValidation.error },
      };
    }

    const collection = await getUsersCollection();

    // ユーザー名の重複チェック
    const existingUser = await collection.findOne({ username });

    if (existingUser) {
      return {
        status: 400,
        jsonBody: { error: 'Username already exists' },
      };
    }

    // パスワードのハッシュ化
    const passwordHash = await hashPassword(password);

    // ユーザーの作成
    const userId = uuidv4();
    const newUser: User = {
      id: userId,
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(newUser);

    context.log(`User registered successfully: ${username}`);

    return {
      status: 201,
      jsonBody: {
        message: 'User registered successfully',
        userId,
      },
    };
  } catch (error) {
    context.error('Error in register function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('Register', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'register',
  handler: register,
});
