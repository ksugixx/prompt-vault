/**
 * プロンプト一括インポートAPI
 * POST /api/prompts/import
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getPromptsCollection } from '../../utils/mongodb';
import { getAuthenticatedUser } from '../../utils/auth';
import type { CreatePromptRequest, Prompt, ImportPromptsResponse } from '../../models/types';

const MAX_IMPORT_COUNT = 100;

function validatePromptData(body: CreatePromptRequest, index: number): string | null {
  if (!body.title || body.title.trim().length === 0) {
    return `Prompt ${index + 1}: Title is required`;
  }
  if (body.title.length > 200) {
    return `Prompt ${index + 1}: Title must be 200 characters or less`;
  }
  if (!body.content || body.content.trim().length === 0) {
    return `Prompt ${index + 1}: Content is required`;
  }
  if (body.content.length > 10000) {
    return `Prompt ${index + 1}: Content must be 10,000 characters or less`;
  }
  if (!body.category || body.category.trim().length === 0) {
    return `Prompt ${index + 1}: Category is required`;
  }
  if (body.tags && body.tags.length > 10) {
    return `Prompt ${index + 1}: Maximum 10 tags allowed`;
  }
  return null;
}

async function importPrompts(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('ImportPrompts function processed a request.');

  // 認証チェック
  const user = getAuthenticatedUser(request);
  if (!user) {
    return {
      status: 401,
      jsonBody: { error: 'Authentication required' },
    };
  }

  try {
    const body = await request.json() as { prompts?: CreatePromptRequest[] };

    // 配列の存在チェック
    if (!body.prompts || !Array.isArray(body.prompts)) {
      return {
        status: 400,
        jsonBody: { error: 'Request must contain a "prompts" array' },
      };
    }

    if (body.prompts.length === 0) {
      return {
        status: 400,
        jsonBody: { error: 'Prompts array must not be empty' },
      };
    }

    if (body.prompts.length > MAX_IMPORT_COUNT) {
      return {
        status: 400,
        jsonBody: { error: `Maximum ${MAX_IMPORT_COUNT} prompts can be imported at once` },
      };
    }

    const now = new Date().toISOString();
    const validPrompts: Prompt[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    // 各プロンプトをバリデーション
    for (let i = 0; i < body.prompts.length; i++) {
      const promptData = body.prompts[i];
      const error = validatePromptData(promptData, i);

      if (error) {
        errors.push({ index: i, error });
        continue;
      }

      validPrompts.push({
        id: uuidv4(),
        userId: user.userId,
        title: promptData.title.trim(),
        content: promptData.content,
        category: promptData.category.trim(),
        tags: promptData.tags || [],
        aiTool: promptData.aiTool,
        isPinned: promptData.isPinned || false,
        createdAt: now,
        updatedAt: now,
      });
    }

    // バリデーション通過分がない場合
    if (validPrompts.length === 0) {
      const response: ImportPromptsResponse = {
        message: 'No valid prompts to import',
        importedCount: 0,
        failedCount: errors.length,
        errors,
      };
      return { status: 400, jsonBody: response };
    }

    // 一括挿入
    const collection = await getPromptsCollection();
    await collection.insertMany(validPrompts);

    context.log(`Imported ${validPrompts.length} prompts for user ${user.userId}`);

    const response: ImportPromptsResponse = {
      message: errors.length > 0 ? 'Prompts imported with some errors' : 'Prompts imported successfully',
      importedCount: validPrompts.length,
      failedCount: errors.length,
      ...(errors.length > 0 && { errors }),
    };

    return { status: 201, jsonBody: response };
  } catch (error) {
    context.error('Error in importPrompts function:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('ImportPrompts', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'prompts/import',
  handler: importPrompts,
});
