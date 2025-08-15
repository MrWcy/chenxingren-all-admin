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

// 为用户添加新地址
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();
    const { 
      name, 
      phone, 
      province, 
      city, 
      district, 
      detailAddress, 
      postalCode, 
      isDefault 
    } = body;

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: '无效的用户ID' },
        { status: 400 }
      );
    }

    // 验证必填字段
    if (!name || !phone || !province || !city || !district || !detailAddress) {
      return NextResponse.json(
        { success: false, message: '姓名、电话、省市区和详细地址不能为空' },
        { status: 400 }
      );
    }

    // 如果设置为默认地址，先将该用户的其他地址设为非默认
    if (isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false, updatedAt: new Date().toISOString() })
        .where(eq(userAddresses.userId, userId));
    }

    // 创建新地址
    const newAddress = await db
      .insert(userAddresses)
      .values({
        userId,
        name,
        phone,
        province,
        city,
        district,
        detailAddress,
        postalCode,
        isDefault: isDefault || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({ success: true, data: newAddress[0] }, { status: 201 });
  } catch (error) {
    console.error('添加用户地址失败:', error);
    return NextResponse.json(
      { success: false, message: '添加用户地址失败' },
      { status: 500 }
    );
  }
}

// 删除用户地址
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');

    if (isNaN(userId) || !addressId) {
      return NextResponse.json(
        { success: false, message: '无效的用户ID或地址ID' },
        { status: 400 }
      );
    }

    const addressIdNum = parseInt(addressId);
    if (isNaN(addressIdNum)) {
      return NextResponse.json(
        { success: false, message: '无效的地址ID' },
        { status: 400 }
      );
    }

    // 验证地址是否属于该用户
    const existingAddress = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.id, addressIdNum))
      .limit(1);

    if (existingAddress.length === 0) {
      return NextResponse.json(
        { success: false, message: '地址不存在' },
        { status: 404 }
      );
    }

    if (existingAddress[0].userId !== userId) {
      return NextResponse.json(
        { success: false, message: '无权限删除此地址' },
        { status: 403 }
      );
    }

    // 删除地址
    await db
      .delete(userAddresses)
      .where(eq(userAddresses.id, addressIdNum));

    return NextResponse.json({ success: true, message: '地址删除成功' });
  } catch (error) {
    console.error('删除用户地址失败:', error);
    return NextResponse.json(
      { success: false, message: '删除用户地址失败' },
      { status: 500 }
    );
  }
}