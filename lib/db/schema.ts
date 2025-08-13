import { pgTable, index, unique, serial, varchar, text, integer, date, timestamp, foreignKey, boolean, jsonb, numeric, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	openid: varchar({ length: 100 }).notNull(),
	unionid: varchar({ length: 100 }),
	nickname: varchar({ length: 100 }),
	avatarUrl: text("avatar_url"),
	gender: integer().default(0),
	phone: varchar({ length: 20 }),
	email: varchar({ length: 100 }),
	birthday: date(),
	status: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_users_openid").using("btree", table.openid.asc().nullsLast().op("text_ops")),
	index("idx_users_status").using("btree", table.status.asc().nullsLast().op("int4_ops")),
	unique("users_openid_key").on(table.openid),
]);

export const userAddresses = pgTable("user_addresses", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: varchar({ length: 50 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	province: varchar({ length: 50 }).notNull(),
	city: varchar({ length: 50 }).notNull(),
	district: varchar({ length: 50 }).notNull(),
	detailAddress: text("detail_address").notNull(),
	postalCode: varchar("postal_code", { length: 10 }),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_user_addresses_default").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.isDefault.asc().nullsLast().op("int4_ops")),
	index("idx_user_addresses_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_addresses_user_id_fkey"
		}).onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	brand: varchar({ length: 100 }),
	description: text(),
	mainImage: text("main_image"),
	detailImages: text("detail_images").array(),
	specInfo: jsonb("spec_info"),
	basePrice: numeric("base_price", { precision: 10, scale:  2 }).notNull(),
	status: integer().default(1),
	sortOrder: integer("sort_order").default(0),
	salesCount: integer("sales_count").default(0),
	viewCount: integer("view_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	specConfig: jsonb("spec_config"),
}, (table) => [
	index("idx_products_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_products_sales").using("btree", table.salesCount.asc().nullsLast().op("int4_ops")),
	index("idx_products_spec_config").using("gin", table.specConfig.asc().nullsLast().op("jsonb_ops")),
	index("idx_products_spec_info").using("gin", table.specInfo.asc().nullsLast().op("jsonb_ops")),
	index("idx_products_status").using("btree", table.status.asc().nullsLast().op("int4_ops")),
]);

export const productSkus = pgTable("product_skus", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	skuCode: varchar("sku_code", { length: 100 }).notNull(),
	skuName: varchar("sku_name", { length: 200 }),
	specValues: jsonb("spec_values"),
	imageUrl: text("image_url"),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	costPrice: numeric("cost_price", { precision: 10, scale:  2 }),
	stock: integer().default(0),
	weight: numeric({ precision: 8, scale:  2 }),
	status: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_product_skus_code").using("btree", table.skuCode.asc().nullsLast().op("text_ops")),
	index("idx_product_skus_product").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("idx_product_skus_product_spec").using("btree", table.productId.asc().nullsLast().op("int4_ops"), table.specValues.asc().nullsLast().op("int4_ops")).where(sql`(status = 1)`),
	index("idx_product_skus_spec_values").using("gin", table.specValues.asc().nullsLast().op("jsonb_ops")),
	index("idx_product_skus_status").using("btree", table.status.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_skus_product_id_fkey"
		}).onDelete("cascade"),
	unique("product_skus_sku_code_key").on(table.skuCode),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	orderNo: varchar("order_no", { length: 32 }).notNull(),
	userId: integer("user_id").notNull(),
	status: integer().default(1).notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }).default('0'),
	shippingFee: numeric("shipping_fee", { precision: 10, scale:  2 }).default('0'),
	actualAmount: numeric("actual_amount", { precision: 10, scale:  2 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 20 }),
	paymentTime: timestamp("payment_time", { mode: 'string' }),
	shippingTime: timestamp("shipping_time", { mode: 'string' }),
	receiveTime: timestamp("receive_time", { mode: 'string' }),
	cancelTime: timestamp("cancel_time", { mode: 'string' }),
	cancelReason: text("cancel_reason"),
	remark: text(),
	receiverName: varchar("receiver_name", { length: 50 }).notNull(),
	receiverPhone: varchar("receiver_phone", { length: 20 }).notNull(),
	receiverProvince: varchar("receiver_province", { length: 50 }).notNull(),
	receiverCity: varchar("receiver_city", { length: 50 }).notNull(),
	receiverDistrict: varchar("receiver_district", { length: 50 }).notNull(),
	receiverAddress: text("receiver_address").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_orders_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_orders_no").using("btree", table.orderNo.asc().nullsLast().op("text_ops")),
	index("idx_orders_status").using("btree", table.status.asc().nullsLast().op("int4_ops")),
	index("idx_orders_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_fkey"
		}),
	unique("orders_order_no_key").on(table.orderNo),
]);

export const orderItems = pgTable("order_items", {
	id: serial().primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	skuId: integer("sku_id").notNull(),
	productName: varchar("product_name", { length: 200 }).notNull(),
	skuName: varchar("sku_name", { length: 200 }),
	skuImage: text("sku_image"),
	specValues: jsonb("spec_values"),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	quantity: integer().notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_order_items_order").using("btree", table.orderId.asc().nullsLast().op("int4_ops")),
	index("idx_order_items_sku").using("btree", table.skuId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.skuId],
			foreignColumns: [productSkus.id],
			name: "order_items_sku_id_fkey"
		}),
]);

export const productReviews = pgTable("product_reviews", {
	id: serial().primaryKey().notNull(),
	orderItemId: integer("order_item_id").notNull(),
	userId: integer("user_id").notNull(),
	productId: integer("product_id").notNull(),
	skuId: integer("sku_id").notNull(),
	rating: integer().notNull(),
	content: text(),
	images: text().array(),
	replyContent: text("reply_content"),
	replyTime: timestamp("reply_time", { mode: 'string' }),
	status: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_product_reviews_product").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("idx_product_reviews_status").using("btree", table.status.asc().nullsLast().op("int4_ops")),
	index("idx_product_reviews_user").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.orderItemId],
			foreignColumns: [orderItems.id],
			name: "product_reviews_order_item_id_fkey"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_reviews_product_id_fkey"
		}),
	foreignKey({
			columns: [table.skuId],
			foreignColumns: [productSkus.id],
			name: "product_reviews_sku_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "product_reviews_user_id_fkey"
		}),
	check("product_reviews_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);