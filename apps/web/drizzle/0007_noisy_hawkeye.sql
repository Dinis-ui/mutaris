CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" text,
	"position" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_price_non_negative" CHECK ("order_items"."unit_price_cents" >= 0)
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_phone" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_line1" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_line2" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_postal_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_city" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_country" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");