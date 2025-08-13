import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// 获取单个商品详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: '无效的商品ID' },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { success: false, message: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product[0] });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json(
      { success: false, message: '获取商品详情失败' },
      { status: 500 }
    );
  }
}