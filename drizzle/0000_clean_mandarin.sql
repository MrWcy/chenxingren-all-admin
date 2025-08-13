-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openid" varchar(100) NOT NULL,
	"unionid" varchar(100),
	"nickname" varchar(100),
	"avatar_url" text,
	"gender" integer DEFAULT 0,
	"phone" varchar(20),
	"email" varchar(100),
	"birthday" date,
	"status" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_openid_key" UNIQUE("openid")
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"province" varchar(50) NOT NULL,
	"city" varchar(50) NOT NULL,
	"district" varchar(50) NOT NULL,
	"detail_address" text NOT NULL,
	"postal_code" varchar(10),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "product_skus" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku_code" varchar(100) NOT NULL,
	"sku_name" varchar(200),
	"spec_values" jsonb,
	"image_url" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"cost_price" numeric(10, 2),
	"stock" integer DEFAULT 0,
	"weight" numeric(8, 2),
	"status" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "product_skus_sku_code_key" UNIQUE("sku_code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"brand" varchar(100),
	"description" text,
	"main_image" text,
	"detail_images" text[],
	"spec_info" jsonb,
	"base_price" numeric(10, 2) NOT NULL,
	"status" integer DEFAULT 1,
	"sort_order" integer DEFAULT 0,
	"sales_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"spec_config" jsonb
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_no" varchar(32) NOT NULL,
	"user_id" integer NOT NULL,
	"status" integer DEFAULT 1 NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"shipping_fee" numeric(10, 2) DEFAULT '0',
	"actual_amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(20),
	"payment_time" timestamp,
	"shipping_time" timestamp,
	"receive_time" timestamp,
	"cancel_time" timestamp,
	"cancel_reason" text,
	"remark" text,
	"receiver_name" varchar(50) NOT NULL,
	"receiver_phone" varchar(20) NOT NULL,
	"receiver_province" varchar(50) NOT NULL,
	"receiver_city" varchar(50) NOT NULL,
	"receiver_district" varchar(50) NOT NULL,
	"receiver_address" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "orders_order_no_key" UNIQUE("order_no")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"sku_id" integer NOT NULL,
	"product_name" varchar(200) NOT NULL,
	"sku_name" varchar(200),
	"sku_image" text,
	"spec_values" jsonb,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"sku_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"content" text,
	"images" text[],
	"reply_content" text,
	"reply_time" timestamp,
	"status" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "product_reviews_rating_check" CHECK ((rating >= 1) AND (rating <= 5))
);
--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_skus" ADD CONSTRAINT "product_skus_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_openid" ON "users" USING btree ("openid" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_addresses_default" ON "user_addresses" USING btree ("user_id" int4_ops,"is_default" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_addresses_user" ON "user_addresses" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_product_skus_code" ON "product_skus" USING btree ("sku_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_product_skus_product" ON "product_skus" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_product_skus_product_spec" ON "product_skus" USING btree ("product_id" int4_ops,"spec_values" int4_ops) WHERE (status = 1);--> statement-breakpoint
CREATE INDEX "idx_product_skus_spec_values" ON "product_skus" USING gin ("spec_values" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_product_skus_status" ON "product_skus" USING btree ("status" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_products_created" ON "products" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_products_sales" ON "products" USING btree ("sales_count" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_products_spec_config" ON "products" USING gin ("spec_config" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_products_spec_info" ON "products" USING gin ("spec_info" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_created" ON "orders" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_no" ON "orders" USING btree ("order_no" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_user" ON "orders" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("order_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_order_items_sku" ON "order_items" USING btree ("sku_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_product_reviews_product" ON "product_reviews" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_product_reviews_status" ON "product_reviews" USING btree ("status" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_product_reviews_user" ON "product_reviews" USING btree ("user_id" int4_ops);
*/