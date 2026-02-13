/**
 * パスワード変更API
 * POST /api/change-password
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getUsersCollection } from '../../utils/mongodb';
import { verifyPassword, hashPassword, validatePasswordStrength } from '../../utils/password';
import { getAuthenticatedUser } from '../../utils/auth';
import type { ChangePasswordRequest, User } from '../../models/types';

async function changePassword(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('ChangePassword function processed a request.');

  // JWT認証チェック
  const authUser = getAuthenticatedUser(request);
  if (!authUser) {
    return {
      status: 401,
      jsonBody: { error: 'Unauthorized' },
    };
  }

  try {
    // リクエストボディの解析
    const body = await request.json() as ChangePasswordRequest;
    const { currentPassword, newPassword, confirmPassword } = body;

    // 入力値のバリデーション
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        status: 400,
        jsonBody: { error: 'All fields are required' },
      };
    }

    // 新しいパスワードの一致確認
    if (newPassword !== confirmPassword) {
      return {
        status: 400,
        jsonBody: { error: 'New passwords do not match' },
      };
    }

    // 新しいパスワードの強度チェック
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return {
        status: 400,
        jsonBody: { error: strengthCheck.error },
      };
    }

    const collection = await getUsersCollection();

    // ユーザーの取得
    const user = await collection.findOne<User>({ id: authUser.userId });
    if (!user) {
      return {
        status: 401,
        jsonBody: { error: 'User not found' },
      };
    }

    // 現在のパスワードの検証
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return {
        status: 401,
        jsonBody: { error: 'Current password is incorrect' },
      };
    }

    // 新しいパスワードのハッシュ化と更新
    const newPasswordHash = await hashPassword(newPassword);
    await collection.updateOne(
      { id: authUser.userId },
      { $set: { passwordHash: newPasswordHash } }
    );

    context.log(`Password changed for user: ${authUser.username}`);

    return {
      status: 200,
      jsonBody: { message: 'パスワードを変更しました' },
    };
  } catch (error) {
    context.error('Error in changePassword function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('ChangePassword', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'change-password',
  handler: changePassword,
});
