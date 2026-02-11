/**
 * Cosmos DB接続ユーティリティ
 */

import { CosmosClient, Database, Container } from '@azure/cosmos';

// 環境変数から設定を取得
const endpoint = process.env.COSMOS_ENDPOINT || '';
const key = process.env.COSMOS_KEY || '';
const databaseId = process.env.COSMOS_DATABASE || 'PromptVaultDB';

// Cosmos DBクライアントの初期化
let client: CosmosClient | null = null;
let database: Database | null = null;

/**
 * Cosmos DBクライアントを取得
 */
export function getCosmosClient(): CosmosClient {
  if (!client) {
    if (!endpoint || !key) {
      throw new Error('Cosmos DB endpoint and key must be set in environment variables');
    }
    client = new CosmosClient({ endpoint, key });
  }
  return client;
}

/**
 * データベースを取得
 */
export function getDatabase(): Database {
  if (!database) {
    const client = getCosmosClient();
    database = client.database(databaseId);
  }
  return database;
}

/**
 * Usersコンテナを取得
 */
export function getUsersContainer(): Container {
  const db = getDatabase();
  return db.container('Users');
}

/**
 * Promptsコンテナを取得
 */
export function getPromptsContainer(): Container {
  const db = getDatabase();
  return db.container('Prompts');
}

/**
 * データベースとコンテナの初期化
 * 開発環境でのセットアップ用
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const client = getCosmosClient();

    // データベースの作成（存在しない場合）
    const { database } = await client.databases.createIfNotExists({
      id: databaseId,
    });

    console.log(`Database initialized: ${databaseId}`);

    // Usersコンテナの作成（存在しない場合）
    await database.containers.createIfNotExists({
      id: 'Users',
      partitionKey: { paths: ['/id'] },
    });

    console.log('Users container initialized');

    // Promptsコンテナの作成（存在しない場合）
    await database.containers.createIfNotExists({
      id: 'Prompts',
      partitionKey: { paths: ['/userId'] },
    });

    console.log('Prompts container initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
