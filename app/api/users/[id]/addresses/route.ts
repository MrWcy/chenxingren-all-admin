import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userAddresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// 获取用户地址列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: '无效的用户ID' },
        { status: 400 }
      );
    }

    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId));

    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error('获取用户地址失败:', error);
    return NextResponse.json(
      { success: false, message: '获取用户地址失败' },
      { status: 500 }
    );
  }
}

// 更新用户地址
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();
    const { addressId, ...updateData } = body;

    if (isNaN(userId) || !addressId) {
      return NextResponse.json(
        { success: false, message: '无效的用户ID或地址ID' },
        { status: 400 }
      );
    }

    const updatedAddress = await db
      .update(userAddresses)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(userAddresses.id, addressId))
      .returning();

    if (updatedAddress.length === 0) {
      return NextResponse.json(
        { success: false, message: '地址不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedAddress[0] });
  } catch (error) {
    console.error('更新用户地址失败:', error);
    return NextResponse.json(
      { success: false, message: '更新用户地址失败' },
      { status: 500 }
    );
  }
}