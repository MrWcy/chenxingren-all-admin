import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema: { ...schema, ...relations } });

// 导出所有表和关系，方便在其他地方使用
export * from './schema';
export * from './relations';