CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"price" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"diet" varchar NOT NULL,
	"ingredients" jsonb NOT NULL,
	"nutrition" jsonb,
	"model_url" text NOT NULL,
	"poster_url" text DEFAULT '/5d.png',
	"is_available" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(50) NOT NULL,
	"menu_item_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL,
	"note" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"guest_name" varchar(100) NOT NULL,
	"table_number" varchar(10) NOT NULL,
	"contact_number" varchar(20),
	"general_note" text,
	"total" integer NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_number" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"gst_rate" integer DEFAULT 5 NOT NULL,
	"admin_password" varchar(255) DEFAULT 'admin123' NOT NULL,
	"upi_id" varchar(100),
	"qr_code_url" text
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;