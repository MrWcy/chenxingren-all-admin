import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReviews, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// 获取商品评论列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: '无效的商品ID' },
        { status: 400 }
      );
    }

    // 构建查询条件
    const conditions = [eq(productReviews.productId, productId)];
    if (status !== null && status !== '') {
      conditions.push(eq(productReviews.status, parseInt(status)));
    }

    // 查询总数
    const totalResult = await db
      .select({ count: productReviews.id })
      .from(productReviews)
      .where(and(...conditions));
    const total = totalResult.length;

    // 查询数据（关联用户信息）
    const offset = (page - 1) * pageSize;
    const reviewList = await db
      .select({
        id: productReviews.id,
        orderItemId: productReviews.orderItemId,
        userId: productReviews.userId,
        productId: productReviews.productId,
        skuId: productReviews.skuId,
        rating: productReviews.rating,
        content: productReviews.content,
        images: productReviews.images,
        replyContent: productReviews.replyContent,
        replyTime: productReviews.replyTime,
        status: productReviews.status,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
        userNickname: users.nickname,
        userAvatarUrl: users.avatarUrl
      })
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(productReviews.createdAt))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: {
        list: reviewList,
        total,
        page,
        pageSize
      }
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取评论列表失败' },
      { status: 500 }
    );
  }
}

// 回复评论
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const body = await request.json();
    const { reviewId, replyContent } = body;
    
    if (isNaN(productId) || !reviewId || !replyContent) {
      return NextResponse.json(
        { success: false, message: '参数不完整' },
        { status: 400 }
      );
    }

    const updatedReview = await db
      .update(productReviews)
      .set({
        replyContent,
        replyTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(and(
        eq(productReviews.id, reviewId),
        eq(productReviews.productId, productId)
      ))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { success: false, message: '评论不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedReview[0] });
  } catch (error) {
    console.error('回复评论失败:', error);
    return NextResponse.json(
      { success: false, message: '回复评论失败' },
      { status: 500 }
    );
  }
}

// 更新评论状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const body = await request.json();
    const { reviewId, status } = body;
    
    if (isNaN(productId) || !reviewId || status === undefined) {
      return NextResponse.json(
        { success: false, message: '参数不完整' },
        { status: 400 }
      );
    }

    const updatedReview = await db
      .update(productReviews)
      .set({
        status,
        updatedAt: new Date().toISOString()
      })
      .where(and(
        eq(productReviews.id, reviewId),
        eq(productReviews.productId, productId)
      ))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json(
        { success: false, message: '评论不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedReview[0] });
  } catch (error) {
    console.error('更新评论状态失败:', error);
    return NextResponse.json(
      { success: false, message: '更新评论状态失败' },
      { status: 500 }
    );
  }
}

// 删除评论
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');
    
    if (isNaN(productId) || !reviewId) {
      return NextResponse.json(
        { success: false, message: '商品ID或评论ID无效' },
        { status: 400 }
      );
    }

    const deletedReview = await db
      .delete(productReviews)
      .where(and(
        eq(productReviews.id, parseInt(reviewId)),
        eq(productReviews.productId, productId)
      ))
      .returning();

    if (deletedReview.length === 0) {
      return NextResponse.json(
        { success: false, message: '评论不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json(
      { success: false, message: '删除评论失败' },
      { status: 500 }
    );
  }
}