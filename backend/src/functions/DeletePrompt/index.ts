/**
 * プロンプト削除API
 * DELETE /api/prompts/{id}
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPromptsCollection } from '../../utils/mongodb';
import { getAuthenticatedUser } from '../../utils/auth';

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

    const collection = await getPromptsCollection();

    // プロンプトの検索と削除を1操作で実行
    const result = await collection.findOneAndDelete({ id: promptId, userId: user.userId });

    if (!result) {
      return {
        status: 404,
        jsonBody: { error: 'Prompt not found' },
      };
    }

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
