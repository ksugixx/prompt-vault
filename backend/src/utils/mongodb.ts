/**
 * MongoDB接続ユーティリティ
 */

import { MongoClient, Db, Collection } from 'mongodb';

// 環境変数から設定を取得
const uri = process.env.MONGODB_URI || '';
const databaseName = process.env.MONGODB_DATABASE || 'PromptVaultDB';

// MongoDBクライアントのシングルトン
let client: MongoClient | null = null;
let database: Db | null = null;

/**
 * MongoDBクライアントを取得（シングルトン）
 */
async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    if (!uri) {
      throw new Error('MONGODB_URI must be set in environment variables');
    }
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
  }
  return client;
}

/**
 * データベースを取得
 */
export async function getDatabase(): Promise<Db> {
  if (!database) {
    const mongoClient = await getMongoClient();
    database = mongoClient.db(databaseName);
  }
  return database;
}

/**
 * Usersコレクションを取得
 */
export async function getUsersCollection(): Promise<Collection> {
  const db = await getDatabase();
  return db.collection('Users');
}

/**
 * Promptsコレクションを取得
 */
export async function getPromptsCollection(): Promise<Collection> {
  const db = await getDatabase();
  return db.collection('Prompts');
}

/**
 * データベースとコレクションの初期化
 * 開発環境でのセットアップ用（インデックス作成）
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const db = await getDatabase();

    // Users: googleId に一意インデックス
    await db.collection('Users').createIndex(
      { googleId: 1 },
      { unique: true }
    );

    // Prompts: userId + createdAt の複合インデックス（一覧取得用）
    await db.collection('Prompts').createIndex(
      { userId: 1, createdAt: -1 }
    );

    // Prompts: userId + category の複合インデックス（フィルタ用）
    await db.collection('Prompts').createIndex(
      { userId: 1, category: 1 }
    );

    // Prompts: タグ検索用のマルチキーインデックス
    await db.collection('Prompts').createIndex(
      { userId: 1, tags: 1 }
    );

    // Prompts: id + userId の複合インデックス（更新・削除用）
    await db.collection('Prompts').createIndex(
      { id: 1, userId: 1 }
    );

    console.log('Database indexes initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
