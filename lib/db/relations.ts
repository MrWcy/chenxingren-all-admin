import { relations } from "drizzle-orm/relations";
import { users, userAddresses, products, productSkus, orders, orderItems, productReviews } from "./schema";

export const userAddressesRelations = relations(userAddresses, ({one}) => ({
	user: one(users, {
		fields: [userAddresses.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userAddresses: many(userAddresses),
	orders: many(orders),
	productReviews: many(productReviews),
}));

export const productSkusRelations = relations(productSkus, ({one, many}) => ({
	product: one(products, {
		fields: [productSkus.productId],
		references: [products.id]
	}),
	orderItems: many(orderItems),
	productReviews: many(productReviews),
}));

export const productsRelations = relations(products, ({many}) => ({
	productSkuses: many(productSkus),
	productReviews: many(productReviews),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({one, many}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	productSkus: one(productSkus, {
		fields: [orderItems.skuId],
		references: [productSkus.id]
	}),
	productReviews: many(productReviews),
}));

export const productReviewsRelations = relations(productReviews, ({one}) => ({
	orderItem: one(orderItems, {
		fields: [productReviews.orderItemId],
		references: [orderItems.id]
	}),
	product: one(products, {
		fields: [productReviews.productId],
		references: [products.id]
	}),
	productSkus: one(productSkus, {
		fields: [productReviews.skuId],
		references: [productSkus.id]
	}),
	user: one(users, {
		fields: [productReviews.userId],
		references: [users.id]
	}),
}));