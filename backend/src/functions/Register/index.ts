/**
 * ユーザー登録API
 * POST /api/register
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getUsersContainer } from '../../utils/cosmos';
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

    const container = getUsersContainer();

    // ユーザー名の重複チェック
    const { resources: existingUsers } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.username = @username',
        parameters: [{ name: '@username', value: username }],
      })
      .fetchAll();

    if (existingUsers.length > 0) {
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

    await container.items.create(newUser);

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
