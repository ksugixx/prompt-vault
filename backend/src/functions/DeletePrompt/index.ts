/**
 * プロンプト削除API
 * DELETE /api/prompts/{id}
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPromptsContainer } from '../../utils/cosmos';
import { getAuthenticatedUser } from '../../utils/auth';
import { Prompt } from '../../models/types';

async function deletePrompt(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('DeletePrompt function processed a request.');

  // 認証チェック
  const user = getAuthenticatedUser(request);
  if (!user) {
    return {
      status: 401,
      jsonBody: { error: 'Authentication required' },
    };
  }

  try {
    const promptId = request.params.id;
    if (!promptId) {
      return {
        status: 400,
        jsonBody: { error: 'Prompt ID is required' },
      };
    }

    const container = getPromptsContainer();

    // 既存プロンプトの取得（所有権チェック）
    const { resource: existingPrompt } = await container.item(promptId, user.userId).read<Prompt>();

    if (!existingPrompt) {
      return {
        status: 404,
        jsonBody: { error: 'Prompt not found' },
      };
    }

    // プロンプトの削除
    await container.item(promptId, user.userId).delete();

    context.log(`Prompt deleted: ${promptId}`);

    return {
      status: 200,
      jsonBody: { message: 'Prompt deleted successfully' },
    };
  } catch (error) {
    context.error('Error in deletePrompt function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('DeletePrompt', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'prompts/{id}',
  handler: deletePrompt,
});
