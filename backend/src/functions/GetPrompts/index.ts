/**
 * プロンプト一覧取得API
 * GET /api/prompts
 * クエリパラメータ: search, category, tag, aiTool
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPromptsContainer } from '../../utils/cosmos';
import { getAuthenticatedUser } from '../../utils/auth';

async function getPrompts(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('GetPrompts function processed a request.');

  // 認証チェック
  const user = getAuthenticatedUser(request);
  if (!user) {
    return {
      status: 401,
      jsonBody: { error: 'Authentication required' },
    };
  }

  try {
    const container = getPromptsContainer();

    // クエリパラメータの取得
    const search = request.query.get('search') || '';
    const category = request.query.get('category') || '';
    const tag = request.query.get('tag') || '';
    const aiTool = request.query.get('aiTool') || '';

    // クエリの構築（パーティションキー: userId）
    let queryText = 'SELECT * FROM c WHERE c.userId = @userId';
    const parameters: { name: string; value: string }[] = [
      { name: '@userId', value: user.userId },
    ];

    if (category) {
      queryText += ' AND c.category = @category';
      parameters.push({ name: '@category', value: category });
    }

    if (aiTool) {
      queryText += ' AND c.aiTool = @aiTool';
      parameters.push({ name: '@aiTool', value: aiTool });
    }

    if (tag) {
      queryText += ' AND ARRAY_CONTAINS(c.tags, @tag)';
      parameters.push({ name: '@tag', value: tag });
    }

    if (search) {
      queryText += ' AND (CONTAINS(LOWER(c.title), LOWER(@search)) OR CONTAINS(LOWER(c.content), LOWER(@search)))';
      parameters.push({ name: '@search', value: search });
    }

    queryText += ' ORDER BY c.createdAt DESC';

    const { resources: prompts } = await container.items
      .query({ query: queryText, parameters })
      .fetchAll();

    return {
      status: 200,
      jsonBody: { prompts },
    };
  } catch (error) {
    context.error('Error in getPrompts function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('GetPrompts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'prompts',
  handler: getPrompts,
});
