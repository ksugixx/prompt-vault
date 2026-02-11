/**
 * プロンプト更新API
 * PUT /api/prompts/{id}
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getPromptsContainer } from '../../utils/cosmos';
import { getAuthenticatedUser } from '../../utils/auth';
import { UpdatePromptRequest, Prompt } from '../../models/types';

async function updatePrompt(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('UpdatePrompt function processed a request.');

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

    const body = await request.json() as UpdatePromptRequest;

    // バリデーション
    if (!body.title || body.title.trim().length === 0) {
      return { status: 400, jsonBody: { error: 'Title is required' } };
    }
    if (body.title.length > 200) {
      return { status: 400, jsonBody: { error: 'Title must be 200 characters or less' } };
    }
    if (!body.content || body.content.trim().length === 0) {
      return { status: 400, jsonBody: { error: 'Content is required' } };
    }
    if (body.content.length > 10000) {
      return { status: 400, jsonBody: { error: 'Content must be 10,000 characters or less' } };
    }
    if (!body.category || body.category.trim().length === 0) {
      return { status: 400, jsonBody: { error: 'Category is required' } };
    }
    if (body.tags && body.tags.length > 10) {
      return { status: 400, jsonBody: { error: 'Maximum 10 tags allowed' } };
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

    // プロンプトの更新
    const updatedPrompt: Prompt = {
      ...existingPrompt,
      title: body.title.trim(),
      content: body.content,
      category: body.category.trim(),
      tags: body.tags || [],
      aiTool: body.aiTool,
      updatedAt: new Date().toISOString(),
    };

    await container.item(promptId, user.userId).replace(updatedPrompt);

    context.log(`Prompt updated: ${promptId}`);

    return {
      status: 200,
      jsonBody: { message: 'Prompt updated successfully' },
    };
  } catch (error) {
    context.error('Error in updatePrompt function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('UpdatePrompt', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'prompts/{id}',
  handler: updatePrompt,
});
