# Drizzle ORM 集成说明

## 已完成的配置

### 1. 安装的依赖
- `drizzle-orm`: Drizzle ORM 核心库
- `drizzle-kit`: Drizzle 工具包，用于数据库迁移和schema管理
- `postgres`: PostgreSQL 客户端
- `@types/pg`: PostgreSQL 类型定义

### 2. 配置文件
- `.env.local`: 数据库连接配置
- `drizzle.config.ts`: Drizzle 配置文件
- `lib/db/index.ts`: 数据库连接实例
- `lib/db/schema.ts`: 数据库表结构定义（唯一schema源）
- `lib/db/relations.ts`: 表关系定义

### 3. 数据库表结构
已从 PostgreSQL 数据库同步了以下表：
- `users`: 用户表
- `user_addresses`: 用户地址表
- `products`: 商品表
- `product_skus`: 商品SKU表
- `orders`: 订单表
- `order_items`: 订单项表
- `product_reviews`: 商品评价表

### 4. 可用的脚本命令
```bash
# 从数据库同步schema到本地
npm run db:pull

# 推送本地schema变更到数据库
npm run db:push

# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 启动Drizzle Studio（数据库管理界面）
npm run db:studio
```

## 使用示例

### 基本查询
```typescript
import { db, users, products } from '@/lib/db';

// 查询所有用户
const allUsers = await db.select().from(users);

// 查询特定用户
const user = await db.select().from(users).where(eq(users.id, 1));

// 查询用户及其地址（关联查询）
const userWithAddresses = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    userAddresses: true
  }
});
```

### 插入数据
```typescript
// 插入新用户
const newUser = await db.insert(users).values({
  openid: 'wx123456',
  nickname: '测试用户',
  status: 1
}).returning();
```

### 更新数据
```typescript
// 更新用户信息
const updatedUser = await db.update(users)
  .set({ nickname: '新昵称' })
  .where(eq(users.id, 1))
  .returning();
```

### 删除数据
```typescript
// 删除用户
const deletedUser = await db.delete(users)
  .where(eq(users.id, 1))
  .returning();
```

## 测试数据库连接

访问 `/api/test-db` 端点来测试数据库连接是否正常。

## 配置优化

为了避免重复的schema文件，已删除 `drizzle/` 目录下的 `schema.ts` 和 `relations.ts` 文件。现在只使用 `lib/db/` 目录下的文件作为唯一的schema源，Drizzle Kit会根据配置自动处理迁移文件的生成。

## 注意事项

1. 确保 `.env.local` 文件中的 `DATABASE_URL` 配置正确
2. 如果数据库结构发生变化，运行 `npm run db:pull` 重新同步
3. 使用 `npm run db:studio` 可以启动可视化数据库管理界面
4. 所有的表结构和关系都已经定义好，可以直接使用关联查询