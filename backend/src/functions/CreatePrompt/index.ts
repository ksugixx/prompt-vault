/**
 * プロンプト作成API
 * POST /api/prompts
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getPromptsCollection } from '../../utils/mongodb';
import { getAuthenticatedUser } from '../../utils/auth';
import type { CreatePromptRequest, Prompt } from '../../models/types';

function validatePromptRequest(body: CreatePromptRequest): { valid: boolean; error?: string } {
  if (!body.title || body.title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (body.title.length > 200) {
    return { valid: false, error: 'Title must be 200 characters or less' };
  }
  if (!body.content || body.content.trim().length === 0) {
    return { valid: false, error: 'Content is required' };
  }
  if (body.content.length > 10000) {
    return { valid: false, error: 'Content must be 10,000 characters or less' };
  }
  if (!body.category || body.category.trim().length === 0) {
    return { valid: false, error: 'Category is required' };
  }
  if (body.tags && body.tags.length > 10) {
    return { valid: false, error: 'Maximum 10 tags allowed' };
  }
  return { valid: true };
}

async function createPrompt(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('CreatePrompt function processed a request.');

  // 認証チェック
  const user = getAuthenticatedUser(request);
  if (!user) {
    return {
      status: 401,
      jsonBody: { error: 'Authentication required' },
    };
  }

  try {
    const body = await request.json() as CreatePromptRequest;

    // バリデーション
    const validation = validatePromptRequest(body);
    if (!validation.valid) {
      return {
        status: 400,
        jsonBody: { error: validation.error },
      };
    }

    const collection = await getPromptsCollection();
    const now = new Date().toISOString();
    const promptId = uuidv4();

    const newPrompt: Prompt = {
      id: promptId,
      userId: user.userId,
      title: body.title.trim(),
      content: body.content,
      category: body.category.trim(),
      tags: body.tags || [],
      aiTool: body.aiTool,
      isPinned: body.isPinned || false,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newPrompt);

    context.log(`Prompt created: ${promptId}`);

    return {
      status: 201,
      jsonBody: {
        id: promptId,
        message: 'Prompt created successfully',
      },
    };
  } catch (error) {
    context.error('Error in createPrompt function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('CreatePrompt', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'prompts',
  handler: createPrompt,
});
