/**
 * プロンプト一覧取得API
 * GET /api/prompts
 * クエリパラメータ: search, category, tag, aiTool
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPromptsCollection } from '../../utils/mongodb';
import { getAuthenticatedUser } from '../../utils/auth';
import type { Filter, Document } from 'mongodb';

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
    const collection = await getPromptsCollection();

    // クエリパラメータの取得
    const search = request.query.get('search') || '';
    const category = request.query.get('category') || '';
    const tag = request.query.get('tag') || '';
    const aiTool = request.query.get('aiTool') || '';

    // MongoDBフィルタの構築
    const filter: Filter<Document> = { userId: user.userId };

    if (category) {
      filter.category = category;
    }

    if (aiTool) {
      filter.aiTool = aiTool;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { content: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const prompts = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

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
