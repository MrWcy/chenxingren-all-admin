import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// 获取用户列表或根据openid查询用户
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const openid = searchParams.get('openid');

    if (openid) {
      // 根据openid查询特定用户
      const user = await db
        .select()
        .from(users)
        .where(eq(users.openid, openid))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { success: false, message: '用户不存在' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: user[0] });
    } else {
      // 获取所有用户列表
      const userList = await db.select().from(users);
      return NextResponse.json({ success: true, data: userList });
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { success: false, message: '获取用户信息失败' },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: '用户ID不能为空' },
        { status: 400 }
      );
    }

    const updatedUser = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser[0] });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json(
      { success: false, message: '更新用户信息失败' },
      { status: 500 }
    );
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { openid, unionid, nickname, avatarUrl, gender, phone, email, birthday } = body;

    // 验证必填字段
    if (!openid) {
      return NextResponse.json(
        { success: false, message: 'openid不能为空' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.openid, openid))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: '用户已存在' },
        { status: 409 }
      );
    }

    // 创建新用户
    const newUser = await db
      .insert(users)
      .values({
        openid,
        unionid,
        nickname,
        avatarUrl,
        gender: gender || 0,
        phone,
        email,
        birthday,
        status: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({ success: true, data: newUser[0] }, { status: 201 });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { success: false, message: '创建用户失败' },
      { status: 500 }
    );
  }
}