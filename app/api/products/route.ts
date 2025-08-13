import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, desc, asc, like, and } from 'drizzle-orm';

// 获取商品列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建查询条件
    const conditions = [];
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }
    if (status !== null && status !== '') {
      conditions.push(eq(products.status, parseInt(status)));
    }

    // 构建排序
    const orderBy = sortOrder === 'asc' ? asc : desc;
    let orderColumn;
    switch (sortBy) {
      case 'name':
        orderColumn = products.name;
        break;
      case 'basePrice':
        orderColumn = products.basePrice;
        break;
      case 'salesCount':
        orderColumn = products.salesCount;
        break;
      case 'viewCount':
        orderColumn = products.viewCount;
        break;
      default:
        orderColumn = products.createdAt;
    }

    // 查询总数
    const totalQuery = conditions.length > 0 
      ? db.select({ count: products.id }).from(products).where(and(...conditions))
      : db.select({ count: products.id }).from(products);
    
    const totalResult = await totalQuery;
    const total = totalResult.length;

    // 查询数据
    const offset = (page - 1) * pageSize;
    const query = db.select().from(products)
      .orderBy(orderBy(orderColumn))
      .limit(pageSize)
      .offset(offset);

    const productList = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return NextResponse.json({
      success: true,
      data: {
        list: productList,
        total,
        page,
        pageSize
      }
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取商品列表失败' },
      { status: 500 }
    );
  }
}

// 创建商品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      brand,
      description,
      mainImage,
      detailImages,
      specInfo,
      basePrice,
      status = 1,
      sortOrder = 0,
      specConfig
    } = body;

    if (!name || !basePrice) {
      return NextResponse.json(
        { success: false, message: '商品名称和基础价格不能为空' },
        { status: 400 }
      );
    }

    const newProduct = await db
      .insert(products)
      .values({
        name,
        brand,
        description,
        mainImage,
        detailImages,
        specInfo,
        basePrice,
        status,
        sortOrder,
        specConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({ success: true, data: newProduct[0] });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { success: false, message: '创建商品失败' },
      { status: 500 }
    );
  }
}

// 更新商品
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: '商品ID不能为空' },
        { status: 400 }
      );
    }

    const updatedProduct = await db
      .update(products)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(products.id, id))
      .returning();

    if (updatedProduct.length === 0) {
      return NextResponse.json(
        { success: false, message: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json(
      { success: false, message: '更新商品失败' },
      { status: 500 }
    );
  }
}

// 删除商品
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: '商品ID不能为空' },
        { status: 400 }
      );
    }

    const deletedProduct = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deletedProduct.length === 0) {
      return NextResponse.json(
        { success: false, message: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json(
      { success: false, message: '删除商品失败' },
      { status: 500 }
    );
  }
}