import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function GET() {
  try {
    // 测试数据库连接，获取用户数量
    const userCount = await db.select().from(users).limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connected: true,
        userTableExists: true,
        sampleQuery: userCount.length > 0 ? 'Has data' : 'No data'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}