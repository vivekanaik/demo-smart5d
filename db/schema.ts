import { pgTable, serial, varchar, timestamp, integer, text, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const orders = pgTable("orders", {
    id: varchar("id", { length: 50 }).primaryKey(),
    guestName: varchar("guest_name", { length: 100 }).notNull(),
    tableNumber: varchar("table_number", { length: 10 }).notNull(),
    contactNumber: varchar("contact_number", { length: 20 }),
    generalNote: text("general_note"),
    total: integer("total").notNull(),
    status: varchar("status", { enum: ["active", "completed", "cancelled"] }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    closedAt: timestamp("closed_at"),
});

export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: varchar("order_id", { length: 50 }).references(() => orders.id).notNull(),
    menuItemId: integer("menu_item_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    quantity: integer("quantity").notNull(),
    price: integer("price").notNull(),
    note: text("note"),
    status: varchar("status", { enum: ["pending", "served"] }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(), 
});

export const ordersRelations = relations(orders, ({ many }) => ({
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
    }),
}));

export const menuItems = pgTable("menu_items", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),
    price: varchar("price", { length: 20 }).notNull(), // e.g., "₹480"
    category: varchar("category", { length: 50 }).notNull(),
    diet: varchar("diet", { enum: ["Veg", "Non-Veg"] }).notNull(),
    ingredients: jsonb("ingredients").notNull(), // Array of strings stored as JSON
    nutrition: jsonb("nutrition"), // Object stored as JSON { calories, protein, carbs, fat }
    modelUrl: text("model_url").notNull(), // 3D model link
    posterUrl: text("poster_url").default("/5d.png"),
    isAvailable: integer("is_available").default(1), // 1 = true, 0 = false
});
  
  // ✅ NEW: Settings Table (Single Row)
export const settings = pgTable("settings", {
    id: integer("id").primaryKey().default(1), // Always 1
    gstRate: integer("gst_rate").default(5).notNull(), // 0, 5, or 18
    adminPassword: varchar("admin_password", { length: 255 }).default("admin123").notNull(), 
});