import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productSkus } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// 获取商品SKU列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: '无效的商品ID' },
        { status: 400 }
      );
    }

    const skuList = await db
      .select()
      .from(productSkus)
      .where(eq(productSkus.productId, productId))
      .orderBy(productSkus.createdAt);

    return NextResponse.json({ success: true, data: skuList });
  } catch (error) {
    console.error('获取SKU列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取SKU列表失败' },
      { status: 500 }
    );
  }
}

// 创建商品SKU
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const body = await request.json();
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: '无效的商品ID' },
        { status: 400 }
      );
    }

    const {
      skuCode,
      skuName,
      specValues,
      imageUrl,
      price,
      originalPrice,
      costPrice,
      stock = 0,
      weight,
      status = 1
    } = body;

    if (!skuCode || !price) {
      return NextResponse.json(
        { success: false, message: 'SKU编码和价格不能为空' },
        { status: 400 }
      );
    }

    const newSku = await db
      .insert(productSkus)
      .values({
        productId,
        skuCode,
        skuName,
        specValues,
        imageUrl,
        price,
        originalPrice,
        costPrice,
        stock,
        weight,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({ success: true, data: newSku[0] });
  } catch (error) {
    console.error('创建SKU失败:', error);
    return NextResponse.json(
      { success: false, message: '创建SKU失败' },
      { status: 500 }
    );
  }
}

// 更新商品SKU
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const body = await request.json();
    const { skuId, ...updateData } = body;
    
    if (isNaN(productId) || !skuId) {
      return NextResponse.json(
        { success: false, message: '商品ID或SKU ID无效' },
        { status: 400 }
      );
    }

    const updatedSku = await db
      .update(productSkus)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(and(
        eq(productSkus.id, skuId),
        eq(productSkus.productId, productId)
      ))
      .returning();

    if (updatedSku.length === 0) {
      return NextResponse.json(
        { success: false, message: 'SKU不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedSku[0] });
  } catch (error) {
    console.error('更新SKU失败:', error);
    return NextResponse.json(
      { success: false, message: '更新SKU失败' },
      { status: 500 }
    );
  }
}

// 删除商品SKU
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const skuId = searchParams.get('skuId');
    
    if (isNaN(productId) || !skuId) {
      return NextResponse.json(
        { success: false, message: '商品ID或SKU ID无效' },
        { status: 400 }
      );
    }

    const deletedSku = await db
      .delete(productSkus)
      .where(and(
        eq(productSkus.id, parseInt(skuId)),
        eq(productSkus.productId, productId)
      ))
      .returning();

    if (deletedSku.length === 0) {
      return NextResponse.json(
        { success: false, message: 'SKU不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除SKU失败:', error);
    return NextResponse.json(
      { success: false, message: '删除SKU失败' },
      { status: 500 }
    );
  }
}